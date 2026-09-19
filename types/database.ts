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
          sector?: string;
          description?: string;
          apply_url?: string;
          is_featured?: boolean;
          published_at?: string | null;
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
          [key: string]: unknown;
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