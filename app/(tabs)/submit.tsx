import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, StyleSheet,
  SafeAreaView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { GENRES } from '@/constants/genres';
import { genreColor } from '@/constants/genres';

const EVENT_TYPES = [
  { label: 'Open Air', value: 'open_air' },
  { label: 'Festival', value: 'festival' },
  { label: 'Club Night', value: 'club' },
  { label: 'Virtual', value: 'virtual' },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

export default function SubmitScreen() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [venue, setVenue] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [type, setType] = useState<string>('open_air');
  const [lineup, setLineup] = useState('');
  const [description, setDescription] = useState('');
  const [ticketUrl, setTicketUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function toggleGenre(value: string) {
    setSelectedGenres(prev =>
      prev.includes(value) ? prev.filter(g => g !== value) : [...prev, value]
    );
  }

  function parseDate(s: string): string | null {
    // Accept DD/MM/YYYY or YYYY-MM-DD
    const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) return `${s}T20:00:00`;
    const dmyMatch = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (dmyMatch) {
      const [, d, m, y] = dmyMatch;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T20:00:00`;
    }
    return null;
  }

  async function handleSubmit() {
    if (!title.trim()) { Alert.alert('Required', 'Please enter an event title.'); return; }
    if (!date.trim()) { Alert.alert('Required', 'Please enter a date (DD/MM/YYYY or YYYY-MM-DD).'); return; }
    const parsedDate = parseDate(date.trim());
    if (!parsedDate) { Alert.alert('Invalid date', 'Use format DD/MM/YYYY or YYYY-MM-DD.'); return; }
    if (selectedGenres.length === 0) { Alert.alert('Required', 'Please pick at least one genre.'); return; }

    setSubmitting(true);
    try {
      const lineupArr = lineup.split(',').map(s => s.trim()).filter(Boolean);
      const { error } = await supabase.from('events').insert({
        title: title.trim(),
        date_start: parsedDate,
        city: city.trim() || null,
        country: country.trim() || null,
        venue_name: venue.trim() || null,
        genres: selectedGenres,
        type,
        lineup: lineupArr,
        description: description.trim() || null,
        ticket_url: ticketUrl.trim() || null,
        source: 'submitted',
        status: 'pending',
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to submit. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setTitle(''); setDate(''); setCity(''); setCountry(''); setVenue('');
    setSelectedGenres([]); setType('open_air'); setLineup('');
    setDescription(''); setTicketUrl(''); setSubmitted(false);
  }

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.success}>
          <Text style={styles.successEmoji}>✅</Text>
          <Text style={styles.successTitle}>Event submitted!</Text>
          <Text style={styles.successSub}>
            Your event is pending review and will go live once approved.
          </Text>
          <Pressable style={styles.submitBtn} onPress={reset}>
            <Text style={styles.submitBtnText}>Submit another</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.heading}>➕ ADD EVENT</Text>
          <Text style={styles.subheading}>Events go live after review · Usually within 24 hours</Text>

          <Field label="Event title *">
            <TextInput style={styles.input} value={title} onChangeText={setTitle}
              placeholder="e.g. Full Moon Gathering" placeholderTextColor="#4B5563" />
          </Field>

          <Field label="Date * (DD/MM/YYYY)">
            <TextInput style={styles.input} value={date} onChangeText={setDate}
              placeholder="e.g. 21/06/2026" placeholderTextColor="#4B5563"
              keyboardType="numbers-and-punctuation" />
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="City">
                <TextInput style={styles.input} value={city} onChangeText={setCity}
                  placeholder="Berlin" placeholderTextColor="#4B5563" />
              </Field>
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Field label="Country">
                <TextInput style={styles.input} value={country} onChangeText={setCountry}
                  placeholder="Germany" placeholderTextColor="#4B5563" />
              </Field>
            </View>
          </View>

          <Field label="Venue / location">
            <TextInput style={styles.input} value={venue} onChangeText={setVenue}
              placeholder="Optional venue name" placeholderTextColor="#4B5563" />
          </Field>

          <Field label="Event type *">
            <View style={styles.chips}>
              {EVENT_TYPES.map(t => (
                <Pressable key={t.value}
                  style={[styles.chip, type === t.value && styles.chipActive]}
                  onPress={() => setType(t.value)}>
                  <Text style={[styles.chipText, type === t.value && styles.chipTextActive]}>
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Field>

          <Field label="Genre *">
            <View style={styles.chips}>
              {GENRES.map(g => {
                const active = selectedGenres.includes(g.value);
                return (
                  <Pressable key={g.value}
                    style={[styles.chip, active && { borderColor: genreColor(g.value), backgroundColor: genreColor(g.value) + '22' }]}
                    onPress={() => toggleGenre(g.value)}>
                    <Text style={[styles.chipText, active && { color: genreColor(g.value) }]}>
                      {g.emoji} {g.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Field>

          <Field label="Lineup (comma-separated)">
            <TextInput style={styles.input} value={lineup} onChangeText={setLineup}
              placeholder="Artist 1, Artist 2, Artist 3" placeholderTextColor="#4B5563" />
          </Field>

          <Field label="Description">
            <TextInput style={[styles.input, styles.textarea]} value={description}
              onChangeText={setDescription} multiline numberOfLines={4}
              placeholder="Tell people what this event is about..." placeholderTextColor="#4B5563"
              textAlignVertical="top" />
          </Field>

          <Field label="Ticket URL">
            <TextInput style={styles.input} value={ticketUrl} onChangeText={setTicketUrl}
              placeholder="https://..." placeholderTextColor="#4B5563"
              keyboardType="url" autoCapitalize="none" />
          </Field>

          <Pressable
            style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitBtnText}>Submit Event →</Text>
            }
          </Pressable>

          <Text style={styles.disclaimer}>
            By submitting you confirm this event is real and you have permission to list it.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080810' },
  scroll: { padding: 16, paddingBottom: 48 },
  heading: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: -0.5, marginBottom: 4, marginTop: 8 },
  subheading: { color: '#4B5563', fontSize: 12, marginBottom: 24 },
  field: { marginBottom: 18 },
  label: { color: '#6B7280', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' },
  input: {
    backgroundColor: '#111122', borderRadius: 10, borderWidth: 1,
    borderColor: '#ffffff14', color: '#fff', fontSize: 15,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  textarea: { minHeight: 90, paddingTop: 12 },
  row: { flexDirection: 'row' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 20, borderWidth: 1, borderColor: '#ffffff14',
    backgroundColor: '#111122', paddingHorizontal: 12, paddingVertical: 7,
  },
  chipActive: { borderColor: '#A855F7', backgroundColor: '#A855F722' },
  chipText: { color: '#6B7280', fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#A855F7' },
  submitBtn: {
    backgroundColor: '#A855F7', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 12,
    shadowColor: '#A855F7', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 14,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  disclaimer: { color: '#374151', fontSize: 11, textAlign: 'center', marginTop: 16 },
  success: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  successEmoji: { fontSize: 64, marginBottom: 20 },
  successTitle: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 12 },
  successSub: { color: '#6B7280', fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
});
