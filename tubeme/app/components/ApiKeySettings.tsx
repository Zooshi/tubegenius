'use client';

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { validateApiKey } from '../lib/validators';
import { toast } from 'sonner';

export default function ApiKeySettings() {
  const { state, setApiKeys } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [geminiKey, setGeminiKey] = useState(state.apiKeys.gemini);
  const [togetherKey, setTogetherKey] = useState(state.apiKeys.together);

  const handleSave = () => {
    const geminiResult = validateApiKey(geminiKey);
    const togetherResult = validateApiKey(togetherKey);

    if (!geminiResult.success) {
      toast.error(`Gemini API Key: ${geminiResult.error}`);
      return;
    }

    if (!togetherResult.success) {
      toast.error(`Together API Key: ${togetherResult.error}`);
      return;
    }

    setApiKeys(geminiKey, togetherKey);
    toast.success('API keys saved successfully!');
    setIsOpen(false);
  };

  const hasKeys = state.apiKeys.gemini && state.apiKeys.together;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white">API Settings</h3>
          <p className="text-sm text-white/60 mt-1">
            {hasKeys ? 'API keys configured ✓' : 'Configure your API keys to get started'}
          </p>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          {isOpen ? 'Close' : 'Configure'}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4 mt-4 pt-4 border-t border-white/20">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Gemini API Key
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-white/50 mt-1">
              Get your key from{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Together API Key
            </label>
            <input
              type="password"
              value={togetherKey}
              onChange={(e) => setTogetherKey(e.target.value)}
              placeholder="Enter your Together API key"
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-white/50 mt-1">
              Get your key from{' '}
              <a
                href="https://api.together.xyz/settings/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Together AI
              </a>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Save Keys
            </button>
            <button
              onClick={() => {
                setGeminiKey(state.apiKeys.gemini);
                setTogetherKey(state.apiKeys.together);
                setIsOpen(false);
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-white/60 bg-white/5 p-3 rounded">
            Your API keys are stored locally in your browser and never sent to our servers.
            They are only used to make direct requests to Gemini and Together APIs.
          </p>
        </div>
      )}
    </div>
  );
}
