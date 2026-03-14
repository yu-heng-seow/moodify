import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

const PHASES = [
  { label: 'Inhale', duration: 4000, scale: 1.4 },
  { label: 'Hold', duration: 4000, scale: 1.4 },
  { label: 'Exhale', duration: 6000, scale: 1.0 },
  { label: 'Hold', duration: 2000, scale: 1.0 },
];

export default function BreathingScreen() {
  const insets = useSafeAreaInsets();
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(PHASES[0].duration / 1000);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.4)).current;
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);  
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!running) {
      animRef.current?.stop();
      if (intervalRef.current) clearInterval(intervalRef.current);
      scaleAnim.setValue(1);
      opacityAnim.setValue(0.4);
      setPhaseIndex(0);
      setCountdown(PHASES[0].duration / 1000);
      return;
    }
    runPhase(0);
  }, [running]);

  function runPhase(index: number) {
    const phase = PHASES[index];
    setPhaseIndex(index);
    setCountdown(phase.duration / 1000);

    animRef.current = Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: phase.scale,
        duration: phase.duration,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: phase.scale > 1 ? 0.8 : 0.4,
        duration: phase.duration,
        useNativeDriver: true,
      }),
    ]);
    animRef.current.start(({ finished }) => {
      if (finished) runPhase((index + 1) % PHASES.length);
    });

    let secs = phase.duration / 1000;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      secs -= 1;
      setCountdown(secs);
      if (secs <= 0) clearInterval(intervalRef.current!);
    }, 1000);
  }

  const phase = PHASES[phaseIndex];

  return (
    <LinearGradient colors={['#0D0F1A', '#0F1628', '#0D0F1A']} style={styles.bg}>
      <View style={[styles.container, { paddingTop: insets.top + 10 }]}>

        {/* Back */}
        <TouchableOpacity onPress={() => { setRunning(false); router.back(); }} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Breathing</Text>
        <Text style={styles.subtitle}>Follow the circle to calm your nervous system</Text>

        {/* Breathing orb */}
        <View style={styles.orbWrapper}>
          <Animated.View
            style={[
              styles.orbOuter,
              { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
            ]}
          />
          <View style={styles.orbInner}>
            <Text style={styles.phaseLabel}>{running ? phase.label : 'Ready'}</Text>
            {running && (
              <Text style={styles.countdown}>{countdown}</Text>
            )}
          </View>
        </View>

        {/* Phase indicators */}
        <View style={styles.phases}>
          {PHASES.map((p, i) => (
            <View key={i} style={styles.phaseItem}>
              <View style={[styles.phaseDot, running && i === phaseIndex && styles.phaseDotActive]} />
              <Text style={[styles.phaseText, running && i === phaseIndex && styles.phaseTextActive]}>
                {p.label}
              </Text>
              <Text style={styles.phaseSecs}>{p.duration / 1000}s</Text>
            </View>
          ))}
        </View>

        {/* Start / Stop */}
        <TouchableOpacity
          style={styles.btn}
          activeOpacity={0.85}
          onPress={() => setRunning((r) => !r)}
        >
          <LinearGradient
            colors={running ? ['#374151', '#1F2937'] : Colors.gradients.lavender}
            style={styles.btnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.btnText}>{running ? 'Stop' : 'Start breathing'}</Text>
          </LinearGradient>
        </TouchableOpacity>

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: 0,
    paddingBottom: 48,
    alignItems: 'center',
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: Theme.spacing.lg,
  },
  backText: {
    color: Colors.text.secondary,
    fontFamily: Theme.fontFamily.body,
    fontSize: Theme.fontSize.md,
  },
  title: {
    fontSize: Theme.fontSize.display,
    fontFamily: Theme.fontFamily.display,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  orbWrapper: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.xl,
  },
  orbOuter: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.accent.lavender,
  },
  orbInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(167,139,250,0.15)',
    borderWidth: 1.5,
    borderColor: Colors.accent.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  phaseLabel: {
    color: Colors.text.primary,
    fontFamily: Theme.fontFamily.display,
    fontSize: Theme.fontSize.lg,
  },
  countdown: {
    color: Colors.accent.lavender,
    fontFamily: Theme.fontFamily.bodySemiBold,
    fontSize: Theme.fontSize.xxl,
  },
  phases: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: Theme.spacing.xl,
  },
  phaseItem: {
    alignItems: 'center',
    gap: 4,
  },
  phaseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border.subtle,
  },
  phaseDotActive: {
    backgroundColor: Colors.accent.lavender,
  },
  phaseText: {
    fontSize: Theme.fontSize.xs,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.muted,
  },
  phaseTextActive: {
    color: Colors.text.primary,
    fontFamily: Theme.fontFamily.bodySemiBold,
  },
  phaseSecs: {
    fontSize: 10,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.muted,
  },
  btn: {
    width: '100%',
    borderRadius: Theme.radius.full,
    overflow: 'hidden',
  },
  btnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnText: {
    color: Colors.text.primary,
    fontFamily: Theme.fontFamily.bodySemiBold,
    fontSize: Theme.fontSize.md,
  },
});