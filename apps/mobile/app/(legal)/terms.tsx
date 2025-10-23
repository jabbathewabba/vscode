import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Link } from 'expo-router';

export default function Terms() {
  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>Terms of Service (Mock - Dev)</Text>
      <Text style={{ marginBottom: 8 }}>
        These Terms are a development-only placeholder. Do not treat them as legal advice. They exist for demo purposes to show how a ToS screen would be integrated into the app.
      </Text>
      <Text style={{ marginBottom: 8 }}>
        - Use of this app is for demo only. All transactions and data are fictional.
      </Text>
      <Text style={{ marginTop: 12, fontWeight: '600' }}>Contact</Text>
      <Text>developer@example.invalid</Text>
      <Link href="/" style={{ marginTop: 20 }}>Back</Link>
    </ScrollView>
  );
}
