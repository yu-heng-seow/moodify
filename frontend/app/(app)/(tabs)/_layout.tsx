import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { Image } from 'react-native';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.45 }}>
      {emoji}
    </Text>
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
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('@/assets/images/home.png')}
              style={{ width: 24, height: 24, opacity: focused ? 1 : 0.5 }}
            />
          ),        
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('@/assets/images/home.png')}
              style={{ width: 24, height: 24, opacity: focused ? 1 : 0.5 }}
            />
          ),        
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('@/assets/images/music.png')}
              style={{ width: 24, height: 24, opacity: focused ? 1 : 0.5 }}
            />
          ),   
        }}
      />
      <Tabs.Screen
        name="player"
        options={{
          title: 'Player',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('@/assets/images/headphone.png')}
              style={{ width: 24, height: 24, opacity: focused ? 1 : 0.5 }}
            />
          ),        
        }}
      />
    </Tabs>
  );
}
