import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

interface StepIndicatorProps {
  total: number;
  current: number; // 0-indexed
}

export function StepIndicator({ total, current }: StepIndicatorProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === current && styles.active,
            i < current && styles.done,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  active: {
    width: 24,
    backgroundColor: Colors.accent.lavender,
    borderRadius: 4,
  },
  done: {
    backgroundColor: Colors.accent.lavenderDim,
    opacity: 0.6,
  },
});
