import React from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Grid,
  Bookmark,
  Users,
  Edit,
  LogOut,
  ChevronLeft,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { useUser, useClerk, UserProfile } from "@clerk/clerk-react";
import { supabase } from "../lib/SupabaseClient";

// Data for custom interests editing
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

const tabs = [
  { id: "posts", icon: Grid, label: "Posts" },
  { id: "saved", icon: Bookmark, label: "Saved" },
  { id: "tagged", icon: Users, label: "Tagged" },
];

interface ExtendedProfile {
  interests?: string;
  location?: string;
  preference?: string;
  age?: number;
  gender?: string;
  bio?: string;
  website?: string;
  date_of_birth?: string;
}

export function Profile() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editTab, setEditTab] = useState<"personal" | "custom">("personal");
  const [extendedProfile, setExtendedProfile] = useState<ExtendedProfile>({});
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [editBio, setEditBio] = useState("");
  const [editError, setEditError] = useState("");
  const [preference, setPreference] = useState<"Dating" | "Friendship">("Dating");

  const avatarUrl =
    user?.profileImageUrl || user?.imageUrl || "https://via.placeholder.com/80";

  // Fetch extended profile from Supabase
  useEffect(() => {
    async function fetchExtendedProfile() {
      if (user?.id) {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
        if (!error && data) {
          setExtendedProfile(data);
          if (data.preference) {
            setPreference(data.preference as "Dating" | "Friendship");
          }
        }
        setLoadingProfile(false);
      }
    }
    fetchExtendedProfile();
  }, [user]);

  // Pre-populate custom edit fields
  useEffect(() => {
    if (extendedProfile.interests) {
      setEditInterests(
        extendedProfile.interests.split(", ").filter((s) => s)
      );
    }
    if (extendedProfile.bio) {
      setEditBio(extendedProfile.bio);
    }
  }, [extendedProfile]);

  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <div>Please sign in to view your profile.</div>;

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      signOut();
    }
  };

  const interestsArray = extendedProfile.interests
    ? extendedProfile.interests.split(", ").filter((s) => s)
    : [];

  const togglePreference = async () => {
    const newPreference = preference === "Dating" ? "Friendship" : "Dating";
    setPreference(newPreference);
    if (user?.id) {
      const { error } = await supabase
        .from("user_profiles")
        .update({ preference: newPreference })
        .eq("user_id", user.id);
      if (error) {
        console.error("Error updating preference:", error);
        setPreference(preference);
      }
    }
  };

  const toggleEditInterest = (interest: string) => {
    setEditInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const renderEditInterests = () => {
    return interestsData.map((item) => (
      <div key={item.category} className="mb-4">
        <h3 className="font-semibold text-xl mb-2">{item.category}</h3>
        <div className="flex flex-wrap gap-2">
          {item.subcategories.map((sub, idx) => {
            const interestKey = `${item.category}: ${sub}`;
            const isSelected = editInterests.includes(interestKey);
            return (
              <motion.button
                key={idx}
                type="button"
                onClick={() => toggleEditInterest(interestKey)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className={`px-4 py-2 rounded-full text-sm border ${
                  isSelected
                    ? "bg-purple-600 text-white border-purple-600"
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editInterests.length < 3) {
      setEditError("Please select at least 3 interests.");
      return;
    }
    const { error } = await supabase
      .from("user_profiles")
      .update({
        interests: editInterests.join(", "),
        bio: editBio,
      })
      .eq("user_id", user.id);
    if (error) {
      setEditError(error.message);
    } else {
      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) setExtendedProfile(data);
      setIsEditingProfile(false);
    }
  };

  return (
    <div className="pb-16 bg-gray-50 min-h-screen">
      {/* Header & Profile Info */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              @{user.username || "User"}
            </h1>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
  <Button
    variant="outline"
    onClick={handleEditProfile}
    className="border-purple-600 text-purple-600 hover:bg-purple-50 px-4 py-2 text-sm md:text-base"
  >
    Edit Profile
  </Button>
  <Button
    variant="outline"
    onClick={handleSignOut}
    className="border-gray-300 hover:bg-gray-50 text-red-500 px-4 py-2 text-sm md:text-base"
  >
    Logout
  </Button>
  <button className="p-2 hover:bg-gray-100 rounded-full text-purple-600">
    <Settings className="w-5 h-5 md:w-6 md:h-6" />
  </button>
</div>

          </div>

          <div className="flex items-center gap-6">
            <img
              src={avatarUrl}
              alt={user.fullName || "User Avatar"}
              className="w-24 h-24 rounded-full object-cover border-4 border-purple-100 shadow-lg"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {user.fullName || "No Name Provided"}
              </h2>
              <p className="text-gray-600 mt-2">
                {extendedProfile.bio || "No bio provided."}
              </p>
              {extendedProfile.website && (
                <a
                  href={extendedProfile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700 font-medium mt-2 inline-block"
                >
                  {extendedProfile.website}
                </a>
              )}
            </div>
          </div>

          {/* Additional Info & Preference Toggle */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="font-bold text-xl text-purple-600">
                    {extendedProfile.age || "-"}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">Age</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="font-bold text-xl text-purple-600">
                    {extendedProfile.location || "-"}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">Location</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="font-bold text-xl text-purple-600">
                    {extendedProfile.gender || "-"}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">Gender</div>
                </div>
              </div>

              {/* Preference Toggle */}
<div className="mt-4 flex justify-center items-center gap-4">
  <span className="text-gray-700 font-medium">Looking for:</span>
  <button
    onClick={togglePreference}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
      preference === "Dating" ? "bg-red-500" : "bg-purple-200"
    }`}
  >
    <span
      className={`${
        preference === "Dating" ? "translate-x-6" : "translate-x-1"
      } inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200`}
    />
  </button>
  <span
    className={`font-semibold ${
      preference === "Dating" ? "text-red-500" : "text-purple-600"
    }`}
  >
    {preference}
  </span>
</div>


              {/* Interests */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {interestsArray.length > 0 ? (
                    interestsArray.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No interests selected</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto flex border-t border-gray-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className="flex-1 py-4 text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors relative group"
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-transparent group-hover:bg-purple-50 transition-colors">
                  {tab.id === "posts" && (
                    <motion.div
                      className="h-full bg-purple-600"
                      layoutId="activeTab"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Posts */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={`https://source.unsplash.com/random/800x800/?sig=${index}`}
                alt=""
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={editTab === "personal" ? "primary" : "outline"}
                  onClick={() => setEditTab("personal")}
                  className="px-4 py-2 text-sm"
                >
                  Personal Details
                </Button>
                <Button
                  variant={editTab === "custom" ? "primary" : "outline"}
                  onClick={() => setEditTab("custom")}
                  className="px-4 py-2 text-sm"
                >
                  Interests & Bio
                </Button>
              </div>
            </div>

            <div className="p-6">
              {editTab === "personal" ? (
                <UserProfile
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "shadow-none border-none w-full",
                      formButtonPrimary: "bg-purple-600 hover:bg-purple-700",
                      headerTitle: "text-2xl font-bold",
                      formFieldLabel: "text-gray-700 font-medium",
                      formFieldInput:
                        "border-gray-300 focus:border-purple-500 focus:ring-purple-500",
                    },
                  }}
                />
              ) : (
                <form onSubmit={handleEditSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Select Interests
                    </h3>
                    <div className="grid gap-4">
                      {interestsData.map((item) => (
                        <div key={item.category} className="space-y-2">
                          <h4 className="font-medium text-gray-700">
                            {item.category}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {item.subcategories.map((sub) => {
                              const interestKey = `${item.category}: ${sub}`;
                              const isSelected = editInterests.includes(interestKey);
                              return (
                                <button
                                  key={interestKey}
                                  type="button"
                                  onClick={() => toggleEditInterest(interestKey)}
                                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                    isSelected
                                      ? "bg-purple-600 text-white"
                                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                  }`}
                                >
                                  {sub}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  {editError && (
                    <p className="text-red-600 text-sm">{editError}</p>
                  )}

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditingProfile(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                      Save Changes
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default Profile;