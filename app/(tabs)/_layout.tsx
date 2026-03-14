import React from 'react';
import { Tabs } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0d0d1e',
          borderTopColor: '#A855F722',
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 4,
          height: 62,
        },
        tabBarActiveTintColor: '#A855F7',
        tabBarInactiveTintColor: '#4B5563',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'RADAR',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚡" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'MAP',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🗺️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'SAVED',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔖" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 36, height: 28,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 8,
  },
  iconWrapActive: {
    backgroundColor: '#A855F722',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
});
