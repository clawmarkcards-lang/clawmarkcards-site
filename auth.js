
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
      return db.collection("users").doc(cred.user.uid).set({
        email,
        favoriteTeam,
        favoritePlayer,
        signup: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch((err) => {
      alert(err.message);
    });
});
