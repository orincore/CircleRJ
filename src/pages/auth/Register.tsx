import { SignUp } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

function Register() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignUp 
          path="/register" 
          routing="path" 
          forceRedirectUrl="/home" 
        />
        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
