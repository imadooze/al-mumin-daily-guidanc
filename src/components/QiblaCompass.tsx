import React from 'react';
import { Target } from 'lucide-react';

interface QiblaCompassProps {
  qiblaData: {
    qiblaDirection: number;
    qiblaRelativeDirection: number;
    userHeading: number;
    accuracy: number;
    isCalibrated: boolean;
  };
}

export default function QiblaCompass({ qiblaData }: QiblaCompassProps) {
  const isAccurate = Math.abs(qiblaData.qiblaRelativeDirection) < 10 || 
                    Math.abs(qiblaData.qiblaRelativeDirection - 360) < 10;

  // توليد النقاط الزخرفية
  const decorativePoints = Array.from({ length: 72 }, (_, i) => {
    const angle = i * 5;
    const isMainDirection = angle % 90 === 0;
    const isSecondaryDirection = angle % 30 === 0 && !isMainDirection;
    
    return {
      angle,
      isMain: isMainDirection,
      isSecondary: isSecondaryDirection,
      size: isMainDirection ? 3 : isSecondaryDirection ? 2 : 1
    };
  });

  // رسم الزخارف الإسلامية
  const decorativePattern = Array.from({ length: 8 }, (_, i) => {
    const angle = i * 45;
    return (
      <g key={i} transform={`rotate(${angle})`}>
        <path
          d="M 0,-140 Q 10,-135 0,-130 Q -10,-135 0,-140"
          fill="hsl(var(--islamic-green))"
          fillOpacity="0.6"
          className="animate-pulse"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      </g>
    );
  });

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* البوصلة الرئيسية */}
      <div className="relative">
        <div className="w-80 h-80 relative">
          {/* الحلقة الخارجية المزخرفة */}
          <div className="absolute inset-0 rounded-full border-4 border-primary/30 shadow-islamic-glow">
            <svg className="w-full h-full" viewBox="0 0 320 320">
              {/* خلفية دائرية */}
              <circle
                cx="160"
                cy="160"
                r="150"
                fill="hsl(var(--background))"
                stroke="hsl(var(--border))"
                strokeWidth="2"
              />
              
              {/* الزخارف الخارجية */}
              <g transform="translate(160, 160)">
                {decorativePattern}
              </g>
              
              {/* علامات الدرجات */}
              <g transform="translate(160, 160)">
                {decorativePoints.map((point, i) => (
                  <line
                    key={i}
                    x1="0"
                    y1={point.isMain ? "-145" : point.isSecondary ? "-140" : "-135"}
                    x2="0"
                    y2={point.isMain ? "-125" : point.isSecondary ? "-130" : "-133"}
                    stroke={point.isMain ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                    strokeWidth={point.size}
                    transform={`rotate(${point.angle})`}
                  />
                ))}
              </g>
              
              {/* اتجاهات البوصلة */}
              <g transform="translate(160, 160)">
                {['N', 'E', 'S', 'W'].map((direction, index) => {
                  const angle = index * 90;
                  const x = Math.sin((angle * Math.PI) / 180) * 110;
                  const y = -Math.cos((angle * Math.PI) / 180) * 110;
                  
                  return (
                    <g key={direction}>
                      <text
                        x={x}
                        y={y + 5}
                        textAnchor="middle"
                        className="text-lg font-bold fill-foreground"
                        transform={`rotate(${-qiblaData.userHeading} ${x} ${y})`}
                      >
                        {direction}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          {/* الدائرة الداخلية مع النص العربي */}
          <div 
            className="absolute inset-8 rounded-full bg-gradient-to-br from-islamic-green/20 to-islamic-blue/20 border-2 border-primary/40 flex items-center justify-center transition-transform duration-300"
            style={{ transform: `rotate(${-qiblaData.userHeading}deg)` }}
          >
            <div className="text-center">
              <div className="text-2xl font-arabic-display text-primary mb-2 leading-relaxed">
                لَا إِلَٰهَ إِلَّا ٱللَّٰهُ
              </div>
              <div className="text-lg font-arabic-display text-muted-foreground">
                مُحَمَّدٌ رَسُولُ ٱللَّٰهِ
              </div>
            </div>
          </div>

          {/* مؤشر القبلة */}
          <div 
            className="absolute inset-0 transition-transform duration-300 z-10"
            style={{ transform: `rotate(${qiblaData.qiblaRelativeDirection}deg)` }}
          >
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
              {/* أيقونة الكعبة */}
              <div className="w-10 h-10 bg-islamic-gold rounded-lg flex items-center justify-center text-white text-xl mb-2 animate-pulse-islamic">
                🕋
              </div>
              {/* السهم */}
              <div className="w-1 h-12 bg-gradient-to-b from-islamic-gold to-primary rounded-full"></div>
            </div>
          </div>

          {/* النقطة المركزية */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-6 h-6 bg-primary rounded-full shadow-islamic-glow animate-glow-pulse"></div>
          </div>

          {/* عرض الدرجة الحالية */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
            <div className="text-3xl font-bold text-primary">
              {Math.round(qiblaData.userHeading)}°
            </div>
            <div className="text-sm text-muted-foreground">
              اتجاه الجهاز
            </div>
          </div>
        </div>
      </div>

      {/* رسالة التأكيد */}
      {isAccurate && (
        <div className="bg-islamic-green/10 border border-islamic-green/20 rounded-2xl p-4 text-center animate-scale-in">
          <div className="flex items-center justify-center gap-2 text-islamic-green mb-2">
            <Target className="h-5 w-5" />
            <span className="font-semibold">أنت الآن تواجه مكة</span>
          </div>
          <div className="text-sm text-muted-foreground">
            الاتجاه صحيح للصلاة
          </div>
        </div>
      )}

      {/* معلومات الدقة */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-md">
        <div className="text-center p-3 bg-muted/30 rounded-xl">
          <div className="text-xl font-bold text-primary">
            {Math.abs(qiblaData.qiblaRelativeDirection) > 180 
              ? Math.round(360 - qiblaData.qiblaRelativeDirection)
              : Math.round(qiblaData.qiblaRelativeDirection)}°
          </div>
          <div className="text-xs text-muted-foreground">الاتجاه النسبي</div>
        </div>
        
        <div className="text-center p-3 bg-muted/30 rounded-xl">
          <div className="text-xl font-bold text-islamic-green">
            {qiblaData.accuracy}%
          </div>
          <div className="text-xs text-muted-foreground">دقة البوصلة</div>
        </div>
        
        <div className="text-center p-3 bg-muted/30 rounded-xl">
          <div className="text-xl font-bold text-primary">
            {qiblaData.qiblaDirection}°
          </div>
          <div className="text-xs text-muted-foreground">الاتجاه المطلق</div>
        </div>
      </div>
    </div>
  );
}