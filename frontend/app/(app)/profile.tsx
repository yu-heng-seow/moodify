import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth';
import { Avatar } from '@/components/ui/Avatar';

export default function ProfileScreen() {
  const { profile, user, signOut } = useAuth();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    updateStreak();
  }, []);

  async function updateStreak() {
    const today = new Date().toDateString();
    const lastOpen = await AsyncStorage.getItem('moodify_last_open');
    const currentStreak = parseInt(await AsyncStorage.getItem('moodify_streak') ?? '0');

    if (!lastOpen) {
      await AsyncStorage.setItem('moodify_last_open', today);
      await AsyncStorage.setItem('moodify_streak', '1');
      setStreak(1);
      return;
    }

    const last = new Date(lastOpen);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      setStreak(currentStreak);
    } else if (diffDays === 1) {
      const newStreak = currentStreak + 1;
      await AsyncStorage.setItem('moodify_streak', String(newStreak));
      await AsyncStorage.setItem('moodify_last_open', today);
      setStreak(newStreak);
    } else {
      await AsyncStorage.setItem('moodify_streak', '1');
      await AsyncStorage.setItem('moodify_last_open', today);
      setStreak(1);
    }
  }

  async function handleSignOut() {
    await signOut();
  }

  return (
    <LinearGradient colors={['#0D0F1A', '#11122A', '#0D0F1A']} style={styles.bg}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <Avatar size={88} uri={profile?.avatarS3Key ?? null} />
          <Text style={styles.name}>{profile?.displayName ?? 'Your name'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.joined}>Healing since March 2025</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Saved tracks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{streak}</Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </View>
        </View>

        {/* Mood history */}
        <Text style={styles.sectionTitle}>Recent moods</Text>
        <View style={styles.moodRow}>
          {['😰', '🌧️', '🔥', '🌿', '✨'].map((emoji, i) => (
            <View key={i} style={styles.moodChip}>
              <Text style={styles.moodEmoji}>{emoji}</Text>
            </View>
          ))}
        </View>

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