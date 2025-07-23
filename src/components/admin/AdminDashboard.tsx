import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Bed, 
  Activity, 
  Settings, 
  BarChart3,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  AlertCircle,
  Mail,
  Phone,
  Edit,
  Trash2,
  Plus,
  Eye
} from 'lucide-react'
import { format, parseISO, isValid } from 'date-fns'

interface Booking {
  id: string
  guest_name: string
  guest_email: string
  guest_phone: string
  check_in_date: string
  check_out_date: string
  num_guests: number
  total_price: number
  status: string
  payment_status: string
  special_requests: string
  created_at: string
  stripe_session_id: string
  room_types: {
    name: string
  }
}

interface RoomType {
  id: string
  name: string
  description: string
  base_price: number
  max_occupancy: number
  amenities: string[]
  image_url: string
}

interface Testimonial {
  id: string
  name: string
  content: string
  rating: number
  created_at: string
}

interface DashboardStats {
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  totalRevenue: number
  activeRooms: number
  todayCheckIns: number
  todayCheckOuts: number
  occupancyRate: number
}

const AdminDashboard = () => {
  const { user, isAdmin, signOut } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    activeRooms: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    occupancyRate: 0
  })

  // Fetch bookings
  const { data: bookings = [], refetch: refetchBookings, isLoading: bookingsLoading } = useQuery({
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
      return data as Booking[]
    },
    enabled: isAdmin
  })

  // Fetch room types
  const { data: roomTypes = [], isLoading: roomTypesLoading } = useQuery({
    queryKey: ['admin-room-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('room_types')
        .select('*')
        .order('name')

      if (error) throw error
      return data as RoomType[]
    },
    enabled: isAdmin
  })

  // Fetch testimonials
  const { data: testimonials = [], isLoading: testimonialsLoading } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Testimonial[]
    },
    enabled: isAdmin
  })

  // Calculate stats
  useEffect(() => {
    if (!bookings.length) return

    const today = new Date().toISOString().split('T')[0]
    const totalBookings = bookings.length
    const pendingBookings = bookings.filter(b => b.status === 'pending').length
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length
    const totalRevenue = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + Number(b.total_price || 0), 0)
    
    const todayCheckIns = bookings.filter(b => 
      b.check_in_date === today && b.status === 'confirmed'
    ).length
    
    const todayCheckOuts = bookings.filter(b => 
      b.check_out_date === today && b.status === 'confirmed'
    ).length

    // Simple occupancy calculation based on confirmed bookings vs total room capacity
    const totalRoomCapacity = roomTypes.reduce((sum, room) => sum + room.max_occupancy, 0)
    const currentOccupancy = confirmedBookings * (totalRoomCapacity / Math.max(roomTypes.length, 1))
    const occupancyRate = totalRoomCapacity > 0 ? Math.min((currentOccupancy / totalRoomCapacity) * 100, 100) : 0

    setStats({
      totalBookings,
      pendingBookings,
      confirmedBookings,
      totalRevenue,
      activeRooms: roomTypes.length,
      todayCheckIns,
      todayCheckOuts,
      occupancyRate: Math.round(occupancyRate)
    })
  }, [bookings, roomTypes])

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
      toast({ title: "Success", description: "Booking status updated successfully" })
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  })

  // Delete testimonial mutation
  const deleteTestimonialMutation = useMutation({
    mutationFn: async (testimonialId: string) => {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', testimonialId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] })
      toast({ title: "Success", description: "Testimonial deleted successfully" })
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-orange-600' },
      confirmed: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      cancelled: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      expired: { variant: 'destructive' as const, icon: XCircle, color: 'text-gray-600' }
    }
    
    const config = variants[status as keyof typeof variants] || variants.pending
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, color: 'text-orange-600' },
      paid: { variant: 'default' as const, color: 'text-green-600' },
      failed: { variant: 'destructive' as const, color: 'text-red-600' },
      refunded: { variant: 'outline' as const, color: 'text-gray-600' }
    }
    
    const config = variants[status as keyof typeof variants] || variants.pending
    
    return (
      <Badge variant={config.variant}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      return isValid(date) ? format(date, 'MMM dd, yyyy') : 'Invalid date'
    } catch {
      return 'Invalid date'
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      return isValid(date) ? format(date, 'MMM dd, yyyy HH:mm') : 'Invalid date'
    } catch {
      return 'Invalid date'
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guest_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guest_phone?.includes(searchTerm) ||
      booking.room_types?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleSignOut = async () => {
    await signOut()
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground">Admin access required.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4 gap-4">
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Raygreen Hotel - Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => window.location.reload()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Welcome, {user?.email}</span>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="rooms">Room Types</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Dashboard Overview</h2>
              <p className="text-muted-foreground">Real-time hotel management insights</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBookings}</div>
                  <p className="text-xs text-muted-foreground">All time bookings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.pendingBookings}</div>
                  <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">KES {stats.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">From confirmed bookings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
                  <p className="text-xs text-muted-foreground">Current occupancy</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.todayCheckIns}</div>
                  <p className="text-xs text-muted-foreground">Guests arriving today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Today's Check-outs</CardTitle>
                  <Users className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.todayCheckOuts}</div>
                  <p className="text-xs text-muted-foreground">Guests leaving today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Room Types</CardTitle>
                  <Bed className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeRooms}</div>
                  <p className="text-xs text-muted-foreground">Available room types</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Confirmed Bookings</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.confirmedBookings}</div>
                  <p className="text-xs text-muted-foreground">Ready for check-in</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Latest booking activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">{booking.guest_name}</div>
                          <div className="text-sm text-muted-foreground">{booking.room_types?.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                          </div>
                          <div className="font-medium">KES {Number(booking.total_price).toLocaleString()}</div>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Bookings Management</h2>
                <p className="text-muted-foreground">Manage hotel reservations</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bookings Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest</TableHead>
                      <TableHead>Room Type</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Guests</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.guest_name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {booking.guest_email}
                            </div>
                            {booking.guest_phone && (
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {booking.guest_phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{booking.room_types?.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Check-in: {formatDate(booking.check_in_date)}</div>
                            <div>Check-out: {formatDate(booking.check_out_date)}</div>
                          </div>
                        </TableCell>
                        <TableCell>{booking.num_guests}</TableCell>
                        <TableCell>
                          <div className="font-medium">KES {Number(booking.total_price).toLocaleString()}</div>
                        </TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell>{getPaymentStatusBadge(booking.payment_status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              value={booking.status}
                              onValueChange={(value) => updateBookingMutation.mutate({ bookingId: booking.id, status: value })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Room Types Tab */}
          <TabsContent value="rooms" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Room Types Management</h2>
              <p className="text-muted-foreground">Manage available room types and pricing</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roomTypes.map((room) => (
                <Card key={room.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {room.name}
                      <Badge variant="outline">KES {Number(room.base_price).toLocaleString()}</Badge>
                    </CardTitle>
                    <CardDescription>{room.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Max Occupancy:</span>
                        <span>{room.max_occupancy} guests</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-2">Amenities:</div>
                        <div className="flex flex-wrap gap-1">
                          {room.amenities?.map((amenity, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Testimonials Management</h2>
              <p className="text-muted-foreground">Manage guest reviews and feedback</p>
            </div>

            <div className="grid gap-6">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`h-4 w-4 ${
                                i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ⭐
                            </div>
                          ))}
                          <span className="text-sm text-muted-foreground ml-2">
                            {formatDateTime(testimonial.created_at)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTestimonialMutation.mutate(testimonial.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{testimonial.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AdminDashboard