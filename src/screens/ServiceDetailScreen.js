import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Appbar,
  Button,
  Dialog,
  Divider,
  Menu,
  Portal,
  Snackbar,
  Surface,
  Text,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { deleteService, getService } from '../services/api';
import {
  formatCurrency,
  formatDateTime,
  getCreatorName,
} from '../utils/formatters';

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function ServiceDetailScreen({ navigation, route }) {
  const { token } = useAuth();
  const { serviceId, service: initialService } = route.params;
  const [service, setService] = React.useState(initialService || null);
  const [loading, setLoading] = React.useState(!initialService);
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [deleteVisible, setDeleteVisible] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState('');

  const loadDetail = React.useCallback(async () => {
    try {
      setLoading(true);
      setService(await getService(serviceId, token));
    } catch (detailError) {
      setError(detailError.message);
    } finally {
      setLoading(false);
    }
  }, [serviceId, token]);

  useFocusEffect(
    React.useCallback(() => {
      loadDetail();
    }, [loadDetail]),
  );

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteService(serviceId, token);
      setDeleteVisible(false);
      navigation.goBack();
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction color="#ffffff" onPress={navigation.goBack} />
        <Appbar.Content
          title="Service detail"
          titleStyle={styles.appbarTitle}
        />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="dots-vertical"
              color="#ffffff"
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            leadingIcon="pencil"
            title="Edit"
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate('EditService', { serviceId, service });
            }}
          />
          <Menu.Item
            leadingIcon="delete"
            title="Delete"
            onPress={() => {
              setMenuVisible(false);
              setDeleteVisible(true);
            }}
          />
        </Menu>
      </Appbar.Header>

      {loading && !service ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Surface style={styles.card} elevation={1}>
            <DetailRow
              label="Service name"
              value={service?.name || 'Chưa có thông tin'}
            />
            <Divider />
            <DetailRow label="Price" value={formatCurrency(service?.price)} />
            <Divider />
            <DetailRow label="Creator" value={getCreatorName(service)} />
            <Divider />
            <DetailRow
              label="Time"
              value={formatDateTime(service?.createdAt)}
            />
            <Divider />
            <DetailRow
              label="Final update"
              value={formatDateTime(service?.updatedAt)}
            />
          </Surface>
        </ScrollView>
      )}

      <Portal>
        <Dialog
          visible={deleteVisible}
          onDismiss={() => setDeleteVisible(false)}
        >
          <Dialog.Icon icon="alert" />
          <Dialog.Title style={styles.dialogTitle}>Warning</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to remove this service? This operation
              cannot be returned.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteVisible(false)}>CANCEL</Button>
            <Button
              textColor="#d32f2f"
              loading={deleting}
              disabled={deleting}
              onPress={handleDelete}
            >
              DELETE
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 16 },
  card: {
    borderRadius: 12,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  detailRow: { padding: 16 },
  detailLabel: {
    color: '#76565b',
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dialogTitle: { textAlign: 'center' },
});

export default ServiceDetailScreen;
