import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { action, portal_name, token, permissions } = await req.json()

    switch (action) {
      case 'create_token':
        // Generate a secure token for external portal
        const newToken = crypto.randomUUID()
        const tokenHash = await crypto.subtle.digest(
          'SHA-256',
          new TextEncoder().encode(newToken)
        )
        const hashHex = Array.from(new Uint8Array(tokenHash))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')

        const { data: tokenData, error: tokenError } = await supabaseClient
          .from('external_portal_tokens')
          .insert({
            portal_name,
            token_hash: hashHex,
            permissions: permissions || {},
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single()

        if (tokenError) throw tokenError

        return new Response(
          JSON.stringify({ 
            success: true, 
            token: newToken,
            token_id: tokenData.id,
            message: 'Token created successfully' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'validate_token':
        const inputHash = Array.from(new Uint8Array(
          await crypto.subtle.digest(
            'SHA-256',
            new TextEncoder().encode(token)
          )
        )).map(b => b.toString(16).padStart(2, '0')).join('')

        const { data: validToken, error: validationError } = await supabaseClient
          .from('external_portal_tokens')
          .select('*')
          .eq('token_hash', inputHash)
          .eq('is_active', true)
          .gte('expires_at', new Date().toISOString())
          .single()

        if (validationError || !validToken) {
          return new Response(
            JSON.stringify({ success: false, message: 'Invalid or expired token' }),
            { 
              status: 401,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Update last used timestamp
        await supabaseClient
          .from('external_portal_tokens')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', validToken.id)

        return new Response(
          JSON.stringify({ 
            success: true, 
            portal_name: validToken.portal_name,
            permissions: validToken.permissions 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({ success: false, message: 'Invalid action' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})