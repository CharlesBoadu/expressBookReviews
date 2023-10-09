const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");
const session = require("express-session");

public_users.post("/register", (req, res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Username or password missing" });
  }

  if (!req.session) {
    return res.status(500).json({ message: "Session not available" });
  }

  if (username in users) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Store user information in the session
  req.session.user = { username, password };

  users.push({ username: username, password: password });
  return res.status(200).json({ message: "User Registered" });
});

// Get the book list available in the shop using using async-await with Axios
public_users.get("/books", async function (req, res) {
  //Write your code here
  await axios
    .get("http://localhost:5000/")
    .then((response) => {
      return res.send(JSON.stringify(response.data, null, 4));
    })
    .catch((error) => {
      return res.status(404).json({ message: "Book not found" });
    });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  //Write your code here
  return res.send(JSON.stringify(books, null, 4));
});

//Get the book details based on ISBN using async-await with Axios
public_users.get("/books/isbn/:isbn", async function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  await axios
    .get("http://localhost:5000/isbn/" + isbn)
    .then((response) => {
      return res.send(JSON.stringify(response.data, null, 4));
    })
    .catch((error) => {
      return res.status(404).json({ message: "Book not found" });
    });
});

//Get the book details based on ISBN using Promises
public_users.get("/books/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  const bookDetailsPromise = new Promise((resolve, reject) => {
    axios.get("http://localhost:5000/isbn/" + isbn)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });

  bookDetailsPromise
    .then((data) => {
      return res.send(JSON.stringify(data, null, 4));
    })
    .catch((error) => {
      return res.status(404).json({ message: "Book not found" });
    });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  if (isbn in books) {
    return res.send(JSON.stringify(books[isbn], null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

//Get book details based on author using async-await with Axios
public_users.get("/books/author/:author", async function (req, res) {
  //Write your code here
  const author = req.params.author;
  await axios
    .get("http://localhost:5000/author/" + author)
    .then((response) => {
      return res.send(JSON.stringify(response.data, null, 4));
    })
    .catch((error) => {
      return res.status(404).json({ message: "Book not found" });
    });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  //Write your code here
  const author = req.params.author;
  let booksByAuthor = {};
  for (let isbn in books) {
    if (books[isbn].author == author) {
      booksByAuthor[isbn] = books[isbn];
    }
  }
  if (Object.keys(booksByAuthor).length > 0) {
    return res.send(JSON.stringify(booksByAuthor, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

//Get all books based on title using async-await with Axios
public_users.get("/books/title/:title", async function (req, res) {
  //Write your code here
  const title = req.params.title;
  await axios
    .get("http://localhost:5000/title/" + title)
    .then((response) => {
      return res.send(JSON.stringify(response.data, null, 4));
    })
    .catch((error) => {
      return res.status(404).json({ message: "Book not found" });
    });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  //Write your code here
  const title = req.params.title;
  let booksByTitle = {};
  for (let isbn in books) {
    if (books[isbn].title == title) {
      booksByTitle[isbn] = books[isbn];
    }
  }
  if (Object.keys(booksByTitle).length > 0) {
    return res.send(JSON.stringify(booksByTitle, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  if (isbn in books) {
    return res.send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
