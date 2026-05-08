// types/index.ts
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  account_type: 'org_admin' | 'volunteer';
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  owner_id: string;
  created_at: string;
}

export interface VolunteerProfile {
  id: string;
  user_id: string;
  bio?: string;
  skills?: string[];
  university?: string;
  career?: string;
  total_hours: number;
  created_at: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: 'admin' | 'coordinator';
  joined_at: string;
}

export interface Activity {
  id: string;
  org_id: string;
  title: string;
  description?: string;
  required_skills?: string[];
  location?: string;
  start_time: string;
  end_time: string;
  max_volunteers?: number;
  status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  created_by: string;
  created_at: string;
}

export interface ActivityRegistration {
  id: string;
  activity_id: string;
  volunteer_id: string;
  status: 'registered' | 'attended' | 'absent' | 'cancelled';
  registered_at: string;
  attended_at?: string;
}

export interface QrToken {
  id: string;
  activity_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface AttendanceLog {
  id: string;
  activity_id: string;
  volunteer_id: string;
  scanned_at: string;
  hours_credited?: number;
  is_walk_in: boolean;
}

export interface Certificate {
  id: string;
  volunteer_id: string;
  skill: string;
  hours_required: number;
  hours_completed: number;
  issued_at?: string;
  certificate_url?: string;
  status: 'in_progress' | 'issued';
}