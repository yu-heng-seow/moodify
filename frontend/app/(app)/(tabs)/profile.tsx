import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/auth';
import { Avatar } from '@/components/ui/Avatar';
import { uploadImage, getSignedUrl } from '@/lib/media';
import { supabase } from '@/lib/supabase';
import { Emotions } from '@/constants/emotions';

export default function ProfileScreen() {
  const { profile, user, signOut, refreshProfile } = useAuth();
  const [streak, setStreak] = useState(0);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [recentMoods, setRecentMoods] = useState<string[]>([]);

  useEffect(() => {
    if (user) fetchJournalStats();
  }, []);

  useEffect(() => {
    if (profile?.avatarS3Key) {
      getSignedUrl(profile.avatarS3Key, 3600).then(setAvatarUri);
    }
  }, [profile?.avatarS3Key]);

  async function fetchJournalStats() {
    if (!user) return;

    // Total session count
    const { count } = await supabase
      .from('journal_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    setSessionCount(count ?? 0);

    // Recent 5 moods
    const { data } = await supabase
      .from('journal_entries')
      .select('emotion')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    if (data) {
      const emojis = data.map((entry) => {
        const emotion = Emotions.find((e) => e.id.toLowerCase() === entry.emotion.toLowerCase());
        return emotion?.emoji ?? '🎵';
      });
      setRecentMoods(emojis);
    }

    // Streak: count consecutive days with entries (including today)
    const { data: entries } = await supabase
      .from('journal_entries')
      .select('created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (entries && entries.length > 0) {
      const uniqueDays = [...new Set(
        entries.map((e) => new Date(e.created_at).toDateString())
      )];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const firstDay = new Date(uniqueDays[0]);
      firstDay.setHours(0, 0, 0, 0);

      // Streak only counts if the most recent entry is today or yesterday
      const diffFromToday = Math.floor((today.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24));
      if (diffFromToday > 1) {
        setStreak(0);
      } else {
        let consecutive = 1;
        for (let i = 1; i < uniqueDays.length; i++) {
          const curr = new Date(uniqueDays[i - 1]);
          const prev = new Date(uniqueDays[i]);
          curr.setHours(0, 0, 0, 0);
          prev.setHours(0, 0, 0, 0);
          const diff = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
          if (diff === 1) {
            consecutive++;
          } else {
            break;
          }
        }
        setStreak(consecutive);
      }
    }
  }

  async function handleSignOut() {
    await signOut();
  }

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setAvatarUri(uri);
    setUploading(true);

    try {
      const path = await uploadImage(uri, `${user!.id}/avatar`);
      await supabase.from('profiles').update({ avatar_s3_key: path }).eq('id', user!.id);
      await refreshProfile();
    } finally {
      setUploading(false);
    }
  }

  return (
    <LinearGradient colors={['#0D0F1A', '#11122A', '#0D0F1A']} style={styles.bg}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View>
            <Avatar size={88} uri={avatarUri ?? profile?.avatarS3Key ?? null} onPress={pickImage} />
            {uploading && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color={Colors.text.primary} />
              </View>
            )}
          </View>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
            <Text style={styles.editAvatarText}>Edit profile picture</Text>
          </TouchableOpacity>
          <Text style={styles.name}>{profile?.displayName ?? 'Your name'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.joined}>Healing since March 2025</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statCard} activeOpacity={0.7} onPress={() => router.push('/(app)/calendar')}>
            <Text style={styles.statNumber}>{sessionCount}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} activeOpacity={0.7} onPress={() => router.push('/(app)/calendar')}>
            <Text style={styles.statNumber}>{streak}</Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </TouchableOpacity>
        </View>

        {/* Mood history */}
        {recentMoods.length > 0 && (
          <>
        <Text style={styles.sectionTitle}>Recent moods</Text>
        <View style={styles.moodRow}>
          {recentMoods.map((emoji, i) => (
            <View key={i} style={styles.moodChip}>
              <Text style={styles.moodEmoji}>{emoji}</Text>
            </View>
          ))}
        </View>
          </>
        )}

        {/* Preferred Genres */}
        {profile?.preferredGenres && profile.preferredGenres.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferred Genres</Text>
            <View style={styles.chips}>
              {profile.preferredGenres.map((genre) => (
                <View key={genre} style={styles.chip}>
                  <Text style={styles.chipText}>{genre}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Therapy Goals */}
        {profile?.therapyGoals && profile.therapyGoals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Therapy Goals</Text>
            <View style={styles.chips}>
              {profile.therapyGoals.map((goal) => (
                <View key={goal} style={styles.chip}>
                  <Text style={styles.chipText}>{goal}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Breathing card */}
        <TouchableOpacity
          style={styles.breathingCard}
          activeOpacity={0.85}
          onPress={() => router.push('/breathing')}
        >
          <LinearGradient
            colors={['rgba(167,139,250,0.15)', 'rgba(167,139,250,0.03)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Text style={styles.breathingEmoji}>🌬️</Text>
          <View style={styles.breathingInfo}>
            <Text style={styles.breathingTitle}>Breathing exercise</Text>
            <Text style={styles.breathingDesc}>Follow along to calm your nervous system</Text>
          </View>
          <Text style={styles.breathingArrow}>›</Text>
        </TouchableOpacity>

        {/* Settings list */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsList}>
          {[
            { emoji: '🔔', label: 'Notifications', onPress: () => {
              if (Platform.OS === 'web') {
                alert('To manage notifications, check your browser settings.');
              } else {
                Linking.openSettings();
              }
            }},
            { emoji: '🔒', label: 'Privacy', onPress: () => {} },
            { emoji: '💬', label: 'Feedback', onPress: () => {} },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={styles.settingsRow} onPress={item.onPress} activeOpacity={0.7}>
              <Text style={styles.settingsEmoji}>{item.emoji}</Text>
              <Text style={styles.settingsLabel}>{item.label}</Text>
              <Text style={styles.settingsArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity
          style={styles.signOut}
          activeOpacity={0.8}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  avatarOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 44,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarText: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.body,
    color: Colors.accent.lavender,
    marginTop: 4,
  },
  container: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: 100,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
    gap: 4,
  },
  name: {
    fontSize: Theme.fontSize.xxl,
    fontFamily: Theme.fontFamily.display,
    color: Colors.text.primary,
    marginTop: 12,
  },
  email: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.secondary,
  },
  joined: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.muted,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bg.card,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: Theme.fontSize.xxl,
    fontFamily: Theme.fontFamily.display,
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: Theme.fontSize.xs,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.muted,
  },
  sectionTitle: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.bodySemiBold,
    color: Colors.text.secondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    marginBottom: Theme.spacing.xl,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Theme.spacing.xl,
  },
  moodChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmoji: { fontSize: 20 },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    backgroundColor: Colors.bg.card,
  },
  chipText: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.secondary,
  },
  breathingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.card,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Colors.accent.lavender,
    padding: 16,
    marginBottom: Theme.spacing.xl,
    overflow: 'hidden',
    gap: 12,
  },
  breathingEmoji: { fontSize: 28 },
  breathingInfo: { flex: 1 },
  breathingTitle: {
    fontSize: Theme.fontSize.md,
    fontFamily: Theme.fontFamily.bodySemiBold,
    color: Colors.text.primary,
  },
  breathingDesc: {
    fontSize: Theme.fontSize.xs,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  breathingArrow: {
    fontSize: 20,
    color: Colors.accent.lavender,
  },
  settingsList: {
    backgroundColor: Colors.bg.card,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    marginBottom: Theme.spacing.xl,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
    gap: 12,
  },
  settingsEmoji: { fontSize: 18 },
  settingsLabel: {
    flex: 1,
    fontSize: Theme.fontSize.md,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.primary,
  },
  settingsArrow: {
    fontSize: 20,
    color: Colors.text.muted,
  },
  signOut: {
    backgroundColor: '#e50808',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  signOutText: {
    color: 'white',
    fontFamily: Theme.fontFamily.bodySemiBold,
    fontSize: Theme.fontSize.md,
  },
});