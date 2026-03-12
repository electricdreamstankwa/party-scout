import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SavedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔖</Text>
      <Text style={styles.title}>Saved Parties</Text>
      <Text style={styles.subtitle}>
        Sign in to save parties and they'll appear here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 12 },
  subtitle: { color: '#6B7280', fontSize: 14, textAlign: 'center' },
});
