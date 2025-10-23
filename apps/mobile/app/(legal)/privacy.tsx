import React from 'react';
import { ScrollView, Text } from 'react-native';
import { Link } from 'expo-router';

export default function Privacy() {
  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>Privacy Notice (Mock - Dev)</Text>
      <Text style={{ marginBottom: 8 }}>
        This application stores and processes a small set of personal data locally for demo purposes: user profile (name, email), orders and tickets. Data is kept until you choose to wipe it or run a local reset. No third-party trackers are included in the demo environment.
      </Text>
      <Text style={{ marginTop: 12, fontWeight: '600' }}>Data portability</Text>
      <Text>You can download your data from the app profile screen via "Export my data" (dev).</Text>
      <Link href="/" style={{ marginTop: 20 }}>Back</Link>
    </ScrollView>
  );
}
