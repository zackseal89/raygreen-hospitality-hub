import { Link } from 'react-router-dom';
import { Calendar, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-hero min-h-[80vh] flex items-center justify-center text-primary-foreground overflow-hidden">
      {/* Hotel Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25"
        style={{
          backgroundImage: `url('/lovable-uploads/60388d91-6ee6-4582-a857-1cf80ec0dbb0.png')`
        }}
      ></div>
      
      {/* Green overlay for executive feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-hotel-green/85 via-hotel-green/75 to-hotel-green-accent/80"></div>
      
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
      
      <div className="container mx-auto px-4 relative z-20">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-center min-h-[75vh] py-8 lg:py-12">
          {/* Hero Content */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-4 lg:space-y-6 animate-fade-in relative z-10">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-white drop-shadow-lg">
                Welcome to{' '}
                <span className="text-hotel-gold font-extrabold drop-shadow-md">Raygreen Hotel</span>
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-hotel-gold font-semibold drop-shadow-sm">
                Best African Hospitality
              </p>
            </div>
            
            <p className="text-base md:text-lg lg:text-xl text-white/95 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed drop-shadow-sm">
              Welcome to Raygreen Hotel, where luxury meets comfort. We offer a serene escape from the hustle and bustle of the city. Our elegantly designed rooms provide a peaceful soul soothing environment, complete with modern amenities.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center lg:justify-start pt-2">
              <Link to="/booking">
                <Button size="lg" className="bg-hotel-gold hover:bg-hotel-gold-light text-hotel-green font-bold text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 shadow-gold border-2 border-hotel-gold hover:border-hotel-gold-light transition-all duration-300 w-full sm:w-auto">
                  Book Your Stay Now
                </Button>
              </Link>
              <Link to="/rooms">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-hotel-green font-semibold text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 backdrop-blur-sm bg-white/10 transition-all duration-300 w-full sm:w-auto">
                  Explore Our Rooms
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="flex justify-center lg:justify-start space-x-6 lg:space-x-8 pt-4 lg:pt-6">
              <div className="text-center">
                <div className="text-xl lg:text-2xl font-bold text-hotel-gold">40+</div>
                <div className="text-xs lg:text-sm text-white/90">Rooms</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <span className="text-xl lg:text-2xl font-bold text-hotel-gold">5.0</span>
                  <Star className="h-4 w-4 lg:h-5 lg:w-5 text-hotel-gold fill-current" />
                </div>
                <div className="text-xs lg:text-sm text-white/90">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-xl lg:text-2xl font-bold text-hotel-gold">24/7</div>
                <div className="text-xs lg:text-sm text-white/90">Service</div>
              </div>
            </div>
          </div>

          {/* Quick Booking Widget */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end animate-fade-in relative z-10 mt-8 lg:mt-0">
            <Card className="w-full max-w-sm lg:max-w-md bg-white/98 backdrop-blur border-none shadow-2xl rounded-2xl overflow-hidden">
              <CardContent className="p-4 lg:p-6">
                <div className="text-center mb-4 lg:mb-6">
                  <h3 className="text-lg lg:text-xl font-bold text-hotel-green">Quick Booking</h3>
                  <p className="text-xs lg:text-sm text-muted-foreground font-medium">Check availability and rates</p>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     <div>
                      <label className="text-sm font-bold text-white mb-1 block">Check-in</label>
                      <div className="relative">
                        <input 
                          type="date" 
                          className="w-full p-3 border-2 border-hotel-green/30 rounded-lg focus:ring-2 focus:ring-hotel-green focus:border-hotel-green text-sm font-medium bg-white"
                          min={new Date().toISOString().split('T')[0]}
                        />
                        <Calendar className="absolute right-3 top-3 h-5 w-5 text-hotel-green pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-white mb-1 block">Check-out</label>
                      <div className="relative">
                        <input 
                          type="date" 
                          className="w-full p-3 border-2 border-hotel-green/30 rounded-lg focus:ring-2 focus:ring-hotel-green focus:border-hotel-green text-sm font-medium bg-white"
                          min={new Date().toISOString().split('T')[0]}
                        />
                        <Calendar className="absolute right-3 top-3 h-5 w-5 text-hotel-green pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs lg:text-sm font-semibold text-hotel-green">Adults</label>
                      <select className="w-full p-2 lg:p-3 border rounded-lg focus:ring-2 focus:ring-hotel-green focus:border-transparent font-medium text-sm">
                        <option value="1">1 Adult</option>
                        <option value="2">2 Adults</option>
                        <option value="3">3 Adults</option>
                        <option value="4">4 Adults</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs lg:text-sm font-semibold text-hotel-green">Children</label>
                      <select className="w-full p-2 lg:p-3 border rounded-lg focus:ring-2 focus:ring-hotel-green focus:border-transparent font-medium text-sm">
                        <option value="0">0 Children</option>
                        <option value="1">1 Child</option>
                        <option value="2">2 Children</option>
                        <option value="3">3 Children</option>
                      </select>
                    </div>
                  </div>
                  
                  <Link to="/booking" className="block">
                    <Button className="w-full bg-gradient-hero hover:opacity-90 text-primary-foreground font-semibold py-2 lg:py-3 text-sm lg:text-base">
                      Check Availability
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Location Badge */}
        <div className="absolute bottom-4 lg:bottom-8 left-1/2 transform -translate-x-1/2 animate-float z-10">
          <div className="bg-white/15 backdrop-blur border border-white/30 rounded-full px-4 lg:px-6 py-2 lg:py-3 flex items-center space-x-2">
            <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-hotel-gold" />
            <span className="text-xs lg:text-sm font-medium text-white">Nyamasaria, Kisumu, Kenya</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;