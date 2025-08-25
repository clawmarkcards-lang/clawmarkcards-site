
// js/offer-watch.js
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, deleteDoc, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

// Try to init Firebase if not already
if (!getApps().length && window.firebaseConfig) { initializeApp(window.firebaseConfig); }

// Only run on product page
if (location.pathname.endsWith('/product.html') || location.pathname.match(/product\.html$/)) {
  const auth = getAuth();
  const db = getFirestore();

  // Inject styles (once)
  const STYLE_ID = 'offer-watch-styles';
  if (!document.getElementById(STYLE_ID)) {
    const css = `
      .offer-bar{display:grid;gap:10px;margin:12px 0}
      .offer-wrap{display:flex;gap:12px;flex-wrap:wrap}
      .offer-btn{padding:10px 14px;border-radius:10px;border:1px solid #ddd;background:#fff;cursor:pointer;font-weight:600}
      .offer-primary{background:#111;color:#fff;border-color:#111}
      .offer-btn[disabled]{opacity:.5;cursor:not-allowed}
      .auth-notice{background:#fff6d8;border:1px solid #ffe09a;padding:8px 10px;border-radius:8px;font-size:.95rem}
      .offer-toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#111;color:#fff;padding:10px 14px;border-radius:10px;font-weight:600;z-index:60}
      dialog.offer-dialog{border:none;border-radius:12px;padding:0;max-width:420px;width:95%}
      .offer-form{padding:16px;display:grid;gap:10px}
      .offer-form input, .offer-form textarea{width:100%;padding:10px;border:1px solid #ddd;border-radius:8px}
      .offer-form .actions{display:flex;gap:10px;justify-content:flex-end;margin-top:8px}
      .btn-primary{background:#111;color:#fff;border:1px solid #111;padding:10px 14px;border-radius:10px}
      .btn-secondary{background:#fff;border:1px solid #ddd;padding:10px 14px;border-radius:10px}
    `;
    const style = Object.assign(document.createElement('style'), { id: STYLE_ID, textContent: css });
    document.head.appendChild(style);
  }

  // Create action bar if missing
  let bar = document.getElementById('offerWatchBar');
  if (!bar) {
    bar = document.createElement('section');
    bar.id = 'offerWatchBar';
    bar.className = 'offer-bar';
    bar.hidden = true;
    bar.innerHTML = `
      <div class="offer-wrap">
        <button id="btnWatch" class="offer-btn">☆ Watch</button>
        <button id="btnOffer" class="offer-btn offer-primary">Make Offer</button>
      </div>
      <div id="authNotice" class="auth-notice" hidden>Sign in to use Watch & Offers. <a href="/login.html">Login</a></div>
      <div id="offerToast" class="offer-toast" hidden></div>
      <dialog id="offerDialog" class="offer-dialog">
        <form method="dialog" id="offerForm" class="offer-form">
          <h3>Make an Offer</h3>
          <label>Offer price (USD)
            <input id="offerPrice" type="number" min="1" step="0.01" required />
          </label>
          <label>Note (optional)
            <textarea id="offerNote" rows="3" placeholder="Add a note…"></textarea>
          </label>
          <div class="actions">
            <button value="cancel" class="btn-secondary">Cancel</button>
            <button id="offerSubmit" class="btn-primary" value="default">Submit</button>
          </div>
        </form>
      </dialog>
    `;
    // Try to insert near product gallery if present, else prepend to main
    const anchor = document.querySelector('.product-gallery') || document.querySelector('main') || document.body;
    anchor.parentNode.insertBefore(bar, anchor.nextSibling);
  }

  // Elements
  const watchBtn = document.getElementById('btnWatch');
  const offerBtn = document.getElementById('btnOffer');
  const authNotice = document.getElementById('authNotice');
  const toast = document.getElementById('offerToast');
  const dlg = document.getElementById('offerDialog');
  const offerPrice = document.getElementById('offerPrice');
  const offerNote = document.getElementById('offerNote');
  const offerSubmit = document.getElementById('offerSubmit');

  let currentUser = null;
  let product = { id: null, data: null, sku: null, name: 'Item' };

  function showToast(msg){
    if(!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    setTimeout(()=> toast.hidden = true, 1800);
  }

  function getQueryId(){
    return new URLSearchParams(location.search).get('id');
  }

  async function loadProduct(){
    const id = getQueryId();
    if(!id) return;
    const ref = doc(db, 'products', id);
    const snap = await getDoc(ref);
    if(!snap.exists()) return;
    const data = snap.data();
    product = { id, data, sku: data.sku || id, name: data.name || data.title || 'Item' };
  }

  async function updateWatchState(){
    if(!currentUser || !product.sku) return;
    const wref = doc(db, 'users', currentUser.uid, 'watchlist', product.sku);
    const wsnap = await getDoc(wref);
    if(wsnap.exists()){
      watchBtn.textContent = '✓ Watching';
      watchBtn.dataset.state = 'on';
    } else {
      watchBtn.textContent = '☆ Watch';
      watchBtn.dataset.state = 'off';
    }
  }

  onAuthStateChanged(auth, async (user)=>{
    currentUser = user || null;
    bar.hidden = false;
    const needAuth = !currentUser;
    authNotice.hidden = !needAuth;
    watchBtn.disabled = needAuth;
    offerBtn.disabled = needAuth;
    await loadProduct();
    if(currentUser){ updateWatchState(); }
  });

  // Watch toggle
  watchBtn?.addEventListener('click', async ()=>{
    if(!currentUser) return;
    const wref = doc(db, 'users', currentUser.uid, 'watchlist', product.sku);
    if(watchBtn.dataset.state === 'on'){
      await deleteDoc(wref);
      watchBtn.dataset.state = 'off';
      watchBtn.textContent = '☆ Watch';
      showToast('Removed from Watchlist');
    } else {
      await setDoc(wref, {
        productId: product.id,
        sku: product.sku,
        name: product.name,
        image: (product.data?.images?.[0] || product.data?.image || ''),
        addedAt: serverTimestamp()
      }, { merge: true });
      watchBtn.dataset.state = 'on';
      watchBtn.textContent = '✓ Watching';
      showToast('Added to Watchlist');
    }
  });

  // Offer modal
  offerBtn?.addEventListener('click', ()=>{
    if(!currentUser) return;
    if(dlg?.showModal) dlg.showModal();
  });

  // Submit offer
  offerSubmit?.addEventListener('click', async (e)=>{
    e.preventDefault();
    if(!currentUser) return;
    const val = Number(offerPrice.value);
    if(!val || val <= 0){ offerPrice.focus(); return; }
    const payload = {
      userId: currentUser.uid,
      userEmail: currentUser.email || '',
      productId: product.id,
      sku: product.sku,
      productName: product.name,
      listedPrice: Number(product.data?.price || 0),
      offerPrice: val,
      note: offerNote.value || '',
      status: 'pending',
      createdAt: serverTimestamp()
    };
    await addDoc(collection(db, 'offers'), payload);
    if(dlg?.close) dlg.close();
    offerPrice.value=''; offerNote.value='';
    showToast('Offer sent!');
  });
}
