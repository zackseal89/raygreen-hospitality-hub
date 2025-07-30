
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Car, 
  Plane,
  MessageSquare,
  Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you within 24 hours.",
      });
      
      form.reset();
      setIsSubmitting(false);
    }, 1000);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: ["+254 748 592 727", "+254 756 666 999"],
      description: "Available 24/7 for reservations and inquiries"
    },
    {
      icon: Mail,
      title: "Email",
      details: ["reservations@raygreenhotel.org"],
      description: "We typically respond within 2-4 hours"
    },
    {
      icon: MapPin,
      title: "Address",
      details: ["Nyamasaria, Kisumu", "Western Kenya"],
      description: "15 minutes from Kisumu city center"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Front Desk: 24/7", "Restaurant: 6:00 AM - 10:00 PM"],
      description: "Daily operations and guest services"
    },
  ];

  const directions = [
    {
      icon: Car,
      title: "By Car",
      description: "From Kisumu city center, take the A1 highway towards Nyamasaria. Turn left at the Nyamasaria junction and follow signs to Raygreen Hotel.",
      time: "15 minutes"
    },
    {
      icon: Plane,
      title: "From Airport",
      description: "Kisumu International Airport is 20 minutes away. We offer airport transfers at an affordable cost for our guests.",
      time: "20 minutes"
    },
  ];

  const businessHours = [
    { service: "Front Desk & Reception", hours: "24/7", note: "Always available" },
    { service: "Restaurant", hours: "6:00 AM - 10:00 PM", note: "Daily" },
    { service: "Rooftop Bar", hours: "4:00 PM - 12:00 AM", note: "Daily" },
    { service: "Conference Facilities", hours: "7:00 AM - 10:00 PM", note: "By appointment" },
    { service: "Laundry Service", hours: "7:00 AM - 8:00 PM", note: "Daily" },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Get in Touch
            </h1>
            <p className="text-xl md:text-2xl text-hotel-gold mb-8">
              We're Here to Help Make Your Stay Perfect
            </p>
            <p className="text-lg leading-relaxed">
              Have questions about our rooms, facilities, or services? Our friendly team is 
              ready to assist you with reservations, event planning, and any special requests.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center space-x-2">
                  <MessageSquare className="h-6 w-6 text-hotel-green" />
                  <span>Send us a Message</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
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
                        name="email"
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

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
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
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a subject" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="reservation">Room Reservation</SelectItem>
                                <SelectItem value="conference">Conference Booking</SelectItem>
                                <SelectItem value="dining">Dining Reservation</SelectItem>
                                <SelectItem value="event">Special Event</SelectItem>
                                <SelectItem value="complaint">Complaint</SelectItem>
                                <SelectItem value="general">General Inquiry</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us how we can help you..."
                              className="min-h-[120px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-gradient-hero hover:opacity-90 text-primary-foreground font-semibold py-3"
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              {contactInfo.map((info) => (
                <Card key={info.title} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center flex-shrink-0">
                        <info.icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary mb-2">{info.title}</h3>
                        {info.details.map((detail, index) => (
                          <p key={index} className="text-muted-foreground mb-1">{detail}</p>
                        ))}
                        <p className="text-sm text-muted-foreground/80 mt-2">{info.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Directions */}
            <Card>
              <CardHeader>
                <CardTitle>How to Find Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {directions.map((direction) => (
                  <div key={direction.title} className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-hotel-green/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <direction.icon className="h-5 w-5 text-hotel-green" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">{direction.title}</h4>
                      <p className="text-sm text-muted-foreground mb-1">{direction.description}</p>
                      <span className="text-xs bg-hotel-gold/20 text-hotel-green px-2 py-1 rounded">
                        {direction.time}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Business Hours */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Business Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businessHours.map((schedule) => (
                <div key={schedule.service} className="text-center p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold text-primary mb-2">{schedule.service}</h4>
                  <p className="text-lg font-medium text-hotel-green mb-1">{schedule.hours}</p>
                  <p className="text-xs text-muted-foreground">{schedule.note}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Map Placeholder */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="text-center">Our Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-earth rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <MapPin className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Nyamasaria, Kisumu</h3>
                <p className="text-sm opacity-80">Interactive map coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Contact;
