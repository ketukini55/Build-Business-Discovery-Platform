import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 2 min timeout for search operations
});

export interface SearchParams {
  country: string;
  category: string;
  max_results?: number;
  filter_no_website?: boolean;
}

export interface SocialMediaLink {
  platform: string;
  url: string;
}

export interface Business {
  place_id: string;
  name: string;
  category: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  website_status: 'none' | 'found' | 'unknown';
  social_media: SocialMediaLink[];
  rating?: number;
  total_ratings?: number;
  latitude?: number;
  longitude?: number;
  ai_summary?: string;
  contact_recommendation?: string;
}

export interface SearchResponse {
  search_id: number;
  total_found: number;
  businesses: Business[];
}

export const searchBusinesses = async (params: SearchParams): Promise<SearchResponse> => {
  const response = await api.post<SearchResponse>('/api/search', params);
  return response.data;
};

export const getResults = async (searchId?: number, websiteStatus?: string): Promise<{ businesses: Business[] }> => {
  const params: Record<string, string | number> = {};
  if (searchId) params.search_id = searchId;
  if (websiteStatus) params.website_status = websiteStatus;
  
  const response = await api.get('/api/results', { params });
  return response.data;
};

export const getBusinessDetail = async (placeId: string): Promise<Business> => {
  const response = await api.get<Business>(`/api/business/${placeId}`);
  return response.data;
};

export const exportToCSV = (businesses: Business[]): void => {
  const headers = ['Name', 'Category', 'Address', 'Phone', 'Email', 'Website Status', 'Rating', 'AI Summary', 'Contact Recommendation'];
  
  const rows = businesses.map(b => [
    b.name,
    b.category,
    b.address,
    b.phone || '',
    b.email || '',
    b.website_status,
    b.rating?.toString() || '',
    b.ai_summary || '',
    b.contact_recommendation || '',
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `business-leads-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
