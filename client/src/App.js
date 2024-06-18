import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import BookDetail from "./components/books/BookDetail";
import UserProfile from "./components/user/UserProfile";
import NotFoundPage from "./pages/NotFoundPage";
import BookForm from "./components/books/BookForm";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import HomePage from "./pages/HomePage";
import { Toaster } from "react-hot-toast";
import BookUser from "./components/books/BookUser";
import ProtectedRoute from "./pages/ProtectedRoute";

function App() {
  return (
    <>
      <div>
        <Toaster position="top-right"></Toaster>
      </div>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/user" element={<ProtectedRoute />}>
            <Route path="book/new" element={<BookForm />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/book/:bookId" element={<BookDetail />} />
          <Route path="/book/profile/:userId" element={<BookUser />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
      </Router>
    </>
  );
}

export default App;
