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
      calendar_events: {
        Row: {
          attendees: string[] | null
          created_at: string | null
          created_by: string
          description: string | null
          end_time: string | null
          id: string
          is_all_day: boolean | null
          location: string | null
          recurrence_rule: string | null
          space_id: string
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          attendees?: string[] | null
          created_at?: string | null
          created_by: string
          description?: string | null
          end_time?: string | null
          id?: string
          is_all_day?: boolean | null
          location?: string | null
          recurrence_rule?: string | null
          space_id: string
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          attendees?: string[] | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_time?: string | null
          id?: string
          is_all_day?: boolean | null
          location?: string | null
          recurrence_rule?: string | null
          space_id?: string
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      display_names: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          space_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id?: string
          space_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          space_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "display_names_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_cards: {
        Row: {
          assignee_id: string | null
          column_id: string
          created_at: string | null
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          labels: string[] | null
          position: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          column_id: string
          created_at?: string | null
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          labels?: string[] | null
          position?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          column_id?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          labels?: string[] | null
          position?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flow_cards_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_cards_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "flow_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_cards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_columns: {
        Row: {
          color: string | null
          created_at: string | null
          flow_id: string
          id: string
          name: string
          position: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          flow_id: string
          id?: string
          name: string
          position?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          flow_id?: string
          id?: string
          name?: string
          position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "flow_columns_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_permissions: {
        Row: {
          created_at: string | null
          flow_id: string
          group_id: string | null
          id: string
          is_allow: boolean | null
          permission_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          flow_id: string
          group_id?: string | null
          id?: string
          is_allow?: boolean | null
          permission_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          flow_id?: string
          group_id?: string | null
          id?: string
          is_allow?: boolean | null
          permission_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flow_permissions_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_permissions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "member_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      flows: {
        Row: {
          archived_at: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          name: string
          position: number | null
          settings: Json | null
          space_id: string
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          name: string
          position?: number | null
          settings?: Json | null
          space_id: string
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          position?: number | null
          settings?: Json | null
          space_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flows_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flows_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      group_permissions: {
        Row: {
          group_id: string
          permission_id: string
        }
        Insert: {
          group_id: string
          permission_id: string
        }
        Update: {
          group_id?: string
          permission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_permissions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "member_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      media_files: {
        Row: {
          created_at: string | null
          dimensions: Json | null
          duration: number | null
          file_name: string
          file_size: number | null
          id: string
          message_id: string | null
          mime_type: string | null
          storage_url: string
          thumbnail_url: string | null
          uploaded_by: string
        }
        Insert: {
          created_at?: string | null
          dimensions?: Json | null
          duration?: number | null
          file_name: string
          file_size?: number | null
          id?: string
          message_id?: string | null
          mime_type?: string | null
          storage_url: string
          thumbnail_url?: string | null
          uploaded_by: string
        }
        Update: {
          created_at?: string | null
          dimensions?: Json | null
          duration?: number | null
          file_name?: string
          file_size?: number | null
          id?: string
          message_id?: string | null
          mime_type?: string | null
          storage_url?: string
          thumbnail_url?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_files_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      member_group_users: {
        Row: {
          assigned_at: string | null
          assigned_by: string
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by: string
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_group_users_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_group_users_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "member_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_group_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      member_groups: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string
          id: string
          is_mentionable: boolean | null
          name: string
          permission_template_id: string | null
          position: number | null
          space_id: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          is_mentionable?: boolean | null
          name: string
          permission_template_id?: string | null
          position?: number | null
          space_id: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          is_mentionable?: boolean | null
          name?: string
          permission_template_id?: string | null
          position?: number | null
          space_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_groups_permission_template_id_fkey"
            columns: ["permission_template_id"]
            isOneToOne: false
            referencedRelation: "permission_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_groups_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          created_at: string | null
          deleted_at: string | null
          edited_at: string | null
          id: string
          message_type: Database["public"]["Enums"]["message_type"] | null
          metadata: Json | null
          reply_to_id: string | null
          sender_id: string
          sender_username: string
          space_id: string
          zone_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"] | null
          metadata?: Json | null
          reply_to_id?: string | null
          sender_id: string
          sender_username: string
          space_id: string
          zone_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"] | null
          metadata?: Json | null
          reply_to_id?: string | null
          sender_id?: string
          sender_username?: string
          space_id?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string | null
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string | null
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string | null
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      permission_templates: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_system: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_system?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_system?: boolean | null
          name?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      pinned_messages: {
        Row: {
          id: string
          message_id: string
          pinned_at: string | null
          pinned_by: string
          zone_id: string
        }
        Insert: {
          id?: string
          message_id: string
          pinned_at?: string | null
          pinned_by: string
          zone_id: string
        }
        Update: {
          id?: string
          message_id?: string
          pinned_at?: string | null
          pinned_by?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pinned_messages_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pinned_messages_pinned_by_fkey"
            columns: ["pinned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pinned_messages_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string
          last_seen_at: string | null
          settings: Json | null
          status: Database["public"]["Enums"]["user_status"] | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          last_seen_at?: string | null
          settings?: Json | null
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          last_seen_at?: string | null
          settings?: Json | null
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      read_receipts: {
        Row: {
          id: string
          message_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "read_receipts_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "read_receipts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      space_members: {
        Row: {
          id: string
          joined_at: string | null
          last_accessed_at: string | null
          last_accessed_zone_id: string | null
          permission_template_id: string | null
          space_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          last_accessed_at?: string | null
          last_accessed_zone_id?: string | null
          permission_template_id?: string | null
          space_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          last_accessed_at?: string | null
          last_accessed_zone_id?: string | null
          permission_template_id?: string | null
          space_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "space_members_last_accessed_zone_id_fkey"
            columns: ["last_accessed_zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "space_members_permission_template_id_fkey"
            columns: ["permission_template_id"]
            isOneToOne: false
            referencedRelation: "permission_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "space_members_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "space_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      spaces: {
        Row: {
          archived_at: string | null
          avatar_url: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_public: boolean | null
          last_activity_at: string | null
          member_count: number | null
          name: string | null
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          avatar_url?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          last_activity_at?: string | null
          member_count?: number | null
          name?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          last_activity_at?: string | null
          member_count?: number | null
          name?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spaces_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      template_permissions: {
        Row: {
          permission_id: string
          template_id: string
        }
        Insert: {
          permission_id: string
          template_id: string
        }
        Update: {
          permission_id?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_permissions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "permission_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          permission_id: string
          space_id: string
          user_id: string
        }
        Insert: {
          permission_id: string
          space_id: string
          user_id: string
        }
        Update: {
          permission_id?: string
          space_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_presence: {
        Row: {
          current_space_id: string | null
          current_zone_id: string | null
          last_seen_at: string | null
          status: Database["public"]["Enums"]["user_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_space_id?: string | null
          current_zone_id?: string | null
          last_seen_at?: string | null
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_space_id?: string | null
          current_zone_id?: string | null
          last_seen_at?: string | null
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_presence_current_space_id_fkey"
            columns: ["current_space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_presence_current_zone_id_fkey"
            columns: ["current_zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_presence_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      zone_permissions: {
        Row: {
          created_at: string | null
          group_id: string | null
          id: string
          is_allow: boolean | null
          permission_id: string
          user_id: string | null
          zone_id: string
        }
        Insert: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          is_allow?: boolean | null
          permission_id: string
          user_id?: string | null
          zone_id: string
        }
        Update: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          is_allow?: boolean | null
          permission_id?: string
          user_id?: string | null
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zone_permissions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "member_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zone_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zone_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zone_permissions_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      zone_templates: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          emoji: string | null
          id: string
          is_public: boolean | null
          name: string
          template_data: Json
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          emoji?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          template_data: Json
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          emoji?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          template_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "zone_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      zones: {
        Row: {
          archived_at: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          last_message_at: string | null
          message_count: number | null
          name: string
          position: number | null
          settings: Json | null
          space_id: string
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          name: string
          position?: number | null
          settings?: Json | null
          space_id: string
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          name?: string
          position?: number | null
          settings?: Json | null
          space_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zones_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zones_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      permission_cache_stats: {
        Row: {
          spaces_with_permissions: number | null
          total_memberships: number | null
          total_permissions: number | null
          users_with_permissions: number | null
        }
        Relationships: []
      }
      table_sizes: {
        Row: {
          schemaname: unknown | null
          size: string | null
          size_bytes: number | null
          tablename: unknown | null
        }
        Relationships: []
      }
      user_effective_permissions: {
        Row: {
          permission_id: string | null
          permission_name: string | null
          space_id: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_display_name: {
        Args: { p_user_id: string; p_space_id: string }
        Returns: string
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      refresh_user_permissions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      user_has_permission: {
        Args: { p_user_id: string; p_space_id: string; p_permission: string }
        Returns: boolean
      }
    }
    Enums: {
      message_type: "text" | "audio" | "image" | "video" | "file" | "system"
      notification_type:
        | "message"
        | "mention"
        | "space_invite"
        | "zone_invite"
        | "flow_invite"
        | "system"
      user_status: "online" | "away" | "busy" | "offline"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      message_type: ["text", "audio", "image", "video", "file", "system"],
      notification_type: [
        "message",
        "mention",
        "space_invite",
        "zone_invite",
        "flow_invite",
        "system",
      ],
      user_status: ["online", "away", "busy", "offline"],
    },
  },
} as const
