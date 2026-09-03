/**
 * Generated from the live Supabase schema.
 *
 * Regenerate after any migration:
 *   supabase gen types typescript --project-id suwgpfzzxmwogsdkuote
 *
 * This file is the reason a renamed or mistyped column is a build error
 * rather than a warning in a student's console at 10pm. The client was
 * untyped until a `onConflict: 'user_id,front'` that no index could satisfy
 * made the case for it.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      assignments: {
        Row: {
          brief: string | null
          completed_at: string | null
          created_at: string
          id: string
          kind: string
          status: string
          subject_id: string | null
          topic: string | null
          user_id: string
        }
        Insert: {
          brief?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          kind: string
          status?: string
          subject_id?: string | null
          topic?: string | null
          user_id: string
        }
        Update: Partial<Database['public']['Tables']['assignments']['Insert']>
        Relationships: []
      }
      generated_questions: {
        Row: {
          answer: string
          created_at: string
          difficulty: number
          exam: string
          explanation: string
          id: string
          options: Json
          question: string
          /** Generated: md5(lower(question)). Never write it. */
          question_key: string | null
          subject_id: string
          topic: string
          verified: boolean
        }
        Insert: {
          answer: string
          created_at?: string
          difficulty?: number
          exam: string
          explanation: string
          id?: string
          options: Json
          question: string
          subject_id: string
          topic?: string
          verified?: boolean
        }
        Update: Partial<Database['public']['Tables']['generated_questions']['Insert']>
        Relationships: []
      }
      mastery: {
        Row: {
          error_tags: Json
          level: string | null
          score: number
          subject_id: string
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          error_tags?: Json
          level?: string | null
          score?: number
          subject_id: string
          topic?: string
          updated_at?: string
          user_id: string
        }
        Update: Partial<Database['public']['Tables']['mastery']['Insert']>
        Relationships: []
      }
      practice_attempts: {
        Row: {
          at: string
          correct: number
          exam: string
          id: string
          subject_id: string
          timed: boolean
          total: number
          user_id: string
        }
        Insert: {
          at?: string
          correct?: number
          exam?: string
          id?: string
          subject_id: string
          timed?: boolean
          total?: number
          user_id: string
        }
        Update: Partial<Database['public']['Tables']['practice_attempts']['Insert']>
        Relationships: []
      }
      practice_misses: {
        Row: {
          at: string
          correct: string
          picked: string
          question: string
          question_id: string
          subject_id: string
          topic: string | null
          user_id: string
        }
        Insert: {
          at?: string
          correct?: string
          picked?: string
          question: string
          question_id: string
          subject_id: string
          topic?: string | null
          user_id: string
        }
        Update: Partial<Database['public']['Tables']['practice_misses']['Insert']>
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_color: string | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          exam_focus: string | null
          id: string
          leaderboard_opt_in: boolean
          paystack_customer_code: string | null
          paystack_subscription_code: string | null
          plan: string
          plan_interval: string | null
          plan_updated_at: string | null
          school: string | null
          streak_count: number
          streak_last: string | null
          updated_at: string
        }
        Insert: {
          avatar_color?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          exam_focus?: string | null
          id: string
          leaderboard_opt_in?: boolean
          paystack_customer_code?: string | null
          paystack_subscription_code?: string | null
          plan?: string
          plan_interval?: string | null
          plan_updated_at?: string | null
          school?: string | null
          streak_count?: number
          streak_last?: string | null
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: []
      }
      study_cards: {
        Row: {
          back: string
          created_at: string
          due: string
          ease: number
          front: string
          /** Generated: md5(front). Never write it — Postgres maintains it. */
          front_key: string | null
          id: string
          interval_days: number
          source: string | null
          subject: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          back: string
          created_at?: string
          due?: string
          ease?: number
          front: string
          id?: string
          interval_days?: number
          source?: string | null
          subject?: string | null
          updated_at?: string
          user_id: string
        }
        Update: Partial<Database['public']['Tables']['study_cards']['Insert']>
        Relationships: []
      }
      tutor_sessions: {
        Row: {
          created_at: string
          id: string
          messages: Json
          subject_id: string
          subject_name: string | null
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          subject_id: string
          subject_name?: string | null
          topic?: string
          updated_at?: string
          user_id: string
        }
        Update: Partial<Database['public']['Tables']['tutor_sessions']['Insert']>
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: {
      leaderboard_week: {
        Args: { limit_n?: number }
        Returns: {
          rank: number
          display_name: string
          correct: number
          total: number
          accuracy: number
          streak: number
          is_me: boolean
        }[]
      }
    }
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
