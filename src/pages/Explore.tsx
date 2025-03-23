import { motion } from 'framer-motion';
import { Search, TrendingUp, Users } from 'lucide-react';

const trendingTopics = [
  { id: 1, name: 'Photography', posts: 1234 },
  { id: 2, name: 'Travel', posts: 987 },
  { id: 3, name: 'Technology', posts: 856 },
  { id: 4, name: 'Food', posts: 743 },
];

const suggestedUsers = [
  {
    id: 1,
    name: 'Emma Wilson',
    username: '@emmaw',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    followers: 12.5,
  },
  {
    id: 2,
    name: 'James Rodriguez',
    username: '@jamesr',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    followers: 8.2,
  },
];

export function Explore() {
  return (
    <div className="p-4">
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search people, topics, or keywords"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
        />
      </div>

      <section className="mb-8">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-6 h-6 text-primary-500 mr-2" />
          <h2 className="text-lg font-semibold">Trending Topics</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {trendingTopics.map((topic, index) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-4 rounded-lg shadow-sm"
            >
              <h3 className="font-medium text-primary-900">#{topic.name}</h3>
              <p className="text-sm text-gray-500">{topic.posts} posts</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center mb-4">
          <Users className="w-6 h-6 text-primary-500 mr-2" />
          <h2 className="text-lg font-semibold">Suggested Users</h2>
        </div>
        <div className="space-y-4">
          {suggestedUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-4 rounded-lg shadow-sm flex items-center"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="ml-3 flex-1">
                <h3 className="font-medium">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.username}</p>
                <p className="text-sm text-gray-500">{user.followers}k followers</p>
              </div>
              <button className="bg-primary-50 text-primary-600 px-4 py-1 rounded-full text-sm font-medium hover:bg-primary-100">
                Follow
              </button>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}