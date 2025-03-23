import { SignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignIn path="/login" routing="path" afterSignInUrl="/home" />
        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-primary-600 hover:text-primary-500 font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
