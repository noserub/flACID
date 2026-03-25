/**
 * Database Schema Types
 *
 * TypeScript interfaces for Supabase database schema.
 * Run `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts`
 * to regenerate from your live Supabase project.
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
        };
      };
      tracks: {
        Row: {
          id: string;
          title: string;
          artist: string;
          album: string | null;
          duration: number;
          audio_url: string;
          cover_image_url: string | null;
          visualization_type: string;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          artist: string;
          album?: string | null;
          duration: number;
          audio_url: string;
          cover_image_url?: string | null;
          visualization_type?: string;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['tracks']['Insert']>;
      };
      albums: {
        Row: {
          id: string;
          title: string;
          artist: string;
          year: number;
          cover_image_url: string;
          description: string | null;
          spotify_url: string | null;
          apple_music_url: string | null;
          bandcamp_url: string | null;
          track_names: string[] | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          artist: string;
          year: number;
          cover_image_url: string;
          description?: string | null;
          spotify_url?: string | null;
          apple_music_url?: string | null;
          bandcamp_url?: string | null;
          track_names?: string[] | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['albums']['Insert']>;
      };
      tour_dates: {
        Row: {
          id: string;
          date: string;
          venue: string;
          city: string;
          country: string;
          ticket_url: string | null;
          status: 'upcoming' | 'sold_out' | 'cancelled' | 'selling_fast';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          venue: string;
          city: string;
          country: string;
          ticket_url?: string | null;
          status?: 'upcoming' | 'sold_out' | 'cancelled' | 'selling_fast';
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['tour_dates']['Insert']>;
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['newsletter_subscribers']['Insert']>;
      };
      site_admins: {
        Row: {
          user_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['site_admins']['Insert']>;
      };
      photos: {
        Row: {
          id: string;
          url: string;
          thumbnail_url: string | null;
          alt_text: string | null;
          photographer: string | null;
          tab_id: string | null;
          caption: string | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          url: string;
          thumbnail_url?: string | null;
          alt_text?: string | null;
          photographer?: string | null;
          tab_id?: string | null;
          caption?: string | null;
          order_index?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['photos']['Insert']>;
      };
    };
  };
}

// Convenience type aliases
export type Track = Database['public']['Tables']['tracks']['Row'];
export type TrackInsert = Database['public']['Tables']['tracks']['Insert'];
export type TrackUpdate = Database['public']['Tables']['tracks']['Update'];

export type Album = Database['public']['Tables']['albums']['Row'];
export type AlbumInsert = Database['public']['Tables']['albums']['Insert'];
export type AlbumUpdate = Database['public']['Tables']['albums']['Update'];

export type TourDate = Database['public']['Tables']['tour_dates']['Row'];
export type TourDateInsert = Database['public']['Tables']['tour_dates']['Insert'];
export type TourDateUpdate = Database['public']['Tables']['tour_dates']['Update'];

export type Photo = Database['public']['Tables']['photos']['Row'];
export type PhotoInsert = Database['public']['Tables']['photos']['Insert'];
export type PhotoUpdate = Database['public']['Tables']['photos']['Update'];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type NewsletterSubscriber = Database['public']['Tables']['newsletter_subscribers']['Row'];
export type NewsletterSubscriberInsert = Database['public']['Tables']['newsletter_subscribers']['Insert'];

export type SiteAdmin = Database['public']['Tables']['site_admins']['Row'];
