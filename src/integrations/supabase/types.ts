// ... existing code ...
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      },
      workers: {
        Row: {
          id: number
          user_id: string
          name: string
          email: string
          phone: string
          address: string
          city: string
          state: string
          zip: string
          country: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          name: string
          email: string
          phone: string
          address: string
          city: string
          state: string
          zip: string
          country: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          name?: string
          email?: string
          phone?: string
          address?: string
          city?: string
          state?: string
          zip?: string
          country?: string
          created_at?: string
          updated_at?: string
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
      },
      service_categories: {
        Row: {
          id: number
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
        ]
      },
      service_subcategories: {
        Row: {
          id: number
          name: string
          category_id: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          category_id: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          category_id?: number
          created_at?: string
          updated_at?: string
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
      },
      user_sessions: {
        Row: {
          id: number
          user_id: string
          session_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          session_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          session_id?: string
          created_at?: string
          updated_at?: string
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
      },
      email_verification_tokens: {
        Row: {
          id: number
          user_id: string
          token: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          token: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          token?: string
          created_at?: string
          updated_at?: string
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
      },
      reviews: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          worker_id: number
          user_id: string
          rating: number
          comment: string | null
          user_name: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          worker_id: number
          user_id: string
          rating: number
          comment?: string | null
          user_name?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          worker_id?: number
          user_id?: string
          rating?: number
          comment?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
// ... existing code ...
