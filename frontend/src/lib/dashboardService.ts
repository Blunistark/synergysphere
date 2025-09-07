import { apiRequest, API_ENDPOINTS } from './api';

// Types for dashboard data
export interface Project {
  id: number;
  name: string;
  summary?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: number;
    name: string;
    email: string;
  };
  members: Array<{
    id: number;
    role: string;
    user: {
      id: number;
      name: string;
      email: string;
    };
  }>;
  tasks: Array<{
    id: number;
    status: string;
  }>;
  taskProgress: {
    total: number;
    completed: number;
    percentage: number;
  };
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  dueDate?: string;
  createdAt: string;
  assignee?: {
    id: number;
    name: string;
    email: string;
  };
  project: {
    id: number;
    name: string;
  };
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalUsers: number;
  recentActivity: Array<{
    id: number;
    type: string;
    message: string;
    createdAt: string;
  }>;
}

// API service functions
export const dashboardService = {
  // Get user's projects
  async getProjects(): Promise<{ projects: Project[] }> {
    const response = await apiRequest(`${API_ENDPOINTS.PROJECTS}`);
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    return response.json();
  },

  // Get user's tasks across all projects
  async getUserTasks(): Promise<{ tasks: Task[] }> {
    const response = await apiRequest(`${API_ENDPOINTS.TASKS}`);
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    return response.json();
  },

  // Create a new project
  async createProject(projectData: {
    title: string;
    description: string;
    priority?: string;
    dueDate?: Date;
    category?: string;
    budget?: string;
  }): Promise<{ project: Project }> {
    const response = await apiRequest(`${API_ENDPOINTS.PROJECTS}`, {
      method: 'POST',
      body: JSON.stringify({
        name: projectData.title,
        summary: projectData.description,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create project');
    }
    
    return response.json();
  },

  // Create a new task
  async createTask(projectId: number, taskData: {
    title: string;
    description: string;
    priority?: string;
    dueDate?: Date;
    assigneeId?: string;
    status?: string;
  }): Promise<{ task: Task }> {
    const response = await apiRequest(`${API_ENDPOINTS.PROJECTS}/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify({
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        dueDate: taskData.dueDate ? taskData.dueDate.toISOString() : undefined,
        assigneeId: taskData.assigneeId ? parseInt(taskData.assigneeId) : undefined,
        status: taskData.status || 'pending',
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create task');
    }
    
    return response.json();
  },

  // Update a task's status
  async updateTaskStatus(taskId: number, status: string): Promise<{ task: Task }> {
    const response = await apiRequest(`${API_ENDPOINTS.TASKS}/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update task status');
    }
    
    return response.json();
  },

  // Get tasks for a specific project
  async getProjectTasks(projectId: number): Promise<{ tasks: Task[] }> {
    const response = await apiRequest(`${API_ENDPOINTS.PROJECTS}/${projectId}/tasks`);
    if (!response.ok) {
      throw new Error('Failed to fetch project tasks');
    }
    return response.json();
  },

  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Fetch projects and tasks in parallel
      const [projectsResponse, tasksResponse] = await Promise.all([
        this.getProjects(),
        this.getUserTasks(),
      ]);

      const projects = projectsResponse.projects;
      const tasks = tasksResponse.tasks;

      // Calculate statistics
      const totalProjects = projects.length;
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === 'Done').length;
      const pendingTasks = totalTasks - completedTasks;
      
      // Get unique users from projects
      const uniqueUsers = new Set();
      projects.forEach(project => {
        project.members.forEach(member => {
          uniqueUsers.add(member.user.id);
        });
      });
      const totalUsers = uniqueUsers.size;

      // Create recent activity from tasks and projects
      const recentActivity = [
        ...tasks.slice(0, 5).map(task => ({
          id: task.id,
          type: 'task',
          message: `Task "${task.title}" in ${task.project.name}`,
          createdAt: task.createdAt,
        })),
        ...projects.slice(0, 3).map(project => ({
          id: project.id,
          type: 'project',
          message: `Project "${project.name}" created`,
          createdAt: project.createdAt,
        }))
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);

      return {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        totalUsers,
        recentActivity,
      };
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  },

  // Get recent tasks (for TaskList component)
  async getRecentTasks(limit: number = 5): Promise<Task[]> {
    const response = await this.getUserTasks();
    return response.tasks
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },

  // Get project progress data for charts
  async getProjectProgress(): Promise<Array<{ name: string; progress: number; status: string }>> {
    const response = await this.getProjects();
    return response.projects.map(project => ({
      name: project.name,
      progress: project.taskProgress.percentage,
      status: this.getProjectStatus(project),
    }));
  },

  // Helper function to determine project status
  getProjectStatus(project: Project): string {
    if (project.taskProgress.percentage === 100) return 'Completed';
    if (project.taskProgress.percentage === 0) return 'Not Started';
    if (project.taskProgress.percentage < 50) return 'At Risk';
    return 'On Track';
  },

  // Update an existing project
  async updateProject(projectId: number, projectData: {
    name: string;
    summary?: string;
    status?: string;
    tags?: string[];
    deadline?: string;
  }): Promise<{ project: Project }> {
    const response = await apiRequest(`${API_ENDPOINTS.PROJECTS}/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to update project';
      
      if (response.status === 403) {
        errorMessage = 'You do not have permission to update this project';
      } else if (response.status === 404) {
        errorMessage = 'Project not found';
      } else if (response.status === 400) {
        errorMessage = 'Invalid project data provided';
      }
      
      console.error('Update project error:', response.status, errorText);
      throw new Error(errorMessage);
    }
    
    return response.json();
  },

  // Delete a project
  async deleteProject(projectId: number): Promise<{ success: boolean }> {
    const response = await apiRequest(`${API_ENDPOINTS.PROJECTS}/${projectId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete project');
    }
    
    return response.json();
  },
};
