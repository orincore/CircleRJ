// src/components/AuthWrapper.tsx
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/lib/SupabaseClient";
import { Navigate } from "react-router-dom";

function AuthWrapper({ children }: { children: JSX.Element }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
        if (error || !data) {
          setHasProfile(false);
        } else {
          setHasProfile(true);
        }
      };
      fetchProfile();
    }
  }, [isLoaded, user]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  // If user is signed in but has not completed profile, redirect them
  if (isSignedIn && hasProfile === false) {
    return <Navigate to="/profile-setup" replace />;
  }

  return children;
}

export default AuthWrapper;
