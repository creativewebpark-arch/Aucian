# AUCian — সেটআপ গাইড (ধাপে ধাপে)

এই zip ফাইলে তোমার পুরো অ্যাপের কোড আছে — website + Android app (Capacitor) + push
notification + link preview backend। নিচের ধাপগুলো ফলো করলেই সব লাইভ হয়ে যাবে।
সবকিছুই ফোন দিয়ে করা যাবে, ল্যাপটপ লাগবে না। সবগুলো সার্ভিস ফ্রি।

**গুরুত্বপূর্ণ:** আমি নিজে এখানে GitHub/Firebase/Vercel এ account বানাতে পারি না
(এগুলো তোমার নিজের account, আমার এক্সেস নাই) — তাই এই ধাপগুলো তোমাকে করতে হবে।
আমি প্রতিটা ধাপ যতটা সম্ভব সহজ করে বলে দিয়েছি।

---

## ধাপ ১: GitHub এ কোড আপলোড

1. https://github.com এ account বানাও (না থাকলে) — email দিয়ে সাইনআপ
2. একটা নতুন repository বানাও (নাম যা খুশি, যেমন `aucian-app`) — **Public** রাখো
3. এই zip এর সব ফাইল ওই repository তে আপলোড করো:
   - GitHub এ repo খুলে "Add file" → "Upload files" এ ক্লিক করো
   - zip থেকে বের করা সব ফাইল/ফোল্ডার (`.github` ফোল্ডার সহ — এটা hidden ফোল্ডার,
     তাই বের করার সময় "show hidden files" অন রাখতে হতে পারে) drag করে দাও
   - "Commit changes" চাপো

⚠️ `.github/workflows/build-apk.yml` ফাইলটা ঠিকভাবে আপলোড হয়েছে কিনা চেক করো —
এটাই APK build করবে।

---

## ধাপ ২: Firebase থেকে google-services.json নেওয়া (Push Notification এর জন্য)

তোমার Firebase project (`somabesh`) আগে থেকেই আছে (website এ যেটা ব্যবহার হচ্ছে)।

1. https://console.firebase.google.com এ যাও, `somabesh` প্রজেক্ট খোলো
2. ⚙️ (settings) → **Project settings** → নিচে "Your apps" এ যাও
3. **Add app** → Android আইকনে ক্লিক করো
4. Android package name এ লিখো: `com.auc.forauc`
5. App nickname: `AUCian` (ঐচ্ছিক)
6. "Register app" চাপো, তারপর **google-services.json ডাউনলোড করো**
7. এই ফাইলের ভেতরের পুরো লেখাটা কপি করো (একটা text/code editor app দিয়ে ফাইলটা খুলে)

এখন এটা GitHub এ secret হিসেবে যোগ করো:
1. তোমার repo তে যাও → **Settings** → বামে **Secrets and variables** → **Actions**
2. **New repository secret**
3. Name: `GOOGLE_SERVICES_JSON`
4. Value: এ google-services.json এর পুরো কনটেন্ট পেস্ট করো
5. **Add secret**

---

## ধাপ ৩: Firebase Service Account key নেওয়া (Vercel এর জন্য, notification পাঠানোর জন্য)

1. Firebase console → ⚙️ Project settings → **Service accounts** ট্যাব
2. **Generate new private key** → confirm করো, একটা `.json` ফাইল ডাউনলোড হবে
3. এই ফাইলটাও পরে লাগবে (ধাপ ৪ এ)

---

## ধাপ ৪: Vercel এ backend ডিপ্লয় করা (link preview + notification পাঠানোর জন্য)

1. https://vercel.com এ যাও, **GitHub দিয়ে সাইনআপ করো** (এতে GitHub account এর
   সাথে অটো কানেক্ট হয়ে যাবে)
2. "Add New" → "Project" → তোমার `aucian-app` repo সিলেক্ট করো
3. **Root Directory** এ ক্লিক করে `vercel-functions` সিলেক্ট করো (পুরো repo না,
   শুধু এই ফোল্ডারটা deploy হবে)
4. Deploy করার আগে **Environment Variables** এ যোগ করো:
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: ধাপ ৩ এ ডাউনলোড করা `.json` ফাইলের **পুরো কনটেন্ট** (এক লাইনে পেস্ট
     করলেই হবে, Vercel নিজে handle করে নেবে)
5. **Deploy** চাপো
6. Deploy শেষ হলে একটা URL পাবা, যেমন `https://aucian-app-xxxx.vercel.app` —
   এটা কপি করে রাখো

---

## ধাপ ৫: website ফাইলে (index.html) কনফিগ বসানো

`www/index.html` ফাইলে (GitHub এ গিয়ে ফাইলটা খুলে ✏️ Edit বাটনে ক্লিক করো)
এই লাইনগুলো খুঁজে বের করো (স্ক্রিপ্টের শুরুর দিকে, "APP CONFIG" কমেন্টের নিচে):

```js
const APK_DOWNLOAD_URL = "https://github.com/YOUR_USERNAME/YOUR_REPO/releases/latest/download/aucian.apk";
const API_BASE_URL = "https://YOUR-VERCEL-PROJECT.vercel.app";
```

- `APK_DOWNLOAD_URL` — তোমার GitHub username আর repo নাম বসাও (নিচে ধাপ ৬ এ
  আসল লিংক পাবা, তখন আবার আপডেট করে নিও যদি না মিলে)
- `API_BASE_URL` — ধাপ ৪ এ পাওয়া Vercel URL বসাও (শেষে `/` দিও না)

Commit করে দাও।

---

## ধাপ ৬: APK build করা (GitHub Actions)

1. তোমার repo তে যাও → **Actions** ট্যাব
2. "Build AUCian APK" workflow দেখতে পাবা — এটা এমনিতেই চলা শুরু করবে (কারণ
   ধাপ ৫ এ commit করেছ), অথবা ম্যানুয়ালি "Run workflow" চেপে চালাও
3. বিল্ড শেষ হতে ৫-১০ মিনিট লাগতে পারে (green ✓ চিহ্ন দেখাবে শেষ হলে)
4. বিল্ড সফল হলে দুইভাবে APK পাবা:
   - **Releases** ট্যাবে গিয়ে (repo এর মেইন পেজে ডানপাশে) — এখানেই স্থায়ী
     download link পাবা, এটাই `APK_DOWNLOAD_URL` এ বসানোর জন্য আসল লিংক
   - অথবা ওই workflow run এর নিচে "Artifacts" থেকে

APK লিংক পাওয়ার পর ধাপ ৫ এ ফিরে গিয়ে `APK_DOWNLOAD_URL` টা ঠিকঠাক বসিয়ে আবার
commit করো, যাতে ওয়েবসাইটের "Download" বাটন সরাসরি কাজ করে।

---

## ধাপ ৭: টেস্ট করা

- ফোনের ব্রাউজারে তোমার website (যেখানে হোস্ট করা আছে, যেমন GitHub Pages/আগের
  hosting) খুলে দেখো — উপরে "Download App" ব্যানার দেখাচ্ছে কিনা
- APK ডাউনলোড করে ইনস্টল করো (Android এ "Unknown sources" থেকে ইনস্টল করার
  অনুমতি চাইতে পারে — allow করে দাও)
- App খুলে একটা পোস্ট দাও, দেখো নোটিফিকেশন আসে কিনা অন্য ফোনে (app বন্ধ থাকলেও)
- একটা পোস্টে লিংক দিয়ে দেখো প্রিভিউ কার্ড আসে কিনা
- নিজের করা পোস্টে "Edit" বাটন দেখা যাচ্ছে কিনা, আর অন্যের পোস্টে দেখা যাচ্ছে
  না — সেটা কনফার্ম করো

---

## সমস্যা হলে

- **APK build fail হলে:** Actions ট্যাবে red ✗ এ ক্লিক করে error লগ দেখো, আমাকে
  স্ক্রিনশট/টেক্সট পাঠাও, আমি ঠিক করে দেবো
- **Notification না আসলে:** ধাপ ২ (google-services.json secret) আর ধাপ ৩-৪
  (service account) ঠিকমতো হয়েছে কিনা চেক করো — এই দুইটা সবচেয়ে বেশি ভুল হয়
- **Icon ঝাপসা লাগলে:** `resources/icon.png` এ যে logo.png আছে সেটা ছোট রেজোলিউশনের
  (225x223px) — তোমার কাছে বড় (কমপক্ষে 512x512, ভালো হয় 1024x1024) লোগো থাকলে
  সেটা দিয়ে replace করে আবার push করো, আইকন শার্প হবে
