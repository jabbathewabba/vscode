import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, TouchableOpacity, Modal, ActivityIndicator, Share } from 'react-native';
import { useRoute } from 'expo-router';

export default function GalleryScreen() {
  const route = useRoute();
  const { slug } = (route.params || {}) as any;
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:3000/media/events/${slug}`)
      .then(r => r.json())
      .then(setItems)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <ActivityIndicator />;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={items}
        numColumns={3}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelected(item)} style={{ flex: 1 / 3, aspectRatio: 1, padding: 2 }}>
            <Image source={{ uri: `http://localhost:3000/static/${item.path}` }} style={{ width: '100%', height: '100%' }} />
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!selected} onRequestClose={() => setSelected(null)}>
        {selected && (
          <View style={{ flex: 1, backgroundColor: '#000' }}>
            <TouchableOpacity onPress={() => setSelected(null)} style={{ position: 'absolute', top: 40, right: 20, zIndex: 10 }}>
              <View style={{ padding: 10, backgroundColor: 'rgba(255,255,255,0.2)' }}><Image source={{ uri: `http://localhost:3000/static/${selected.path}` }} style={{ width: 40, height: 40 }} /></View>
            </TouchableOpacity>
            <Image source={{ uri: `http://localhost:3000/static/${selected.path}` }} style={{ flex: 1, resizeMode: 'contain' }} />
            <TouchableOpacity onPress={() => Share.share({ url: `http://localhost:3000/static/${selected.path}` })} style={{ position: 'absolute', bottom: 40, left: 20 }}>
              <View style={{ padding: 12, backgroundColor: 'rgba(255,255,255,0.2)' }}><Image source={{ uri: `http://localhost:3000/static/${selected.path}` }} style={{ width: 24, height: 24 }} /></View>
            </TouchableOpacity>
          </View>
        )}
      </Modal>
    </View>
  );
}
