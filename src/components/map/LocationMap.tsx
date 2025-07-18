import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const LocationMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Raygreen Hotel coordinates in Nyamasaria, Kisumu
  const hotelCoordinates: [number, number] = [34.7617, -0.0917]; // Kisumu coordinates

  useEffect(() => {
    const getMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (data?.token) {
          setMapboxToken(data.token);
        }
      } catch (error) {
        console.log('Mapbox token not configured');
      } finally {
        setLoading(false);
      }
    };

    getMapboxToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: hotelCoordinates,
      zoom: 14,
      pitch: 45,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add marker for hotel location
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23166534'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E")`;
    el.style.width = '40px';
    el.style.height = '40px';
    el.style.backgroundSize = 'contain';
    el.style.backgroundRepeat = 'no-repeat';

    // Add marker with popup
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
      <div class="text-center p-2">
        <h3 class="font-semibold text-hotel-green">Raygreen Hotel</h3>
        <p class="text-sm text-muted-foreground">Nyamasaria, Kisumu</p>
        <p class="text-xs mt-1">Modern Luxury Hospitality</p>
      </div>
    `);

    new mapboxgl.Marker(el)
      .setLngLat(hotelCoordinates)
      .setPopup(popup)
      .addTo(map.current);

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  if (loading) {
    return (
      <Card className="h-96 animate-pulse">
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!mapboxToken) {
    return (
      <Card className="h-96">
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center max-w-md">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-hotel-green" />
            <h3 className="text-lg font-semibold mb-2">Find Us in Kisumu</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Raygreen Hotel is located in Nyamasaria, Kisumu - easily accessible from the city center and major transport hubs.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center space-x-2">
                <Navigation className="h-4 w-4 text-hotel-green" />
                <span>Nyamasaria, Kisumu County</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <MapPin className="h-4 w-4 text-hotel-green" />
                <span>Kenya</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          <div ref={mapContainer} className="h-96 w-full" />
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-soft">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-hotel-green mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Raygreen Hotel</h4>
                <p className="text-xs text-muted-foreground">Nyamasaria, Kisumu</p>
                <p className="text-xs text-hotel-green font-medium">Modern Luxury Hospitality</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationMap;