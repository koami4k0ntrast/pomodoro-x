import { AudioModule } from 'expo-audio';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export class AudioService {
  static async initializeAudio(): Promise<void> {
    try {
      await AudioModule.setAudioModeAsync({
        allowsRecording: false,
        shouldPlayInBackground: true,
        playsInSilentMode: true,
      });
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  static async playNotificationSound(volume: number = 0.8): Promise<void> {
    try {
      // For Phase 1, we'll use vibration instead of custom sound
      // In later phases, we can add custom sound files
      this.vibrate();
      
      // Future implementation would load custom sound:
      // const { sound } = await Audio.Sound.createAsync(
      //   require('../../assets/sounds/notification.mp3'),
      //   { shouldPlay: true, volume }
      // );
      // this.sound = sound;
    } catch (error) {
      console.warn('Error playing notification:', error);
      // Fallback to vibration
      this.vibrate();
    }
  }

  static vibrate(): void {
    try {
      // Use expo-haptics for vibration instead of navigator.vibrate
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        // For Android, use selection feedback for a shorter vibration
        Haptics.selectionAsync();
      }
    } catch (error) {
      console.warn('Vibration not supported:', error);
    }
  }

  static async cleanup(): Promise<void> {
    try {
      // No cleanup needed for current implementation
      // Future implementations with sound files would cleanup here
    } catch (error) {
      console.error('Error cleaning up audio:', error);
    }
  }
} 