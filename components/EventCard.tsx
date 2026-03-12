import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Event } from '@/lib/types';
import { GenreTag } from './GenreTag';
import { formatDistance } from '@/lib/distance';

interface Props {
  event: Event;
}

export function EventCard({ event }: Props) {
  const dateObj = new Date(event.date_start);
  const dateLabel = dateObj.toLocaleDateString('en-ZA', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
  const timeLabel = dateObj.toLocaleTimeString('en-ZA', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
      onPress={() => router.push(`/event/${event.id}`)}
    >
      {/* Flyer */}
      <View style={styles.flyerContainer}>
        {event.flyer_url ? (
          <Image source={{ uri: event.flyer_url }} style={styles.flyer} resizeMode="cover" />
        ) : (
          <View style={[styles.flyer, styles.flyerPlaceholder]}>
            <Text style={styles.flyerEmoji}>🎉</Text>
          </View>
        )}
        {event.type === 'festival' && (
          <View style={styles.festivalBadge}>
            <Text style={styles.festivalBadgeText}>FESTIVAL</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>

        <Text style={styles.meta}>
          {dateLabel} · {timeLabel}
          {event.city ? `  ·  ${event.city}` : ''}
          {event.distance_km != null ? `  ·  ${formatDistance(event.distance_km)}` : ''}
        </Text>

        {event.venue_name ? (
          <Text style={styles.venue} numberOfLines={1}>{event.venue_name}</Text>
        ) : null}

        {event.genres.length > 0 && (
          <View style={styles.genres}>
            {event.genres.slice(0, 3).map(g => (
              <GenreTag key={g} genre={g} small />
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  flyerContainer: {
    position: 'relative',
  },
  flyer: {
    width: 110,
    height: 120,
  },
  flyerPlaceholder: {
    backgroundColor: '#2d2d50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flyerEmoji: {
    fontSize: 36,
  },
  festivalBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#F97316',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  festivalBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  meta: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
  },
  venue: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 6,
  },
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
