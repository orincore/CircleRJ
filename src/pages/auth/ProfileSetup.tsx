
import React, { useEffect, useState } from "react"
import { supabase } from "../../lib/SupabaseClient"
import { useUser } from "@clerk/clerk-react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/Button"
import { motion } from "framer-motion"
import { ChevronRight, Check } from "lucide-react"

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
]

const genders = ["Male", "Female", "Other", "Prefer not to say"]
const preferences = ["Dating", "Friendship"]

function ProfileSetup() {
  const { user, isLoaded } = useUser()
  const navigate = useNavigate()

  // Multi-step form state
  const [step, setStep] = useState(1)
  const totalSteps = 4

  // Form states
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [dob, setDob] = useState("")
  const [gender, setGender] = useState("")
  const [preference, setPreference] = useState("")
  const [location, setLocation] = useState("")
  const [bio, setBio] = useState("")
  const [website, setWebsite] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasUser, setHasUser] = useState(false)

  useEffect(() => {
    setHasUser(!!user?.id)
  }, [user])

  useEffect(() => {
    if (hasUser) {
      const syncClerkData = async () => {
        const clerkData = {
          first_name: user.firstName,
          last_name: user.lastName,
          username: user.username,
          email: user.emailAddresses?.[0]?.emailAddress,
        }
        const { error } = await supabase
          .from("user_profiles")
          .upsert({ user_id: user.id, ...clerkData }, { onConflict: "user_id" })
        if (error) {
          console.error("Error syncing clerk data:", error.message)
        }
      }
      syncClerkData()
    }
  }, [hasUser, user])

  if (!isLoaded)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )

  // Toggle an interest selection (formatted as "Category: Subcategory")
  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]))
  }

  // Render interests for the current category
  const renderInterests = (categoryIndex: number) => {
    const item = interestsData[categoryIndex]
    return (
      <div key={item.category} className="mb-6">
        <h3 className="font-semibold text-xl mb-3 text-gray-900 dark:text-gray-100">{item.category}</h3>
        <div className="flex flex-wrap gap-2">
          {item.subcategories.map((sub, index) => {
            const interestKey = `${item.category}: ${sub}`
            const isSelected = selectedInterests.includes(interestKey)
            return (
              <motion.button
                key={index}
                type="button"
                onClick={() => toggleInterest(interestKey)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`px-4 py-2 rounded-full text-sm ${
                  isSelected
                    ? "bg-primary-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {sub}
              </motion.button>
            )
          })}
        </div>
      </div>
    )
  }

  // Helper: Calculate age from date string (YYYY-MM-DD)
  const calculateAge = (dateString: string) => {
    const dobDate = new Date(dateString)
    const diffMs = Date.now() - dobDate.getTime()
    const ageDt = new Date(diffMs)
    return Math.abs(ageDt.getUTCFullYear() - 1970)
  }

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError("")

    if (selectedInterests.length < 3) {
      setError("Please select at least 3 interests.")
      setIsSubmitting(false)
      return
    }
    if (!dob || !gender || !preference || !location) {
      setError("Please fill out all required fields.")
      setIsSubmitting(false)
      return
    }

    try {
      // Prepare profile data (including Clerk data)
      const profileData = {
        user_id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        username: user.username,
        email: user.emailAddresses?.[0]?.emailAddress,
        interests: selectedInterests.join(", "),
        location,
        preference,
        age: calculateAge(dob),
        gender,
        bio,
        website,
        date_of_birth: dob,
      }

      // Upsert profile data into Supabase (updates if exists)
      const { error: supabaseError } = await supabase
        .from("user_profiles")
        .upsert(profileData, { onConflict: "user_id" })

      if (supabaseError) {
        setError(supabaseError.message)
        setIsSubmitting(false)
      } else {
        navigate("/home")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  // Next step handler
  const handleNextStep = () => {
    if (step === 1 && selectedInterests.length < 3) {
      setError("Please select at least 3 interests.")
      return
    }

    if (step === 2 && (!dob || !gender)) {
      setError("Please fill out all required fields.")
      return
    }

    if (step === 3 && (!location || !preference)) {
      setError("Please fill out all required fields.")
      return
    }

    if (step === totalSteps) {
      handleSubmit()
      return
    }

    setError("")
    setStep((prev) => prev + 1)
  }

  // Previous step handler
  const handlePrevStep = () => {
    setError("")
    setStep((prev) => Math.max(1, prev - 1))
  }

  // Render progress indicator
  const renderProgress = () => {
    return (
      <div className="flex items-center justify-between mb-8 px-4">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step > index + 1
                  ? "bg-primary-500 text-white"
                  : step === index + 1
                    ? "bg-primary-100 dark:bg-primary-900/30 text-primary-500 border-2 border-primary-500"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600"
              }`}
            >
              {step > index + 1 ? <Check className="w-4 h-4" /> : index + 1}
            </div>
            {index < totalSteps - 1 && (
              <div
                className={`flex-1 h-1 ${step > index + 1 ? "bg-primary-500" : "bg-gray-200 dark:bg-gray-700"}`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-md mx-auto p-4">
        <div className="py-6">
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-center text-gray-500 dark:text-gray-400">Tell us about yourself to get started</p>
        </div>

        {renderProgress()}

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Select Your Interests</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Choose at least 3 interests to help us match you with like-minded people
              </p>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {renderInterests(0)}
                {renderInterests(1)}
                {renderInterests(2)}
                {renderInterests(3)}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">About You</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Location & Preferences</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder="City, Country"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Looking for <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="preference"
                    value={preference}
                    onChange={(e) => setPreference(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Final Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    placeholder="Tell something interesting about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    name="website"
                    placeholder="https://yourwebsite.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <div className="mt-6 flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={handlePrevStep} className="rounded-full">
              Back
            </Button>
          ) : (
            <div></div>
          )}

          <Button onClick={handleNextStep} className="rounded-full flex items-center" disabled={isSubmitting}>
            {step === totalSteps ? (
              isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                "Complete"
              )
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProfileSetup

