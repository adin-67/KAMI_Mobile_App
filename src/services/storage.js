import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

export const getAuthToken = () => AsyncStorage.getItem(STORAGE_KEYS.authToken);

export const saveAuthToken = token =>
  AsyncStorage.setItem(STORAGE_KEYS.authToken, token);

export const removeAuthToken = () =>
  AsyncStorage.removeItem(STORAGE_KEYS.authToken);
