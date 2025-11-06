# Smart Healthcare Appointment & AI Prescription System

A full-stack web application that connects patients and doctors for appointment booking and AI-assisted prescription generation. The system features role-based access control, AI-powered prescription drafts using OpenAI, and comprehensive appointment management.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)

## Features

### Patient Portal
- User registration with medical history
- Browse and book appointments with doctors
- View appointment history and status
- Access approved prescriptions
- Responsive mobile-friendly interface

### Doctor Portal
- Doctor registration with specialization and availability
- View and manage scheduled appointments
- Generate AI-assisted prescription drafts using OpenAI
- Review, edit, and approve prescriptions
- Track prescription edit history
- Update appointment status

### Admin Portal
- View all registered users (patients and doctors)
- Manage doctor account status (activate/deactivate)
- Monitor system statistics
- User management and oversight

### AI Integration
- OpenAI GPT-4 powered prescription generation
- Context-aware drafts based on patient symptoms and medical history
- Structured prescription format with diagnosis, medications, and advice
- Doctor review and approval workflow

## Technology Stack

### Backend
- **Runtime**: Node.js 18.x
- **Framework**: Express.js 4.x
- **Database**: MongoDB Atlas with Mongoose ODM 7.x
- **Authentication**: JWT (jsonwebtoken) with bcryptjs password hashing
- **AI Integration**: OpenAI API (GPT-4 / GPT-3.5-turbo)
- **Validation**: express-validator
- **Environment**: dotenv for configuration

### Frontend
- **Framework**: React.js 18.x
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Storage**: LocalStorage for JWT tokens

### Architecture
- RESTful API design
- MVC pattern on backend
- Component-based architecture on frontend
- Role-based access control (RBAC)
- Centralized error handling

## Project Structure

```
smart-healthcare-system/
├── backend/
│   ├── config/
│   │   └── database.js              # MongoDB connection configuration
│   ├── controllers/
│   │   ├── adminController.js       # Admin operations logic
│   │   ├── appointmentController.js # Appointment management logic
│   │   ├── authController.js        # Authentication logic
│   │   ├── doctorController.js      # Doctor operations logic
│   │   └── prescriptionController.js # Prescription management logic
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification middleware
│   │   ├── errorHandler.js          # Centralized error handling
│   │   ├── roleCheck.js             # Role-based access control
│   │   └── validator.js             # Input validation rules
│   ├── models/
│   │   ├── Appointment.js           # Appointment schema
│   │   ├── Doctor.js                # Doctor schema
│   │   ├── Patient.js               # Patient schema
│   │   ├── Prescription.js          # Prescription schema
│   │   └── PrescriptionHistory.js   # Prescription history schema
│   ├── routes/
│   │   ├── admin.js                 # Admin routes
│   │   ├── appointments.js          # Appointment routes
│   │   ├── auth.js                  # Authentication routes
│   │   ├── doctors.js               # Doctor routes
│   │   └── prescriptions.js         # Prescription routes
│   ├── services/
│   │   └── aiService.js             # OpenAI integration service
│   ├── .env                         # Environment variables (not in git)
│   ├── .env.example                 # Environment variables template
│   ├── .gitignore
│   ├── package.json
│   └── server.js                    # Express server entry point
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/               # Admin-specific components
│   │   │   ├── common/              # Reusable components
│   │   │   │   ├── ErrorMessage.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   ├── RoleBasedRoute.jsx
│   │   │   │   ├── SuccessMessage.jsx
│   │   │   │   └── index.js
│   │   │   ├── doctor/              # Doctor-specific components
│   │   │   │   ├── AIPrescriptionGenerator.jsx
│   │   │   │   ├── PrescriptionHistoryView.jsx
│   │   │   │   └── PrescriptionReviewForm.jsx
│   │   │   └── patient/             # Patient-specific components
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Authentication context
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── BookAppointment.jsx
│   │   │   ├── DoctorAppointments.jsx
│   │   │   ├── DoctorDashboard.jsx
│   │   │   ├── DoctorManagement.jsx
│   │   │   ├── DoctorPrescriptions.jsx
│   │   │   ├── DoctorRegister.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── PatientAppointments.jsx
│   │   │   ├── PatientDashboard.jsx
│   │   │   ├── PatientPrescriptions.jsx
│   │   │   ├── PatientRegister.jsx
│   │   │   ├── Unauthorized.jsx
│   │   │   └── UserManagement.jsx
│   │   ├── utils/
│   │   │   └── api.js               # Axios configuration and API helpers
│   │   ├── App.jsx                  # Main app component with routing
│   │   ├── index.css                # Global styles
│   │   └── index.js                 # React entry point
│   ├── .env                         # Environment variables (not in git)
│   ├── .env.example                 # Environment variables template
│   ├── .gitignore
│   ├── package.json
│   ├── postcss.config.js
│   └── tailwind.config.js
│
├── .kiro/
│   └── specs/
│       └── smart-healthcare-system/
│           ├── design.md            # System design document
│           ├── requirements.md      # Feature requirements
│           └── tasks.md             # Implementation tasks
│
├── .gitignore
└── README.md
```

## Installation and Setup

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB Atlas account** - [Sign up](https://www.mongodb.com/cloud/atlas)
- **OpenAI API key** - [Get API key](https://platform.openai.com/api-keys)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-healthcare-system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your credentials (see Environment Variables section)
   npm run dev
   ```

3. **Frontend Setup** (in a new terminal)
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your API URL
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

### Detailed Setup Instructions

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env` (see [Environment Variables](#environment-variables) section)

5. Start the development server:
   ```bash
   npm run dev
   ```
   
   The server will start on port 5001 (or your configured PORT) with hot-reloading enabled.

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   ```
   REACT_APP_API_URL=http://localhost:5001/api
   ```

5. Start the development server:
   ```bash
   npm start
   ```
   
   The application will open automatically at http://localhost:3000

## Environment Variables

### Backend Environment Variables

Create a `backend/.env` file with the following variables:

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `MONGO_URI` | MongoDB Atlas connection string | **Yes** | - | `mongodb+srv://user:pass@cluster.mongodb.net/healthcare?retryWrites=true&w=majority` |
| `OPENAI_API_KEY` | OpenAI API key for prescription generation | **Yes** | - | `sk-proj-...` |
| `JWT_SECRET` | Secret key for JWT token signing | **Yes** | - | `your-super-secret-jwt-key-min-32-chars` |
| `PORT` | Port number for Express server | No | `5001` | `5001` |
| `NODE_ENV` | Node environment | No | `development` | `development`, `production`, `test` |

#### Getting Your Credentials

**MongoDB Atlas:**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (M0 free tier is sufficient for development)
3. Click "Database Access" and create a database user with read/write permissions
4. Click "Network Access" and add your IP address (or 0.0.0.0/0 for development)
5. Click "Connect" on your cluster → "Connect your application"
6. Copy the connection string and replace `<username>` and `<password>` with your database user credentials
7. Replace `<database>` with your database name (e.g., `healthcare`)

**OpenAI API Key:**
1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Navigate to [API Keys](https://platform.openai.com/api-keys)
3. Click "Create new secret key"
4. Copy the key immediately (it will only be shown once)
5. Note: OpenAI API usage is paid - monitor your usage at the OpenAI dashboard

**JWT Secret:**
Generate a secure random string (minimum 32 characters):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend Environment Variables

Create a `frontend/.env` file with the following variables:

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `REACT_APP_API_URL` | Backend API base URL | **Yes** | - | `http://localhost:5001/api` (dev)<br>`https://api.yourdomain.com/api` (prod) |

### Security Best Practices

- **Never commit `.env` files** - they are already in `.gitignore`
- Use different credentials for development, staging, and production
- Keep your OpenAI API key secure and monitor usage/costs
- Use strong, randomly generated JWT secrets (minimum 32 characters)
- Rotate credentials regularly, especially after team member changes
- Use environment-specific MongoDB databases
- Enable MongoDB Atlas IP whitelisting in production
- Consider using secret management services (AWS Secrets Manager, HashiCorp Vault) for production

## API Endpoints

The backend exposes a RESTful API with the following endpoints:

### Authentication Routes

#### POST `/api/auth/login`
Login for all user types (patient, doctor, admin)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "patient"
  }
}
```

### Patient Routes

#### POST `/api/patients/register`
Register a new patient account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "age": 30,
  "gender": "male",
  "phone": "+1234567890",
  "medicalHistory": "No known allergies"
}
```

**Response:**
```json
{
  "message": "Patient registered successfully",
  "patient": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Doctor Routes

#### POST `/api/doctors/register`
Register a new doctor account

**Request Body:**
```json
{
  "name": "Dr. Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "specialization": "Cardiology",
  "availability": [
    {
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "17:00"
    }
  ]
}
```

#### GET `/api/doctors/list`
Get list of all active doctors (no authentication required)

**Response:**
```json
{
  "doctors": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Dr. Jane Smith",
      "specialization": "Cardiology",
      "availability": [...]
    }
  ]
}
```

### Appointment Routes

All appointment routes require authentication (JWT token in Authorization header)

#### POST `/api/appointments/book`
Book a new appointment (Patient only)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "doctorId": "507f1f77bcf86cd799439011",
  "date": "2024-12-15",
  "time": "10:00",
  "symptoms": "Chest pain and shortness of breath"
}
```

#### GET `/api/appointments/patient`
Get all appointments for logged-in patient

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "appointments": [
    {
      "id": "507f1f77bcf86cd799439011",
      "doctor": {
        "name": "Dr. Jane Smith",
        "specialization": "Cardiology"
      },
      "date": "2024-12-15T00:00:00.000Z",
      "time": "10:00",
      "symptoms": "Chest pain",
      "status": "scheduled"
    }
  ]
}
```

#### GET `/api/appointments/doctor`
Get all appointments for logged-in doctor (Doctor only)

#### PUT `/api/appointments/:id/status`
Update appointment status (Doctor only)

**Request Body:**
```json
{
  "status": "completed"
}
```

### Prescription Routes

All prescription routes require authentication

#### POST `/api/prescriptions/ai-draft`
Generate AI prescription draft (Doctor only)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "appointmentId": "507f1f77bcf86cd799439011",
  "symptoms": "Chest pain and shortness of breath",
  "medicalHistory": "Hypertension, no known allergies"
}
```

**Response:**
```json
{
  "prescription": {
    "id": "507f1f77bcf86cd799439012",
    "aiDraft": "{\"diagnosis\":\"...\",\"medications\":[...]}",
    "status": "draft"
  }
}
```

#### PUT `/api/prescriptions/approve/:id`
Approve and finalize prescription (Doctor only)

**Request Body:**
```json
{
  "finalPrescription": "Updated prescription content",
  "notes": "Patient should follow up in 2 weeks"
}
```

#### GET `/api/prescriptions/patient`
Get all approved prescriptions for logged-in patient

#### GET `/api/prescriptions/doctor`
Get all prescriptions created by logged-in doctor

#### GET `/api/prescriptions/:id/history`
Get edit history for a prescription (Doctor only)

### Admin Routes

All admin routes require authentication and admin role

#### GET `/api/admin/users`
Get all registered users

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "users": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "patient",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### PUT `/api/admin/doctors/:id/status`
Activate or deactivate doctor account

**Request Body:**
```json
{
  "isActive": false
}
```

#### GET `/api/admin/stats`
Get system statistics

**Response:**
```json
{
  "totalPatients": 150,
  "totalDoctors": 25,
  "totalAppointments": 500,
  "totalPrescriptions": 300
}
```

### Error Responses

All endpoints return consistent error responses:

```json
{
  "status": "error",
  "message": "Error description"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate email)
- `500` - Internal Server Error

## Development Workflow

### Code Organization

The project follows industry best practices:

**Backend (MVC Pattern):**
- **Models**: Mongoose schemas defining data structure
- **Routes**: Express route definitions
- **Controllers**: Business logic and request handling
- **Middleware**: Cross-cutting concerns (auth, validation, errors)
- **Services**: External integrations (OpenAI)

**Frontend (Component-Based):**
- **Pages**: Top-level route components
- **Components**: Reusable UI components organized by role
- **Context**: Global state management (authentication)
- **Utils**: Helper functions and API client

### Development Commands

**Backend:**
```bash
npm run dev      # Start development server with nodemon (hot reload)
npm start        # Start production server
npm test         # Run tests
```

**Frontend:**
```bash
npm start        # Start development server (port 3000)
npm run build    # Create production build
npm test         # Run tests
```

### Git Workflow

1. **Create feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and commit:**
   ```bash
   git add .
   git commit -m "feat: add feature description"
   ```

3. **Push and create pull request:**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Code review and merge**

### Commit Message Convention

Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Responsive Design Testing

The application is fully responsive. Test on multiple viewports:

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Testing Tools:**
- Chrome DevTools: Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M)
- Firefox Responsive Design Mode
- Test on actual devices for best results

**Recommended Test Sizes:**
- iPhone SE: 375px × 667px
- iPad: 768px × 1024px
- Desktop: 1440px × 900px

### Code Quality

- Follow ESLint rules (if configured)
- Use meaningful variable and function names
- Write comments for complex logic
- Keep functions small and focused
- Avoid code duplication
- Handle errors gracefully

## Deployment

### Backend Deployment (Render / Heroku / Railway)

#### Render Deployment

1. **Create account** at [Render](https://render.com/)

2. **Create new Web Service:**
   - Connect your GitHub repository
   - Select the `backend` directory as root
   - Build command: `npm install`
   - Start command: `npm start`

3. **Configure environment variables:**
   - Add all variables from `.env` in Render dashboard
   - Use production MongoDB URI
   - Use production JWT secret

4. **Deploy:**
   - Render will automatically deploy on push to main branch

#### Heroku Deployment

1. **Install Heroku CLI:**
   ```bash
   npm install -g heroku
   ```

2. **Login and create app:**
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set MONGO_URI="your-mongodb-uri"
   heroku config:set OPENAI_API_KEY="your-openai-key"
   heroku config:set JWT_SECRET="your-jwt-secret"
   ```

4. **Deploy:**
   ```bash
   git subtree push --prefix backend heroku main
   ```

### Frontend Deployment (Vercel / Netlify)

#### Vercel Deployment

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd frontend
   vercel
   ```

3. **Configure environment variables:**
   - Add `REACT_APP_API_URL` in Vercel dashboard
   - Set to your production backend URL

4. **Production deployment:**
   ```bash
   vercel --prod
   ```

#### Netlify Deployment

1. **Create account** at [Netlify](https://www.netlify.com/)

2. **Connect repository:**
   - Click "New site from Git"
   - Select your repository
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `build`

3. **Configure environment variables:**
   - Add `REACT_APP_API_URL` in Netlify dashboard

4. **Deploy:**
   - Netlify will automatically deploy on push

### Database Setup (MongoDB Atlas)

For production:

1. **Create production cluster** (M2 or higher recommended)

2. **Configure network access:**
   - Add IP addresses of your backend servers
   - Or use 0.0.0.0/0 (less secure but simpler)

3. **Create database user** with strong password

4. **Enable backup** (available on paid tiers)

5. **Monitor performance** using Atlas dashboard

### Post-Deployment Checklist

- [ ] All environment variables configured correctly
- [ ] Database connection working
- [ ] OpenAI API key valid and has credits
- [ ] CORS configured for frontend domain
- [ ] HTTPS enabled on both frontend and backend
- [ ] Error logging configured (e.g., Sentry)
- [ ] Health check endpoint responding
- [ ] Test all user flows (registration, login, appointments, prescriptions)
- [ ] Monitor API usage and costs (OpenAI)
- [ ] Set up monitoring and alerts

### Environment-Specific Configuration

**Development:**
- Use local MongoDB or free Atlas cluster
- Use development OpenAI API key
- Enable detailed error messages
- Hot reloading enabled

**Production:**
- Use production MongoDB cluster with backups
- Use production OpenAI API key with usage limits
- Generic error messages for security
- Enable compression and caching
- Set up logging and monitoring
- Use HTTPS only
- Enable rate limiting

## Testing

### Backend Testing

The backend uses Jest for unit and integration testing.

**Run all tests:**
```bash
cd backend
npm test
```

**Run tests in watch mode:**
```bash
npm test -- --watch
```

**Run tests with coverage:**
```bash
npm test -- --coverage
```

**Test Structure:**
```
backend/
├── __tests__/
│   ├── controllers/
│   │   ├── authController.test.js
│   │   ├── appointmentController.test.js
│   │   └── prescriptionController.test.js
│   ├── middleware/
│   │   ├── auth.test.js
│   │   └── roleCheck.test.js
│   └── integration/
│       ├── auth.integration.test.js
│       └── appointments.integration.test.js
```

**Testing Guidelines:**
- Mock external services (OpenAI API, MongoDB)
- Test happy paths and error cases
- Test authentication and authorization
- Test input validation
- Use test fixtures for consistent data

### Frontend Testing

The frontend uses Jest and React Testing Library.

**Run all tests:**
```bash
cd frontend
npm test
```

**Run tests with coverage:**
```bash
npm test -- --coverage
```

**Test Structure:**
```
frontend/src/
├── __tests__/
│   ├── components/
│   │   ├── Login.test.jsx
│   │   ├── BookAppointment.test.jsx
│   │   └── AIPrescriptionGenerator.test.jsx
│   └── utils/
│       └── api.test.js
```

**Testing Guidelines:**
- Test user interactions
- Test form submissions
- Test error handling
- Mock API calls
- Test responsive behavior

### Manual Testing Checklist

**Authentication:**
- [ ] Patient registration
- [ ] Doctor registration
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout
- [ ] Protected routes redirect to login

**Patient Flow:**
- [ ] View dashboard
- [ ] Browse doctors
- [ ] Book appointment
- [ ] View appointments
- [ ] View prescriptions

**Doctor Flow:**
- [ ] View dashboard
- [ ] View appointments
- [ ] Generate AI prescription
- [ ] Review and edit prescription
- [ ] Approve prescription
- [ ] View prescription history
- [ ] Update appointment status

**Admin Flow:**
- [ ] View all users
- [ ] Filter users by role
- [ ] Activate/deactivate doctor
- [ ] View system statistics

**Responsive Design:**
- [ ] Test on mobile (< 640px)
- [ ] Test on tablet (768px)
- [ ] Test on desktop (1440px)
- [ ] Test navigation on mobile
- [ ] Test forms on mobile

## Contributing

This project follows a spec-driven development approach. All features are planned and documented before implementation.

### Spec Documents

Located in `.kiro/specs/smart-healthcare-system/`:

- **requirements.md**: Feature requirements using EARS pattern and INCOSE quality rules
- **design.md**: System architecture, data models, and technical design
- **tasks.md**: Implementation task list with sub-tasks

### How to Contribute

1. **Review the spec documents** to understand the system design

2. **Pick a task** from `tasks.md` that is not yet completed

3. **Create a feature branch:**
   ```bash
   git checkout -b feature/task-name
   ```

4. **Implement the task** following the design specifications

5. **Test your changes** thoroughly

6. **Update task status** in `tasks.md` by changing `[ ]` to `[x]`

7. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: implement task description"
   git push origin feature/task-name
   ```

8. **Create pull request** for review

### Development Standards

- Follow the MVC pattern for backend code
- Use functional components and hooks for React
- Implement proper error handling
- Write meaningful commit messages
- Add comments for complex logic
- Ensure responsive design
- Test on multiple browsers
- Follow existing code style

### Questions or Issues?

- Check the spec documents first
- Review existing code for patterns
- Ask in pull request comments
- Create an issue for bugs or unclear requirements

## License

ISC

## Acknowledgments

- OpenAI for AI-powered prescription generation
- MongoDB Atlas for cloud database hosting
- React and Express communities for excellent documentation

---

**Note**: This is a development project. For production use in healthcare, ensure compliance with relevant regulations (HIPAA, GDPR, etc.) and conduct thorough security audits.
