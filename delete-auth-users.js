import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD1xuCML442SNljPN0cmRR3aVMmi9bz1gA",
  authDomain: "message-d1e1a.firebaseapp.com",
  projectId: "message-d1e1a",
  storageBucket: "message-d1e1a.firebasestorage.app",
  messagingSenderId: "521518459258",
  appId: "1:521518459258:web:4d8a5c7ec80ca8c9f9f7b3",
  measurementId: "G-YPV9YB3RRV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const usersToDelete = [
  { email: 'vaibhavi@gmail.com', password: 'password123' }, // Try common password
  { email: 'admin@demo.com', password: 'admin123' }
];

async function deleteUserFromFirestore(email) {
  try {
    // Delete from users collection
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, 'users', docSnap.id));
      console.log(`  ✅ Deleted from Firestore: ${email}`);
    }

    // Delete from allocations
    const allocRef = collection(db, 'dataAllocations');
    const allocQ = query(allocRef, where('userEmail', '==', email));
    const allocSnap = await getDocs(allocQ);
    
    for (const docSnap of allocSnap.docs) {
      await deleteDoc(doc(db, 'dataAllocations', docSnap.id));
    }

    // Delete from locations
    const locRef = collection(db, 'locations');
    const locQ = query(locRef, where('userEmail', '==', email));
    const locSnap = await getDocs(locQ);
    
    for (const docSnap of locSnap.docs) {
      await deleteDoc(doc(db, 'locations', docSnap.id));
    }
  } catch (error) {
    console.log(`  ⚠️ Firestore cleanup: ${error.message}`);
  }
}

async function deleteUsers() {
  console.log('🗑️ Starting user deletion process...\n');

  for (const userData of usersToDelete) {
    console.log(`\n📧 Processing: ${userData.email}`);
    
    try {
      // Try to sign in and delete
      const userCredential = await signInWithEmailAndPassword(auth, userData.email, userData.password);
      const user = userCredential.user;
      
      // Delete from Firestore first
      await deleteUserFromFirestore(userData.email);
      
      // Delete from Authentication
      await deleteUser(user);
      console.log(`  ✅ Successfully deleted from Authentication: ${userData.email}`);
      
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log(`  ℹ️ User not found in Authentication: ${userData.email}`);
        // Still try to clean Firestore
        await deleteUserFromFirestore(userData.email);
      } else if (error.code === 'auth/wrong-password') {
        console.log(`  ⚠️ Wrong password for ${userData.email} - User exists but can't be deleted via this method`);
        console.log(`  ℹ️ Please delete manually from Firebase Console`);
      } else {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
  }

  console.log('\n\n📋 MANUAL DELETION REQUIRED:');
  console.log('If users still exist, delete them manually:');
  console.log('1. Go to: https://console.firebase.google.com/project/message-d1e1a/authentication/users');
  console.log('2. Find vaibhavi@gmail.com and admin@demo.com');
  console.log('3. Click the three dots menu and select "Delete account"\n');
  
  process.exit(0);
}

deleteUsers().catch(console.error);
