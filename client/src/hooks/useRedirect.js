import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkUrl } from '../services/api';
import { saveResult } from '../services/firebase';

export function useRedirect() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const trace = useCallback(async (url) => {
    setError('');
    setIsLoading(true);

    const { data, error: apiError } = await checkUrl(url);

    setIsLoading(false);

    if (apiError) {
      setError(apiError);
      return;
    }

    // Persist result
    saveResult(url, data);

    // Navigate to result
    navigate('/result', { state: { result: data, url } });
  }, [navigate]);

  return { trace, isLoading, error };
}

export default useRedirect;
