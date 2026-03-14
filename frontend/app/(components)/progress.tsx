import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export default function ProgressScreen() {
  const [activeDates, setActiveDates] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [currentDate] = useState(new Date());
  const [viewMonth, setViewMonth] = useState(new Date());

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const dates = await AsyncStorage.getItem('moodify_active_dates');
    const s = await AsyncStorage.getItem('moodify_streak');
    if (dates) setActiveDates(JSON.parse(dates));
    if (s) setStreak(parseInt(s));

    // mark today as active
    const today = new Date().toDateString();
    const parsed: string[] = dates ? JSON.parse(dates) : [];
    if (!parsed.includes(today)) {
      const updated = [...parsed, today];
      setActiveDates(updated);
      await AsyncStorage.setItem('moodify_active_dates', JSON.stringify(updated));
    }
  }

  function getDaysInMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  function getFirstDayOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  }

  function isActive(day: number) {
    const d = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
    return activeDates.includes(d.toDateString());
  }

  function isToday(day: number) {
    const d = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
    return d.toDateString() === currentDate.toDateString();
  }

  function prevMonth() {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  }

  function nextMonth() {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
  }

  const daysInMonth = getDaysInMonth(viewMonth);
  const firstDay = getFirstDayOfMonth(viewMonth);
  const totalLogged = activeDates.length;

  return (
    <LinearGradient colors={['#0D0F1A', '#11122A', '#0D0F1A']} style={styles.bg}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Progress</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{streak}</Text>
            <Text style={styles.statLabel}>Day streak 🔥</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalLogged}</Text>
            <Text style={styles.statLabel}>Days logged 📅</Text>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.calendar}>

          {/* Month nav */}
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
              <Text style={styles.navBtnText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthLabel}>
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
              <Text style={styles.navBtnText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Day headers */}
          <View style={styles.dayHeaders}>
            {DAYS.map((d) => (
              <Text key={d} style={styles.dayHeader}>{d}</Text>
            ))}
          </View>

          {/* Day grid */}
          <View style={styles.grid}>
            {/* Empty cells for first day offset */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.dayCell} />
            ))}

            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const active = isActive(day);
              const today = isToday(day);
              return (
                <View
                  key={day}
                  style={[
                    styles.dayCell,
                    active && styles.dayCellActive,
                    today && styles.dayCellToday,
                  ]}
                >
                  <Text style={[
                    styles.dayText,
                    active && styles.dayTextActive,
                    today && styles.dayTextToday,
                  ]}>
                    {day}
                  </Text>
                  {active && <View style={styles.activeDot} />}
                </View>
              );
            })}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.accent.lavender }]} />
            <Text style={styles.legendText}>Logged in</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.bg.elevated, borderWidth: 1.5, borderColor: Colors.accent.lavender }]} />
            <Text style={styles.legendText}>Today</Text>
          </View>
        </View>

        {/* Motivational message */}
        <View style={styles.messageCard}>
          <Text style={styles.messageEmoji}>
            {streak >= 7 ? '🏆' : streak >= 3 ? '🔥' : '🌱'}
          </Text>
          <Text style={styles.messageText}>
            {streak >= 7
              ? `${streak} day streak — you're unstoppable.`
              : streak >= 3
              ? `${streak} days in a row. keep it going.`
              : `${totalLogged} day${totalLogged !== 1 ? 's' : ''} logged. every day counts.`}
          </Text>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bg.card,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: Theme.fontSize.display,
    fontFamily: Theme.fontFamily.display,
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: Theme.fontSize.xs,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.muted,
  },
  calendar: {
    backgroundColor: Colors.bg.card,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: 16,
    marginBottom: Theme.spacing.xl,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: {
    fontSize: 22,
    color: Colors.text.primary,
    lineHeight: 26,
  },
  monthLabel: {
    fontSize: Theme.fontSize.md,
    fontFamily: Theme.fontFamily.bodySemiBold,
    color: Colors.text.primary,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontFamily: Theme.fontFamily.bodySemiBold,
    color: Colors.text.muted,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  dayCellActive: {
    backgroundColor: `${Colors.accent.lavender}22`,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: Colors.accent.lavender,
  },
  dayText: {
    fontSize: 13,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.secondary,
  },
  dayTextActive: {
    color: Colors.accent.lavender,
    fontFamily: Theme.fontFamily.bodySemiBold,
  },
  dayTextToday: {
    color: Colors.text.primary,
  },
  activeDot: {
    position: 'absolute',
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accent.lavender,
  },
  legend: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: Theme.spacing.xl,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: Theme.fontSize.xs,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.muted,
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.card,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: 16,
    gap: 12,
  },
  messageEmoji: { fontSize: 28 },
  messageText: {
    flex: 1,
    fontSize: Theme.fontSize.md,
    fontFamily: Theme.fontFamily.body,
    color: Colors.text.primary,
    lineHeight: 22,
  },
});