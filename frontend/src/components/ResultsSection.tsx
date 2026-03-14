'use client';
import React, { useState } from 'react';
import { Download, Filter, Building2, AlertCircle } from 'lucide-react';
import BusinessCard from './BusinessCard';
import type { Business } from '@/utils/api';
import { exportToCSV } from '@/utils/api';

interface ResultsSectionProps {
  businesses: Business[];
  searchId: number | null;
  isLoading: boolean;
  error: string | null;
}

export default function ResultsSection({ businesses, searchId, isLoading, error }: ResultsSectionProps) {
  const [filter, setFilter] = useState<'all' | 'none' | 'found'>('all');

  const filteredBusinesses = businesses.filter(b => {
    if (filter === 'all') return true;
    return b.website_status === filter;
  });

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div role="status" aria-live="polite" className="text-center py-20">
          <div aria-hidden="true" className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Searching for businesses...</h3>
          <p className="text-gray-500">This may take a minute. We&apos;re finding businesses and checking their websites.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800">Search Failed</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <p className="text-red-600 text-sm mt-2">Please check your API keys and try again.</p>
          </div>
        </div>
      </div>
    );
  }

  if (businesses.length === 0 && searchId !== null) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center py-16 bg-white rounded-2xl shadow-md">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No businesses found</h3>
          <p className="text-gray-500">Try a different country, category, or disable the &quot;no website&quot; filter.</p>
        </div>
      </div>
    );
  }

  if (businesses.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Found {businesses.length} Businesses
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Showing {filteredBusinesses.length} of {businesses.length} results
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Buttons */}
          <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <Filter className="w-4 h-4 text-gray-500 ml-2" />
            {(['all', 'none', 'found'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  filter === f 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f === 'all' ? 'All' : f === 'none' ? 'No Website' : 'Has Website'}
              </button>
            ))}
          </div>

          {/* Export CSV */}
          <button
            onClick={() => exportToCSV(filteredBusinesses)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold text-blue-600">{businesses.length}</div>
          <div className="text-xs text-gray-500 font-medium">Total Found</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold text-red-500">
            {businesses.filter(b => b.website_status === 'none').length}
          </div>
          <div className="text-xs text-gray-500 font-medium">No Website</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold text-green-500">
            {businesses.filter(b => b.phone).length}
          </div>
          <div className="text-xs text-gray-500 font-medium">With Phone</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold text-purple-500">
            {businesses.filter(b => b.email).length}
          </div>
          <div className="text-xs text-gray-500 font-medium">With Email</div>
        </div>
      </div>

      {/* Business Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBusinesses.map((business) => (
          <BusinessCard key={business.place_id} business={business} />
        ))}
      </div>
    </div>
  );
}
