'use client';

import { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { validateImageFile } from '../lib/validators';
import { loadImageAsDataURL } from '../lib/canvas';
import { toast } from 'sonner';

export default function ImageUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setBackgroundImage } = useApp();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationResult = validateImageFile(file);
    if (!validationResult.success) {
      toast.error(validationResult.error);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      const dataUrl = await loadImageAsDataURL(file);
      setBackgroundImage(dataUrl);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      toast.error('Failed to load image. Please try again.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Or Upload Custom Image</h3>

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleFileChange}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="block w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all cursor-pointer text-center"
        >
          Choose Image (PNG/JPEG, max 5MB)
        </label>
        <p className="text-xs text-white/60 text-center mt-2">
          Upload your own background image for the thumbnail
        </p>
      </div>
    </div>
  );
}
