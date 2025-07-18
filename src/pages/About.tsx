import Layout from '@/components/layout/Layout';
import { MapPin, Target, Users, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const About = () => {
  const stats = [
    { icon: Users, value: '1000+', label: 'Happy Guests' },
    { icon: Award, value: '5.0', label: 'Star Rating' },
    { icon: MapPin, value: '40+', label: 'Rooms & Suites' },
    { icon: Target, value: '10+', label: 'Years Experience' }
  ];

  const advantages = [
    {
      title: 'Strategic Location',
      description: 'Located in Nyamasaria along Nairobi Highway, offering easy access to the city center and major attractions.'
    },
    {
      title: 'Close to Attractions',
      description: '2.6 miles from Kisumu Museum and 25 miles from Ndere Island National Park.'
    },
    {
      title: 'Airport Proximity',
      description: 'Just 15 minutes from Kisumu International Airport and 10 minutes from the city center.'
    },
    {
      title: 'Business District Access',
      description: 'Easy access to business districts and commercial areas in Kisumu.'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Raygreen Hotel</h1>
            <p className="text-xl md:text-2xl text-hotel-gold mb-8">
              Premier Destination for Luxury and Comfort in Kisumu
            </p>
            <p className="text-lg leading-relaxed">
              Welcome to Raygreen Hotel, where luxury meets comfort in the heart of Kisumu. 
              We offer a serene escape from the hustle and bustle of the city, providing our guests 
              with an unforgettable experience that combines African hospitality with modern amenities.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-primary">Our Story</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Located in the serene area of Nyamasaria along the Nairobi Highway, Raygreen Hotel 
                stands as a premier destination for both leisure and business travelers visiting Kisumu. 
                Our hotel represents the perfect blend of traditional African hospitality and contemporary 
                luxury, designed to provide our guests with an exceptional experience.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Since our establishment, we have been committed to delivering unparalleled service 
                in a peaceful and luxurious environment. Our elegantly designed rooms, world-class 
                facilities, and strategic location make us the preferred choice for discerning travelers.
              </p>
            </div>
            <div className="bg-gradient-earth rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={stat.label} className="text-center">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                      <stat.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="h-10 w-10 text-hotel-green" />
            </div>
            <h2 className="text-3xl font-bold text-primary mb-6">Our Mission</h2>
            <p className="text-xl text-muted-foreground leading-relaxed italic">
              "We aim to provide unparalleled experience in a serene environment by delivering 
              exceptional accommodation, conference and restaurant services in a respectful, 
              luxurious and tranquil environment."
            </p>
          </div>
        </div>
      </section>

      {/* Location Advantages */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Location Advantages</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Strategically positioned for convenience and accessibility, Raygreen Hotel offers 
              easy access to Kisumu's key attractions and business districts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {advantages.map((advantage, index) => (
              <Card key={advantage.title} className="border-none bg-card/50 backdrop-blur hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-primary mb-3">
                    {advantage.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {advantage.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Commitment */}
      <section className="py-16 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Our Commitment</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: 'Exceptional Service',
                  description: 'Round-the-clock professional customer service that exceeds expectations.'
                },
                {
                  title: 'Luxurious Accommodations',
                  description: 'Elegantly designed rooms with modern amenities and peaceful ambiance.'
                },
                {
                  title: 'Sumptuous Dining',
                  description: 'Traditional African and international cuisine prepared by expert chefs.'
                },
                {
                  title: 'Professional Events',
                  description: 'Comprehensive conference services with modern facilities and support.'
                }
              ].map((commitment, index) => (
                <div key={commitment.title} className="text-center">
                  <div className="w-16 h-16 bg-hotel-gold rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-hotel-green">{index + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-hotel-gold">
                    {commitment.title}
                  </h3>
                  <p className="text-sm leading-relaxed opacity-90">
                    {commitment.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;