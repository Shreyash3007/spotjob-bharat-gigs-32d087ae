export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          name: string
          phone: string
          avatar: string | null
          location: { lat: number; lng: number } | null
          rating: number
          verified: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          phone: string
          avatar?: string | null
          location?: { lat: number; lng: number } | null
          rating?: number
          verified?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          phone?: string
          avatar?: string | null
          location?: { lat: number; lng: number } | null
          rating?: number
          verified?: boolean
        }
      }
      jobs: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          location: { lat: number; lng: number }
          address: string
          category: string
          pay: { amount: number; type: 'hourly' | 'fixed' | 'daily' }
          duration: string
          start_date: string | null
          end_date: string | null
          poster_id: string
          status: 'open' | 'filled' | 'expired'
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          location: { lat: number; lng: number }
          address: string
          category: string
          pay: { amount: number; type: 'hourly' | 'fixed' | 'daily' }
          duration: string
          start_date?: string | null
          end_date?: string | null
          poster_id: string
          status?: 'open' | 'filled' | 'expired'
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          location?: { lat: number; lng: number }
          address?: string
          category?: string
          pay?: { amount: number; type: 'hourly' | 'fixed' | 'daily' }
          duration?: string
          start_date?: string | null
          end_date?: string | null
          poster_id?: string
          status?: 'open' | 'filled' | 'expired'
        }
      }
      applications: {
        Row: {
          id: string
          created_at: string
          job_id: string
          applicant_id: string
          status: 'pending' | 'accepted' | 'rejected'
          message: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          job_id: string
          applicant_id: string
          status?: 'pending' | 'accepted' | 'rejected'
          message?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          job_id?: string
          applicant_id?: string
          status?: 'pending' | 'accepted' | 'rejected'
          message?: string | null
        }
      }
      reviews: {
        Row: {
          id: string
          created_at: string
          job_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          job_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          job_id?: string
          reviewer_id?: string
          reviewee_id?: string
          rating?: number
          comment?: string | null
        }
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
  }
} 