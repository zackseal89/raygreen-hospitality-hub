
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Utensils, 
  Wifi, 
  Car, 
  Coffee, 
  Wind, 
  Tv, 
  Bath,
  Dumbbell,
  UserCheck,
  Plane,
  Shirt,
  Baby
} from 'lucide-react';

const Facilities = () => {
  const facilities = [
    {
      category: "Conference & Events",
      icon: Users,
      items: [
        {
          name: "Main Conference Hall",
          description: "Spacious conference facility accommodating up to 150 guests",
          capacity: "150 people",
          features: ["Professional A/V equipment", "High-speed WiFi", "Climate control", "Flexible seating arrangements"]
        },
        {
          name: "Business Meeting Rooms",
          description: "Intimate meeting spaces perfect for corporate discussions",
          capacity: "10-25 people",
          features: ["Presentation equipment", "Video conferencing", "Whiteboard", "Coffee service"]
        }
      ]
    },
    {
      category: "Dining & Entertainment",
      icon: Utensils,
      items: [
        {
          name: "Main Restaurant",
          description: "Fine dining experience featuring local and international cuisine",
          capacity: "80 guests",
          features: ["À la carte menu", "Local specialties", "International dishes", "Professional service"]
        },
        {
          name: "Rooftop Bar & Terrace",
          description: "Stunning rooftop venue with panoramic views and sunset ambiance",
          capacity: "60 guests",
          features: ["Cocktail bar", "Light meals", "Sunset views", "Open-air dining", "Perfect for events"]
        }
      ]
    },
    {
      category: "Recreation & Wellness",
      icon: Bath,
      items: [
        {
          name: "Hot Tub & Spa Area",
          description: "Relaxing hot tub facility for guest wellness and rejuvenation",
          capacity: "8-10 people",
          features: ["Heated water", "Scenic views", "Relaxation area", "Towel service"]
        },
        {
          name: "Recreational Activities",
          description: "Various activities for guest entertainment and leisure",
          capacity: "Groups welcome",
          features: ["Outdoor games", "Entertainment options", "Group activities", "Family-friendly"]
        }
      ]
    },
    {
      category: "Business Services",
      icon: UserCheck,
      items: [
        {
          name: "24/7 Front Desk",
          description: "Round-the-clock professional service and guest assistance",
          capacity: "All guests",
          features: ["Concierge service", "Tour arrangements", "Local information", "Guest support"]
        },
        {
          name: "Laundry Services",
          description: "Professional laundry and dry cleaning services",
          capacity: "All guests",
          features: ["Same-day service", "Dry cleaning", "Ironing", "Pickup & delivery"]
        },
        {
          name: "Airport Transfer",
          description: "Convenient transportation to and from Kisumu Airport",
          capacity: "On request",
          features: ["Professional drivers", "Comfortable vehicles", "Scheduled pickup", "Door-to-door service"]
        }
      ]
    },
    {
      category: "Family Services",
      icon: Baby,
      items: [
        {
          name: "Children's Activities",
          description: "Safe and engaging activities designed for young guests",
          capacity: "Children of all ages",
          features: ["Supervised activities", "Educational games", "Safe play areas", "Family bonding"]
        },
        {
          name: "Family Rooms",
          description: "Spacious accommodations designed for families",
          capacity: "Up to 6 guests",
          features: ["Multiple beds", "Extra space", "Child-friendly amenities", "Family entertainment"]
        }
      ]
    }
  ];

  const generalAmenities = [
    { icon: Wifi, label: "Free WiFi", desc: "High-speed internet throughout" },
    { icon: Car, label: "Free Parking", desc: "Secure parking for all guests" },
    { icon: Wind, label: "Air Conditioning", desc: "Climate control in all rooms" },
    { icon: Tv, label: "Entertainment", desc: "Flat-screen TVs with cable" },
    { icon: Coffee, label: "Room Service", desc: "24/7 dining service" },
    { icon: Shirt, label: "Laundry", desc: "Professional cleaning service" },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              World-Class Facilities & Services
            </h1>
            <p className="text-xl md:text-2xl text-hotel-gold mb-8">
              Everything You Need for Business, Leisure & Special Events
            </p>
            <p className="text-lg leading-relaxed">
              From professional conference facilities to recreational amenities, 
              Raygreen Hotel offers comprehensive services designed to exceed your expectations.
            </p>
          </div>
        </div>
      </section>

      {/* Facilities Categories */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="space-y-16">
            {facilities.map((category, categoryIndex) => (
              <div key={category.category} className="space-y-8">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center">
                      <category.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-primary mb-4">
                    {category.category}
                  </h2>
                </div>

                {/* Conference room images - show only for Conference & Events category */}
                {category.category === "Conference & Events" && (
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-primary mb-6 text-center">Our Conference Facilities</h3>
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <div className="rounded-lg overflow-hidden shadow-lg">
                        <img 
                          src="/lovable-uploads/dc2f400f-7dd2-4335-9a78-4a56b4b22a79.png" 
                          alt="Conference room setup with water bottles and notepads"
                          className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="rounded-lg overflow-hidden shadow-lg">
                        <img 
                          src="/lovable-uploads/9eb5d33e-7fff-4fe2-b311-889b01c6b388.png" 
                          alt="Large conference hall with red chairs and professional setup"
                          className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid lg:grid-cols-2 gap-8">
                  {category.items.map((facility, index) => (
                    <Card 
                      key={facility.name}
                      className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-primary mb-2">
                              {facility.name}
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                              {facility.description}
                            </p>
                          </div>
                          <Badge className="bg-hotel-gold text-hotel-green font-semibold ml-4">
                            {facility.capacity}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-primary text-sm">Key Features:</h4>
                          <ul className="space-y-1">
                            {facility.features.map((feature) => (
                              <li key={feature} className="flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 bg-hotel-green rounded-full"></div>
                                <span className="text-sm text-muted-foreground">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* General Amenities */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Standard Amenities
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Essential services and amenities available to all guests throughout their stay
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {generalAmenities.map((amenity) => (
              <div key={amenity.label} className="text-center group">
                <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <amenity.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-primary mb-1">{amenity.label}</h3>
                <p className="text-xs text-muted-foreground">{amenity.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-gold">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-hotel-green mb-6">
            Ready to Experience Our Facilities?
          </h2>
          <p className="text-lg text-hotel-green/80 mb-8 max-w-2xl mx-auto">
            Whether you're planning a business event, family vacation, or romantic getaway, 
            our facilities are designed to make your stay memorable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/booking" className="inline-block">
              <button className="bg-hotel-green hover:bg-hotel-green/90 text-white font-semibold px-8 py-3 rounded-md transition-colors">
                Book Your Stay
              </button>
            </a>
            <a href="/contact" className="inline-block">
              <button className="border-2 border-hotel-green text-hotel-green hover:bg-hotel-green hover:text-white font-semibold px-8 py-3 rounded-md transition-colors">
                Plan Your Event
              </button>
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Facilities;
