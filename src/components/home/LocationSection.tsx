import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import LocationMap from '@/components/map/LocationMap';

const LocationSection = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-4">
            Visit Us in Kisumu
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Perfectly located in Nyamasaria, Kisumu, we're easily accessible from the city center 
            and major transport hubs while offering a peaceful retreat.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="card-modern p-8">
              <h3 className="text-xl font-semibold text-primary mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-hero p-3 rounded-2xl">
                    <MapPin className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">Address</h4>
                    <p className="text-muted-foreground">
                      Nyamasaria, Kisumu County<br />
                      Kenya
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-hero p-3 rounded-2xl">
                    <Phone className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">Phone</h4>
                    <p className="text-muted-foreground">
                      +254 xxx xxx xxx<br />
                      <span className="text-sm">24/7 Reception</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-hero p-3 rounded-2xl">
                    <Mail className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">Email</h4>
                    <p className="text-muted-foreground">
                      info@raygreenhotel.com<br />
                      reservations@raygreenhotel.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-hero p-3 rounded-2xl">
                    <Clock className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">Check-in/Check-out</h4>
                    <p className="text-muted-foreground">
                      Check-in: 2:00 PM<br />
                      Check-out: 11:00 AM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Accessibility & Transportation */}
            <div className="card-modern p-8">
              <h3 className="text-xl font-semibold text-primary mb-6">Getting Here</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-hotel-green rounded-full"></div>
                  <span>15 minutes from Kisumu city center</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-hotel-green rounded-full"></div>
                  <span>20 minutes from Kisumu International Airport</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-hotel-green rounded-full"></div>
                  <span>Easy access to public transportation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-hotel-green rounded-full"></div>
                  <span>Free parking available</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-hotel-green rounded-full"></div>
                  <span>Airport transfer service available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="space-y-6">
            <LocationMap />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Click the marker on the map for more details about our location
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;