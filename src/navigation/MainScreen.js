import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomNavigation, Icon } from 'react-native-paper';
import CustomerScreen from '../screens/CustomerScreen';
import HomeScreen from '../screens/HomeScreen';
import SettingScreen from '../screens/SettingScreen';
import TransactionScreen from '../screens/TransactionScreen';

const routes = [
  {
    key: 'home',
    title: 'Home',
    focusedIcon: 'home',
    unfocusedIcon: 'home-outline',
  },
  {
    key: 'transaction',
    title: 'Transaction',
    focusedIcon: 'cash-multiple',
    unfocusedIcon: 'cash',
  },
  {
    key: 'customer',
    title: 'Customer',
    focusedIcon: 'account-group',
    unfocusedIcon: 'account-group-outline',
  },
  {
    key: 'setting',
    title: 'Setting',
    focusedIcon: 'cog',
    unfocusedIcon: 'cog-outline',
  },
];

function MainScreen({ navigation }) {
  const [index, setIndex] = React.useState(0);
  const activeRoute = routes[index];

  const renderActiveScreen = () => {
    switch (activeRoute.key) {
      case 'home':
        return <HomeScreen navigation={navigation} />;
      case 'transaction':
        return <TransactionScreen navigation={navigation} />;
      case 'customer':
        return <CustomerScreen navigation={navigation} />;
      case 'setting':
        return <SettingScreen />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screen}>{renderActiveScreen()}</View>

      <BottomNavigation.Bar
        navigationState={{ index, routes }}
        onTabPress={({ route }) => {
          const nextIndex = routes.findIndex(item => item.key === route.key);
          if (nextIndex !== -1) {
            setIndex(nextIndex);
          }
        }}
        renderIcon={({ route, focused, color }) => (
          <Icon
            source={focused ? route.focusedIcon : route.unfocusedIcon}
            size={24}
            color={color}
          />
        )}
        getLabelText={({ route }) => route.title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  screen: { flex: 1 },
});

export default MainScreen;
