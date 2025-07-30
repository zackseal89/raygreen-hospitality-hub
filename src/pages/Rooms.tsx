import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Users, Wifi, Coffee, Car, Tv, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { RoomGallery } from '@/components/rooms/RoomGallery';

interface RoomType {
  id: string;
  name: string;
  description: string;
  base_price: number;
  max_occupancy: number;
  amenities: string[];
  image_url?: string;
}

const Rooms = () => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('room_types')
          .select('*')
          .order('base_price', { ascending: true });

        if (error) throw error;
        setRoomTypes(data || []);
      } catch (error) {
        console.error('Error fetching room types:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomTypes();
  }, []);

  const generalAmenities = [
    { icon: Wifi, label: 'Free WiFi' },
    { icon: Tv, label: 'Flat-screen TV' },
    { icon: Coffee, label: 'Room Service' },
    { icon: Car, label: 'Free Parking' }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-2xl h-64 mb-4"></div>
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded mb-4"></div>
                <div className="h-10 bg-muted rounded"></div>
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
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Comfortable Accommodations for Every Need
            </h1>
            <p className="text-xl md:text-2xl text-hotel-gold mb-8">
              40 Elegantly Designed Rooms & Suites
            </p>
            <p className="text-lg leading-relaxed">
              Discover our range of thoughtfully designed accommodations, each offering a unique blend 
              of comfort, luxury, and modern amenities to ensure an unforgettable stay.
            </p>
          </div>
        </div>
      </section>

      {/* Room Gallery */}
      <RoomGallery />

      {/* Room Types */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {roomTypes.map((room, index) => (
              <Card 
                key={room.id}
                className="group overflow-hidden border-none bg-card/50 backdrop-blur hover:shadow-elegant transition-all duration-300 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Room Image Placeholder */}
                <div className="h-48 bg-gradient-earth relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-hotel-green/20 to-hotel-gold/20 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-4xl font-bold mb-2">{room.name.split(' ')[0]}</div>
                      <div className="text-sm opacity-80">Premium Room</div>
                    </div>
                  </div>
                  <Badge className="absolute top-4 right-4 bg-hotel-gold text-hotel-green font-semibold">
                    {formatPrice(room.base_price)}/night
                  </Badge>
                </div>

                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-primary mb-2">
                      {room.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>Sleeps {room.max_occupancy}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {room.description}
                    </p>
                  </div>

                  {/* Amenities */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-primary mb-3">Room Amenities</h4>
                    <div className="space-y-2">
                    {room.amenities
                      .filter(amenity => !amenity.toLowerCase().includes('air conditioning') && !amenity.toLowerCase().includes('ac'))
                      .slice(0, 6)
                      .map((amenity) => (
                        <div key={amenity} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-hotel-green" />
                          <span className="text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Book Now Button */}
                  <Link to="/booking" className="block">
                    <Button className="w-full bg-gradient-hero hover:opacity-90 text-primary-foreground font-semibold">
                      Book This Room
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* General Amenities */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">
              All Rooms Include
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Every room at Raygreen Hotel comes equipped with modern amenities and 
              services designed for your comfort and convenience.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
            {generalAmenities.map((amenity) => (
              <div key={amenity.label} className="text-center">
                <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-3">
                  <amenity.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium text-primary">{amenity.label}</span>
              </div>
            ))}
          </div>

          {/* Additional Services */}
          <div className="bg-gradient-gold rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-hotel-green mb-4">
              Complimentary Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-hotel-green">
              <div>
                <Coffee className="h-8 w-8 mx-auto mb-2" />
                <div className="font-semibold">Daily Housekeeping</div>
                <p className="text-sm opacity-80">Professional cleaning service</p>
              </div>
              <div>
                <Wifi className="h-8 w-8 mx-auto mb-2" />
                <div className="font-semibold">High-Speed Internet</div>
                <p className="text-sm opacity-80">Free WiFi throughout the hotel</p>
              </div>
              <div>
                <Car className="h-8 w-8 mx-auto mb-2" />
                <div className="font-semibold">Free Parking</div>
                <p className="text-sm opacity-80">Secure parking for all guests</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">
            Ready to Book Your Perfect Stay?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Choose from our variety of room types and experience the comfort and luxury 
            that Raygreen Hotel has to offer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/booking">
              <Button size="lg" className="bg-gradient-gold hover:opacity-90 text-hotel-green font-semibold">
                Check Availability
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-2 border-primary">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Rooms;