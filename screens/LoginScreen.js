import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import swal from 'sweetalert';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // Check for empty fields
    if (!username.trim() || !password.trim()) {
      swal('Please fill in all fields.', { icon: 'error' });
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/login', { username, password });
      const { token } = response.data;
      console.log('Login token:', token);

      await AsyncStorage.setItem('token', token);
      navigation.navigate('Home');
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.status === 401) {
        swal('Invalid credentials', { icon: 'error' });
      } else {
        swal('An error occurred during login', { icon: 'error' });
      }
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Username"
        onChangeText={setUsername}
        value={username}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
        autoCapitalize="none"
      />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Register" onPress={() => navigation.navigate('Register')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});
