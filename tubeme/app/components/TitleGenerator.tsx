'use client';

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { validateTopic } from '../lib/validators';
import { toast } from 'sonner';

export default function TitleGenerator() {
  const { state, setTopic, setTitles, setSelectedTitle, setIsGeneratingTitles } = useApp();
  const [localTopic, setLocalTopic] = useState(state.topic);

  const handleGenerate = async () => {
    const result = validateTopic(localTopic);
    if (!result.success) {
      toast.error(result.error);
      return;
    }

    if (!state.apiKeys.gemini) {
      toast.error('Please configure your Gemini API key first');
      return;
    }

    setIsGeneratingTitles(true);
    setTopic(localTopic);

    try {
      const response = await fetch('/api/generate-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: localTopic,
          apiKey: state.apiKeys.gemini,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate titles');
      }

      setTitles(data.titles);
      toast.success('10 titles generated successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate titles';
      toast.error(message);
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  const handleSelectTitle = (title: string) => {
    setSelectedTitle(title);
    toast.success('Title selected!');
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Step 1: Generate Titles</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Video Topic ({localTopic.length}/500)
          </label>
          <textarea
            value={localTopic}
            onChange={(e) => setLocalTopic(e.target.value.slice(0, 500))}
            placeholder="Enter your video topic..."
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            maxLength={500}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={state.isGeneratingTitles || !localTopic.trim()}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {state.isGeneratingTitles ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Titles'
          )}
        </button>

        {state.titles.length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-medium text-white mb-3">
              Select a title ({state.titles.length} options):
            </h4>
            {state.titles.map((title, index) => (
              <button
                key={index}
                onClick={() => handleSelectTitle(title)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  state.selectedTitle === title
                    ? 'bg-blue-600 text-white ring-2 ring-white/30'
                    : 'bg-white/5 text-white/90 hover:bg-white/10'
                }`}
              >
                <span className="text-xs font-medium text-white/60 mr-2">#{index + 1}</span>
                {title}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
