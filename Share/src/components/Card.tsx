import React from 'react';
import Link from 'next/link';
import { ItemWithDetails } from '@/types/database';

interface CardProps {
  item: ItemWithDetails;
}

export function Card({ item }: CardProps) {
  const firstImage = item.images?.[0];
  const imageUrl = firstImage
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${firstImage.storage_path}`
    : '/placeholder.png';

  const statusColors = {
    available: 'bg-green-100 text-green-800',
    claimed: 'bg-yellow-100 text-yellow-800',
    archived: 'bg-gray-100 text-gray-800'
  };

  return (
    <Link href={`/item/${item.id}`}>
      <article className="group bg-white rounded-apple shadow-apple hover:shadow-apple-lg transition-all duration-300 overflow-hidden cursor-pointer animate-fade-in">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}
            >
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {item.title}
          </h3>

          {item.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
          )}

          {/* Location */}
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-sm text-gray-600">{item.location_tag}</span>
          </div>

          {/* Hashtags */}
          {item.hashtags && item.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {item.hashtags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
              {item.hashtags.length > 3 && (
                <span className="text-xs text-gray-500">+{item.hashtags.length - 3}</span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
            <span>{new Date(item.created_at).toLocaleDateString()}</span>
            {item.comments && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                    clipRule="evenodd"
                  />
                </svg>
                {item.comments.length}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
