import { supabase } from './supabase'
import type { Database } from '../types/supabase'
import type { JobFilter } from '../types'

type Job = Database['public']['Tables']['jobs']['Row']
type JobInsert = Database['public']['Tables']['jobs']['Insert']
type Application = Database['public']['Tables']['applications']['Row']
type ApplicationInsert = Database['public']['Tables']['applications']['Insert']

export async function fetchJobs(filters?: JobFilter) {
  try {
    let query = supabase
      .from('jobs')
      .select(`
        *,
        users:poster_id (
          id,
          name,
          avatar,
          rating,
          verified
        )
      `)
      .eq('status', 'open')
      
    // Apply filters if provided
    if (filters?.category && filters.category.length > 0) {
      query = query.in('category', filters.category)
    }
    
    if (filters?.payMin !== undefined) {
      query = query.gte('pay->amount', filters.payMin)
    }
    
    if (filters?.payMax !== undefined) {
      query = query.lte('pay->amount', filters.payMax)
    }
    
    // Sort by created date (newest) by default
    if (filters?.sortBy === 'pay') {
      query = query.order('pay->amount', { ascending: false })
    } else {
      // Default sort by newest
      query = query.order('created_at', { ascending: false })
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return { data: null, error }
  }
}

export async function fetchJobById(id: string) {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        users:poster_id (
          id,
          name,
          avatar,
          rating,
          verified,
          phone
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching job:', error)
    return { data: null, error }
  }
}

export async function createJob(jobData: Omit<JobInsert, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .insert(jobData)
      .select()
      .single()
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error creating job:', error)
    return { data: null, error }
  }
}

export async function updateJobStatus(id: string, status: 'open' | 'filled' | 'expired') {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error updating job status:', error)
    return { data: null, error }
  }
}

export async function applyToJob(applicationData: ApplicationInsert) {
  try {
    const { data, error } = await supabase
      .from('applications')
      .insert(applicationData)
      .select()
      .single()
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error applying to job:', error)
    return { data: null, error }
  }
}

export async function fetchApplicationsByUser(userId: string) {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs (*)
      `)
      .eq('applicant_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching applications:', error)
    return { data: null, error }
  }
}

export async function fetchApplicationsForJob(jobId: string) {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        users:applicant_id (
          id,
          name,
          avatar,
          rating,
          verified,
          phone
        )
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching job applications:', error)
    return { data: null, error }
  }
}

export async function updateApplicationStatus(id: string, status: 'pending' | 'accepted' | 'rejected') {
  try {
    const { data, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error updating application status:', error)
    return { data: null, error }
  }
} 