import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, Dialog, Portal, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

function SettingScreen() {
  const { signOut } = useAuth();
  const [dialogVisible, setDialogVisible] = React.useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Setting" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <View style={styles.content}>
        <Button
          mode="contained"
          icon="logout"
          onPress={() => setDialogVisible(true)}
          contentStyle={styles.buttonContent}
        >
          Logout
        </Button>
      </View>

      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
        >
          <Dialog.Title>Logout</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to log out?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={signOut}>Logout</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  content: {
    flex: 1,
    padding: 12,
  },
  buttonContent: { height: 48 },
});

export default SettingScreen;
