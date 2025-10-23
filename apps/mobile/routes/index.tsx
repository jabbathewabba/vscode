import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity } from 'react-native';

function useNotifications() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch('http://localhost:3000/notifications')
      .then(r => r.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, []);
  return items;
}

export default function Home() {
  const notifications = useNotifications();
  const [promos, setPromos] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/promo/weekly').then(r=>r.json()).then(setPromos).catch(()=>setPromos([]));
  }, []);

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>Promo della settimana</Text>
      <FlatList data={promos} keyExtractor={i => i.id} renderItem={({ item }) => (
        <View style={{ padding: 8, borderBottomWidth: 1, borderColor: '#eee' }}>
          <Text style={{ fontWeight: '600' }}>{item.title}</Text>
          <Text>{item.body}</Text>
        </View>
      )} />

      <Text style={{ fontSize: 18, marginTop: 12 }}>Referral</Text>
      <Button title="Genera codice referral" onPress={() => fetch('http://localhost:3000/referrals/generate', { method: 'POST' }).then(r=>r.json()).then(j=>alert(JSON.stringify(j)))} />

      <Text style={{ fontSize: 18, marginTop: 12 }}>Notifiche</Text>
      <FlatList data={notifications} keyExtractor={i => i.id} renderItem={({ item }) => (
        <TouchableOpacity style={{ padding: 8 }}>
          <Text style={{ fontWeight: item.read ? '400' : '700' }}>{item.title}</Text>
          <Text>{item.body}</Text>
        </TouchableOpacity>
      )} />
    </View>
  );
}
