'use client';
import React, { useState } from 'react';
import { MapPin, Phone, Mail, Globe, Star, ExternalLink, ChevronDown, ChevronUp, Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';
import type { Business } from '@/utils/api';

interface BusinessCardProps {
  business: Business;
}

const SocialIcon = ({ platform }: { platform: string }) => {
  const icons: Record<string, React.ReactNode> = {
    facebook: <Facebook className="w-4 h-4" />,
    instagram: <Instagram className="w-4 h-4" />,
    twitter: <Twitter className="w-4 h-4" />,
    linkedin: <Linkedin className="w-4 h-4" />,
    youtube: <Youtube className="w-4 h-4" />,
  };
  return <>{icons[platform] || <ExternalLink className="w-4 h-4" />}</>;
};

export default function BusinessCard({ business }: BusinessCardProps) {
  const [expanded, setExpanded] = useState(false);

  const websiteStatusBadge = () => {
    if (business.website_status === 'found') {
      return <span className="badge-green">✓ Has Website</span>;
    }
    return <span className="badge-red">✗ No Website</span>;
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{business.name}</h3>
          <span className="badge-blue">{business.category}</span>
        </div>
        <div className="flex flex-col items-end gap-2">
          {websiteStatusBadge()}
          {business.rating && (
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium text-gray-700">
                {business.rating} ({business.total_ratings || 0})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        {business.address && (
          <div className="flex items-start gap-2 text-gray-600">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
            <span className="text-sm">{business.address}</span>
          </div>
        )}
        {business.phone && (
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="w-4 h-4 flex-shrink-0 text-green-500" />
            <a href={`tel:${business.phone}`} className="text-sm hover:text-blue-600 transition-colors">
              {business.phone}
            </a>
          </div>
        )}
        {business.email && (
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="w-4 h-4 flex-shrink-0 text-purple-500" />
            <a href={`mailto:${business.email}`} className="text-sm hover:text-blue-600 transition-colors">
              {business.email}
            </a>
          </div>
        )}
        {business.website && (
          <div className="flex items-center gap-2 text-gray-600">
            <Globe className="w-4 h-4 flex-shrink-0 text-orange-500" />
            <a href={business.website} target="_blank" rel="noopener noreferrer" 
               className="text-sm hover:text-blue-600 transition-colors truncate max-w-xs">
              {business.website}
            </a>
          </div>
        )}
      </div>

      {/* Social Media */}
      {business.social_media && business.social_media.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {business.social_media.map((sm, idx) => (
            <a
              key={idx}
              href={sm.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-blue-100 rounded-full text-gray-600 hover:text-blue-700 text-xs font-medium transition-colors"
            >
              <SocialIcon platform={sm.platform} />
              <span className="capitalize">{sm.platform}</span>
            </a>
          ))}
        </div>
      )}

      {/* AI Summary Toggle */}
      {(business.ai_summary || business.contact_recommendation) && (
        <div className="border-t border-gray-100 pt-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {expanded ? 'Hide AI Insights' : 'Show AI Insights'}
          </button>

          {expanded && (
            <div className="mt-4 space-y-4">
              {business.ai_summary && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-blue-800 mb-2">📊 Business Summary</h4>
                  <p className="text-sm text-blue-700 leading-relaxed">{business.ai_summary}</p>
                </div>
              )}
              {business.contact_recommendation && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-green-800 mb-2">💡 Contact Strategy</h4>
                  <p className="text-sm text-green-700 leading-relaxed">{business.contact_recommendation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
