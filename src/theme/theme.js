import { MD3LightTheme } from 'react-native-paper';

export const appTheme = {
  ...MD3LightTheme,
  roundness: 8,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#ef5069',
    onPrimary: '#ffffff',
    primaryContainer: '#ffd9df',
    onPrimaryContainer: '#3f0010',
    secondary: '#76565b',
    background: '#fff8f9',
    surface: '#fff8f9',
    surfaceVariant: '#f5dddd',
  },
};
