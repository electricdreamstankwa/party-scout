import React, { useState } from 'react';
import {
  View, TextInput, Pressable, Text, StyleSheet,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import { UserLocation } from '@/lib/types';

interface Props {
  location: UserLocation | null;
  onLocationChange: (loc: UserLocation | null) => void;
}

const QUICK_CITIES: { label: string; lat: number; lng: number }[] = [
  { label: 'Cape Town',  lat: -33.9249, lng: 18.4241 },
  { label: 'Berlin',     lat: 52.5200,  lng: 13.4050 },
  { label: 'Amsterdam',  lat: 52.3676,  lng: 4.9041  },
  { label: 'London',     lat: 51.5074,  lng: -0.1278 },
  { label: 'Johannesburg', lat: -26.2041, lng: 28.0473 },
  { label: 'Barcelona',  lat: 41.3851,  lng: 2.1734  },
  { label: 'Tel Aviv',   lat: 32.0853,  lng: 34.7818 },
];

export function LocationSearch({ location, onLocationChange }: Props) {
  const [text, setText] = useState(location?.label ?? '');
  const [loading, setLoading] = useState(false);

  async function useGPS() {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Allow location access in settings to use GPS.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [geo] = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const label = geo?.city ?? geo?.region ?? 'Your location';
      setText(label);
      onLocationChange({ lat: pos.coords.latitude, lng: pos.coords.longitude, label });
    } catch {
      Alert.alert('Error', 'Could not get your location. Try typing it instead.');
    } finally {
      setLoading(false);
    }
  }

  async function searchText() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const results = await Location.geocodeAsync(text.trim());
      if (results.length === 0) {
        Alert.alert('Not found', `Could not find "${text}". Try a city name.`);
        return;
      }
      onLocationChange({ lat: results[0].latitude, lng: results[0].longitude, label: text.trim() });
    } catch {
      Alert.alert('Error', 'Could not geocode that location.');
    } finally {
      setLoading(false);
    }
  }

  function pickCity(city: typeof QUICK_CITIES[0]) {
    setText(city.label);
    onLocationChange({ lat: city.lat, lng: city.lng, label: city.label });
  }

  function clearLocation() {
    setText('');
    onLocationChange(null);
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Search city..."
          placeholderTextColor="#4B5563"
          returnKeyType="search"
          onSubmitEditing={searchText}
        />
        {text.length > 0 && (
          <Pressable onPress={clearLocation} style={styles.clearBtn}>
            <Text style={styles.clearText}>✕</Text>
          </Pressable>
        )}
        {loading ? (
          <ActivityIndicator color="#A855F7" style={styles.icon} />
        ) : (
          <Pressable onPress={useGPS} style={styles.gpsBtn}>
            <Text style={styles.gpsIcon}>📍</Text>
          </Pressable>
        )}
      </View>

      {/* Quick city chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {QUICK_CITIES.map(city => {
          const active = location?.label === city.label;
          return (
            <Pressable
              key={city.label}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => pickCity(city)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {city.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 4 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111122',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffffff14',
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    paddingVertical: 12,
  },
  clearBtn: { padding: 6 },
  clearText: { color: '#4B5563', fontSize: 14 },
  gpsBtn: { padding: 8 },
  gpsIcon: { fontSize: 18 },
  icon: { marginLeft: 8 },
  chips: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffffff14',
    backgroundColor: '#111122',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: {
    borderColor: '#A855F7',
    backgroundColor: '#A855F722',
  },
  chipText: { color: '#6B7280', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#A855F7' },
});
