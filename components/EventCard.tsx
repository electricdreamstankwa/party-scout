import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Event } from '@/lib/types';
import { genreColor, genreLabel } from '@/constants/genres';

interface Props {
  event: Event;
}

function daysUntil(dateStr: string): string {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  if (diff === 0) return 'TODAY';
  if (diff === 1) return 'TOMORROW';
  if (diff <= 6) return `${diff} DAYS`;
  if (diff <= 30) return `${Math.ceil(diff / 7)}W`;
  return `${Math.ceil(diff / 30)}M`;
}

const typeLabel: Record<string, string> = {
  club: 'CLUB', festival: 'FESTIVAL', open_air: 'OPEN AIR', virtual: 'VIRTUAL',
};

const typeEmoji: Record<string, string> = {
  club: '🎧', festival: '🏕️', open_air: '🌙', virtual: '💻',
};

function CardContent({ event }: { event: Event }) {
  const accent = event.genres.length > 0 ? genreColor(event.genres[0]) : '#A855F7';
  const dateObj = new Date(event.date_start);
  const dayStr = dateObj.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' });
  const countdown = daysUntil(event.date_start);

  return (
    <View style={styles.card}>
      {/* Flyer / Hero image */}
      <View style={styles.flyerWrap}>
        {event.flyer_url ? (
          <Image source={{ uri: event.flyer_url }} style={styles.flyer} resizeMode="cover" />
        ) : (
          <View style={[styles.flyer, styles.flyerFallback, { backgroundColor: accent + '22' }]}>
            <Text style={styles.flyerFallbackEmoji}>{typeEmoji[event.type] ?? '🎉'}</Text>
          </View>
        )}

        {/* Dark overlay at bottom of flyer */}
        <View style={styles.flyerOverlay} />

        {/* Top badges */}
        <View style={styles.topBadges}>
          <View style={[styles.badge, { backgroundColor: accent }]}>
            <Text style={styles.badgeText}>{typeLabel[event.type] ?? 'EVENT'}</Text>
          </View>
          <View style={styles.countdownBadge}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        </View>
      </View>

      {/* Info section */}
      <View style={styles.info}>
        {/* Genre tags */}
        {event.genres.length > 0 && (
          <View style={styles.genreRow}>
            {event.genres.slice(0, 3).map(g => (
              <Text key={g} style={[styles.genreTag, { color: genreColor(g) }]}>
                {genreLabel(g).toUpperCase()}
              </Text>
            ))}
          </View>
        )}

        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.dateText}>{dayStr}</Text>
          {event.city ? (
            <Text style={styles.cityText}>
              {'  ·  '}📍{event.city}{event.distance_km != null ? `  ${Math.round(event.distance_km)}km` : ''}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Bottom accent bar */}
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
    </View>
  );
}

export function EventCard({ event }: Props) {
  const router = useRouter();

  if (Platform.OS === 'web') {
    return (
      // @ts-ignore
      <a
        href={`/event/${event.id}`}
        style={{ textDecoration: 'none', display: 'block', cursor: 'pointer' }}
        onClick={(e: any) => { e.preventDefault(); router.push(`/event/${event.id}` as any); }}
      >
        <CardContent event={event} />
      </a>
    );
  }

  return (
    <TouchableOpacity onPress={() => router.push(`/event/${event.id}` as any)} activeOpacity={0.8}>
      <CardContent event={event} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111122',
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ffffff0f',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  flyerWrap: { position: 'relative' },
  flyer: { width: '100%', height: 180 },
  flyerFallback: { alignItems: 'center', justifyContent: 'center' },
  flyerFallbackEmoji: { fontSize: 60 },
  flyerOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
    backgroundColor: '#111122cc',
  },
  topBadges: {
    position: 'absolute', top: 10, left: 10, right: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  badge: {
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  countdownBadge: {
    backgroundColor: '#000000aa',
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: '#ffffff22',
  },
  countdownText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  info: { padding: 14, paddingBottom: 12 },
  genreRow: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  genreTag: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  title: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: -0.3, marginBottom: 8, lineHeight: 22 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  dateText: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },
  cityText: { color: '#9CA3AF', fontSize: 12 },
  accentBar: { height: 3, width: '100%' },
});
