import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Track } from '@/constants/tracks';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { router } from 'expo-router';

interface MiniPlayerProps {
  track: Track;
  isPlaying: boolean;
  onPlayPause: () => void;
}

export function MiniPlayer({ track, isPlaying, onPlayPause }: MiniPlayerProps) {
  return (
    <BlurView intensity={40} tint="dark" style={styles.container}>
      <LinearGradient
        colors={['rgba(167,139,250,0.1)', 'rgba(0,0,0,0)']}
        style={StyleSheet.absoluteFill}
      />
      <TouchableOpacity
        style={styles.inner}
        onPress={() => router.push('/(app)/(tabs)/player')}
        activeOpacity={0.9}
      >
        {/* Track info */}
        <LinearGradient
          colors={track.coverGradient}
          style={styles.thumb}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {track.title}
          </Text>
          <Text style={styles.artist}>{track.artist}</Text>
        </View>

        {/* Play/pause */}
        <TouchableOpacity onPress={onPlayPause} style={styles.btn}>
          <Text style={styles.btnText}>{isPlaying ? '⏸' : '▶️'}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 12,
    right: 12,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  info: {
    flex: 1,
  },
  title: {
    color: Colors.text.primary,
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.bodySemiBold,
  },
  artist: {
    color: Colors.text.secondary,
    fontSize: Theme.fontSize.xs,
    fontFamily: Theme.fontFamily.body,
  },
  btn: {
    padding: 8,
  },
  btnText: {
    fontSize: 20,
  },
});
