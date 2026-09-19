import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for handling loading states during async operations
 */
export const useAsync = <T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate = true
) => {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>(
    'idle'
  );
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setValue(null);
    setError(null);
    try {
      const response = await asyncFunction();
      setValue(response);
      setStatus('success');
      return response;
    } catch (error) {
      setError(error as E);
      setStatus('error');
    }
  }, [asyncFunction]);

  useEffect(()=>{
    if(immediate){
        execute()
    }
  },[execute,immediate])
//   if (immediate) {
//     // eslint-disable-next-line react-hooks/rules-of-hooks
//     import('react').then(({ useEffect }) => {
//       useEffect(() => {
//         execute();
//       }, [execute]);
//     });
//   }

  return { execute, status, value, error };
};
