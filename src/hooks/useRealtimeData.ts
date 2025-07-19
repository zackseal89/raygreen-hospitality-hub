import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface RealtimeOptions {
  table: string
  onInsert?: (payload: any) => void
  onUpdate?: (payload: any) => void
  onDelete?: (payload: any) => void
  filter?: string
}

export const useRealtimeData = <T = any>(options: RealtimeOptions) => {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  const { table, onInsert, onUpdate, onDelete, filter } = options

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Use any for Supabase query to avoid type issues
      let query = (supabase as any).from(table).select('*')
      
      if (filter) {
        // Simple filter parsing - in production you'd want more sophisticated filtering
        const [column, operator, value] = filter.split(':')
        if (operator === 'eq') {
          query = query.eq(column, value)
        } else if (operator === 'gte') {
          query = query.gte(column, value)
        } else if (operator === 'lte') {
          query = query.lte(column, value)
        }
      }

      const { data: fetchedData, error: fetchError } = await query.order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      setData(fetchedData || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [table, filter])

  useEffect(() => {
    fetchData()

    // Set up real-time subscription
    const realtimeChannel = supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: table
        },
        (payload) => {
          setData(current => [payload.new as T, ...current])
          onInsert?.(payload)
        }
      )
      .on(
        'postgres_changes' as any,
        {
          event: 'UPDATE',
          schema: 'public',
          table: table
        },
        (payload) => {
          setData(current => 
            current.map(item => 
              (item as any).id === payload.new.id ? payload.new as T : item
            )
          )
          onUpdate?.(payload)
        }
      )
      .on(
        'postgres_changes' as any,
        {
          event: 'DELETE',
          schema: 'public',
          table: table
        },
        (payload) => {
          setData(current => 
            current.filter(item => (item as any).id !== payload.old.id)
          )
          onDelete?.(payload)
        }
      )
      .subscribe()

    setChannel(realtimeChannel)

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel)
      }
    }
  }, [table, onInsert, onUpdate, onDelete, fetchData])

  const refresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refresh,
    channel
  }
}

// Specialized hook for external portal communication
export const useExternalPortalSync = () => {
  const [syncStatus, setSyncStatus] = useState<'connected' | 'disconnected' | 'syncing'>('disconnected')
  const [lastSync, setLastSync] = useState<Date | null>(null)

  const sendToExternalPortal = useCallback(async (
    endpoint: string, 
    data: any, 
    method: 'POST' | 'PUT' | 'DELETE' = 'POST'
  ) => {
    try {
      setSyncStatus('syncing')
      
      // This would be configured with actual external portal endpoints
      const response = await fetch(`/api/external-portal/${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Portal-Token': 'your-portal-token-here'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`External portal sync failed: ${response.statusText}`)
      }

      setSyncStatus('connected')
      setLastSync(new Date())
      
      return await response.json()
    } catch (error) {
      setSyncStatus('disconnected')
      throw error
    }
  }, [])

  return {
    syncStatus,
    lastSync,
    sendToExternalPortal
  }
}