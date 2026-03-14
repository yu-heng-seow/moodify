import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, router } from 'expo-router';
import { useAudio } from '@/hooks/use-audio';
import { getTrackById, Tracks } from '@/constants/tracks';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

function formatMs(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PlayerScreen() {
  console.log('PlayerScreen mounted'); 
  const { trackId } = useLocalSearchParams<{ trackId?: string }>();
  const { loadAndPlay, togglePlayPause, isPlaying, isLoading, position, duration, currentTrack } =
    useAudio();

  const [pulseAnim] = useState(new Animated.Value(1));

  const track = trackId ? getTrackById(trackId) : currentTrack ?? Tracks[0];

  useEffect(() => {
    console.log('useEffect fired, track:', track?.title);
    if (track) {
      loadAndPlay(track);
    }
  }, [track?.id]);

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 1800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isPlaying]);

  useEffect(() => {
    console.log('🎯 trackId param:', trackId);
    console.log('🎵 resolved track:', track?.title);
    console.log('🔄 currentTrack:', currentTrack?.title);
    if (track && (!currentTrack || currentTrack.id !== track.id)) {
      loadAndPlay(track);
    }
  }, [track?.id]);

  const progress = duration > 0 ? position / duration : 0;

  if (!track) {
    return (
      <LinearGradient colors={['#0D0F1A', '#11122A']} style={styles.bg}>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🎵</Text>
          <Text style={styles.emptyText}>No track selected</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/library')}>
            <Text style={styles.emptyLink}>Browse Library →</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.bg.primary, track.coverGradient[1] + 'AA', Colors.bg.primary]}
      style={styles.bg}
    >
      {/* Background glow */}
      <View
        style={[styles.bgGlow, { backgroundColor: track.color }]}
      />

      <View style={styles.container}>
        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <BlurView intensity={15} tint="dark" style={styles.backBlur}>
            <Text style={styles.backIcon}>←</Text>
          </BlurView>
        </TouchableOpacity>

        {/* Cover art */}
        <View style={styles.coverContainer}>
          <Animated.View style={[styles.coverOuter, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient
              colors={track.coverGradient}
              style={styles.cover}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.9, y: 1 }}
            >
              <Text style={styles.coverEmoji}>
                {track.genre === 'nature' ? '🌿' :
                  track.genre === 'ambient' ? '🌌' :
                  track.genre === 'binaural' ? '🧠' :
                  track.genre === 'classical' ? '🎻' : '🧘'}
              </Text>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Track info */}
        <View style={styles.info}>
          <Text style={styles.trackTitle}>{track.title}</Text>
          <Text style={styles.trackArtist}>{track.artist}</Text>
          <Text style={styles.trackDesc}>{track.description}</Text>
        </View>

        {/* Emotion tags */}
        <View style={styles.tags}>
          {track.emotions.map((e) => (
            <View key={e} style={styles.tag}>
              <Text style={styles.tagText}>{e}</Text>
            </View>
          ))}
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBg}>
            <LinearGradient
              colors={track.coverGradient}
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatMs(position)}</Text>
            <Text style={styles.timeText}>{formatMs(duration)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={togglePlayPause}
            disabled={isLoading}
            style={styles.playBtn}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={track.coverGradient}
              style={styles.playGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.playIcon}>
                {isLoading ? '⏳' : isPlaying ? '❙❙' : '▶'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  bgGlow: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.07,
    top: 100,
    alignSelf: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: 35,
    paddingBottom: 48,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: Theme.spacing.xl,
  },
  backBlur: {
    borderRadius: Theme.radius.full,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  backIcon: {
    color: Colors.text.primary,
    fontSize: Theme.fontSize.lg,
    fontFamily: Theme.fontFamily.body,
  },
  coverContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  coverOuter: {
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  cover: {
    width: 240,
    height: 240,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverEmoji: { fontSize: 72 },
  info: {
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  trackTitle: {
    fontSize: Theme.fontSize.xxl,
    fontFamily: Theme.fontFamily.display,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  trackArtist: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.body,
    color: Colors.accent.lavender,
    marginTop: 4,
  },
  trackDesc: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  tags: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: Theme.spacing.xl,
    flexWrap: 'wrap',
  },
  tag: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: Theme.radius.full,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  tagText: {
    fontSize: Theme.fontSize.xs,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.secondary,
  },
  progressContainer: {
    marginBottom: Theme.spacing.xl,
  },
  progressBg: {
    height: 4,
    backgroundColor: Colors.bg.elevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: Theme.fontSize.xs,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.muted,
  },
  controls: {
    alignItems: 'center',
  },
  playBtn: {
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  playGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 30,
    color: Colors.text.primary,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyEmoji: { fontSize: 48 },
  emptyText: {
    color: Colors.text.secondary,
    fontFamily: Theme.fontFamily.body,
    fontSize: Theme.fontSize.md,
  },
  emptyLink: {
    color: Colors.accent.lavender,
    fontFamily: Theme.fontFamily.bodySemiBold,
    fontSize: Theme.fontSize.md,
  },
});
