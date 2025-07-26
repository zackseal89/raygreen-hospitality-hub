import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const bookingRef = searchParams.get('booking_ref');
  const bookingId = searchParams.get('booking_id');

  useEffect(() => {
    if (bookingRef) {
      toast({
        title: "Booking Confirmed!",
        description: "Your booking has been confirmed and you will receive a confirmation email shortly.",
      });
    }
  }, [bookingRef, toast]);

  // If no booking reference, show error state
  if (!bookingRef) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl font-semibold mb-4">No booking found</h2>
            <p className="text-muted-foreground mb-8">
              It seems you've reached this page without completing a booking.
            </p>
            <Button asChild>
              <Link to="/booking">Make a Booking</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4">
                <CheckCircle className="h-16 w-16 text-hotel-green mx-auto" />
              </div>
              <CardTitle className="text-2xl text-hotel-green mb-2">
                Booking Confirmed!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Thank you for your booking! Your reservation <strong>{bookingRef}</strong> has been confirmed and you will receive a confirmation email shortly.
              </p>
              
              <div className="bg-muted p-4 rounded-lg text-left space-y-2">
                <h3 className="font-semibold text-primary">What happens next?</h3>
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-hotel-green" />
                  <span>You'll receive a confirmation email with your booking details</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-hotel-green" />
                  <span>Our team will contact you within 24 hours to confirm details</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-hotel-green" />
                  <span>Check-in instructions will be sent before your arrival</span>
                </div>
              </div>

              <div className="bg-hotel-green/10 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-4 w-4 text-hotel-green" />
                  <h4 className="font-semibold text-primary">Hotel Location</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ray Green Hotel, Kisumu<br />
                  We'll send you detailed directions and contact information via email.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <h4 className="font-semibold text-amber-800 mb-2">Payment Information</h4>
                <p className="text-sm text-amber-700">
                  Your booking is confirmed! Payment details and instructions will be provided by our team when they contact you.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-gradient-hero hover:opacity-90 text-primary-foreground">
                  <Link to="/">Return to Home</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default BookingSuccess;