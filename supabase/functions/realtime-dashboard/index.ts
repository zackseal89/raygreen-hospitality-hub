import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-portal-token',
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

    // Get dashboard metrics
    const [bookingsData, roomsData, revenueData, recentActivity] = await Promise.all([
      // Bookings metrics
      supabaseClient
        .from('bookings')
        .select('id, status, total_price, created_at, check_in_date, check_out_date')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      
      // Room types data
      supabaseClient
        .from('room_types')
        .select('id, name, base_price, max_occupancy'),
      
      // Revenue calculation (last 30 days)
      supabaseClient
        .from('bookings')
        .select('total_price, status, created_at')
        .eq('status', 'confirmed')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      
      // Recent activity from audit logs
      supabaseClient
        .from('audit_logs')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(10)
    ])

    if (bookingsData.error) throw bookingsData.error
    if (roomsData.error) throw roomsData.error
    if (revenueData.error) throw revenueData.error

    // Calculate metrics
    const totalBookings = bookingsData.data?.length || 0
    const pendingBookings = bookingsData.data?.filter(b => b.status === 'pending').length || 0
    const confirmedBookings = bookingsData.data?.filter(b => b.status === 'confirmed').length || 0
    const totalRevenue = revenueData.data?.reduce((sum, booking) => sum + Number(booking.total_price), 0) || 0
    
    // Today's check-ins
    const today = new Date().toISOString().split('T')[0]
    const todayCheckIns = bookingsData.data?.filter(b => 
      b.check_in_date === today && b.status === 'confirmed'
    ).length || 0

    // This week's bookings
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const weeklyBookings = bookingsData.data?.filter(b => b.created_at >= weekAgo).length || 0

    // Conference bookings
    const { data: conferenceBookings } = await supabaseClient
      .from('conference_bookings')
      .select('id, status, total_price, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const totalConferenceBookings = conferenceBookings?.length || 0
    const conferenceRevenue = conferenceBookings?.reduce((sum, booking) => 
      sum + Number(booking.total_price || 0), 0) || 0

    // Room availability (simplified - assumes each room type has multiple units)
    const roomAvailability = roomsData.data?.map(room => ({
      ...room,
      // This would need more complex logic in a real system
      available_units: Math.floor(Math.random() * 10) + 1, // Mock data
      total_units: Math.floor(Math.random() * 15) + 5 // Mock data
    }))

    const dashboardData = {
      metrics: {
        total_bookings: totalBookings,
        pending_bookings: pendingBookings,
        confirmed_bookings: confirmedBookings,
        total_revenue: totalRevenue,
        today_checkins: todayCheckIns,
        weekly_bookings: weeklyBookings,
        conference_bookings: totalConferenceBookings,
        conference_revenue: conferenceRevenue
      },
      room_availability: roomAvailability,
      recent_activity: recentActivity.data || [],
      last_updated: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(dashboardData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})