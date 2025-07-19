import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-portal-token',
}

// Validate external portal token
async function validatePortalToken(token: string, supabaseClient: any) {
  const tokenHash = Array.from(new Uint8Array(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  )).map(b => b.toString(16).padStart(2, '0')).join('')

  const { data: validToken } = await supabaseClient
    .from('external_portal_tokens')
    .select('*')
    .eq('token_hash', tokenHash)
    .eq('is_active', true)
    .gte('expires_at', new Date().toISOString())
    .single()

  return validToken
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Validate portal token
    const portalToken = req.headers.get('x-portal-token')
    if (!portalToken) {
      return new Response(
        JSON.stringify({ error: 'Portal token required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const tokenData = await validatePortalToken(portalToken, supabaseClient)
    if (!tokenData) {
      return new Response(
        JSON.stringify({ error: 'Invalid portal token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    const resource = pathSegments[pathSegments.length - 1] // Get last segment after 'external-portal-api'

    const body = req.method !== 'GET' ? await req.json() : null

    // Log the external portal operation
    const logData = {
      table_name: resource,
      operation: req.method,
      new_data: body,
      source: 'external_portal',
      external_portal_user: tokenData.portal_name,
      changed_at: new Date().toISOString()
    }

    switch (resource) {
      case 'rooms':
        if (req.method === 'GET') {
          const { data, error } = await supabaseClient
            .from('room_types')
            .select('*')
            .order('created_at', { ascending: false })
          
          if (error) throw error
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        if (req.method === 'POST') {
          const { data, error } = await supabaseClient
            .from('room_types')
            .insert(body)
            .select()
            .single()
          
          if (error) throw error
          
          // Log the change
          await supabaseClient.from('audit_logs').insert(logData)
          
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        if (req.method === 'PUT') {
          const { id, ...updateData } = body
          const { data, error } = await supabaseClient
            .from('room_types')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()
          
          if (error) throw error
          
          // Log the change
          await supabaseClient.from('audit_logs').insert({
            ...logData,
            operation: 'UPDATE'
          })
          
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        break

      case 'bookings':
        if (req.method === 'GET') {
          const { data, error } = await supabaseClient
            .from('bookings')
            .select(`
              *,
              room_types:room_type_id (
                id,
                name,
                description,
                base_price
              )
            `)
            .order('created_at', { ascending: false })
          
          if (error) throw error
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        if (req.method === 'PUT') {
          const { id, ...updateData } = body
          const { data, error } = await supabaseClient
            .from('bookings')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()
          
          if (error) throw error
          
          // Log the change
          await supabaseClient.from('audit_logs').insert({
            ...logData,
            operation: 'UPDATE'
          })
          
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        break

      case 'menu':
        if (req.method === 'GET') {
          const { data, error } = await supabaseClient
            .from('menu_items')
            .select('*')
            .order('category', { ascending: true })
          
          if (error) throw error
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        if (req.method === 'POST') {
          const { data, error } = await supabaseClient
            .from('menu_items')
            .insert(body)
            .select()
            .single()
          
          if (error) throw error
          
          // Log the change
          await supabaseClient.from('audit_logs').insert(logData)
          
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        if (req.method === 'PUT') {
          const { id, ...updateData } = body
          const { data, error } = await supabaseClient
            .from('menu_items')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()
          
          if (error) throw error
          
          // Log the change
          await supabaseClient.from('audit_logs').insert({
            ...logData,
            operation: 'UPDATE'
          })
          
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        break

      case 'bulk-update':
        if (req.method === 'POST') {
          const { table, updates } = body
          const results = []
          
          for (const update of updates) {
            const { id, ...updateData } = update
            const { data, error } = await supabaseClient
              .from(table)
              .update(updateData)
              .eq('id', id)
              .select()
              .single()
            
            if (error) {
              results.push({ id, success: false, error: error.message })
            } else {
              results.push({ id, success: true, data })
            }
          }
          
          // Log bulk operation
          await supabaseClient.from('audit_logs').insert({
            table_name: table,
            operation: 'BULK_UPDATE',
            new_data: { count: updates.length, results },
            source: 'external_portal',
            external_portal_user: tokenData.portal_name,
            changed_at: new Date().toISOString()
          })
          
          return new Response(JSON.stringify({ results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Resource not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})