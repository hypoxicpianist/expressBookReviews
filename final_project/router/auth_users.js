const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const secretKey = "my_secure_secret_key"; // Must match the key in index.js

let users = [
    { username: "test_user", password: "1234" } // Example user for testing
];

// Function to check if a username is valid
const isValid = (username) => {
    return username && typeof username === "string" && username.trim().length > 0;
};

// Function to authenticate a user
const authenticatedUser = (username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    return !!user; // Return true if user exists
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Validate request body
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate a JWT token
        const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });

        // Debug log
        console.log("Login successful for user:", username);
        console.log("Generated Token:", token);

        return res.status(200).json({
            message: "Login successful",
            token: token
        });
    } else {
        return res.status(401).json({ message: "Invalid username or password" });
    }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;

    // Log the Authorization header
    console.log("Authorization Header:", req.headers.authorization);

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Extract and verify the token
    const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token
    if (!token) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        console.log("Decoded Token:", decoded); // Debug log
        const username = decoded.username;

        // Add or update the review for the book
        books[isbn].reviews = books[isbn].reviews || {};
        books[isbn].reviews[username] = review;

        return res.status(200).json({
            message: "Review added/updated successfully",
            reviews: books[isbn].reviews
        });
    } catch (err) {
        console.error("Token Verification Error:", err.message); // Debug log
        return res.status(403).json({ message: "Invalid token." });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  // Extract and verify the token
  const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token
  if (!token) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  try {
      const decoded = jwt.verify(token, secretKey); // Verify token with secret key
      const username = decoded.username;

      // Check if the book exists
      if (!books[isbn]) {
          return res.status(404).json({ message: "Book not found" });
      }

      // Check if the user has a review for the book
      if (books[isbn].reviews && books[isbn].reviews[username]) {
          // Delete the user's review
          delete books[isbn].reviews[username];

          return res.status(200).json({
              message: "Review deleted successfully",
              reviews: books[isbn].reviews // Return updated reviews
          });
      } else {
          return res.status(404).json({ message: "Review not found for this user" });
      }
  } catch (err) {
      console.error("Token Verification Error:", err.message); // Debug log
      return res.status(403).json({ message: "Invalid token." });
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
