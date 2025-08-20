# 🚚 BidBridge – Real-Time Task Bidding Platform

**BidBridge** is a hyperlocal delivery and task bidding platform where users can post tasks, drivers/volunteers can place bids, and updates are delivered in real time.  
It ensures **fair opportunities for drivers** and **best value for customers** — all wrapped in a secure, multilingual, and user-friendly system. 🌐  

🔗 **Live Preview:** [BidBridge Website](https://astrobyte05.github.io/Bidbridge__/)  

---

## 📖 About the Project

BidBridge solves the inefficiencies of manual task allocation by providing a **real-time bidding system** for local delivery and service tasks.  
- **Buyers** can post tasks and pick the best offer.  
- **Sellers/Volunteers** can bid competitively with transparency.  
- **Admins** can verify profiles, track analytics, and ensure fair play.  

---

## ✨ Features

- 🧑‍🤝‍🧑 **User Accounts & Roles** – Buyers and sellers have separate dashboards with role-based access.  
- 🔐 **Secure Authentication** – JWT + Supabase Auth for login & session management.  
- ✅ **Volunteer Verification** – Profile completion, document upload, admin approval, OTP phone/email verification, and a verified badge.  
- 💬 **In-App Chat** – WhatsApp-style messaging with Supabase Realtime (typing indicators, attachments).  
- ⏱️ **Instant Updates** – Real-time bid updates powered by Supabase Realtime API/WebSockets.  
- 🔍 **Search & Filters** – Find tasks by keyword, budget, or deadline with filters for price and date.  
- 🌐 **Multi-Language Support** – English, Hindi, Marathi with AI-powered translation and text cleanup.  
- 📊 **Bid History & Analytics** – Track previous bids, winning trends, and average success prices.  
- ⚡ **Optimized Performance** – Indexed queries on frequently accessed fields like `task_id` and `created_at`.  
- 🛡️ **Error Monitoring** – Integrated Sentry/logging for production error tracking.  
- 🌓 **Responsive UI + Dark Mode** – Works seamlessly across devices with theme options.  

---

## 🛠️ Tech Stack

| Layer            | Technology / Service                          |
|------------------|-----------------------------------------------|
| **Frontend**     | HTML, Tailwind CSS, JavaScript (ES Modules)   |
| **Backend**      | Python Flask (REST APIs)                      |
| **Database**     | Supabase (PostgreSQL + Realtime API)          |
| **Auth**         | Supabase Auth + JWT                          |
| **Realtime**     | Supabase Realtime API / WebSockets            |
| **AI Services**  | Google Gemini API (AI text + translations)    |
| **Error Tracking**| Sentry / Logging system                      |
| **Hosting**      | GitHub Pages (Frontend) + Supabase Backend    |

---

## 📂 Project Structure

```plaintext
BidBridge/
├── backend/                   # Flask backend
│   ├── app.py                 # Entry point
│   ├── routes/                # API endpoints
│   ├── models/                # Database models
│   ├── services/              # Auth, Chat, Verification, Analytics
│   └── requirements.txt       # Python dependencies
├── frontend/                  # UI
│   ├── index.html             # Main page
│   ├── styles/                # Tailwind & custom CSS
│   ├── scripts/               # JS logic, API integration
│   └── assets/                # Images, icons
├── docs/                      # Screenshots, diagrams
├── README.md                  # Documentation
└── .env                       # Environment variables
```

---

## ⚙️ Setup & Installation

### 1️⃣ Clone Repository
```bash
git clone https://github.com/astrobyte05/Bidbridge__.git
cd Bidbridge__
```

### 2️⃣ Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

### 3️⃣ Configure Environment Variables
Create `.env` file:
```env
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-service-key
GEMINI_API_KEY=your-gemini-api-key
JWT_SECRET=your-jwt-secret
SENTRY_DSN=your-sentry-dsn
```

### 4️⃣ Frontend Setup
- If using npm for JS dependencies:
```bash
cd frontend
npm install
```
- Or open `index.html` directly in your browser.

---

## 🖥️ Run Locally

### Start Backend
```bash
cd backend
python app.py
```
Runs at: **http://127.0.0.1:5000**

### Open Frontend
- Open `frontend/index.html` in your browser  
- Or run with Live Server (VS Code extension)  

---

## 🚀 Usage Flow

- **Post a Task** – User enters details & budget.  
- **Bidding** – Volunteers submit live bids, shown instantly.  
- **Chat** – Poster & volunteer communicate directly inside app.  
- **Verification** – Admin checks documents, approves volunteers.  
- **Selection** – Poster accepts best bid → task assigned.  
- **Analytics** – Dashboard shows trends, history, and performance.  

---

## 🔄 How It Works

**Flow 1 – Task Posting**  
1. Frontend sends `POST /tasks`  
2. Backend validates & inserts into Supabase  
3. Realtime update → Task appears in all dashboards  

**Flow 2 – Bidding**  
1. Volunteer submits bid → Backend stores in `bids` table  
2. Supabase Realtime broadcasts update → All users see bid instantly  

**Flow 3 – Chat & Verification**  
1. Messages sent via Supabase Realtime → Delivered instantly  
2. Verification handled by admin dashboard → badge shown once approved  

---

## 🚨 Usage Policy
This project is for academic use only.
Using it for cheating, bypassing systems, or any unethical purpose is strictly prohibited.
By running this project, you agree to follow this policy.

---

