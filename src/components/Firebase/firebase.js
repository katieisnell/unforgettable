import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

class Firebase {
  constructor() {
    // console.log(config.apiKey);

    app.initializeApp(config);
    this.auth = app.auth();
    this.db = app.database();
    this.storage = app.storage();
  }

  // Authentication API
  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignOut = () => this.auth.signOut();

  doPasswordReset = email => this.auth.sendPasswordResetEmail(email);
  
  doPasswordUpdate = password =>
    this.auth.currentUser.updatePassword(password);

  // Merging Authorisation and DB User API
  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        this.user(authUser.uid)
          .once('value')
          .then(snapshot => {
            const dbUser = snapshot.val();

            // If user doesn't have a set role
            if (!dbUser.roles) {
              dbUser.roles = {};
            }

            // Update authUser
            authUser = {
              uid: authUser.uid,
              email: authUser.email,
              ...dbUser,
            };

            next(authUser);
          });
      } else {
        fallback();
      }
    });

  // User API
  user = uid => this.db.ref(`users/${uid}`);
  users = () => this.db.ref('users');

  // Insta uploaded images API
  instaUploadedImage = uid => this.db.ref(`instaUploadedImages/${uid}`);
  instaUploadedImages = () => this.db.ref('instaUploadedImages');

  // User uploaded images API
  userUploadedImage = uid => this.db.ref(`userUploadedImages/${uid}`);
  userUploadedImages = () => this.db.ref('userUploadedImages');

  // Mark as unforgettable API
  markAsUnforgettableLabel = uid => this.db.ref(`markAsUnforgettableLabels/${uid}`);
  markAsUnforgettableLabels = () => this.db.ref('markAsUnforgettableLabels');

  // Labels API
  label = uid => this.db.ref(`labels/${uid}`);
  labels = () => this.db.ref('labels');

  // Moments API
  moment = uid => this.db.ref(`moments/${uid}`);
  moments = () => this.db.ref('moments');
  mostPostedLabelsImage = uid => this.db.ref(`moments/most_posted_labels_images/${uid}`);
  mostPostedLabelsImages = () => this.db.ref('moments/most_posted_labels_images');
  multipleTaggedPeopleImage = uid => this.db.ref(`moments/multiple_tagged_people_images/${uid}`);
  multipleTaggedPeopleImages = () => this.db.ref('moments/multiple_tagged_people_images');
  happyPeopleImage = uid => this.db.ref(`moments/happy_people_images/${uid}`);
  happyPeopleImages = () => this.db.ref('moments/happy_people_images');

  storageRef = () => this.storage().ref();

}

export default Firebase;