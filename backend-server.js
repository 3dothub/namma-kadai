const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your_jwt_secret_key';

// Middleware
app.use(cors());
app.use(express.json());

// Mock users database
const users = [
  {
    id: '1',
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  }
];

// Login endpoint
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  console.log('Login attempt:', { email, password });

  // Find user
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ 
      message: 'Invalid email or password' 
    });
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    },
    token,
    message: 'Login successful'
  });
});

// Register endpoint
app.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body;

  console.log('Register attempt:', { name, email, password });

  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ 
      message: 'User already exists with this email' 
    });
  }

  // Create new user
  const newUser = {
    id: (users.length + 1).toString(),
    email,
    password,
    name
  };

  users.push(newUser);

  // Generate JWT token
  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name
    },
    token,
    message: 'Registration successful'
  });
});

// Verify token endpoint
app.get('/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`🌐 Network accessible on http://192.168.1.3:${PORT}`);
  console.log('\n📋 Test Credentials:');
  console.log('Email: test@example.com');
  console.log('Password: password123');
  console.log('\n📡 Available endpoints:');
  console.log('POST /auth/login');
  console.log('POST /auth/register');
  console.log('GET /auth/verify');
  console.log('GET /health');
});
