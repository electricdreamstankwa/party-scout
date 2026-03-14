import React, { useRef } from 'react';
import {
  View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Event } from '@/lib/types';
import { genreColor } from '@/constants/genres';

const { width } = Dimensions.get('window');
const CARD_W = Math.min(width * 0.78, 300);

interface Props {
  events: Event[];
}

export function FeaturedCarousel({ events }: Props) {
  const router = useRouter();

  if (events.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>⚡ FEATURED</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        decelerationRate="fast"
        snapToInterval={CARD_W + 12}
        snapToAlignment="start"
      >
        {events.map(event => {
          const accent = event.genres.length > 0 ? genreColor(event.genres[0]) : '#A855F7';
          const dateObj = new Date(event.date_start);
          const dateLabel = dateObj.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });

          return (
            <TouchableOpacity
              key={event.id}
              style={[styles.card, { width: CARD_W }]}
              activeOpacity={0.85}
              onPress={() => router.push(`/event/${event.id}` as any)}
            >
              {/* Image */}
              {event.flyer_url ? (
                <Image source={{ uri: event.flyer_url }} style={styles.img} resizeMode="cover" />
              ) : (
                <View style={[styles.img, styles.imgFallback, { backgroundColor: accent + '33' }]}>
                  <Text style={styles.imgEmoji}>{event.type === 'festival' ? '🏕️' : '🎉'}</Text>
                </View>
              )}

              {/* Dark overlay */}
              <View style={styles.overlay} />

              {/* Content over image */}
              <View style={styles.content}>
                <View style={[styles.typePill, { backgroundColor: accent }]}>
                  <Text style={styles.typePillText}>
                    {event.type === 'festival' ? 'FESTIVAL' : 'FEATURED'}
                  </Text>
                </View>
                <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
                <Text style={styles.meta}>
                  {dateLabel}{event.city ? `  ·  ${event.city}` : ''}
                </Text>
              </View>

              {/* Accent bar */}
              <View style={[styles.bar, { backgroundColor: accent }]} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 6 },
  heading: {
    color: '#4B5563',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginLeft: 16,
    marginBottom: 10,
    marginTop: 8,
  },
  scroll: { paddingHorizontal: 16, gap: 12 },
  card: {
    height: 200,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#ffffff0f',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  img: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  imgFallback: { alignItems: 'center', justifyContent: 'center' },
  imgEmoji: { fontSize: 56 },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#000000aa',
  },
  content: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 14,
  },
  typePill: {
    alignSelf: 'flex-start',
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
    marginBottom: 8,
  },
  typePillText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  title: { color: '#fff', fontSize: 17, fontWeight: '900', letterSpacing: -0.3, lineHeight: 22, marginBottom: 4 },
  meta: { color: '#ffffff99', fontSize: 11, fontWeight: '600' },
  bar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3 },
});
