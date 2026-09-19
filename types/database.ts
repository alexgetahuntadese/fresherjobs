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
          description?: string;
          apply_url?: string;
          is_featured?: boolean;
          published_at?: string | null;
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
