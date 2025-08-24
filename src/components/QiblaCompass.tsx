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
  const isAccurate = Math.abs(qiblaData.qiblaRelativeDirection) < 15 || 
                    Math.abs(qiblaData.qiblaRelativeDirection - 360) < 15;

  // اتجاهات البوصلة بالعربي
  const directions = [
    { label: 'ش', angle: 0, name: 'شمال' },
    { label: 'ق', angle: 90, name: 'شرق' },
    { label: 'ج', angle: 180, name: 'جنوب' },
    { label: 'غ', angle: 270, name: 'غرب' }
  ];

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* البوصلة المدمجة */}
      <div className="relative">
        <div className="w-64 h-64 relative">
          {/* الدائرة الخارجية */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-islamic-green/10 to-islamic-blue/10 border-3 border-primary/30 shadow-islamic-card">
            <svg className="w-full h-full" viewBox="0 0 256 256">
              {/* خلفية البوصلة */}
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="hsl(var(--background))"
                stroke="hsl(var(--border))"
                strokeWidth="1"
              />
              
              {/* علامات الدرجات */}
              <g transform="translate(128, 128)">
                {Array.from({ length: 36 }).map((_, i) => {
                  const angle = i * 10;
                  const isMain = angle % 90 === 0;
                  const isSecondary = angle % 30 === 0;
                  
                  return (
                    <line
                      key={i}
                      x1="0"
                      y1={isMain ? "-115" : isSecondary ? "-110" : "-108"}
                      x2="0"
                      y2={isMain ? "-100" : isSecondary ? "-105" : "-106"}
                      stroke={isMain ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                      strokeWidth={isMain ? "2" : "1"}
                      transform={`rotate(${angle})`}
                    />
                  );
                })}
              </g>
              
              {/* اتجاهات البوصلة */}
              <g transform="translate(128, 128)">
                {directions.map((dir) => {
                  const x = Math.sin((dir.angle * Math.PI) / 180) * 90;
                  const y = -Math.cos((dir.angle * Math.PI) / 180) * 90;
                  
                  return (
                    <g key={dir.label}>
                      <text
                        x={x}
                        y={y + 6}
                        textAnchor="middle"
                        className="text-lg font-bold fill-primary"
                      >
                        {dir.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          {/* النص المركزي الثابت */}
          <div className="absolute inset-6 rounded-full bg-gradient-to-br from-islamic-green/5 to-islamic-blue/5 border border-primary/20 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-arabic-display text-primary mb-1 leading-tight">
                لَا إِلَٰهَ إِلَّا ٱللَّٰهُ
              </div>
              <div className="text-sm font-arabic-display text-muted-foreground">
                مُحَمَّدٌ رَسُولُ ٱللَّٰهِ
              </div>
            </div>
          </div>

          {/* السهم المتحرك فقط */}
          <div 
            className="absolute inset-0 transition-transform duration-500 ease-out z-10"
            style={{ transform: `rotate(${qiblaData.qiblaRelativeDirection}deg)` }}
          >
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
              {/* سهم القبلة */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-islamic-gold to-yellow-600 rounded-lg flex items-center justify-center text-white text-lg shadow-lg animate-pulse">
                  🕋
                </div>
                <div className="w-1 h-8 bg-gradient-to-b from-islamic-gold to-primary rounded-full shadow-md"></div>
              </div>
            </div>
          </div>

          {/* النقطة المركزية */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="w-4 h-4 bg-primary rounded-full shadow-islamic-glow"></div>
          </div>
        </div>

        {/* المعلومات السفلية */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-2xl font-bold text-primary">
            {Math.round(qiblaData.userHeading)}°
          </div>
          <div className="text-xs text-muted-foreground">اتجاه الجهاز</div>
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