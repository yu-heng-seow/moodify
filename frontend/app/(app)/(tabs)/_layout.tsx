import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useEffect, useState } from 'react';
import { getSignedUrl } from '@/lib/media';
import { Avatar } from '@/components/ui/Avatar';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.45 }}>
      {emoji}
    </Text>
  );
}

function ProfileTabIcon({ focused }: { focused: boolean }) {
  const { profile } = useAuth();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.avatarS3Key) {
      getSignedUrl(profile.avatarS3Key, 3600).then(setAvatarUri);
    }
  }, [profile?.avatarS3Key]);

  return (
    <View style={{
      width: focused ? 28 : 24,
      height: focused ? 28 : 24,
      borderRadius: 14,
      borderWidth: focused ? 2 : 0,
      borderColor: Colors.accent.lavender,
      opacity: focused ? 1 : 0.55,
    }}>
      <Avatar size={focused ? 24 : 24} uri={avatarUri} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bg.secondary,
          borderTopColor: Colors.border.subtle,
          borderTopWidth: 1,
          height: 75,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.accent.lavender,
        tabBarInactiveTintColor: Colors.text.muted,
        tabBarLabelStyle: {
          fontSize: Theme.fontSize.xs,
          fontFamily: Theme.fontFamily.bodySemiBold,
          marginTop: 2,
        },
      }}
    >
      
      
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="player"
        options={{
          title: 'Player',
          tabBarIcon: ({ focused }) => <TabIcon emoji="💿" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <ProfileTabIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
