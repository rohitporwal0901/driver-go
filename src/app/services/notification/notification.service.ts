import { Injectable, inject } from '@angular/core';
import { PushNotifications, ActionPerformed, PushNotificationSchema, Token } from '@capacitor/push-notifications';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import { Capacitor } from '@capacitor/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private router = inject(Router);

  public incomingRideSubject = new BehaviorSubject<any>(null);

  constructor() { }

  public initPush() {
    // Only register on native platforms (Android/iOS)
    if (Capacitor.isNativePlatform()) {
      this.registerNotifications();
    }
  }

  private async registerNotifications() {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('Push notification permission not granted');
      return;
    }

    await PushNotifications.register();

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token: ' + token.value);
      this.saveTokenToFirestore(token.value);
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push received: ' + JSON.stringify(notification));
      if (notification.data && notification.data['type'] === 'RIDE_REQUEST') {
        this.incomingRideSubject.next(notification.data);
        this.router.navigate(['/incoming-ride']);
      }
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('Push action performed: ' + JSON.stringify(notification));
      const data = notification.notification.data;
      if (data && data['type'] === 'RIDE_REQUEST') {
        this.incomingRideSubject.next(data);
        this.router.navigate(['/incoming-ride']);
      }
    });
  }

  private async saveTokenToFirestore(token: string) {
    let profile: any = null;
    this.authService.userProfile$.subscribe(p => profile = p).unsubscribe();
    if (profile && profile.uid) {
      const docRef = doc(this.firestore, `users/${profile.uid}/tokens/fcm`);
      await setDoc(docRef, { token, updatedAt: Date.now() }, { merge: true });
    }
  }
}
