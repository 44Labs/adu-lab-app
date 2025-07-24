// Firebase Configuration
// This will be populated with actual config after Firebase project creation

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "adu-lab-app.firebaseapp.com",
    projectId: "adu-lab-app",
    storageBucket: "adu-lab-app.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const functions = firebase.functions();

// Enable offline persistence
db.enablePersistence().catch((err) => {
    if (err.code === 'failed-precondition') {
        console.log('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
        console.log('Persistence not available');
    }
});

// Auth state observer
auth.onAuthStateChanged((user) => {
    window.currentUser = user;
    if (user) {
        console.log('User signed in:', user.uid);
        // Update UI for signed-in state
        document.body.classList.add('signed-in');
        document.body.classList.remove('signed-out');
    } else {
        console.log('User signed out');
        // Update UI for signed-out state
        document.body.classList.add('signed-out');
        document.body.classList.remove('signed-in');
    }
});

// Utility functions
const FirebaseUtil = {
    // Generate a unique ID
    generateId: () => {
        return db.collection('temp').doc().id;
    },
    
    // Get server timestamp
    timestamp: () => {
        return firebase.firestore.FieldValue.serverTimestamp();
    },
    
    // Log errors with context
    logError: (error, context) => {
        console.error(`[${context}]`, error);
        // In production, send to error tracking service
    }
};

// Export for use in other modules
window.FirebaseUtil = FirebaseUtil;