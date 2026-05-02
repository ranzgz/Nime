import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Chat from './components/Chat';
import LoadingScreen from './components/LoadingScreen';

const Welcome = lazy(() => import('./pages/Welcome'));
const Home = lazy(() => import('./pages/Home'));
const Explore = lazy(() => import('./pages/Explore'));
const Ongoing = lazy(() => import('./pages/Ongoing'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Watch = lazy(() => import('./pages/Watch'));
const History = lazy(() => import('./pages/History'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <LoadingScreen />;

  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/history" element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/ongoing" element={<Ongoing />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/anime/:slug/:episode?" element={<Watch />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Suspense>
      
      {/* Floating Chat Button */}
      <div 
        className={`fixed bottom-24 right-4 z-[900] w-12 h-12 bg-[#F6CF80] rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all duration-300 ${isChatOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:scale-110'}`}
        onClick={() => setIsChatOpen(true)}
      >
        <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
      </div>

      {/* Floating Chat Popup */}
      <Chat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </Router>
  );
}