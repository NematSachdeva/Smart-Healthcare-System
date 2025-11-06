# Backend Test Suite

This directory contains comprehensive unit and integration tests for the Smart Healthcare System backend.

## Test Structure

```
__tests__/
├── controllers/
│   ├── authController.test.js          # Authentication controller tests
│   ├── appointmentController.test.js   # Appointment controller tests
│   └── prescriptionController.test.js  # Prescription controller tests
├── middleware/
│   ├── auth.test.js                    # JWT authentication middleware tests
│   └── roleCheck.test.js               # Role-based access control tests
└── integration/
    └── api.test.js                     # End-to-end API integration tests
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- authController.test.js
```

## Test Coverage

### Authentication Controller (authController.test.js)
- ✓ Patient registration with valid data
- ✓ Doctor registration with valid data
- ✓ Duplicate email validation
- ✓ User login (patient and doctor)
- ✓ Invalid credentials handling
- ✓ Inactive doctor account handling

### Appointment Controller (appointmentController.test.js)
- ✓ Appointment booking with valid data
- ✓ Doctor availability validation
- ✓ Time slot conflict detection
- ✓ Fetching patient appointments
- ✓ Fetching doctor appointments
- ✓ Appointment status updates

### Prescription Controller (prescriptionController.test.js)
- ✓ AI prescription draft generation
- ✓ Prescription approval workflow
- ✓ Authorization checks
- ✓ Fetching patient prescriptions
- ✓ Fetching doctor prescriptions
- ✓ Prescription history tracking

### Authentication Middleware (auth.test.js)
- ✓ Valid JWT token verification
- ✓ Missing token handling
- ✓ Invalid token format handling
- ✓ Expired token handling
- ✓ Token extraction from Authorization header

### Role Check Middleware (roleCheck.test.js)
- ✓ Role-based access control
- ✓ Multiple role support
- ✓ Unauthorized access prevention
- ✓ Missing authentication handling

### Integration Tests (api.test.js)
- ✓ Complete authentication flow (register → login → access protected route)
- ✓ Complete appointment booking flow
- ✓ Complete prescription generation and approval flow
- ✓ Authorization enforcement across endpoints

## Test Results

All 48 tests passing ✓

## Requirements Coverage

The test suite covers the following requirements from the specification:

- **Requirements 1.1-1.5**: Patient registration
- **Requirements 2.1-2.5**: Doctor registration
- **Requirements 3.1-3.5**: User authentication
- **Requirements 4.1-4.5**: Appointment booking
- **Requirements 5.1-5.5**: Patient appointment viewing
- **Requirements 6.1-6.5**: Doctor appointment management
- **Requirements 7.1-7.5**: AI prescription generation
- **Requirements 9.1-9.5**: Prescription approval
- **Requirements 10.1-10.5**: Patient prescription viewing
- **Requirements 11.1-11.5**: Prescription history
- **Requirements 14.1-14.5**: Authentication and authorization

## Notes

- All tests use mocked dependencies (database models, external APIs)
- OpenAI API calls are mocked to avoid external dependencies
- Tests focus on core functional logic without testing edge cases
- Integration tests verify complete workflows across multiple components
