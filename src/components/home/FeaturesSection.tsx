import { 
  Building, 
  Wifi, 
  Car, 
  Coffee, 
  Users, 
  MapPin,
  Utensils,
  Waves
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const FeaturesSection = () => {
  const features = [
    {
      icon: Building,
      title: 'Rooftop Dining',
      description: 'Breathtaking sunset views with expertly crafted cocktails and gourmet dining.',
      gradient: 'from-hotel-gold to-hotel-gold-light'
    },
    {
      icon: Wifi,
      title: 'Modern Amenities',
      description: 'Free WiFi, air conditioning, flat-screen TV, and all modern conveniences.',
      gradient: 'from-hotel-green to-hotel-green-light'
    },
    {
      icon: Users,
      title: 'Conference Facilities',
      description: 'Spacious halls with modern lighting and professional event planning assistance.',
      gradient: 'from-hotel-earth to-hotel-earth-light'
    },
    {
      icon: Coffee,
      title: 'Free Services',
      description: 'Complimentary breakfast, free parking, and high-speed internet access.',
      gradient: 'from-hotel-gold to-hotel-gold-light'
    },
    {
      icon: MapPin,
      title: 'Central Location',
      description: 'Strategically located along Nairobi Highway with easy access to city attractions.',
      gradient: 'from-hotel-green to-hotel-green-light'
    },
    {
      icon: Waves,
      title: 'Family Friendly',
      description: 'Children activities, family rooms, and kid-friendly dining options available.',
      gradient: 'from-hotel-earth to-hotel-earth-light'
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Why Choose Raygreen Hotel?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Experience unparalleled comfort and luxury with our world-class amenities and exceptional service.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={feature.title}
              className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 border-none bg-card/50 backdrop-blur"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Services */}
        <div className="mt-16 bg-gradient-earth rounded-2xl p-8 text-center animate-fade-in">
          <h3 className="text-2xl font-bold text-primary mb-6">
            Additional Services
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Utensils, label: '24/7 Room Service' },
              { icon: Car, label: 'Airport Transfer' },
              { icon: Users, label: 'Tour Arrangements' },
              { icon: Waves, label: 'Hot Tub & Bar' }
            ].map((service) => (
              <div key={service.label} className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <service.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium text-primary">{service.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;