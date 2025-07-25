import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MapPin, Phone, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAdmin } = useAuth();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Rooms & Suites', href: '/rooms' },
    { name: 'Facilities', href: '/facilities' },
    { name: 'Dining', href: '/dining' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) => location.pathname === href;

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navigation.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          onClick={() => mobile && setIsOpen(false)}
          className={`transition-colors hover:text-hotel-gold ${
            isActive(item.href) 
              ? 'text-hotel-gold font-medium' 
              : 'text-foreground hover:text-hotel-gold'
          } ${mobile ? 'block py-2 text-lg' : 'text-sm font-medium'}`}
        >
          {item.name}
        </Link>
      ))}
    </>
  );

  return (
    <>
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground py-2 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Nyamasaria, Kisumu, Kenya</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+254 748 592 727</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@raygreenhotel.com</span>
              </div>
            </div>
            <div className="text-hotel-gold font-medium">
              Best African Hospitality
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gradient-hero text-primary-foreground rounded-lg p-2">
                <span className="font-bold text-lg">RG</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">Raygreen Hotel</h1>
                <p className="text-xs text-hotel-gold">Best African Hospitality</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <NavLinks />
            </nav>

            {/* CTA Button - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <Link to="/booking">
                <Button className="bg-gradient-gold hover:opacity-90 text-hotel-green font-semibold shadow-gold">
                  Book Now
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col space-y-6 mt-6">
                  <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center space-x-2">
                    <div className="bg-gradient-hero text-primary-foreground rounded-lg p-2">
                      <span className="font-bold text-sm">RG</span>
                    </div>
                    <div>
                      <h2 className="font-bold text-primary">Raygreen Hotel</h2>
                      <p className="text-xs text-hotel-gold">Best African Hospitality</p>
                    </div>
                  </Link>
                  
                  <nav className="flex flex-col space-y-4">
                    <NavLinks mobile />
                  </nav>
                   
                   {isAdmin && (
                     <Link to="/admin" onClick={() => setIsOpen(false)}>
                       <Button variant="outline" className="w-full flex items-center gap-2">
                         <Shield className="h-4 w-4" />
                         Admin Panel
                       </Button>
                     </Link>
                   )}
                   
                   <Link to="/booking" onClick={() => setIsOpen(false)}>
                     <Button className="w-full bg-gradient-gold hover:opacity-90 text-hotel-green font-semibold">
                       Book Now
                     </Button>
                   </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;