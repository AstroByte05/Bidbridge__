# 🏗️ BidBridge

**BidBridge** is a task bidding platform where users can post tasks, place bids, and view live updates in real time.
Built with **HTML/CSS/JavaScript (Frontend)**, **Python Flask (Backend)**, and **Supabase (Database).** 🌐

## 📖 About the Project 📖

 BidBridge connects task posters with nearby drivers through real-time bidding, ensuring the best price and fastest service. Drivers get fair opportunities, and customers save time and money.
- **Frontend**: Handles UI rendering and API requests.
- **Backend**: Processes requests via Flask.
- **Database**: Supabase for cloud-hosted storage.

-----

## 📝 Features 📝

- 🗒️ **Post Tasks** — Create delivery or moving jobs with a title and description.  
- 💸 **Place Bids** — Drivers can submit competitive bids for posted tasks.  
- ⏱️ **Real-Time Updates** — View and manage all bids instantly as they arrive.  
- 📱 **Responsive Design** — Clean, intuitive UI that works across devices.  
- ☁️ **Supabase Integration** — Cloud-hosted database for secure and scalable data storage.  
- 🐍 **Python Flask Backend** — API built with Flask to handle business logic and data operations efficiently.  

-----

## 🛠️ Tech Stack 🛠️

| Layer         | Technology              |
|--------------|--------------------------|
| **Frontend** | HTML, CSS, JavaScript     |
| **Backend**  | Python Flask              |
| **Database** | Supabase (PostgreSQL)     |
| **Hosting**  | Supabase, Local/Cloud API |
| **Real-Time**| Supabase subscriptions    |

-----

## 📂 Project Structure 📂

bidbridge/
├── backend/
│   ├── app.py                # Flask API entry point
│   ├── routes/               # API endpoints
│   ├── models/               # Database models
│   └── requirements.txt      # Backend dependencies
├── frontend/
│   ├── index.html            # Main UI page
│   ├── styles/               # CSS files
│   └── scripts/              # JavaScript files
├── README.md
└── .env                      # Environment variables

-----

## ⚙️ Installation ⚙️

1️⃣ Clone the Repository
  ```bash

  git clone https://github.com/yourusername/bidbridge.git
  cd bidbridge
  ```

2️⃣ Set Up Backend
  ```bash

  cd backend
  pip install -r requirements.txt
  ```

3️⃣ Configure Environment Variables
  ```bash

  Duplicate .env.example → rename it to .env

  Get your Supabase URL and API key from Supabase

  Add them inside .env:
  SUPABASE_URL=your-url-here
  SUPABASE_KEY=your-key-here
  ```

4️⃣ Install Frontend Dependencies (if any)
  ```bash

  If your frontend has a package.json:
  cd frontend
  npm install
  Otherwise, just open the HTML files in your browser.
  ```

## 🖥️ Run Locally 🖥️
  ```bash

  Start the Backend:
        -cd backend
        -python main.py

  Backend will run at: http://127.0.0.1:5000

  View the Frontend
        -Open frontend/index.html in your browser
        -Or use Live Server in VS Code
  ```

-----

## 🚀 Usage Flow 🚀

- **Post a Task** – User enters title & description of the delivery/moving job.
- **Drivers Bid** – Nearby drivers submit real-time bids.
- **Live Updates** – Task creator sees all bids instantly.
- **Choose Winner** – Select the most suitable bid and confirm.

-----

## 🔄 How It Works 🔄

Flow 1 – Posting a Task
 -Frontend sends POST /tasks with task data.
 -Backend inserts into Supabase tasks table.
 -Database saves the task & returns success.

Flow 2 – Placing a Bid
 -Frontend sends POST /bids with bid details.
 -Backend inserts into Supabase bids table.
 -Database saves bid linked to the task.

Flow 3 – Viewing Bids
 -Frontend sends GET /bids?task_id=123.
 -Backend fetches from Supabase.
 -Database returns data for UI display.

-----

## 🚨 Usage Policy 🚨

This project is for academic use only.
Using it for cheating, bypassing systems, or any unethical purpose is strictly prohibited.
By running this project, you agree to follow this policy.