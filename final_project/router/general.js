const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js"); // Import the books database
let isValid = require("./auth_users.js").isValid; // Auth validation 
let users = require("./auth_users.js").users; // Auth users 
const public_users = express.Router();


// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body; // Extract username and password from the request body

  // Check if both username and password are provided
  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the username already exists
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
  }

  // Register the new user
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered" });
});


// Get the list of books available in the shop (Task 10 with async/await)
public_users.get('/', async (req, res) => {
  try {
      // Simulating a database fetch (you can replace this with books directly)
      const response = await new Promise((resolve) => resolve({ data: books }));
      return res.status(200).json(response.data);
  } catch (error) {
      console.error("Error fetching books:", error.message);
      return res.status(500).json({ message: "Failed to fetch books." });
  }
});

public_users.get('/isbn/:isbn', async (req, res) => {
  try {
      const isbn = req.params.isbn;

      // Simulating a database fetch
      const response = await new Promise((resolve, reject) => {
          if (books[isbn]) {
              resolve({ data: books[isbn] });
          } else {
              reject(new Error("Book not found"));
          }
      });

      return res.status(200).json(response.data);
  } catch (error) {
      console.error("Error fetching book by ISBN:", error.message);
      return res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on Author (Task 12)
public_users.get('/author/:author', async (req, res) => {
  try {
      const author = req.params.author;

      // Simulating a database fetch
      const response = await new Promise((resolve, reject) => {
          const booksByAuthor = Object.values(books).filter(book => book.author === author);
          if (booksByAuthor.length > 0) {
              resolve({ data: booksByAuthor });
          } else {
              reject(new Error("No books found for this author"));
          }
      });

      return res.status(200).json(response.data);
  } catch (error) {
      console.error("Error fetching books by author:", error.message);
      return res.status(404).json({ message: "No books found for this author" });
  }
});


// Get book details based on Title (Task 13)
public_users.get('/title/:title', async (req, res) => {
  try {
      const title = req.params.title;

      // Simulating a database fetch
      const response = await new Promise((resolve, reject) => {
          const booksByTitle = Object.values(books).filter(book => book.title === title);
          if (booksByTitle.length > 0) {
              resolve({ data: booksByTitle });
          } else {
              reject(new Error("No books found with this title"));
          }
      });

      return res.status(200).json(response.data);
  } catch (error) {
      console.error("Error fetching books by title:", error.message);
      return res.status(404).json({ message: "No books found with this title" });
  }
});


// Get book review (Task 5)
public_users.get('/review/:isbn', function (req, res) {
  // Retrieve the ISBN from the request parameters
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.status(200).json(books[isbn].reviews); // Return reviews for the book
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
