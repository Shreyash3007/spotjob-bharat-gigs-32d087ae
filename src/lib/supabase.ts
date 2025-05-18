
// Mock Supabase client for development
export const supabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithOtp: () => Promise.resolve({ data: {}, error: null }),
    verifyOtp: () => Promise.resolve({ data: {}, error: null }),
    signInWithOAuth: () => Promise.resolve({ data: {}, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: (callback: any) => ({
      data: { subscription: { unsubscribe: () => {} } }
    })
  },
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: () => Promise.resolve({ data: null, error: null }),
        then: (callback: any) => Promise.resolve({ data: [], error: null }).then(callback)
      }),
      then: (callback: any) => Promise.resolve({ data: [], error: null }).then(callback)
    }),
    insert: (values: any) => ({
      then: (callback: any) => Promise.resolve({ data: values, error: null }).then(callback),
      select: () => ({
        single: () => Promise.resolve({ data: values, error: null })
      })
    }),
    update: (values: any) => ({
      eq: (column: string, value: any) => ({
        then: (callback: any) => Promise.resolve({ data: values, error: null }).then(callback)
      })
    }),
    delete: () => ({
      eq: (column: string, value: any) => ({
        then: (callback: any) => Promise.resolve({ data: null, error: null }).then(callback)
      })
    }),
    order: () => ({
      then: (callback: any) => Promise.resolve({ data: [], error: null }).then(callback)
    }),
    in: () => ({
      then: (callback: any) => Promise.resolve({ data: [], error: null }).then(callback)
    }),
    gte: () => ({
      then: (callback: any) => Promise.resolve({ data: [], error: null }).then(callback)
    }),
    lte: () => ({
      then: (callback: any) => Promise.resolve({ data: [], error: null }).then(callback)
    })
  }),
  storage: {
    from: (bucket: string) => ({
      upload: () => Promise.resolve({ data: {}, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } })
    })
  }
};
