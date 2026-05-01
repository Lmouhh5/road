export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string
          resolved: boolean
          resolved_at: string | null
          severity: string
          type: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message: string
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
          type: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
          type?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          code: string | null
          cost_month: number
          created_at: string
          fuel_month: number
          hours_month: number
          id: string
          last_service: string | null
          name: string
          project_id: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          cost_month?: number
          created_at?: string
          fuel_month?: number
          hours_month?: number
          id?: string
          last_service?: string | null
          name: string
          project_id?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          cost_month?: number
          created_at?: string
          fuel_month?: number
          hours_month?: number
          id?: string
          last_service?: string | null
          name?: string
          project_id?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_financial_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          attendance_date: string
          created_at: string
          employee_id: string | null
          hours: number
          id: string
          note: string | null
          project_id: string | null
          status: string
        }
        Insert: {
          attendance_date?: string
          created_at?: string
          employee_id?: string | null
          hours?: number
          id?: string
          note?: string | null
          project_id?: string | null
          status?: string
        }
        Update: {
          attendance_date?: string
          created_at?: string
          employee_id?: string | null
          hours?: number
          id?: string
          note?: string | null
          project_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_financial_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_holders: {
        Row: {
          balance: number
          created_at: string
          id: string
          name: string
          role: string | null
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          name: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          name?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cash_issues: {
        Row: {
          amount: number
          created_at: string
          holder_id: string | null
          id: string
          issue_date: string
          note: string | null
          request_id: string | null
          source: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          holder_id?: string | null
          id?: string
          issue_date?: string
          note?: string | null
          request_id?: string | null
          source?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          holder_id?: string | null
          id?: string
          issue_date?: string
          note?: string | null
          request_id?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_issues_holder_id_fkey"
            columns: ["holder_id"]
            isOneToOne: false
            referencedRelation: "cash_holders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_issues_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "cash_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_requests: {
        Row: {
          amount: number
          created_at: string
          id: string
          project_id: string | null
          purpose: string | null
          request_date: string
          requester_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          project_id?: string | null
          purpose?: string | null
          request_date?: string
          requester_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          project_id?: string | null
          purpose?: string | null
          request_date?: string
          requester_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_financial_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          base_salary: number
          cash_held: number
          created_at: string
          days_worked_month: number
          hire_date: string | null
          id: string
          name: string
          phone: string | null
          project_id: string | null
          role: string | null
          status: string
          updated_at: string
        }
        Insert: {
          base_salary?: number
          cash_held?: number
          created_at?: string
          days_worked_month?: number
          hire_date?: string | null
          id?: string
          name: string
          phone?: string | null
          project_id?: string | null
          role?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          base_salary?: number
          cash_held?: number
          created_at?: string
          days_worked_month?: number
          hire_date?: string | null
          id?: string
          name?: string
          phone?: string | null
          project_id?: string | null
          role?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_financial_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          description: string | null
          employee_id: string | null
          expense_date: string
          id: string
          method: string | null
          note: string | null
          project_id: string | null
          proof_url: string | null
          supplier_id: string | null
        }
        Insert: {
          amount?: number
          category?: string | null
          created_at?: string
          description?: string | null
          employee_id?: string | null
          expense_date?: string
          id?: string
          method?: string | null
          note?: string | null
          project_id?: string | null
          proof_url?: string | null
          supplier_id?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          description?: string | null
          employee_id?: string | null
          expense_date?: string
          id?: string
          method?: string | null
          note?: string | null
          project_id?: string | null
          proof_url?: string | null
          supplier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_financial_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_runs: {
        Row: {
          created_at: string
          gross_amount: number
          id: string
          net_amount: number
          note: string | null
          period_month: string
          project_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          gross_amount?: number
          id?: string
          net_amount?: number
          note?: string | null
          period_month: string
          project_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          gross_amount?: number
          id?: string
          net_amount?: number
          note?: string | null
          period_month?: string
          project_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_runs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_runs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_financial_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number
          code: string
          contract_value: number | null
          created_at: string
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          budget?: number
          code: string
          contract_value?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          budget?: number
          code?: string
          contract_value?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      revenue_invoices: {
        Row: {
          amount: number
          client: string
          created_at: string
          due_date: string | null
          id: string
          invoice_number: string | null
          issued_date: string
          paid_amount: number
          project_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          client: string
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          issued_date?: string
          paid_amount?: number
          project_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client?: string
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          issued_date?: string
          paid_amount?: number
          project_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_financial_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_receipts: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string | null
          method: string | null
          note: string | null
          receipt_date: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string | null
          method?: string | null
          note?: string | null
          receipt_date?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string | null
          method?: string | null
          note?: string | null
          receipt_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_receipts_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "revenue_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_cost_centers: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          balance: number
          category: string | null
          contact: string | null
          created_at: string
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          balance?: number
          category?: string | null
          contact?: string | null
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          balance?: number
          category?: string | null
          contact?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_project_financial_summary: {
        Row: {
          budget: number | null
          code: string | null
          contract_value: number | null
          id: string | null
          margin: number | null
          name: string | null
          spent: number | null
          status: string | null
        }
        Insert: {
          budget?: number | null
          code?: string | null
          contract_value?: never
          id?: string | null
          margin?: never
          name?: string | null
          spent?: never
          status?: string | null
        }
        Update: {
          budget?: number | null
          code?: string | null
          contract_value?: never
          id?: string | null
          margin?: never
          name?: string | null
          spent?: never
          status?: string | null
        }
        Relationships: []
      }
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
