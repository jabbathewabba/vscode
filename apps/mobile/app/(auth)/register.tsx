import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';

export default function Register({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function onRegister() {
    try {
      const res = await fetch(process.env.API_URL + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      // handle
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
      <Button title="Register" onPress={onRegister} />
    </View>
  );
}
