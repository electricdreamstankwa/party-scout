import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Modal } from 'react-native';
import { GENRES, RADIUS_OPTIONS, DATE_RANGE_OPTIONS } from '@/constants/genres';
import { EventFilters } from '@/lib/types';
import { genreColor } from '@/constants/genres';

interface Props {
  filters: EventFilters;
  onChange: (f: EventFilters) => void;
}

export function FilterBar({ filters, onChange }: Props) {
  const [showRadius, setShowRadius] = useState(false);

  function toggleGenre(value: string) {
    const next = filters.genres.includes(value)
      ? filters.genres.filter(g => g !== value)
      : [...filters.genres, value];
    onChange({ ...filters, genres: next });
  }

  function setDate(value: EventFilters['dateRange']) {
    onChange({ ...filters, dateRange: value });
  }

  function setRadius(value: number) {
    onChange({ ...filters, radius: value });
    setShowRadius(false);
  }

  const radiusLabel = RADIUS_OPTIONS.find(r => r.value === filters.radius)?.label ?? '100 km';

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {/* Radius pill */}
        <Pressable style={styles.pill} onPress={() => setShowRadius(true)}>
          <Text style={styles.pillText}>📡 {radiusLabel}</Text>
        </Pressable>

        {/* Date range pills */}
        {DATE_RANGE_OPTIONS.map(opt => (
          <Pressable
            key={opt.value}
            style={[styles.pill, filters.dateRange === opt.value && styles.pillActive]}
            onPress={() => setDate(opt.value)}
          >
            <Text style={[styles.pillText, filters.dateRange === opt.value && styles.pillTextActive]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}

        {/* Separator */}
        <View style={styles.separator} />

        {/* Genre pills */}
        {GENRES.map(genre => {
          const active = filters.genres.includes(genre.value);
          return (
            <Pressable
              key={genre.value}
              style={[styles.pill, active && { backgroundColor: genre.color + '33', borderColor: genre.color }]}
              onPress={() => toggleGenre(genre.value)}
            >
              <Text style={[styles.pillText, active && { color: genre.color }]}>
                {genre.emoji} {genre.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Radius picker modal */}
      <Modal transparent visible={showRadius} animationType="fade" onRequestClose={() => setShowRadius(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowRadius(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Search radius</Text>
            {RADIUS_OPTIONS.map(opt => (
              <Pressable
                key={opt.value}
                style={[styles.sheetOption, filters.radius === opt.value && styles.sheetOptionActive]}
                onPress={() => setRadius(opt.value)}
              >
                <Text style={[styles.sheetOptionText, filters.radius === opt.value && styles.sheetOptionTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: '#8B5CF633',
    borderColor: '#8B5CF6',
  },
  pillText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#8B5CF6',
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: '#374151',
    marginRight: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheet: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    width: 240,
  },
  sheetTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  sheetOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  sheetOptionActive: {
    // highlight active
  },
  sheetOptionText: {
    color: '#9CA3AF',
    fontSize: 15,
  },
  sheetOptionTextActive: {
    color: '#8B5CF6',
    fontWeight: '700',
  },
});
