import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { DashboardData } from '../types';

export function useStatus() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatus();
  }, []);

  async function loadStatus() {
    try {
      setLoading(true);
      const status = await api.getStatus();
      setData(status);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return { data, loading, error, refresh: loadStatus };
}
