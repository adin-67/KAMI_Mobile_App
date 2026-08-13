import * as React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Appbar,
  Avatar,
  Button,
  Dialog,
  Divider,
  FAB,
  Icon,
  List,
  Portal,
  Snackbar,
  Surface,
  Text,
  TouchableRipple,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getServices } from '../services/api';
import { formatCurrency, getServiceId } from '../utils/formatters';

function HomeScreen({ navigation }) {
  const { token, signOut } = useAuth();
  const [services, setServices] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [logoutVisible, setLogoutVisible] = React.useState(false);

  const loadServices = React.useCallback(
    async (showRefresh = false) => {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        setServices(await getServices(token));
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useFocusEffect(
    React.useCallback(() => {
      loadServices();
    }, [loadServices]),
  );

  const openDetail = service => {
    const serviceId = getServiceId(service);
    if (!serviceId) {
      setMessage('Dịch vụ này không có mã định danh.');
      return;
    }
    navigation.navigate('ServiceDetail', { serviceId, service });
  };

  const renderService = ({ item }) => (
    <TouchableRipple onPress={() => openDetail(item)}>
      <View style={styles.serviceRow}>
        <List.Icon icon="spa" color="#ef5069" />
        <Text style={styles.serviceName} numberOfLines={2}>
          {item.name || 'Dịch vụ chưa đặt tên'}
        </Text>
        <Text style={styles.servicePrice}>{formatCurrency(item.price)}</Text>
      </View>
    </TouchableRipple>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="HUYỀN TRINH" titleStyle={styles.appbarTitle} />
        <Avatar.Icon
          size={38}
          icon="account"
          style={styles.avatar}
          color="#ef5069"
        />
        <Appbar.Action
          icon="logout"
          color="#ffffff"
          onPress={() => setLogoutVisible(true)}
        />
      </Appbar.Header>

      <View style={styles.content}>
        <View style={styles.brandContainer}>
          <Icon source="flower-tulip" size={64} color="#ef5069" />
          <Text variant="headlineLarge" style={styles.brand}>
            KAMI SPA
          </Text>
        </View>

        <Text variant="titleLarge" style={styles.sectionTitle}>
          Danh sách dịch vụ
        </Text>

        <Surface style={styles.listSurface} elevation={1}>
          <FlatList
            data={services}
            keyExtractor={(item, index) => String(getServiceId(item) || index)}
            renderItem={renderService}
            ItemSeparatorComponent={Divider}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadServices(true)}
                colors={['#ef5069']}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon
                  source={loading ? 'progress-clock' : 'inbox-outline'}
                  size={48}
                  color="#76565b"
                />
                <Text style={styles.emptyText}>
                  {loading ? 'Đang tải dịch vụ...' : 'Chưa có dịch vụ nào.'}
                </Text>
              </View>
            }
          />
        </Surface>

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('AddService')}
        />
      </View>

      <Portal>
        <Dialog
          visible={logoutVisible}
          onDismiss={() => setLogoutVisible(false)}
        >
          <Dialog.Title>Đăng xuất</Dialog.Title>
          <Dialog.Content>
            <Text>Bạn có muốn đăng xuất khỏi ứng dụng không?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutVisible(false)}>Hủy</Button>
            <Button onPress={signOut}>Đăng xuất</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={Boolean(message)}
        onDismiss={() => setMessage('')}
        action={{ label: 'Đóng', onPress: () => setMessage('') }}
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
    textAlign: 'center',
  },
  avatar: { backgroundColor: '#ffffff' },
  content: {
    flex: 1,
    padding: 16,
  },
  brandContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  brand: {
    color: '#ef5069',
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  listSurface: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  serviceRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  serviceName: {
    flex: 1,
    marginRight: 12,
  },
  servicePrice: {
    color: '#ef5069',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: { marginTop: 12 },
  fab: {
    position: 'absolute',
    right: 28,
    bottom: 20,
  },
});

export default HomeScreen;
