import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { Link } from 'expo-router';

export default function Profile() {
  const [loading, setLoading] = useState(false);

  async function doExport() {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/me/export', { credentials: 'include' });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      Alert.alert('Export ready', 'Downloaded export.json (dev)');
    } catch (e) {
      Alert.alert('Error', String(e));
    } finally { setLoading(false); }
  }

  async function doWipe() {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/me/wipe', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      Alert.alert('Wipe', JSON.stringify(data));
    } catch (e) {
      Alert.alert('Error', String(e));
    } finally { setLoading(false); }
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>Profile (Dev)</Text>
      <Button title="Export my data (dev)" onPress={doExport} disabled={loading} />
      <View style={{ height: 12 }} />
      <Button title="Wipe my profile (dev)" onPress={doWipe} color="#a00" disabled={loading} />
      <View style={{ height: 12 }} />
      <Link href="/(legal)/terms">Terms of Service</Link>
      <View style={{ height: 6 }} />
      <Link href="/(legal)/privacy">Privacy Notice</Link>
    </View>
  );
}
