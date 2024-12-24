const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const regd_customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const app = express();

app.use(express.json());

// Secret key for JWT
const jwtSecretKey = "my_secure_secret_key";

// Session setup for "/customer"
app.use("/customer", session({
    secret: "fingerprint_customer", 
    resave: true, 
    saveUninitialized: true
}));

// Authentication middleware for protected routes
app.use("/customer/auth/*", function auth(req, res, next) {
    // Extract the token from headers
    const token = req.headers['authorization']?.split(' ')[1]; // Extract the token
    
    // Check if token exists
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Verify the token
    try {
        const decoded = jwt.verify(token, jwtSecretKey); // Use the secure key
        req.user = decoded; // Attach decoded payload to request object
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        return res.status(403).json({ message: "Invalid token." });
    }
});

// Login route to generate tokens
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Dummy user authentication (replace with actual logic)
    if (username === "test_user" && password === "1234") {
        // Generate a token with user data
        const token = jwt.sign({ username, email: "test@example.com" }, jwtSecretKey, { expiresIn: "1h" });
        res.json({ token });
    } else {
        res.status(401).json({ message: "Invalid credentials" });
    }
});

// Test protected route
app.get('/customer/auth/test', (req, res) => {
    res.json({
        message: "You have accessed a protected route!",
        user: req.user // The decoded token payload
    });
});

// Port and routes setup
const PORT = 5000;
app.use("/customer", regd_customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
