import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Home } from 'lucide-react';

interface QiblaMapViewProps {
  location: { lat: number; lng: number } | null;
  qiblaDirection: number;
  distance: number;
}

export default function QiblaMapView({ location, qiblaDirection, distance }: QiblaMapViewProps) {
  const [showMap, setShowMap] = useState(false);

  if (!showMap) {
    return (
      <div className="h-56 border-2 border-dashed border-primary/30 rounded-2xl flex flex-col items-center justify-center p-6 space-y-4 bg-gradient-to-br from-islamic-green/5 to-islamic-blue/5">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-islamic-green to-islamic-blue rounded-full flex items-center justify-center text-white text-2xl mb-4 animate-pulse">
            🗺️
          </div>
          <h3 className="text-lg font-semibold mb-2 text-primary">خريطة اتجاه القبلة</h3>
          <p className="text-sm text-muted-foreground mb-4">
            عرض تفاعلي لاتجاه القبلة من موقعك
          </p>
        </div>
        <Button 
          onClick={() => setShowMap(true)}
          className="bg-gradient-to-r from-islamic-green to-islamic-blue text-white hover:scale-105 transition-transform"
        >
          <MapPin className="h-4 w-4 mr-2" />
          عرض الخريطة
        </Button>
      </div>
    );
  }

  return (
    <div className="h-56 w-full rounded-2xl overflow-hidden shadow-islamic-card">
      <div className="relative w-full h-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
        {/* خلفية الخريطة المبسطة */}
        <div className="absolute inset-0">
          {/* خطوط الشبكة */}
          <svg className="w-full h-full opacity-20" viewBox="0 0 400 224">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          
          {/* معالم جغرافية مبسطة */}
          <div className="absolute top-4 left-4 text-xs text-primary/60 font-medium">
            البحر الأبيض المتوسط
          </div>
          <div className="absolute top-4 right-4 text-xs text-primary/60 font-medium">
            الخليج العربي
          </div>
          <div className="absolute bottom-4 left-4 text-xs text-primary/60 font-medium">
            شمال أفريقيا
          </div>
          <div className="absolute bottom-4 right-4 text-xs text-primary/60 font-medium">
            شبه الجزيرة العربية
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="relative h-full flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 400 224">
            <defs>
              {/* تدرج للسهم */}
              <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--islamic-green))" />
                <stop offset="50%" stopColor="hsl(var(--islamic-gold))" />
                <stop offset="100%" stopColor="hsl(var(--islamic-blue))" />
              </linearGradient>
              
              {/* نمط الخط المتقطع */}
              <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                      refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="url(#arrowGradient)" />
              </marker>
            </defs>
            
            {/* الخط المتقطع المائل */}
            <line 
              x1="80" y1="170" 
              x2="320" y2="54" 
              stroke="url(#arrowGradient)" 
              strokeWidth="4" 
              strokeDasharray="12,8"
              markerEnd="url(#arrowhead)"
              className="animate-pulse"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
              }}
            />
            
            {/* نقطة الموقع الحالي - المنزل */}
            <g transform="translate(80, 170)">
              <circle r="8" fill="hsl(var(--islamic-blue))" stroke="white" strokeWidth="2" />
              <text x="0" y="25" textAnchor="middle" className="text-xs font-semibold fill-primary">
                موقعك
              </text>
            </g>
            
            {/* أيقونة المنزل */}
            <g transform="translate(72, 155)">
              <path d="M8 4L4 8V14H6V10H10V14H12V8L8 4Z" fill="hsl(var(--islamic-blue))" />
            </g>
            
            {/* نقطة مكة - الكعبة */}
            <g transform="translate(320, 54)">
              <circle r="10" fill="hsl(var(--islamic-green))" stroke="hsl(var(--islamic-gold))" strokeWidth="3" />
              <text x="0" y="6" textAnchor="middle" className="text-lg">🕋</text>
              <text x="0" y="-20" textAnchor="middle" className="text-sm font-bold fill-primary">
                مكة المكرمة
              </text>
            </g>
            
            {/* معلومات المسافة في منتصف الخط */}
            <g transform="translate(200, 100)">
              <rect x="-30" y="-12" width="60" height="24" rx="12" 
                    fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1" />
              <text x="0" y="4" textAnchor="middle" className="text-xs font-bold fill-primary">
                {distance} كم
              </text>
            </g>
          </svg>
        </div>

        {/* معلومات الاتجاه في الأسفل */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 to-transparent p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-islamic-blue rounded-full"></div>
              <span className="text-xs text-muted-foreground">موقعك الحالي</span>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{Math.round(qiblaDirection)}°</div>
              <div className="text-xs text-muted-foreground">اتجاه القبلة</div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">الكعبة المشرفة</span>
              <div className="w-3 h-3 bg-islamic-green rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}