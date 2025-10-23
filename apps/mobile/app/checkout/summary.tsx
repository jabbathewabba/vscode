import React from 'react';
import { View, Text, Button } from 'react-native';

export default function CheckoutSummary({ navigation, route }) {
  const { order } = route.params || {};
  return (
    <View style={{padding:16}}>
      <Text>Order Summary</Text>
      <Text>Amount: {order?.amount}</Text>
      <Button title="Pay with MockPay" onPress={() => navigation.navigate('checkout/confirm', { order })} />
    </View>
  );
}
