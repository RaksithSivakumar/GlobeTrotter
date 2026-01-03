'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageCircle, 
  Heart, 
  Share2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Plane, 
  Users, 
  Search,
  Send,
  Image as ImageIcon,
  Globe,
  TrendingUp,
  Filter
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  tripName?: string;
  location?: string;
  date?: string;
  imageUrl?: string;
  likes: number;
  comments: Comment[];
  createdAt: string;
  isLiked: boolean;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export default function CommunityPage() {
  const { user, profile, isAdmin } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [selectedTrip, setSelectedTrip] = useState<string>('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'trips' | 'tips' | 'questions'>('all');

  // Sample posts data (in real app, this would come from database)
  useEffect(() => {
    const storedPosts = localStorage.getItem('community_posts');
    if (storedPosts) {
      setPosts(JSON.parse(storedPosts));
    } else {
      // Initialize with sample posts
      const samplePosts: Post[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'Sarah Johnson',
          userAvatar: '',
          content: 'Just returned from an amazing trip to Paris! The Eiffel Tower at sunset was absolutely breathtaking. Highly recommend visiting Montmartre for the best views! 🗼✨',
          tripName: 'Paris Adventure',
          location: 'Paris, France',
          date: '2026-03-10',
          likes: 24,
          comments: [
            {
              id: 'c1',
              userId: 'user2',
              userName: 'Mike Chen',
              userAvatar: '',
              content: 'Sounds amazing! How many days did you spend there?',
              createdAt: new Date().toISOString(),
            },
          ],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          isLiked: false,
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Mike Chen',
          userAvatar: '',
          content: 'Looking for recommendations for budget-friendly accommodations in Tokyo. Any suggestions? Planning a 5-day trip next month.',
          location: 'Tokyo, Japan',
          likes: 18,
          comments: [],
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          isLiked: false,
        },
        {
          id: '3',
          userId: 'user3',
          userName: 'Emma Wilson',
          userAvatar: '',
          content: 'Pro tip: Always book museum tickets in advance! Saved me 2 hours of waiting in line at the Van Gogh Museum in Amsterdam. 🎨',
          location: 'Amsterdam, Netherlands',
          likes: 32,
          comments: [
            {
              id: 'c2',
              userId: 'user1',
              userName: 'Sarah Johnson',
              userAvatar: '',
              content: 'Great tip! I wish I knew this earlier.',
              createdAt: new Date().toISOString(),
            },
          ],
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          isLiked: false,
        },
      ];
      setPosts(samplePosts);
      localStorage.setItem('community_posts', JSON.stringify(samplePosts));
    }
  }, []);

  const handleCreatePost = () => {
    if (!newPost.trim() || !user) return;

    const post: Post = {
      id: Date.now().toString(),
      userId: user.id,
      userName: profile?.full_name || 'Anonymous',
      userAvatar: profile?.avatar_url || '',
      content: newPost,
      tripName: selectedTrip || undefined,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      isLiked: false,
    };

    const updatedPosts = [post, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('community_posts', JSON.stringify(updatedPosts));
    setNewPost('');
    setSelectedTrip('');
    setShowCreatePost(false);
  };

  const handleLike = (postId: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked,
        };
      }
      return post;
    });
    setPosts(updatedPosts);
    localStorage.setItem('community_posts', JSON.stringify(updatedPosts));
  };

  const handleAddComment = (postId: string, commentContent: string) => {
    if (!commentContent.trim() || !user) return;

    const comment: Comment = {
      id: Date.now().toString(),
      userId: user.id,
      userName: profile?.full_name || 'Anonymous',
      userAvatar: profile?.avatar_url || '',
      content: commentContent,
      createdAt: new Date().toISOString(),
    };

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, comment],
        };
      }
      return post;
    });
    setPosts(updatedPosts);
    localStorage.setItem('community_posts', JSON.stringify(updatedPosts));
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.userName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
      (filterType === 'trips' && post.tripName) ||
      (filterType === 'tips' && post.content.toLowerCase().includes('tip')) ||
      (filterType === 'questions' && post.content.includes('?'));

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-cyan-50">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-2xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent mb-1">
                  Travel Community
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <Globe size={14} className="text-blue-500" />
                  Connect with fellow travelers and share your adventures
                </p>
              </div>
            </div>
            {!isAdmin && (
              <Button
                onClick={() => setShowCreatePost(!showCreatePost)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              >
                <Plane className="w-4 h-4 mr-2" />
                Share Your Story
              </Button>
            )}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search posts, locations, or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700 placeholder-gray-400 shadow-sm"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'trips', 'tips', 'questions'] as const).map((type) => (
                <Button
                  key={type}
                  onClick={() => setFilterType(type)}
                  variant={filterType === type ? 'default' : 'outline'}
                  className={filterType === type ? 'bg-blue-500 text-white' : ''}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Create Post */}
          {showCreatePost && (
            <Card className="mb-6 border-2 border-blue-200 shadow-lg">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Textarea
                    placeholder="Share your travel experience, ask a question, or give a tip..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Add Photo
                      </Button>
                      <Button variant="outline" size="sm">
                        <MapPin className="w-4 h-4 mr-2" />
                        Add Location
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreatePost}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => handleLike(post.id)}
                onComment={(content) => handleAddComment(post.id, content)}
                currentUser={user}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function PostCard({
  post,
  onLike,
  onComment,
  currentUser,
}: {
  post: Post;
  onLike: () => void;
  onComment: (content: string) => void;
  currentUser: any;
}) {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  return (
    <Card className="border-2 border-gray-200 hover:border-blue-200 transition-all shadow-lg hover:shadow-xl">
      <CardContent className="p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {post.userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{post.userName}</h3>
              <p className="text-sm text-gray-500">
                {format(new Date(post.createdAt), 'MMM d, yyyy • h:mm a')}
              </p>
            </div>
          </div>
          {post.tripName && (
            <div className="bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              <span className="text-xs font-medium text-blue-600">Trip: {post.tripName}</span>
            </div>
          )}
        </div>

        {/* Post Content */}
        <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>

        {/* Trip Details */}
        {post.location && (
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin size={16} className="text-blue-500" />
              <span>{post.location}</span>
            </div>
            {post.date && (
              <div className="flex items-center gap-1">
                <Calendar size={16} className="text-blue-500" />
                <span>{format(parseISO(post.date), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
          <button
            onClick={onLike}
            className={`flex items-center gap-2 transition-colors ${
              post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <Heart size={20} className={post.isLiked ? 'fill-current' : ''} />
            <span className="font-medium">{post.likes}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors"
          >
            <MessageCircle size={20} />
            <span className="font-medium">{post.comments.length}</span>
          </button>
          <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
            <Share2 size={20} />
            <span className="font-medium">Share</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-4 mb-4">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {comment.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900">{comment.userName}</span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
            {currentUser && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && commentText.trim()) {
                      onComment(commentText);
                      setCommentText('');
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
                />
                <Button
                  onClick={() => {
                    if (commentText.trim()) {
                      onComment(commentText);
                      setCommentText('');
                    }
                  }}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Send size={16} />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

