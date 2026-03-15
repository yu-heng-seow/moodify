/** Maps each emotion to music tags for therapeutic recommendation (opposites, not mirrors) */
export const EmotionTagMap: Record<EmotionId, string[]> = {
  anxious:      ['calm', 'soothing', 'rain', 'waves', 'relax'],
  sad:          ['happy', 'orchestra', 'driving', 'acoustic'],
  angry:        ['calm', 'soothing', 'relax', 'waves', 'quiet'],
  happy:        ['happy', 'orchestra', 'driving', 'retro'],
  numb:         ['driving', 'retro', 'synthwave', 'bells'],
  overwhelmed:  ['quiet', 'peace', 'silence', 'calm', 'rain'],
  lonely:       ['acoustic', 'fire', 'forest', 'chill', 'lofi'],
  calm:         ['calm', 'peace', 'quiet', 'acoustic', 'rain'],
  grieving:     ['soothing', 'waves', 'relax', 'acoustic', 'forest'],
  panic:        ['calm', 'soothing', 'bells', 'peace', 'silence'],
};

export type EmotionId =
  | 'anxious'
  | 'sad'
  | 'angry'
  | 'happy'
  | 'numb'
  | 'overwhelmed'
  | 'lonely'
  | 'calm'
  | 'grieving'
  | 'panic';

export interface Emotion {
  id: EmotionId;
  label: string;
  description: string;
  color: string;
  gradientColors: [string, string];
  intensity: 'low' | 'medium' | 'high';
  emoji: string;
}

export const Emotions: Emotion[] = [
  {
    id: 'anxious',
    label: 'Anxious',
    description: 'Racing thoughts, restless, on edge',
    color: '#A78BFA',
    gradientColors: ['#A78BFA', '#7C3AED'],
    intensity: 'medium',
    emoji: '🌀',
  },
  {
    id: 'sad',
    label: 'Sad',
    description: 'Heavy, tearful, low energy',
    color: '#93C5FD',
    gradientColors: ['#93C5FD', '#2563EB'],
    intensity: 'medium',
    emoji: '🌧️',
  },
  {
    id: 'angry',
    label: 'Angry',
    description: 'Frustrated, tense, irritable',
    color: '#FDA4AF',
    gradientColors: ['#FDA4AF', '#BE185D'],
    intensity: 'high',
    emoji: '🔥',
  },
  {
    id: 'happy',
    label: 'Happy',
    description: 'Joyful, light, grateful',
    color: '#FCD34D',
    gradientColors: ['#FCD34D', '#D97706'],
    intensity: 'low',
    emoji: '✨',
  },
  {
    id: 'numb',
    label: 'Numb',
    description: 'Disconnected, empty, foggy',
    color: '#9CA3AF',
    gradientColors: ['#9CA3AF', '#4B5563'],
    intensity: 'low',
    emoji: '🌫️',
  },
  {
    id: 'overwhelmed',
    label: 'Overwhelmed',
    description: 'Too much, can\'t cope, flooded',
    color: '#6EE7B7',
    gradientColors: ['#6EE7B7', '#059669'],
    intensity: 'high',
    emoji: '🌊',
  },
  {
    id: 'lonely',
    label: 'Lonely',
    description: 'Isolated, unseen, disconnected',
    color: '#C4B5FD',
    gradientColors: ['#C4B5FD', '#7C3AED'],
    intensity: 'medium',
    emoji: '🌙',
  },
  {
    id: 'calm',
    label: 'Calm',
    description: 'Peaceful, present, grounded',
    color: '#6EE7B7',
    gradientColors: ['#6EE7B7', '#0D9488'],
    intensity: 'low',
    emoji: '🍃',
  },
  {
    id: 'grieving',
    label: 'Grieving',
    description: 'Loss, mourning, heartache',
    color: '#93C5FD',
    gradientColors: ['#93C5FD', '#1D4ED8'],
    intensity: 'high',
    emoji: '🕊️',
  },
  {
    id: 'panic',
    label: 'Panic',
    description: 'Acute panic, crisis response needed',
    color: '#FDA4AF',
    gradientColors: ['#FDA4AF', '#9F1239'],
    intensity: 'high',
    emoji: '⚡',
  },
];
