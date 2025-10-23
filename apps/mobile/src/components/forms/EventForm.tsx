import React, { useEffect } from 'react';
import { View, TextInput, Button, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import debounce from 'lodash.debounce';
import { uploadFile } from '../../lib/api';
import * as SecureStore from 'expo-secure-store';

const schema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().optional(),
  startAt: z.string(),
});

export default function EventForm() {
  const { control, handleSubmit, watch, setValue } = useForm({ resolver: zodResolver(schema) });
  const values = watch();

  const autosave = debounce(async (data) => {
    // save draft to API or local storage
    const token = await SecureStore.getItemAsync('accessToken');
    fetch(process.env.API_URL + '/events', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(data) });
  }, 800);

  useEffect(() => {
    autosave(values);
    return () => autosave.cancel();
  }, [values]);

  async function onUpload(fileUri: string) {
    const token = await SecureStore.getItemAsync('accessToken');
    const res = await uploadFile(process.env.API_URL + '/uploads', fileUri, token);
    if (res?.path) setValue('coverImage', res.path);
  }

  return (
    <View style={{padding:16}}>
      <Controller control={control} name="title" render={({ field }) => <TextInput placeholder="Title" value={field.value} onChangeText={field.onChange} />} />
      <Controller control={control} name="description" render={({ field }) => <TextInput placeholder="Description" value={field.value} onChangeText={field.onChange} />} />
      <Button title="Pick cover" onPress={() => {}} />
    </View>
  );
}
