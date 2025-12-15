export interface Character {
  id: string;
  name: string;
  japaneseName: string;
  domainName: string;
  domainNameKanji: string; // Added strictly for the main effect display
  color: string;
  accentColor: string;
  description: string;
  handSignDescription: string;
  imagePrompt: string;
  videoPrompt: string;
  placeholderImage: string;
  hidden?: boolean; // New property for secret characters
}

export enum GameState {
  API_KEY_CHECK = 'API_KEY_CHECK',
  TITLE_SCREEN = 'TITLE_SCREEN', // Replaces SELECTION
  CAMERA_SETUP = 'CAMERA_SETUP',
  SCANNING = 'SCANNING',
  ANALYZING = 'ANALYZING',
  DOMAIN_EXPANDED = 'DOMAIN_EXPANDED',
  FAILURE = 'FAILURE',
}

export interface AnalysisResult {
  detectedCharacterId: string | null; // Null if no specific character is recognized
  score: number; // 0-100
  feedback: string; // In Japanese
  isCorrect: boolean;
}