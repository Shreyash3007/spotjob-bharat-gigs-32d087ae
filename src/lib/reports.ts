import { supabase } from './supabase';

export enum ReportType {
  JOB = 'job',
  USER = 'user',
}

export enum ReportReason {
  SPAM = 'spam',
  MISLEADING = 'misleading',
  FRAUD = 'fraud',
  INAPPROPRIATE = 'inappropriate',
  OTHER = 'other',
}

interface ReportInsert {
  reporter_id: string;
  target_id: string;
  target_type: ReportType;
  reason: ReportReason;
  details?: string;
}

export async function createReport(reportData: ReportInsert) {
  try {
    const { data, error } = await supabase
      .from('reports')
      .insert(reportData)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating report:', error);
    return { data: null, error };
  }
}

export async function getReportsByUser(userId: string) {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('reporter_id', userId);
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching reports:', error);
    return { data: null, error };
  }
}

export async function getReportsForTarget(targetId: string, targetType: ReportType) {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('target_id', targetId)
      .eq('target_type', targetType);
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching reports:', error);
    return { data: null, error };
  }
} 