import * as React from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { Dropdown } from "react-native-element-dropdown";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Dialog,
  Divider,
  Portal,
  Snackbar,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { addTransaction, getCustomers, getServices } from "../services/api";
import { formatCurrency, getServiceId } from "../utils/formatters";

const getCreatorId = (service) => {
  const creator = service?.createdBy || service?.creator || service?.user;
  return typeof creator === "string" ? creator : creator?._id || creator?.id;
};

function AddTransactionScreen({ navigation }) {
  const { token } = useAuth();
  const [customers, setCustomers] = React.useState([]);
  const [services, setServices] = React.useState([]);
  const [customerId, setCustomerId] = React.useState(null);
  const [selectedServices, setSelectedServices] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [summaryVisible, setSummaryVisible] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [customerData, serviceData] = await Promise.all([
          getCustomers(token),
          getServices(token),
        ]);
        setCustomers(customerData);
        setServices(serviceData);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  const customerOptions = customers.map((customer) => ({
    label: customer.name || customer.phone || "Unknown customer",
    value: customer._id || customer.id,
  }));

  const executorOptions = React.useMemo(() => {
    const ids = [...new Set(services.map(getCreatorId).filter(Boolean))];
    return ids.map((id, index) => ({
      label: `Executor ${index + 1}`,
      value: id,
    }));
  }, [services]);

  const toggleService = (service, checked) => {
    const serviceId = getServiceId(service);

    setSelectedServices((current) => {
      const next = { ...current };
      if (checked) {
        next[serviceId] = {
          service,
          quantity: 1,
          userID: getCreatorId(service) || executorOptions[0]?.value || null,
        };
      } else {
        delete next[serviceId];
      }
      return next;
    });
  };

  const updateSelectedService = (serviceId, changes) => {
    setSelectedServices((current) => ({
      ...current,
      [serviceId]: {
        ...current[serviceId],
        ...changes,
      },
    }));
  };

  const changeQuantity = (serviceId, change) => {
    const currentQuantity = selectedServices[serviceId]?.quantity || 1;
    updateSelectedService(serviceId, {
      quantity: Math.max(1, currentQuantity + change),
    });
  };

  const selectedItems = Object.values(selectedServices);
  const total = selectedItems.reduce(
    (sum, item) => sum + (Number(item.service?.price) || 0) * item.quantity,
    0
  );

  const openSummary = () => {
    if (!customerId) {
      setError("Please select a customer.");
      return;
    }
    if (selectedItems.length === 0) {
      setError("Please select at least one service.");
      return;
    }
    if (selectedItems.some((item) => !item.userID)) {
      setError("Please select an executor for every selected service.");
      return;
    }
    setSummaryVisible(true);
  };

  const handleAdd = async () => {
    const transaction = {
      customerId,
      services: selectedItems.map((item) => ({
        _id: getServiceId(item.service),
        quantity: item.quantity,
        userID: item.userID,
      })),
    };

    try {
      setSaving(true);
      await addTransaction(transaction, token);
      setSummaryVisible(false);
      navigation.goBack();
    } catch (addError) {
      setSummaryVisible(false);
      setError(addError.message);
    } finally {
      setSaving(false);
    }
  };

  const renderService = ({ item }) => {
    const serviceId = getServiceId(item);
    const selected = selectedServices[serviceId];
    const itemPrice = (Number(item.price) || 0) * (selected?.quantity || 1);

    return (
      <View style={styles.serviceItem}>
        <View style={styles.serviceHeading}>
          <BouncyCheckbox
            disableText
            size={25}
            style={styles.checkboxControl}
            isChecked={Boolean(selected)}
            onPress={(checked) => toggleService(item, checked)}
            fillColor="#ffbd78"
            unFillColor="#ffffff"
            innerIconStyle={styles.checkbox}
            iconStyle={styles.checkbox}
          />
          <Text style={styles.serviceName}>
            {item.name || "Unnamed service"}
          </Text>
        </View>

        {selected && (
          <View style={styles.selectedArea}>
            <View style={styles.controlRow}>
              <View style={styles.stepper}>
                <Pressable
                  style={styles.stepButton}
                  onPress={() => changeQuantity(serviceId, -1)}
                >
                  <Text style={styles.stepText}>-</Text>
                </Pressable>
                <View style={styles.quantityBox}>
                  <Text style={styles.quantityText}>{selected.quantity}</Text>
                </View>
                <Pressable
                  style={styles.stepButton}
                  onPress={() => changeQuantity(serviceId, 1)}
                >
                  <Text style={styles.stepText}>+</Text>
                </Pressable>
              </View>

              <Dropdown
                style={styles.executorDropdown}
                placeholderStyle={styles.placeholder}
                selectedTextStyle={styles.selectedText}
                data={executorOptions}
                labelField="label"
                valueField="value"
                placeholder="Executor"
                value={selected.userID}
                onChange={(executor) =>
                  updateSelectedService(serviceId, {
                    userID: executor.value,
                  })
                }
              />
            </View>

            <Text style={styles.priceLabel}>
              Price:{" "}
              <Text style={styles.price}>{formatCurrency(itemPrice)}</Text>
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction color="#ffffff" onPress={navigation.goBack} />
        <Appbar.Content
          title="Add transaction"
          titleStyle={styles.appbarTitle}
        />
      </Appbar.Header>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={services}
          renderItem={renderService}
          keyExtractor={(item, index) => String(getServiceId(item) || index)}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View style={styles.customerArea}>
              <Text style={styles.customerLabel}>Customer *</Text>
              <Dropdown
                style={styles.customerDropdown}
                placeholderStyle={styles.placeholder}
                selectedTextStyle={styles.selectedText}
                data={customerOptions}
                labelField="label"
                valueField="value"
                placeholder="Select customer"
                value={customerId}
                onChange={(customer) => setCustomerId(customer.value)}
              />
            </View>
          }
          ListEmptyComponent={<Text>No services found.</Text>}
          ListFooterComponent={
            <Button
              mode="contained"
              onPress={openSummary}
              style={styles.summaryButton}
              contentStyle={styles.buttonContent}
            >
              See summary: ({formatCurrency(total)})
            </Button>
          }
        />
      )}

      <Portal>
        <Dialog
          visible={summaryVisible}
          onDismiss={() => setSummaryVisible(false)}
        >
          <Dialog.Title>Transaction summary</Dialog.Title>
          <Dialog.Content>
            <Text>{selectedItems.length} selected service(s)</Text>
            <Divider style={styles.summaryDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total payment</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSummaryVisible(false)} disabled={saving}>
              Back
            </Button>
            <Button onPress={handleAdd} loading={saving} disabled={saving}>
              Add
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
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  appbar: { backgroundColor: "#ef5069" },
  appbarTitle: { color: "#ffffff", fontWeight: "bold" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 14, paddingBottom: 24 },
  customerArea: { marginBottom: 10 },
  customerLabel: { fontWeight: "bold", marginBottom: 9 },
  customerDropdown: {
    height: 52,
    borderColor: "#dedede",
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 14,
    backgroundColor: "#ffffff",
    elevation: 2,
  },
  placeholder: { color: "#888888" },
  selectedText: { color: "#30282a" },
  serviceItem: { paddingVertical: 10 },
  serviceHeading: { flexDirection: "row", alignItems: "center" },
  checkbox: { borderColor: "#ffae62", borderWidth: 1.5 },
  checkboxControl: { width: 34, marginRight: 10 },
  serviceName: { flex: 1, color: "#6f6a6b", fontSize: 16 },
  selectedArea: { marginLeft: 46, marginTop: 10 },
  controlRow: { flexDirection: "row", alignItems: "center" },
  stepper: { flexDirection: "row", height: 48 },
  stepButton: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d5d5d5",
  },
  quantityBox: {
    width: 52,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#d5d5d5",
  },
  stepText: { fontSize: 19, color: "#222222" },
  quantityText: { fontSize: 17, color: "#222222" },
  executorDropdown: {
    flex: 1,
    height: 48,
    marginLeft: 14,
    borderBottomWidth: 1,
    borderColor: "#ececec",
    borderRadius: 9,
    paddingHorizontal: 14,
    backgroundColor: "#ffffff",
    elevation: 2,
  },
  priceLabel: { marginTop: 13, fontSize: 16, color: "#222222" },
  price: { color: "#ef5069", fontWeight: "bold" },
  summaryButton: { marginTop: 10, borderRadius: 8 },
  buttonContent: { height: 52 },
  summaryDivider: { marginVertical: 14 },
  totalRow: { flexDirection: "row", alignItems: "center" },
  totalLabel: { flex: 1, fontWeight: "bold" },
  totalValue: { color: "#ef5069", fontSize: 20, fontWeight: "bold" },
});

export default AddTransactionScreen;
