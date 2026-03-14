import React, { useState } from 'react';
import Head from 'next/head';
import SearchForm from '@/components/SearchForm';
import ResultsSection from '@/components/ResultsSection';
import { searchBusinesses, type Business } from '@/utils/api';

export default function Home() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchId, setSearchId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (
    country: string, 
    category: string, 
    maxResults: number, 
    filterNoWebsite: boolean
  ) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      const result = await searchBusinesses({
        country,
        category,
        max_results: maxResults,
        filter_no_website: filterNoWebsite,
      });
      
      setBusinesses(result.businesses);
      setSearchId(result.search_id);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } };
        setError(axiosErr.response?.data?.detail || 'Failed to search businesses. Please try again.');
      } else {
        setError('Failed to connect to the backend. Please ensure the backend server is running.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Business Discovery Platform - Find Leads Without Websites</title>
        <meta name="description" content="Find local businesses without websites - perfect for selling web development services" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">B</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Business Discovery Platform</h1>
                  <p className="text-xs text-gray-500">Find your next web development clients</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                  AI Powered
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
                  Google Maps
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        {!hasSearched && (
          <section className="py-16 px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
                🚀 Find Business Leads
              </span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                Discover Local Businesses<br />
                <span className="text-blue-600">Without Websites</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Identify small businesses that need a web presence and turn them into your clients. 
                Powered by Google Maps and AI to give you complete business intelligence.
              </p>
            </div>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {['🗺️ Google Maps Integration', '🤖 AI Summaries', '📊 CSV Export', '📱 Mobile Friendly', '🔍 Website Detection'].map(f => (
                <span key={f} className="bg-white shadow-sm border border-gray-100 text-gray-700 text-sm px-4 py-2 rounded-full font-medium">
                  {f}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Search Form */}
        <section className={`px-4 ${hasSearched ? 'py-8' : 'pb-16'}`}>
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </section>

        {/* Results */}
        <section className="px-4 pb-16">
          <ResultsSection 
            businesses={businesses}
            searchId={searchId}
            isLoading={isLoading}
            error={error}
          />
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100 py-8 mt-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
            <p>Business Discovery Platform © {new Date().getFullYear()}</p>
            <p className="mt-1">Powered by Google Maps API • OpenAI • Next.js • FastAPI</p>
          </div>
        </footer>
      </div>
    </>
  );
}
