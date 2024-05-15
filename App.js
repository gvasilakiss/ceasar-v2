import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';

// Create a stack navigator
const Stack = createStackNavigator();

export default function App() {
  return (
    // Wrap the app with NavigationContainer
    <NavigationContainer>
      {/* Define the stack navigator */}
      <Stack.Navigator>
        {/* Define the screens in the stack */}
        {/* Login screen */}
        <Stack.Screen name="Login" component={LoginScreen} />
        {/* Register screen */}
        <Stack.Screen name="Register" component={RegisterScreen} />
        {/* Home screen */}
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
