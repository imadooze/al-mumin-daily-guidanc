/**
 * مكون إعداد الإشعارات للتطبيق
 * Notification Setup Component
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, Check, AlertCircle, Smartphone, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationSetupProps {
  onPermissionGranted?: () => void;
  showInstructions?: boolean;
}

export default function NotificationSetup({ 
  onPermissionGranted, 
  showInstructions = true 
}: NotificationSetupProps) {
  
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    checkNotificationSupport();
  }, []);

  const checkNotificationSupport = () => {
    const supported = 'Notification' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
    }
  };

  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: 'غير مدعوم',
        description: 'الإشعارات غير مدعومة في هذا المتصفح',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsRequesting(true);
      
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast({
          title: 'تم منح الإذن',
          description: 'ستتلقى الآن إشعارات أوقات الصلاة',
        });
        
        onPermissionGranted?.();
        
        // إشعار تجريبي
        showTestNotification();
      } else {
        toast({
          title: 'تم رفض الإذن',
          description: 'لن تتلقى إشعارات أوقات الصلاة',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('خطأ في طلب إذن الإشعارات:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في طلب إذن الإشعارات',
        variant: 'destructive'
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const showTestNotification = () => {
    try {
      const notification = new Notification('المؤمن - دليلك اليومي', {
        body: 'تم تفعيل إشعارات أوقات الصلاة بنجاح',
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: 'test-notification'
      });

      setTimeout(() => notification.close(), 5000);
    } catch (error) {
      console.error('خطأ في إظهار الإشعار التجريبي:', error);
    }
  };

  const getStatusColor = () => {
    switch (permission) {
      case 'granted': return 'text-islamic-green';
      case 'denied': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusText = () => {
    switch (permission) {
      case 'granted': return 'مفعل';
      case 'denied': return 'مرفوض';
      default: return 'غير محدد';
    }
  };

  const getStatusIcon = () => {
    switch (permission) {
      case 'granted': return <Check className="h-4 w-4 text-islamic-green" />;
      case 'denied': return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (!isSupported) {
    return (
      <Alert className="border-destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>الإشعارات غير مدعومة</strong>
          <br />
          متصفحك لا يدعم الإشعارات. يرجى استخدام متصفح حديث للحصول على إشعارات أوقات الصلاة.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="islamic-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5 text-islamic-green" />
          إشعارات أوقات الصلاة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* حالة الإشعارات */}
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <p className="font-medium">حالة الإشعارات</p>
              <p className={`text-sm ${getStatusColor()}`}>
                {getStatusText()}
              </p>
            </div>
          </div>
          
          <Badge 
            className={`${
              permission === 'granted' 
                ? 'bg-islamic-green text-white' 
                : permission === 'denied'
                ? 'bg-destructive text-white'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {getStatusText()}
          </Badge>
        </div>

        {/* إرشادات الاستخدام */}
        {showInstructions && (
          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              <strong>للحصول على أفضل تجربة:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• امنح إذن الإشعارات للتطبيق</li>
                <li>• تأكد من تفعيل الإشعارات في إعدادات المتصفح</li>
                <li>• أضف التطبيق للشاشة الرئيسية للجوال</li>
                <li>• فعل الأذان في الإعدادات</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* أزرار التحكم */}
        <div className="space-y-3">
          {permission === 'default' && (
            <Button
              onClick={requestPermission}
              disabled={isRequesting}
              className="w-full bg-gradient-primary hover:shadow-islamic"
            >
              {isRequesting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  جاري الطلب...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  تفعيل الإشعارات
                </>
              )}
            </Button>
          )}

          {permission === 'granted' && (
            <Button
              onClick={showTestNotification}
              variant="outline"
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              إشعار تجريبي
            </Button>
          )}

          {permission === 'denied' && (
            <Alert className="border-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>تم رفض الإشعارات</strong>
                <br />
                لتفعيل الإشعارات، اذهب إلى إعدادات المتصفح وامنح الإذن لهذا الموقع.
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => window.location.reload()}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  إعادة تحميل الصفحة
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}