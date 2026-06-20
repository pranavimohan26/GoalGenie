const API_BASE_URL = 'http://localhost:5000/api/v1';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data as T;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  streak: number;
  xp: number;
  age?: number;
  education?: string;
  skillLevel?: string;
  hoursPerDay?: number;
  learningStyle?: string;
  interests?: string;
  created_at?: string;
  achievements?: Array<{
    id: string;
    badge_name: string;
    description: string;
    icon_key: string;
    unlocked_at: string;
  }>;
}

export interface Task {
  id: string;
  milestone_id: string;
  title: string;
  description: string;
  estimated_minutes: number;
  order_index: number;
  is_completed: boolean;
  completed_at: string | null;
}

export interface Resource {
  id: string;
  milestone_id: string;
  title: string;
  type: string;
  url: string;
  rationale: string;
}

export interface Milestone {
  id: string;
  goal_id: string;
  title: string;
  description: string;
  order_index: number;
  target_date: string;
  status: 'pending' | 'in_progress' | 'completed';
  completed_at: string | null;
  tasks: Task[];
  resources: Resource[];
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  duration_months: number;
  knowledge_level: string;
  daily_time_commitment: number;
  completion_percentage: number;
  risk_score: number;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  milestones?: Milestone[];
}

export const api = {
  auth: {
    register: (body: any) => 
      request<{ success: boolean; token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(body)
      }),
    login: (body: any) =>
      request<{ success: boolean; token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body)
      }),
    getProfile: () =>
      request<{ success: boolean; profile: User }>('/auth/profile')
  },
  goals: {
    list: () =>
      request<{ success: boolean; goals: Goal[] }>('/goals'),
    create: (body: any) =>
      request<{ success: boolean; message: string; goalId: string }>('/goals', {
        method: 'POST',
        body: JSON.stringify(body)
      }),
    getDetails: (id: string) =>
      request<{ success: boolean; goal: Goal }>(`/goals/${id}`),
    delete: (id: string) =>
      request<{ success: boolean; message: string }>(`/goals/${id}`, {
        method: 'DELETE'
      }),
    adapt: (id: string) =>
      request<{ success: boolean; message: string; recoveryStrategy: string; newRiskScore: number }>(`/goals/${id}/adapt`, {
        method: 'POST'
      })
  },
  tasks: {
    update: (id: string, isCompleted: boolean) =>
      request<{
        success: boolean;
        metrics: {
          completionPercentage: number;
          newXp: number;
          xpGained: number;
          newBadge: { badgeName: string; description: string; iconKey: string } | null;
        };
      }>(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isCompleted })
      })
  },
  learning: {
    getSession: (milestoneId: string) =>
      request<{
        success: boolean;
        session: {
          id: string;
          content: string;
          practiceTasks: string;
          quiz: string;
          quizScore: number | null;
          isCompleted: boolean;
        };
      }>(`/milestones/${milestoneId}/learn`),
    submitQuiz: (milestoneId: string, score: number) =>
      request<{ success: boolean; session: any }>(`/milestones/${milestoneId}/learn/quiz`, {
        method: 'POST',
        body: JSON.stringify({ score })
      })
  },
  mentor: {
    chat: (goalId: string, message: string) =>
      request<{ success: boolean; reply: string }>('/mentor/chat', {
        method: 'POST',
        body: JSON.stringify({ goalId, message })
      })
  },
  admin: {
    getMetrics: () =>
      request<{
        success: boolean;
        stats: {
          totalUsers: number;
          totalGoals: number;
          activeGoals: number;
          completedGoals: number;
          averageRiskScore: number;
        };
        recentUsers: User[];
        highRiskGoals: Array<{
          id: string;
          title: string;
          risk_score: number;
          completion_percentage: number;
          full_name: string;
          email: string;
        }>;
      }>('/admin/metrics'),
    deleteUser: (userId: string) =>
      request<{ success: boolean; message: string }>(`/admin/users/${userId}`, {
        method: 'DELETE'
      })
  }
};
