import { supabase } from './supabase'
import type { Database } from '../types/supabase'

type ReviewInsert = Database['public']['Tables']['reviews']['Insert']

export async function createReview(reviewData: ReviewInsert) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select()
      .single()
    
    if (error) throw error
    
    // Update user's average rating
    await updateUserRating(reviewData.reviewee_id)
    
    return { data, error: null }
  } catch (error) {
    console.error('Error creating review:', error)
    return { data: null, error }
  }
}

export async function fetchReviewsForUser(userId: string) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:reviewer_id (
          id,
          name,
          avatar
        ),
        job:job_id (
          id,
          title
        )
      `)
      .eq('reviewee_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return { data: null, error }
  }
}

async function updateUserRating(userId: string) {
  try {
    // Get all reviews for the user
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', userId)
    
    if (reviewsError) throw reviewsError
    
    if (!reviews || reviews.length === 0) return
    
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length
    
    // Update user's rating
    const { error: updateError } = await supabase
      .from('users')
      .update({ rating: averageRating })
      .eq('id', userId)
    
    if (updateError) throw updateError
    
    return { error: null }
  } catch (error) {
    console.error('Error updating user rating:', error)
    return { error }
  }
} 