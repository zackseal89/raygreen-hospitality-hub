export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          external_portal_user: string | null
          id: string
          ip_address: unknown | null
          new_data: Json | null
          old_data: Json | null
          operation: string
          source: string | null
          table_name: string
          user_agent: string | null
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          external_portal_user?: string | null
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          source?: string | null
          table_name: string
          user_agent?: string | null
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          external_portal_user?: string | null
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          source?: string | null
          table_name?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      booking_status_history: {
        Row: {
          booking_id: string
          changed_by: string | null
          created_at: string | null
          id: string
          new_status: string
          notes: string | null
          old_status: string | null
        }
        Insert: {
          booking_id: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_status: string
          notes?: string | null
          old_status?: string | null
        }
        Update: {
          booking_id?: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_status?: string
          notes?: string | null
          old_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_status_history_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          adults: number
          booking_reference: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          check_in_date: string
          check_out_date: string
          children: number
          created_at: string
          guest_email: string
          guest_name: string
          guest_phone: string | null
          id: string
          payment_method: string | null
          payment_status: string | null
          room_type_id: string
          special_requests: string | null
          status: string
          stripe_session_id: string | null
          total_price: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          adults?: number
          booking_reference?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          check_in_date: string
          check_out_date: string
          children?: number
          created_at?: string
          guest_email: string
          guest_name: string
          guest_phone?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          room_type_id: string
          special_requests?: string | null
          status?: string
          stripe_session_id?: string | null
          total_price: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          adults?: number
          booking_reference?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          check_in_date?: string
          check_out_date?: string
          children?: number
          created_at?: string
          guest_email?: string
          guest_name?: string
          guest_phone?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          room_type_id?: string
          special_requests?: string | null
          status?: string
          stripe_session_id?: string | null
          total_price?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      conference_bookings: {
        Row: {
          attendees: number
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          end_time: string
          event_date: string
          event_type: string | null
          id: string
          requirements: string | null
          start_time: string
          status: string
          stripe_session_id: string | null
          total_price: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          attendees: number
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          end_time: string
          event_date: string
          event_type?: string | null
          id?: string
          requirements?: string | null
          start_time: string
          status?: string
          stripe_session_id?: string | null
          total_price?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          attendees?: number
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          end_time?: string
          event_date?: string
          event_type?: string | null
          id?: string
          requirements?: string | null
          start_time?: string
          status?: string
          stripe_session_id?: string | null
          total_price?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      external_portal_tokens: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          permissions: Json | null
          portal_name: string
          token_hash: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          permissions?: Json | null
          portal_name: string
          token_hash: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          permissions?: Json | null
          portal_name?: string
          token_hash?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          available: boolean | null
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          available?: boolean | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          available?: boolean | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          booking_confirmations: boolean | null
          created_at: string | null
          email_notifications: boolean | null
          id: string
          promotional_emails: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_confirmations?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          promotional_emails?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_confirmations?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          promotional_emails?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      room_availability: {
        Row: {
          available_rooms: number
          base_price: number | null
          created_at: string | null
          date: string
          id: string
          room_type_id: string
          updated_at: string | null
        }
        Insert: {
          available_rooms?: number
          base_price?: number | null
          created_at?: string | null
          date: string
          id?: string
          room_type_id: string
          updated_at?: string | null
        }
        Update: {
          available_rooms?: number
          base_price?: number | null
          created_at?: string | null
          date?: string
          id?: string
          room_type_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_availability_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      room_types: {
        Row: {
          amenities: string[] | null
          base_price: number
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          max_occupancy: number
          name: string
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          base_price: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          max_occupancy: number
          name: string
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          base_price?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          max_occupancy?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          customer_name: string
          id: string
          is_featured: boolean | null
          rating: number | null
          review: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          id?: string
          is_featured?: boolean | null
          rating?: number | null
          review: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          id?: string
          is_featured?: boolean | null
          rating?: number | null
          review?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_bookings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_action: string
          p_table_name: string
          p_record_id?: string
          p_old_values?: Json
          p_new_values?: Json
        }
        Returns: undefined
      }
      update_booking_status: {
        Args: { booking_id: string; new_status: string; admin_user_id?: string }
        Returns: undefined
      }
      update_user_role: {
        Args: { target_user_id: string; new_role: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
