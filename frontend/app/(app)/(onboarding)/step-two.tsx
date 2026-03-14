import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StepIndicator } from '@/components/onboarding/StepIndicator';
import { GradientButton } from '@/components/ui/GradientButton';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

const OPTIONS = [
  { id: 'stress', label: 'Stress & anxiety', emoji: '🌀' },
  { id: 'grief', label: 'Grief or loss', emoji: '🕊️' },
  { id: 'depression', label: 'Low mood or depression', emoji: '🌧️' },
  { id: 'anger', label: 'Anger', emoji: '🔥' },
  { id: 'trauma', label: 'Trauma recovery', emoji: '🌱' },
  { id: 'sleep', label: 'Sleep issues', emoji: '🌙' },
  { id: 'general', label: 'General Wellness', emoji: '✨' },
  { id: 'unsure', label: 'Not sure yet', emoji: '🌫️' },
];

export default function StepTwo() {
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');

  function toggle(id: string) {
    setError('');
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleNext() {
    if (selected.length === 0) {
      setError('Pick at least one that resonates');
      return;
    }
    await AsyncStorage.setItem('moodify_context', JSON.stringify(selected));
    router.push('/(app)/(onboarding)/step-three');
  }

  return (
    <LinearGradient colors={['#0D0F1A', '#0F1A2E', '#0D0F1A']} style={styles.bg}>
      <View style={styles.container}>
        <View style={styles.top}>
          <StepIndicator total={3} current={1} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.glow} />
          <Text style={styles.emoji}>💙</Text>
          <Text style={styles.title}>What are you{'\n'}navigating?</Text>
          <Text style={styles.subtitle}>
            Select all that feel true right now. You can always change this later.
          </Text>

          <View style={styles.grid}>
            {OPTIONS.map((opt) => {
              const isSelected = selected.includes(opt.id);
              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => toggle(opt.id)}
                  activeOpacity={0.75}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                >
                  <LinearGradient
                    colors={
                      isSelected
                        ? Colors.gradients.lavender
                        : ['transparent', 'transparent']
                    }
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <Text style={styles.chipEmoji}>{opt.emoji}</Text>
                  <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>

        <View style={styles.footer}>
          <GradientButton label="Continue →" onPress={handleNext} />
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
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.accent.blue,
    opacity: 0.05,
    top: 0,
    left: -40,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',  
  },
  chip: {
    borderRadius: Theme.radius.full,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    overflow: 'hidden',
    backgroundColor: Colors.bg.card,
  },
  chipSelected: {
    borderColor: Colors.accent.lavender,
  },
  chipEmoji: { fontSize: 16 },
  chipLabel: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.secondary,
  },
  chipLabelSelected: {
    color: Colors.text.primary,
    fontFamily: Theme.fontFamily.bodySemiBold,
  },
  error: {
    color: Colors.accent.rose,
    fontFamily: Theme.fontFamily.body,
    fontSize: Theme.fontSize.sm,
    marginTop: Theme.spacing.md,
  },
  footer: {
    padding: Theme.spacing.xl,
    paddingBottom: 48,
  },
});
