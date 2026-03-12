import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable, StyleSheet,
  SafeAreaView, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { GENRES } from '@/constants/genres';
import { genreColor } from '@/constants/genres';

export default function SubmitEventScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [venueName, setVenueName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [lineup, setLineup] = useState('');
  const [ticketUrl, setTicketUrl] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [type, setType] = useState<'club' | 'festival' | 'open_air' | 'virtual'>('club');
  const [submitting, setSubmitting] = useState(false);

  function toggleGenre(value: string) {
    setSelectedGenres(prev =>
      prev.includes(value) ? prev.filter(g => g !== value) : [...prev, value]
    );
  }

  async function submit() {
    if (!title.trim() || !dateStart.trim() || !city.trim()) {
      Alert.alert('Missing fields', 'Please fill in: Event name, Date, and City.');
      return;
    }

    const dateObj = new Date(dateStart);
    if (isNaN(dateObj.getTime())) {
      Alert.alert('Invalid date', 'Use format: YYYY-MM-DD HH:MM');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('events').insert({
        title: title.trim(),
        description: description.trim() || null,
        date_start: dateObj.toISOString(),
        date_end: dateEnd ? new Date(dateEnd).toISOString() : null,
        venue_name: venueName.trim() || null,
        city: city.trim(),
        country: country.trim() || null,
        lineup: lineup ? lineup.split('\n').map(l => l.trim()).filter(Boolean) : [],
        ticket_url: ticketUrl.trim() || null,
        genres: selectedGenres,
        type,
        source: 'submitted',
        status: 'pending',
      });

      if (error) throw error;

      Alert.alert(
        'Submitted!',
        'Your event has been submitted for review. It will appear once approved.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Could not submit event. Make sure Supabase is configured.');
    } finally {
      setSubmitting(false);
    }
  }

  const EVENT_TYPES = [
    { label: 'Club', value: 'club' },
    { label: 'Festival', value: 'festival' },
    { label: 'Open Air', value: 'open_air' },
    { label: 'Virtual', value: 'virtual' },
  ] as const;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
        <Text style={styles.topTitle}>Submit Event</Text>
        <Pressable onPress={submit} disabled={submitting}>
          {submitting
            ? <ActivityIndicator color="#8B5CF6" />
            : <Text style={styles.submitBtn}>Submit</Text>
          }
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Field label="Event Name *">
          <TextInput style={styles.input} value={title} onChangeText={setTitle}
            placeholder="e.g. Full Moon Gathering" placeholderTextColor="#6B7280" />
        </Field>

        <Field label="Description">
          <TextInput style={[styles.input, styles.multiline]} value={description}
            onChangeText={setDescription} placeholder="Tell people what to expect..."
            placeholderTextColor="#6B7280" multiline numberOfLines={4} />
        </Field>

        <Field label="Start Date & Time *">
          <TextInput style={styles.input} value={dateStart} onChangeText={setDateStart}
            placeholder="2026-06-15 22:00" placeholderTextColor="#6B7280" />
        </Field>

        <Field label="End Date & Time">
          <TextInput style={styles.input} value={dateEnd} onChangeText={setDateEnd}
            placeholder="2026-06-16 06:00 (optional)" placeholderTextColor="#6B7280" />
        </Field>

        <Field label="Venue Name">
          <TextInput style={styles.input} value={venueName} onChangeText={setVenueName}
            placeholder="e.g. The Farm, Club XYZ" placeholderTextColor="#6B7280" />
        </Field>

        <Field label="City *">
          <TextInput style={styles.input} value={city} onChangeText={setCity}
            placeholder="e.g. Cape Town" placeholderTextColor="#6B7280" />
        </Field>

        <Field label="Country">
          <TextInput style={styles.input} value={country} onChangeText={setCountry}
            placeholder="e.g. South Africa" placeholderTextColor="#6B7280" />
        </Field>

        <Field label="Event Type">
          <View style={styles.typeRow}>
            {EVENT_TYPES.map(t => (
              <Pressable
                key={t.value}
                style={[styles.typePill, type === t.value && styles.typePillActive]}
                onPress={() => setType(t.value)}
              >
                <Text style={[styles.typePillText, type === t.value && styles.typePillTextActive]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Field>

        <Field label="Genres">
          <View style={styles.genreGrid}>
            {GENRES.map(g => {
              const active = selectedGenres.includes(g.value);
              return (
                <Pressable
                  key={g.value}
                  style={[styles.genrePill, active && { backgroundColor: g.color + '33', borderColor: g.color }]}
                  onPress={() => toggleGenre(g.value)}
                >
                  <Text style={[styles.genrePillText, active && { color: g.color }]}>
                    {g.emoji} {g.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Field>

        <Field label="Lineup (one artist per line)">
          <TextInput style={[styles.input, styles.multiline]} value={lineup}
            onChangeText={setLineup} placeholder={"Astrix\nInfected Mushroom\nVini Vici"}
            placeholderTextColor="#6B7280" multiline numberOfLines={5} />
        </Field>

        <Field label="Ticket URL">
          <TextInput style={styles.input} value={ticketUrl} onChangeText={setTicketUrl}
            placeholder="https://howler.co.za/..." placeholderTextColor="#6B7280"
            keyboardType="url" autoCapitalize="none" />
        </Field>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d0d1a' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#374151',
  },
  topTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  cancel: { color: '#6B7280', fontSize: 16 },
  submitBtn: { color: '#8B5CF6', fontSize: 16, fontWeight: '700' },
  scroll: { padding: 16 },
  field: { marginBottom: 20 },
  label: { color: '#9CA3AF', fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 },
  input: {
    backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#374151',
    borderRadius: 10, padding: 12, color: '#fff', fontSize: 15,
  },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typePill: {
    borderRadius: 20, borderWidth: 1, borderColor: '#374151',
    paddingHorizontal: 14, paddingVertical: 8,
  },
  typePillActive: { backgroundColor: '#8B5CF633', borderColor: '#8B5CF6' },
  typePillText: { color: '#6B7280', fontSize: 14, fontWeight: '500' },
  typePillTextActive: { color: '#8B5CF6' },
  genreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  genrePill: {
    borderRadius: 20, borderWidth: 1, borderColor: '#374151',
    paddingHorizontal: 12, paddingVertical: 7,
  },
  genrePillText: { color: '#6B7280', fontSize: 13, fontWeight: '500' },
});
