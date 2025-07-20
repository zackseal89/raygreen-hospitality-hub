import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

const AdminDashboard = () => {
  const { toast } = useToast()

  // Fetch bookings
  const { data: bookings, refetch: refetchBookings, isLoading: bookingsLoading, error: bookingsError } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          room_types (name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  })

  // Fetch room types
  const { data: roomTypes, isLoading: roomTypesLoading } = useQuery({
    queryKey: ['admin-room-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('room_types')
        .select('*')
        .order('name')

      if (error) throw error
      return data
    }
  })

  // Fetch conference bookings
  const { data: conferenceBookings, isLoading: conferenceLoading } = useQuery({
    queryKey: ['admin-conference-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conference_bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  })

  if (bookingsError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage bookings and hotel operations</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Error loading dashboard data: {bookingsError.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)

      if (error) throw error

      toast({
        title: "Status Updated",
        description: `Booking status changed to ${newStatus}`,
      })
      
      refetchBookings()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default'
      case 'pending': return 'secondary'
      case 'cancelled': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage bookings and hotel operations</p>
      </div>

      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bookings">Room Bookings</TabsTrigger>
          <TabsTrigger value="conference">Conference Bookings</TabsTrigger>
          <TabsTrigger value="rooms">Room Types</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Room Bookings</CardTitle>
              <CardDescription>Manage all room bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookingsLoading ? (
                  <p>Loading bookings...</p>
                ) : bookings?.length === 0 ? (
                  <p className="text-muted-foreground">No bookings found</p>
                ) : (
                  bookings?.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{booking.guest_name}</p>
                      <p className="text-sm text-muted-foreground">{booking.guest_email}</p>
                      <p className="text-sm">
                        {booking.room_types?.name} • {booking.check_in_date} to {booking.check_out_date}
                      </p>
                      <p className="text-sm font-medium">${booking.total_price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(booking.status)}>
                        {booking.status}
                      </Badge>
                      {booking.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                          >
                            Confirm
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conference" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conference Bookings</CardTitle>
              <CardDescription>Manage conference room bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conferenceLoading ? (
                  <p>Loading conference bookings...</p>
                ) : conferenceBookings?.length === 0 ? (
                  <p className="text-muted-foreground">No conference bookings found</p>
                ) : (
                  conferenceBookings?.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{booking.contact_name}</p>
                      <p className="text-sm text-muted-foreground">{booking.contact_email}</p>
                      <p className="text-sm">
                        {booking.event_date} • {booking.start_time} - {booking.end_time}
                      </p>
                      <p className="text-sm">Attendees: {booking.attendees}</p>
                      {booking.total_price && (
                        <p className="text-sm font-medium">${booking.total_price}</p>
                      )}
                    </div>
                    <Badge variant={getStatusVariant(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Room Types</CardTitle>
              <CardDescription>Manage available room types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {roomTypesLoading ? (
                  <p>Loading room types...</p>
                ) : roomTypes?.length === 0 ? (
                  <p className="text-muted-foreground">No room types found</p>
                ) : (
                  roomTypes?.map((room) => (
                  <div key={room.id} className="p-4 border rounded-lg">
                    <h3 className="font-medium">{room.name}</h3>
                    <p className="text-sm text-muted-foreground">{room.description}</p>
                    <p className="text-sm font-medium">${room.base_price}/night</p>
                    <p className="text-sm">Max occupancy: {room.max_occupancy}</p>
                  </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminDashboard