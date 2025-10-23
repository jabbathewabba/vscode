import React from 'react';
import { View, Text } from 'react-native';
import EventForm from '../../src/components/forms/EventForm';

export default function CreateEventScreen() {
  return (
    <View style={{flex:1}}>
      <Text style={{fontSize:20,padding:16}}>Create Event</Text>
      <EventForm />
    </View>
  );
}
