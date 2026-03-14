import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { GradientButton } from '@/components/ui/GradientButton';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/context/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  async function handleLogin() {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    const { error: err } = await signIn(email.trim(), password);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    // Stack.Protected auto-navigates on session change
  }

  return (
    <LinearGradient colors={['#0D0F1A', '#1E1B4B', '#0D0F1A']} style={styles.bg}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>moodify</Text>
            <Text style={styles.tagline}>your emotional sanctuary</Text>
          </View>

          {/* Glow orb decoration */}
          <View style={styles.orbDecor} />

          {/* Form card */}
          <View style={styles.card}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to continue your journey</Text>

            <View style={styles.fields}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={Colors.text.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.text.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <GradientButton
              label="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.btn}
            />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              style={styles.link}
            >
              <Text style={styles.linkText}>
                New here?{' '}
                <Text style={styles.linkAccent}>Create an account</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  logo: {
    fontSize: 42,
    fontFamily: Theme.fontFamily.display,
    color: Colors.text.primary,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.body,
    color: Colors.accent.lavender,
    marginTop: 4,
    letterSpacing: 1,
  },
  orbDecor: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.accent.lavenderDim,
    opacity: 0.06,
    top: 60,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: Colors.bg.card,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  title: {
    fontSize: Theme.fontSize.xxl,
    fontFamily: Theme.fontFamily.display,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.secondary,
    marginBottom: Theme.spacing.xl,
  },
  fields: {
    gap: 12,
    marginBottom: Theme.spacing.md,
  },
  input: {
    backgroundColor: Colors.bg.elevated,
    borderRadius: Theme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.text.primary,
    fontFamily: Theme.fontFamily.body,
    fontSize: Theme.fontSize.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  error: {
    color: Colors.accent.rose,
    fontFamily: Theme.fontFamily.body,
    fontSize: Theme.fontSize.sm,
    marginBottom: Theme.spacing.sm,
  },
  btn: {
    marginTop: Theme.spacing.sm,
  },
  link: {
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
  },
  linkText: {
    color: Colors.text.secondary,
    fontFamily: Theme.fontFamily.body,
    fontSize: Theme.fontSize.sm,
  },
  linkAccent: {
    color: Colors.accent.lavender,
    fontFamily: Theme.fontFamily.bodySemiBold,
  },
});
