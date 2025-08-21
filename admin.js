
const auth = firebase.auth();
const db = firebase.firestore();

const ADMIN_EMAIL = "youradmin@email.com"; // Replace this with your actual admin email

auth.onAuthStateChanged(user => {
  if (!user || user.email !== ADMIN_EMAIL) {
    alert("Access denied");
    window.location.href = "index.html";
  } else {
    db.collection("users").orderBy("signup", "desc").get().then(snapshot => {
      const tbody = document.querySelector("#user-table tbody");
      snapshot.forEach(doc => {
        const data = doc.data();
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${data.email || ""}</td>
          <td>${data.favoriteTeam || ""}</td>
          <td>${data.favoritePlayer || ""}</td>
          <td>${data.signup?.toDate().toLocaleString() || ""}</td>
        `;
        tbody.appendChild(row);
      });
    });
  }
});
