
// Mock Supabase client for tables not yet in Database type
// This helps us develop with proper TypeScript support until DB types are updated

// Define mock response types
type MockData = any;
type MockError = null | { message: string };
type MockResponse = { data: MockData; error: MockError };

export interface MockSupabaseClient {
  from: (table: string) => {
    select: (columns?: string) => {
      eq: (column: string, value: any) => {
        single: () => Promise<MockResponse>;
        then: (callback: (res: MockResponse) => void) => Promise<any>;
      };
      then: (callback: (res: MockResponse) => void) => Promise<any>;
    };
    insert: (values: any) => {
      then: (callback: (res: MockResponse) => void) => Promise<any>;
      select: () => {
        single: () => Promise<MockResponse>;
      }
    };
    update: (values: any) => {
      eq: (column: string, value: any) => {
        then: (callback: (res: MockResponse) => void) => Promise<any>;
      }
    };
    delete: () => {
      eq: (column: string, value: any) => {
        then: (callback: (res: MockResponse) => void) => Promise<any>;
      }
    }
  };
  rpc: <T = any>(functionName: string, params?: Record<string, any>) => Promise<{ data: T | null; error: Error | null }>;
}

// Create mock client with proper TypeScript types
export const mockSupabase: MockSupabaseClient = {
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: () => Promise.resolve({ data: null, error: null }),
        then: (callback: any) => Promise.resolve({ data: [], error: null }).then(callback),
      }),
      then: (callback: any) => Promise.resolve({ data: [], error: null }).then(callback),
    }),
    insert: (values: any) => ({
      then: (callback: any) => Promise.resolve({ data: values, error: null }).then(callback),
      select: () => ({
        single: () => Promise.resolve({ data: values, error: null }),
      })
    }),
    update: (values: any) => ({
      eq: (column: string, value: any) => ({
        then: (callback: any) => Promise.resolve({ data: values, error: null }).then(callback),
      })
    }),
    delete: () => ({
      eq: (column: string, value: any) => ({
        then: (callback: any) => Promise.resolve({ data: null, error: null }).then(callback),
      })
    })
  }),
  rpc: (functionName: string, params?: Record<string, any>) => 
    Promise.resolve({ data: null, error: null })
};
