import * as React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Appbar,
  Card,
  FAB,
  Icon,
  Snackbar,
  Text,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getCustomers } from '../services/api';
import { formatCurrency } from '../utils/formatters';

function CustomerScreen({ navigation }) {
  const { token } = useAuth();
  const [customers, setCustomers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState('');

  const loadCustomers = React.useCallback(
    async (showRefresh = false) => {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        setCustomers(await getCustomers(token));
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useFocusEffect(
    React.useCallback(() => {
      loadCustomers();
    }, [loadCustomers]),
  );

  const renderCustomer = ({ item }) => {
    const isMember = String(item.loyalty).toLowerCase() === 'member';

    return (
      <Card style={styles.card} mode="outlined">
        <Card.Content style={styles.cardContent}>
          <View style={styles.information}>
            <Text>
              Customer:{' '}
              <Text style={styles.value}>{item.name || 'Unknown'}</Text>
            </Text>
            <Text style={styles.line}>
              Phone:{' '}
              <Text style={styles.value}>{item.phone || 'No phone'}</Text>
            </Text>
            <Text style={styles.line}>
              Total money:{' '}
              <Text style={styles.totalMoney}>
                {formatCurrency(item.totalSpent)}
              </Text>
            </Text>
          </View>

          <View style={styles.loyalty}>
            <Icon
              source={isMember ? 'crown' : 'gift'}
              size={26}
              color="#ef5069"
            />
            <Text style={styles.loyaltyText}>
              {isMember ? 'Member' : 'Guest'}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Customer" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      {loading && customers.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.statusText}>Loading customers...</Text>
        </View>
      ) : (
        <FlatList
          data={customers}
          renderItem={renderCustomer}
          keyExtractor={(item, index) => String(item._id || item.id || index)}
          contentContainerStyle={
            customers.length === 0 ? styles.emptyList : styles.list
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadCustomers(true)}
              colors={['#ef5069']}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Icon source="account-off-outline" size={54} color="#76565b" />
              <Text style={styles.statusText}>No customers found</Text>
            </View>
          }
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddCustomer')}
      />

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
  list: {
    padding: 12,
    paddingBottom: 90,
  },
  emptyList: { flexGrow: 1 },
  card: {
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  information: { flex: 1 },
  line: { marginTop: 6 },
  value: { fontWeight: 'bold' },
  totalMoney: {
    color: '#ef5069',
    fontWeight: 'bold',
  },
  loyalty: {
    width: 72,
    alignItems: 'center',
  },
  loyaltyText: {
    marginTop: 4,
    color: '#ef5069',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: { marginTop: 12 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
});

export default CustomerScreen;
