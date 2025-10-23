import React, { useEffect, useState } from 'react';
import { View, Text, Button, Vibration } from 'react-native';
// Camera imports omitted (expo-camera or vision-camera recommended)
import { markOutbox } from '../../src/offline/db';
import uuid from 'react-native-uuid';

export default function StaffScan() {
  const [message, setMessage] = useState('Ready to scan');

  // Stub scan function - in production integrate Camera and decode QR
  async function onFakeScan(payloadStr: string) {
    // payload expected: { ticketId, nonceTs }
    try {
      const payload = JSON.parse(payloadStr);
      // anti-replay check
      const ts = new Date(payload.nonceTs).getTime();
      const now = Date.now();
      if (Math.abs(now - ts) > 15 * 60 * 1000) {
        setMessage('Nonce outside 15min window — PANIC MODE');
      }
      // mark outbox
      const id = uuid.v4() as string;
      markOutbox(id, payload.ticketId, 'USED', new Date().toISOString(), 'device-1');
      Vibration.vibrate();
      setMessage('Checked in: ' + payload.ticketId);
    } catch (e) {
      setMessage('Invalid QR');
    }
  }

  return (
    <View style={{flex:1,padding:12}}>
      <Text>{message}</Text>
      <Button title="Simula scan valido" onPress={() => onFakeScan(JSON.stringify({ ticketId: 't_test_1', nonceTs: new Date().toISOString() }))} />
      <Button title="Simula scan vecchio" onPress={() => onFakeScan(JSON.stringify({ ticketId: 't_old', nonceTs: new Date(Date.now()-1000*60*60).toISOString() }))} />
    </View>
  );
}
