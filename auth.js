// ===== Firebase init (compat) =====
(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyCM5La0C7dKpWgQUpAxVQguDcEV1D4Vmms",
    authDomain: "clawmark-login.firebaseapp.com",
    projectId: "clawmark-login",
    storageBucket: "clawmark-login.firebasestorage.app",
    messagingSenderId: "334338665183",
    appId: "1:334338665183:web:eb179b820393234c74576a",
    measurementId: "G-JE64ZQ56T5"
  };
  // Guard against double init if included elsewhere
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
})();

(function () {
  const auth = firebase.auth();
  const db   = firebase.firestore();

  // Elements (IDs must match signup.html)
  const form       = document.getElementById("signup-form");
  if (!form) return; // not on signup page
  const emailEl    = document.getElementById("email");
  const pwEl       = document.getElementById("password");
  const teamEl     = document.getElementById("favoriteTeam");
  const playerEl   = document.getElementById("favoritePlayer");
  const submitBtn  = document.getElementById("signup-submit");
  const msgEl      = document.getElementById("signup-msg");

  // Helper: surface messages inline (or via alert as fallback)
  function setMsg(text, ok = false) {
    if (msgEl) {
      msgEl.className = "msg " + (ok ? "ok" : "err");
      msgEl.textContent = text || "";
    } else {
      // Fallback if no container exists
      try { alert(text); } catch (_) {}
    }
    // Optional: expose for external calls (we also wired this in signup.html)
    if (typeof window.CLAW_SIGNUP_MSG === "function") {
      window.CLAW_SIGNUP_MSG(text, ok);
    }
  }

  // Defensive: ensure browser never reloads the page before our handler runs
  form.addEventListener("submit", (e) => e.preventDefault(), { capture: true });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMsg(""); // clear
    if (submitBtn) submitBtn.disabled = true;

    try {
      const email = (emailEl?.value || "").trim();
      const password = pwEl?.value || "";
      const favoriteTeam = (teamEl?.value || "").trim();
      const favoritePlayer = (playerEl?.value || "").trim();

      if (!email || !password) {
        throw new Error("Email and password are required.");
      }

      // Create auth user
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      const user = cred.user;

      // Create user profile doc (aligns with your rules + defaults)
      await db.collection("users").doc(user.uid).set({
        email: user.email,
        email_lc: (user.email || "").toLowerCase(),
        favoriteTeam,
        favoritePlayer,
        tier: "Fresh Mark",
        points: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // Send verification
      await user.sendEmailVerification();

      // Success UX
      setMsg("Success! Check your email to verify your account — and don’t forget your spam folder.", true);

      // Optional: sign out so login requires verified email later
      // await auth.signOut();

      // Clear form
      form.reset();
    } catch (err) {
      console.error("Signup error:", err);
      // Friendlier common errors
      const code = err?.code || "";
      let message = err?.message || "Signup failed. Please try again.";
      if (code === "auth/email-already-in-use") {
        message = "That email is already in use. Try logging in or use a different email.";
      } else if (code === "auth/weak-password") {
        message = "Password is too weak. Use at least 6 characters.";
      } else if (code === "permission-denied") {
        message = "Permission denied creating your profile. Check Firestore rules for user creation.";
      }
      setMsg(message, false);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
})();
