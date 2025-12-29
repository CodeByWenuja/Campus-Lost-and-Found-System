'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useConfetti } from '@/hooks/useConfetti';
import { ImageUploader } from '@/components/ImageUploader';
import { CompressedImage } from '@/lib/image-utils';
import { supabase } from '@/lib/supabase/client';

export default function NewPostPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { fireSingleBurst } = useConfetti();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationTag, setLocationTag] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [images, setImages] = useState<CompressedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign in required</h1>
        <p className="text-gray-600 mb-6">You need to be signed in to create a post.</p>
        <button
          onClick={() => router.push('/auth/signin')}
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !locationTag.trim() || images.length === 0) {
      setError('Please fill in all required fields and upload at least one image');
      return;
    }

    setLoading(true);

    try {
      // Parse hashtags
      const hashtagArray = hashtags
        .split(/[,\s]+/)
        .filter(tag => tag.trim())
        .map(tag => tag.replace(/^#/, '').toLowerCase());

      // Create item
      const { data: item, error: itemError } = await supabase
        .from('items')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          location_tag: locationTag.trim(),
          hashtags: hashtagArray,
          posted_by: user!.id,
          status: 'available'
        })
        .select()
        .single();

      if (itemError) throw itemError;

      // Upload images
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const fileName = `${item.id}/${i}-${Date.now()}.webp`;
        const filePath = `items/${fileName}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, image.file, {
            contentType: 'image/webp',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Save image metadata
        const { error: imageError } = await supabase.from('images').insert({
          item_id: item.id,
          storage_path: filePath,
          width: image.width,
          height: image.height,
          size_bytes: image.file.size,
          order_num: i
        });

        if (imageError) throw imageError;
      }

      // Show success animation
      fireSingleBurst();

      // Redirect to item page
      setTimeout(() => {
        router.push(`/item/${item.id}`);
      }, 500);
    } catch (err: any) {
      console.error('Error creating post:', err);
      setError(err.message || 'Failed to create post. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a Found Item</h1>
        <p className="text-gray-600">Help someone find their lost item</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-apple shadow-apple p-6 space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={100}
            placeholder="e.g., Blue backpack found in library"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
          <p className="mt-1 text-xs text-gray-500">{title.length}/100 characters</p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="Add more details about the item..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">{description.length}/1000 characters</p>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Location Found <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="location"
            value={locationTag}
            onChange={e => setLocationTag(e.target.value)}
            maxLength={100}
            placeholder="FoC, 102 Lec Hall"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        {/* Hashtags */}
        <div>
          <label htmlFor="hashtags" className="block text-sm font-medium text-gray-700 mb-2">
            Hashtags
          </label>
          <input
            type="text"
            id="hashtags"
            value={hashtags}
            onChange={e => setHashtags(e.target.value)}
            placeholder="backpack, blue, electronics (comma or space separated)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            Use hashtags to help others find this item easier
          </p>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images <span className="text-red-500">*</span>
          </label>
          <ImageUploader onImagesChange={setImages} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || images.length === 0}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
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
                Posting...
              </span>
            ) : (
              'Post Item'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
