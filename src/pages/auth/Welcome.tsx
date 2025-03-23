import { motion } from 'framer-motion';
import { CircleIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-100 to-white flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="flex items-center justify-center mb-8">
          <CircleIcon className="w-16 h-16 text-primary-500" />
        </div>
        <h1 className="text-4xl font-bold text-primary-900 mb-4">Welcome to Circle</h1>
        <p className="text-primary-600 mb-8">Connect, Share, Discover</p>
        <div className="space-y-4">
          <Link to="/register">
            <Button size="lg" className="w-full">
              Join the Circle
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="w-full">
              Already have an account?
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}