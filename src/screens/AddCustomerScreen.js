import * as React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  Appbar,
  Button,
  HelperText,
  Snackbar,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { addCustomer } from '../services/api';

function AddCustomerScreen({ navigation }) {
  const { token } = useAuth();
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const nameInvalid = !name.trim();
  const phoneInvalid = !/^\d{3,15}$/.test(phone.trim());

  const handleAdd = async () => {
    if (nameInvalid || phoneInvalid) {
      setError('Please enter a customer name and a valid phone number.');
      return;
    }

    try {
      setLoading(true);
      await addCustomer(
        {
          name: name.trim(),
          phone: phone.trim(),
        },
        token,
      );
      navigation.goBack();
    } catch (addError) {
      setError(addError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction color="#ffffff" onPress={navigation.goBack} />
        <Appbar.Content title="Add customer" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            label="Customer name *"
            placeholder="Input your customer's name"
            mode="outlined"
            value={name}
            onChangeText={setName}
            autoFocus
          />
          <HelperText type="error" visible={Boolean(name) && nameInvalid}>
            Customer name is required.
          </HelperText>

          <TextInput
            label="Phone *"
            placeholder="Input phone number"
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
            onPress={handleAdd}
            loading={loading}
            disabled={loading}
            contentStyle={styles.buttonContent}
          >
            Add
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={Boolean(error)}
        onDismiss={() => setError('')}
        action={{ label: 'Close', onPress: () => setError('') }}
      >
        {error}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff8f9',
  },
  appbar: { backgroundColor: '#ef5069' },
  appbarTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  keyboardView: { flex: 1 },
  form: { padding: 16 },
  buttonContent: { height: 50 },
});

export default AddCustomerScreen;
