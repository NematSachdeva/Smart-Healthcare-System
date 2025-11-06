# Smart Healthcare System - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Google Gemini API key

### 1. Clone the Repository
```bash
git clone https://github.com/NematSachdeva/Smart-Healthcare-System.git
cd Smart-Healthcare-System
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials
# Required variables:
# - MONGO_URI (MongoDB connection string)
# - GEMINI_API_KEY (Google Gemini API key)
# - JWT_SECRET (any random string)
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
```

### 4. Get API Keys

#### MongoDB Atlas (Free)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create account and cluster
3. Get connection string
4. Add to `backend/.env` as `MONGO_URI`

#### Google Gemini API (Free)
1. Go to https://aistudio.google.com/app/apikey
2. Create API key
3. Add to `backend/.env` as `GEMINI_API_KEY`

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Server runs on: http://localhost:5001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
App runs on: http://localhost:5173

## 📋 Features

### For Patients
- Register and login
- Book appointments with doctors
- View appointment history
- View approved prescriptions
- Modern, intuitive UI

### For Doctors
- Register with specialization
- View and manage appointments
- Generate AI-powered prescription drafts using Gemini 2.0 Flash
- Review and approve prescriptions
- View prescription history

### For Admins
- Manage users (patients and doctors)
- View system statistics
- Approve/reject doctor registrations

## 🤖 AI Prescription Generation

The system uses **Google Gemini 2.0 Flash** to generate intelligent prescription drafts:

- Analyzes patient symptoms and medical history
- Suggests appropriate medications with dosages
- Provides medical advice and precautions
- Recommends follow-up care

Doctors can review, modify, and approve AI-generated prescriptions before sending to patients.

## 🔐 Default Admin Credentials

```
Email: admin@healthcare.com
Password: admin123
```

**⚠️ Change these in production!**

## 📁 Project Structure

```
Smart-Healthcare-System/
├── backend/
│   ├── controllers/      # Request handlers
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── services/        # Business logic (AI service)
│   ├── middleware/      # Auth, validation
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   └── utils/       # Utilities (API client)
│   └── vite.config.js
└── README.md
```

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Google Gemini 2.0 Flash AI

**Frontend:**
- React + Vite
- React Router
- Axios
- Modern CSS with gradients

## 📝 Environment Variables

### Backend (.env)
```env
# MongoDB
MONGO_URI=your_mongodb_connection_string

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# JWT
JWT_SECRET=your_random_secret_string

# Server
PORT=5001
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5001
```

## 🧪 Testing

### Test Backend
```bash
cd backend
npm start
# Visit http://localhost:5001
```

### Test Frontend
```bash
cd frontend
npm run dev
# Visit http://localhost:5173
```

### Test AI Service
```bash
cd backend
node test-gemini.js
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check your `MONGO_URI` is correct
- Ensure IP address is whitelisted in MongoDB Atlas
- Verify network connection

### Gemini API Error
- Verify API key is correct
- Check you have API quota remaining
- Ensure no extra spaces in `.env` file

### Port Already in Use
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Or use different port in .env
PORT=5002
```

### CORS Error
- Ensure backend is running on port 5001
- Check frontend API URL in `frontend/src/utils/api.js`

## 📚 API Documentation

### Authentication
```
POST /api/auth/register
POST /api/auth/login
```

### Appointments
```
GET  /api/appointments/patient
POST /api/appointments
```

### Prescriptions
```
POST /api/prescriptions/ai-draft
PUT  /api/prescriptions/approve/:id
GET  /api/prescriptions/patient
```

See `TROUBLESHOOTING.md` for detailed API documentation.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Nemat Sachdeva
- GitHub: [@NematSachdeva](https://github.com/NematSachdeva)

## 🙏 Acknowledgments

- Google Gemini AI for intelligent prescription generation
- MongoDB Atlas for database hosting
- React and Vite for frontend framework

---

**Need help?** Check `TROUBLESHOOTING.md` or open an issue on GitHub.
