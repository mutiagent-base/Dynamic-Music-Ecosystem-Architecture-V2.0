import { GoogleAuthProvider, signInWithPopup, auth, googleProvider } from './firebase';

// In-memory token storage (DO NOT store in localStorage per security requirements)
let inMemoryAccessToken: string | null = null;

export const setGoogleAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
};

export const getGoogleAccessToken = (): string | null => {
  return inMemoryAccessToken;
};

// Sign in with Google and store OAuth Access Token
export const signInWithGoogleTasks = async (): Promise<string | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      setGoogleAccessToken(credential.accessToken);
      return credential.accessToken;
    }
    return null;
  } catch (error) {
    console.error('Google Tasks auth error:', error);
    throw error;
  }
};

export interface GoogleTaskList {
  id: string;
  title: string;
  updated?: string;
}

export interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  completed?: string;
}

const TASKS_API_BASE = 'https://tasks.googleapis.com/tasks/v1';

// Get user's Google Task Lists
export const getTaskLists = async (accessToken: string): Promise<GoogleTaskList[]> => {
  const response = await fetch(`${TASKS_API_BASE}/users/@me/lists`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      setGoogleAccessToken(null);
      throw new Error('AUTH_REQUIRED');
    }
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to fetch task lists (${response.status})`);
  }

  const data = await response.json();
  return data.items || [];
};

// Create a new Task List
export const createTaskList = async (
  accessToken: string,
  title: string
): Promise<GoogleTaskList> => {
  const response = await fetch(`${TASKS_API_BASE}/users/@me/lists`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      setGoogleAccessToken(null);
      throw new Error('AUTH_REQUIRED');
    }
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Failed to create task list');
  }

  return response.json();
};

// Fetch tasks in a task list
export const getTasksInList = async (
  accessToken: string,
  taskListId: string
): Promise<GoogleTask[]> => {
  const response = await fetch(
    `${TASKS_API_BASE}/lists/${encodeURIComponent(taskListId)}/tasks?showCompleted=true&showHidden=true`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      setGoogleAccessToken(null);
      throw new Error('AUTH_REQUIRED');
    }
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Failed to fetch tasks');
  }

  const data = await response.json();
  return data.items || [];
};

// Add a single task to a task list
export const addTaskToList = async (
  accessToken: string,
  taskListId: string,
  task: { title: string; notes?: string; due?: string }
): Promise<GoogleTask> => {
  const response = await fetch(
    `${TASKS_API_BASE}/lists/${encodeURIComponent(taskListId)}/tasks`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: task.title,
        notes: task.notes || '',
        due: task.due || undefined,
      }),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      setGoogleAccessToken(null);
      throw new Error('AUTH_REQUIRED');
    }
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Failed to create task');
  }

  return response.json();
};

// Toggle Task Status (Completed / NeedsAction)
export const toggleTaskStatus = async (
  accessToken: string,
  taskListId: string,
  taskId: string,
  isCompleted: boolean
): Promise<GoogleTask> => {
  const response = await fetch(
    `${TASKS_API_BASE}/lists/${encodeURIComponent(taskListId)}/tasks/${encodeURIComponent(taskId)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: isCompleted ? 'completed' : 'needsAction',
      }),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      setGoogleAccessToken(null);
      throw new Error('AUTH_REQUIRED');
    }
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Failed to update task status');
  }

  return response.json();
};

// Delete a Task
export const deleteTaskFromList = async (
  accessToken: string,
  taskListId: string,
  taskId: string
): Promise<void> => {
  const response = await fetch(
    `${TASKS_API_BASE}/lists/${encodeURIComponent(taskListId)}/tasks/${encodeURIComponent(taskId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      setGoogleAccessToken(null);
      throw new Error('AUTH_REQUIRED');
    }
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Failed to delete task');
  }
};
