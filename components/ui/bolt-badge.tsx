'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export function BoltBadge() {
  return (
    <Link
      href="https://bolt.new"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed top-4 right-4 z-50 group"
    >
      <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-semibold text-gray-700 group-hover:text-purple-600 transition-colors">
          Built with Bolt.new
        </span>
        <ExternalLink className="h-3 w-3 text-gray-500 group-hover:text-purple-600 transition-colors" />
      </div>
    </Link>
  );
}
