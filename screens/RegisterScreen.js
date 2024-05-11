import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import swal from 'sweetalert';

export default function RegisterScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = async () => {
        // Check for empty fields
        if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
            swal('Please fill in all fields.', { icon: 'error' });
            return;
        }

        // Check if password meets the minimum length requirement
        if (password.length < 6) {
            swal('Password must be at least 6 characters long.', { icon: 'error' });
            return;
        }

        if (password !== confirmPassword) {
            swal('Passwords do not match.', { icon: 'error' });
            return;
        }

        try {
            await axios.post('http://localhost:3000/register', { username, password });
            swal('Registration successful. Please login.', { icon: 'success' })
                .then((value) => {
                    // After the swal promise resolves, navigate to the Login screen
                    navigation.navigate('Login');
                });
        } catch (error) {
            console.error('Registration error:', error);
            if (error.response && error.response.status === 400) {
                swal('Username already exists', { icon: 'error' });
            } else {
                swal('An error occurred during registration', { icon: 'error' });
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
            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                onChangeText={setConfirmPassword}
                value={confirmPassword}
                secureTextEntry
                autoCapitalize="none"
            />
            <Button title="Register" onPress={handleRegister} />
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
