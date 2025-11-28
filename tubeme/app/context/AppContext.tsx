'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AppState, TextOverlay } from '../types';
import { Storage } from '../lib/storage';

interface AppContextType {
  state: AppState;
  setApiKeys: (gemini: string, together: string) => void;
  setTopic: (topic: string) => void;
  setTitles: (titles: string[]) => void;
  setSelectedTitle: (title: string) => void;
  setBackgroundImage: (image: string | null) => void;
  updateTextOverlay: (updates: Partial<TextOverlay>) => void;
  setIsDragging: (dragging: boolean) => void;
  setIsGeneratingTitles: (generating: boolean) => void;
  setIsGeneratingImage: (generating: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    apiKeys: {
      gemini: '',
      together: '',
    },
    topic: '',
    titles: [],
    selectedTitle: '',
    thumbnail: {
      backgroundImage: null,
      textOverlay: {
        text: '',
        x: 50,
        y: 50,
        fontSize: 64,
        fontFamily: 'Impact',
        color: '#FFFFFF',
      },
      isDragging: false,
    },
    isGeneratingTitles: false,
    isGeneratingImage: false,
  });

  useEffect(() => {
    const savedKeys = {
      gemini: Storage.get<string>('gemini-api-key', ''),
      together: Storage.get<string>('together-api-key', ''),
    };
    if (savedKeys.gemini || savedKeys.together) {
      setState((prev) => ({ ...prev, apiKeys: savedKeys }));
    }
  }, []);

  const setApiKeys = (gemini: string, together: string) => {
    Storage.set('gemini-api-key', gemini);
    Storage.set('together-api-key', together);
    setState((prev) => ({ ...prev, apiKeys: { gemini, together } }));
  };

  const setTopic = (topic: string) => {
    setState((prev) => ({ ...prev, topic }));
  };

  const setTitles = (titles: string[]) => {
    setState((prev) => ({ ...prev, titles }));
  };

  const setSelectedTitle = (title: string) => {
    setState((prev) => ({ ...prev, selectedTitle: title }));
  };

  const setBackgroundImage = (image: string | null) => {
    setState((prev) => ({
      ...prev,
      thumbnail: { ...prev.thumbnail, backgroundImage: image },
    }));
  };

  const updateTextOverlay = (updates: Partial<TextOverlay>) => {
    setState((prev) => ({
      ...prev,
      thumbnail: {
        ...prev.thumbnail,
        textOverlay: { ...prev.thumbnail.textOverlay, ...updates },
      },
    }));
  };

  const setIsDragging = (dragging: boolean) => {
    setState((prev) => ({
      ...prev,
      thumbnail: { ...prev.thumbnail, isDragging: dragging },
    }));
  };

  const setIsGeneratingTitles = (generating: boolean) => {
    setState((prev) => ({ ...prev, isGeneratingTitles: generating }));
  };

  const setIsGeneratingImage = (generating: boolean) => {
    setState((prev) => ({ ...prev, isGeneratingImage: generating }));
  };

  return (
    <AppContext.Provider
      value={{
        state,
        setApiKeys,
        setTopic,
        setTitles,
        setSelectedTitle,
        setBackgroundImage,
        updateTextOverlay,
        setIsDragging,
        setIsGeneratingTitles,
        setIsGeneratingImage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
