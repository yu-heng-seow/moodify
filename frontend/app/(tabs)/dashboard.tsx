import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodOrb } from '@/components/ui/MoodOrb';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { Emotions, Emotion } from '@/constants/emotions';
import { getTrackById } from '@/constants/tracks';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardScreen() {
  const [name, setName] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [recommendation, setRecommendation] = useState<{
    message: string;
    trackId: string;
  } | null>(null);
  const [loadingRec, setLoadingRec] = useState(false);
  const [audioPref, setAudioPref] = useState('ambient');

  useEffect(() => {
    async function load() {
      const n = await AsyncStorage.getItem('moodify_name');
      const pref = await AsyncStorage.getItem('moodify_audio_pref');
      if (n) setName(n);
      if (pref) setAudioPref(pref);
    }
    load();
  }, []);

  const handleEmotionSelect = useCallback(async (emotion: Emotion) => {
    setSelectedEmotion(emotion);
    setRecommendation(null);
    setLoadingRec(true);

    // TODO: replace with real Claude call when backend is ready
    // const result = await getAIRecommendation({ ... });
    setTimeout(() => {
      const mockRecs: Record<string, { message: string; trackId: string }> = {
        anxious:     { message: `Breathe, ${name || 'friend'}. This soundscape was made for moments like this.`, trackId: '1' },
        sad:         { message: `It's okay to feel this. Let this carry you gently.`, trackId: '2' },
        angry:       { message: `Let the sound absorb what words can't hold right now.`, trackId: '3' },
        happy:       { message: `Beautiful. Let's keep that warmth alive.`, trackId: '4' },
        numb:        { message: `You don't have to feel anything right now. Just listen.`, trackId: '5' },
        overwhelmed: { message: `One breath at a time. This will help ground you.`, trackId: '6' },
        lonely:      { message: `You're not alone in this moment. Let this be with you.`, trackId: '7' },
        calm:        { message: `Stay in this feeling. This will help you hold it.`, trackId: '4' },
        grieving:    { message: `Grief deserves space. This is yours.`, trackId: '8' },
        panic:       { message: `You're safe. Focus on the sound. Breathe slowly.`, trackId: '6' },
      };
      const rec = mockRecs[emotion.id] ?? { message: `Here's something for you right now.`, trackId: '1' };
      setRecommendation(rec);
      setLoadingRec(false);
    }, 1200);
  }, [name, audioPref]);

  function handleListenNow() {
    if (!recommendation) return;
    const track = getTrackById(recommendation.trackId);
    if (track) {
      router.push({
        pathname: '/(tabs)/player',
        params: { trackId: track.id },
      });
    }
  }

  return (
    <LinearGradient colors={['#0D0F1A', '#11122A', '#0D0F1A']} style={styles.bg}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>moodify</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/library')}>
            <Text style={styles.headerIcon}>🎵</Text>
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greetingBlock}>
          <Text style={styles.greeting}>
            {getGreeting()}{name ? `, ${name}` : ''}.
          </Text>
          <Text style={styles.prompt}>How are you feeling right now?</Text>
        </View>

        {/* Orb */}
        <View style={styles.orbContainer}>
          <MoodOrb
            color={selectedEmotion?.color ?? Colors.accent.lavender}
            gradientColors={
              selectedEmotion?.gradientColors ?? Colors.gradients.lavender
            }
            size={160}
          />
          {selectedEmotion && (
            <View style={styles.emotionLabel}>
              <Text style={styles.emotionEmoji}>{selectedEmotion.emoji}</Text>
              <Text style={styles.emotionName}>{selectedEmotion.label}</Text>
            </View>
          )}
        </View>

        {/* Emotion grid */}
        <Text style={styles.sectionLabel}>Select your emotion</Text>
        <View style={styles.emotionGrid}>
          {Emotions.map((e) => {
            const isSelected = selectedEmotion?.id === e.id;
            return (
              <TouchableOpacity
                key={e.id}
                onPress={() => handleEmotionSelect(e)}
                activeOpacity={0.75}
                style={[styles.emotionChip, isSelected && { borderColor: e.color }]}
              >
                {isSelected && (
                  <LinearGradient
                    colors={[e.color + '33', e.color + '11']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                )}
                <Text style={styles.chipEmoji}>{e.emoji}</Text>
                <Text style={[styles.chipText, isSelected && { color: Colors.text.primary }]}>
                  {e.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* AI Recommendation */}
        {(loadingRec || recommendation) && (
          <GlassCard style={styles.recCard}>
            {loadingRec ? (
              <View style={styles.recLoading}>
                <ActivityIndicator color={Colors.accent.lavender} />
                <Text style={styles.recLoadingText}>Finding your sound...</Text>
              </View>
            ) : recommendation ? (
              <>
                <Text style={styles.recEmoji}>✨</Text>
                <Text style={styles.recMessage}>{recommendation.message}</Text>
                <GradientButton
                  label="Listen Now"
                  onPress={handleListenNow}
                  style={styles.recBtn}
                />
              </>
            ) : null}
          </GlassCard>
        )}

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/(tabs)/library')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(167,139,250,0.15)', 'rgba(167,139,250,0.03)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Text style={styles.quickEmoji}>🎵</Text>
            <Text style={styles.quickLabel}>Browse Library</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/(tabs)/player')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(110,231,183,0.15)', 'rgba(110,231,183,0.03)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Text style={styles.quickEmoji}>🎧</Text>
            <Text style={styles.quickLabel}>Now Playing</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  scroll: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  logo: {
    fontSize: 26,
    fontFamily: Theme.fontFamily.display,
    color: Colors.text.primary,
    letterSpacing: 1,
  },
  headerIcon: { fontSize: 22 },
  greetingBlock: { marginBottom: Theme.spacing.xl },
  greeting: {
    fontSize: Theme.fontSize.xxl,
    fontFamily: Theme.fontFamily.display,
    color: Colors.text.primary,
    lineHeight: 36,
  },
  prompt: {
    fontSize: Theme.fontSize.md,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  orbContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  emotionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Theme.spacing.md,
  },
  emotionEmoji: { fontSize: 20 },
  emotionName: {
    fontSize: Theme.fontSize.lg,
    fontFamily: Theme.fontFamily.display,
    color: Colors.text.primary,
  },
  sectionLabel: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.bodySemiBold,
    color: Colors.text.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Theme.spacing.md,
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: Theme.spacing.xl,
    justifyContent: 'center',
  },
  
  emotionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    backgroundColor: Colors.bg.card,
    overflow: 'hidden',
  },
  chipEmoji: { fontSize: 14 },
  chipText: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.secondary,
  },
  recCard: {
    marginBottom: Theme.spacing.xl,
  },
  recLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recLoadingText: {
    color: Colors.text.secondary,
    fontFamily: Theme.fontFamily.body,
    fontSize: Theme.fontSize.sm,
  },
  recEmoji: { fontSize: 28, marginBottom: 8 },
  recMessage: {
    color: Colors.text.primary,
    fontFamily: Theme.fontFamily.body,
    fontSize: Theme.fontSize.md,
    lineHeight: 24,
    marginBottom: Theme.spacing.lg,
  },
  recBtn: {},
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickCard: {
    flex: 1,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    backgroundColor: Colors.bg.card,
    overflow: 'hidden',
    alignItems: 'center',
    gap: 8,
  },
  quickEmoji: { fontSize: 28 },
  quickLabel: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.bodySemiBold,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
