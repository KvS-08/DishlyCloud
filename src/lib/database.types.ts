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
      businesses: {
        Row: {
          id: string
          created_at: string
          name: string
          owner_id: string
          logo_url: string | null
          address: string | null
          city: string | null
          country: string | null
          email: string | null
          phone: string | null
          bank_account: string | null
          is_active: boolean
          currency: string
          language: string
          date_format: string
          time_format: string
          theme: string
          primary_color: string | null
          notification_type: string
          tip_percentage: number | null
          tax_percentage: number | null
          business_type: string | null
          cai: string | null
          rtn: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          owner_id: string
          logo_url?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          email?: string | null
          phone?: string | null
          bank_account?: string | null
          is_active?: boolean
          currency?: string
          language?: string
          date_format?: string
          time_format?: string
          theme?: string
          primary_color?: string | null
          notification_type?: string
          tip_percentage?: number | null
          tax_percentage?: number | null
          business_type?: string | null
          cai?: string | null
          rtn?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          owner_id?: string
          logo_url?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          email?: string | null
          phone?: string | null
          bank_account?: string | null
          is_active?: boolean
          currency?: string
          language?: string
          date_format?: string
          time_format?: string
          theme?: string
          primary_color?: string | null
          notification_type?: string
          tip_percentage?: number | null
          tax_percentage?: number | null
          business_type?: string | null
          cai?: string | null
          rtn?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          created_at: string
          email: string | null
          full_name: string
          avatar_url: string | null
          role: Database['public']['Enums']['user_role']
          business_id: string | null
          is_active: boolean
          username: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          email?: string | null
          full_name: string
          avatar_url?: string | null
          role?: Database['public']['Enums']['user_role']
          business_id?: string | null
          is_active?: boolean
          username?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string | null
          full_name?: string
          avatar_url?: string | null
          role?: Database['public']['Enums']['user_role']
          business_id?: string | null
          is_active?: boolean
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
      }
      expense_categories: {
        Row: {
          id: string
          created_at: string
          name: string
          type: string
          business_id: string
          created_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          type: string
          business_id: string
          created_by: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          type?: string
          business_id?: string
          created_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_categories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          id: string
          created_at: string
          name: string
          business_id: string
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          business_id: string
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          business_id?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "categories_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
      }
      menu_items: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          price: number
          includes_tax: boolean
          preparation_time: number
          category_id: string
          business_id: string
          image_url: string | null
          is_available: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          price: number
          includes_tax?: boolean
          preparation_time: number
          category_id: string
          business_id: string
          image_url?: string | null
          is_available?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          price?: number
          includes_tax?: boolean
          preparation_time?: number
          category_id?: string
          business_id?: string
          image_url?: string | null
          is_available?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      inventory_items: {
        Row: {
          id: string
          created_at: string
          name: string
          quantity: number
          unit: string
          min_stock_level: number
          business_id: string
          cost_per_unit: number
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          quantity: number
          unit: string
          min_stock_level: number
          business_id: string
          cost_per_unit: number
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          quantity?: number
          unit?: string
          min_stock_level?: number
          business_id?: string
          cost_per_unit?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
      }
      menu_item_ingredients: {
        Row: {
          id: string
          created_at: string
          menu_item_id: string
          inventory_item_id: string
          quantity: number
        }
        Insert: {
          id?: string
          created_at?: string
          menu_item_id: string
          inventory_item_id: string
          quantity: number
        }
        Update: {
          id?: string
          created_at?: string
          menu_item_id?: string
          inventory_item_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_ingredients_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_ingredients_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: string
          created_at: string
          customer_name: string | null
          table_number: number | null
          status: Database['public']['Enums']['order_status']
          payment_method: Database['public']['Enums']['payment_method'] | null
          total_amount: number
          tax_amount: number
          business_id: string
          created_by: string
          completed_at: string | null
          is_takeout: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          customer_name?: string | null
          table_number?: number | null
          status?: Database['public']['Enums']['order_status']
          payment_method?: Database['public']['Enums']['payment_method'] | null
          total_amount: number
          tax_amount: number
          business_id: string
          created_by: string
          completed_at?: string | null
          is_takeout?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          customer_name?: string | null
          table_number?: number | null
          status?: Database['public']['Enums']['order_status']
          payment_method?: Database['public']['Enums']['payment_method'] | null
          total_amount?: number
          tax_amount?: number
          business_id?: string
          created_by?: string
          completed_at?: string | null
          is_takeout?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "orders_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          created_at: string
          order_id: string
          menu_item_id: string
          quantity: number
          unit_price: number
          total_price: number
          status: Database['public']['Enums']['order_item_status']
          notes: string | null
          started_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          order_id: string
          menu_item_id: string
          quantity: number
          unit_price: number
          total_price: number
          status?: Database['public']['Enums']['order_item_status']
          notes?: string | null
          started_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          order_id?: string
          menu_item_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          status?: Database['public']['Enums']['order_item_status']
          notes?: string | null
          started_at?: string | null
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      expenses: {
        Row: {
          id: string
          created_at: string
          description: string
          amount: number
          date: string
          category: string | null
          business_id: string
          created_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          description: string
          amount: number
          date: string
          category?: string | null
          business_id: string
          created_by: string
        }
        Update: {
          id?: string
          created_at?: string
          description?: string
          amount?: number
          date?: string
          category?: string | null
          business_id?: string
          created_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      aperturas: {
        Row: {
          id: string
          created_at: string
          fecha: string
          cajero: string
          efectivo_apertura: number
          venta_total: number | null
          gastos: number | null
          utilidad: number | null
          efectivo_cierre: number | null
          hora_cierre: string | null
          estado: string | null
          business_id: string
          created_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          fecha: string
          cajero: string
          efectivo_apertura?: number
          venta_total?: number | null
          gastos?: number | null
          utilidad?: number | null
          efectivo_cierre?: number | null
          hora_cierre?: string | null
          estado?: string | null
          business_id: string
          created_by: string
        }
        Update: {
          id?: string
          created_at?: string
          fecha?: string
          cajero?: string
          efectivo_apertura?: number
          venta_total?: number | null
          gastos?: number | null
          utilidad?: number | null
          efectivo_cierre?: number | null
          hora_cierre?: string | null
          estado?: string | null
          business_id?: string
          created_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "aperturas_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aperturas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      ventas: {
        Row: {
          id: string
          created_at: string
          fecha: string
          cajero: string
          numero_orden: string
          tipo_orden: string | null
          cliente: string | null
          producto: string
          notas: string | null
          estado: string | null
          valor: number
          tipo_pago: string | null
          factura: string | null
          business_id: string
          created_by: string
          apertura_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          fecha?: string
          cajero: string
          numero_orden: string
          tipo_orden?: string | null
          cliente?: string | null
          producto: string
          notas?: string | null
          estado?: string | null
          valor: number
          tipo_pago?: string | null
          factura?: string | null
          business_id: string
          created_by: string
          apertura_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          fecha?: string
          cajero?: string
          numero_orden?: string
          tipo_orden?: string | null
          cliente?: string | null
          producto?: string
          notas?: string | null
          estado?: string | null
          valor?: number
          tipo_pago?: string | null
          factura?: string | null
          business_id?: string
          created_by?: string
          apertura_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ventas_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventas_apertura_id_fkey"
            columns: ["apertura_id"]
            isOneToOne: false
            referencedRelation: "aperturas"
            referencedColumns: ["id"]
          }
        ]
      }
      gastos: {
        Row: {
          id: string
          created_at: string
          fecha: string
          tipo: string
          detalle: string
          valor: number
          estado: string | null
          business_id: string
          created_by: string
          apertura_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          fecha?: string
          tipo: string
          detalle: string
          valor: number
          estado?: string | null
          business_id: string
          created_by: string
          apertura_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          fecha?: string
          tipo?: string
          detalle?: string
          valor?: number
          estado?: string | null
          business_id?: string
          created_by?: string
          apertura_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gastos_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gastos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gastos_apertura_id_fkey"
            columns: ["apertura_id"]
            isOneToOne: false
            referencedRelation: "aperturas"
            referencedColumns: ["id"]
          }
        ]
      }
      reminders: {
        Row: {
          id: string
          created_at: string
          evento: string
          fecha: string
          business_id: string
          created_by: string
          is_active: boolean
          allowed_roles: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          evento: string
          fecha: string
          business_id: string
          created_by: string
          is_active?: boolean
          allowed_roles?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          evento?: string
          fecha?: string
          business_id?: string
          created_by?: string
          is_active?: boolean
          allowed_roles?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "reminders_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          created_at: string
          user_id: string
          business_id: string
          reminder_id: string
          title: string
          message: string
          is_read: boolean
          notification_date: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          business_id: string
          reminder_id: string
          title: string
          message: string
          is_read?: boolean
          notification_date: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          business_id?: string
          reminder_id?: string
          title?: string
          message?: string
          is_read?: boolean
          notification_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "reminders"
            referencedColumns: ["id"]
          }
        ]
      }
      tables: {
        Row: {
          id: string
          created_at: string
          name: string
          capacity: number
          is_available: boolean
          business_id: string
          created_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          capacity?: number
          is_available?: boolean
          business_id: string
          created_by: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          capacity?: number
          is_available?: boolean
          business_id?: string
          created_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "tables_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tables_created_by_fkey"
            columns: ["created_by"]
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
      user_role: "master" | "admin" | "cashier" | "chef" | "waiter"
      order_status: "open" | "processing" | "completed" | "cancelled"
      order_item_status: "pending" | "preparing" | "ready" | "served" | "cancelled"
      payment_method: "cash" | "credit_card" | "debit_card" | "mobile_payment" | "other"
    }
  }
}