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
          updated_at: string
          full_name: string | null
          email: string | null
          mobile_number: string | null
          user_type: 'general_user' | 'skilled_professional'
          avatar_url: string | null
          website: string | null
          location_address: string | null
          location_coordinates: unknown | null
          business_name: string | null
          email_verified: boolean
          is_active: boolean
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          email?: string | null
          mobile_number?: string | null
          user_type?: 'general_user' | 'skilled_professional'
          avatar_url?: string | null
          website?: string | null
          location_address?: string | null
          location_coordinates?: unknown | null
          business_name?: string | null
          email_verified?: boolean
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          email?: string | null
          mobile_number?: string | null
          user_type?: 'general_user' | 'skilled_professional'
          avatar_url?: string | null
          website?: string | null
          location_address?: string | null
          location_coordinates?: unknown | null
          business_name?: string | null
          email_verified?: boolean
          is_active?: boolean
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
      workers: {
        Row: {
          id: number
          created_at: string
          updated_at: string
          user_id: string | null
          full_name: string
          email: string | null
          mobile_number: string
          business_name: string | null
          service_category: 'construction' | 'plumbing' | 'electrical' | 'carpentry' | 'painting' | 'welding' | 'home_tutor' | 'flooring_tiles' | 'false_ceiling' | 'tailoring' | 'cleaning' | 'other'
          service_subcategory: string
          location_address: string | null
          location_coordinates: unknown | null
          email_verified: boolean
          is_active: boolean
          rating: number | null
          total_reviews: number
        }
        Insert: {
          id?: number
          created_at?: string
          updated_at?: string
          user_id?: string | null
          full_name: string
          email?: string | null
          mobile_number: string
          business_name?: string | null
          service_category: 'construction' | 'plumbing' | 'electrical' | 'carpentry' | 'painting' | 'welding' | 'home_tutor' | 'flooring_tiles' | 'false_ceiling' | 'tailoring' | 'cleaning' | 'other'
          service_subcategory: string
          location_address?: string | null
          location_coordinates?: unknown | null
          email_verified?: boolean
          is_active?: boolean
          rating?: number | null
          total_reviews?: number
        }
        Update: {
          id?: number
          created_at?: string
          updated_at?: string
          user_id?: string | null
          full_name?: string
          email?: string | null
          mobile_number?: string
          business_name?: string | null
          service_category?: 'construction' | 'plumbing' | 'electrical' | 'carpentry' | 'painting' | 'welding' | 'home_tutor' | 'flooring_tiles' | 'false_ceiling' | 'tailoring' | 'cleaning' | 'other'
          service_subcategory?: string
          location_address?: string | null
          location_coordinates?: unknown | null
          email_verified?: boolean
          is_active?: boolean
          rating?: number | null
          total_reviews?: number
        }
        Relationships: [
          {
            foreignKeyName: "workers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      service_categories: {
        Row: {
          id: number
          created_at: string
          category_id: string
          category_name: string
          is_active: boolean
        }
        Insert: {
          id?: number
          created_at?: string
          category_id: string
          category_name: string
          is_active?: boolean
        }
        Update: {
          id?: number
          created_at?: string
          category_id?: string
          category_name?: string
          is_active?: boolean
        }
        Relationships: []
      }
      service_subcategories: {
        Row: {
          id: number
          created_at: string
          category_id: string
          subcategory_name: string
          is_active: boolean
        }
        Insert: {
          id?: number
          created_at?: string
          category_id: string
          subcategory_name: string
          is_active?: boolean
        }
        Update: {
          id?: number
          created_at?: string
          category_id?: string
          subcategory_name?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "service_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["category_id"]
          }
        ]
      }
      user_sessions: {
        Row: {
          id: string
          created_at: string
          user_id: string
          session_token: string
          expires_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          session_token: string
          expires_at: string
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          session_token?: string
          expires_at?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      email_verification_tokens: {
        Row: {
          id: string
          created_at: string
          user_id: string
          token: string
          expires_at: string
          is_used: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          token: string
          expires_at: string
          is_used?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          token?: string
          expires_at?: string
          is_used?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "email_verification_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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