import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Star, Clock, Users, ChefHat } from 'lucide-react';

interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  cookingTime: string;
  servings: number;
  rating: number;
  isSpecial?: boolean;
}

const foodCategories = [
  { id: 'kenyan', name: 'Kenyan Classics', icon: '🇰🇪' },
  { id: 'fish', name: 'Fresh Fish', icon: '🐟' },
  { id: 'international', name: 'International', icon: '🌍' },
  { id: 'appetizers', name: 'Appetizers', icon: '🥗' },
  { id: 'desserts', name: 'Desserts', icon: '🍰' },
  { id: 'beverages', name: 'Beverages', icon: '🥤' }
];

const menuItems: FoodItem[] = [
  // Kenyan Classics
  {
    id: '1',
    name: 'Ugali with Sukuma Wiki',
    description: 'Traditional cornmeal staple served with perfectly seasoned collard greens and your choice of meat',
    price: 450,
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445',
    category: 'kenyan',
    cookingTime: '20 mins',
    servings: 1,
    rating: 4.8,
    isSpecial: true
  },
  {
    id: '2',
    name: 'Nyama Choma',
    description: 'Grilled meat marinated in traditional spices, served with ugali and kachumbari',
    price: 850,
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba',
    category: 'kenyan',
    cookingTime: '35 mins',
    servings: 1,
    rating: 4.9
  },
  {
    id: '3',
    name: 'Pilau Rice',
    description: 'Aromatic spiced rice cooked with tender meat and traditional Swahili spices',
    price: 650,
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b',
    category: 'kenyan',
    cookingTime: '40 mins',
    servings: 1,
    rating: 4.7
  },

  // Fresh Fish
  {
    id: '4',
    name: 'Grilled Tilapia',
    description: 'Fresh Lake Victoria tilapia grilled to perfection with local herbs and served with ugali',
    price: 750,
    image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44',
    category: 'fish',
    cookingTime: '25 mins',
    servings: 1,
    rating: 4.9,
    isSpecial: true
  },
  {
    id: '5',
    name: 'Fish Curry',
    description: 'Tender fish pieces in rich coconut curry sauce with aromatic spices, served with rice',
    price: 680,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b',
    category: 'fish',
    cookingTime: '30 mins',
    servings: 1,
    rating: 4.6
  },
  {
    id: '6',
    name: 'Fish & Chips',
    description: 'Crispy battered fish fillet served with golden fries and tartar sauce',
    price: 590,
    image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44',
    category: 'fish',
    cookingTime: '20 mins',
    servings: 1,
    rating: 4.5
  },

  // International
  {
    id: '7',
    name: 'Grilled Chicken Breast',
    description: 'Tender chicken breast with herbs, served with roasted vegetables and mashed potatoes',
    price: 720,
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435',
    category: 'international',
    cookingTime: '25 mins',
    servings: 1,
    rating: 4.7
  },
  {
    id: '8',
    name: 'Beef Steak',
    description: 'Premium beef steak cooked to your preference with seasonal vegetables',
    price: 950,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d',
    category: 'international',
    cookingTime: '30 mins',
    servings: 1,
    rating: 4.8
  },

  // Appetizers
  {
    id: '9',
    name: 'Samosas',
    description: 'Crispy pastries filled with spiced vegetables or meat, served with chutney',
    price: 180,
    image: 'https://images.unsplash.com/photo-1601314002957-4cef1959e1b4',
    category: 'appetizers',
    cookingTime: '15 mins',
    servings: 3,
    rating: 4.6
  },
  {
    id: '10',
    name: 'Chicken Wings',
    description: 'Spicy grilled chicken wings with local seasonings and dipping sauce',
    price: 380,
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445',
    category: 'appetizers',
    cookingTime: '20 mins',
    servings: 6,
    rating: 4.7
  },

  // Desserts
  {
    id: '11',
    name: 'Mandazi',
    description: 'Traditional East African donuts, lightly sweetened and perfectly fried',
    price: 120,
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b',
    category: 'desserts',
    cookingTime: '15 mins',
    servings: 4,
    rating: 4.5
  },

  // Beverages
  {
    id: '12',
    name: 'Fresh Passion Juice',
    description: 'Refreshing passion fruit juice made from locally sourced fruits',
    price: 180,
    image: 'https://images.unsplash.com/photo-1546171753-97d7676e4602',
    category: 'beverages',
    cookingTime: '5 mins',
    servings: 1,
    rating: 4.8
  }
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0
  }).format(price);
};

export const FoodMenuGallery = () => {
  const [activeCategory, setActiveCategory] = useState('kenyan');

  const filteredItems = menuItems.filter(item => item.category === activeCategory);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-4">
            Food Gallery
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore our diverse culinary offerings featuring authentic Kenyan dishes, fresh fish from Lake Victoria, 
            and international favorites - all prepared with the finest local ingredients.
          </p>
        </div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8">
            {foodCategories.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="data-[state=active]:bg-gradient-hero data-[state=active]:text-primary-foreground flex items-center space-x-1"
              >
                <span className="text-lg">{category.icon}</span>
                <span className="hidden sm:inline text-xs lg:text-sm">{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {foodCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredItems.map((item, index) => (
                  <Dialog key={item.id}>
                    <DialogTrigger asChild>
                      <Card 
                        className="card-modern group cursor-pointer overflow-hidden"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="relative">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          
                          {/* Badges */}
                          <div className="absolute top-4 left-4 space-y-2">
                            {item.isSpecial && (
                              <Badge className="bg-hotel-gold text-hotel-green font-semibold">
                                <Star className="h-3 w-3 mr-1" />
                                Special
                              </Badge>
                            )}
                            <Badge className="bg-white/90 text-primary font-semibold">
                              {formatPrice(item.price)}
                            </Badge>
                          </div>

                          {/* Rating */}
                          <div className="absolute top-4 right-4">
                            <div className="flex items-center space-x-1 bg-black/50 rounded-full px-2 py-1">
                              <Star className="h-3 w-3 fill-hotel-gold text-hotel-gold" />
                              <span className="text-white text-xs font-medium">{item.rating}</span>
                            </div>
                          </div>

                          {/* Quick Info */}
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white font-semibold text-lg mb-1">{item.name}</h3>
                            <div className="flex items-center justify-between text-white/80 text-xs">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{item.cookingTime}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="h-3 w-3" />
                                <span>Serves {item.servings}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </DialogTrigger>

                    <DialogContent className="max-w-2xl">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-64 object-cover rounded-lg"
                          />
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-2xl font-display font-bold text-primary">{item.name}</h3>
                              {item.isSpecial && (
                                <Badge className="bg-hotel-gold text-hotel-green">
                                  <Star className="h-3 w-3 mr-1" />
                                  Special
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                              {item.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 py-4 border-y">
                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-1 text-hotel-green mb-1">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm font-medium">{item.cookingTime}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">Cooking Time</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-1 text-hotel-green mb-1">
                                <Users className="h-4 w-4" />
                                <span className="text-sm font-medium">Serves {item.servings}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">Portion Size</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 fill-hotel-gold text-hotel-gold" />
                                <span className="font-medium">{item.rating}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">Customer Rating</span>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-hotel-green">
                                {formatPrice(item.price)}
                              </div>
                              <p className="text-xs text-muted-foreground">per serving</p>
                            </div>
                          </div>

                          <Button className="w-full btn-modern">
                            <ChefHat className="h-4 w-4 mr-2" />
                            Order This Dish
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>

              {/* Category Description */}
              <div className="card-modern p-8 text-center">
                <div className="text-4xl mb-4">
                  {foodCategories.find(cat => cat.id === activeCategory)?.icon}
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">
                  {foodCategories.find(cat => cat.id === activeCategory)?.name}
                </h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {activeCategory === 'kenyan' && "Experience authentic Kenyan flavors with our traditional dishes prepared using time-honored recipes and the finest local ingredients."}
                  {activeCategory === 'fish' && "Fresh fish from Lake Victoria, prepared in various styles from traditional grilled to contemporary curry preparations."}
                  {activeCategory === 'international' && "World-class international cuisine crafted by our expert chefs to satisfy diverse palates."}
                  {activeCategory === 'appetizers' && "Perfect starters to begin your culinary journey, featuring both local and international favorites."}
                  {activeCategory === 'desserts' && "Sweet endings to your meal with traditional and modern dessert options."}
                  {activeCategory === 'beverages' && "Refreshing drinks made from fresh local fruits and premium ingredients."}
                </p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};