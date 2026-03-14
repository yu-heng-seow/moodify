import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { Emotions } from '@/constants/emotions';
import { getRecommendations, Song } from '@/lib/api';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  // Load all songs on mount
  useEffect(() => {
    loadAllSongs();
  }, []);

  async function loadAllSongs() {
    setLoading(true);
    try {
      const songs = await getRecommendations();
      setAllSongs(songs);
      setResults(songs);
    } catch (err) {
      console.error('Failed to load songs:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(q?: string) {
    const searchQuery = q ?? query;
    if (q) setQuery(q);

    if (!searchQuery.trim()) {
      setResults(allSongs);
      return;
    }

    setSearching(true);
    try {
      const songs = await getRecommendations(searchQuery);
      setResults(songs);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  useEffect(() => {
    if (query === '') {
      setResults(allSongs);
    }
  }, [query, allSongs]);

  return (
    <LinearGradient colors={['#0D0F1A', '#11122A', '#0D0F1A']} style={styles.bg}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>Search by tag or browse all tracks</Text>
      </View>

      {/* Search input */}
      <View style={styles.inputWrapper}>
        <Text style={styles.inputIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. calm, focus, sleep..."
          placeholderTextColor={Colors.text.muted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => handleSearch()}
          returnKeyType="search"
        />
      </View>

      <TouchableOpacity
        style={styles.searchBtn}
        onPress={() => handleSearch()}
        activeOpacity={0.85}
        disabled={searching}
      >
        <LinearGradient
          colors={Colors.gradients.lavender}
          style={styles.searchBtnGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.searchBtnText}>
            {searching ? 'Searching...' : 'Find soundscapes'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.results} showsVerticalScrollIndicator={false}>

        {/* Mood filter chips */}
        {!searching && (
          <View style={styles.moodGrid}>
            {Emotions.map((e) => (
              <TouchableOpacity
                key={e.id}
                style={styles.moodChip}
                activeOpacity={0.75}
                onPress={() => handleSearch(e.id)}
              >
                <Text style={styles.moodEmoji}>{e.emoji}</Text>
                <Text style={styles.moodLabel}>{e.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Loading */}
        {(loading || searching) && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={Colors.accent.lavender} size="large" />
            <Text style={styles.loadingText}>Loading tracks...</Text>
          </View>
        )}

        {/* No results */}
        {!loading && !searching && results.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌫️</Text>
            <Text style={styles.emptyText}>No tracks found</Text>
            <Text style={styles.emptyHint}>Try a different tag</Text>
          </View>
        )}

        {/* Results */}
        {!loading && !searching && results.map((song) => (
          <TouchableOpacity
            key={song.id}
            style={styles.resultCard}
            activeOpacity={0.8}
            onPress={() => router.push({
              pathname: '/(app)/(tabs)/player',
              params: {
                trackId: song.id,
                streamUrl: song.streamUrl,
                title: song.title,
                artist: song.artist,
              },
            })}
          >
            <LinearGradient
              colors={Colors.gradients.lavender}
              style={styles.resultSwatch}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.resultEmoji}>🎵</Text>
            </LinearGradient>
            <View style={styles.resultInfo}>
              <Text style={styles.resultTitle}>{song.title}</Text>
              <Text style={styles.resultArtist}>{song.artist}</Text>
              <View style={styles.resultTags}>
                {song.tags.slice(0, 3).map((tag) => (
                  <View key={tag} style={styles.resultTag}>
                    <Text style={styles.resultTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  header: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.fontSize.display,
    fontFamily: Theme.fontFamily.display,
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.card,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    marginHorizontal: Theme.spacing.lg,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  inputIcon: { fontSize: 16, marginRight: 8 },
  input: {
    flex: 1,
    height: 48,
    color: Colors.text.primary,
    fontFamily: Theme.fontFamily.body,
    fontSize: Theme.fontSize.md,
  },
  searchBtn: {
    marginHorizontal: Theme.spacing.lg,
    borderRadius: Theme.radius.full,
    overflow: 'hidden',
    marginBottom: Theme.spacing.md,
  },
  searchBtnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  searchBtnText: {
    color: Colors.text.primary,
    fontFamily: Theme.fontFamily.bodySemiBold,
    fontSize: Theme.fontSize.md,
  },
  results: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: 100,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Theme.spacing.lg,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Theme.radius.full,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  moodEmoji: { fontSize: 14 },
  moodLabel: {
    fontSize: Theme.fontSize.xs,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.secondary,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingTop: 48,
    gap: 16,
  },
  loadingText: {
    color: Colors.text.secondary,
    fontFamily: Theme.fontFamily.body,
    fontSize: Theme.fontSize.sm,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyEmoji: { fontSize: 40 },
  emptyText: {
    color: Colors.text.primary,
    fontFamily: Theme.fontFamily.bodySemiBold,
    fontSize: Theme.fontSize.md,
  },
  emptyHint: {
    color: Colors.text.muted,
    fontFamily: Theme.fontFamily.body,
    fontSize: Theme.fontSize.sm,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: Colors.bg.card,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  resultSwatch: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  resultEmoji: { fontSize: 22 },
  resultInfo: { flex: 1 },
  resultTitle: {
    color: Colors.text.primary,
    fontFamily: Theme.fontFamily.bodySemiBold,
    fontSize: Theme.fontSize.md,
  },
  resultArtist: {
    color: Colors.accent.lavender,
    fontFamily: Theme.fontFamily.body,
    fontSize: Theme.fontSize.xs,
    marginTop: 2,
  },
  resultTags: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 6,
  },
  resultTag: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Theme.radius.full,
    backgroundColor: Colors.bg.elevated,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  resultTagText: {
    color: Colors.text.muted,
    fontSize: 10,
    fontFamily: Theme.fontFamily.body,
  },
});
