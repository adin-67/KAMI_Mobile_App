import * as React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  Appbar,
  Button,
  HelperText,
  Snackbar,
  TextInput,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { getCustomer, updateCustomer } from "../services/api";

function EditCustomerScreen({ navigation, route }) {
  const { token } = useAuth();
  const { customerId, customer } = route.params;
  const [name, setName] = React.useState(customer?.name || "");
  const [phone, setPhone] = React.useState(customer?.phone || "");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (customer) {
      return;
    }

    const loadCustomer = async () => {
      try {
        setLoading(true);
        const data = await getCustomer(customerId, token);
        setName(data?.name || "");
        setPhone(data?.phone || "");
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };
    loadCustomer();
  }, [customer, customerId, token]);

  const nameInvalid = !name.trim();
  const phoneInvalid = !/^\d{3,15}$/.test(phone.trim());

  const handleUpdate = async () => {
    if (nameInvalid || phoneInvalid) {
      setError("Please enter a customer name and a valid phone number.");
      return;
    }

    try {
      setLoading(true);
      await updateCustomer(
        customerId,
        { name: name.trim(), phone: phone.trim() },
        token
      );
      navigation.goBack();
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction color="#ffffff" onPress={navigation.goBack} />
        <Appbar.Content title="Edit customer" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            label="Customer name *"
            mode="outlined"
            value={name}
            onChangeText={setName}
          />
          <HelperText type="error" visible={Boolean(name) && nameInvalid}>
            Customer name is required.
          </HelperText>

          <TextInput
            label="Phone *"
            mode="outlined"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <HelperText type="error" visible={Boolean(phone) && phoneInvalid}>
            Phone must contain from 3 to 15 digits.
          </HelperText>

          <Button
            mode="contained"
            onPress={handleUpdate}
            loading={loading}
            disabled={loading}
            contentStyle={styles.buttonContent}
          >
            Update
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>

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
  keyboardView: { flex: 1 },
  form: { padding: 16 },
  buttonContent: { height: 50 },
});

export default EditCustomerScreen;
