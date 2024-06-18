import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Book from "../models/Book.js";
import Review from "../models/Review.js";
import { uploadImage } from "../middlewares/uploadMiddleware.js";

// @desc    Get all books
// @route   GET /api/books
// @access  Public
export const getBooks = asyncHandler(async (req, res) => {
  try {
    const books = await Book.find({})
      .populate({
        path: "reviews",
      })
      .populate("user", "name profileImage");
    if (books.length > 0) {
      res.status(200).json({ message: "Books found", books });
    } else {
      res.status(404).json({ message: "No books found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Get a book by ID
// @route   GET /api/books/:id
// @access  Public
export const getBookById = asyncHandler(async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate([
      { path: "reviews" },
    ]);

    if (book) {
      let count = book.viewCount;
      count = count + 1;
      book.viewCount = count;
      await book.save();
      res.status(200).json({ message: "Book found", book });
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Get all books by a user
// @route   GET /api/books/myBooks
// @access  Private
export const getUserBooks = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).populate("books");
    res.status(200).json(user.books);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to fetch user's books", message: error.message });
  }
};

// @desc    Add a new book
// @route   POST /api/books
// @access  Private
export const addBook = asyncHandler(async (req, res) => {
  const { title, author, description, category } = req.body;

  if (!title || !author || !description) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }

  try {
    const book = new Book({
      title,
      author,
      description,
      category,
      user: req.userId,
    });

    if (req.file) {
      // Uploading the cover image to AWS S3
      await uploadImage(req.file, "cover-images", book._id);

      // Setting the cover image URL in the book model
      book.coverImage = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/cover-images/${book._id}/${req.file.originalname}`;
    }

    const createdBook = await book.save();
    res.status(201).json(createdBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private
export const updateBook = asyncHandler(async (req, res) => {
  const { title, author, description } = req.body;

  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      book.title = title || book.title;
      book.author = author || book.author;
      book.description = description || book.description;

      if (req.file) {
        // Upload the cover image to AWS S3
        await uploadCoverImage(req.file, book._id);

        // Set the cover image URL in the book model
        book.coverImage = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${req.file.originalname}`;
      }

      const updatedBook = await book.save();
      res.status(201).json({ message: "Book updated", book: updatedBook });
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private
export const deleteBook = asyncHandler(async (req, res) => {
  try {
    const bookId = await Book.findById(req.params.id);

    if (!bookId) {
      return res.status(404).json({ message: "Book not found" });
    }

    const book = await Book.findByIdAndDelete(bookId);
    const books = await Book.find({ books: book.books });
    return res.status(200).json({ message: "Book deleted", books });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete book", error: error.message });
  }
});

// @desc    Get reviews for a book
// @route   GET /api/books/:bookId/reviews
// @access  Public
export const getReviews = asyncHandler(async (req, res) => {
  try {
    const bookId = req.params.bookId;
    if (!bookId) {
      return res.status(400).json({ message: "Book ID not received!" });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book Not Found!" });
    }

    const reviews = await Book.findById(bookId).populate([
      { path: "reviews", populate: { path: "user" } },
    ]);
    return res.status(200).json({ message: "Reviews sent", reviews });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @desc    Add a review to a book
// @route   POST /api/books/:id/reviews
// @access  Private
export const addReview = asyncHandler(async (req, res) => {
  const { comment, rating } = req.body;

  if (!comment || !rating) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }

  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      const userId = req.userId;

      const newReview = await Review.create({
        comment,
        rating,
        user: userId,
        book: req.params.id,
      });
      const book = await Book.findById(req.params.id).populate([
        { path: "reviews", populate: { path: "user" } },
      ]);
      return res.status(200).json({
        message: "Review created",
        review: newReview,
        reviews: book.reviews,
      });
    }

    return res.status(404).json({ message: "Book not found" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
});

// @desc    Update a book review
// @route   PUT /api/books/:id/reviews/:reviewId
// @access  Private
export const updateReview = asyncHandler(async (req, res) => {
  const { comment, rating } = req.body;

  try {
    const review = await Review.findById(req.params.reviewId);

    if (review) {
      review.comment = comment;
      review.rating = rating;

      await review.save();
      res.status(200).json({ message: "Review updated", review });
    } else {
      res.status(404).json({ message: "Review not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a book review
// @route   DELETE /api/books/:id/reviews/:reviewId
// @access  Private
export const deleteReview = asyncHandler(async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const reviewId = req.params.reviewId;
    await Review.findByIdAndDelete(reviewId);

    res.status(201).json({ message: "Review removed" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete review", error: error.message });
  }
});
