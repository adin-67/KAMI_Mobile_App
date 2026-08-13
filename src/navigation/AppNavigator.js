import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import MainScreen from './MainScreen';
import AddCustomerScreen from '../screens/AddCustomerScreen';
import AddServiceScreen from '../screens/AddServiceScreen';
import EditServiceScreen from '../screens/EditServiceScreen';
import LoginScreen from '../screens/LoginScreen';
import ServiceDetailScreen from '../screens/ServiceDetailScreen';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { token, isRestoring } = useAuth();

  if (isRestoring) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Đang khôi phục phiên đăng nhập...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <>
            <Stack.Screen name="Home" component={MainScreen} />
            <Stack.Screen name="AddService" component={AddServiceScreen} />
            <Stack.Screen
              name="ServiceDetail"
              component={ServiceDetailScreen}
            />
            <Stack.Screen name="EditService" component={EditServiceScreen} />
            <Stack.Screen name="AddCustomer" component={AddCustomerScreen} />
            <Stack.Screen
              name="TransactionDetail"
              component={TransactionDetailScreen}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: { marginTop: 12 },
});

export default AppNavigator;
