// Firebase integration functions for Espacio Shanti
// This file will contain all Firebase-related functionality

class FirebaseManager {
  constructor() {
    this.app = null;
    this.db = null;
    this.auth = null;
    this.initialized = false;
  }

  // Initialize Firebase with config
  async init(config) {
    try {
      // Import Firebase modules dynamically
      const { initializeApp } = await import(
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
      );
      const {
        getFirestore,
        collection,
        addDoc,
        getDocs,
        updateDoc,
        deleteDoc,
        doc,
        query,
        where,
        orderBy,
        onSnapshot,
      } = await import(
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
      );
      const { getAuth, signInWithEmailAndPassword, onAuthStateChanged } =
        await import(
          "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"
        );

      this.app = initializeApp(config);
      this.db = getFirestore(this.app);
      this.auth = getAuth(this.app);

      // Store Firebase functions for later use
      this.firestore = {
        collection,
        addDoc,
        getDocs,
        updateDoc,
        deleteDoc,
        doc,
        query,
        where,
        orderBy,
        onSnapshot,
      };

      this.authFunctions = {
        signInWithEmailAndPassword,
        onAuthStateChanged,
      };

      this.initialized = true;

      return true;
    } catch (error) {
      console.error("❌ Error initializing Firebase:", error);
      return false;
    }
  }

  // Save a new reservation
  async saveReservation(reservationData) {
    if (!this.initialized) {
      console.error("❌ Firebase no inicializado");
      throw new Error("Firebase not initialized");
    }

    try {
      const reservationsRef = this.firestore.collection(
        this.db,
        "reservations"
      );

      const dataToSave = {
        ...reservationData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await this.firestore.addDoc(reservationsRef, dataToSave);

      return docRef.id;
    } catch (error) {
      console.error("❌ Error saving reservation:", error);
      throw error;
    }
  }

  // Get reservations for a specific therapist
  async getReservationsForTherapist(therapistId, startDate, endDate) {
    if (!this.initialized) {
      console.error("❌ Firebase no inicializado");
      throw new Error("Firebase not initialized");
    }

    try {
      const reservationsRef = this.firestore.collection(
        this.db,
        "reservations"
      );

      const q = this.firestore.query(
        reservationsRef,
        this.firestore.where("therapistId", "==", therapistId),
        this.firestore.where("date", ">=", startDate),
        this.firestore.where("date", "<=", endDate),
        this.firestore.orderBy("date"),
        this.firestore.orderBy("time")
      );

      const querySnapshot = await this.firestore.getDocs(q);
      const reservations = [];

      querySnapshot.forEach((doc) => {
        const data = {
          id: doc.id,
          ...doc.data(),
        };
        reservations.push(data);
      });

      return reservations;
    } catch (error) {
      console.error("❌ Error getting reservations:", error);
      throw error;
    }
  }

  // Listen for real-time updates on reservations
  listenToReservations(therapistId, callback) {
    if (!this.initialized) {
      throw new Error("Firebase not initialized");
    }

    try {
      const reservationsRef = this.firestore.collection(
        this.db,
        "reservations"
      );
      const q = this.firestore.query(
        reservationsRef,
        this.firestore.where("therapistId", "==", therapistId),
        this.firestore.orderBy("createdAt", "desc")
      );

      return this.firestore.onSnapshot(q, (querySnapshot) => {
        const reservations = [];
        querySnapshot.forEach((doc) => {
          reservations.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        callback(reservations);
      });
    } catch (error) {
      console.error("Error listening to reservations:", error);
      throw error;
    }
  }

  // Authenticate therapist
  async authenticateTherapist(email, password) {
    if (!this.initialized) {
      throw new Error("Firebase not initialized");
    }

    try {
      const userCredential =
        await this.authFunctions.signInWithEmailAndPassword(
          this.auth,
          email,
          password
        );

      return userCredential.user;
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  }

  // Listen for auth state changes
  onAuthStateChange(callback) {
    if (!this.initialized) {
      throw new Error("Firebase not initialized");
    }

    return this.authFunctions.onAuthStateChanged(this.auth, callback);
  }

  // Get current user
  getCurrentUser() {
    return this.auth?.currentUser || null;
  }

  // Sign out
  async signOut() {
    if (!this.initialized || !this.auth) {
      return;
    }

    await this.auth.signOut();
  }

  // Update an existing reservation
  async updateReservation(reservationId, updatedData) {
    if (!this.initialized) {
      throw new Error("Firebase not initialized");
    }

    try {
      const reservationRef = this.firestore.doc(
        this.db,
        "reservations",
        reservationId
      );

      const dataToUpdate = {
        ...updatedData,
        updatedAt: new Date(),
      };

      await this.firestore.updateDoc(reservationRef, dataToUpdate);

      return reservationId;
    } catch (error) {
      console.error("❌ Error updating reservation:", error);
      throw error;
    }
  }

  // Delete a reservation
  async deleteReservation(reservationId) {
    if (!this.initialized) {
      throw new Error("Firebase not initialized");
    }

    try {
      const reservationRef = this.firestore.doc(
        this.db,
        "reservations",
        reservationId
      );
      await this.firestore.deleteDoc(reservationRef);

      return true;
    } catch (error) {
      console.error("❌ Error deleting reservation:", error);
      throw error;
    }
  }

  // Get all reservations in a date range (for all therapists)
  async getReservationsInDateRange(startDate, endDate) {
    if (!this.initialized) {
      console.error("❌ Firebase no inicializado");
      throw new Error("Firebase not initialized");
    }

    try {
      const reservationsRef = this.firestore.collection(
        this.db,
        "reservations"
      );

      const q = this.firestore.query(
        reservationsRef,
        this.firestore.where("date", ">=", startDate),
        this.firestore.where("date", "<=", endDate),
        this.firestore.orderBy("date"),
        this.firestore.orderBy("time")
      );

      const querySnapshot = await this.firestore.getDocs(q);
      const reservations = [];

      querySnapshot.forEach((doc) => {
        const data = {
          id: doc.id,
          ...doc.data(),
        };

        reservations.push(data);
      });

      return reservations;
    } catch (error) {
      console.error("❌ Error en getReservationsInDateRange:", error);
      throw error;
    }
  }
}

// Create global instance
window.firebaseManager = new FirebaseManager();

// Firebase configuration - REAL CONFIG
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDwotkdQ98N9nJNaZeqUxi672VwLSUB7Lo",
  authDomain: "espacio-shanti.firebaseapp.com",
  projectId: "espacio-shanti",
  storageBucket: "espacio-shanti.firebasestorage.app",
  messagingSenderId: "212141397656",
  appId: "1:212141397656:web:ed8340624ff822f24b22ed",
  measurementId: "G-CP9TXJPGJV",
};

// Auto-initialize Firebase
document.addEventListener("DOMContentLoaded", async () => {
  // Initialize Firebase with the real config
  const initialized = await window.firebaseManager.init(FIREBASE_CONFIG);
  if (initialized) {
  } else {
  }
});
