import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StepIndicator } from '@/components/onboarding/StepIndicator';
import { GradientButton } from '@/components/ui/GradientButton';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

export default function StepOne() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  async function handleNext() {
    if (!name.trim()) {
      setError('Please tell us your name');
      return;
    }
    await AsyncStorage.setItem('moodify_name', name.trim());
    router.push('/(onboarding)/step-two');
  }

  return (
    <LinearGradient colors={['#0D0F1A', '#1A1040', '#0D0F1A']} style={styles.bg}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.inner}>
          <StepIndicator total={3} current={0} />

          <View style={styles.content}>
            {/* Decorative glow */}
            <View style={styles.glow} />

            <Text style={styles.emoji}>🌙</Text>
            <Text style={styles.title}>What shall we{'\n'}call you?</Text>
            <Text style={styles.subtitle}>
              This is your private space. No judgment, only care.
            </Text>

            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="Your name or nickname"
              placeholderTextColor={Colors.text.muted}
              value={name}
              onChangeText={(t) => {
                setName(t);
                setError('');
              }}
              autoFocus
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={handleNext}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>

          <GradientButton label="Continue →" onPress={handleNext} />
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { flex: 1 },
  inner: {
    flex: 1,
    padding: Theme.spacing.xl,
    paddingTop: 80,
    justifyContent: 'space-between',
    paddingBottom: 48,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: Colors.accent.lavender,
    opacity: 0.06,
    top: -40,
    right: -60,
  },
  emoji: {
    fontSize: 48,
    marginBottom: Theme.spacing.lg,
  },
  title: {
    fontSize: Theme.fontSize.display,
    fontFamily: Theme.fontFamily.display,
    color: Colors.text.primary,
    lineHeight: 44,
    marginBottom: Theme.spacing.md,
  },
  subtitle: {
    fontSize: Theme.fontSize.md,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.secondary,
    lineHeight: 24,
    marginBottom: Theme.spacing.xl,
  },
  input: {
    backgroundColor: Colors.bg.card,
    borderRadius: Theme.radius.md,
    paddingHorizontal: 20,
    paddingVertical: 16,
    color: Colors.text.primary,
    fontFamily: Theme.fontFamily.bodySemiBold,
    fontSize: Theme.fontSize.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  inputError: {
    borderColor: Colors.accent.rose,
  },
  error: {
    color: Colors.accent.rose,
    fontFamily: Theme.fontFamily.body,
    fontSize: Theme.fontSize.sm,
    marginTop: 8,
  },
});
