# Vital Signs Morning Health Log (PWA)

A mobile-first **Progressive Web App (PWA)** built with React 18, Vite, TypeScript, Tailwind CSS, and Firebase Firestore to log morning vitals, monitor health trends, and migrate historical records from Google Sheets.

---

## 📱 Features

- **Morning Fast Entry**:
  - Touch-optimized cards for **Weight (kg)** with +/- steppers, **Blood Pressure (Systolic/Diastolic mmHg)**, **Pulse Oximeter (SpO2 % & Heart Rate bpm)**, **Body Temperature (°C)**, and optional **Notes**.
  - **Real-Time AHA Classification**: Color-coded badges instantly categorize blood pressure (Normal, Elevated, Stage 1, Stage 2, Crisis).
  - **Yesterday's Context Card**: Shows your most recent prior entry so you can easily compare your morning numbers.
- **Offline-First Resilience**:
  - Full PWA Service Worker precaching (`vite-plugin-pwa`).
  - Cloud Firestore persistent IndexedDB cache (`persistentLocalCache`): log your vitals even without Wi-Fi in the morning, and the app automatically syncs to Firebase the moment your phone reconnects.
- **Health Trends & Visual Analytics**:
  - Interactive charts for Weight, Blood Pressure, SpO2 & Pulse, and Temperature.
  - Filterable by **7 Days**, **30 Days**, **90 Days**, or **All Time**.
  - 7-day moving averages and trend deltas.
- **Google Sheets Migration & Doctor CSV Export**:
  - Built-in CSV importer to seamlessly migrate your historical Google Sheet data into Firebase.
  - One-click CSV export formatted for healthcare providers or personal backups.
- **Security & Privacy**:
  - Cloud Firestore Security Rules strictly enforcing user isolation (`/users/{userId}/vitals/{recordId}`).
  - Authenticated Google Sign-In with persistent session.

---

## 🚀 Running Locally

1. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

2. **Run the production preview:**
   ```bash
   npm run build
   npm run preview
   ```

---

## ☁️ Connecting to Firebase (`vital-signs-33d2`)

### Option A: Via `.env` (Recommended for deployment)
Copy `.env.example` to `.env` and fill in your Firebase Web App credentials from the [Firebase Console](https://console.firebase.google.com/project/vital-signs-33d2/settings/general):
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=vital-signs-33d2.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=vital-signs-33d2
VITE_FIREBASE_STORAGE_BUCKET=vital-signs-33d2.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=1:...:web:...
```

### Option B: Directly inside the App UI
Navigate to the **Settings** tab inside the app, tap **Update Firebase Web API Key manually**, paste your API Key, and tap **Save & Reload**.

---

## 📥 Migrating Your Google Sheet Data

1. Open your [Google Sheet](https://docs.google.com/spreadsheets/d/1-_N1GToXdIFve7d-sgPJtNYEIXCmZ5xuhPJeQtEkWco/edit?usp=sharing).
2. Click **File > Download > Comma Separated Values (.csv)**.
3. In the Vital Signs PWA, go to **Settings** (or tap the Import prompt) and select the downloaded `.csv` file.
4. Review the parsed records preview, then tap **Import Records to Firebase**.

---

## 🚀 Deploying to Firebase Hosting

When you are ready to publish your PWA to `https://vital-signs-33d2.web.app`:

```bash
# 1. Sign in to your Firebase account (opens browser)
firebase login

# 2. Deploy hosting and security rules
firebase deploy --only hosting,firestore:rules
```

---

## 📲 How to Install on Your Smartphone

- **iPhone (Safari)**:
  1. Open `https://vital-signs-33d2.web.app` in Safari.
  2. Tap the **Share** button (box with upward arrow) at the bottom.
  3. Scroll down and tap **Add to Home Screen**.
- **Android (Chrome)**:
  1. Open the URL in Google Chrome.
  2. Tap the **Three Dots menu (⋮)** in the top right.
  3. Tap **Install app** or **Add to Home screen**.
