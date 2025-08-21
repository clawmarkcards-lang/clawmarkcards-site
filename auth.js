
const auth = firebase.auth();
const db = firebase.firestore();

document.getElementById("signup-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const favoriteTeam = document.getElementById("favoriteTeam").value;
  const favoritePlayer = document.getElementById("favoritePlayer").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((cred) => {
      console.log("User created:", cred.user.uid);
      return db.collection("users").doc(cred.user.uid).set({
        email,
        favoriteTeam,
        favoritePlayer,
        signup: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      console.log("Firestore document written.");
      alert("Signup success! Redirecting...");
      window.location.href = "dashboard.html";
    })
    .catch((err) => {
      console.error("Signup error:", err.message);
      alert(err.message);
    });
});
