// src/pages/auth/ProfileSetup.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/SupabaseClient";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// Expanded interests data with more categories
const interestsData = [
  {
    category: "Music",
    subcategories: ["Rock", "Pop", "Jazz", "Classical", "Hip-Hop", "EDM"],
  },
  {
    category: "Sports",
    subcategories: ["Football", "Basketball", "Tennis", "Cricket", "Baseball", "Running"],
  },
  {
    category: "Technology",
    subcategories: ["Programming", "Gadgets", "AI", "Gaming", "Robotics", "Blockchain"],
  },
  {
    category: "Art",
    subcategories: ["Painting", "Sculpture", "Photography", "Design", "Street Art", "Digital Art"],
  },
  {
    category: "Travel",
    subcategories: ["Adventure", "Cultural", "Luxury", "Budget", "Nature", "Road Trips"],
  },
  {
    category: "Food",
    subcategories: ["Cooking", "Baking", "Street Food", "Fine Dining", "Vegan", "Fusion"],
  },
  {
    category: "Movies",
    subcategories: ["Action", "Comedy", "Drama", "Sci-Fi", "Horror", "Documentary"],
  },
  {
    category: "Books",
    subcategories: ["Fiction", "Non-Fiction", "Mystery", "Fantasy", "Biography", "Self-Help"],
  },
];

const genders = ["Male", "Female", "Other", "Prefer not to say"];
const preferences = ["Dating", "Friendship"];

function ProfileSetup() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  // Form states
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [preference, setPreference] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");

  if (!isLoaded) return <div>Loading...</div>;

  // Automatically sync Clerk data to Supabase whenever user data changes
  useEffect(() => {
    if (user?.id) {
      const syncClerkData = async () => {
        const clerkData = {
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          email: user.email_addresses?.[0]?.email_address,
        };
        const { error } = await supabase
          .from("user_profiles")
          .upsert({ user_id: user.id, ...clerkData }, { onConflict: "user_id" });
        if (error) {
          console.error("Error syncing clerk data:", error.message);
        }
      };
      syncClerkData();
    }
  }, [user]);

  // Toggle an interest selection (formatted as "Category: Subcategory")
  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  // Render interests flatlist
  const renderInterests = () => {
    return interestsData.map((item) => (
      <div key={item.category} className="mb-6">
        <h3 className="font-semibold text-xl mb-2">{item.category}</h3>
        <div className="flex flex-wrap gap-2">
          {item.subcategories.map((sub, index) => {
            const interestKey = `${item.category}: ${sub}`;
            const isSelected = selectedInterests.includes(interestKey);
            return (
              <motion.button
                key={index}
                type="button"
                onClick={() => toggleInterest(interestKey)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`px-4 py-2 rounded-full text-sm border ${
                  isSelected
                    ? "bg-primary-500 text-white border-primary-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {sub}
              </motion.button>
            );
          })}
        </div>
      </div>
    ));
  };

  // Helper: Calculate age from date string (YYYY-MM-DD)
  const calculateAge = (dateString: string) => {
    const dobDate = new Date(dateString);
    const diffMs = Date.now() - dobDate.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInterests.length < 3) {
      setError("Please select at least 3 interests.");
      return;
    }
    if (!dob || !gender || !preference || !location) {
      setError("Please fill out all required fields.");
      return;
    }

    // Prepare profile data (including Clerk data)
    const profileData = {
      user_id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      email: user.email_addresses?.[0]?.email_address,
      interests: selectedInterests.join(", "),
      location,
      preference,
      age: calculateAge(dob),
      gender,
      bio,
      website,
      date_of_birth: dob,
    };

    // Upsert profile data into Supabase (updates if exists)
    const { error: supabaseError } = await supabase
      .from("user_profiles")
      .upsert(profileData, { onConflict: "user_id" });
    if (supabaseError) {
      setError(supabaseError.message);
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-3xl"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Complete Your Profile</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Interests Flatlist */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Select Your Interests</h2>
            <p className="text-sm text-gray-600 mb-4">
              Choose at least 3 interests:
            </p>
            <div className="overflow-y-auto max-h-[24rem] pr-2">{renderInterests()}</div>
          </div>

          {/* Other Profile Information */}
          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                placeholder="Enter your location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select gender</option>
                {genders.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Preference
              </label>
              <select
                name="preference"
                value={preference}
                onChange={(e) => setPreference(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select preference</option>
                {preferences.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                placeholder="Tell something interesting about yourself"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Website (Optional)
              </label>
              <input
                type="url"
                name="website"
                placeholder="https://yourwebsite.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
        <div className="mt-8">
          <Button type="submit" className="w-full py-3 text-xl">
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ProfileSetup;
