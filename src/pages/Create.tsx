import { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Create() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm p-4"
      >
        <h1 className="text-xl font-semibold mb-4">Create New Post</h1>

        {!selectedImage ? (
          <label className="block w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
            <div className="flex flex-col items-center justify-center h-full">
              <Camera className="w-12 h-12 text-gray-400 mb-4" />
              <span className="text-sm text-gray-500">Click to upload image</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </label>
        ) : (
          <div className="relative">
            <img
              src={selectedImage}
              alt="Selected"
              className="w-full aspect-square object-cover rounded-lg"
            />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="mt-4">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {caption.length}/2200
            </span>
            <div className="flex gap-2">
              <Button variant="outline">Draft</Button>
              <Button>Share</Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}