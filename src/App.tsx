// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Welcome } from "./pages/auth/Welcome";
import { Login } from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProfileSetup from "./pages/auth/ProfileSetup";
import { Home } from "./pages/Home";
import { Explore } from "./pages/Explore";
import { Create } from "./pages/Create";
import Messages from "./pages/Messages";
import { Profile } from "./pages/Profile";
import { Layout } from "./components/Layout";
import AuthWrapper from "./components/AuthWrapper";
import { ChatProvider } from "@/components/chat/ChatProvider"; // Import ChatProvider

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />

        {/* Root route: if signed in, go to home; else, welcome page */}
        <Route
          path="/"
          element={
            <>
              <SignedIn>
                <Navigate to="/home" replace />
              </SignedIn>
              <SignedOut>
                <Welcome />
              </SignedOut>
            </>
          }
        />

        {/* Protected routes: wrapped in SignedIn and AuthWrapper */}
        <Route
          element={
            <SignedIn>
              <AuthWrapper>
                <ChatProvider> {/* Wrap Layout with ChatProvider */}
                  <Layout />
                </ChatProvider>
              </AuthWrapper>
            </SignedIn>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/create" element={<Create />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Fallback: redirect signed-out users to sign in */}
        <Route
          path="*"
          element={
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;