import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c4af2f5f8bfc433a9f0c3c6f8f25e310',
  appName: 'al-mumin-daily-guidance',
  webDir: 'dist',
  server: {
    url: 'https://c4af2f5f-8bfc-433a-9f0c-3c6f8f25e310.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF',
      sound: 'beep.wav'
    }
  }
};

export default config;