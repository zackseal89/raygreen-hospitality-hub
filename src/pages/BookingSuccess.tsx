import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const { toast } = useToast();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { session_id: sessionId }
        });

        if (error) throw error;

        setPaymentVerified(data.booking_confirmed);
        
        if (data.booking_confirmed) {
          toast({
            title: "Payment Successful!",
            description: "Your booking has been confirmed and you will receive a confirmation email shortly.",
          });
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        toast({
          title: "Verification Error",
          description: "There was an issue verifying your payment. Please contact us if you were charged.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, toast]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hotel-green mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold">Verifying your payment...</h2>
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
                {paymentVerified ? 'Booking Confirmed!' : 'Payment Processing'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {paymentVerified ? (
                <>
                  <p className="text-muted-foreground">
                    Thank you for your booking! Your reservation has been confirmed and you will receive a confirmation email shortly.
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
                      Raygreen Hotel, Kisumu<br />
                      We'll send you detailed directions and contact information via email.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground">
                    Your payment is being processed. If you were charged but this page shows an error, 
                    please contact us immediately with your booking reference.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Session ID: {sessionId}
                  </p>
                </>
              )}

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