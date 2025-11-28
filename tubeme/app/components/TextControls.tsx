'use client';

import { HexColorPicker } from 'react-colorful';
import { useApp } from '../context/AppContext';

const FONT_FAMILIES = [
  'Impact',
  'Arial',
  'Georgia',
  'Verdana',
  'Comic Sans MS',
];

const QUICK_COLORS = [
  '#FFFFFF',
  '#000000',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
  '#FFA500',
  '#800080',
  '#FFC0CB',
  '#A52A2A',
];

export default function TextControls() {
  const { state, updateTextOverlay } = useApp();
  const { text, fontSize, fontFamily, color } = state.thumbnail.textOverlay;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Text Customization</h3>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Text ({text.length}/200)
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => updateTextOverlay({ text: e.target.value.slice(0, 200) })}
          placeholder="Enter your text..."
          className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={200}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Font Family
        </label>
        <select
          value={fontFamily}
          onChange={(e) => updateTextOverlay({ fontFamily: e.target.value })}
          className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Font Size: {fontSize}px
        </label>
        <input
          type="range"
          min="20"
          max="200"
          value={fontSize}
          onChange={(e) => updateTextOverlay({ fontSize: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Text Color
        </label>

        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="inline-block">
              <HexColorPicker
                color={color}
                onChange={(newColor) => updateTextOverlay({ color: newColor })}
                style={{ width: '140px', height: '140px' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {QUICK_COLORS.map((quickColor) => (
              <button
                key={quickColor}
                onClick={() => updateTextOverlay({ color: quickColor })}
                className={`w-full aspect-square rounded-md border-2 transition-transform hover:scale-110 ${
                  color.toUpperCase() === quickColor
                    ? 'border-white scale-110'
                    : 'border-white/30'
                }`}
                style={{ backgroundColor: quickColor }}
                title={quickColor}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-md border-2 border-white/30"
              style={{ backgroundColor: color }}
            />
            <input
              type="text"
              value={color}
              onChange={(e) => {
                const value = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                  updateTextOverlay({ color: value });
                }
              }}
              className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="#FFFFFF"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
