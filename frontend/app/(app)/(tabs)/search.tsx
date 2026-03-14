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
import { Tracks, Track } from '@/constants/tracks';
import { Emotions } from '@/constants/emotions';

const SUGGESTED = [
  'help me sleep 🌙',
  'release anger 🔥',
  'morning calm ☀️',
  'anxiety relief 🌀',
  'grief support 🕊️',
  'focus & clarity 🧠',
  'feel less lonely 🌿',
  'ground myself ✨',
];

function AddButton({ trackId }: { trackId: string }) {
  const [added, setAdded] = useState(false);
  return (
    <TouchableOpacity
      onPress={(e) => {
        e.stopPropagation?.();
        setAdded(true);
      }}
      style={[styles.addBtn, added && styles.addBtnDone]}
      activeOpacity={0.8}
      disabled={added}
    >
      <Text style={[styles.addBtnText, added && styles.addBtnTextDone]}>
        {added ? '✓ Added' : '+ Library'}
      </Text>
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (query === '') {
      setSearched(false);
      setResults([]);
    }
  }, [query]);

  async function handleSearch(q?: string) {
    const searchQuery = q ?? query;
    if (!searchQuery.trim()) return;
    if (q) setQuery(q);
    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `You are a music recommendation engine for a healing audio app.
              
The user searched for: "${searchQuery}"

Here are the available tracks:
${Tracks.map(t => `- id: "${t.id}", title: "${t.title}", description: "${t.description}", emotions: [${t.emotions.join(', ')}]`).join('\n')}

Return ONLY a JSON array of track IDs that best match the user's query, ordered by relevance. Example: ["id1", "id2"]. Return empty array [] if nothing matches. No other text.`,
            },
          ],
        }),
      });

      const data = await response.json();
      const text = data.content?.[0]?.text ?? '[]';
      const ids: string[] = JSON.parse(text.replace(/```json|```/g, '').trim());
      const matched = ids
        .map((id) => Tracks.find((t) => t.id === id))
        .filter(Boolean) as Track[];
      setResults(matched);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={['#0D0F1A', '#11122A', '#0D0F1A']} style={styles.bg}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>Describe how you feel or what you need</Text>
      </View>

      {/* Search input */}
      <View style={styles.inputWrapper}>
        <Text style={styles.inputIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. calm my anxiety before sleep..."
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
        disabled={loading}
      >
        <LinearGradient
          colors={Colors.gradients.lavender}
          style={styles.searchBtnGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.searchBtnText}>
            {loading ? 'Searching...' : 'Find soundscapes'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.results} showsVerticalScrollIndicator={false}>

        {/* Pre-search content */}
        {!searched && !loading && (
          <>
            <Text style={styles.sectionTitle}>Try asking for</Text>
            <View style={styles.suggestedGrid}>
              {SUGGESTED.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={styles.suggestedChip}
                  activeOpacity={0.75}
                  onPress={() => handleSearch(s)}
                >
                  <Text style={styles.suggestedText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Browse by mood</Text>
            <View style={styles.moodGrid}>
              {Emotions.map((e) => (
                <TouchableOpacity
                  key={e.id}
                  style={styles.moodCard}
                  activeOpacity={0.75}
                  onPress={() => handleSearch(e.label)}
                >
                  <LinearGradient
                    colors={[e.color + '33', e.color + '11']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <Text style={styles.moodEmoji}>{e.emoji}</Text>
                  <Text style={styles.moodLabel}>{e.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={Colors.accent.lavender} size="large" />
            <Text style={styles.loadingText}>Finding your soundscape...</Text>
          </View>
        )}

        {/* No results */}
        {!loading && searched && results.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌫️</Text>
            <Text style={styles.emptyText}>No matches found</Text>
            <Text style={styles.emptyHint}>Try describing your mood differently</Text>
          </View>
        )}

        {/* Results */}
        {!loading && results.map((track) => (
          <TouchableOpacity
            key={track.id}
            style={styles.resultCard}
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: '/(app)/(tabs)/player', params: { trackId: track.id } })}
          >
            <LinearGradient
              colors={track.coverGradient}
              style={styles.resultSwatch}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.resultEmoji}>
                {track.genre === 'nature' ? '🌿' :
                  track.genre === 'ambient' ? '🌌' :
                  track.genre === 'binaural' ? '🧠' :
                  track.genre === 'classical' ? '🎻' : '🧘'}
              </Text>
            </LinearGradient>
            <View style={styles.resultInfo}>
              <Text style={styles.resultTitle}>{track.title}</Text>
              <Text style={styles.resultArtist}>{track.artist}</Text>
              <Text style={styles.resultDesc} numberOfLines={1}>{track.description}</Text>
              <View style={styles.resultBottom}>
                <View style={styles.resultTags}>
                  {track.emotions.slice(0, 2).map((e) => (
                    <View key={e} style={styles.resultTag}>
                      <Text style={styles.resultTagText}>{e}</Text>
                    </View>
                  ))}
                </View>
                <AddButton trackId={track.id} />
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
    marginBottom: Theme.spacing.lg,
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
  sectionTitle: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.bodySemiBold,
    color: Colors.text.secondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  suggestedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Theme.spacing.xl,
  },
  suggestedChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Theme.radius.full,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  suggestedText: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.secondary,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: Theme.spacing.xl,
  },
  moodCard: {
    width: '47%',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: Theme.radius.lg,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  moodEmoji: { fontSize: 22 },
  moodLabel: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.bodySemiBold,
    color: Colors.text.primary,
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
  resultDesc: {
    color: Colors.text.secondary,
    fontFamily: Theme.fontFamily.body,
    fontSize: Theme.fontSize.xs,
    marginTop: 2,
  },
  resultBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  resultTags: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
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
  addBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: Colors.accent.lavender,
  },
  addBtnDone: {
    borderColor: '#1DB954',
  },
  addBtnText: {
    fontSize: 11,
    fontFamily: Theme.fontFamily.bodySemiBold,
    color: Colors.accent.lavender,
  },
  addBtnTextDone: {
    color: '#1DB954',
  },
});