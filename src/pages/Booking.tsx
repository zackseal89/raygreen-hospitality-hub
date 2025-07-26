
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Users, Bed, CheckCircle, CreditCard, LogIn } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface RoomType {
  id: string;
  name: string;
  description: string;
  base_price: number;
  max_occupancy: number;
  amenities: string[];
  image_url?: string;
}

const bookingSchema = z.object({
  checkIn: z.date({
    required_error: "Check-in date is required",
  }),
  checkOut: z.date({
    required_error: "Check-out date is required",
  }),
  adults: z.number().min(1, "At least 1 adult is required").max(10),
  children: z.number().min(0).max(10),
  guestName: z.string().min(2, "Guest name is required"),
  guestEmail: z.string().email("Valid email is required"),
  guestPhone: z.string().optional(),
  specialRequests: z.string().optional(),
}).refine((data) => {
  return data.checkOut > data.checkIn;
}, {
  message: "Check-out date must be after check-in date",
  path: ["checkOut"],
});

type BookingFormData = z.infer<typeof bookingSchema>;

const Booking = () => {
  const navigate = useNavigate();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingStep, setBookingStep] = useState<'dates' | 'rooms' | 'details' | 'payment'>('dates');
  const [totalPrice, setTotalPrice] = useState(0);
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  const { toast } = useToast();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      checkIn: new Date(),
      checkOut: addDays(new Date(), 1),
      adults: 2,
      children: 0,
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      specialRequests: '',
    },
  });

  const watchedDates = form.watch(['checkIn', 'checkOut']);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        // Clear any existing session to ensure anonymous access
        await supabase.auth.signOut();
        
        // Define the exact room names we want to display
        const allowedRoomNames = [
          'Standard Room',
          'Deluxe Single Room',
          'Deluxe Double Room',
          'Executive Single Room',
          'Executive Double Room'
        ];
        
        const { data, error } = await supabase
          .from('room_types')
          .select('*')
          .in('name', allowedRoomNames)
          .order('base_price', { ascending: true });

        if (error) throw error;
        setRoomTypes(data || []);
      } catch (error) {
        console.error('Error fetching room types:', error);
        toast({
          title: "Error",
          description: "Failed to load room types. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRoomTypes();
  }, [toast]);

  useEffect(() => {
    if (selectedRoom && watchedDates[0] && watchedDates[1]) {
      const nights = differenceInDays(watchedDates[1], watchedDates[0]);
      setTotalPrice(selectedRoom.base_price * nights);
    }
  }, [selectedRoom, watchedDates]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleRoomSelect = (room: RoomType) => {
    setSelectedRoom(room);
    setBookingStep('details');
  };

  const handleDateSelection = () => {
    if (form.getValues('checkIn') && form.getValues('checkOut')) {
      setBookingStep('rooms');
    }
  };

  const proceedToPayment = () => {
    setBookingStep('payment');
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!selectedRoom) {
      toast({
        title: "Error",
        description: "Please select a room first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const nights = differenceInDays(data.checkOut, data.checkIn);
      const bookingData = {
        roomTypeId: selectedRoom.id,
        checkInDate: format(data.checkIn, 'yyyy-MM-dd'),
        checkOutDate: format(data.checkOut, 'yyyy-MM-dd'),
        adults: data.adults,
        children: data.children,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone || "",
        specialRequests: data.specialRequests || "",
        totalPrice: totalPrice,
        numGuests: data.adults + data.children
      };

      const { data: response, error } = await supabase.functions.invoke('create-direct-booking', {
        body: bookingData
      });

      if (error) {
        if (error.message?.includes('already have a booking')) {
          toast({
            title: "Duplicate Booking",
            description: "You already have a booking for these dates. Please check your email for existing bookings.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      if (response.success) {
        toast({
          title: "Booking Confirmed!",
          description: `Your booking ${response.bookingReference} has been confirmed. Check your email for details.`,
        });
        
        // Redirect to success page with booking reference
        navigate(`/booking-success?booking_ref=${response.bookingReference}&booking_id=${response.bookingId}`);
      } else {
        throw new Error("Booking confirmation failed");
      }
      
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-48 mb-4"></div>
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Book Your Stay at Raygreen Hotel
            </h1>
            <p className="text-xl text-hotel-gold mb-8">
              Experience comfort and luxury in the heart of Kisumu
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Booking Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[
              { step: 'dates', label: 'Dates', icon: CalendarIcon },
              { step: 'rooms', label: 'Rooms', icon: Bed },
              { step: 'details', label: 'Details', icon: Users },
              { step: 'payment', label: 'Payment', icon: CreditCard },
            ].map(({ step, label, icon: Icon }, index) => (
              <div key={step} className="flex items-center">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2",
                  bookingStep === step 
                    ? "bg-hotel-green text-white border-hotel-green"
                    : index < ['dates', 'rooms', 'details', 'payment'].indexOf(bookingStep)
                    ? "bg-hotel-green text-white border-hotel-green"
                    : "border-muted-foreground text-muted-foreground"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={cn(
                  "ml-2 text-sm font-medium",
                  bookingStep === step ? "text-hotel-green" : "text-muted-foreground"
                )}>
                  {label}
                </span>
                {index < 3 && <div className="w-8 h-px bg-muted-foreground mx-4" />}
              </div>
            ))}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Date Selection */}
            {bookingStep === 'dates' && (
              <Card className="max-w-4xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Select Your Dates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="checkIn"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Check-in Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="checkOut"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Check-out Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date <= form.getValues('checkIn')}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="adults"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adults</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select adults" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num} Adult{num > 1 ? 's' : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="children"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Children</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select children" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num} {num === 1 ? 'Child' : 'Children'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="text-center">
                    <Button 
                      type="button" 
                      onClick={handleDateSelection}
                      className="bg-gradient-hero hover:opacity-90 text-primary-foreground font-semibold px-8 py-3"
                    >
                      Check Availability
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Room Selection */}
            {bookingStep === 'rooms' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-primary mb-4">Select Your Room</h2>
                  <p className="text-muted-foreground">
                    {watchedDates[0] && watchedDates[1] && (
                      <>
                        {format(watchedDates[0], 'MMM dd')} - {format(watchedDates[1], 'MMM dd, yyyy')} 
                        ({differenceInDays(watchedDates[1], watchedDates[0])} night{differenceInDays(watchedDates[1], watchedDates[0]) > 1 ? 's' : ''})
                        • {form.getValues('adults')} Adult{form.getValues('adults') > 1 ? 's' : ''}
                        {form.getValues('children') > 0 && `, ${form.getValues('children')} Child${form.getValues('children') > 1 ? 'ren' : ''}`}
                      </>
                    )}
                  </p>
                </div>

                <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {roomTypes.map((room) => (
                    <Card key={room.id} className="group hover:shadow-elegant transition-all duration-300">
                       <div className="h-48 relative overflow-hidden">
                         {room.image_url ? (
                           <img 
                             src={room.image_url} 
                             alt={room.name}
                             className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                           />
                         ) : (
                           <div className="h-full bg-gradient-earth relative">
                             <div className="absolute inset-0 bg-gradient-to-br from-hotel-green/20 to-hotel-gold/20 flex items-center justify-center">
                               <div className="text-center text-white">
                                 <div className="text-3xl font-bold mb-2">{room.name.split(' ')[0]}</div>
                                 <div className="text-sm opacity-80">Premium Room</div>
                               </div>
                             </div>
                           </div>
                         )}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                       </div>

                      <CardContent className="p-6">
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-primary mb-2">{room.name}</h3>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>Up to {room.max_occupancy} guests</span>
                            </div>
                            <Badge className="bg-hotel-gold text-hotel-green font-semibold">
                              {formatPrice(room.base_price)}/night
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm">{room.description}</p>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-semibold text-primary mb-2">Amenities</h4>
                          <div className="space-y-1">
                            {room.amenities.slice(0, 4).map((amenity) => (
                              <div key={amenity} className="flex items-center space-x-2">
                                <CheckCircle className="h-3 w-3 text-hotel-green" />
                                <span className="text-xs">{amenity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button 
                          onClick={() => handleRoomSelect(room)}
                          className="w-full bg-gradient-hero hover:opacity-90 text-primary-foreground font-semibold"
                        >
                          Select This Room
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="text-center">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setBookingStep('dates')}
                  >
                    Back to Dates
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Guest Details */}
            {bookingStep === 'details' && selectedRoom && (
              <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">{selectedRoom.name}</h4>
                        <p className="text-sm text-muted-foreground mb-4">{selectedRoom.description}</p>
                        <div className="space-y-1 text-sm">
                          <div>Check-in: {format(form.getValues('checkIn'), 'MMM dd, yyyy')}</div>
                          <div>Check-out: {format(form.getValues('checkOut'), 'MMM dd, yyyy')}</div>
                          <div>Guests: {form.getValues('adults')} Adult{form.getValues('adults') > 1 ? 's' : ''}{form.getValues('children') > 0 && `, ${form.getValues('children')} Child${form.getValues('children') > 1 ? 'ren' : ''}`}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {differenceInDays(form.getValues('checkOut'), form.getValues('checkIn'))} night{differenceInDays(form.getValues('checkOut'), form.getValues('checkIn')) > 1 ? 's' : ''} × {formatPrice(selectedRoom.base_price)}
                        </div>
                        <div className="text-2xl font-bold text-primary">
                          {formatPrice(totalPrice)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Guest Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="guestName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="guestEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="guestPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="specialRequests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Requests</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any special requests or requirements..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setBookingStep('rooms')}
                  >
                    Back to Rooms
                  </Button>
                  <Button 
                    type="button"
                    onClick={proceedToPayment}
                    className="bg-gradient-hero hover:opacity-90 text-primary-foreground font-semibold px-8"
                  >
                    Proceed to Payment
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Payment */}
            {bookingStep === 'payment' && selectedRoom && (
              <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Review & Pay</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Booking Summary */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-primary">Booking Summary</h3>
                        
                        <div className="bg-muted p-4 rounded-lg space-y-3">
                          <div className="flex justify-between">
                            <span className="font-medium">Room:</span>
                            <span>{selectedRoom.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Check-in:</span>
                            <span>{format(form.getValues('checkIn'), 'MMM dd, yyyy')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Check-out:</span>
                            <span>{format(form.getValues('checkOut'), 'MMM dd, yyyy')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Guests:</span>
                            <span>
                              {form.getValues('adults')} Adult{form.getValues('adults') > 1 ? 's' : ''}
                              {form.getValues('children') > 0 && `, ${form.getValues('children')} Child${form.getValues('children') > 1 ? 'ren' : ''}`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Nights:</span>
                            <span>{differenceInDays(form.getValues('checkOut'), form.getValues('checkIn'))}</span>
                          </div>
                          <div className="border-t pt-3 flex justify-between text-lg font-bold">
                            <span>Total:</span>
                            <span className="text-hotel-green">{formatPrice(totalPrice)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            *Payment will be processed in USD (approximately ${Math.round(totalPrice / 130)})
                          </div>
                        </div>
                      </div>

                      {/* Guest Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-primary">Guest Information</h3>
                        
                        <div className="bg-muted p-4 rounded-lg space-y-3">
                          <div className="flex justify-between">
                            <span className="font-medium">Name:</span>
                            <span>{form.getValues('guestName')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Email:</span>
                            <span>{form.getValues('guestEmail')}</span>
                          </div>
                          {form.getValues('guestPhone') && (
                            <div className="flex justify-between">
                              <span className="font-medium">Phone:</span>
                              <span>{form.getValues('guestPhone')}</span>
                            </div>
                          )}
                          {form.getValues('specialRequests') && (
                            <div>
                              <span className="font-medium">Special Requests:</span>
                              <p className="text-sm mt-1">{form.getValues('specialRequests')}</p>
                            </div>
                          )}
                        </div>

                        <div className="bg-hotel-green/10 p-4 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <CreditCard className="h-4 w-4 text-hotel-green" />
                            <span className="font-medium text-hotel-green">Secure Payment</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Your payment is secured by Stripe. We accept all major credit cards.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between mt-8">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setBookingStep('details')}
                      >
                        Back to Details
                      </Button>
                      <Button 
                        type="submit"
                        className="bg-gradient-hero hover:opacity-90 text-primary-foreground font-semibold px-8"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </form>
        </Form>
      </div>
    </Layout>
  );
};

export default Booking;
