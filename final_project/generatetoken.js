const jwt = require('jsonwebtoken');

// Replace with your secret key
const secretKey = "my_secure_random_secret_key";

// Replace with your user data (payload)
const userPayload = {
    username: "test_user", // Example username
    email: "test@example.com" // Example email
};

// Try to generate a token
try {
    // Generate a token with a 1-hour expiration
    const token = jwt.sign(userPayload, secretKey, { expiresIn: "1h" });

    // Log the token to the console
    console.log("Generated Token:");
    console.log(token);
} catch (err) {
    console.error("Error generating token:", err);
}
