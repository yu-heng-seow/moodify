import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

export default function FeedbackScreen() {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <LinearGradient colors={['#0D0F1A', '#11122A', '#0D0F1A']} style={styles.bg}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Feedback</Text>
          <View style={styles.headerSpacer} />
        </View>

        {!submitted ? (
          <>
            <Text style={styles.title}>Share your thoughts</Text>
            <Text style={styles.subtitle}>We read every single message 🙏</Text>

            <TextInput
              style={styles.input}
              placeholder="Tell us what you think..."
              placeholderTextColor={Colors.text.muted}
              value={text}
              onChangeText={setText}
              multiline
              numberOfLines={5}
            />

            <TouchableOpacity
              style={[styles.btn, !text.trim() && styles.btnDisabled]}
              activeOpacity={0.85}
              disabled={!text.trim()}
              onPress={() => setSubmitted(true)}
            >
              <Text style={styles.btnText}>Submit feedback</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.responseContainer}>
            <Image
            source={{ uri: 'https://media.tenor.com/bGw3crwMKXIAAAAe/blocked-steph-curry.png' }}
            style={styles.responseImage}
            />
            <Text style={styles.responseTitle}>feedback deleted</Text>
            <Text style={styles.responseSub}>nobody asked bro 💀</Text>
            <TouchableOpacity
              style={styles.btn}
              activeOpacity={0.85}
              onPress={() => router.back()}
            >
              <Text style={styles.btnText}>ok bye</Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
    responseImage: {
    width: 200,
    height: 230,
    borderRadius: 12,
    },
  container: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.xl,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: Theme.fontSize.lg,
    color: Colors.text.primary,
  },
  headerTitle: {
    fontSize: Theme.fontSize.lg,
    fontFamily: Theme.fontFamily.display,
    color: Colors.text.primary,
  },
  headerSpacer: { width: 40 },
  title: {
    fontSize: Theme.fontSize.xxl,
    fontFamily: Theme.fontFamily.display,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Theme.fontSize.md,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.secondary,
    marginBottom: Theme.spacing.xl,
  },
  input: {
    backgroundColor: Colors.bg.card,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: 16,
    color: Colors.text.primary,
    fontFamily: Theme.fontFamily.body,
    fontSize: Theme.fontSize.md,
    minHeight: 140,
    textAlignVertical: 'top',
    marginBottom: Theme.spacing.lg,
  },
  btn: {
    backgroundColor: Colors.accent.lavender,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
    borderRadius: Theme.radius.full,
    marginTop: Theme.spacing.md,
    },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    color: 'white',
    fontFamily: Theme.fontFamily.bodySemiBold,
    fontSize: Theme.fontSize.md,
  },
  responseContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  responseEmoji: { fontSize: 72 },
  responseTitle: {
    fontSize: Theme.fontSize.xxl,
    fontFamily: Theme.fontFamily.display,
    color: Colors.text.primary,
  },
  responseSub: {
    fontSize: Theme.fontSize.md,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.muted,
    marginBottom: Theme.spacing.xl,
  },
  
});