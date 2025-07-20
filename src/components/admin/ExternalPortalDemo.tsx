
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { RefreshCw, Activity, Bed, Calendar, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface Booking {
  id: string
  guest_name: string
  guest_email: string
  check_in_date: string
  check_out_date: string
  adults: number
  children: number
  total_price: number
  status: string
  created_at: string
}

interface RoomType {
  id: string
  name: string
  description: string
  base_price: number
  max_occupancy: number
}

export const ExternalPortalDemo = () => {
  const { user, userRole } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [user, userRole])

  const debugAuthStatus = async () => {
    try {
      console.log('=== DEBUG AUTH STATUS ===')
      console.log('Current user:', user?.email)
      console.log('Current user ID:', user?.id)
      console.log('Current user role:', userRole)
      
      // Check if user has a profile
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        console.log('User profile:', profile)
        console.log('Profile error:', profileError)
        
        setDebugInfo({
          userId: user.id,
          userEmail: user.email,
          userRole,
          profile,
          profileError: profileError?.message
        })
      }
    } catch (error) {
      console.error('Debug auth error:', error)
    }
  }

  const fetchData = async () => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    if (userRole !== 'admin') {
      setError(`Access denied. Current role: ${userRole || 'none'}`)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      await debugAuthStatus()
      
      console.log('=== FETCHING BOOKINGS ===')
      
      // Fetch bookings with detailed error handling
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      console.log('Bookings query result:', { bookingsData, bookingsError })

      if (bookingsError) {
        console.error('Bookings error details:', bookingsError)
        setError(`Failed to fetch bookings: ${bookingsError.message}`)
        toast.error(`Bookings error: ${bookingsError.message}`)
      } else {
        setBookings(bookingsData || [])
        console.log(`Successfully fetched ${bookingsData?.length || 0} bookings`)
      }

      // Fetch room types
      console.log('=== FETCHING ROOM TYPES ===')
      const { data: roomTypesData, error: roomTypesError } = await supabase
        .from('room_types')
        .select('*')
        .order('name')

      console.log('Room types query result:', { roomTypesData, roomTypesError })

      if (roomTypesError) {
        console.error('Room types error:', roomTypesError)
        toast.error(`Room types error: ${roomTypesError.message}`)
      } else {
        setRoomTypes(roomTypesData || [])
        console.log(`Successfully fetched ${roomTypesData?.length || 0} room types`)
      }

    } catch (error: any) {
      console.error('Unexpected error:', error)
      setError(`Unexpected error: ${error.message}`)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createAdminProfile = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          role: 'admin',
          full_name: user.email,
        })

      if (error) {
        console.error('Failed to create admin profile:', error)
        toast.error('Failed to create admin profile')
      } else {
        toast.success('Admin profile created successfully')
        // Refresh the page to update auth state
        window.location.reload()
      }
    } catch (error) {
      console.error('Error creating admin profile:', error)
      toast.error('Error creating admin profile')
    }
  }

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)

      if (error) throw error

      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus }
            : booking
        )
      )
      
      toast.success(`Booking ${newStatus}`)
    } catch (error: any) {
      console.error('Error updating booking:', error)
      toast.error('Failed to update booking status')
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default'
      case 'pending': return 'secondary'
      case 'cancelled': return 'destructive'
      default: return 'outline'
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground">Please log in to access the admin panel.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (userRole !== 'admin') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground mb-4">
              Current role: {userRole || 'none'}. Admin access required.
            </p>
            {debugInfo && (
              <div className="bg-muted p-4 rounded-lg text-left text-sm mb-4">
                <h4 className="font-semibold mb-2">Debug Information:</h4>
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            )}
            <Button onClick={createAdminProfile} className="mr-2">
              Grant Admin Access
            </Button>
            <Button onClick={debugAuthStatus} variant="outline">
              Debug Auth
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <p className="text-muted-foreground">Hotel management overview</p>
          {debugInfo && (
            <p className="text-xs text-muted-foreground mt-1">
              User: {debugInfo.userEmail} | Role: {debugInfo.userRole}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={debugAuthStatus} variant="outline" size="sm">
            Debug Auth
          </Button>
          <Button onClick={fetchData} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Error Loading Data</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Bookings ({bookings.length})
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <Bed className="h-4 w-4" />
            Room Types ({roomTypes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Bookings
              </CardTitle>
              <CardDescription>
                Latest bookings with status management
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{booking.guest_name}</h3>
                            <Badge variant={getStatusBadgeVariant(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{booking.guest_email}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(booking.check_in_date).toLocaleDateString()} → {new Date(booking.check_out_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm font-medium mt-1">
                            KES {Number(booking.total_price).toLocaleString()} • {booking.adults} adults
                            {booking.children > 0 && `, ${booking.children} children`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                              >
                                Confirm
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No bookings found
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
              <CardDescription>
                Available room types and pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : roomTypes.length > 0 ? (
                <div className="space-y-4">
                  {roomTypes.map((room) => (
                    <div key={room.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium">{room.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{room.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span>Max: {room.max_occupancy} guests</span>
                            <span className="font-medium text-primary">
                              KES {Number(room.base_price).toLocaleString()}/night
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No room types found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
