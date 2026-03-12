import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { genreColor, genreLabel } from '@/constants/genres';

interface Props {
  genre: string;
  small?: boolean;
}

export function GenreTag({ genre, small }: Props) {
  const color = genreColor(genre);
  return (
    <View style={[styles.tag, { backgroundColor: color + '33', borderColor: color }, small && styles.small]}>
      <Text style={[styles.text, { color }, small && styles.smallText]}>
        {genreLabel(genre)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  small: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
  smallText: {
    fontSize: 11,
  },
});
