'use client';

import { useRef, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { drawThumbnail, downloadCanvas, constrainPosition } from '../lib/canvas';
import { toast } from 'sonner';

export default function ThumbnailEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state, setBackgroundImage, updateTextOverlay, setIsDragging, setIsGeneratingImage } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    drawThumbnail(
      canvas,
      state.thumbnail.backgroundImage,
      state.thumbnail.textOverlay
    );
  }, [state.thumbnail]);

  const handleGenerateImage = async () => {
    if (!state.selectedTitle) {
      toast.error('Please select a title first');
      return;
    }

    if (!state.apiKeys.together) {
      toast.error('Please configure your Together API key first');
      return;
    }

    setIsGenerating(true);
    setIsGeneratingImage(true);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: state.selectedTitle,
          apiKey: state.apiKeys.together,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setBackgroundImage(data.imageUrl);
      toast.success('Thumbnail image generated successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate image';
      toast.error(message);
    } finally {
      setIsGenerating(false);
      setIsGeneratingImage(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setIsDragging(true);
    updateTextOverlay({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!state.thumbnail.isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const { textOverlay } = state.thumbnail;
    const constrained = constrainPosition(
      x,
      y,
      textOverlay.text,
      textOverlay.fontSize,
      textOverlay.fontFamily
    );

    updateTextOverlay(constrained);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const filename = state.selectedTitle
      ? `${state.selectedTitle.slice(0, 30).replace(/[^a-z0-9]/gi, '-')}.png`
      : 'thumbnail.png';

    downloadCanvas(canvas, filename);
    toast.success('Thumbnail downloaded!');
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Step 2: Create Thumbnail</h3>

      <div className="space-y-4">
        <button
          onClick={handleGenerateImage}
          disabled={isGenerating || !state.selectedTitle}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating (30-60s)...
            </>
          ) : (
            'Generate Thumbnail Image'
          )}
        </button>

        <div className="relative bg-black/30 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className="w-full cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          {!state.thumbnail.backgroundImage && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-white/50 text-center px-4">
                Generate or upload an image to get started
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleDownload}
          disabled={!state.thumbnail.backgroundImage}
          className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Download Thumbnail (1280x720 PNG)
        </button>

        <p className="text-xs text-white/60 text-center">
          Drag the text on the canvas to position it. Use the controls below to customize.
        </p>
      </div>
    </div>
  );
}
