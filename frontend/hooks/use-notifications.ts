import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const CHECK_IN_MESSAGES = [
  { title: 'Hey, how are you feeling?', body: 'Take a moment to check in with yourself 🌙' },
  { title: 'A gentle nudge 🌿', body: 'Your emotions are valid. Moodify is here when you need it.' },
  { title: 'Time for a breather?', body: 'Even 2 minutes of calm can shift your whole day.' },
  { title: 'How\'s your heart today?', body: 'Open Moodify and let the music meet you where you are.' },
];

export function useNotifications() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    registerForPushNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener(() => {});
    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {});

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  async function registerForPushNotifications() {
    if (!Device.isDevice) return;

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return;

    setPermissionGranted(true);

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('moodify', {
        name: 'Moodify Check-ins',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    }
  }

  async function scheduleDailyCheckIn(hour: number, minute: number) {
    if (Platform.OS === 'web') return;
    // Cancel existing
    await Notifications.cancelAllScheduledNotificationsAsync();

    const msg = CHECK_IN_MESSAGES[Math.floor(Math.random() * CHECK_IN_MESSAGES.length)];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: msg.title,
        body: msg.body,
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  }

  async function sendImmediateNotification(title: string, body: string) {
    if (Platform.OS === 'web') return;
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  }

  async function cancelAll() {
    if (Platform.OS === 'web') return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  return {
    permissionGranted,
    scheduleDailyCheckIn,
    sendImmediateNotification,
    cancelAll,
  };
}
