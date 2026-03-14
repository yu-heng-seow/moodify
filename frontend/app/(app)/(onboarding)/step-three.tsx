import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StepIndicator } from '@/components/onboarding/StepIndicator';
import { GradientButton } from '@/components/ui/GradientButton';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { useNotifications } from '@/hooks/use-notifications';
import { useAuth } from '@/context/auth';

const AUDIO_PREFS = [
  { id: 'nature', label: 'Nature sounds', emoji: '🌿', desc: 'Rain, ocean, forest' },
  { id: 'ambient', label: 'Ambient music', emoji: '🌌', desc: 'Drones, pads, textures' },
  { id: 'classical', label: 'Classical', emoji: '🎻', desc: 'Strings, piano, orchestral' },
  { id: 'binaural', label: 'Binaural beats', emoji: '🧠', desc: 'Theta, delta, alpha waves' },
  { id: 'meditation', label: 'Guided meditation', emoji: '🧘', desc: 'Voice-guided sessions' },
];

export default function StepThree() {
  const [selected, setSelected] = useState<string>('');
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { scheduleDailyCheckIn } = useNotifications();
  const { completeOnboarding } = useAuth();

  async function handleFinish() {
    if (!selected) {
      setError('Choose your preferred audio style');
      return;
    }
    setLoading(true);

    if (notifEnabled) {
      await scheduleDailyCheckIn(20, 0); // 8 PM daily check-in
    }

    const [nameRaw, contextRaw] = await Promise.all([
      AsyncStorage.getItem('moodify_name'),
      AsyncStorage.getItem('moodify_context'),
    ]);

    const therapyGoals: string[] = contextRaw ? JSON.parse(contextRaw) : [];

    const { error: err } = await completeOnboarding({
      displayName: nameRaw ?? '',
      preferredGenres: [selected],
      therapyGoals,
    });

    setLoading(false);

    if (err) {
      setError('Something went wrong. Please try again.');
    }
    // Stack.Protected auto-navigates when onboardingComplete becomes true
  }

  return (
    <LinearGradient colors={['#0D0F1A', '#1A1B0F', '#0D0F1A']} style={styles.bg}>
      <View style={styles.container}>
        <View style={styles.top}>
          <StepIndicator total={3} current={2} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.glow} />
          <Text style={styles.emoji}>🎵</Text>
          <Text style={styles.title}>How do you like{'\n'}to listen?</Text>
          <Text style={styles.subtitle}>
            We&apos;ll use this to personalise every recommendation for you.
          </Text>

          <View style={styles.options}>
            {AUDIO_PREFS.map((pref) => {
              const isSelected = selected === pref.id;
              return (
                <TouchableOpacity
                  key={pref.id}
                  onPress={() => {
                    setSelected(pref.id);
                    setError('');
                  }}
                  activeOpacity={0.8}
                  style={[styles.option, isSelected && styles.optionSelected]}
                >
                  {isSelected && (
                    <LinearGradient
                      colors={Colors.gradients.sage}
                      style={[StyleSheet.absoluteFill, { borderRadius: Theme.radius.lg }]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  )}
                  <Text style={styles.optEmoji}>{pref.emoji}</Text>
                  <View style={styles.optText}>
                    <Text style={[styles.optLabel, isSelected && styles.optLabelSelected]}>
                      {pref.label}
                    </Text>
                    <Text style={styles.optDesc}>{pref.desc}</Text>
                  </View>
                  {isSelected && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Notification toggle — native only */}
          {Platform.OS !== 'web' && (
            <TouchableOpacity
              onPress={() => setNotifEnabled(!notifEnabled)}
              style={[styles.notifCard, notifEnabled && styles.notifCardOn]}
              activeOpacity={0.8}
            >
              <Text style={styles.notifEmoji}>🔔</Text>
              <View style={styles.notifText}>
                <Text style={styles.notifTitle}>Daily check-in reminder</Text>
                <Text style={styles.notifSub}>A gentle nudge at 8 PM each evening</Text>
              </View>
              <View style={[styles.toggle, notifEnabled && styles.toggleOn]}>
                <View style={[styles.toggleDot, notifEnabled && styles.toggleDotOn]} />
              </View>
            </TouchableOpacity>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <GradientButton
            label="Enter Moodify ✨"
            onPress={handleFinish}
            loading={loading}
            colors={Colors.gradients.sage}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { flex: 1, paddingTop: 60 },
  top: { paddingHorizontal: Theme.spacing.xl, marginBottom: Theme.spacing.lg },
  scroll: {
    paddingHorizontal: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xl,
  },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: Colors.accent.sage,
    opacity: 0.05,
    top: -20,
    right: -40,
  },
  emoji: { fontSize: 44, marginBottom: Theme.spacing.md },
  title: {
    fontSize: Theme.fontSize.xxl,
    fontFamily: Theme.fontFamily.display,
    color: Colors.text.primary,
    lineHeight: 38,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: Theme.spacing.xl,
  },
  options: { gap: 10, marginBottom: Theme.spacing.xl },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    backgroundColor: Colors.bg.card,
    gap: 12,
    overflow: 'hidden',
  },
  optionSelected: {
    borderColor: Colors.accent.sage,
  },
  optEmoji: { fontSize: 24 },
  optText: { flex: 1 },
  optLabel: {
    fontSize: Theme.fontSize.md,
    fontFamily: Theme.fontFamily.bodySemiBold,
    color: Colors.text.secondary,
  },
  optLabelSelected: { color: Colors.text.primary },
  optDesc: {
    fontSize: Theme.fontSize.xs,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.muted,
    marginTop: 2,
  },
  check: { fontSize: 18, color: Colors.bg.primary },
  error: {
    color: Colors.accent.rose,
    fontFamily: Theme.fontFamily.body,
    fontSize: Theme.fontSize.sm,
    marginBottom: Theme.spacing.md,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    backgroundColor: Colors.bg.card,
    gap: 12,
  },
  notifCardOn: { borderColor: Colors.accent.amber },
  notifEmoji: { fontSize: 22 },
  notifText: { flex: 1 },
  notifTitle: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.bodySemiBold,
    color: Colors.text.primary,
  },
  notifSub: {
    fontSize: Theme.fontSize.xs,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.muted,
    marginTop: 2,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.bg.elevated,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleOn: { backgroundColor: Colors.accent.amber },
  toggleDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.text.muted,
  },
  toggleDotOn: {
    backgroundColor: Colors.bg.primary,
    alignSelf: 'flex-end',
  },
  footer: { padding: Theme.spacing.xl, paddingBottom: 48 },
});
