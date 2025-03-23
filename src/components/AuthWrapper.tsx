// src/components/AuthWrapper.tsx
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/lib/SupabaseClient";
import { Navigate } from "react-router-dom";

function AuthWrapper({ children }: { children: JSX.Element }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const checkProfile = async () => {
        try {
          console.log("Checking profile after login...");

          // Fetch the user's profile from Supabase
          const { data, error } = await supabase
            .from("user_profiles")
            .select("gender, interests")
            .eq("user_id", user.id)
            .single();

          if (error || !data) {
            console.log("Profile not found or error fetching profile:", error);
            setProfileComplete(false); // Redirect to profile setup
            return;
          }

          // Check if required fields are present
          const hasRequiredFields = data.gender && data.interests?.length > 0;
          console.log("Profile data:", data);
          console.log("Has required fields:", hasRequiredFields);

          setProfileComplete(hasRequiredFields);
        } catch (err) {
          console.error("Error checking profile:", err);
          setProfileComplete(false); // Redirect to profile setup on error
        }
      };

      // Run the profile check after every login
      checkProfile();
    } else if (isLoaded && !isSignedIn) {
      // If the user is not signed in, set profileComplete to true
      // to avoid being stuck on the loading screen
      setProfileComplete(true);
    }
  }, [isLoaded, isSignedIn, user]); // Re-run when auth state changes

  // Show loading state while checking profile
  if (!isLoaded || profileComplete === null) {
    return <div>Loading...</div>;
  }

  // Redirect to profile setup if profile is incomplete
  if (isSignedIn && !profileComplete) {
    console.log("Redirecting to profile setup...");
    return <Navigate to="/profile-setup" replace />;
  }

  // Render children if profile is complete or user is signed out
  return children;
}

export default AuthWrapper;
