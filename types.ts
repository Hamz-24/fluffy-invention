
export interface Goal {
  id: string;
  user_id?: string;
  title: string;
  deadline: string;
  status: 'active' | 'completed' | 'on-hold';
  category: string;
  tasks: Task[];
  created_at?: string;
}

export interface Task {
  id: string;
  t: string; // Task title
  c: boolean; // Completed status
  completedAt?: string; // Date of completion
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface JournalEntry {
  id: string;
  user_id?: string;
  date: string;
  content: string;
  mood: string;
  sentiment: number; // 0 to 100
  summary: string;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  streak: number;
  overall_progress?: number; // DB aligned
  overallProgress?: number; // FE fallback
  interests: string[];
  title?: string;
  bio?: string;
  location?: string;
  website?: string;
}
