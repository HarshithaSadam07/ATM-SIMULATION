# ATM Simulation System

A full-stack ATM simulation system with user authentication, transaction management, and real-time balance updates.

## Features

- User authentication with card number and PIN
- Account balance display
- Money withdrawal
- Money deposit
- Transaction history
- Secure session management with JWT
- Responsive design for mobile and desktop

## Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)

### Backend
- Node.js
- Express.js
- MongoDB
- JWT for authentication
- bcrypt for password hashing

## Prerequisites

- Node.js (v14+ recommended)
- MongoDB (v4+ recommended)
- Modern web browser

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd atmm-simulation
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Create a .env file in the backend directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/atm_simulation
JWT_SECRET=your_jwt_secret_key_here
PORT=3000
```

## Running the Application

1. Start MongoDB service on your machine

2. Start the backend server:
```bash
cd backend
npm run dev
```

3. Open the frontend:
- Navigate to the frontend directory
- Open index.html in a web browser
- Or use a local server like Live Server VS Code extension

## API Endpoints

### Authentication
- POST /api/auth/login - Login with card number and PIN

### Account Management
- GET /api/account/balance - Get current balance
- POST /api/account/deposit - Deposit money
- POST /api/account/withdraw - Withdraw money
- GET /api/account/transactions - Get transaction history

## Security Features

- PIN encryption using bcrypt
- JWT authentication for secure sessions
- Protected API endpoints
- Input validation and error handling

## Future Enhancements

- PDF receipt generation
- Multilingual support (English + Telugu)
- Sound effects for transactions
- Admin panel for user management