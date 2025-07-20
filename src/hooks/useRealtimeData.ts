
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
      
      let query = (supabase as any).from(table).select('*')
      
      if (filter) {
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
      console.error(`Error fetching ${table}:`, err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [table, filter])

  useEffect(() => {
    fetchData()

    // Set up real-time subscription
    const realtimeChannel = supabase
      .channel(`realtime-${table}-${Date.now()}`)
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: table
        },
        (payload) => {
          console.log('Real-time INSERT:', payload)
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
          console.log('Real-time UPDATE:', payload)
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
          console.log('Real-time DELETE:', payload)
          setData(current => 
            current.filter(item => (item as any).id !== payload.old.id)
          )
          onDelete?.(payload)
        }
      )
      .subscribe((status) => {
        console.log(`Real-time subscription status for ${table}:`, status)
      })

    setChannel(realtimeChannel)

    return () => {
      if (realtimeChannel) {
        console.log(`Unsubscribing from ${table} real-time channel`)
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

// Enhanced hook for external portal sync (now works directly with Supabase)
export const useExternalPortalSync = () => {
  const [syncStatus, setSyncStatus] = useState<'connected' | 'disconnected' | 'syncing'>('connected')
  const [lastSync, setLastSync] = useState<Date | null>(new Date())

  const logActivity = useCallback(async (
    table: string,
    operation: string,
    data: any
  ) => {
    try {
      setSyncStatus('syncing')
      
      // Log activity to console for now (since audit_logs table doesn't exist)
      console.log('Admin activity:', { table, operation, data, timestamp: new Date() })

      setSyncStatus('connected')
      setLastSync(new Date())
      
      return { success: true }
    } catch (error) {
      setSyncStatus('disconnected')
      console.error('Failed to log activity:', error)
      throw error
    }
  }, [])

  return {
    syncStatus,
    lastSync,
    logActivity
  }
}
