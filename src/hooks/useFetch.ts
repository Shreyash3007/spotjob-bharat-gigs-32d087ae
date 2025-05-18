import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for data fetching with error handling
 * @param fetchFn The async function to fetch data
 * @param dependencies Dependencies array to trigger refetch
 * @param errorMessage Custom error message to show on failure
 * @param showToast Whether to show toast notifications for errors
 */
export function useFetch<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = [],
  errorMessage = 'Failed to load data',
  showToast = true
): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { isOnline } = useApp();

  const fetchData = async () => {
    // Don't attempt to fetch if offline
    if (!isOnline) {
      setLoading(false);
      if (showToast) {
        toast.error('You are currently offline', {
          description: 'Please check your connection and try again',
        });
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      if (showToast) {
        toast.error(errorMessage, {
          description: err instanceof Error ? err.message : String(err),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, isOnline]);

  return { data, loading, error, refetch: fetchData };
}

export default useFetch; 