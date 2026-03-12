import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, RefreshControl,
  ActivityIndicator, SafeAreaView,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { Event, EventFilters, UserLocation } from '@/lib/types';
import { EventCard } from '@/components/EventCard';
import { FilterBar } from '@/components/FilterBar';
import { LocationSearch } from '@/components/LocationSearch';
import { distanceKm } from '@/lib/distance';

const DEFAULT_FILTERS: EventFilters = {
  genres: [],
  dateRange: 'all',
  radius: 100,
};

// Demo events — shown before Supabase is connected
const DEMO_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Full Moon Gathering',
    description: 'An outdoor psytrance experience under the stars.',
    date_start: new Date(Date.now() + 3 * 86400000).toISOString(),
    date_end: null,
    venue_name: 'The Farm',
    city: 'Cape Town',
    country: 'South Africa',
    lat: -33.9249,
    lng: 18.4241,
    genres: ['psytrance', 'ambient'],
    type: 'open_air',
    flyer_url: null,
    lineup: ['Astrix', 'Infected Mushroom', 'Vini Vici'],
    ticket_url: null,
    ticket_affiliate_url: null,
    source: 'demo',
    status: 'approved',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Dark Room Techno Night',
    description: 'Deep techno in an intimate industrial venue.',
    date_start: new Date(Date.now() + 5 * 86400000).toISOString(),
    date_end: null,
    venue_name: 'Blank Projects',
    city: 'Cape Town',
    country: 'South Africa',
    lat: -33.9281,
    lng: 18.4186,
    genres: ['techno'],
    type: 'club',
    flyer_url: null,
    lineup: ['Dax J', 'Rebekah'],
    ticket_url: null,
    ticket_affiliate_url: null,
    source: 'demo',
    status: 'approved',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Sunrise Festival 2026',
    description: '3-day festival with camping and multiple stages.',
    date_start: new Date(Date.now() + 14 * 86400000).toISOString(),
    date_end: new Date(Date.now() + 17 * 86400000).toISOString(),
    venue_name: 'Tankwa Karoo',
    city: 'Calvinia',
    country: 'South Africa',
    lat: -31.4001,
    lng: 19.7646,
    genres: ['psytrance', 'techno', 'festival'],
    type: 'festival',
    flyer_url: null,
    lineup: ['Neelix', 'Ace Ventura', 'Pixel'],
    ticket_url: null,
    ticket_affiliate_url: null,
    source: 'demo',
    status: 'approved',
    created_at: new Date().toISOString(),
  },
];

export default function HomeScreen() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [filters, setFilters] = useState<EventFilters>(DEFAULT_FILTERS);
  const [events, setEvents] = useState<Event[]>(DEMO_EVENTS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [usingDemo, setUsingDemo] = useState(true);

  async function loadEvents(loc: UserLocation | null, f: EventFilters) {
    setLoading(true);
    try {
      let query = supabase
        .from('events')
        .select('*')
        .eq('status', 'approved')
        .gte('date_start', new Date().toISOString())
        .order('date_start', { ascending: true });

      if (f.genres.length > 0) {
        query = query.overlaps('genres', f.genres);
      }

      if (f.dateRange === 'weekend') {
        const now = new Date();
        const friday = new Date(now);
        friday.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7));
        friday.setHours(0, 0, 0, 0);
        const sunday = new Date(friday);
        sunday.setDate(friday.getDate() + 2);
        sunday.setHours(23, 59, 59, 999);
        query = query.gte('date_start', friday.toISOString()).lte('date_start', sunday.toISOString());
      } else if (f.dateRange === 'month') {
        const end = new Date();
        end.setMonth(end.getMonth() + 1);
        query = query.lte('date_start', end.toISOString());
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      if (!data || data.length === 0) {
        setUsingDemo(true);
        setEvents(DEMO_EVENTS);
        return;
      }

      setUsingDemo(false);
      let result: Event[] = data;

      if (loc && f.radius > 0) {
        result = result
          .map(e => ({
            ...e,
            distance_km: e.lat && e.lng ? distanceKm(loc.lat, loc.lng, e.lat, e.lng) : undefined,
          }))
          .filter(e => e.distance_km == null || e.distance_km <= f.radius)
          .sort((a, b) => (a.distance_km ?? 99999) - (b.distance_km ?? 99999));
      } else if (loc) {
        result = result.map(e => ({
          ...e,
          distance_km: e.lat && e.lng ? distanceKm(loc.lat, loc.lng, e.lat, e.lng) : undefined,
        }));
      }

      setEvents(result);
    } catch {
      setUsingDemo(true);
      let demo = DEMO_EVENTS;
      if (loc) {
        demo = demo.map(e => ({
          ...e,
          distance_km: e.lat && e.lng ? distanceKm(loc.lat, loc.lng, e.lat, e.lng) : undefined,
        }));
      }
      setEvents(demo);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadEvents(location, filters);
  }, [location, filters]);

  function onRefresh() {
    setRefreshing(true);
    loadEvents(location, filters);
  }

  const locationLabel = location?.label ?? 'Worldwide';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.logo}>Party Scout</Text>
        <Text style={styles.sub}>
          {events.length} {events.length === 1 ? 'party' : 'parties'} · {locationLabel}
        </Text>
      </View>

      <LocationSearch location={location} onLocationChange={setLocation} />
      <FilterBar filters={filters} onChange={setFilters} />

      {usingDemo && (
        <View style={styles.demoBanner}>
          <Text style={styles.demoBannerText}>
            Demo data · Add Supabase keys to .env to go live
          </Text>
        </View>
      )}

      {loading && !refreshing ? (
        <ActivityIndicator color="#8B5CF6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={e => e.id}
          renderItem={({ item }) => <EventCard event={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>No parties found nearby.</Text>
              <Text style={styles.emptyHint}>Try increasing the radius or changing filters.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d0d1a' },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  logo: { color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  sub: { color: '#6B7280', fontSize: 13, marginTop: 2 },
  list: { paddingTop: 8, paddingBottom: 20 },
  demoBanner: {
    backgroundColor: '#92400E33',
    borderWidth: 1,
    borderColor: '#D97706',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    padding: 8,
  },
  demoBannerText: { color: '#FCD34D', fontSize: 12, textAlign: 'center' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  emptyHint: { color: '#6B7280', fontSize: 14, marginTop: 6 },
});
