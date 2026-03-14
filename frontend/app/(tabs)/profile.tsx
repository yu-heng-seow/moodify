import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const [name, setName] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('moodify_name').then((val) => {
      if (val) setName(val);
    });
  }, []);

  return (
    <LinearGradient colors={['#0D0F1A', '#11122A', '#0D0F1A']} style={styles.bg}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>🧘</Text>
          </View>
          <Text style={styles.name}>{name ? name : 'Your name'}</Text>
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
            <Text style={styles.statNumber}>5</Text>
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
          onPress={() => router.push('/login')}
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
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarEmoji: { fontSize: 40 },
  name: {
    fontSize: Theme.fontSize.xxl,
    fontFamily: Theme.fontFamily.display,
    color: Colors.text.primary,
  },
  joined: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.muted,
    marginTop: 4,
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