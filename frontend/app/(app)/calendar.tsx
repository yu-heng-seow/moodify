import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth';
import { supabase } from '@/lib/supabase';
import { Emotions } from '@/constants/emotions';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface DayEntry {
  emoji: string;
  color: string;
}

export default function CalendarScreen() {
  const { user } = useAuth();
  const [entriesByDate, setEntriesByDate] = useState<Record<string, DayEntry>>({});
  const [signupDate, setSignupDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, []);

  async function fetchData() {
    if (!user) return;

    const [entriesRes, profileRes] = await Promise.all([
      supabase
        .from('journal_entries')
        .select('emotion, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('profiles')
        .select('created_at')
        .eq('id', user.id)
        .single(),
    ]);

    if (profileRes.data) {
      setSignupDate(new Date(profileRes.data.created_at));
    }

    if (entriesRes.data) {
      const grouped: Record<string, DayEntry> = {};
      for (const entry of entriesRes.data) {
        const dateKey = entry.created_at.slice(0, 10); // YYYY-MM-DD
        const emotion = Emotions.find((e) => e.id.toLowerCase() === entry.emotion.toLowerCase());
        // Last entry per day wins (we iterate ascending, so later entries overwrite)
        grouped[dateKey] = {
          emoji: emotion?.emoji ?? '🎵',
          color: emotion?.color ?? Colors.text.muted,
        };
      }
      setEntriesByDate(grouped);
    }

    setLoading(false);
  }

  function getMonths(): { year: number; month: number }[] {
    const now = new Date();
    const start = signupDate ?? now;
    const months: { year: number; month: number }[] = [];

    let y = now.getFullYear();
    let m = now.getMonth();
    const startY = start.getFullYear();
    const startM = start.getMonth();

    while (y > startY || (y === startY && m >= startM)) {
      months.push({ year: y, month: m });
      m--;
      if (m < 0) {
        m = 11;
        y--;
      }
    }

    return months;
  }

  function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfWeek(year: number, month: number) {
    const day = new Date(year, month, 1).getDay();
    // Convert Sunday=0 to Monday-based (Mon=0, Sun=6)
    return day === 0 ? 6 : day - 1;
  }

  function renderMonth(year: number, month: number) {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfWeek(year, month);
    const today = new Date();
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
    const monthName = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

    const cells: React.ReactNode[] = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const entry = entriesByDate[dateStr];
      const isFuture = isCurrentMonth && day > today.getDate();
      const isToday = isCurrentMonth && day === today.getDate();

      cells.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            entry && { backgroundColor: entry.color + '20' },
            isToday && styles.todayCell,
          ]}
          disabled={!entry || isFuture}
          activeOpacity={0.7}
          onPress={() => entry && router.push({ pathname: '/(app)/journal/[date]', params: { date: dateStr } })}
        >
          {isFuture ? (
            <Text style={styles.dayNumberMuted}>{day}</Text>
          ) : entry ? (
            <Text style={styles.dayEmoji}>{entry.emoji}</Text>
          ) : (
            <Text style={styles.dayNumber}>{day}</Text>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <View key={`${year}-${month}`} style={styles.monthSection}>
        <Text style={styles.monthTitle}>{monthName}</Text>
        <View style={styles.weekdayRow}>
          {WEEKDAYS.map((d) => (
            <Text key={d} style={styles.weekdayLabel}>{d}</Text>
          ))}
        </View>
        <View style={styles.daysGrid}>{cells}</View>
      </View>
    );
  }

  const months = signupDate ? getMonths() : [];

  return (
    <LinearGradient colors={['#0D0F1A', '#11122A', '#0D0F1A']} style={styles.bg}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Journal History</Text>

        {loading ? (
          <ActivityIndicator color={Colors.accent.lavender} style={{ marginTop: 40 }} />
        ) : months.length === 0 ? (
          <Text style={styles.emptyText}>No journal entries yet</Text>
        ) : (
          months.map(({ year, month }) => renderMonth(year, month))
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - Theme.spacing.lg * 2) / 7);

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: 100,
  },
  backButton: {
    marginBottom: Theme.spacing.md,
  },
  backText: {
    fontSize: Theme.fontSize.md,
    fontFamily: Theme.fontFamily.body,
    color: Colors.accent.lavender,
  },
  title: {
    fontSize: Theme.fontSize.xxl,
    fontFamily: Theme.fontFamily.display,
    color: Colors.text.primary,
    marginBottom: Theme.spacing.xl,
  },
  monthSection: {
    marginBottom: Theme.spacing.xl,
  },
  monthTitle: {
    fontSize: Theme.fontSize.lg,
    fontFamily: Theme.fontFamily.bodySemiBold,
    color: Colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.xs,
  },
  weekdayLabel: {
    width: CELL_SIZE,
    textAlign: 'center',
    fontSize: Theme.fontSize.xs,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.muted,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: Theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  todayCell: {
    borderWidth: 1,
    borderColor: Colors.accent.lavender,
  },
  dayNumber: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.secondary,
  },
  dayNumberMuted: {
    fontSize: Theme.fontSize.sm,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.muted,
  },
  dayEmoji: {
    fontSize: 18,
  },
  emptyText: {
    fontSize: Theme.fontSize.md,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
