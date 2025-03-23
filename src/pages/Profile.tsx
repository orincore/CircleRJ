import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings, Grid, Bookmark, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser, useClerk, UserProfile } from "@clerk/clerk-react";
import { supabase } from "@/lib/SupabaseClient";

// Define interestsData for custom interests editing
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
  // editTab toggles between "personal" and "custom" (for interests & bio)
  const [editTab, setEditTab] = useState<"personal" | "custom">("personal");
  const [extendedProfile, setExtendedProfile] = useState<ExtendedProfile>({});
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Custom edit state for interests and bio
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [editBio, setEditBio] = useState("");
  const [editError, setEditError] = useState("");

  // Determine avatar URL using available properties with fallback.
  const avatarUrl =
    user.profileImageUrl || user.imageUrl || "https://via.placeholder.com/80";

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
        }
        setLoadingProfile(false);
      }
    }
    fetchExtendedProfile();
  }, [user]);

  // Pre-populate custom edit fields when extended profile loads
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

  // Parse interests string into an array for display as chips in main view
  const interestsArray = extendedProfile.interests
    ? extendedProfile.interests.split(", ").filter((s) => s)
    : [];

  // Toggle an interest selection in the custom edit modal
  const toggleEditInterest = (interest: string) => {
    setEditInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  // Render interests in the custom edit modal
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
                    ? "bg-gray-600 text-white border-gray-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                } font-sans`}
              >
                {sub}
              </motion.button>
            );
          })}
        </div>
      </div>
    ));
  };

  // Handler for submitting custom edits (interests and bio)
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
    <div className="pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">@{user.username || "User"}</h1>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleEditProfile}>
                Edit Profile
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                Logout
              </Button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <img
              src={avatarUrl}
              alt={user.fullName || "User Avatar"}
              className="w-24 h-24 rounded-full object-cover border-2 border-primary-500"
            />
            <div>
              <h2 className="text-2xl font-semibold">
                {user.fullName || "No Name Provided"}
              </h2>
              <p className="text-gray-600 mt-1">
                {extendedProfile.bio || "No bio provided."}
              </p>
              {extendedProfile.website && (
                <a
                  href={extendedProfile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline mt-1 block"
                >
                  {extendedProfile.website}
                </a>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 border-t pt-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-around">
                <div className="text-center">
                  <div className="font-bold text-xl">
                    {extendedProfile.age ? extendedProfile.age : "-"}
                  </div>
                  <div className="text-gray-500 text-sm">Age</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl">
                    {extendedProfile.location || "-"}
                  </div>
                  <div className="text-gray-500 text-sm">Location</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl">
                    {extendedProfile.gender || "-"}
                  </div>
                  <div className="text-gray-500 text-sm">Gender</div>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Interests
                </h3>
                {extendedProfile.interests ? (
                  <div className="flex flex-wrap gap-2">
                    {extendedProfile.interests.split(", ").map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-sans"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">-</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className="flex-1 py-4 text-sm font-medium text-gray-500 hover:text-primary-500 focus:outline-none"
              >
                <div className="flex items-center justify-center gap-1">
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Posts */}
      <div className="grid grid-cols-3 gap-1 p-4">
        {Array.from({ length: 9 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="aspect-square bg-gray-100"
          >
            <img
              src={`https://images.unsplash.com/photo-${1682687220742 + index}-aba13b6e50ba`}
              alt=""
              className="w-full h-full object-cover"
            />
          </motion.div>
        ))}
      </div>

      {/* Full-Screen Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white w-full h-full p-8 overflow-y-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Edit Profile</h2>
              <div className="flex gap-4 mt-4 md:mt-0">
                <Button
                  variant={editTab === "personal" ? "primary" : "outline"}
                  onClick={() => setEditTab("personal")}
                >
                  Personal Details
                </Button>
                <Button
                  variant={editTab === "custom" ? "primary" : "outline"}
                  onClick={() => setEditTab("custom")}
                >
                  Interests & Bio
                </Button>
                <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                  Close
                </Button>
              </div>
            </div>
            {editTab === "personal" ? (
              // Render Clerk's UserProfile for updating personal details
              <UserProfile
                appearance={{
                  elements: {
                    rootBox: { style: { maxWidth: "100%" } },
                  },
                }}
              />
            ) : (
              // Render custom form for updating interests and bio
              <form onSubmit={handleEditSubmit} className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Update Interests
                  </h3>
                  <div className="grid grid-cols-1 gap-4">{renderEditInterests()}</div>
                </div>
                <div>
                  <label className="block text-xl font-medium text-gray-700 mb-4">
                    Bio
                  </label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
                    rows={5}
                    placeholder="Update your bio..."
                  />
                </div>
                {editError && <p className="text-red-500 text-lg">{editError}</p>}
                <Button type="submit" className="w-full py-4 text-2xl">
                  Save Changes
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
