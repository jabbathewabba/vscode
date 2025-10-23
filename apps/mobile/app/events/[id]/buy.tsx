import React from 'react';
import { View, Text, Button } from 'react-native';

export default function BuyScreen({ params }) {
  const { id } = params;
  async function buy() {
    // call /tickets/order with items
  }
  return (
    <View style={{padding:16}}>
      <Text>Buy tickets for {id}</Text>
      <Button title="Buy (demo)" onPress={buy} />
    </View>
  );
}
