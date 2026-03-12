export interface Event {
  id: string;
  title: string;
  description: string | null;
  date_start: string;
  date_end: string | null;
  venue_name: string | null;
  city: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  genres: string[];
  type: 'club' | 'festival' | 'open_air' | 'virtual';
  flyer_url: string | null;
  lineup: string[];
  ticket_url: string | null;
  ticket_affiliate_url: string | null;
  source: string;
  status: 'approved' | 'pending' | 'rejected';
  created_at: string;
  // Computed client-side
  distance_km?: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
  label: string; // e.g. "Cape Town" or "Berlin"
}

export interface EventFilters {
  genres: string[];
  dateRange: 'weekend' | 'month' | 'all';
  radius: number; // km, 0 = worldwide
}
