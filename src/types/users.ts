// src/types/users.ts
export interface User {
  id: string;
  username: string;
  password?: string; // Keep password optional for security
  fullName: string;
  contactNumber: string;
  role: 'admin' | 'security' | 'resident';
  flatNumber?: string;    // Only for residents
  designation?: string;   // Only for admins
}