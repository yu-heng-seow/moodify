import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

export default function SearchScreen() {
  return (
    <LinearGradient colors={['#0D0F1A', '#11122A', '#0D0F1A']} style={{ flex: 1 }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: Colors.text.primary, fontSize: Theme.fontSize.lg }}>
          Search
        </Text>
      </View>
    </LinearGradient>
  );
}