import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function onLogin() {
    try {
      const res = await fetch(process.env.API_URL + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      await SecureStore.setItemAsync('accessToken', json.accessToken);
      await SecureStore.setItemAsync('refreshToken', json.refreshToken);
      // navigate to app
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <View style={{padding:20}}>
      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" />
      <Text>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Login" onPress={onLogin} />
      <Button title="Register" onPress={() => navigation.navigate('register')} />
    </View>
  );
}
