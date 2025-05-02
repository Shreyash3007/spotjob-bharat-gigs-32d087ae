import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { VerificationBadge } from "./VerificationBadge";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/ui/use-toast";
import { 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  MoreHorizontal, 
  MapPin, 
  Clock, 
  Briefcase,
  Image,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FeedPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
    verified: boolean;
  };
  content: string;
  images?: string[];
  job?: {
    id: string;
    title: string;
    location: string;
    category: string;
  };
  successStory?: {
    title: string;
    description: string;
  };
  likes: number;
  comments: number;
  timestamp: number;
  hasLiked?: boolean;
}

interface SocialFeedProps {
  posts: FeedPost[];
  isLoading?: boolean;
}

export function SocialFeed({ posts, isLoading = false }: SocialFeedProps) {
  const [newPostContent, setNewPostContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useApp();
  const { toast } = useToast();
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(posts);

  const handleCreatePost = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You need to be logged in to create posts",
        variant: "destructive"
      });
      return;
    }

    if (!newPostContent.trim()) {
      toast({
        title: "Empty post",
        description: "Please add some content to your post",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real app, this would send the post to the server
      // For demo purposes, we'll just create a local post
      const newPost: FeedPost = {
        id: `local-${Date.now()}`,
        author: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          verified: user.verified
        },
        content: newPostContent,
        likes: 0,
        comments: 0,
        timestamp: Date.now(),
        hasLiked: false
      };

      // Add the new post to the top of the feed
      setFeedPosts(prev => [newPost, ...prev]);
      setNewPostContent("");

      toast({
        title: "Post created",
        description: "Your post has been published to the feed"
      });
    } catch (error) {
      toast({
        title: "Error creating post",
        description: "There was a problem creating your post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikePost = (postId: string) => {
    setFeedPosts(prev => 
      prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.hasLiked ? post.likes - 1 : post.likes + 1,
            hasLiked: !post.hasLiked
          };
        }
        return post;
      })
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading feed...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {user && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar || ""} />
                <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Share an update, success story, or ask for help..."
                  className="min-h-24 resize-none mb-4"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1" disabled>
                      <Image className="h-4 w-4" />
                      <span>Photo</span>
                    </Button>
                  </div>
                  <Button 
                    onClick={handleCreatePost}
                    disabled={isSubmitting || !newPostContent.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : "Post"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {feedPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg font-medium">No posts in the feed yet</p>
          <p className="text-muted-foreground mt-2">
            Be the first to share a success story or job opportunity!
          </p>
        </div>
      ) : (
        feedPosts.map((post) => (
          <Card key={post.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author.avatar || ""} />
                    <AvatarFallback>{post.author.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{post.author.name}</span>
                      {post.author.verified && <VerificationBadge type="kyc" size="sm" />}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="whitespace-pre-wrap mb-4">{post.content}</p>
              
              {post.images && post.images.length > 0 && (
                <div className={`grid gap-2 mb-4 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {post.images.map((image, index) => (
                    <img 
                      key={index}
                      src={image} 
                      alt={`Post image ${index + 1}`} 
                      className="rounded-md w-full h-60 object-cover"
                    />
                  ))}
                </div>
              )}
              
              {post.job && (
                <div className="bg-accent/30 p-3 rounded-md mt-2 mb-3">
                  <div className="flex items-start gap-2">
                    <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">{post.job.title}</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{post.job.location}</span>
                        </div>
                        <Badge variant="outline">{post.job.category}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {post.successStory && (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900 p-3 rounded-md mt-2 mb-3">
                  <h4 className="font-medium text-green-800 dark:text-green-400">
                    {post.successStory.title}
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    {post.successStory.description}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-3">
              <div className="flex justify-between w-full">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`gap-1 ${post.hasLiked ? 'text-primary' : ''}`}
                  onClick={() => handleLikePost(post.id)}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>{post.likes > 0 ? post.likes : ""}</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.comments > 0 ? post.comments : ""}</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
} 