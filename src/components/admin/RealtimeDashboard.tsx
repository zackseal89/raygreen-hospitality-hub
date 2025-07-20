import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRealtimeData } from '@/hooks/useRealtimeData'
import { supabase } from '@/integrations/supabase/client'
import { Calendar, Users, DollarSign, Bed, ChefHat, Activity, Eye, RefreshCw } from 'lucide-react'
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

  const { data: roomTypes } = useRealtimeData({
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
      activeRooms: roomTypes.length,
      menuItems: menuItems.length
    })
  }, [bookings, roomTypes, menuItems])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Real-time Dashboard</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Live Updates Active
          </Badge>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingBookings}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Confirmed Bookings</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmedBookings}</div>
            <p className="text-xs text-muted-foreground">Ready for check-in</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-hotel-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From confirmed bookings</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Room Types</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRooms}</div>
            <p className="text-xs text-muted-foreground">Available room types</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.menuItems}</div>
            <p className="text-xs text-muted-foreground">Active menu items</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Tabs Section */}
      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <Bed className="h-4 w-4" />
            Rooms
          </TabsTrigger>
          <TabsTrigger value="menu" className="flex items-center gap-2">
            <ChefHat className="h-4 w-4" />
            Menu
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length > 0 ? (
                <div className="space-y-3">
                  {bookings.slice(0, 8).map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors group">
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
                      <div className="text-right flex items-center gap-2">
                        <div>
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
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Booking Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                              <div><strong>Guest:</strong> {booking.guest_name}</div>
                              <div><strong>Email:</strong> {booking.guest_email}</div>
                              <div><strong>Phone:</strong> {booking.guest_phone || 'Not provided'}</div>
                              <div><strong>Adults:</strong> {booking.adults}</div>
                              <div><strong>Children:</strong> {booking.children}</div>
                              <div><strong>Check-in:</strong> {booking.check_in_date}</div>
                              <div><strong>Check-out:</strong> {booking.check_out_date}</div>
                              <div><strong>Total:</strong> KES {Number(booking.total_price).toLocaleString()}</div>
                              <div><strong>Status:</strong> {booking.status}</div>
                              {booking.special_requests && (
                                <div><strong>Special Requests:</strong> {booking.special_requests}</div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No bookings yet. They will appear here in real-time!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5" />
                Room Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              {roomTypes.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {roomTypes.map((room: any) => (
                    <div key={room.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium">{room.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{room.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span>Max: {room.max_occupancy} guests</span>
                            <span className="font-medium text-hotel-green">KES {Number(room.base_price).toLocaleString()}/night</span>
                          </div>
                          {room.amenities && room.amenities.length > 0 && (
                            <div className="mt-2">
                              <div className="flex flex-wrap gap-1">
                                {room.amenities.slice(0, 3).map((amenity: string, idx: number) => (
                                  <Badge key={idx} variant="outline" className="text-xs">{amenity}</Badge>
                                ))}
                                {room.amenities.length > 3 && (
                                  <Badge variant="outline" className="text-xs">+{room.amenities.length - 3} more</Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        {room.image_url && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{room.name}</DialogTitle>
                              </DialogHeader>
                              <img 
                                src={room.image_url} 
                                alt={room.name}
                                className="w-full h-auto rounded-lg"
                              />
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No room types available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Menu Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {menuItems.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {menuItems.slice(0, 8).map((item: any) => (
                    <div key={item.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="outline">{item.category}</Badge>
                            <span className="font-medium text-hotel-green">KES {Number(item.price).toLocaleString()}</span>
                          </div>
                          <div className="mt-2">
                            <Badge variant={item.available ? 'default' : 'secondary'}>
                              {item.available ? 'Available' : 'Unavailable'}
                            </Badge>
                          </div>
                        </div>
                        {item.image_url && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{item.name}</DialogTitle>
                              </DialogHeader>
                              <img 
                                src={item.image_url} 
                                alt={item.name}
                                className="w-full h-auto rounded-lg"
                              />
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No menu items available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {auditLogs.length > 0 ? (
                <div className="space-y-3">
                  {auditLogs.slice(0, 10).map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4 text-sm">
                        <Badge variant={log.source === 'external_portal' ? 'secondary' : 'outline'}>
                          {log.source === 'external_portal' ? 'External' : 'Internal'}
                        </Badge>
                        <span className="font-medium">{log.operation}</span>
                        <span>on {log.table_name}</span>
                        {log.external_portal_user && (
                          <span className="text-muted-foreground">by {log.external_portal_user}</span>
                        )}
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {new Date(log.changed_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}