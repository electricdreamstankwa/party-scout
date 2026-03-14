import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView, StyleSheet, Pressable,
  Linking, SafeAreaView, ActivityIndicator, Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Event } from '@/lib/types';
import { genreColor, genreLabel } from '@/constants/genres';

const DEMO: Record<string, Partial<Event>> = {
  '1': {
    id: '1', title: 'Full Moon Gathering',
    description: 'An outdoor psytrance experience under the stars. Come connect with nature and community.',
    date_start: new Date(Date.now() + 3 * 86400000).toISOString(),
    venue_name: 'The Farm', city: 'Cape Town', country: 'South Africa',
    genres: ['psytrance', 'ambient'], type: 'open_air', flyer_url: null,
    lineup: ['Astrix', 'Infected Mushroom', 'Vini Vici'], ticket_url: null,
  },
  '2': {
    id: '2', title: 'Dark Room Techno Night',
    description: 'Deep techno in an intimate industrial venue. Doors open at 22:00.',
    date_start: new Date(Date.now() + 5 * 86400000).toISOString(),
    venue_name: 'Blank Projects', city: 'Cape Town', country: 'South Africa',
    genres: ['techno'], type: 'club', flyer_url: null,
    lineup: ['Dax J', 'Rebekah'], ticket_url: null,
  },
  '3': {
    id: '3', title: 'Sunrise Festival 2026',
    description: '3-day festival with camping and multiple stages in the Tankwa Karoo.',
    date_start: new Date(Date.now() + 14 * 86400000).toISOString(),
    date_end: new Date(Date.now() + 17 * 86400000).toISOString(),
    venue_name: 'Tankwa Karoo', city: 'Calvinia', country: 'South Africa',
    genres: ['psytrance', 'techno', 'festival'], type: 'festival', flyer_url: null,
    lineup: ['Neelix', 'Ace Ventura', 'Pixel'], ticket_url: null,
  },
};

const typeLabel: Record<string, string> = {
  club: 'CLUB NIGHT', festival: 'FESTIVAL', open_air: 'OPEN AIR', virtual: 'VIRTUAL',
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase.from('events').select('*').eq('id', id).single();
        if (data) { setEvent(data as Event); }
        else {
          const demo = DEMO[id];
          if (demo) setEvent(demo as Event);
        }
      } catch {
        const demo = DEMO[id];
        if (demo) setEvent(demo as Event);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#A855F7" size="large" /></View>;
  }

  if (!event) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Event not found.</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back to Radar</Text>
        </Pressable>
      </View>
    );
  }

  const accent = event.genres.length > 0 ? genreColor(event.genres[0]) : '#A855F7';
  const dateObj = new Date(event.date_start);
  const dateLabel = dateObj.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeLabel = dateObj.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  const endDateObj = event.date_end ? new Date(event.date_end) : null;
  const endLabel = endDateObj ? endDateObj.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long' }) : null;

  function openMaps() {
    if (event?.lat && event?.lng) {
      Linking.openURL(`https://maps.google.com/?q=${event.lat},${event.lng}`);
    } else if (event?.city) {
      Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(event.city)}`);
    }
  }

  function openTickets() {
    const url = event?.ticket_affiliate_url ?? event?.ticket_url;
    if (url) Linking.openURL(url);
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Back */}
      {Platform.OS === 'web' ? (
        // @ts-ignore
        <a href="/" onClick={(e: any) => { e.preventDefault(); router.back(); }}
          style={{ display: 'block', padding: '12px 16px', cursor: 'pointer', textDecoration: 'none' }}>
          <Text style={styles.backArrow}>← RAVE RADAR</Text>
        </a>
      ) : (
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backArrow}>← RAVE RADAR</Text>
        </Pressable>
      )}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero flyer */}
        <View style={styles.heroWrap}>
          {event.flyer_url ? (
            <Image source={{ uri: event.flyer_url }} style={styles.hero} resizeMode="cover" />
          ) : (
            <View style={[styles.hero, styles.heroFallback, { backgroundColor: accent + '22' }]}>
              <Text style={styles.heroEmoji}>🎉</Text>
            </View>
          )}
          {/* Accent bar at bottom of hero */}
          <View style={[styles.heroBar, { backgroundColor: accent }]} />

          {/* Type badge over image */}
          <View style={[styles.typeBadge, { backgroundColor: accent }]}>
            <Text style={styles.typeBadgeText}>{typeLabel[event.type] ?? 'EVENT'}</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Genre tags */}
          {event.genres.length > 0 && (
            <View style={styles.genreRow}>
              {event.genres.map(g => (
                <View key={g} style={[styles.genreChip, { borderColor: genreColor(g) + '88', backgroundColor: genreColor(g) + '18' }]}>
                  <Text style={[styles.genreChipText, { color: genreColor(g) }]}>{genreLabel(g).toUpperCase()}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Title */}
          <Text style={styles.title}>{event.title}</Text>

          {/* Date */}
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>📅</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoMain}>{dateLabel}</Text>
              <Text style={styles.infoSub}>
                {timeLabel !== '00:00' ? timeLabel : 'Time TBC'}{endLabel ? ` → ${endLabel}` : ''}
              </Text>
            </View>
          </View>

          {/* Location */}
          {(event.city || event.venue_name) && (
            <Pressable style={styles.infoCard} onPress={openMaps}>
              <Text style={styles.infoIcon}>📍</Text>
              <View style={{ flex: 1 }}>
                {event.venue_name && <Text style={styles.infoMain}>{event.venue_name}</Text>}
                <Text style={[styles.infoSub, { color: accent }]}>
                  {[event.city, event.country].filter(Boolean).join(', ')} · Open Maps →
                </Text>
              </View>
            </Pressable>
          )}

          {/* Lineup */}
          {event.lineup && event.lineup.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>LINEUP</Text>
              <View style={styles.lineupGrid}>
                {event.lineup.map((artist, i) => (
                  <View key={i} style={[styles.lineupChip, { borderColor: accent + '44' }]}>
                    <Text style={styles.lineupChipText}>{artist}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Description */}
          {event.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ABOUT</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          )}

          {/* Ticket button */}
          {(event.ticket_url || event.ticket_affiliate_url) ? (
            <Pressable style={[styles.ticketBtn, { backgroundColor: accent }]} onPress={openTickets}>
              <Text style={styles.ticketBtnText}>🎟  GET TICKETS</Text>
            </Pressable>
          ) : (
            <View style={styles.noTickets}>
              <Text style={styles.noTicketsText}>No ticket link · Check socials for info</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080810' },
  center: { flex: 1, backgroundColor: '#080810', alignItems: 'center', justifyContent: 'center' },
  back: { paddingHorizontal: 16, paddingVertical: 12 },
  backArrow: { color: '#A855F7', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  scroll: { paddingBottom: 50 },
  heroWrap: { position: 'relative' },
  hero: { width: '100%', height: 280 },
  heroFallback: { alignItems: 'center', justifyContent: 'center' },
  heroEmoji: { fontSize: 80 },
  heroBar: { height: 4, width: '100%' },
  typeBadge: {
    position: 'absolute', top: 14, right: 14,
    borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4,
  },
  typeBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  body: { padding: 20 },
  genreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  genreChip: {
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  genreChipText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  title: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: -0.5, marginBottom: 18, lineHeight: 32 },
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: '#111122', borderRadius: 12, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: '#ffffff08',
  },
  infoIcon: { fontSize: 20 },
  infoMain: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 3 },
  infoSub: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  section: { marginTop: 22 },
  sectionTitle: {
    color: '#4B5563', fontSize: 10, fontWeight: '800',
    letterSpacing: 1.5, marginBottom: 12,
  },
  lineupGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  lineupChip: {
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 7,
    backgroundColor: '#111122',
  },
  lineupChipText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  description: { color: '#9CA3AF', fontSize: 14, lineHeight: 22 },
  ticketBtn: {
    marginTop: 28, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
    shadowOpacity: 0.5, shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  ticketBtnText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 1 },
  noTickets: { marginTop: 28, alignItems: 'center', padding: 16, backgroundColor: '#111122', borderRadius: 12 },
  noTicketsText: { color: '#4B5563', fontSize: 13 },
  errorText: { color: '#fff', fontSize: 18, marginBottom: 20 },
  backBtn: {
    backgroundColor: '#A855F7', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10,
  },
  backBtnText: { color: '#fff', fontWeight: '700', letterSpacing: 0.5 },
});
