import * as React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  HelperText,
  Snackbar,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { addService } from '../services/api';

function AddServiceScreen({ navigation }) {
  const { token } = useAuth();
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const nameInvalid = !name.trim();
  const priceNumber = Number(price);
  const priceInvalid =
    !price.trim() || !Number.isFinite(priceNumber) || priceNumber <= 0;

  const handleAdd = async () => {
    if (nameInvalid || priceInvalid) {
      setError('Hãy nhập tên dịch vụ và giá lớn hơn 0.');
      return;
    }

    try {
      setLoading(true);
      await addService({ name: name.trim(), price: priceNumber }, token);
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
        <Appbar.Content title="Service" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.form}>
          <TextInput
            label="Service name *"
            mode="outlined"
            value={name}
            onChangeText={setName}
            autoFocus
          />
          <HelperText type="error" visible={Boolean(name) && nameInvalid}>
            Tên dịch vụ không được để trống.
          </HelperText>

          <TextInput
            label="Price *"
            mode="outlined"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
          <HelperText type="error" visible={Boolean(price) && priceInvalid}>
            Giá phải là một số lớn hơn 0.
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
        </View>
      </KeyboardAvoidingView>

      <Snackbar
        visible={Boolean(error)}
        onDismiss={() => setError('')}
        action={{ label: 'Đóng', onPress: () => setError('') }}
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
  form: { padding: 20 },
  buttonContent: { height: 50 },
});

export default AddServiceScreen;
