import axios from "axios";
import { BASE_URL } from "../config/url";

export const getAllBooks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/books`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch books");
  }
};

export const getBookReviews = async (bookId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/books/book/${bookId}/reviews`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data.reviews;
  } catch (error) {
    throw new Error("Failed to fetch book reviews");
  }
};
