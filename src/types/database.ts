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
          goal_id: string | null
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
          goal_id?: string | null
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
          goal_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          target_date: string | null
          progress: number
          milestones: Json
          category: string | null
          status: 'active' | 'completed' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          target_date?: string | null
          progress?: number
          milestones?: Json
          category?: string | null
          status?: 'active' | 'completed' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          target_date?: string | null
          progress?: number
          milestones?: Json
          category?: string | null
          status?: 'active' | 'completed' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          entry_date: string
          mood: 'great' | 'good' | 'okay' | 'low' | 'rough'
          energy_level: number
          reflection: string | null
          wins: string | null
          challenges: string | null
          tomorrows_focus: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entry_date?: string
          mood: 'great' | 'good' | 'okay' | 'low' | 'rough'
          energy_level: number
          reflection?: string | null
          wins?: string | null
          challenges?: string | null
          tomorrows_focus?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entry_date?: string
          mood?: 'great' | 'good' | 'okay' | 'low' | 'rough'
          energy_level?: number
          reflection?: string | null
          wins?: string | null
          challenges?: string | null
          tomorrows_focus?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      training_sessions: {
        Row: {
          id: string
          user_id: string
          session_date: string
          duration_min: number
          position_played: string
          intensity: number
          mood: 'great' | 'good' | 'okay' | 'low' | 'rough'
          energy_level: number
          technical_ratings: Json
          notes: string | null
          high_points: string | null
          work_on: string | null
          goal_id: string | null
          side_balance: Json | null
          skills_trained: Json
          team_session: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_date?: string
          duration_min: number
          position_played: string
          intensity: number
          mood: 'great' | 'good' | 'okay' | 'low' | 'rough'
          energy_level: number
          technical_ratings?: Json
          notes?: string | null
          high_points?: string | null
          work_on?: string | null
          goal_id?: string | null
          side_balance?: Json | null
          skills_trained?: Json
          team_session?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_date?: string
          duration_min?: number
          position_played?: string
          intensity?: number
          mood?: 'great' | 'good' | 'okay' | 'low' | 'rough'
          energy_level?: number
          technical_ratings?: Json
          notes?: string | null
          high_points?: string | null
          work_on?: string | null
          goal_id?: string | null
          side_balance?: Json | null
          skills_trained?: Json
          team_session?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      run_logs: {
        Row: {
          id: string
          user_id: string
          run_date: string
          distance_m: number
          distance_label: string
          duration_sec: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          run_date?: string
          distance_m: number
          distance_label: string
          duration_sec: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          run_date?: string
          distance_m?: number
          distance_label?: string
          duration_sec?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      run_goals: {
        Row: {
          id: string
          user_id: string
          distance_m: number
          distance_label: string
          target_duration_sec: number
          deadline: string | null
          achieved_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          distance_m: number
          distance_label: string
          target_duration_sec: number
          deadline?: string | null
          achieved_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          distance_m?: number
          distance_label?: string
          target_duration_sec?: number
          deadline?: string | null
          achieved_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      memories: {
        Row: {
          id: string
          user_id: string
          category: string
          title: string
          text: string
          importance: number
          source_id: string | null
          embedding: unknown
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          title: string
          text: string
          importance: number
          source_id?: string | null
          embedding: unknown
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          title?: string
          text?: string
          importance?: number
          source_id?: string | null
          embedding?: unknown
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      colleges: {
        Row: {
          id: string
          user_id: string
          name: string
          location: string
          majors: string[]
          application_type: 'Early Decision' | 'Early Action' | 'Regular Decision' | 'Rolling'
          status: 'researching' | 'planning' | 'applying' | 'submitted' | 'waiting' | 'accepted' | 'rejected' | 'committed'
          acceptance_rate: number | null
          tuition: number | null
          checklist: Json
          essays: Json
          deadlines: Json
          documents: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          location?: string
          majors?: string[]
          application_type?: 'Early Decision' | 'Early Action' | 'Regular Decision' | 'Rolling'
          status?: 'researching' | 'planning' | 'applying' | 'submitted' | 'waiting' | 'accepted' | 'rejected' | 'committed'
          acceptance_rate?: number | null
          tuition?: number | null
          checklist?: Json
          essays?: Json
          deadlines?: Json
          documents?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          location?: string
          majors?: string[]
          application_type?: 'Early Decision' | 'Early Action' | 'Regular Decision' | 'Rolling'
          status?: 'researching' | 'planning' | 'applying' | 'submitted' | 'waiting' | 'accepted' | 'rejected' | 'committed'
          acceptance_rate?: number | null
          tuition?: number | null
          checklist?: Json
          essays?: Json
          deadlines?: Json
          documents?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      college_activities: {
        Row: {
          id: string
          user_id: string
          name: string
          category: 'Athletics' | 'Academic' | 'Leadership' | 'Research' | 'Volunteer' | 'Employment' | 'Personal Project'
          organization: string | null
          role: string | null
          description: string | null
          start_date: string | null
          end_date: string | null
          weekly_hours: number | null
          weeks_per_year: number | null
          leadership: string | null
          achievements: string | null
          skills: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category: 'Athletics' | 'Academic' | 'Leadership' | 'Research' | 'Volunteer' | 'Employment' | 'Personal Project'
          organization?: string | null
          role?: string | null
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          weekly_hours?: number | null
          weeks_per_year?: number | null
          leadership?: string | null
          achievements?: string | null
          skills?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: 'Athletics' | 'Academic' | 'Leadership' | 'Research' | 'Volunteer' | 'Employment' | 'Personal Project'
          organization?: string | null
          role?: string | null
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          weekly_hours?: number | null
          weeks_per_year?: number | null
          leadership?: string | null
          achievements?: string | null
          skills?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      college_awards: {
        Row: {
          id: string
          user_id: string
          name: string
          organization: string | null
          award_date: string | null
          level: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          organization?: string | null
          award_date?: string | null
          level?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          organization?: string | null
          award_date?: string | null
          level?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      college_projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          technologies: string[]
          my_role: string | null
          results: string | null
          challenges: string | null
          lessons_learned: string | null
          documents: Json
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          technologies?: string[]
          my_role?: string | null
          results?: string | null
          challenges?: string | null
          lessons_learned?: string | null
          documents?: Json
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          technologies?: string[]
          my_role?: string | null
          results?: string | null
          challenges?: string | null
          lessons_learned?: string | null
          documents?: Json
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      college_user_data: {
        Row: {
          user_id: string
          test_scores: Json
          financial_aid: Json
          recommendations: Json
          scholarships: Json
          ai_recommendations: Json
          common_app: Json
          resume_settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          test_scores?: Json
          financial_aid?: Json
          recommendations?: Json
          scholarships?: Json
          ai_recommendations?: Json
          common_app?: Json
          resume_settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          test_scores?: Json
          financial_aid?: Json
          recommendations?: Json
          scholarships?: Json
          ai_recommendations?: Json
          common_app?: Json
          resume_settings?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      soccer_matches: {
        Row: {
          id: string
          user_id: string
          match_date: string
          opponent: string
          competition: string | null
          result: 'W' | 'D' | 'L'
          score: string | null
          minutes: number
          goals: number
          assists: number
          rating: number | null
          highlights: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          match_date?: string
          opponent: string
          competition?: string | null
          result: 'W' | 'D' | 'L'
          score?: string | null
          minutes?: number
          goals?: number
          assists?: number
          rating?: number | null
          highlights?: string | null
          notes: string | null
          goal_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          match_date?: string
          opponent?: string
          competition?: string | null
          result?: 'W' | 'D' | 'L'
          score?: string | null
          minutes?: number
          goals?: number
          assists?: number
          rating?: number | null
          highlights?: string | null
          notes?: string | null
          goal_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      soccer_insights: {
        Row: {
          id: string
          user_id: string
          insight_type: 'weakness' | 'strength'
          title: string
          description: string | null
          priority: 'high' | 'medium' | 'low' | null
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          insight_type: 'weakness' | 'strength'
          title: string
          description?: string | null
          priority?: 'high' | 'medium' | 'low' | null
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          insight_type?: 'weakness' | 'strength'
          title?: string
          description?: string | null
          priority?: 'high' | 'medium' | 'low' | null
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_prompts: {
        Row: {
          id: string
          module: string
          content: Json
          active: boolean
          updated_at: string
        }
        Insert: {
          id: string
          module: string
          content: Json
          active?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          module?: string
          content?: Json
          active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      soccer_user_data: {
        Row: {
          user_id: string
          profile: Json
          athlete_development: Json
          onboarding_completed_at: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          profile?: Json
          athlete_development?: Json
          onboarding_completed_at?: string | null
          updated_at?: string
        }
        Update: {
          user_id?: string
          profile?: Json
          athlete_development?: Json
          onboarding_completed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          user_id: string
          hobby_tab_label: string
          hobby_passion: string
          theme: 'dark' | 'light' | 'system'
          theme_palette: 'classic' | 'sunset' | 'ocean' | 'custom-1' | 'custom-2'
          custom_themes: Record<string, unknown> | null
          nav_tab_colors: Record<string, string> | null
          animations_enabled: boolean
          app_tutorial_completed_at: string | null
          tab_intros_completed: Record<string, string> | null
          browser_notifications_enabled: boolean
          email_notifications_enabled: boolean
          reminder_lead_minutes: number
          calendar_sync_prompted_at: string | null
          distance_unit: 'km' | 'mi'
          college_enabled: boolean
          overview_insight_mode: 'analytics' | 'college'
          overview_college_prompt_dismissed_at: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          hobby_tab_label?: string
          hobby_passion?: string
          theme?: 'dark' | 'light' | 'system'
          theme_palette?: 'classic' | 'sunset' | 'ocean' | 'custom-1' | 'custom-2'
          custom_themes?: Record<string, unknown> | null
          nav_tab_colors?: Record<string, string> | null
          animations_enabled?: boolean
          app_tutorial_completed_at?: string | null
          tab_intros_completed?: Record<string, string> | null
          browser_notifications_enabled?: boolean
          email_notifications_enabled?: boolean
          reminder_lead_minutes?: number
          calendar_sync_prompted_at?: string | null
          distance_unit?: 'km' | 'mi'
          college_enabled?: boolean
          overview_insight_mode?: 'analytics' | 'college'
          overview_college_prompt_dismissed_at?: string | null
          updated_at?: string
        }
        Update: {
          user_id?: string
          hobby_tab_label?: string
          hobby_passion?: string
          theme?: 'dark' | 'light' | 'system'
          theme_palette?: 'classic' | 'sunset' | 'ocean' | 'custom-1' | 'custom-2'
          custom_themes?: Record<string, unknown> | null
          nav_tab_colors?: Record<string, string> | null
          animations_enabled?: boolean
          app_tutorial_completed_at?: string | null
          tab_intros_completed?: Record<string, string> | null
          browser_notifications_enabled?: boolean
          email_notifications_enabled?: boolean
          reminder_lead_minutes?: number
          calendar_sync_prompted_at?: string | null
          distance_unit?: 'km' | 'mi'
          college_enabled?: boolean
          overview_insight_mode?: 'analytics' | 'college'
          overview_college_prompt_dismissed_at?: string | null
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
