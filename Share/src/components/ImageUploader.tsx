'use client';

import React, { useState, useCallback } from 'react';
import {
  compressImage,
  validateImageFiles,
  IMAGE_CONFIG,
  CompressedImage,
  revokeObjectURL
} from '@/lib/image-utils';

interface ImageUploaderProps {
  onImagesChange: (images: CompressedImage[]) => void;
  maxFiles?: number;
}

export function ImageUploader({ onImagesChange, maxFiles = IMAGE_CONFIG.MAX_FILES }: ImageUploaderProps) {
  const [images, setImages] = useState<CompressedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const validation = validateImageFiles(fileArray);

      if (!validation.valid) {
        setError(validation.error || 'Invalid files');
        return;
      }

      setError(null);
      setLoading(true);

      try {
        const compressedImages: CompressedImage[] = [];

        for (const file of fileArray) {
          const compressed = await compressImage(file);
          compressedImages.push(compressed);
        }

        setImages(prev => {
          const newImages = [...prev, ...compressedImages].slice(0, maxFiles);
          onImagesChange(newImages);
          return newImages;
        });
      } catch (err) {
        setError('Failed to process images. Please try again.');
        console.error('Image processing error:', err);
      } finally {
        setLoading(false);
      }
    },
    [maxFiles, onImagesChange]
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const removed = prev[index];
      revokeObjectURL(removed.preview);
      const newImages = prev.filter((_, i) => i !== index);
      onImagesChange(newImages);
      return newImages;
    });
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-apple p-8 text-center transition-colors ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${images.length >= maxFiles ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={IMAGE_CONFIG.ACCEPTED_TYPES.join(',')}
          multiple
          onChange={handleChange}
          disabled={loading || images.length >= maxFiles}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="image-upload"
        />

        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-sm text-gray-600">
            <label htmlFor="image-upload" className="text-primary-600 font-medium cursor-pointer hover:text-primary-700">
              Upload images
            </label>
            {' '}or drag and drop
          </div>
          <p className="text-xs text-gray-500">
            PNG, JPG, WebP up to {IMAGE_CONFIG.MAX_SIZE_MB}MB (max {maxFiles} images)
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center justify-center gap-2 text-primary-600">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm">Processing images...</span>
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={image.preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {Math.round(image.file.size / 1024)}KB
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Text */}
      {images.length > 0 && (
        <p className="text-xs text-gray-500 text-center">
          {images.length} of {maxFiles} images selected
        </p>
      )}
    </div>
  );
}
