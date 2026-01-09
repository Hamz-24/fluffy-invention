
import React from 'react';
import { LayoutDashboard, Target, BookOpen, MessageSquare, LineChart, FileText, User, Settings } from 'lucide-react';

export const NAV_ITEMS = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
  { icon: <Target size={20} />, label: 'Goals', path: '/goals' },
  { icon: <BookOpen size={20} />, label: 'Journal', path: '/journal' },
  { icon: <MessageSquare size={20} />, label: 'AI Mentor', path: '/mentor' },
  { icon: <LineChart size={20} />, label: 'Progress', path: '/progress' },
  { icon: <FileText size={20} />, label: 'Reports', path: '/reports' },
  { icon: <User size={20} />, label: 'Profile', path: '/profile' },
  { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
];

export const MOCK_GOALS = [
  { id: '1', title: 'Learn Advanced React Patterns', progress: 75, deadline: '2024-06-30', status: 'active', tasks: [] },
  { id: '2', title: 'Build Personal Brand', progress: 40, deadline: '2024-07-15', status: 'active', tasks: [] },
  { id: '3', title: 'Complete GuideX MVP', progress: 90, deadline: '2024-06-10', status: 'active', tasks: [] },
];

export const MOCK_USER = {
  name: 'Hamza',
  email: 'hamza@example.com',
  avatar: 'https://picsum.photos/200',
  streak: 7,
  overallProgress: 62,
  interests: ['Software Engineering', 'UI/UX Design', 'Psychology', 'Product Management']
};
