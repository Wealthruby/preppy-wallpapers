'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SearchableGallery({ data }: { data: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [shuffledData, setShuffledData] = useState<any[]>([]);

  // Safely randomize the images on the client side to prevent React errors
  useEffect(() => {
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    setShuffledData(shuffled);
  }, [data]);

  // Filter the grid based on what the user types in the search bar
  const filteredData = shuffledData.filter(item =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.keyword?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full">
      {/* The Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search wallpapers (e.g., pink, coquette, dark)..."
          className="w-full p-4 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-700 text-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* The Image Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((item: any, index: number) => (
          <Link
            href={`/${item.slug}`}
            key={index}
            className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition duration-300 border border-gray-100"
          >
            {/* Thumbnail */}
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={item.cdn_url?.trim()} 
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                loading="lazy"
              />
            </div>

            {/* Title */}
            <div className="p-4">
              <h2 className="text-sm font-bold mb-1 line-clamp-2 text-gray-800">
                {item.title}
              </h2>
              <span className="text-pink-500 text-sm font-semibold group-hover:text-pink-600">
                Download Free &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
      
      {/* If search finds nothing */}
      {filteredData.length === 0 && (
        <div className="text-center text-gray-500 py-10 text-xl">
          No wallpapers found for "{searchQuery}".
        </div>
      )}
    </div>
  );
}