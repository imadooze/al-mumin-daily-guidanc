import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface QiblaMapViewProps {
  location: { lat: number; lng: number } | null;
  qiblaDirection: number;
  distance: number;
}

export default function QiblaMapView({ location, qiblaDirection, distance }: QiblaMapViewProps) {
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);

  useEffect(() => {
    if (!mapboxToken || !location || !mapContainer.current) return;

    // تحديد إحداثيات الكعبة
    const kaabaLocation = { lat: 21.4225, lng: 39.8262 };

    // إنشاء خريطة بسيطة بدون Mapbox
    const mapDiv = mapContainer.current;
    mapDiv.innerHTML = `
      <div class="relative w-full h-full bg-gradient-to-br from-islamic-blue/20 to-islamic-green/20 rounded-lg border border-border overflow-hidden">
        <!-- خلفية الخريطة -->
        <div class="absolute inset-0 bg-gradient-to-br from-background/90 to-muted/50"></div>
        
        <!-- محتوى الخريطة -->
        <div class="relative h-full flex flex-col items-center justify-center p-4">
          <!-- معلومات الاتجاه -->
          <div class="flex items-center justify-between w-full mb-4">
            <div class="text-right">
              <div class="text-xs text-muted-foreground">تونس</div>
              <div class="text-xs text-muted-foreground">البحر الأبيض المتوسط</div>
            </div>
            <div class="text-left">
              <div class="text-xs text-muted-foreground">سوريا</div>
              <div class="text-xs text-muted-foreground">العراق</div>
            </div>
          </div>

          <!-- الخط المتقطع إلى مكة -->
          <div class="relative flex-1 flex items-center justify-center">
            <svg class="absolute inset-0 w-full h-full" viewBox="0 0 300 100">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--islamic-green))" />
                  <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
                </linearGradient>
              </defs>
              <line 
                x1="50" y1="50" x2="250" y2="50" 
                stroke="url(#lineGradient)" 
                strokeWidth="3" 
                strokeDasharray="8,4"
                className="animate-pulse"
              />
              <circle cx="50" cy="50" r="4" fill="hsl(var(--islamic-blue))" />
              <circle cx="250" cy="50" r="4" fill="hsl(var(--islamic-green))" />
            </svg>
            
            <!-- نقطة الموقع الحالي -->
            <div class="absolute left-12 top-1/2 -translate-y-1/2">
              <div class="flex items-center gap-2">
                <MapPin class="h-4 w-4 text-islamic-blue" />
                <span class="text-xs font-medium">موقعك</span>
              </div>
            </div>
            
            <!-- نقطة مكة -->
            <div class="absolute right-12 top-1/2 -translate-y-1/2">
              <div class="flex items-center gap-2">
                <span class="text-xs font-medium">مكة</span>
                <div class="w-6 h-6 bg-islamic-green rounded text-white text-xs flex items-center justify-center">🕋</div>
              </div>
            </div>
          </div>

          <!-- معلومات المسافة والزاوية -->
          <div class="flex justify-between items-end w-full mt-4">
            <div class="text-center">
              <div class="text-lg font-bold text-primary">${Math.round(qiblaDirection)}°</div>
              <div class="text-xs text-muted-foreground">زاوية الجهاز للقبلة</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-bold text-primary">${distance}كم</div>
              <div class="text-xs text-muted-foreground">المسافة من مكة</div>
            </div>
          </div>
        </div>
      </div>
    `;

    return () => {
      if (mapContainer.current) {
        mapContainer.current.innerHTML = '';
      }
    };
  }, [location, qiblaDirection, distance, mapboxToken]);

  if (showTokenInput) {
    return (
      <div className="h-48 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center p-6 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">عرض خريطة الاتجاه</h3>
          <p className="text-sm text-muted-foreground mb-4">
            سيتم عرض خريطة بسيطة لتوضيح اتجاه القبلة
          </p>
        </div>
        <Button 
          onClick={() => {
            setMapboxToken('demo');
            setShowTokenInput(false);
          }}
          className="islamic-gradient text-white"
        >
          عرض الخريطة
        </Button>
      </div>
    );
  }

  return (
    <div className="h-48 w-full">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}