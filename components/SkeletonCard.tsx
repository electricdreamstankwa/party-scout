import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

function Bone({ style }: { style: any }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return <Animated.View style={[styles.bone, style, { opacity }]} />;
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <Bone style={styles.image} />
      <View style={styles.body}>
        <View style={styles.genreRow}>
          <Bone style={styles.genreChip} />
          <Bone style={[styles.genreChip, { width: 50 }]} />
        </View>
        <Bone style={styles.titleLine1} />
        <Bone style={styles.titleLine2} />
        <Bone style={styles.metaLine} />
      </View>
      <Bone style={styles.bar} />
    </View>
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
    borderColor: '#ffffff08',
  },
  bone: { backgroundColor: '#ffffff18', borderRadius: 6 },
  image: { width: '100%', height: 180, borderRadius: 0 },
  body: { padding: 14 },
  genreRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  genreChip: { height: 12, width: 70, borderRadius: 4 },
  titleLine1: { height: 18, width: '80%', marginBottom: 6 },
  titleLine2: { height: 18, width: '50%', marginBottom: 10 },
  metaLine: { height: 12, width: '60%' },
  bar: { height: 3, width: '100%', borderRadius: 0 },
});
