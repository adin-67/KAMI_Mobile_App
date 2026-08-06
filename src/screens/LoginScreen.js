import * as React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  HelperText,
  Icon,
  Snackbar,
  Text,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';

function LoginScreen() {
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [hidePassword, setHidePassword] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!phone.trim() || !password) {
      setError('Vui lòng nhập đầy đủ số điện thoại và mật khẩu.');
      return;
    }

    try {
      setLoading(true);
      const token = await login(phone, password);
      await signIn(token);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Icon source="flower-tulip" size={72} color="#ef5069" />
            <Text variant="headlineLarge" style={styles.brand}>
              KAMI SPA
            </Text>
          </View>

          <Text variant="displaySmall" style={styles.title}>
            Đăng nhập
          </Text>

          <TextInput
            label="Số điện thoại"
            mode="outlined"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoCapitalize="none"
            left={<TextInput.Icon icon="phone" />}
            style={styles.input}
          />
          <HelperText type="info" visible>
            Dùng số điện thoại của tài khoản được cung cấp trong đề.
          </HelperText>

          <TextInput
            label="Mật khẩu"
            mode="outlined"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={hidePassword}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={hidePassword ? 'eye' : 'eye-off'}
                onPress={() => setHidePassword(current => !current)}
              />
            }
            onSubmitEditing={handleLogin}
            style={styles.input}
          />

          <Button
            mode="contained"
            loading={loading}
            disabled={loading}
            onPress={handleLogin}
            contentStyle={styles.buttonContent}
            style={styles.button}
          >
            Đăng nhập
          </Button>
        </ScrollView>
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
  keyboardView: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brand: {
    color: '#ef5069',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  button: {
    marginTop: 20,
    borderRadius: 8,
  },
  buttonContent: { height: 52 },
});

export default LoginScreen;
