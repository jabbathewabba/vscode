import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('tickets_snapshot.db');

export default function StaffSearch() {
  const [serial, setSerial] = useState('');
  const [result, setResult] = useState<any>(null);

  function query() {
    db.transaction(tx => {
      tx.executeSql(`SELECT * FROM tickets WHERE serial = ?`, [serial], (_, { rows }) => setResult(rows._array[0] || null));
    });
  }

  return (
    <View style={{flex:1,padding:12}}>
      <Text>Search ticket by serial</Text>
      <TextInput value={serial} onChangeText={setSerial} style={{borderWidth:1,padding:8,marginVertical:8}} />
      <Button title="Search" onPress={query} />
      {result && <View style={{marginTop:12}}><Text>Ticket: {result.ticketId}</Text><Text>Status: {result.status}</Text></View>}
    </View>
  );
}
