/**
 * Supabase database type definitions.
 * Update when new migrations are added.
 */

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
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          priority: 'low' | 'medium' | 'high'
          category: string | null
          deadline: string | null
          completed: boolean
          estimated_duration: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high'
          category?: string | null
          deadline?: string | null
          completed?: boolean
          estimated_duration?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high'
          category?: string | null
          deadline?: string | null
          completed?: boolean
          estimated_duration?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type TableRow<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T] extends { Row: infer R } ? R : never

export type TableInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T] extends { Insert: infer I } ? I : never

export type TableUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T] extends { Update: infer U } ? U : never
