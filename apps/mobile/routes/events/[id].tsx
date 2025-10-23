import React from 'react';
import { View, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function EventDetail() {
  const params = useLocalSearchParams();
  return (
    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
      <Text>Event {params.id}</Text>
    </View>
  );
}
