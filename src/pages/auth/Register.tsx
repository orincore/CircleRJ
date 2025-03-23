import React from "react"
import { SignUp } from "@clerk/clerk-react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"

function Register() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <div className="p-4">
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span>Back</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col items-center justify-center p-6"
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary-400 to-primary-600 mx-auto flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Join Circle and connect with others</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <SignUp
              path="/register"
              routing="path"
              forceRedirectUrl="/home"
              appearance={{
                elements: {
                  rootBox: {
                    boxShadow: "none",
                    width: "100%",
                  },
                  card: {
                    boxShadow: "none",
                    border: "none",
                    borderRadius: "0",
                  },
                  headerTitle: {
                    display: "none",
                  },
                  headerSubtitle: {
                    display: "none",
                  },
                  socialButtonsBlockButton: {
                    borderRadius: "9999px",
                    textTransform: "none",
                    fontWeight: "500",
                  },
                  formButtonPrimary: {
                    backgroundColor: "rgb(106, 13, 173)",
                    borderRadius: "9999px",
                    textTransform: "none",
                    fontWeight: "500",
                    "&:hover": {
                      backgroundColor: "rgb(88, 11, 145)",
                    },
                  },
                  formFieldInput: {
                    borderRadius: "0.5rem",
                  },
                  footerActionLink: {
                    color: "rgb(106, 13, 173)",
                    "&:hover": {
                      color: "rgb(88, 11, 145)",
                    },
                  },
                },
              }}
            />
          </div>

          <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Register

