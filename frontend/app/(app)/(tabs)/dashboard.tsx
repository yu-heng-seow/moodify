import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/context/auth";
import { getSignedUrl } from "@/lib/media";
import { MoodOrb } from "@/components/ui/MoodOrb";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/colors";
import { Theme } from "@/constants/theme";
import { Emotions, Emotion } from "@/constants/emotions";
import { getTrackById, Tracks } from "@/constants/tracks";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardScreen() {
  const { profile, user } = useAuth();
  const [name, setName] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [recommendation, setRecommendation] = useState<{
    message: string;
    trackId: string;
  } | null>(null);
  const [loadingRec, setLoadingRec] = useState(false);
  const [audioPref, setAudioPref] = useState("ambient");
  const [note, setNote] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [loadingReply, setLoadingReply] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const n = await AsyncStorage.getItem("moodify_name");
      const pref = await AsyncStorage.getItem("moodify_audio_pref");
      if (n) setName(n);
      if (pref) setAudioPref(pref);
    }
    load();
  }, []);

  useEffect(() => {
    if (profile?.avatarS3Key) {
      getSignedUrl(profile.avatarS3Key, 3600).then(setAvatarUrl);
    }
  }, [profile?.avatarS3Key]);

  const handleEmotionSelect = useCallback(
    async (emotion: Emotion) => {
      setSelectedEmotion(emotion);
      setRecommendation(null);
      setAiReply("");
      setNote("");
      setLoadingRec(true);

      setTimeout(() => {
        const mockRecs: Record<string, { message: string; trackId: string }> = {
          anxious: {
            message: `Breathe, ${name || "friend"}. This soundscape was made for moments like this.`,
            trackId: "1",
          },
          sad: {
            message: `It's okay to feel this. Let this carry you gently.`,
            trackId: "2",
          },
          angry: {
            message: `Let the sound absorb what words can't hold right now.`,
            trackId: "3",
          },
          happy: {
            message: `Beautiful. Let's keep that warmth alive.`,
            trackId: "4",
          },
          numb: {
            message: `You don't have to feel anything right now. Just listen.`,
            trackId: "5",
          },
          overwhelmed: {
            message: `One breath at a time. This will help ground you.`,
            trackId: "6",
          },
          lonely: {
            message: `You're not alone in this moment. Let this be with you.`,
            trackId: "7",
          },
          calm: {
            message: `Stay in this feeling. This will help you hold it.`,
            trackId: "4",
          },
          grieving: {
            message: `Grief deserves space. This is yours.`,
            trackId: "8",
          },
          panic: {
            message: `You're safe. Focus on the sound. Breathe slowly.`,
            trackId: "6",
          },
        };
        const rec = mockRecs[emotion.id] ?? {
          message: `Here's something for you right now.`,
          trackId: "1",
        };
        setRecommendation(rec);
        setLoadingRec(false);
      }, 1200);
    },
    [name, audioPref],
  );

  async function handleNoteSubmit() {
    if (!note.trim() || !selectedEmotion) return;
    setLoadingReply(true);
    setAiReply("");

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `You are a warm, empathetic companion in a healing audio app. 
The user is feeling "${selectedEmotion.label}" and shared this note: "${note}"
Respond with a short, genuinely supportive message (2-3 sentences max). 
Be human, warm, and grounding. Do not suggest professional help. No lists, no headers.`,
            },
          ],
        }),
      });
      const data = await response.json();
      const text = data.content?.[0]?.text ?? "";
      setAiReply(text);
    } catch {
      setAiReply(
        "I hear you. Whatever you're carrying right now, you don't have to carry it alone.",
      );
    } finally {
      setLoadingReply(false);
    }
  }

  async function handleListenNow() {
    if (!recommendation || !selectedEmotion || !user) return;
    const track = getTrackById(recommendation.trackId);
    if (!track) return;

    const { data, error } = await supabase.from('journal_entries').insert({
      user_id: user.id,
      emotion: selectedEmotion.id,
      note: note.trim() || null,
      recommended_track_id: track.id,
    });

    if (error) {
      console.error("Error saving journal entry:", error);
      return;
    }

    console.log("Journal entry saved:", data);

    router.push({
      pathname: "/(app)/(tabs)/player",
      params: { trackId: track.id },
    });
  }

  return (
    <LinearGradient
      colors={["#0D0F1A", "#11122A", "#0D0F1A"]}
      style={styles.bg}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>moodify</Text>
          <Avatar
            size={36}
            uri={avatarUrl}
            onPress={() => router.push("/(app)/profile")}
          />
        </View>

        {/* Greeting */}
        <View style={styles.greetingBlock}>
          <Text style={styles.greeting}>
            {getGreeting()}
            {name ? `, ${name}` : ""}.
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
                style={[
                  styles.emotionChip,
                  isSelected && { borderColor: e.color },
                ]}
              >
                {isSelected && (
                  <LinearGradient
                    colors={[e.color + "33", e.color + "11"]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                )}
                <Text style={styles.chipEmoji}>{e.emoji}</Text>
                <Text
                  style={[
                    styles.chipText,
                    isSelected && { color: Colors.text.primary },
                  ]}
                >
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

                {/* Notes input */}
                <View style={styles.noteSection}>
                  <Text style={styles.noteLabel}>
                    What&apos;s behind this feeling?
                  </Text>
                  <TextInput
                    style={styles.noteInput}
                    placeholder="Tell me what's on your mind..."
                    placeholderTextColor={Colors.text.muted}
                    value={note}
                    onChangeText={setNote}
                    multiline
                    numberOfLines={3}
                  />
                  <TouchableOpacity
                    style={styles.noteBtn}
                    activeOpacity={0.85}
                    onPress={handleNoteSubmit}
                    disabled={!note.trim() || loadingReply}
                  >
                    <Text style={styles.noteBtnText}>
                      {loadingReply ? "Thinking..." : "Share with me →"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* AI reply */}
                {loadingReply && (
                  <View style={styles.replyLoading}>
                    <ActivityIndicator
                      color={Colors.accent.lavender}
                      size="small"
                    />
                  </View>
                )}
                {aiReply ? (
                  <View style={styles.aiReply}>
                    <Text style={styles.aiReplyEmoji}>🤍</Text>
                    <Text style={styles.aiReplyText}>{aiReply}</Text>
                  </View>
                ) : null}

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
            onPress={() => router.push("/(app)/(tabs)/library")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["rgba(167,139,250,0.15)", "rgba(167,139,250,0.03)"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Text style={styles.quickEmoji}>🎵</Text>
            <Text style={styles.quickLabel}>Browse Library</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push("/(app)/(tabs)/player")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["rgba(110,231,183,0.15)", "rgba(110,231,183,0.03)"]}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.xl,
  },
  logo: {
    fontSize: 26,
    fontFamily: Theme.fontFamily.display,
    color: Colors.text.primary,
    letterSpacing: 1,
  },
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
    alignItems: "center",
    marginBottom: Theme.spacing.lg,
  },
  emotionLabel: {
    flexDirection: "row",
    alignItems: "center",
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
    textTransform: "uppercase",
    marginBottom: Theme.spacing.md,
  },
  emotionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: Theme.spacing.xl,
    justifyContent: "center",
  },
  emotionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    backgroundColor: Colors.bg.card,
    overflow: "hidden",
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
    flexDirection: "row",
    alignItems: "center",
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
  noteSection: {
    marginBottom: Theme.spacing.md,
  },
  noteLabel: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.bodySemiBold,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  noteInput: {
    backgroundColor: Colors.bg.elevated,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: 12,
    color: Colors.text.primary,
    fontFamily: Theme.fontFamily.body,
    fontSize: Theme.fontSize.sm,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 10,
  },
  noteBtn: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: Colors.accent.lavender,
  },
  noteBtnText: {
    color: Colors.accent.lavender,
    fontFamily: Theme.fontFamily.bodySemiBold,
    fontSize: Theme.fontSize.sm,
  },
  replyLoading: {
    alignItems: "center",
    paddingVertical: 8,
  },
  aiReply: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: Colors.bg.elevated,
    borderRadius: Theme.radius.md,
    padding: 12,
    marginBottom: Theme.spacing.md,
    alignItems: "flex-start",
  },
  aiReplyEmoji: { fontSize: 16 },
  aiReplyText: {
    flex: 1,
    color: Colors.text.primary,
    fontFamily: Theme.fontFamily.body,
    fontSize: Theme.fontSize.sm,
    lineHeight: 20,
  },
  recBtn: { marginTop: Theme.spacing.sm },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  quickCard: {
    flex: 1,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    backgroundColor: Colors.bg.card,
    overflow: "hidden",
    alignItems: "center",
    gap: 8,
  },
  quickEmoji: { fontSize: 28 },
  quickLabel: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.bodySemiBold,
    color: Colors.text.secondary,
    textAlign: "center",
  },
});
