import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Hotel Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-hotel-gold text-hotel-green rounded-lg p-2">
                <span className="font-bold text-lg">RG</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Raygreen Hotel</h3>
                <p className="text-sm text-hotel-gold">Best African Hospitality</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Welcome to Raygreen Hotel, where luxury meets comfort. We offer a serene escape from the hustle and bustle of the city.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-hotel-gold">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { name: 'Home', href: '/' },
                { name: 'About Us', href: '/about' },
                { name: 'Rooms & Suites', href: '/rooms' },
                { name: 'Facilities', href: '/facilities' },
                { name: 'Dining', href: '/dining' },
                { name: 'Contact Us', href: '/contact' },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-sm hover:text-hotel-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-hotel-gold">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-hotel-gold mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p>Raygreen Hotel</p>
                  <p>Nyamasaria Off Kisumu Nairobi Road</p>
                  <p>Milimani, Kisumu, Kenya</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-hotel-gold" />
                <span className="text-sm">+254 XXX XXX XXX</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-hotel-gold" />
                <span className="text-sm">info@raygreenhotel.com</span>
              </div>
            </div>
          </div>

          {/* Business Hours & Social */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-hotel-gold">Business Hours</h4>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-medium">Front Desk</p>
                <p>24 Hours</p>
              </div>
              <div>
                <p className="font-medium">Restaurant</p>
                <p>6:00 AM - 10:00 PM</p>
              </div>
              <div>
                <p className="font-medium">Rooftop Bar</p>
                <p>5:00 PM - 12:00 AM</p>
              </div>
            </div>
            
            {/* Social Media */}
            <div className="pt-4">
              <p className="text-sm font-medium text-hotel-gold mb-3">Follow Us</p>
              <div className="flex space-x-3">
                <a 
                  href="#" 
                  className="bg-hotel-gold text-hotel-green p-2 rounded-lg hover:opacity-80 transition-opacity"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a 
                  href="#" 
                  className="bg-hotel-gold text-hotel-green p-2 rounded-lg hover:opacity-80 transition-opacity"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a 
                  href="#" 
                  className="bg-hotel-gold text-hotel-green p-2 rounded-lg hover:opacity-80 transition-opacity"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-sm">
            © {currentYear} Raygreen Hotel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;