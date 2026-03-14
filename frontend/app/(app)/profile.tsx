import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth';
import { Avatar } from '@/components/ui/Avatar';
import { GradientButton } from '@/components/ui/GradientButton';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

export default function ProfileScreen() {
  const { profile, user, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
  }

  return (
    <LinearGradient colors={['#0D0F1A', '#11122A', '#0D0F1A']} style={styles.bg}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Avatar + name */}
        <View style={styles.avatarSection}>
          <Avatar size={80} uri={profile?.avatarS3Key ?? null} />
          <Text style={styles.displayName}>{profile?.displayName ?? 'Anonymous'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Preferred Genres */}
        {profile?.preferredGenres && profile.preferredGenres.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Preferred Genres</Text>
            <View style={styles.chips}>
              {profile.preferredGenres.map((genre) => (
                <View key={genre} style={styles.chip}>
                  <Text style={styles.chipText}>{genre}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Therapy Goals */}
        {profile?.therapyGoals && profile.therapyGoals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Therapy Goals</Text>
            <View style={styles.chips}>
              {profile.therapyGoals.map((goal) => (
                <View key={goal} style={styles.chip}>
                  <Text style={styles.chipText}>{goal}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Sign out */}
        <GradientButton
          label="Sign Out"
          onPress={handleSignOut}
          colors={['#FDA4AF', '#BE185D']}
          style={styles.signOutBtn}
        />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.xl,
  },
  backText: {
    fontSize: Theme.fontSize.md,
    fontFamily: Theme.fontFamily.body,
    color: Colors.accent.lavender,
  },
  title: {
    fontSize: Theme.fontSize.lg,
    fontFamily: Theme.fontFamily.display,
    color: Colors.text.primary,
  },
  headerSpacer: { width: 48 },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl * 1.5,
    gap: 8,
  },
  displayName: {
    fontSize: Theme.fontSize.xxl,
    fontFamily: Theme.fontFamily.display,
    color: Colors.text.primary,
    marginTop: Theme.spacing.sm,
  },
  email: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.secondary,
  },
  section: {
    marginBottom: Theme.spacing.xl,
  },
  sectionLabel: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.bodySemiBold,
    color: Colors.text.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Theme.spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    backgroundColor: Colors.bg.card,
  },
  chipText: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.secondary,
  },
  signOutBtn: {
    marginTop: Theme.spacing.lg,
  },
});
