'use client';
import React, { useState } from 'react';
import { Search, Globe, MapPin } from 'lucide-react';

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria",
  "Bangladesh", "Belgium", "Brazil", "Bulgaria", "Canada", "Chile", "China",
  "Colombia", "Croatia", "Czech Republic", "Denmark", "Egypt", "Ethiopia",
  "Finland", "France", "Germany", "Ghana", "Greece", "Hungary", "India",
  "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Japan",
  "Jordan", "Kenya", "Malaysia", "Mexico", "Morocco", "Netherlands",
  "New Zealand", "Nigeria", "Norway", "Pakistan", "Peru", "Philippines",
  "Poland", "Portugal", "Romania", "Russia", "Saudi Arabia", "South Africa",
  "South Korea", "Spain", "Sweden", "Switzerland", "Thailand", "Turkey",
  "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
  "Vietnam", "Zimbabwe"
];

const CATEGORIES = [
  "Restaurants", "Cafes", "Bakeries", "Pizza shops",
  "Plumbers", "Electricians", "HVAC services", "Landscaping",
  "Hair salons", "Barber shops", "Nail salons", "Spas",
  "Auto repair shops", "Car dealerships", "Tire shops",
  "Dentists", "Doctors", "Pharmacies", "Opticians",
  "Law firms", "Accounting firms", "Real estate agents",
  "Gyms", "Yoga studios", "Dance studios",
  "Pet stores", "Veterinarians", "Dog grooming",
  "Bookstores", "Clothing stores", "Jewelry stores",
  "Hotels", "Bed and breakfast", "Motels",
  "Cleaning services", "Moving companies", "Storage facilities",
  "Florists", "Wedding planners", "Photography studios",
  "Construction companies", "Painting services", "Roofing companies",
  "Schools", "Tutoring centers", "Day care centers"
];

interface SearchFormProps {
  onSearch: (country: string, category: string, maxResults: number, filterNoWebsite: boolean) => void;
  isLoading: boolean;
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [maxResults, setMaxResults] = useState(20);
  const [filterNoWebsite, setFilterNoWebsite] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = customCategory.trim() || category;
    if (!country || !finalCategory) return;
    onSearch(country, finalCategory, maxResults, filterNoWebsite);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Search className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Find Business Leads</h2>
        <p className="text-gray-500 mt-2">Discover local businesses without websites</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Country Selection */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Globe className="w-4 h-4 text-blue-500" />
            Country
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-800"
          >
            <option value="">Select a country...</option>
            {COUNTRIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Business Category */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <MapPin className="w-4 h-4 text-blue-500" />
            Business Category
          </label>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setCustomCategory(''); }}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-800"
          >
            <option value="">Select a category...</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Custom Category */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-gray-700">
            Or type a custom category
          </label>
          <input
            type="text"
            value={customCategory}
            onChange={(e) => { setCustomCategory(e.target.value); setCategory(''); }}
            placeholder="e.g., florists, tutors, yoga studios..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-800"
          />
        </div>

        {/* Max Results */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Max Results: {maxResults}
          </label>
          <input
            type="range"
            min={5}
            max={50}
            step={5}
            value={maxResults}
            onChange={(e) => setMaxResults(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>5</span>
            <span>50</span>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Filter Options</label>
          <label className="flex items-center gap-3 cursor-pointer mt-3">
            <div
              onClick={() => setFilterNoWebsite(!filterNoWebsite)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${filterNoWebsite ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${filterNoWebsite ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm text-gray-600">Only show businesses without websites</span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || (!country) || (!category && !customCategory.trim())}
        className="mt-8 w-full btn-primary flex items-center justify-center gap-3 text-lg"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Searching businesses...
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            Search for Businesses
          </>
        )}
      </button>
    </form>
  );
}
