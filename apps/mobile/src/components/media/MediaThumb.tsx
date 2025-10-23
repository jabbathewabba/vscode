import React from 'react';
import { TouchableOpacity, Image } from 'react-native';

export default function MediaThumb({ item, onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={{ flex: 1 }}>
      <Image source={{ uri: `http://localhost:3000/static/${item.path}` }} style={{ width: '100%', height: '100%' }} />
    </TouchableOpacity>
  );
}
