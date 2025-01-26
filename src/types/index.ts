export type TaskStatus = 'TO-DO' | 'IN-PROGRESS' | 'COMPLETED';
export type TaskCategory = 'ALL' | 'WORK' | 'PERSONAL';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarURL?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  category: TaskCategory;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  tags: string[];
  attachments: string[];
}