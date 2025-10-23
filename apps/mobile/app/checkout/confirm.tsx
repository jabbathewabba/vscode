import React, { useState } from 'react';
import { View, Text, Button, Switch } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function CheckoutConfirm({ route, navigation }) {
  const { order } = route.params || {};
  const [forceSuccess, setForceSuccess] = useState(true);

  async function pay() {
    const token = await SecureStore.getItemAsync('accessToken');
    await fetch(process.env.API_URL + '/mockpay/pay', { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ orderId: order.id, force: forceSuccess ? 'success' : 'fail' }) });
    navigation.navigate('tabs');
  }

  return (
    <View style={{padding:16}}>
      <Text>Confirm payment for {order?.amount}</Text>
      <View style={{flexDirection:'row',alignItems:'center'}}>
        <Text>Force success</Text>
        <Switch value={forceSuccess} onValueChange={setForceSuccess} />
      </View>
      <Button title="Pay (MockPay)" onPress={pay} />
    </View>
  );
}
