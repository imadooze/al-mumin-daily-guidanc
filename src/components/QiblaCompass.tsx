import React from 'react';
import { Target, MapPin } from 'lucide-react';

interface QiblaCompassProps {
  qiblaData: {
    qiblaDirection: number;
    qiblaRelativeDirection: number;
    userHeading: number;
    accuracy: number;
    isCalibrated: boolean;
    magneticDeclination?: number;
    isAccurate?: boolean;
    distance?: number;
  };
}

export default function QiblaCompass({ qiblaData }: QiblaCompassProps) {
  // تحديد دقة الاتجاه بناءً على الخوارزمية المحسنة
  const isAccurate = qiblaData.isAccurate ?? (
    (Math.abs(qiblaData.qiblaRelativeDirection) <= 10 || 
     Math.abs(qiblaData.qiblaRelativeDirection - 360) <= 10) &&
    qiblaData.accuracy > 75 && 
    qiblaData.isCalibrated
  );

  // اتجاهات البوصلة بالعربي
  const directions = [
    { label: 'ش', angle: 0, name: 'شمال' },
    { label: 'ق', angle: 90, name: 'شرق' },
    { label: 'ج', angle: 180, name: 'جنوب' },
    { label: 'غ', angle: 270, name: 'غرب' }
  ];

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* البوصلة المحسنة والمدمجة */}
      <div className="relative">
        <div className="w-72 h-72 relative">{/* حجم أكبر قليلاً للوضوح */}
          {/* الدائرة الخارجية المحسنة */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-islamic-green/8 to-islamic-blue/8 border-2 border-primary/25 shadow-islamic-card backdrop-blur-sm">
            <svg className="w-full h-full" viewBox="0 0 288 288">{/* viewBox محسن لحجم أكبر */}
              {/* خلفية البوصلة المحسنة */}
              <circle
                cx="144"
                cy="144"
                r="135"
                fill="hsl(var(--background))"
                stroke="hsl(var(--border))"
                strokeWidth="1.5"
                className="drop-shadow-sm"
              />
              
              {/* علامات الدرجات المحسنة */}
              <g transform="translate(144, 144)">
                {Array.from({ length: 36 }).map((_, i) => {
                  const angle = i * 10;
                  const isMain = angle % 90 === 0;
                  const isSecondary = angle % 30 === 0;
                  
                  return (
                    <line
                      key={i}
                      x1="0"
                      y1={isMain ? "-130" : isSecondary ? "-125" : "-123"}
                      x2="0"
                      y2={isMain ? "-110" : isSecondary ? "-118" : "-120"}
                      stroke={isMain ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                      strokeWidth={isMain ? "2.5" : "1.5"}
                      transform={`rotate(${angle})`}
                      className={isMain ? "drop-shadow-sm" : ""}
                    />
                  );
                })}
              </g>
              
              {/* اتجاهات البوصلة المحسنة */}
              <g transform="translate(144, 144)">
                {directions.map((dir) => {
                  const x = Math.sin((dir.angle * Math.PI) / 180) * 95;
                  const y = -Math.cos((dir.angle * Math.PI) / 180) * 95;
                  
                  return (
                    <g key={dir.label}>
                      <text
                        x={x}
                        y={y + 7}
                        textAnchor="middle"
                        className="text-xl font-bold fill-primary drop-shadow-sm font-arabic"
                      >
                        {dir.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          {/* النص المركزي الثابت المحسن */}
          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-islamic-green/6 to-islamic-blue/6 border border-primary/25 flex items-center justify-center backdrop-blur-sm shadow-inner">
            <div className="text-center px-2">
              <div className="text-lg font-arabic-display text-primary mb-1 leading-tight drop-shadow-sm">
                لَا إِلَٰهَ إِلَّا ٱللَّٰهُ
              </div>
              <div className="text-sm font-arabic-display text-muted-foreground">
                مُحَمَّدٌ رَسُولُ ٱللَّٰهِ
              </div>
            </div>
          </div>

          {/* السهم المتحرك المحسن */}
          <div 
            className="absolute inset-0 transition-transform duration-700 ease-in-out z-10"
            style={{ 
              transform: `rotate(${qiblaData.qiblaRelativeDirection}deg)`,
              transformOrigin: 'center center'
            }}
          >
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
              {/* سهم القبلة المحسن */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 bg-gradient-to-br from-islamic-gold to-yellow-600 rounded-xl flex items-center justify-center text-white text-xl shadow-islamic-glow ${isAccurate ? 'animate-glow-pulse' : 'animate-pulse'}`}>
                  🕋
                </div>
                <div className="w-1.5 h-10 bg-gradient-to-b from-islamic-gold to-primary rounded-full shadow-lg"></div>
                {/* مؤشر إضافي للدقة */}
                {isAccurate && (
                  <div className="w-2 h-2 bg-islamic-green rounded-full mt-1 animate-pulse"></div>
                )}
              </div>
            </div>
          </div>

          {/* النقطة المركزية المحسنة */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="w-5 h-5 bg-primary rounded-full shadow-islamic-glow border-2 border-background"></div>
          </div>
        </div>

        {/* المعلومات السفلية المحسنة */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-2xl font-bold text-primary drop-shadow-sm">
            {Math.round(qiblaData.userHeading)}°
          </div>
          <div className="text-xs text-muted-foreground font-arabic">اتجاه الجهاز</div>
        </div>
      </div>

      {/* رسالة التأكيد المحسنة */}
      {isAccurate && (
        <div className="bg-gradient-to-r from-islamic-green/15 to-islamic-green/10 border border-islamic-green/25 rounded-2xl p-5 text-center animate-scale-in shadow-islamic-card backdrop-blur-sm">
          <div className="flex items-center justify-center gap-3 text-islamic-green mb-2">
            <Target className="h-6 w-6" />
            <span className="font-semibold text-lg font-arabic">أنت الآن تواجه مكة المكرمة</span>
          </div>
          <div className="text-sm text-muted-foreground font-arabic">
            الاتجاه صحيح للصلاة ✅
          </div>
          {qiblaData.distance && (
            <div className="text-xs text-islamic-green/80 mt-1 font-arabic">
              المسافة: {qiblaData.distance.toLocaleString('ar-SA')} كم
            </div>
          )}
        </div>
      )}

      {/* معلومات الدقة المحسنة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-lg">
        <div className="text-center p-4 bg-gradient-card backdrop-blur-sm rounded-xl border border-border/50 shadow-islamic-soft">
          <div className="text-lg font-bold text-primary">
            {Math.abs(qiblaData.qiblaRelativeDirection) > 180 
              ? Math.round(360 - qiblaData.qiblaRelativeDirection)
              : Math.round(qiblaData.qiblaRelativeDirection)}°
          </div>
          <div className="text-xs text-muted-foreground font-arabic">الاتجاه النسبي</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-card backdrop-blur-sm rounded-xl border border-border/50 shadow-islamic-soft">
          <div className={`text-lg font-bold ${qiblaData.accuracy > 80 ? 'text-islamic-green' : qiblaData.accuracy > 60 ? 'text-yellow-600' : 'text-red-500'}`}>
            {Math.round(qiblaData.accuracy)}%
          </div>
          <div className="text-xs text-muted-foreground font-arabic">دقة البوصلة</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-card backdrop-blur-sm rounded-xl border border-border/50 shadow-islamic-soft">
          <div className="text-lg font-bold text-primary">
            {Math.round(qiblaData.qiblaDirection)}°
          </div>
          <div className="text-xs text-muted-foreground font-arabic">اتجاه القبلة</div>
        </div>

        {qiblaData.magneticDeclination && (
          <div className="text-center p-4 bg-gradient-card backdrop-blur-sm rounded-xl border border-border/50 shadow-islamic-soft">
            <div className="text-lg font-bold text-islamic-blue">
              {qiblaData.magneticDeclination > 0 ? '+' : ''}{qiblaData.magneticDeclination}°
            </div>
            <div className="text-xs text-muted-foreground font-arabic">الانحراف المغناطيسي</div>
          </div>
        )}
      </div>

      {/* رسالة حالة البوصلة */}
      {!qiblaData.isCalibrated && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-yellow-700 dark:text-yellow-400 mb-1">
            <MapPin className="h-4 w-4" />
            <span className="font-semibold font-arabic">يُنصح بمعايرة البوصلة</span>
          </div>
          <div className="text-sm text-yellow-600 dark:text-yellow-500 font-arabic">
            حرك الجهاز في شكل رقم 8 لتحسين الدقة
          </div>
        </div>
      )}
    </div>
  );
}