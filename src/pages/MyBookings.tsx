import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, MapPin, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Booking {
  id: string;
  room_type_id: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  special_requests?: string;
  total_price: number;
  status: string;
  created_at: string;
  room_types: {
    name: string;
    description: string;
    base_price: number;
  };
}

const MyBookings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchBookings();
    }
  }, [user, authLoading, navigate]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          room_types(name, description, base_price)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load your bookings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending Payment</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800"><AlertCircle className="h-3 w-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Booking Cancelled",
        description: "Your booking has been successfully cancelled.",
      });

      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-48"></div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              My Bookings
            </h1>
            <p className="text-xl text-hotel-gold mb-8">
              Manage your hotel reservations
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {bookings.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Bookings Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't made any bookings yet. Start by exploring our rooms!
              </p>
              <Button 
                onClick={() => navigate('/booking')}
                className="bg-gradient-hero hover:opacity-90 text-primary-foreground"
              >
                Book a Room
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {bookings.map((booking) => (
              <Card key={booking.id} className="group hover:shadow-elegant transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{booking.room_types.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Booking #{booking.id.slice(0, 8)}
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-hotel-green" />
                      <div>
                        <div className="font-medium">Check-in</div>
                        <div>{format(new Date(booking.check_in_date), 'MMM dd, yyyy')}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-hotel-green" />
                      <div>
                        <div className="font-medium">Check-out</div>
                        <div>{format(new Date(booking.check_out_date), 'MMM dd, yyyy')}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-hotel-green" />
                      <span>
                        {booking.adults} Adult{booking.adults > 1 ? 's' : ''}
                        {booking.children > 0 && `, ${booking.children} Child${booking.children > 1 ? 'ren' : ''}`}
                      </span>
                    </div>
                    <div className="font-bold text-hotel-green">
                      {formatPrice(booking.total_price)}
                    </div>
                  </div>

                  {booking.special_requests && (
                    <div className="text-sm">
                      <div className="font-medium mb-1">Special Requests:</div>
                      <div className="text-muted-foreground">{booking.special_requests}</div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Booked on {format(new Date(booking.created_at), 'MMM dd, yyyy')}
                  </div>

                  {booking.status === 'pending' && (
                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelBooking(booking.id)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-hero hover:opacity-90 text-primary-foreground"
                        onClick={() => {
                          toast({
                            title: "Payment Required",
                            description: "Please complete your payment through the original booking link.",
                          });
                        }}
                      >
                        <CreditCard className="h-3 w-3 mr-1" />
                        Pay Now
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Button 
            onClick={() => navigate('/booking')}
            className="bg-gradient-hero hover:opacity-90 text-primary-foreground px-8"
          >
            Make Another Booking
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default MyBookings;