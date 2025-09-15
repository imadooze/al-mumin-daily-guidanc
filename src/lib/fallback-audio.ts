/**
 * خدمة الصوت الاحتياطي للأذان
 * Fallback Audio Service for Adhan
 */

export class FallbackAudioService {
  private audioContext: AudioContext | null = null;

  // إنتاج نغمة أذان بسيطة باستخدام Web Audio API
  async playAdhanTone(duration: number = 3000): Promise<void> {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // نمط نغمات الأذان التقليدي
      const notes = [
        { frequency: 440, duration: 500 }, // لا
        { frequency: 523, duration: 500 }, // دو
        { frequency: 587, duration: 500 }, // ري
        { frequency: 659, duration: 500 }, // مي
        { frequency: 587, duration: 500 }, // ري
        { frequency: 523, duration: 500 }, // دو
        { frequency: 440, duration: 1000 }, // لا
      ];

      let currentTime = this.audioContext.currentTime;

      for (const note of notes) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(note.frequency, currentTime);
        oscillator.type = 'sine';

        // تأثير الانتقال الناعم
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0.3, currentTime + note.duration / 1000 - 0.1);
        gainNode.gain.linearRampToValueAtTime(0, currentTime + note.duration / 1000);

        oscillator.start(currentTime);
        oscillator.stop(currentTime + note.duration / 1000);

        currentTime += note.duration / 1000;
      }

      console.log('🔔 تم تشغيل نغمة الأذان الاحتياطية');
    } catch (error) {
      console.error('فشل في تشغيل النغمة الاحتياطية:', error);
    }
  }

  // نغمة تذكير بسيطة
  async playReminderTone(): Promise<void> {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 1);

      console.log('🔔 تم تشغيل نغمة التذكير');
    } catch (error) {
      console.error('فشل في تشغيل نغمة التذكير:', error);
    }
  }

  // تنظيف الموارد
  cleanup(): void {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}