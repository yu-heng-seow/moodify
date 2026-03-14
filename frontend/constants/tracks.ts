import { EmotionId } from './emotions';

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number; // seconds
  emotions: EmotionId[];
  intensity: 'low' | 'medium' | 'high';
  genre: 'ambient' | 'nature' | 'classical' | 'binaural' | 'meditation';
  description: string;
  color: string;
  // For MVP, use royalty-free URLs from freesound or placeholder
  audioUrl: string;
  coverGradient: [string, string];
}

const S3 = 'https://moodify-tracks.s3.ap-southeast-2.amazonaws.com';


export const Tracks: Track[] = [
  {
    id: '1',
    title: 'Still Waters',
    artist: 'Moodify Ambient',
    duration: 140931,
    emotions: ['anxious', 'overwhelmed', 'panic'],
    intensity: 'low',
    genre: 'nature',
    description: 'Gentle rain and distant thunder for nervous system reset',
    color: '#A78BFA',
    audioUrl: `${S3}/distant-thunder-rain-ivo-vicic-1-02-20.mp3`,
    coverGradient: ['#A78BFA', '#1E1B4B'],
  },
  {
    id: '2',
    title: 'Midnight Forest',
    artist: 'Moodify Ambient',
    duration: 600,
    emotions: ['sad', 'lonely', 'grieving'],
    intensity: 'low',
    genre: 'nature',
    description: 'Soft night sounds to sit with difficult feelings',
    color: '#93C5FD',
    audioUrl: 'https://www.soundjay.com/nature/sounds/crickets-1.mp3',
    coverGradient: ['#93C5FD', '#1E3A5F'],
  },
  {
    id: '3',
    title: 'Ember Breath',
    artist: 'Moodify Meditation',
    duration: 420,
    emotions: ['angry', 'overwhelmed'],
    intensity: 'medium',
    genre: 'meditation',
    description: 'Grounding tones to release and soften tension',
    color: '#FDA4AF',
    audioUrl: 'https://www.soundjay.com/nature/sounds/fire-1.mp3',
    coverGradient: ['#FDA4AF', '#7F1D1D'],
  },
  {
    id: '4',
    title: 'Golden Hour',
    artist: 'Moodify Classical',
    duration: 360,
    emotions: ['happy', 'calm'],
    intensity: 'low',
    genre: 'classical',
    description: 'Warm, uplifting strings for moments of light',
    color: '#FCD34D',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-01.mp3',
    coverGradient: ['#FCD34D', '#92400E'],
  },
  {
    id: '5',
    title: 'Theta Drift',
    artist: 'Moodify Binaural',
    duration: 900,
    emotions: ['numb', 'anxious', 'sad'],
    intensity: 'low',
    genre: 'binaural',
    description: '7Hz theta waves for deep emotional processing',
    color: '#6EE7B7',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
    coverGradient: ['#6EE7B7', '#064E3B'],
  },
  {
    id: '6',
    title: 'Safe Harbor',
    artist: 'Moodify Ambient',
    duration: 540,
    emotions: ['panic', 'anxious', 'overwhelmed'],
    intensity: 'low',
    genre: 'ambient',
    description: 'Immediate grounding for acute distress',
    color: '#C4B5FD',
    audioUrl: 'https://www.soundjay.com/nature/sounds/ocean-wave-1.mp3',
    coverGradient: ['#C4B5FD', '#2E1065'],
  },
  {
    id: '7',
    title: 'Morning Mist',
    artist: 'Moodify Nature',
    duration: 480,
    emotions: ['calm', 'happy', 'numb'],
    intensity: 'low',
    genre: 'nature',
    description: 'Soft birdsong and stream for gentle awakening',
    color: '#6EE7B7',
    audioUrl: `${S3}/forest-ambience-light-birdsong-distant-rooster-vincentmets-1-03-38.mp3`,
    coverGradient: ['#6EE7B7', '#065F46'],
  },
  {
    id: '8',
    title: 'Hollow Moon',
    artist: 'Moodify Ambient',
    duration: 720,
    emotions: ['grieving', 'lonely', 'sad', 'calm'],
    intensity: 'medium',
    genre: 'ambient',
    description: 'Deep drones to hold grief without rushing it',
    color: '#93C5FD',
    audioUrl: `${S3}/wind-chimes-light-rain-thunder_aygGqqyO.mp3`,
    coverGradient: ['#93C5FD', '#0C1445'],
  },
];

export function getTracksByEmotion(emotionId: EmotionId): Track[] {
  return Tracks.filter((t) => t.emotions.includes(emotionId));
}

export function getTrackById(id: string): Track | undefined {
  return Tracks.find((t) => t.id === id);
}
