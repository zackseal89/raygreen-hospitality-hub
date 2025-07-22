import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Bed, 
  ChefHat, 
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
  Phone
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { format } from 'date-fns'

interface Booking {
  id: string
  guest_name: string
  guest_email: string
  guest_phone: string
  check_in_date: string
  check_out_date: string
  adults: number
  children: number
  total_price: number
  status: string
  special_requests: string
  created_at: string
  booking_reference: string
  room_types: {
    name: string
  }
}

interface ConferenceBooking {
  id: string
  contact_name: string
  contact_email: string
  contact_phone: string
  event_date: string
  start_time: string
  end_time: string
  attendees: number
  event_type: string
  requirements: string
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
  amenities: string[]
  image_url: string
}

interface DashboardStats {
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  totalRevenue: number
  activeRooms: number
  conferenceBookings: number
}

const AdminSidebar = ({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'bookings', label: 'Room Bookings', icon: Calendar },
    { id: 'conference', label: 'Conference Bookings', icon: Users },
    { id: 'rooms', label: 'Room Types', icon: Bed },
    { id: 'menu', label: 'Menu Items', icon: ChefHat },
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => setActiveTab(item.id)}
                    className={activeTab === item.id ? 'bg-primary text-primary-foreground' : ''}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

const UnifiedAdminDashboard = () => {
  const { user, isAdmin, signOut } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedBookings, setSelectedBookings] = useState<string[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    activeRooms: 0,
    conferenceBookings: 0
  })

  // Fetch all data
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

  const { data: conferenceBookings = [], isLoading: conferenceLoading } = useQuery({
    queryKey: ['admin-conference-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conference_bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as ConferenceBooking[]
    },
    enabled: isAdmin
  })

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

  const { data: menuItems = [], isLoading: menuLoading } = useQuery({
    queryKey: ['admin-menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('category', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: isAdmin
  })

  // Calculate stats
  useEffect(() => {
    const totalBookings = bookings.length
    const pendingBookings = bookings.filter(b => b.status === 'pending').length
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length
    const totalRevenue = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + Number(b.total_price || 0), 0)

    setStats({
      totalBookings,
      pendingBookings,
      confirmedBookings,
      totalRevenue,
      activeRooms: roomTypes.length,
      conferenceBookings: conferenceBookings.length
    })
  }, [bookings, roomTypes, conferenceBookings])

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

  const bulkUpdateStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .in('id', selectedBookings)

      if (error) throw error

      setSelectedBookings([])
      toast({
        title: "Success",
        description: `${selectedBookings.length} bookings updated to ${newStatus}`,
      })
      
      refetchBookings()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update bookings",
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

  const getStatusBadge = (status: string) => {
    const icons: {[key: string]: any} = {
      pending: Clock,
      confirmed: CheckCircle,
      cancelled: XCircle,
      expired: XCircle
    }
    
    const Icon = icons[status] || Clock
    
    return (
      <Badge variant={getStatusVariant(status)} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
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
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1">
          {/* Header */}
          <header className="border-b">
            <div className="flex h-16 items-center px-4 gap-4">
              <SidebarTrigger />
              <div className="flex-1">
                <h1 className="text-xl font-semibold">Admin Dashboard</h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Welcome, {user?.email}</span>
                <Button onClick={handleSignOut} variant="outline" size="sm">
                  Sign Out
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Overview</h2>
                  <p className="text-muted-foreground">Real-time hotel management dashboard</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <Users className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">{stats.pendingBookings}</div>
                      <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Confirmed Bookings</CardTitle>
                      <Users className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{stats.confirmedBookings}</div>
                      <p className="text-xs text-muted-foreground">Ready for check-in</p>
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
                      <CardTitle className="text-sm font-medium">Conference Bookings</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.conferenceBookings}</div>
                      <p className="text-xs text-muted-foreground">Conference events</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                    <CardDescription>Latest 5 bookings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {bookingsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <RefreshCw className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {bookings.slice(0, 5).map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{booking.guest_name}</p>
                              <p className="text-sm text-muted-foreground">{booking.guest_email}</p>
                              <p className="text-xs text-muted-foreground">
                                {booking.check_in_date} → {booking.check_out_date}
                              </p>
                            </div>
                            <div className="text-right">
                              {getStatusBadge(booking.status)}
                              <p className="text-sm font-medium mt-1">KES {Number(booking.total_price).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Room Bookings</h2>
                  <p className="text-muted-foreground">Manage all room bookings and reservations</p>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by name, email, phone, or room..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
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

                {/* Bulk Actions */}
                {selectedBookings.length > 0 && (
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <span className="text-sm font-medium">
                      {selectedBookings.length} booking(s) selected
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => bulkUpdateStatus('confirmed')}>
                        Confirm Selected
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => bulkUpdateStatus('cancelled')}>
                        Cancel Selected
                      </Button>
                    </div>
                  </div>
                )}

                {/* Bookings Table */}
                <Card>
                  <CardContent className="p-0">
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <Checkbox
                                checked={selectedBookings.length === filteredBookings.length && filteredBookings.length > 0}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedBookings(filteredBookings.map(b => b.id));
                                  } else {
                                    setSelectedBookings([]);
                                  }
                                }}
                              />
                            </TableHead>
                            <TableHead>Guest</TableHead>
                            <TableHead>Room</TableHead>
                            <TableHead>Dates</TableHead>
                            <TableHead>Guests</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredBookings.map((booking) => (
                            <TableRow key={booking.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedBookings.includes(booking.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedBookings(prev => [...prev, booking.id]);
                                    } else {
                                      setSelectedBookings(prev => prev.filter(id => id !== booking.id));
                                    }
                                  }}
                                />
                              </TableCell>
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
                              <TableCell>{booking.room_types?.name}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(booking.check_in_date), 'MMM dd')} - {format(new Date(booking.check_out_date), 'MMM dd')}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm">
                                  <Users className="h-3 w-3" />
                                  {booking.adults}A{booking.children > 0 && `, ${booking.children}C`}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                KES {booking.total_price.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(booking.status)}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  {booking.status === 'pending' && (
                                    <>
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
                                    </>
                                  )}
                                  {booking.status === 'confirmed' && (
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                    >
                                      Cancel
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'conference' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Conference Bookings</h2>
                  <p className="text-muted-foreground">Manage conference room reservations</p>
                </div>

                <Card>
                  <CardContent>
                    {conferenceLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin" />
                      </div>
                    ) : conferenceBookings.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No conference bookings found
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {conferenceBookings.map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-1">
                              <p className="font-medium">{booking.contact_name}</p>
                              <p className="text-sm text-muted-foreground">{booking.contact_email}</p>
                              <p className="text-sm">
                                {booking.event_date} • {booking.start_time} - {booking.end_time}
                              </p>
                              <p className="text-sm">Attendees: {booking.attendees}</p>
                              {booking.total_price && (
                                <p className="text-sm font-medium">KES {Number(booking.total_price).toLocaleString()}</p>
                              )}
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'rooms' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Room Types</h2>
                  <p className="text-muted-foreground">Manage available room types and pricing</p>
                </div>

                <Card>
                  <CardContent>
                    {roomTypesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        {roomTypes.map((room) => (
                          <div key={room.id} className="p-4 border rounded-lg">
                            <h3 className="font-medium">{room.name}</h3>
                            <p className="text-sm text-muted-foreground">{room.description}</p>
                            <p className="text-sm font-medium">KES {Number(room.base_price).toLocaleString()}/night</p>
                            <p className="text-sm">Max occupancy: {room.max_occupancy}</p>
                            {room.amenities && room.amenities.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {room.amenities.map((amenity, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">{amenity}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Other tabs would be implemented similarly */}
            {activeTab === 'menu' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Menu Items</h2>
                  <p className="text-muted-foreground">Manage restaurant menu items</p>
                </div>
                
                <Card>
                  <CardContent>
                    {menuLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        {menuItems.map((item: any) => (
                          <div key={item.id} className="p-4 border rounded-lg">
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="outline">{item.category}</Badge>
                              <span className="font-medium">KES {Number(item.price).toLocaleString()}</span>
                            </div>
                            <Badge variant={item.available ? 'default' : 'secondary'} className="mt-2">
                              {item.available ? 'Available' : 'Unavailable'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Analytics</h2>
                  <p className="text-muted-foreground">Business insights and reports</p>
                </div>
                <Card>
                  <CardContent className="p-8">
                    <p className="text-muted-foreground text-center">Analytics dashboard coming soon...</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Settings</h2>
                  <p className="text-muted-foreground">System configuration and preferences</p>
                </div>
                <Card>
                  <CardContent className="p-8">
                    <p className="text-muted-foreground text-center">Settings panel coming soon...</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

export default UnifiedAdminDashboard
