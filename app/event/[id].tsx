import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView, StyleSheet, Pressable,
  Linking, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Event } from '@/lib/types';
import { GenreTag } from '@/components/GenreTag';

// Demo events map for offline mode
const DEMO: Record<string, Partial<Event>> = {
  '1': {
    id: '1', title: 'Full Moon Gathering',
    description: 'An outdoor psytrance experience under the stars. Come connect with nature and community.',
    date_start: new Date(Date.now() + 3 * 86400000).toISOString(),
    venue_name: 'The Farm', city: 'Cape Town', country: 'South Africa',
    genres: ['psytrance', 'ambient'], type: 'open_air', flyer_url: null,
    lineup: ['Astrix', 'Infected Mushroom', 'Vini Vici'],
    ticket_url: null,
  },
  '2': {
    id: '2', title: 'Dark Room Techno Night',
    description: 'Deep techno in an intimate industrial venue. Doors open at 22:00.',
    date_start: new Date(Date.now() + 5 * 86400000).toISOString(),
    venue_name: 'Blank Projects', city: 'Cape Town', country: 'South Africa',
    genres: ['techno'], type: 'club', flyer_url: null,
    lineup: ['Dax J', 'Rebekah'],
    ticket_url: null,
  },
  '3': {
    id: '3', title: 'Sunrise Festival 2026',
    description: '3-day festival with camping and multiple stages in the Tankwa Karoo.',
    date_start: new Date(Date.now() + 14 * 86400000).toISOString(),
    date_end: new Date(Date.now() + 17 * 86400000).toISOString(),
    venue_name: 'Tankwa Karoo', city: 'Calvinia', country: 'South Africa',
    genres: ['psytrance', 'techno', 'festival'], type: 'festival', flyer_url: null,
    lineup: ['Neelix', 'Ace Ventura', 'Pixel'],
    ticket_url: null,
  },
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase.from('events').select('*').eq('id', id).single();
        if (data) {
          setEvent(data as Event);
        } else {
          // Fall back to demo
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
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#8B5CF6" size="large" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Event not found.</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const dateObj = new Date(event.date_start);
  const dateLabel = dateObj.toLocaleDateString('en-ZA', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const timeLabel = dateObj.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });

  const endDateObj = event.date_end ? new Date(event.date_end) : null;
  const endLabel = endDateObj
    ? endDateObj.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long' })
    : null;

  const typeLabels: Record<string, string> = {
    club: 'Club Night', festival: 'Festival', open_air: 'Open Air', virtual: 'Virtual',
  };

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
      {/* Back button */}
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backArrow}>← Back</Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Flyer */}
        {event.flyer_url ? (
          <Image source={{ uri: event.flyer_url }} style={styles.flyer} resizeMode="cover" />
        ) : (
          <View style={styles.flyerPlaceholder}>
            <Text style={styles.flyerEmoji}>🎉</Text>
          </View>
        )}

        <View style={styles.body}>
          {/* Type badge */}
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{typeLabels[event.type] ?? event.type}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{event.title}</Text>

          {/* Date */}
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <View>
              <Text style={styles.infoMain}>{dateLabel}</Text>
              <Text style={styles.infoSub}>
                {timeLabel}{endLabel ? ` — ${endLabel}` : ''}
              </Text>
            </View>
          </View>

          {/* Location */}
          {(event.city || event.venue_name) && (
            <Pressable style={styles.infoRow} onPress={openMaps}>
              <Text style={styles.infoIcon}>📍</Text>
              <View>
                {event.venue_name && <Text style={styles.infoMain}>{event.venue_name}</Text>}
                <Text style={[styles.infoSub, { color: '#8B5CF6' }]}>
                  {[event.city, event.country].filter(Boolean).join(', ')} · Open in Maps
                </Text>
              </View>
            </Pressable>
          )}

          {/* Genres */}
          {event.genres.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Genre</Text>
              <View style={styles.genreRow}>
                {event.genres.map(g => <GenreTag key={g} genre={g} />)}
              </View>
            </View>
          )}

          {/* Description */}
          {event.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          )}

          {/* Lineup */}
          {event.lineup && event.lineup.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lineup</Text>
              {event.lineup.map((artist, i) => (
                <View key={i} style={styles.lineupItem}>
                  <Text style={styles.lineupDot}>▸</Text>
                  <Text style={styles.lineupArtist}>{artist}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Ticket button */}
          {(event.ticket_url || event.ticket_affiliate_url) && (
            <Pressable style={styles.ticketBtn} onPress={openTickets}>
              <Text style={styles.ticketBtnText}>Get Tickets</Text>
            </Pressable>
          )}

          {!event.ticket_url && !event.ticket_affiliate_url && (
            <View style={styles.noTickets}>
              <Text style={styles.noTicketsText}>No ticket link available · Check social media</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d0d1a' },
  center: { flex: 1, backgroundColor: '#0d0d1a', alignItems: 'center', justifyContent: 'center' },
  back: { paddingHorizontal: 16, paddingVertical: 12 },
  backArrow: { color: '#8B5CF6', fontSize: 16, fontWeight: '600' },
  scroll: { paddingBottom: 40 },
  flyer: { width: '100%', height: 260 },
  flyerPlaceholder: {
    width: '100%', height: 200,
    backgroundColor: '#2d2d50',
    alignItems: 'center', justifyContent: 'center',
  },
  flyerEmoji: { fontSize: 72 },
  body: { padding: 20 },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#8B5CF633',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  typeBadgeText: { color: '#8B5CF6', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 16, lineHeight: 30 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 12 },
  infoIcon: { fontSize: 20, marginTop: 2 },
  infoMain: { color: '#fff', fontSize: 15, fontWeight: '600' },
  infoSub: { color: '#9CA3AF', fontSize: 13, marginTop: 2 },
  section: { marginTop: 20 },
  sectionTitle: { color: '#6B7280', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' },
  genreRow: { flexDirection: 'row', flexWrap: 'wrap' },
  description: { color: '#D1D5DB', fontSize: 15, lineHeight: 22 },
  lineupItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  lineupDot: { color: '#8B5CF6', fontSize: 14 },
  lineupArtist: { color: '#fff', fontSize: 16, fontWeight: '500' },
  ticketBtn: {
    marginTop: 28,
    backgroundColor: '#8B5CF6',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ticketBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  noTickets: { marginTop: 28, alignItems: 'center' },
  noTicketsText: { color: '#6B7280', fontSize: 14 },
  errorText: { color: '#fff', fontSize: 18, marginBottom: 20 },
  backBtn: { backgroundColor: '#8B5CF6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  backBtnText: { color: '#fff', fontWeight: '600' },
});
