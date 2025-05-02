import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createReview } from "@/lib/reviews";
import { useApp } from "@/context/AppContext";

interface ReviewFormProps {
  jobId: string;
  revieweeId: string;
  revieweeName: string;
  onComplete: () => void;
}

export function ReviewForm({ jobId, revieweeId, revieweeName, onComplete }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useApp();
  const { toast } = useToast();

  const handleRatingChange = (value: number) => {
    setRating(value);
  };

  const handleMouseEnter = (value: number) => {
    setHoverRating(value);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to leave a review",
        variant: "destructive"
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewData = {
        job_id: jobId,
        reviewer_id: user.id,
        reviewee_id: revieweeId,
        rating,
        comment: comment.trim() || null
      };

      const { error } = await createReview(reviewData);
      
      if (error) throw error;
      
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!"
      });
      
      onComplete();
    } catch (error) {
      toast({
        title: "Error submitting review",
        description: "There was a problem submitting your review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Review {revieweeName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground mb-1">How was your experience?</p>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleRatingChange(value)}
                onMouseEnter={() => handleMouseEnter(value)}
                onMouseLeave={handleMouseLeave}
                className="p-1 focus:outline-none"
              >
                <Star
                  className={cn(
                    "h-8 w-8",
                    value <= (hoverRating || rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  )}
                />
              </button>
            ))}
          </div>
          <p className="text-sm font-medium mt-2">
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </p>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="comment" className="text-sm font-medium">
            Additional Comments (Optional)
          </label>
          <Textarea
            id="comment"
            placeholder="Share your experience working with this person..."
            value={comment}
            onChange={handleCommentChange}
            rows={4}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 