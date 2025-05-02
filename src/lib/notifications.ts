import { supabase } from './supabase';

export enum NotificationType {
  APPLICATION = 'application',
  MESSAGE = 'message',
  JOB_STATUS = 'job_status',
  REVIEW = 'review',
  ADMIN = 'admin',
  SYSTEM = 'system'
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  entity_id?: string; // Job ID, application ID, etc.
  is_read: boolean;
  created_at: string;
  data?: any; // Additional data specific to notification type
}

export async function fetchUserNotifications(userId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return { data: data as Notification[], error: null };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { data: null, error };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data: data as Notification, error: null };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { data: null, error };
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { data: null, error };
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    
    if (error) throw error;
    
    return { error: null };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { error };
  }
}

export async function createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        is_read: false
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { data: data as Notification, error: null };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { data: null, error };
  }
}

// Subscribe to notifications for a user
export function subscribeToUserNotifications(userId: string, callback: (notification: Notification) => void) {
  const subscription = supabase
    .channel(`user-notifications:${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      // Call the callback with the new notification
      callback(payload.new as Notification);
    })
    .subscribe();
  
  // Return a function to unsubscribe
  return () => {
    supabase.removeChannel(subscription);
  };
}

// Register for push notifications (if browser supports it)
export async function registerForPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications not supported');
    return { error: 'Push notifications not supported' };
  }
  
  try {
    // Register service worker
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    
    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { error: 'Permission denied' };
    }
    
    // Get subscription
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY)
    });
    
    // Send subscription to server
    // In a real app, you would send this to your backend
    console.log('Push notification subscription:', subscription);
    
    return { subscription, error: null };
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return { subscription: null, error };
  }
}

// Helper function to convert base64 string to Uint8Array
// (required for applicationServerKey)
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
} 