import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Expand, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RoomCategory {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  maxOccupancy: number;
  images: string[];
  features: string[];
  badge?: string;
}

const roomCategories: RoomCategory[] = [
  {
    id: 'executive',
    name: 'Executive Rooms',
    description: 'Spacious and elegantly designed rooms perfect for business travelers and couples seeking luxury.',
    basePrice: 8500,
    maxOccupancy: 2,
    images: ['/lovable-uploads/6867328d-5cf8-4d3a-bf21-dde09a477492.png', '/lovable-uploads/d24bc69f-aed9-48f9-b727-689a352ab799.png'],
    features: ['King Size Bed', 'Work Desk', 'City View', 'Premium Amenities'],
    badge: 'Most Popular'
  },
  {
    id: 'deluxe',
    name: 'Deluxe Rooms',
    description: 'Comfortable rooms with modern amenities and beautiful views of the surrounding area.',
    basePrice: 6500,
    maxOccupancy: 2,
    images: ['/lovable-uploads/8f796d5a-7cdc-4c0b-ba1d-11d64c1502ae.png'],
    features: ['Queen Size Bed', 'Sitting Area', 'Garden View', 'Modern Bathroom']
  },
  {
    id: 'standard',
    name: 'Standard Rooms',
    description: 'Well-appointed rooms offering excellent value with all essential amenities.',
    basePrice: 4500,
    maxOccupancy: 2,
    images: ['/lovable-uploads/933f3573-c7b6-4257-89b9-16e4d552fd83.png'],
    features: ['Double Bed', 'En-suite Bathroom', 'Free WiFi', 'Air Conditioning']
  },
  {
    id: 'family',
    name: 'Family Rooms',
    description: 'Spacious accommodations perfect for families with children.',
    basePrice: 9500,
    maxOccupancy: 4,
    images: ['/lovable-uploads/a6f12749-6cad-4807-bbe1-355c9210011b.png'],
    features: ['Multiple Beds', 'Extra Space', 'Child-Friendly', 'Family Amenities']
  }
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0
  }).format(price);
};

export const RoomGallery = () => {
  const [activeCategory, setActiveCategory] = useState('executive');

  return (
    <div className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Room Gallery
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore our beautifully designed accommodations and find the perfect room for your stay.
          </p>
        </div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
            {roomCategories.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="relative data-[state=active]:bg-gradient-hero data-[state=active]:text-primary-foreground"
              >
                {category.name.split(' ')[0]}
                {category.badge && (
                  <Star className="h-3 w-3 ml-1 fill-current" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {roomCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-8">
              <Card className="overflow-hidden border-none bg-card/50 backdrop-blur">
                <CardContent className="p-0">
                  <div className="grid lg:grid-cols-2 gap-0">
                    {/* Image Gallery */}
                    <div className="relative">
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="relative cursor-pointer group">
                            <img
                              src={category.images[0]}
                              alt={category.name}
                              className="w-full h-80 lg:h-96 object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                            <div className="absolute top-4 right-4 bg-white/90 rounded-full p-2">
                              <Expand className="h-4 w-4 text-primary" />
                            </div>
                            {category.badge && (
                              <Badge className="absolute top-4 left-4 bg-hotel-gold text-hotel-green font-semibold">
                                {category.badge}
                              </Badge>
                            )}
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <img
                            src={category.images[0]}
                            alt={category.name}
                            className="w-full h-auto object-cover rounded-lg"
                          />
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* Room Details */}
                    <div className="p-8 lg:p-12 flex flex-col justify-center">
                      <div className="mb-6">
                        <h3 className="text-2xl lg:text-3xl font-bold text-primary mb-3">
                          {category.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-muted-foreground mb-4">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>Sleeps {category.maxOccupancy}</span>
                          </div>
                          <div className="text-2xl font-bold text-hotel-green">
                            {formatPrice(category.basePrice)}
                            <span className="text-sm font-normal text-muted-foreground">/night</span>
                          </div>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {category.description}
                        </p>
                      </div>

                      {/* Features */}
                      <div className="mb-8">
                        <h4 className="font-semibold text-primary mb-4">Key Features</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {category.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-hotel-green rounded-full" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Link to="/booking" className="flex-1">
                          <Button className="w-full bg-gradient-hero hover:opacity-90 text-primary-foreground font-semibold">
                            Book Now
                          </Button>
                        </Link>
                        <Link to="/rooms" className="flex-1">
                          <Button variant="outline" className="w-full border-2 border-primary">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Images Grid */}
              {category.images.length > 1 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {category.images.slice(1).map((image, index) => (
                    <Dialog key={index}>
                      <DialogTrigger asChild>
                        <div className="relative cursor-pointer group overflow-hidden rounded-lg">
                          <img
                            src={image}
                            alt={`${category.name} ${index + 2}`}
                            className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <img
                          src={image}
                          alt={`${category.name} ${index + 2}`}
                          className="w-full h-auto object-cover rounded-lg"
                        />
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};