export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          mobile: string | null
          user_type: 'skilled_professional' | 'general_user' | null
          location_address: string | null
          location_coordinates: string | null
          business_name: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          mobile?: string | null
          user_type?: 'skilled_professional' | 'general_user' | null
          location_address?: string | null
          location_coordinates?: string | null
          business_name?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          mobile?: string | null
          user_type?: 'skilled_professional' | 'general_user' | null
          location_address?: string | null
          location_coordinates?: string | null
          business_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      professional_services: {
        Row: {
          id: number
          created_at: string
          user_id: string
          category: 'plumbing' | 'electrical' | 'cleaning' | 'construction' | 'carpentry' | 'painting' | 'welding' | 'home_tutor' | 'flooring_tiles' | 'false_ceiling' | 'tailoring' | 'other'
          custom_category: string | null
          subcategories: string[]
        }
        Insert: {
          id?: number
          created_at?: string
          user_id: string
          category: 'plumbing' | 'electrical' | 'cleaning' | 'construction' | 'carpentry' | 'painting' | 'welding' | 'home_tutor' | 'flooring_tiles' | 'false_ceiling' | 'tailoring' | 'other'
          custom_category?: string | null
          subcategories?: string[]
        }
        Update: {
          id?: number
          created_at?: string
          user_id?: string
          category?: 'plumbing' | 'electrical' | 'cleaning' | 'construction' | 'carpentry' | 'painting' | 'welding' | 'home_tutor' | 'flooring_tiles' | 'false_ceiling' | 'tailoring' | 'other'
          custom_category?: string | null
          subcategories?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "professional_services_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      workers: {
        Row: {
          id: number
          created_at: string
          full_name: string
          mobile_number: string
          business_name: string | null
          service_category: string
          service_subcategory: string
          location_address: string | null
          location_coordinates: unknown | null
        }
        Insert: {
          id?: number
          created_at?: string
          full_name: string
          mobile_number: string
          business_name?: string | null
          service_category: string
          service_subcategory: string
          location_address?: string | null
          location_coordinates?: unknown | null
        }
        Update: {
          id?: number
          created_at?: string
          full_name?: string
          mobile_number?: string
          business_name?: string | null
          service_category?: string
          service_subcategory?: string
          location_address?: string | null
          location_coordinates?: unknown | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 