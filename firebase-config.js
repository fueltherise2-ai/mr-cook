// ==========================================================
// Mr. Cook Fast Food - Official Firebase Backend & Cloud Sync
// Location: Pakistan | Phone: 03144108033
// Firebase SDK Version 11.0.1 (Modular ES Module)
// ==========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics, isSupported as isAnalyticsSupported, logEvent } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  addDoc,
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-fr-S0kNQM09xEx3q4XQ4f0CHbFy0vu8",
  authDomain: "mr-cook-bc90e.firebaseapp.com",
  projectId: "mr-cook-bc90e",
  storageBucket: "mr-cook-bc90e.firebasestorage.app",
  messagingSenderId: "555044220605",
  appId: "1:555044220605:web:aa364fbbef81e0665111d4",
  measurementId: "G-73C0HX1VV0"
};

// ----------------------------------------------------------
// 1. Initialize Firebase Services
// ----------------------------------------------------------
let app = null;
let analytics = null;
let db = null;
let auth = null;

try {
  app = initializeApp(firebaseConfig);
  console.log("%c🔥 [Firebase] Mr. Cook App initialized successfully! (Project: mr-cook-bc90e)", "color: #f59e0b; font-weight: bold;");

  // Initialize Cloud Firestore
  db = getFirestore(app);

  // Initialize Authentication
  auth = getAuth(app);

  // Initialize Analytics safely (guards against ad blockers / localhost)
  isAnalyticsSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log("%c📈 [Firebase Analytics] Active (Measurement ID: G-73C0HX1VV0)", "color: #10b981; font-weight: bold;");
      MrCookFirebase.logEvent('page_view', { page_title: document.title });
    } else {
      console.log("[Firebase Analytics] Not supported in this environment (running in fallback mode).");
    }
  }).catch(e => {
    console.warn("[Firebase Analytics] Warning during initialization:", e.message);
  });

} catch (err) {
  console.error("%c❌ [Firebase] Initialization error:", "color: #ef4444; font-weight: bold;", err);
}

// ----------------------------------------------------------
// 2. High-Level Helper & Synchronization Methods
// ----------------------------------------------------------
const MrCookFirebase = {
  app,
  db,
  auth,
  analytics,
  config: firebaseConfig,
  isReady: true,

  // Log Google Analytics Event safely
  logEvent(eventName, params = {}) {
    try {
      if (analytics) {
        logEvent(analytics, eventName, params);
      }
    } catch (e) {
      console.warn(`[Firebase Analytics] Event "${eventName}" log skipped:`, e.message);
    }
  },

  // --------------------------------------------------------
  // Menu Data Fetching: Dynamic 'menu' collection
  // --------------------------------------------------------
  
  // Fetch all documents from the 'menu' collection
  async fetchMenu() {
    if (!db) {
      console.warn("[Firebase] Firestore not initialized, returning default menu.");
      return null;
    }

    try {
      const menuCol = collection(db, "menu");
      const snapshot = await getDocs(menuCol);
      if (snapshot.empty) {
        console.log("[Firebase] 'menu' collection is empty.");
        return null;
      }

      const docs = [];
      snapshot.forEach(docSnap => {
        docs.push({ id: docSnap.id, ...docSnap.data() });
      });

      console.log(`%c☁️ [Firebase Firestore] Fetched ${docs.length} document(s) from 'menu' collection!`, "color: #10b981; font-weight: bold;");
      return this.transformFirestoreMenu(docs);
    } catch (err) {
      console.warn("[Firebase] Error fetching 'menu' collection:", err.message);
      return null;
    }
  },

  // Real-time listener for 'menu' collection updates
  listenToMenu(callback) {
    if (!db) return () => {};
    try {
      const menuCol = collection(db, "menu");
      const unsub = onSnapshot(menuCol, (snapshot) => {
        if (!snapshot.empty) {
          const docs = [];
          snapshot.forEach(docSnap => {
            docs.push({ id: docSnap.id, ...docSnap.data() });
          });
          const structuredMenu = this.transformFirestoreMenu(docs);
          if (typeof callback === 'function') {
            callback(structuredMenu);
          }
        }
      }, (err) => {
        console.warn("[Firebase] Realtime 'menu' listener notice:", err.message);
      });
      return unsub;
    } catch (err) {
      console.warn("[Firebase] listenToMenu error:", err.message);
      return () => {};
    }
  },

  // Transform Firestore documents into standardized storefront categories & items
  transformFirestoreMenu(docs) {
    if (!Array.isArray(docs) || docs.length === 0) return null;

    // Case 1: Category documents containing an 'items' array
    const hasCategoryDocs = docs.some(d => Array.isArray(d.items));
    if (hasCategoryDocs) {
      return docs.map(d => ({
        id: d.id,
        name: d.name || d.id,
        badge: d.badge || 'Chef Selection',
        items: (d.items || []).map(i => ({
          ...i,
          price: typeof i.price === 'number' ? `Rs. ${i.price}` : (i.price || 'Rs. 0'),
          numPrice: typeof i.price === 'number' ? i.price : (parseFloat(String(i.price).replace(/[^0-9.]/g, '')) || 0)
        }))
      }));
    }

    // Case 2: Individual item documents in 'menu' (e.g. { name: "burger", price: 250 })
    const categoriesMap = {};
    docs.forEach(d => {
      // Discard empty documents, invalid records, or placeholder items
      if (!d.name || typeof d.name !== 'string' || !d.name.trim() || d.name.toLowerCase() === 'signature item') {
        return;
      }

      const nameLower = d.name.toLowerCase();
      let catName = d.category;
      if (!catName) {
        if (nameLower.includes('pizza')) catName = 'Stone-Baked Pizzas';
        else if (nameLower.includes('drink') || nameLower.includes('pepsi') || nameLower.includes('water') || nameLower.includes('dew')) catName = 'Drinks & Beverages';
        else if (nameLower.includes('broast') || nameLower.includes('wing') || nameLower.includes('fried chicken')) catName = 'Crispy Broast & Fried';
        else catName = 'Burgers & Sandwiches';
      }

      const catId = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (!categoriesMap[catId]) {
        categoriesMap[catId] = {
          id: catId,
          name: catName,
          badge: 'Live from Cloud',
          items: []
        };
      }

      const numPrice = typeof d.price === 'number' ? d.price : (parseFloat(String(d.price).replace(/[^0-9.]/g, '')) || 0);
      categoriesMap[catId].items.push({
        id: d.id,
        name: d.name.trim(),
        price: typeof d.price === 'number' ? `Rs. ${d.price}` : (d.price || `Rs. ${numPrice}`),
        numPrice: numPrice,
        desc: d.desc || d.description || '',
        img: d.img || d.image || './images/burger.jpg',
        tag: d.tag || '',
        options: d.options || null,
        hidden: !!d.hidden
      });
    });

    // Supplement with base catalog if needed
    if (typeof OFFICIAL_MENU_DATA !== 'undefined' && Array.isArray(OFFICIAL_MENU_DATA)) {
      OFFICIAL_MENU_DATA.forEach(defaultCat => {
        if (!categoriesMap[defaultCat.id]) {
          categoriesMap[defaultCat.id] = JSON.parse(JSON.stringify(defaultCat));
        } else {
          // Prepend Firestore items into that category
          const existingNames = new Set(categoriesMap[defaultCat.id].items.map(i => i.name.toLowerCase()));
          defaultCat.items.forEach(defItem => {
            if (!existingNames.has(defItem.name.toLowerCase())) {
              categoriesMap[defaultCat.id].items.push(defItem);
            }
          });
        }
      });
    }

    return Object.values(categoriesMap);
  },

  // --------------------------------------------------------
  // Order Placement & Management: 'orders' collection
  // --------------------------------------------------------

  // Add a new order document to the 'orders' collection with initial 'pending' status
  async addOrder(orderData) {
    if (!orderData) return null;

    const orderId = orderData.orderId || `MC-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = Date.now();

    const orderDoc = {
      orderId: orderId,
      customer: {
        name: orderData.customer?.name || '',
        phone: orderData.customer?.phone || '',
        address: orderData.customer?.address || '',
        altPhone: orderData.customer?.altPhone || ''
      },
      items: (orderData.items || []).map(item => ({
        name: item.name || '',
        price: item.price || 0,
        quantity: item.quantity || 1,
        optionsText: item.optionsText || '',
        img: item.img || ''
      })),
      pricing: {
        totalItems: orderData.pricing?.totalItems || (orderData.items || []).reduce((s, i) => s + (i.quantity || 1), 0),
        subtotal: orderData.pricing?.subtotal || 0,
        deliveryFee: orderData.pricing?.deliveryFee || 0,
        finalTotal: orderData.pricing?.finalTotal || 0
      },
      status: 'pending', // Strictly initial 'pending' status
      createdAt: orderData.createdAt || now,
      updatedAt: now
    };

    // Log purchase to Google Analytics
    this.logEvent('purchase', {
      transaction_id: orderId,
      value: orderDoc.pricing.finalTotal,
      currency: 'PKR',
      items: orderDoc.items.map(i => ({ item_name: i.name, quantity: i.quantity, price: i.price }))
    });

    if (!db) {
      console.warn("[Firebase] DB not ready; order saved locally only.");
      return orderDoc;
    }

    try {
      const orderRef = doc(db, "orders", orderId);
      await setDoc(orderRef, orderDoc, { merge: true });
      console.log(`%c☁️ [Firebase Firestore] Order ${orderId} added to 'orders' with initial 'pending' status!`, "color: #10b981; font-weight: bold;");
      return orderDoc;
    } catch (err) {
      console.warn(`[Firebase Firestore] Could not add order ${orderId} to cloud:`, err.message);
      return orderDoc;
    }
  },

  // Alias
  async placeOrder(orderData) {
    return this.addOrder(orderData);
  },

  // Update order status in Firestore (supports 'confirmed', 'preparing', 'on the way', 'delivered')
  async updateOrderStatus(orderId, newStatusOrFields) {
    if (!db || !orderId) return false;
    try {
      const updatePayload = typeof newStatusOrFields === 'string'
        ? { status: newStatusOrFields }
        : { ...newStatusOrFields };

      updatePayload.updatedAt = Date.now();

      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, updatePayload);
      console.log(`%c☁️ [Firebase Firestore] Order ${orderId} status updated to: "${updatePayload.status}"`, "color: #3b82f6; font-weight: bold;");
      return true;
    } catch (err) {
      console.warn(`[Firebase Firestore] Could not update order ${orderId}:`, err.message);
      return false;
    }
  },

  // Real-time listener for all orders (for Restaurant Kitchen & Rider Dashboard)
  listenToOrders(callback) {
    if (!db) {
      console.warn("[Firebase] Firestore not initialized, using local fallback listener.");
      return () => {};
    }

    try {
      const ordersCol = collection(db, "orders");
      const unsub = onSnapshot(ordersCol, (snapshot) => {
        const orders = [];
        snapshot.forEach(docSnap => {
          orders.push(docSnap.data());
        });
        // Sort newest first
        orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        if (typeof callback === 'function') {
          callback(orders);
        }
      }, (err) => {
        console.warn("[Firebase Firestore] Realtime order listener notice:", err.message);
      });
      return unsub;
    } catch (err) {
      console.warn("[Firebase] Listen error:", err.message);
      return () => {};
    }
  },

  // Real-time listener for a single order (for Customer Live Order Tracker)
  listenToOrder(orderId, callback) {
    if (!db || !orderId) return () => {};

    try {
      const orderRef = doc(db, "orders", orderId);
      const unsub = onSnapshot(orderRef, (docSnap) => {
        if (docSnap.exists() && typeof callback === 'function') {
          callback(docSnap.data());
        }
      }, (err) => {
        console.warn(`[Firebase] Listener for order ${orderId} notice:`, err.message);
      });
      return unsub;
    } catch (err) {
      console.warn("[Firebase] Order listen error:", err.message);
      return () => {};
    }
  },

  // --------------------------------------------------------
  // Menu Catalog: Cloud Sync for Admin Panel
  // --------------------------------------------------------
  async syncMenuCatalog(catalog) {
    if (!db || !catalog) return false;
    try {
      const catalogRef = doc(db, "settings", "menu_catalog");
      await setDoc(catalogRef, {
        catalog,
        updatedAt: Date.now()
      }, { merge: true });
      console.log("%c☁️ [Firebase Firestore] Menu catalog synced to cloud!", "color: #10b981;");
      return true;
    } catch (err) {
      console.warn("[Firebase] Menu catalog sync notice:", err.message);
      return false;
    }
  },

  async loadMenuCatalog() {
    if (!db) return null;
    try {
      const catalogRef = doc(db, "settings", "menu_catalog");
      const snap = await getDoc(catalogRef);
      if (snap.exists()) {
        return snap.data().catalog;
      }
      return null;
    } catch (err) {
      console.warn("[Firebase] Menu catalog load notice:", err.message);
      return null;
    }
  },

  // --------------------------------------------------------
  // Staff Directory: Cloud Sync for Admin Panel
  // --------------------------------------------------------
  async syncStaffDirectory(staff) {
    if (!db || !staff) return false;
    try {
      const staffRef = doc(db, "settings", "staff_directory");
      await setDoc(staffRef, {
        staff,
        updatedAt: Date.now()
      }, { merge: true });
      console.log("%c☁️ [Firebase Firestore] Staff directory synced to cloud!", "color: #10b981;");
      return true;
    } catch (err) {
      console.warn("[Firebase] Staff directory sync notice:", err.message);
      return false;
    }
  },

  async loadStaffDirectory() {
    if (!db) return null;
    try {
      const staffRef = doc(db, "settings", "staff_directory");
      const snap = await getDoc(staffRef);
      if (snap.exists()) {
        return snap.data().staff;
      }
      return null;
    } catch (err) {
      console.warn("[Firebase] Staff directory load notice:", err.message);
      return null;
    }
  },

  // --------------------------------------------------------
  // Firebase Authentication Integration
  // --------------------------------------------------------
  async loginWithEmail(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // Decided Credentials:
    // Admin: admin@mrcook.com | Admin@12345 -> admin.html
    // Staff: staff@mrcook.com | Staff@12345 -> dashboard.html
    const isMasterAdmin = (cleanEmail === 'admin@mrcook.com' || cleanEmail === 'admin') && cleanPass === 'Admin@12345';
    const isMasterStaff = (cleanEmail === 'staff@mrcook.com' || cleanEmail === 'staff') && cleanPass === 'Staff@12345';

    // 1. Attempt Firebase Authentication via signInWithEmailAndPassword
    if (auth && (cleanEmail.includes('@') || isMasterAdmin || isMasterStaff)) {
      const authEmail = cleanEmail.includes('@') ? cleanEmail : (cleanEmail === 'admin' ? 'admin@mrcook.com' : 'staff@mrcook.com');
      try {
        const cred = await signInWithEmailAndPassword(auth, authEmail, cleanPass);
        const fbUser = cred.user;
        const role = (fbUser.email && fbUser.email.toLowerCase().includes('admin')) ? 'admin' : 'staff';
        const redirect = role === 'admin' ? 'admin.html' : 'dashboard.html';
        const session = {
          email: fbUser.email,
          uid: fbUser.uid,
          role: role,
          loggedInAt: Date.now()
        };
        sessionStorage.setItem('mr_cook_auth_session', JSON.stringify(session));
        console.log(`%c🔥 [Firebase Auth] Signed in: ${fbUser.email} (Role: ${role})`, "color: #10b981; font-weight: bold;");
        return { success: true, role, redirect, session };
      } catch (authErr) {
        console.warn("[Firebase Auth] Notice:", authErr.code, authErr.message);

        // Fallback for pre-decided credentials if Email/Password provider isn't toggled yet in Firebase Console
        if (isMasterAdmin) {
          const session = { email: 'admin@mrcook.com', role: 'admin', loggedInAt: Date.now() };
          sessionStorage.setItem('mr_cook_auth_session', JSON.stringify(session));
          return { success: true, role: 'admin', redirect: 'admin.html', session };
        }
        if (isMasterStaff) {
          const session = { email: 'staff@mrcook.com', role: 'staff', loggedInAt: Date.now() };
          sessionStorage.setItem('mr_cook_auth_session', JSON.stringify(session));
          return { success: true, role: 'staff', redirect: 'dashboard.html', session };
        }

        return { success: false, error: "Invalid ID / Email or Password. Please verify your credentials." };
      }
    }

    if (isMasterAdmin) {
      const session = { email: 'admin@mrcook.com', role: 'admin', loggedInAt: Date.now() };
      sessionStorage.setItem('mr_cook_auth_session', JSON.stringify(session));
      return { success: true, role: 'admin', redirect: 'admin.html', session };
    }
    if (isMasterStaff) {
      const session = { email: 'staff@mrcook.com', role: 'staff', loggedInAt: Date.now() };
      sessionStorage.setItem('mr_cook_auth_session', JSON.stringify(session));
      return { success: true, role: 'staff', redirect: 'dashboard.html', session };
    }

    return { success: false, error: "Invalid ID / Email or Password. Please verify your credentials." };
  },

  logout() {
    try {
      if (auth) signOut(auth);
    } catch (e) {}
    sessionStorage.removeItem('mr_cook_auth_session');
    window.location.href = "index.html";
  },

  getCurrentSession() {
    try {
      const saved = sessionStorage.getItem('mr_cook_auth_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  },

  // --------------------------------------------------------
  // Database-Driven Secret PIN Verification (Double Layer)
  // Queries Firestore 'settings/pins' document dynamically
  // (PINs are NOT hardcoded in code)
  // --------------------------------------------------------
  async verifySecretPin(role, enteredPin) {
    if (!db) {
      return { success: false, error: "Database offline. Please check connection." };
    }

    try {
      const pinsRef = doc(db, "settings", "pins");
      const snap = await getDoc(pinsRef);

      if (!snap.exists()) {
        console.warn("[Firebase Security] 'settings/pins' document not found in Firestore.");
        return { success: false, error: "Security PIN record not found in database." };
      }

      const data = snap.data();
      const cleanEnteredPin = String(enteredPin || '').trim();

      // Dynamically fetch and compare against database record
      const dbExpectedPin = role === 'admin' 
        ? String(data.adminPin || '').trim() 
        : String(data.staffPin || '').trim();

      if (cleanEnteredPin && dbExpectedPin && cleanEnteredPin === dbExpectedPin) {
        console.log(`%c🛡️ [Security] 2-Step PIN verified against Firestore database for role: ${role}`, "color: #10b981; font-weight: bold;");
        return { success: true };
      }

      return { success: false, error: "Invalid Secret PIN. Access denied." };
    } catch (err) {
      console.error("[Firebase Security] Error verifying PIN:", err.message);
      return { success: false, error: "Database verification error: " + err.message };
    }
  }
};

// Attach globally to window for consumption across vanilla JS scripts
if (typeof window !== 'undefined') {
  window.MrCookFirebase = MrCookFirebase;
  window.dispatchEvent(new CustomEvent('mrcook:firebase-ready', { detail: MrCookFirebase }));
}

export {
  app,
  analytics,
  db,
  auth,
  firebaseConfig,
  MrCookFirebase
};

export default MrCookFirebase;
