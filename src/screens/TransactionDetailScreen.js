import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Appbar,
  Divider,
  Snackbar,
  Surface,
  Text,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getTransaction } from '../services/api';
import {
  formatCurrency,
  formatDateTime,
  getCustomerName,
} from '../utils/formatters';

const getServices = transaction =>
  Array.isArray(transaction?.services) ? transaction.services : [];

const getServiceName = service =>
  service?.name || service?.service?.name || 'Unnamed service';

const getServicePrice = service =>
  service?.price ?? service?.service?.price ?? 0;

function InformationRow({ label, value, strong = false }) {
  return (
    <View style={styles.informationRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, strong && styles.strongValue]}>{value}</Text>
    </View>
  );
}

function TransactionDetailScreen({ navigation, route }) {
  const { token } = useAuth();
  const { transactionId, transaction: initialTransaction } = route.params;
  const [transaction, setTransaction] = React.useState(
    initialTransaction || null,
  );
  const [loading, setLoading] = React.useState(!initialTransaction);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const loadTransaction = async () => {
      try {
        setLoading(true);
        setTransaction(await getTransaction(transactionId, token));
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };
    loadTransaction();
  }, [token, transactionId]);

  const services = getServices(transaction);
  const amount =
    transaction?.priceBeforePromotion ??
    transaction?.amount ??
    transaction?.total ??
    0;
  const payment =
    transaction?.price ??
    transaction?.totalPayment ??
    transaction?.payment ??
    amount;
  const discount =
    transaction?.discount === undefined
      ? Number(payment) - Number(amount)
      : Number(transaction.discount);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction color="#ffffff" onPress={navigation.goBack} />
        <Appbar.Content
          title="Transaction detail"
          titleStyle={styles.appbarTitle}
        />
        <Appbar.Action
          icon="dots-vertical"
          color="#ffffff"
          onPress={() => setError('No additional action is required in Lab 6.')}
        />
      </Appbar.Header>

      {loading && !transaction ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Surface style={styles.section} elevation={1}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              General information
            </Text>
            <InformationRow
              label="Transaction code"
              value={
                transaction?.id ||
                transaction?.code ||
                transaction?._id ||
                'No code'
              }
              strong
            />
            <InformationRow
              label="Customer"
              value={getCustomerName(transaction)}
              strong
            />
            <InformationRow
              label="Creation time"
              value={formatDateTime(transaction?.createdAt)}
              strong
            />
          </Surface>

          <Surface style={styles.section} elevation={1}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Services list
            </Text>

            {services.map((service, index) => {
              const quantity = Number(service.quantity) || 1;
              return (
                <View key={service._id || index} style={styles.serviceRow}>
                  <Text style={styles.serviceName}>
                    {getServiceName(service)}
                  </Text>
                  <Text style={styles.quantity}>x{quantity}</Text>
                  <Text style={styles.servicePrice}>
                    {formatCurrency(getServicePrice(service) * quantity)}
                  </Text>
                </View>
              );
            })}

            {services.length === 0 && (
              <Text style={styles.emptyServices}>No service information</Text>
            )}

            <Divider style={styles.divider} />
            <InformationRow
              label="Total"
              value={formatCurrency(amount)}
              strong
            />
          </Surface>

          <Surface style={styles.section} elevation={1}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Cost
            </Text>
            <InformationRow
              label="Amount of money"
              value={formatCurrency(amount)}
              strong
            />
            <InformationRow
              label="Discount"
              value={formatCurrency(discount)}
              strong
            />
            <Divider style={styles.divider} />
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Total payment</Text>
              <Text style={styles.paymentValue}>{formatCurrency(payment)}</Text>
            </View>
          </Surface>
        </ScrollView>
      )}

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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 12 },
  section: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    color: '#ef5069',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  informationRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    flex: 1,
    color: '#76565b',
  },
  value: {
    flex: 1.2,
    textAlign: 'right',
  },
  strongValue: { fontWeight: 'bold' },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceName: { flex: 1 },
  quantity: {
    width: 40,
    color: '#76565b',
    textAlign: 'center',
  },
  servicePrice: {
    width: 105,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  emptyServices: {
    color: '#76565b',
    marginBottom: 10,
  },
  divider: { marginVertical: 8 },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  paymentLabel: {
    flex: 1,
    fontWeight: 'bold',
  },
  paymentValue: {
    color: '#ef5069',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default TransactionDetailScreen;
