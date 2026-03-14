import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { Audio as ExpoAudio } from 'expo-av';
import { Track } from '@/constants/tracks';

export function useAudio() {
  const [sound, setSound] = useState<ExpoAudio.Sound | null>(null);
  const [webAudio, setWebAudio] = useState<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  // Mobile audio mode setup
  useEffect(() => {
    if (Platform.OS !== 'web') {
      ExpoAudio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (Platform.OS === 'web') {
        webAudio?.pause();
      } else {
        sound?.unloadAsync();
      }
    };
  }, [sound, webAudio]);

  const loadAndPlayWeb = useCallback(async (track: Track) => {
    try {
      setIsLoading(true);

      // Stop and clean up previous
      if (webAudio) {
        webAudio.pause();
        webAudio.src = '';
      }

      const audio = new window.Audio(track.audioUrl);

      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration * 1000);
        setIsLoading(false);
      });

      audio.addEventListener('timeupdate', () => {
        setPosition(audio.currentTime * 1000);
      });

      audio.addEventListener('playing', () => setIsPlaying(true));
      audio.addEventListener('pause', () => setIsPlaying(false));
      audio.addEventListener('ended', () => setIsPlaying(false));

      audio.addEventListener('error', (e) => {
        console.error('Web audio error:', e);
        setIsLoading(false);
      });

      setWebAudio(audio);
      setCurrentTrack(track);

      // Web requires user gesture to play - attempt autoplay
      try {
        await audio.play();
      } catch {
        // Autoplay blocked - user will need to press play button
        setIsLoading(false);
      }

    } catch (err: any) {
      console.error('Web loadAndPlay error:', err.message ?? err);
      setIsLoading(false);
    }
  }, [webAudio]);

  const loadAndPlayMobile = useCallback(async (track: Track) => {
    try {
      setIsLoading(true);

      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      const { sound: newSound } = await ExpoAudio.Sound.createAsync(
        { uri: track.audioUrl },
        {
          shouldPlay: true,
          progressUpdateIntervalMillis: 1000,
        },
        (status) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            setPosition(status.positionMillis ?? 0);
            setDuration(status.durationMillis ?? 0);
            setIsLoading(false);
          } else if (status.error) {
            console.error('Mobile status error:', status.error);
            setIsLoading(false);
          }
        }
      );

      setSound(newSound);
      setCurrentTrack(track);

    } catch (err: any) {
      console.error('Mobile loadAndPlay error:', err.message ?? err);
      setIsLoading(false);
    }
  }, [sound]);

  const loadAndPlay = useCallback(async (track: Track) => {
    if (Platform.OS === 'web') {
      await loadAndPlayWeb(track);
    } else {
      await loadAndPlayMobile(track);
    }
  }, [loadAndPlayWeb, loadAndPlayMobile]);

  const togglePlayPause = useCallback(async () => {
    if (Platform.OS === 'web') {
      if (!webAudio) return;
      if (isPlaying) {
        webAudio.pause();
      } else {
        await webAudio.play();
      }
    } else {
      if (!sound) return;
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    }
  }, [sound, webAudio, isPlaying]);

  return {
    currentTrack,
    isPlaying,
    isLoading,
    position,
    duration,
    error: null,
    loadAndPlay,
    togglePlayPause,
  };
}