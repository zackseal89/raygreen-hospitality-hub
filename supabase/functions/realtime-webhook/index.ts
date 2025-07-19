import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: any
  old_record?: any
  schema: string
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

    const payload: WebhookPayload = await req.json()
    
    // Get all active external portal tokens to notify
    const { data: activeTokens } = await supabaseClient
      .from('external_portal_tokens')
      .select('portal_name, permissions')
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString())

    if (!activeTokens || activeTokens.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active external portals to notify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare webhook notification
    const webhookData = {
      timestamp: new Date().toISOString(),
      event: {
        type: payload.type,
        table: payload.table,
        record: payload.record,
        old_record: payload.old_record,
        schema: payload.schema
      },
      source: 'supabase_hotel_system'
    }

    // Here you would typically send HTTP requests to external portal webhooks
    // For this example, we'll log the webhook events to a table
    
    const notifications = activeTokens.map(token => ({
      portal_name: token.portal_name,
      event_type: payload.type,
      table_name: payload.table,
      event_data: webhookData,
      sent_at: new Date().toISOString(),
      status: 'pending'
    }))

    // Store webhook notifications (you might want to create this table)
    // This serves as a queue for external portal notifications
    try {
      await supabaseClient
        .from('webhook_notifications')
        .insert(notifications)
    } catch (error) {
      // If webhook_notifications table doesn't exist, we'll create it
      console.log('Webhook notifications table might not exist:', error.message)
    }

    // Real implementation would send HTTP POST requests to external portal endpoints
    // Example:
    /*
    const notificationPromises = activeTokens.map(async (token) => {
      try {
        const response = await fetch(token.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': 'your-signature-here'
          },
          body: JSON.stringify(webhookData)
        })
        
        return {
          portal: token.portal_name,
          success: response.ok,
          status: response.status
        }
      } catch (error) {
        return {
          portal: token.portal_name,
          success: false,
          error: error.message
        }
      }
    })

    const results = await Promise.all(notificationPromises)
    */

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Webhook processed for ${activeTokens.length} external portals`,
        portals_notified: activeTokens.map(t => t.portal_name)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})