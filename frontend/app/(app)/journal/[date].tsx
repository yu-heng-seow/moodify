import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/auth';
import { supabase } from '@/lib/supabase';
import { Emotions } from '@/constants/emotions';
import { getTrackById } from '@/constants/tracks';

interface JournalEntry {
  id: string;
  emotion: string;
  note: string | null;
  recommended_track_id: string | null;
  created_at: string;
}

export default function JournalDateScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && date) fetchEntries();
  }, [date]);

  async function fetchEntries() {
    if (!user || !date) return;

    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    const { data } = await supabase
      .from('journal_entries')
      .select('id, emotion, note, recommended_track_id, created_at')
      .eq('user_id', user.id)
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
      .order('created_at', { ascending: true });

    setEntries(data ?? []);
    setLoading(false);
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  function formatTime(isoStr: string) {
    return new Date(isoStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  return (
    <LinearGradient colors={['#0D0F1A', '#11122A', '#0D0F1A']} style={styles.bg}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{date ? formatDate(date) : ''}</Text>

        {loading ? (
          <ActivityIndicator color={Colors.accent.lavender} style={{ marginTop: 40 }} />
        ) : entries.length === 0 ? (
          <Text style={styles.emptyText}>No entries for this day</Text>
        ) : (
          entries.map((entry) => {
            const emotion = Emotions.find((e) => e.id.toLowerCase() === entry.emotion.toLowerCase());
            const track = entry.recommended_track_id ? getTrackById(entry.recommended_track_id) : null;

            return (
              <View key={entry.id} style={styles.entryCard}>
                <Text style={styles.time}>{formatTime(entry.created_at)}</Text>

                <View style={styles.emotionRow}>
                  <Text style={styles.emotionEmoji}>{emotion?.emoji ?? '🎵'}</Text>
                  <Text style={[styles.emotionLabel, emotion && { color: emotion.color }]}>
                    {emotion?.label ?? entry.emotion}
                  </Text>
                </View>

                {entry.note ? (
                  <Text style={styles.note}>{entry.note}</Text>
                ) : null}

                {track ? (
                  <TouchableOpacity
                    style={styles.trackCard}
                    activeOpacity={0.7}
                    onPress={() => router.push({ pathname: '/(app)/(tabs)/player', params: { trackId: track.id } })}
                  >
                    <LinearGradient
                      colors={track.coverGradient}
                      style={styles.trackGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                    <View style={styles.trackInfo}>
                      <Text style={styles.trackTitle}>{track.title}</Text>
                      <Text style={styles.trackArtist}>{track.artist}</Text>
                    </View>
                    <Text style={styles.trackArrow}>›</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: 100,
  },
  backButton: {
    marginBottom: Theme.spacing.md,
  },
  backText: {
    fontSize: Theme.fontSize.md,
    fontFamily: Theme.fontFamily.body,
    color: Colors.accent.lavender,
  },
  title: {
    fontSize: Theme.fontSize.xxl,
    fontFamily: Theme.fontFamily.display,
    color: Colors.text.primary,
    marginBottom: Theme.spacing.xl,
  },
  emptyText: {
    fontSize: Theme.fontSize.md,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 40,
  },
  entryCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: 16,
    marginBottom: Theme.spacing.md,
  },
  time: {
    fontSize: Theme.fontSize.xs,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.muted,
    marginBottom: 8,
  },
  emotionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  emotionEmoji: {
    fontSize: 24,
  },
  emotionLabel: {
    fontSize: Theme.fontSize.lg,
    fontFamily: Theme.fontFamily.bodySemiBold,
    color: Colors.text.primary,
  },
  note: {
    fontSize: Theme.fontSize.md,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.elevated,
    borderRadius: Theme.radius.md,
    padding: 12,
    marginTop: 4,
    overflow: 'hidden',
    gap: 12,
  },
  trackGradient: {
    width: 40,
    height: 40,
    borderRadius: Theme.radius.sm,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.bodySemiBold,
    color: Colors.text.primary,
  },
  trackArtist: {
    fontSize: Theme.fontSize.xs,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.secondary,
  },
  trackArrow: {
    fontSize: 20,
    color: Colors.text.muted,
  },
});
