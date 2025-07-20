import { Link } from 'react-router-dom';
import { Calendar, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-hero min-h-[80vh] flex items-center justify-center text-primary-foreground overflow-hidden">
      {/* Hotel Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
        style={{
          backgroundImage: `url('/lovable-uploads/60388d91-6ee6-4582-a857-1cf80ec0dbb0.png')`
        }}
      ></div>
      
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSI0Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="text-center lg:text-left space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Welcome to{' '}
                <span className="text-hotel-gold">Raygreen Hotel</span>
              </h1>
              <p className="text-xl md:text-2xl text-hotel-gold font-medium">
                Best African Hospitality
              </p>
            </div>
            
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto lg:mx-0">
              Welcome to Raygreen Hotel, where luxury meets comfort. We offer a serene escape from the hustle and bustle of the city. Our elegantly designed rooms provide a peaceful soul soothing environment, complete with modern amenities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/booking">
                <Button size="lg" className="bg-hotel-gold hover:bg-hotel-gold-light text-hotel-green font-semibold text-lg px-8 py-3 shadow-gold">
                  Book Your Stay Now
                </Button>
              </Link>
              <Link to="/rooms">
                <Button size="lg" variant="outline" className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg px-8 py-3">
                  Explore Our Rooms
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="flex justify-center lg:justify-start space-x-8 pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-hotel-gold">40+</div>
                <div className="text-sm">Rooms</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <span className="text-2xl font-bold text-hotel-gold">5.0</span>
                  <Star className="h-5 w-5 text-hotel-gold fill-current" />
                </div>
                <div className="text-sm">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-hotel-gold">24/7</div>
                <div className="text-sm">Service</div>
              </div>
            </div>
          </div>

          {/* Quick Booking Widget */}
          <div className="flex justify-center lg:justify-end animate-fade-in">
            <Card className="w-full max-w-md bg-background/95 backdrop-blur border-none shadow-elegant">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-primary">Quick Booking</h3>
                  <p className="text-sm text-muted-foreground">Check availability and rates</p>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-primary">Check-in</label>
                      <div className="relative">
                        <input 
                          type="date" 
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-hotel-green focus:border-transparent"
                          min={new Date().toISOString().split('T')[0]}
                        />
                        <Calendar className="absolute right-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-primary">Check-out</label>
                      <div className="relative">
                        <input 
                          type="date" 
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-hotel-green focus:border-transparent"
                          min={new Date().toISOString().split('T')[0]}
                        />
                        <Calendar className="absolute right-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-primary">Adults</label>
                      <select className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-hotel-green focus:border-transparent">
                        <option value="1">1 Adult</option>
                        <option value="2">2 Adults</option>
                        <option value="3">3 Adults</option>
                        <option value="4">4 Adults</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-primary">Children</label>
                      <select className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-hotel-green focus:border-transparent">
                        <option value="0">0 Children</option>
                        <option value="1">1 Child</option>
                        <option value="2">2 Children</option>
                        <option value="3">3 Children</option>
                      </select>
                    </div>
                  </div>
                  
                  <Link to="/booking" className="block">
                    <Button className="w-full bg-gradient-hero hover:opacity-90 text-primary-foreground font-semibold">
                      Check Availability
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Location Badge */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-float">
          <div className="bg-background/10 backdrop-blur border border-primary-foreground/20 rounded-full px-6 py-3 flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-hotel-gold" />
            <span className="text-sm font-medium">Nyamasaria, Kisumu, Kenya</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;