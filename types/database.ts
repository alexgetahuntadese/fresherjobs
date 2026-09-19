export type Database = {
  public: {
    Tables: {
      jobs: {
        Row: {
          [key: string]: unknown;
          id: string;
          title: string;
          company_name: string;
          location: string;
          job_type: string;
          employer_id: string | null;
          sector: string;
          description: string;
          apply_url: string;
          is_featured: boolean;
          published_at: string | null;
          created_at: string;
        };
        Insert: {
          [key: string]: unknown;
          id?: string;
          title: string;
          company_name: string;
          location: string;
          job_type: string;
          employer_id?: string | null;
          sector?: string;
          description: string;
          apply_url: string;
          is_featured?: boolean;
          published_at?: string | null;
          created_at?: string;
        };
        Update: {
          [key: string]: unknown;
          id?: string;
          title?: string;
          company_name?: string;
          location?: string;
          job_type?: string;
          employer_id?: string | null;
          sector?: string;
          description?: string;
          apply_url?: string;
          is_featured?: boolean;
          published_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      employers: {
        Row: {
          [key: string]: unknown;
          user_id: string;
          username: string;
          company_name: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          [key: string]: unknown;
          user_id: string;
          username: string;
          company_name: string;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          [key: string]: unknown;
          user_id?: string;
          username?: string;
          company_name?: string;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      applications: {
        Row: {
          [key: string]: unknown;
          id: string;
          job_id: string;
          full_name: string;
          email: string;
          phone: string;
          cv_url: string | null;
          cv_path: string | null;
          created_at: string;
        };
        Insert: {
          [key: string]: unknown;
          id?: string;
          job_id: string;
          full_name: string;
          email: string;
          phone: string;
          cv_url?: string | null;
          cv_path?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          full_name?: string;
          email?: string;
          phone?: string;
          cv_url?: string | null;
          cv_path?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};