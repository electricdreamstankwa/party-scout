import React, { useState } from 'react';
import {
  View, TextInput, Pressable, Text, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { UserLocation } from '@/lib/types';

interface Props {
  location: UserLocation | null;
  onLocationChange: (loc: UserLocation) => void;
}

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

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="City or area..."
          placeholderTextColor="#6B7280"
          returnKeyType="search"
          onSubmitEditing={searchText}
        />
        {loading ? (
          <ActivityIndicator color="#8B5CF6" style={styles.icon} />
        ) : (
          <Pressable onPress={useGPS} style={styles.gpsBtn}>
            <Text style={styles.gpsIcon}>📍</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
  },
  gpsBtn: {
    padding: 8,
  },
  gpsIcon: {
    fontSize: 20,
  },
  icon: {
    marginLeft: 8,
  },
});
