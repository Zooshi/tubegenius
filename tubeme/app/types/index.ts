export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface TextOverlay {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
}

export interface ThumbnailState {
  backgroundImage: string | null;
  textOverlay: TextOverlay;
  isDragging: boolean;
}

export interface AppState {
  apiKeys: {
    gemini: string;
    together: string;
  };
  topic: string;
  titles: string[];
  selectedTitle: string;
  thumbnail: ThumbnailState;
  isGeneratingTitles: boolean;
  isGeneratingImage: boolean;
}
