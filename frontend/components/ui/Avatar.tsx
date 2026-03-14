import { Image, TouchableOpacity } from 'react-native';

type AvatarProps = {
  size: number;
  uri?: string | null;
  onPress?: () => void;
};

export function Avatar({ size, uri, onPress }: AvatarProps) {
  const image = (
    <Image
      source={uri ? { uri } : require('@/assets/images/placeholder-pfp.jpg')}
      style={{ width: size, height: size, borderRadius: size / 2 }}
    />
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {image}
      </TouchableOpacity>
    );
  }

  return image;
}
