import * as React from 'react';
import {
  getAuthToken,
  removeAuthToken,
  saveAuthToken,
} from '../services/storage';

const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = React.useState(null);
  const [isRestoring, setIsRestoring] = React.useState(true);

  React.useEffect(() => {
    const restoreSession = async () => {
      try {
        setToken(await getAuthToken());
      } finally {
        setIsRestoring(false);
      }
    };
    restoreSession();
  }, []);

  const signIn = async newToken => {
    await saveAuthToken(newToken);
    setToken(newToken);
  };

  const signOut = async () => {
    await removeAuthToken();
    setToken(null);
  };

  const value = React.useMemo(
    () => ({ token, isRestoring, signIn, signOut }),
    [token, isRestoring],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng bên trong AuthProvider.');
  }
  return context;
}
