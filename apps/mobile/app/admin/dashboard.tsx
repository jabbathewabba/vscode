import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';

export default function AdminDashboard() {
  const [overview, setOverview] = useState<any>(null);

  useEffect(()=>{
    fetch('http://localhost:3000/analytics/events/1/overview').then(r=>r.json()).then(setOverview).catch(()=>setOverview(null));
  },[]);

  return (
    <View style={{flex:1,padding:12}}>
      <Text style={{fontSize:18,fontWeight:'600'}}>Admin Dashboard</Text>
      {overview ? (
        <View>
          <Text>Total Gross: {overview.totalGross}</Text>
          <Text>Total Net: {overview.net}</Text>
          <Text>Views: {overview.views} | ATC: {overview.atc} | Purchases: {overview.purchases}</Text>
        </View>
      ) : <Text>Loading...</Text>}
    </View>
  );
}
