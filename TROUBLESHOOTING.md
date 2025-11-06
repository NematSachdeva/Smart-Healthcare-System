# Troubleshooting Guide

## Fixed: 403 Access Denied After Login ✅

### The Problem
After logging in, users were seeing a "403 Access Denied" page instead of their dashboard.

### The Cause
The `login()` function parameters were in the wrong order:
- **Wrong**: `login(user, token)` 
- **Correct**: `login(token, user)`

This caused the user data to not be stored correctly, so the role-based routing couldn't determine the user's role.

### The Fix
Updated `frontend/src/pages/Login.jsx` line 73 to pass parameters in the correct order.

## How to Test the Fix

1. **Clear your browser data** (important!):
   - Open browser DevTools (F12)
   - Go to Application tab → Storage → Clear site data
   - Or manually: Application → Local Storage → Delete `token` and `user`

2. **Refresh the page** (Ctrl+R or Cmd+R)

3. **Try logging in again**

4. **Check what's stored**:
   - Open DevTools → Application → Local Storage
   - You should see:
     - `token`: A long JWT string
     - `user`: JSON object with `id`, `name`, `email`, `role`

## Common Issues After This Fix

### Issue: Still seeing 403
**Solution**: Clear browser cache and local storage, then try again

### Issue: "Network Error" 
**Solution**: 
- Make sure backend is running on port 5001
- Check `frontend/.env` has `REACT_APP_API_URL=http://localhost:5001/api`

### Issue: Login succeeds but redirects to wrong dashboard
**Solution**: Check the user's role in the database - it should be exactly `patient`, `doctor`, or `admin` (lowercase)

## Debugging Tips

### Check User Data in Browser
```javascript
// Open browser console and run:
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user')));
```

### Check Backend Response
Look at the Network tab in DevTools:
1. Go to Network tab
2. Login
3. Find the `login` request
4. Check the Response - should have:
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "patient"
  }
}
```

### Check Role-Based Routing
The role in the user object must match exactly:
- Patient routes: `role === 'patient'`
- Doctor routes: `role === 'doctor'`
- Admin routes: `role === 'admin'`

## Backend Issues

### MongoDB Connection Failed
See the main README.md for MongoDB Atlas setup instructions.

### OpenAI API Errors
- Verify your API key is valid
- Check if you have credits in your OpenAI account
- The key should start with `sk-proj-` or `sk-`

### Port Already in Use
```bash
# Find what's using port 5001
lsof -i :5001

# Kill the process
kill -9 <PID>
```

## Testing Different User Roles

### Create Test Users

**Patient:**
```bash
# Register via UI at http://localhost:3000/register/patient
# Or use API:
curl -X POST http://localhost:5001/api/patients/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "email": "patient@test.com",
    "password": "password123",
    "age": 30,
    "gender": "male",
    "phone": "+1234567890"
  }'
```

**Doctor:**
```bash
# Register via UI at http://localhost:3000/register/doctor
# Or use API:
curl -X POST http://localhost:5001/api/doctors/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Test",
    "email": "doctor@test.com",
    "password": "password123",
    "specialization": "General Medicine",
    "availability": [
      {
        "day": "Monday",
        "startTime": "09:00",
        "endTime": "17:00"
      }
    ]
  }'
```

**Admin:**
Admin users must be created directly in the database. Use MongoDB Compass or Atlas UI:
```javascript
// In MongoDB, insert into 'users' collection:
{
  "name": "Admin User",
  "email": "admin@test.com",
  "password": "$2a$10$...", // Use bcrypt to hash "password123"
  "role": "admin",
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

## Need More Help?

1. Check browser console for errors (F12 → Console)
2. Check backend terminal for errors
3. Verify all environment variables are set correctly
4. Make sure both frontend and backend are running
5. Try the test users above to verify each role works

## Quick Reset

If everything is broken and you want to start fresh:

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
# Edit .env with correct values
npm run dev

# Frontend (new terminal)
cd frontend
rm -rf node_modules package-lock.json
npm install
# Edit .env with correct values
npm start

# Browser
# Clear all site data in DevTools
# Refresh page
```
