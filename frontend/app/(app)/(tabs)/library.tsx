import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { TrackCard } from '@/components/music/TrackCard';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { Tracks, Track } from '@/constants/tracks';
import { Emotions, EmotionId } from '@/constants/emotions';

export default function LibraryScreen() {
  const [activeFilter, setActiveFilter] = useState<EmotionId | 'all'>('all');

  const filtered =
    activeFilter === 'all'
      ? Tracks
      : Tracks.filter((t) => t.emotions.includes(activeFilter));

  function handleTrackPress(track: Track) {
    router.push({
      pathname: '/(tabs)/player',
      params: { trackId: track.id },
    });
  }

  return (
    <LinearGradient colors={['#0D0F1A', '#11122A', '#0D0F1A']} style={styles.bg}>
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <Text style={styles.subtitle}>{Tracks.length} healing soundscapes</Text>
      </View>

      {/* Emotion filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        <TouchableOpacity
          onPress={() => setActiveFilter('all')}
          style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
        >
          <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>
            ✨ All
          </Text>
        </TouchableOpacity>

        {Emotions.map((e) => (
          <TouchableOpacity
            key={e.id}
            onPress={() => setActiveFilter(e.id)}
            activeOpacity={0.75}
            style={[
              styles.filterChip,
              activeFilter === e.id && styles.filterChipActive,
              activeFilter === e.id && { borderColor: e.color },
            ]}
          >
            {activeFilter === e.id && (
              <LinearGradient
                colors={[e.color + '33', e.color + '11']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            )}
            <Text style={[
              styles.filterText,
              activeFilter === e.id && styles.filterTextActive,
            ]}>
              {e.emoji} {e.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Track list */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌫️</Text>
            <Text style={styles.emptyText}>No tracks for this emotion yet</Text>
          </View>
        ) : (
          filtered.map((track) => (
            <TrackCard key={track.id} track={track} onPress={handleTrackPress} />
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  header: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.fontSize.display,
    fontFamily: Theme.fontFamily.display,
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  filterScroll: { 
    height:52, flexShrink: 0,  },
  filterRow: {
    paddingHorizontal: Theme.spacing.lg,
    gap: 8,
    paddingBottom: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    backgroundColor: Colors.bg.card,
    overflow: 'hidden',
  },
  filterChipActive: {
    borderColor: Colors.accent.lavender,
  },
  filterText: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.secondary,
  },
  filterTextActive: {
    color: Colors.text.primary,
    fontFamily: Theme.fontFamily.bodySemiBold,
  },
  list: {
    padding: Theme.spacing.lg,
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyEmoji: { fontSize: 40 },
  emptyText: {
    color: Colors.text.muted,
    fontFamily: Theme.fontFamily.body,
    fontSize: Theme.fontSize.md,
  },
});
