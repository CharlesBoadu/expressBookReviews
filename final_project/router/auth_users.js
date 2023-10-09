const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.user.username;

  if (!isbn || !review) {
    return res.status(404).json({ message: "Error posting review" });
  }

  if (isbn in books) {
    // Check if the user has already reviewed the book
    if (books[isbn].reviews.hasOwnProperty(username)) {
      // If the user has already reviewed, update the existing review
      books[isbn].reviews[username] = review;
      return res.status(200).json({ message: `The review for the book with ISBN ${isbn} has been updated` });
    } else {
      // If the user hasn't reviewed, add a new review wtih the username as the key
      books[isbn].reviews[username] = review;
      return res.status(200).json({ message: `The review for the book with ISBN ${isbn} has been added` });
    }
  } else {
    // If the book is not found, return an error
    return res.status(404).json({ message: "Book not found" });
  }
});

//Deleting a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const username = req.session.user.username;

  if (!isbn) {
    return res.status(404).json({ message: "Error deleting review" });
  }
  if (isbn in books) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: `Reviews for the ISBN ${isbn} by the user ${username} has been deleted` });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
