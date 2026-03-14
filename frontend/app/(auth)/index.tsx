import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { GradientButton } from '@/components/ui/GradientButton';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

export default function AuthWelcomeScreen() {
  return (
    <LinearGradient colors={['#0D0F1A', '#1E1B4B', '#0D0F1A']} style={styles.bg}>
      {/* Ambient orbs */}
      <View style={[styles.orb, styles.orbTop]} />
      <View style={[styles.orb, styles.orbBottom]} />

      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <Text style={styles.logo}>moodify</Text>
          <Text style={styles.tagline}>your emotional sanctuary</Text>
        </View>

        {/* Mood emoji chips */}
        <View style={styles.moodRow}>
          {['🌿', '🌙', '✨', '🎵', '🌸'].map((emoji, i) => (
            <View key={i} style={styles.moodChip}>
              <Text style={styles.moodEmoji}>{emoji}</Text>
            </View>
          ))}
        </View>

        {/* Description */}
        <View style={styles.descSection}>
          <Text style={styles.descTitle}>Music that feels like you</Text>
          <Text style={styles.descBody}>
            Journal your emotions and let Moodify find the perfect therapeutic soundscape for your state of mind.
          </Text>
        </View>

        {/* CTAs */}
        <View style={styles.actions}>
          <GradientButton
            label="Create an account"
            onPress={() => router.push('/(auth)/register')}
          />
          <GradientButton
            label="I already have an account"
            onPress={() => router.push('/(auth)/login')}
            colors={['rgba(167,139,250,0.12)', 'rgba(167,139,250,0.04)']}
            style={styles.ghostBtn}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  orb: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: Colors.accent.lavenderDim,
    opacity: 0.07,
  },
  orbTop: { top: -80, right: -60 },
  orbBottom: { bottom: -100, left: -80 },
  container: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
    justifyContent: 'center',
    gap: Theme.spacing.xl,
  },
  logoSection: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 52,
    fontFamily: Theme.fontFamily.display,
    color: Colors.text.primary,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.body,
    color: Colors.accent.lavender,
    marginTop: 6,
    letterSpacing: 1.5,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Theme.spacing.sm,
  },
  moodChip: {
    width: 48,
    height: 48,
    borderRadius: Theme.radius.md,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmoji: {
    fontSize: 22,
  },
  descSection: {
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  descTitle: {
    fontSize: Theme.fontSize.xl,
    fontFamily: Theme.fontFamily.display,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  descBody: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    gap: Theme.spacing.sm,
  },
  ghostBtn: {
    borderWidth: 1,
    borderColor: Colors.border.glow,
    borderRadius: Theme.radius.full,
    overflow: 'hidden',
  },
});
