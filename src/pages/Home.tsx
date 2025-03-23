import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

const posts = [
  {
    id: 1,
    user: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    },
    image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba',
    caption: 'Exploring new horizons 🌅 #adventure #travel',
    likes: 234,
    comments: 12,
  },
  {
    id: 2,
    user: {
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    },
    image: 'https://images.unsplash.com/photo-1682687221038-404670d5f335',
    caption: 'Coffee and code, perfect morning ☕️ #developer #coding',
    likes: 156,
    comments: 8,
  },
];

export function Home() {
  return (
    <div className="pt-4">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden"
        >
          <div className="p-4 flex items-center">
            <img
              src={post.user.avatar}
              alt={post.user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="ml-3 font-medium">{post.user.name}</span>
          </div>
          
          <img
            src={post.image}
            alt=""
            className="w-full aspect-square object-cover"
          />
          
          <div className="p-4">
            <div className="flex gap-4 mb-4">
              <button className="text-gray-600 hover:text-primary-500">
                <Heart className="w-6 h-6" />
              </button>
              <button className="text-gray-600 hover:text-primary-500">
                <MessageCircle className="w-6 h-6" />
              </button>
              <button className="text-gray-600 hover:text-primary-500">
                <Share2 className="w-6 h-6" />
              </button>
            </div>
            
            <div className="text-sm">
              <span className="font-medium">{post.likes} likes</span>
            </div>
            
            <p className="mt-2">
              <span className="font-medium">{post.user.name}</span>{' '}
              {post.caption}
            </p>
            
            <button className="text-gray-500 text-sm mt-2">
              View all {post.comments} comments
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}