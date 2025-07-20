import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, CheckCircle, XCircle, Clock, Mail, Phone, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';

interface Booking {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  total_price: number;
  status: string;
  special_requests: string;
  created_at: string;
  room_types: {
    name: string;
  };
}

const BookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [duplicates, setDuplicates] = useState<{[key: string]: Booking[]}>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
    findDuplicateBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          room_types (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const findDuplicateBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .in('status', ['pending', 'confirmed']);

      if (error) throw error;

      const duplicateGroups: {[key: string]: Booking[]} = {};
      
      data?.forEach((booking: any) => {
        const key = `${booking.guest_email}-${booking.check_in_date}-${booking.check_out_date}`;
        if (!duplicateGroups[key]) {
          duplicateGroups[key] = [];
        }
        duplicateGroups[key].push(booking as Booking);
      });

      // Filter out groups with only one booking
      const actualDuplicates = Object.fromEntries(
        Object.entries(duplicateGroups).filter(([_, bookings]) => bookings.length > 1)
      );

      setDuplicates(actualDuplicates);
    } catch (error) {
      console.error('Error finding duplicates:', error);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus }
            : booking
        )
      );

      toast({
        title: "Success",
        description: `Booking status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  const bulkUpdateStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .in('id', selectedBookings);

      if (error) throw error;

      setBookings(prev => 
        prev.map(booking => 
          selectedBookings.includes(booking.id)
            ? { ...booking, status: newStatus }
            : booking
        )
      );

      setSelectedBookings([]);
      toast({
        title: "Success",
        description: `${selectedBookings.length} bookings updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating bookings:', error);
      toast({
        title: "Error",
        description: "Failed to update bookings",
        variant: "destructive",
      });
    }
  };

  const deleteDuplicateBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
      findDuplicateBookings(); // Refresh duplicates
      
      toast({
        title: "Success",
        description: "Duplicate booking removed",
      });
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast({
        title: "Error",
        description: "Failed to delete booking",
        variant: "destructive",
      });
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guest_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guest_phone?.includes(searchTerm) ||
      booking.room_types?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: {[key: string]: any} = {
      pending: 'secondary',
      confirmed: 'default',
      cancelled: 'destructive',
      expired: 'outline'
    };
    
    const icons: {[key: string]: any} = {
      pending: Clock,
      confirmed: CheckCircle,
      cancelled: XCircle,
      expired: XCircle
    };
    
    const Icon = icons[status] || Clock;
    
    return (
      <Badge variant={variants[status] || 'secondary'} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading bookings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Duplicate Bookings Alert */}
      {Object.keys(duplicates).length > 0 && (
        <Card className="border-yellow-500">
          <CardHeader>
            <CardTitle className="text-yellow-700">Duplicate Bookings Detected</CardTitle>
            <CardDescription>
              Found {Object.keys(duplicates).length} groups of duplicate bookings that need attention.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(duplicates).map(([key, duplicateBookings]) => (
                <div key={key} className="p-4 border rounded-lg bg-yellow-50">
                  <h4 className="font-medium mb-2">
                    {duplicateBookings[0].guest_email} - {format(new Date(duplicateBookings[0].check_in_date), 'MMM dd')} to {format(new Date(duplicateBookings[0].check_out_date), 'MMM dd')}
                  </h4>
                  <div className="grid gap-2">
                    {duplicateBookings.map(booking => (
                      <div key={booking.id} className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="text-sm">
                          {booking.guest_name} - {getStatusBadge(booking.status)} - KES {booking.total_price.toLocaleString()}
                        </span>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteDuplicateBooking(booking.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Management */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Management</CardTitle>
          <CardDescription>
            Manage all hotel bookings, update statuses, and handle duplicates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
            <div className="flex items-center gap-4 mb-4 p-4 bg-muted rounded-lg">
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

          {filteredBookings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No bookings found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingManagement;