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
import { useAuth } from '@/context/auth';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();

  async function handleRegister() {
    if (!email || !password || !confirm) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error: err } = await signUp(email.trim(), password);
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
          <View style={styles.header}>
            <Text style={styles.logo}>moodify</Text>
            <Text style={styles.tagline}>your emotional sanctuary</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Begin your journey to emotional wellness</Text>

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
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={Colors.text.muted}
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <GradientButton
              label="Create Account"
              onPress={handleRegister}
              loading={loading}
              style={styles.btn}
            />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              style={styles.link}
            >
              <Text style={styles.linkText}>
                Already have an account?{' '}
                <Text style={styles.linkAccent}>Sign in</Text>
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
  btn: { marginTop: Theme.spacing.sm },
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
