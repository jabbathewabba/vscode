import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, PermissionsAndroid, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import useLocalSearch from '../../src/features/search/useLocalSearch';
import { haversineDistance } from '../../src/lib/geo';

export default function MapScreen({ navigation }) {
  const [events, setEvents] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{lat:number,lon:number} | null>(null);
  const [showList, setShowList] = useState(false);
  const { query, setQuery, results } = useLocalSearch(events);

  useEffect(() => {
    (async () => {
      // request location
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          setUserLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude });
        } else {
          // fallback center on dev city
          setUserLocation({ lat: 40.7128, lon: -74.0060 });
        }
      } catch (e) {
        setUserLocation({ lat: 40.7128, lon: -74.0060 });
      }
    })();

    fetchEvents();
  }, []);

  async function fetchEvents() {
    const from = new Date().toISOString();
    const to = new Date(Date.now() + 7*24*3600*1000).toISOString();
    const res = await fetch(process.env.API_URL + `/events?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    const data = await res.json();
    setEvents(data);
  }

  const list = query ? results : events.map(e => ({...e, distance: userLocation ? haversineDistance(userLocation.lat, userLocation.lon, e.venue?.latitude || 0, e.venue?.longitude || 0) : null}));

  return (
    <View style={{flex:1}}>
      <MapView style={{flex:1}} initialRegion={{latitude: userLocation?.lat || 40.7128, longitude: userLocation?.lon || -74.0060, latitudeDelta:0.1, longitudeDelta:0.1}}>
        {events.map(ev => (
          <Marker key={ev.id} coordinate={{ latitude: ev.venue?.latitude || 0, longitude: ev.venue?.longitude || 0 }} title={ev.title} description={ev.venue?.name} />
        ))}
      </MapView>
      <View style={{position:'absolute', top:40, left:10}}>
        <Button title={showList ? 'Apri Mappa' : 'Apri Elenco'} onPress={() => setShowList(!showList)} />
      </View>
      {showList && (
        <View style={{position:'absolute', bottom:0, left:0, right:0, height:300, backgroundColor:'#fff'}}>
          <FlatList data={list} keyExtractor={(i)=>i.id} renderItem={({item}) => (
            <TouchableOpacity onPress={() => navigation.push('events/[id]', { id: item.id })} style={{padding:12,borderBottomWidth:1,borderColor:'#eee'}}>
              <Text style={{fontSize:16}}>{item.title}</Text>
              <Text style={{color:'#666'}}>{item.venue?.name} — {item.distance ? Math.round(item.distance/1000) + ' km' : ''}</Text>
            </TouchableOpacity>
          )} />
        </View>
      )}
    </View>
  );
}
