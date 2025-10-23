import React, { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function TicketDetail({ params }) {
  const { id } = params;
  const [ticket, setTicket] = useState(null as any);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await fetch(process.env.API_URL + `/tickets/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setTicket(json);
    })();
  }, []);

  if (!ticket) return <View><Text>Loading...</Text></View>;
  // obfuscate until startAt - 2h
  const showQr = true; // implement logic comparing event.startAt
  return (
    <View style={{padding:16}}>
      <Text>{ticket.serial}</Text>
      {showQr ? <Image source={{ uri: process.env.API_URL + ticket.qrPayloadPath }} style={{ width: 300, height: 300 }} /> : <Text>QR hidden until 2 hours before</Text>}
    </View>
  );
}
