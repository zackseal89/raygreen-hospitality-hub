
import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, MapPin, Star, Utensils, Wine, Coffee, Sun } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { FoodMenuGallery } from '@/components/dining/FoodMenuGallery';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
}

const Dining = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = [
    'ALL',
    'MAIN COURSE',
    'RAYGREEN SPECIAL',
    'ALA CARTE KIDS MENU',
    'SNACKS',
    'BEVERAGES',
    'DESSERT'
  ];

  const diningHours = [
    { service: "Breakfast", hours: "6:00 AM - 10:00 AM", days: "Daily" },
    { service: "Lunch", hours: "12:00 PM - 3:00 PM", days: "Daily" },
    { service: "Dinner", hours: "6:00 PM - 10:00 PM", days: "Daily" },
    { service: "Rooftop Bar", hours: "4:00 PM - 12:00 AM", days: "Daily" },
  ];

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('available', true)
          .order('category', { ascending: true })
          .order('price', { ascending: true });

        if (error) throw error;
        setMenuItems(data || []);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const filteredItems = selectedCategory === 'ALL' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const groupedItems = categories.reduce((acc, category) => {
    if (category === 'ALL') return acc;
    acc[category] = menuItems.filter(item => item.category === category);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Exceptional Dining Experience
            </h1>
            <p className="text-xl md:text-2xl text-hotel-gold mb-8">
              Savor Local Flavors & International Cuisine
            </p>
            <p className="text-lg leading-relaxed">
              From authentic Kenyan specialties to international favorites, our restaurant and rooftop bar 
              offer unforgettable dining experiences with stunning sunset views over Kisumu.
            </p>
          </div>
        </div>
      </section>

      {/* Dining Venues */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Main Restaurant */}
            <Card className="overflow-hidden border-none bg-card/50 backdrop-blur hover:shadow-elegant transition-all duration-300">
              <div className="h-64 bg-gradient-earth relative">
                <div className="absolute inset-0 bg-gradient-to-br from-hotel-green/30 to-hotel-gold/30 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Utensils className="h-16 w-16 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold">Main Restaurant</h3>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-primary mb-4">Fine Dining Restaurant</h3>
                <p className="text-muted-foreground mb-4">
                  Experience culinary excellence in our elegant main dining room. Our talented chefs 
                  prepare fresh, locally-sourced ingredients alongside international favorites, 
                  creating a perfect blend of traditional Kenyan flavors and modern cuisine.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-hotel-green" />
                    <span className="text-sm">Ground Floor, Main Building</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-hotel-gold" />
                    <span className="text-sm">Capacity: 80 guests</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rooftop Bar */}
            <Card className="overflow-hidden border-none bg-card/50 backdrop-blur hover:shadow-elegant transition-all duration-300">
              <div className="h-64 bg-gradient-gold relative">
                <div className="absolute inset-0 bg-gradient-to-br from-hotel-gold/30 to-hotel-green/30 flex items-center justify-center">
                  <div className="text-center text-hotel-green">
                    <Wine className="h-16 w-16 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold">Rooftop Bar</h3>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-primary mb-4">Sunset Rooftop Bar</h3>
                <p className="text-muted-foreground mb-4">
                  Unwind with breathtaking panoramic views of Kisumu and spectacular sunsets. 
                  Our rooftop bar offers premium cocktails, local beers, light meals, and an 
                  unforgettable ambiance perfect for romantic evenings or social gatherings.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Sun className="h-4 w-4 text-hotel-gold" />
                    <span className="text-sm">Best sunset views in Kisumu</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wine className="h-4 w-4 text-hotel-green" />
                    <span className="text-sm">Premium cocktails & local brews</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dining Hours */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle className="text-2xl text-center flex items-center justify-center space-x-2">
                <Clock className="h-6 w-6" />
                <span>Dining Hours</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {diningHours.map((schedule) => (
                  <div key={schedule.service} className="text-center p-4 rounded-lg bg-muted/50">
                    <h4 className="font-semibold text-primary mb-2">{schedule.service}</h4>
                    <p className="text-sm text-muted-foreground mb-1">{schedule.hours}</p>
                    <Badge variant="secondary" className="text-xs">{schedule.days}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Food Menu Gallery */}
      <FoodMenuGallery />

      {/* Menu Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Our Menu</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Discover our carefully curated selection of dishes, featuring the best of Kenyan cuisine 
              and international favorites, all prepared with fresh, locally-sourced ingredients.
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg h-32 mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 mb-8">
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category} className="text-xs lg:text-sm">
                    {category === 'ALA CARTE KIDS MENU' ? 'KIDS' : category}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="ALL" className="space-y-8">
                {Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category} className="space-y-4">
                    <h3 className="text-2xl font-bold text-primary border-b border-hotel-green/20 pb-2">
                      {category}
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((item) => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-primary">{item.name}</h4>
                              <Badge className="bg-hotel-gold text-hotel-green font-semibold ml-2">
                                {formatPrice(item.price)}
                              </Badge>
                            </div>
                            {item.description && (
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>

              {categories.slice(1).map((category) => (
                <TabsContent key={category} value={category}>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedItems[category]?.map((item) => (
                      <Card key={item.id} className="hover:shadow-elegant transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-bold text-primary text-lg">{item.name}</h4>
                            <Badge className="bg-hotel-gold text-hotel-green font-semibold text-lg px-3 py-1">
                              {formatPrice(item.price)}
                            </Badge>
                          </div>
                          {item.description && (
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </section>

      {/* Special Features */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Why Dine With Us?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                <Coffee className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Fresh Local Ingredients</h3>
              <p className="text-muted-foreground">
                We source the finest local ingredients to ensure authentic flavors and support local farmers.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                <Sun className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Spectacular Views</h3>
              <p className="text-muted-foreground">
                Enjoy your meals with breathtaking sunset views from our rooftop dining area.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Exceptional Service</h3>
              <p className="text-muted-foreground">
                Our professional staff ensures every dining experience exceeds your expectations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-gold">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-hotel-green mb-6">
            Reserve Your Table Today
          </h2>
          <p className="text-lg text-hotel-green/80 mb-8 max-w-2xl mx-auto">
            Experience exceptional dining at Raygreen Hotel. Contact us to make a reservation 
            or book your stay to enjoy our full dining experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/booking" className="inline-block">
              <Button className="bg-hotel-green hover:bg-hotel-green/90 text-white font-semibold px-8 py-3">
                Book Your Stay
              </Button>
            </a>
            <a href="/contact" className="inline-block">
              <Button variant="outline" className="border-2 border-hotel-green text-hotel-green hover:bg-hotel-green hover:text-white font-semibold px-8 py-3">
                Make Reservation
              </Button>
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Dining;
