// src/types/visitors.ts
export interface Visitor {
  id: string;
  visitorName: string;
  visitorPhone: string;
  purpose: string;
  otherPurpose?: string; // Add this to handle the "Other" case
  flatNumber: string;
  hostName: string;
  hostPhone: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  entryTime?: string | null;
  exitTime?: string | null;
  duration?: string | null; // Changed to string to support "Xh Ym" format
  scheduledTime: string;
}