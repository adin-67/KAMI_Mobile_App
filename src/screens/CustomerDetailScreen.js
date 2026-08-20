import * as React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Dialog,
  Divider,
  Menu,
  Portal,
  Snackbar,
  Surface,
  Text,
  TouchableRipple,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { deleteCustomer, getCustomer } from "../services/api";
import {
  formatCurrency,
  formatDateTime,
  formatShortDateTime,
  getTransactionId,
} from "../utils/formatters";

function InformationRow({ label, value, important = false }) {
  return (
    <View style={styles.informationRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, important && styles.important]}>{value}</Text>
    </View>
  );
}

function CustomerDetailScreen({ navigation, route }) {
  const { token } = useAuth();
  const { customerId, customer: initialCustomer } = route.params;
  const [customer, setCustomer] = React.useState(initialCustomer || null);
  const [loading, setLoading] = React.useState(!initialCustomer);
  const [deleting, setDeleting] = React.useState(false);
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [dialogVisible, setDialogVisible] = React.useState(false);
  const [error, setError] = React.useState("");

  const loadCustomer = React.useCallback(async () => {
    try {
      setLoading(true);
      setCustomer(await getCustomer(customerId, token));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [customerId, token]);

  useFocusEffect(
    React.useCallback(() => {
      loadCustomer();
    }, [loadCustomer])
  );

  const openEdit = () => {
    setMenuVisible(false);
    navigation.navigate("EditCustomer", { customerId, customer });
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await deleteCustomer(customerId, token);
      setDialogVisible(false);
      navigation.goBack();
    } catch (deleteError) {
      setDialogVisible(false);
      setError(deleteError.message);
    } finally {
      setDeleting(false);
    }
  };

  const transactions = Array.isArray(customer?.transactions)
    ? customer.transactions
    : [];

  const renderTransaction = ({ item }) => {
    const transactionId = getTransactionId(item);

    return (
      <TouchableRipple
        disabled={!transactionId}
        onPress={() =>
          navigation.navigate("TransactionDetail", {
            transactionId,
            transaction: item,
          })
        }
      >
        <Card style={styles.transactionCard} mode="outlined">
          <Card.Content>
            <View style={styles.transactionRow}>
              <Text style={styles.transactionCode} numberOfLines={1}>
                {item.id || item.code || item._id || "No code"}
              </Text>
              <Text style={styles.transactionPrice}>
                {formatCurrency(
                  item.price ?? item.totalPayment ?? item.total ?? item.amount
                )}
              </Text>
            </View>
            <Text style={styles.transactionTime}>
              {formatShortDateTime(item.createdAt)}
            </Text>
          </Card.Content>
        </Card>
      </TouchableRipple>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction color="#ffffff" onPress={navigation.goBack} />
        <Appbar.Content
          title="Customer detail"
          titleStyle={styles.appbarTitle}
        />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="dots-vertical"
              color="#ffffff"
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item leadingIcon="pencil" onPress={openEdit} title="Edit" />
          <Divider />
          <Menu.Item
            leadingIcon="delete"
            onPress={() => {
              setMenuVisible(false);
              setDialogVisible(true);
            }}
            title="Delete"
          />
        </Menu>
      </Appbar.Header>

      {loading && !customer ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item, index) =>
            String(getTransactionId(item) || index)
          }
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            <View>
              <Surface style={styles.section} elevation={1}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  General information
                </Text>
                <InformationRow
                  label="Name"
                  value={customer?.name || "Unknown"}
                  important
                />
                <InformationRow
                  label="Phone"
                  value={customer?.phone || "No phone"}
                  important
                />
                <InformationRow
                  label="Total spent"
                  value={formatCurrency(customer?.totalSpent)}
                  important
                />
                <InformationRow
                  label="Time"
                  value={formatDateTime(customer?.createdAt)}
                />
                <InformationRow
                  label="Last update"
                  value={formatDateTime(customer?.updatedAt)}
                />
              </Surface>
              {transactions.length > 0 && (
                <Text variant="titleMedium" style={styles.historyTitle}>
                  Transaction history
                </Text>
              )}
            </View>
          }
          ListEmptyComponent={
            <Surface style={styles.section} elevation={1}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Transaction history
              </Text>
              <Text style={styles.emptyText}>
                This customer has no transaction.
              </Text>
            </Surface>
          }
        />
      )}

      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
        >
          <Dialog.Icon icon="alert" />
          <Dialog.Title style={styles.dialogTitle}>Warning</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to remove this customer? This operation
              cannot be returned.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              onPress={confirmDelete}
              loading={deleting}
              disabled={deleting}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={Boolean(error)}
        onDismiss={() => setError("")}
        action={{ label: "Close", onPress: () => setError("") }}
      >
        {error}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff8f9" },
  appbar: { backgroundColor: "#ef5069" },
  appbarTitle: { color: "#ffffff", fontWeight: "bold" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 12, paddingBottom: 30 },
  section: { padding: 14, borderRadius: 10, backgroundColor: "#ffffff" },
  sectionTitle: { color: "#ef5069", fontWeight: "bold", marginBottom: 12 },
  informationRow: { flexDirection: "row", marginBottom: 9 },
  label: { flex: 1, color: "#76565b" },
  value: { flex: 1.4, textAlign: "right" },
  important: { fontWeight: "bold" },
  historyTitle: {
    color: "#ef5069",
    fontWeight: "bold",
    marginTop: 18,
    marginBottom: 10,
  },
  transactionCard: { marginBottom: 9, backgroundColor: "#ffffff" },
  transactionRow: { flexDirection: "row", alignItems: "center" },
  transactionCode: { flex: 1, fontWeight: "bold" },
  transactionPrice: { color: "#ef5069", fontWeight: "bold", marginLeft: 10 },
  transactionTime: { color: "#76565b", marginTop: 5 },
  emptyText: { color: "#76565b" },
  dialogTitle: { textAlign: "center" },
});

export default CustomerDetailScreen;
