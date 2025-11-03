import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AdminNavigator } from './src/navigation/AdminNavigator';
import { LoginScreen, RegisterScreen } from './src/screens';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './src/constants/theme';
import { AuthProvider, useAuth } from './src/contexts';

type Screen = 'login' | 'register';

function AppContent() {
  const { user, isLoading, logout } = useAuth();
  const [currentScreen, setCurrentScreen] = React.useState<Screen>('login');

  const handleNavigateToRegister = () => {
    setCurrentScreen('register');
  };

  const handleBackToLogin = () => {
    setCurrentScreen('login');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // User is authenticated
  if (user) {
    if (user.role === 'ADMIN') {
      return <AdminNavigator onLogout={logout} />;
    }
    return <AppNavigator onLogout={logout} />;
  }

  // User not authenticated - show login or register
  if (currentScreen === 'register') {
    return (
      <RegisterScreen 
        onBackToLogin={handleBackToLogin}
      />
    );
  }

  return (
    <LoginScreen 
      onNavigateToRegister={handleNavigateToRegister} 
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <View style={styles.container}>
        <AppContent />
        <StatusBar style="light" />
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
