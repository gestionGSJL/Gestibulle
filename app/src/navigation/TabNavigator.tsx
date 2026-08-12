import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { House, Calendar, SquareCheck, UtensilsCrossed, ShoppingBasket } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { HomeScreen } from '../screens/HomeScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { MealsScreen } from '../screens/MealsScreen';
import { GroceryScreen } from '../screens/GroceryScreen';

const Tab = createBottomTabNavigator();

export function TabNavigator() {
  const t = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.accent[600],
        tabBarInactiveTintColor: t.neutral[400],
        tabBarStyle: {
          backgroundColor: t.bg,
          borderTopColor: t.accent2[100],
          borderTopWidth: 1,
          height: 84,
          paddingTop: 8,
          paddingBottom: 26,
        },
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <House size={22} color={color} strokeWidth={2.75} /> }} />
      <Tab.Screen name="Calendrier" component={CalendarScreen} options={{ tabBarIcon: ({ color }) => <Calendar size={22} color={color} strokeWidth={2.75} /> }} />
      <Tab.Screen name="Tâches" component={TasksScreen} options={{ tabBarIcon: ({ color }) => <SquareCheck size={22} color={color} strokeWidth={2.75} /> }} />
      <Tab.Screen name="Repas" component={MealsScreen} options={{ tabBarIcon: ({ color }) => <UtensilsCrossed size={22} color={color} strokeWidth={2.75} /> }} />
      <Tab.Screen name="Épicerie" component={GroceryScreen} options={{ tabBarIcon: ({ color }) => <ShoppingBasket size={22} color={color} strokeWidth={2.75} /> }} />
    </Tab.Navigator>
  );
}
