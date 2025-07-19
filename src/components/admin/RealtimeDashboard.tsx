import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRealtimeData } from '@/hooks/useRealtimeData'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface DashboardStats {
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  totalRevenue: number
  activeRooms: number
  menuItems: number
}

export const RealtimeDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    activeRooms: 0,
    menuItems: 0
  })

  // Real-time data hooks
  const { data: bookings } = useRealtimeData({
    table: 'bookings',
    onInsert: (payload) => {
      const booking = payload.new
      toast.success(
        `🎉 New booking received!`,
        {
          description: `${booking.guest_name} booked for ${booking.check_in_date} - Total: KES ${Number(booking.total_price).toLocaleString()}`,
          duration: 8000,
        }
      )
    },
    onUpdate: (payload) => {
      const booking = payload.new
      if (booking.status === 'confirmed') {
        toast.success(
          `✅ Booking confirmed!`,
          {
            description: `${booking.guest_name}'s booking has been confirmed`,
            duration: 5000,
          }
        )
      } else {
        toast.info(`📝 Booking status updated: ${booking.status}`)
      }
    }
  })

  const { data: rooms } = useRealtimeData({
    table: 'room_types',
    onUpdate: (payload) => {
      toast.info(`Room "${payload.new.name}" updated`)
    }
  })

  const { data: menuItems } = useRealtimeData({
    table: 'menu_items',
    onInsert: (payload) => {
      toast.success(`New menu item added: ${payload.new.name}`)
    },
    onUpdate: (payload) => {
      toast.info(`Menu item "${payload.new.name}" updated`)
    }
  })

  const { data: auditLogs } = useRealtimeData({
    table: 'audit_logs',
    onInsert: (payload) => {
      if (payload.new.source === 'external_portal') {
        toast.info(`External portal "${payload.new.external_portal_user}" made changes to ${payload.new.table_name}`)
      }
    }
  })

  // Calculate stats whenever data changes
  useEffect(() => {
    const totalBookings = bookings.length
    const pendingBookings = bookings.filter((b: any) => b.status === 'pending').length
    const confirmedBookings = bookings.filter((b: any) => b.status === 'confirmed').length
    const totalRevenue = bookings
      .filter((b: any) => b.status === 'confirmed')
      .reduce((sum: number, b: any) => sum + Number(b.total_price || 0), 0)

    setStats({
      totalBookings,
      pendingBookings,
      confirmedBookings,
      totalRevenue,
      activeRooms: rooms.length,
      menuItems: menuItems.length
    })
  }, [bookings, rooms, menuItems])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Real-time Dashboard</h1>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Live Updates Active
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingBookings}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Confirmed Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmedBookings}</div>
            <p className="text-xs text-muted-foreground">Ready for check-in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From confirmed bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Room Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRooms}</div>
            <p className="text-xs text-muted-foreground">Available room types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.menuItems}</div>
            <p className="text-xs text-muted-foreground">Active menu items</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditLogs.slice(0, 10).map((log: any) => (
              <div key={log.id} className="flex items-center space-x-4 text-sm">
                <Badge variant={log.source === 'external_portal' ? 'secondary' : 'outline'}>
                  {log.source === 'external_portal' ? 'External' : 'Internal'}
                </Badge>
                <span className="font-medium">{log.operation}</span>
                <span>on {log.table_name}</span>
                {log.external_portal_user && (
                  <span className="text-muted-foreground">by {log.external_portal_user}</span>
                )}
                <span className="text-muted-foreground ml-auto">
                  {new Date(log.changed_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings.slice(0, 5).map((booking: any) => (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{booking.guest_name}</p>
                    <Badge variant="outline" className="text-xs">
                      {booking.adults} Guest{booking.adults > 1 ? 's' : ''}
                      {booking.children > 0 && ` + ${booking.children} Child${booking.children > 1 ? 'ren' : ''}`}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{booking.guest_email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {booking.check_in_date} → {booking.check_out_date}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={
                    booking.status === 'confirmed' ? 'default' : 
                    booking.status === 'pending' ? 'secondary' : 'destructive'
                  }>
                    {booking.status}
                  </Badge>
                  <p className="text-sm font-semibold mt-1">
                    KES {Number(booking.total_price).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(booking.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {bookings.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No bookings yet. They will appear here in real-time!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}