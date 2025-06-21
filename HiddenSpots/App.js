import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import screens
import MapScreen from './src/screens/MapScreen';
import SpotDetailScreen from './src/screens/SpotDetailScreen';
import AddSpotScreen from './src/screens/AddSpotScreen';
import FeedScreen from './src/screens/FeedScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import HomeScreen from './src/screens/HomeScreen';

// Import components
import CustomTabBar from './src/components/CustomTabBar';
import CustomHeader from './src/components/CustomHeader';

// Import theme and constants
import { theme } from './src/theme/theme';
import { CATEGORIES } from './src/constants/categories';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: 'map-marker'
        }}
      />
      <Tab.Screen 
        name="Feed" 
        component={FeedScreen}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: 'grid'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: 'account'
        }}
      />
    </Tab.Navigator>
  );
}

// Main stack navigator
function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen 
        name="SpotDetail" 
        component={SpotDetailScreen}
        options={{
          headerShown: true,
          header: props => <CustomHeader {...props} title="Spot Details" />
        }}
      />
      <Stack.Screen 
        name="AddSpot" 
        component={AddSpotScreen}
        options={{
          headerShown: true,
          header: props => <CustomHeader {...props} title="Add Hidden Spot" />
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <AppNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
} 