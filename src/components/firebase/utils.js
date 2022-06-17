import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './config';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
// import { async } from '@firebase/util';
import {
  getFirestore,
  getDoc,
  doc,
  setDoc,
  collection,
  addDoc,
} from 'firebase/firestore';

const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const handleUserProfile = async (userAuth, additionalData) => {
  const { uid } = userAuth;
  const userRef = doc(db, `users/${uid}`);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const { displayName, email } = userAuth;
    const timeStamp = new Date();
    try {
      await setDoc(userRef, {
        displayName,
        email,
        createdAt: timeStamp,
        ...additionalData,
      });
    } catch (err) {
      console.log(err);
    }
  } else {
    console.log('Document exists:', userSnap.data());
  }

  return userRef;
};

const saveToDB = async (data, dbLocation) => {
  const colRef = collection(db, dbLocation);

  await addDoc(colRef, data);
};

export const saveUsers = async (url, dbCollection) => {
  let users;
  await fetch(url)
    .then((res) => res.json())
    .then((data) => {
      users = data.results;
    });

  // const colRef = collection(db, dbCollection);

  const mapUsers = Promise.all(
    users.map(async (user) => {
      await saveToDB(user, dbCollection);
    })
  );
};
