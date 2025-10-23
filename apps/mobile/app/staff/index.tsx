import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { init } from '../../src/offline/db';

export default function StaffIndex() {
  useEffect(() => { init(); }, []);
  return (
    <View style={{flex:1,padding:12}}>
      <Text style={{fontSize:18,fontWeight:'600'}}>Staff Check-in</Text>
      <Button title="Scan QR" onPress={() => (global as any).navigation && (global as any).navigation.navigate('staff/scan')} />
      <Button title="Search ticket" onPress={() => (global as any).navigation && (global as any).navigation.navigate('staff/search')} />
      <Button title="Sync outbox" onPress={async ()=>{
        const res = await fetch('http://localhost:3000/checkin/sync', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ results: [] }) });
        alert('Sync ok: '+res.status);
      }} />
    </View>
  );
}
