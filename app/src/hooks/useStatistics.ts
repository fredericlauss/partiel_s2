import { useState, useEffect, useCallback } from 'react'
import { StatisticsActions } from '../actions'

export const useStatistics = () => {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof StatisticsActions.getDashboardStatistics>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStatistics = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await StatisticsActions.getDashboardStatistics()
      setStats(data)
    } catch (err) {
      console.error('Error loading statistics:', err)
      setError('Erreur lors du chargement des statistiques')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStatistics()
  }, [loadStatistics])

  return {
    stats,
    loading,
    error,
    refresh: loadStatistics
  }
} 