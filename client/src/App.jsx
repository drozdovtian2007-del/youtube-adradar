import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Cursor from './components/Cursor';
import { ToastProvider } from './components/Toast';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';

export default function App() {
  return (
    <ToastProvider>
    <BrowserRouter>
      <Cursor />
      <div className="blobs" aria-hidden="true">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
      </div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
      </Routes>
      <footer className="text-center py-6 text-white/30 text-sm">
        Created by{' '}
        <a
          href="http://horshevsky.site/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:text-purple-300 transition-colors underline underline-offset-2"
        >
          horshevsky
        </a>
      </footer>
    </BrowserRouter>
    </ToastProvider>
  );
}
