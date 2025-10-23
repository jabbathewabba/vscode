import React from 'react';
import { FlatList, View } from 'react-native';
import MediaThumb from './MediaThumb';

export default function MediaGrid({ items, onPress }: any) {
  return (
    <FlatList
      data={items}
      numColumns={3}
      keyExtractor={(i: any) => i.id}
      renderItem={({ item }) => (
        <View style={{ flex: 1 / 3, aspectRatio: 1, padding: 2 }}>
          <MediaThumb item={item} onPress={() => onPress(item)} />
        </View>
      )}
    />
  );
}
