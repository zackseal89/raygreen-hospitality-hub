import { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface Testimonial {
  id: string;
  customer_name: string;
  review: string;
  rating: number;
}

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_featured', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTestimonials(data || []);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${
          index < rating 
            ? 'text-hotel-gold fill-current' 
            : 'text-muted-foreground'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            What Our Guests Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover why our guests choose Raygreen Hotel for their stay in Kisumu.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.id}
              className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 border-none bg-background/80 backdrop-blur"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardContent className="p-6 relative">
                {/* Quote Icon */}
                <div className="absolute top-4 right-4 text-hotel-gold/20">
                  <Quote className="h-8 w-8" />
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-4">
                  {renderStars(testimonial.rating)}
                </div>

                {/* Review Text */}
                <blockquote className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.review}"
                </blockquote>

                {/* Customer Info */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-hero rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                    {testimonial.customer_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-primary">
                      {testimonial.customer_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Verified Guest
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12 animate-fade-in">
          <div className="bg-gradient-gold rounded-2xl p-8 text-hotel-green max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Experience Excellence?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Join hundreds of satisfied guests who have made Raygreen Hotel their preferred choice in Kisumu.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/booking" 
                className="bg-hotel-green text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-hotel-green-light transition-colors"
              >
                Book Your Stay
              </a>
              <a 
                href="/contact" 
                className="border-2 border-hotel-green text-hotel-green px-8 py-3 rounded-lg font-semibold hover:bg-hotel-green hover:text-primary-foreground transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;