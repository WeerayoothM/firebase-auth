// set Secure rule in firebase
// rules_version = '2';
// service cloud.firestore {
// match /databases/{database}/documents {

//   // match logged in user doc in users collection
//   // create is create new collection write is create new document
//     match /users/{userId} {
//       allow create: if request.auth.uid != null;
//       allow read: if request.auth.uid == userId;

//     }

//     //match doc in the guides collection
//     match /guides/{guideId} {
//       allow read, write: if request.auth.uid != null;
//     }
//   }
// }

// add admin cloud function
const adminForm = document.querySelector(".admin-actions");
adminForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const adminEmail = document.querySelector("#admin-email").value;

  // get firebase function
  const addAdminRole = functions.httpsCallable("addAdminRole");
  addAdminRole({ email: adminEmail }).then((result) => {
    console.log(result);
  });
});

// listen for auth status changes
auth.onAuthStateChanged((user) => {
  if (user) {
    user.getIdTokenResult().then((idTokenResult) => {
      user.admin = idTokenResult.claims.admin;
      setupUI(user);
    });
    // onsnapshot is a listener to the database
    db.collection("guides").onSnapshot(
      (snapshot) => {
        setupGuides(snapshot.docs);
      },
      (err) => {
        console.log(err.message);
      }
    );
  } else {
    setupUI();
    setupGuides([]);
  }
});

// create new guide
const createForm = document.querySelector("#create-form");
createForm.addEventListener("submit", (e) => {
  e.preventDefault();
  db.collection("guides")
    .add({
      title: createForm.title.value,
      content: createForm.content.value,
    })
    .then(() => {
      // close the create modal & reset form
      const modal = document.querySelector("#modal-create");
      M.Modal.getInstance(modal).close();
      createForm.reset();
    })
    .catch((err) => {
      console.log(err.message);
    });
});

// signup
const signupForm = document.querySelector("#signup-form");
signupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // get user info
  const email = signupForm["signup-email"].value;
  const password = signupForm["signup-password"].value;

  // sign up the user
  auth
    .createUserWithEmailAndPassword(email, password)
    .then((cred) => {
      return db.collection("users").doc(cred.user.uid).set({
        bio: signupForm["signup-bio"].value,
      }); // .add() auto generate id
    })
    .then(() => {
      // close the signup modal & reset form
      const modal = document.querySelector("#modal-signup");
      M.Modal.getInstance(modal).close();
      signupForm.reset();
    });
});

// logout
const logout = document.querySelector("#logout");
logout.addEventListener("click", (e) => {
  e.preventDefault();
  auth.signOut().then(() => {
    console.log("user signed out");
  });
});

// login
const loginForm = document.querySelector("#login-form");
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // get user info
  const email = loginForm["login-email"].value;
  const password = loginForm["login-password"].value;

  // log the user in
  auth.signInWithEmailAndPassword(email, password).then((cred) => {
    console.log(cred.user);
    // close the signup modal & reset form
    const modal = document.querySelector("#modal-login");
    M.Modal.getInstance(modal).close();
    loginForm.reset();
  });
});
