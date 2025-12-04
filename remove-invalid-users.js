import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { getAuth, deleteUser as deleteAuthUser } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD1xuCML442SNljPN0cmRR3aVMmi9bz1gA",
  authDomain: "message-d1e1a.firebaseapp.com",
  projectId: "message-d1e1a",
  storageBucket: "message-d1e1a.firebasestorage.app",
  messagingSenderId: "521518459258",
  appId: "1:521518459258:web:4d8a5c7ec80ca8c9f9f7b3",
  measurementId: "G-YPV9YB3RRV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const usersToRemove = [
  'vaibhavi@gmail.com',
  'admin@demo.com'
];

async function removeInvalidUsers() {
  console.log('🗑️ Starting removal of invalid users...\n');

  for (const email of usersToRemove) {
    try {
      console.log(`\n📧 Processing: ${email}`);

      // 1. Remove from Firestore 'users' collection
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        for (const docSnapshot of querySnapshot.docs) {
          await deleteDoc(doc(db, 'users', docSnapshot.id));
          console.log(`  ✅ Deleted from Firestore users collection (ID: ${docSnapshot.id})`);
        }
      } else {
        console.log(`  ℹ️ Not found in Firestore users collection`);
      }

      // 2. Check and remove from allocations
      const allocationsRef = collection(db, 'dataAllocations');
      const allocQuery = query(allocationsRef, where('userEmail', '==', email));
      const allocSnapshot = await getDocs(allocQuery);

      if (!allocSnapshot.empty) {
        for (const docSnapshot of allocSnapshot.docs) {
          await deleteDoc(doc(db, 'dataAllocations', docSnapshot.id));
          console.log(`  ✅ Deleted allocation (ID: ${docSnapshot.id})`);
        }
      } else {
        console.log(`  ℹ️ No allocations found for this user`);
      }

      // 3. Check locations collection
      const locationsRef = collection(db, 'locations');
      const locQuery = query(locationsRef, where('userEmail', '==', email));
      const locSnapshot = await getDocs(locQuery);

      if (!locSnapshot.empty) {
        for (const docSnapshot of locSnapshot.docs) {
          await deleteDoc(doc(db, 'locations', docSnapshot.id));
          console.log(`  ✅ Deleted from locations (ID: ${docSnapshot.id})`);
        }
      } else {
        console.log(`  ℹ️ No locations found for this user`);
      }

      console.log(`  ✅ Successfully cleaned up user: ${email}`);

    } catch (error) {
      console.error(`  ❌ Error removing ${email}:`, error.message);
    }
  }

  console.log('\n✅ User cleanup completed!');
  console.log('\nNote: Firebase Authentication users need to be removed manually from Firebase Console');
  console.log('Go to: Firebase Console > Authentication > Users > Delete the accounts');
  process.exit(0);
}

// Run the cleanup
removeInvalidUsers().catch(console.error);
