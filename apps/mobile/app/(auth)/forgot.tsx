import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';

export default function Forgot() {
  const [email, setEmail] = useState('');

  async function onForgot() {
    // stub - local only: return OK
    alert('If the email exists, a reset link would be sent (not implemented).');
  }

  return (
    <View style={{padding:20}}>
      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" />
      <Button title="Reset password" onPress={onForgot} />
    </View>
  );
}
