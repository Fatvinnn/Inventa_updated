import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AdminNavigator } from './src/navigation/AdminNavigator';
import { LoginScreen, RegisterScreen } from './src/screens';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './src/constants/theme';
import { MOCK_USER, MOCK_ADMIN } from './src/data/mockData';
import type { RegisterData } from './src/screens/RegisterScreen';

type Screen = 'login' | 'register' | 'app';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [currentUser, setCurrentUser] = useState<typeof MOCK_USER | typeof MOCK_ADMIN | null>(null);

  const handleLogin = (email: string, password: string) => {
    // Simple role-based login simulation
    // admin@admin.com / user@user.com
    if (email.includes('admin')) {
      setCurrentUser(MOCK_ADMIN);
    } else {
      setCurrentUser(MOCK_USER);
    }
    setCurrentScreen('app');
  };

  const handleRegister = (userData: RegisterData) => {
    // In production, send to API
    console.log('Register data:', userData);
    
    // Create new user with role 'user'
    const newUser = {
      ...MOCK_USER,
      name: userData.name,
      nim: userData.nim,
      email: userData.email,
      phone: userData.phone,
      faculty: userData.faculty,
      program: userData.program,
      role: 'user' as const,
    };
    
    setCurrentUser(newUser);
    
    // Show success message
    Alert.alert(
      'Registrasi Berhasil! 🎉',
      `Selamat datang, ${userData.name}!`,
      [
        {
          text: 'OK',
          onPress: () => setCurrentScreen('app'),
        },
      ]
    );
  };

  const handleLogout = () => {
    setCurrentScreen('login');
    setCurrentUser(null);
  };

  const handleNavigateToRegister = () => {
    setCurrentScreen('register');
  };

  const handleBackToLogin = () => {
    setCurrentScreen('login');
  };

  const renderScreen = () => {
    if (currentScreen === 'register') {
      return (
        <RegisterScreen 
          onRegister={handleRegister}
          onBackToLogin={handleBackToLogin}
        />
      );
    }

    if (currentScreen === 'login') {
      return <LoginScreen onLogin={handleLogin} onNavigateToRegister={handleNavigateToRegister} />;
    }

    // currentScreen === 'app'
    if (!currentUser) {
      return <LoginScreen onLogin={handleLogin} onNavigateToRegister={handleNavigateToRegister} />;
    }

    if (currentUser.role === 'admin') {
      return <AdminNavigator onLogout={handleLogout} />;
    }

    return <AppNavigator onLogout={handleLogout} />;
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
