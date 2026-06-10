import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, authState, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'rider' | 'driver';
  createdAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  
  public user$ = authState(this.auth);
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  public userProfile$ = this.userProfileSubject.asObservable();

  constructor() {
    this.user$.subscribe(async (user: User | null) => {
      if (user) {
        const profile = await this.getUserProfile(user.uid);
        this.userProfileSubject.next(profile);
      } else {
        this.userProfileSubject.next(null);
      }
    });
  }

  async signup(email: string, password: string, name: string, role: 'rider' | 'driver'): Promise<void> {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const user = userCredential.user;
    
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email || email,
      name,
      role,
      createdAt: Date.now()
    };
    
    // Save user profile in Firestore
    await setDoc(doc(this.firestore, `users/${user.uid}`), profile);
    this.userProfileSubject.next(profile);
  }

  async login(email: string, password: string): Promise<UserProfile | null> {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    const profile = await this.getUserProfile(userCredential.user.uid);
    this.userProfileSubject.next(profile);
    return profile;
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.userProfileSubject.next(null);
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(this.firestore, `users/${uid}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  }
}
