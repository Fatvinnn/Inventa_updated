import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import {
  AdminDashboardScreen,
  ManageItemsScreen,
  ManageBorrowingsScreen,
  ProfileScreen,
  ItemDetailScreen,
  AddItemScreen,
} from '../screens';
import { RootStackParamList, AdminTabParamList } from '../types';
import { COLORS } from '../constants/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<AdminTabParamList>();

interface AdminNavigatorProps {
  onLogout?: () => void;
}

function AdminTabs({ onLogout }: { onLogout?: () => void }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'ManageItems') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'ManageBorrowings') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'AdminProfile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{ title: 'Dashboard', headerTitle: 'Admin Dashboard' }}
      />
      <Tab.Screen
        name="ManageItems"
        component={ManageItemsScreen}
        options={{ title: 'Barang', headerTitle: 'Kelola Barang' }}
      />
      <Tab.Screen
        name="ManageBorrowings"
        component={ManageBorrowingsScreen}
        options={{ title: 'Peminjaman', headerTitle: 'Kelola Peminjaman' }}
      />
      <Tab.Screen
        name="AdminProfile"
        component={ProfileScreen}
        options={{ title: 'Profil', headerTitle: 'Profil Admin' }}
        initialParams={{ onLogout } as any}
      />
    </Tab.Navigator>
  );
}

export function AdminNavigator({ onLogout }: AdminNavigatorProps) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          options={{ headerShown: false }}
        >
          {() => <AdminTabs onLogout={onLogout} />}
        </Stack.Screen>
        <Stack.Screen
          name="ItemDetail"
          component={ItemDetailScreen}
          options={{ title: 'Detail Barang' }}
        />
        <Stack.Screen
          name="AddItem"
          component={AddItemScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
