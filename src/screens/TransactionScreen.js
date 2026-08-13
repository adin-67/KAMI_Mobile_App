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
  TouchableRipple,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getTransactions } from '../services/api';
import {
  formatCurrency,
  formatShortDateTime,
  getCustomerName,
  getTransactionId,
} from '../utils/formatters';

const getServiceName = service =>
  service?.name || service?.service?.name || 'Unnamed service';

function TransactionScreen({ navigation }) {
  const { token } = useAuth();
  const [transactions, setTransactions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const loadTransactions = React.useCallback(
    async (showRefresh = false) => {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        setTransactions(await getTransactions(token));
      } catch (loadError) {
        setMessage(loadError.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useFocusEffect(
    React.useCallback(() => {
      loadTransactions();
    }, [loadTransactions]),
  );

  const openDetail = transaction => {
    const transactionId = getTransactionId(transaction);
    if (!transactionId) {
      setMessage('This transaction does not have an identifier.');
      return;
    }
    navigation.navigate('TransactionDetail', { transactionId, transaction });
  };

  const renderTransaction = ({ item }) => {
    const services = Array.isArray(item.services) ? item.services : [];
    const cancelled = String(item.status).toLowerCase() === 'cancelled';
    const transactionCode = item.id || item.code || item._id || 'No code';

    return (
      <TouchableRipple onPress={() => openDetail(item)}>
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <View style={styles.headingRow}>
              <Text style={styles.code} numberOfLines={1}>
                {transactionCode} - {formatShortDateTime(item.createdAt)}
              </Text>
              {cancelled && <Text style={styles.cancelled}>Cancelled</Text>}
            </View>

            <View style={styles.bodyRow}>
              <View style={styles.services}>
                {services.slice(0, 3).map((service, index) => (
                  <Text key={service._id || index} numberOfLines={1}>
                    - {getServiceName(service)}
                  </Text>
                ))}
                {services.length === 0 && <Text>- No service information</Text>}
              </View>
              <Text style={styles.price}>
                {formatCurrency(item.price ?? item.totalPayment ?? item.total)}
              </Text>
            </View>

            <Text style={styles.customer} numberOfLines={1}>
              Customer: {getCustomerName(item)}
            </Text>
          </Card.Content>
        </Card>
      </TouchableRipple>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Transaction" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      {loading && transactions.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.statusText}>Loading transactions...</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item, index) =>
            String(getTransactionId(item) || index)
          }
          contentContainerStyle={
            transactions.length === 0 ? styles.emptyList : styles.list
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadTransactions(true)}
              colors={['#ef5069']}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Icon
                source="receipt-text-off-outline"
                size={54}
                color="#76565b"
              />
              <Text style={styles.statusText}>No transactions found</Text>
            </View>
          }
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() =>
          setMessage(
            'The assignment does not provide an API to add transactions.',
          )
        }
      />

      <Snackbar
        visible={Boolean(message)}
        onDismiss={() => setMessage('')}
        action={{ label: 'Close', onPress: () => setMessage('') }}
      >
        {message}
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
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  code: {
    flex: 1,
    fontWeight: 'bold',
  },
  cancelled: {
    color: '#d32f2f',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  services: { flex: 1 },
  price: {
    color: '#ef5069',
    fontWeight: 'bold',
    marginLeft: 12,
  },
  customer: {
    color: '#76565b',
    marginTop: 6,
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

export default TransactionScreen;
