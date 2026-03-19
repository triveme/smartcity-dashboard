import { env } from 'next-dynenv';
import type { NewProject, Project } from '@/types/dataModels';

const NEXT_PUBLIC_BACKEND_URL =
  env('NEXT_PUBLIC_PROJECT_DATA_SERVICE_URL') || 'http://localhost:8090';

export async function createProject(
  accessToken: string | undefined,
  project: NewProject,
): Promise<Project> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/project`, {
    method: 'POST',
    headers,
    body: JSON.stringify(project),
  });

  if (!response.ok) {
    throw new Error(`Failed to create project: ${response.statusText}`);
  }

  const text = await response.text();
  const parsed = text ? JSON.parse(text) : {};
  return parsed as Project;
}

export async function updateProject(
  accessToken: string | undefined,
  projectId: string,
  project: NewProject,
): Promise<Project> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(
    `${NEXT_PUBLIC_BACKEND_URL}/project/${projectId}`,
    {
      method: 'PATCH',
      headers,
      body: JSON.stringify(project),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to update project: ${response.statusText}`);
  }

  const text = await response.text();
  const parsed = text ? JSON.parse(text) : {};
  return parsed as Project;
}

export async function deleteProject(
  accessToken: string | undefined,
  projectId: string,
): Promise<void> {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(
    `${NEXT_PUBLIC_BACKEND_URL}/project/${projectId}`,
    {
      method: 'DELETE',
      headers,
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to delete project: ${response.statusText}`);
  }
}

export async function uploadProjectPicture(
  accessToken: string | undefined,
  projectId: string,
  file: File,
): Promise<unknown> {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const formData = new FormData();
  formData.append('data', file);

  const response = await fetch(
    `${NEXT_PUBLIC_BACKEND_URL}/project/${projectId}/picture`,
    {
      method: 'POST',
      headers,
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to upload picture: ${response.statusText}`);
  }

  return response.json();
}

export async function getProject(
  accessToken: string | undefined,
  projectId: string,
): Promise<unknown | null> {
  const normalizedProjectId = projectId.endsWith('_line')
    ? projectId.slice(0, -'_line'.length)
    : projectId;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(
    `${NEXT_PUBLIC_BACKEND_URL}/project/${normalizedProjectId}`,
    {
      method: 'GET',
      headers,
    },
  );

  if (!response.ok) {
    let errorBody = '';
    try {
      errorBody = await response.text();
    } catch (err) {
      errorBody = '';
    }
    console.error('[project-service] getProject failed', {
      url: `${NEXT_PUBLIC_BACKEND_URL}/project/${normalizedProjectId}`,
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
    });
    throw new Error(
      `Failed to fetch project: ${response.status} ${response.statusText}`,
    );
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('[project-service] getProject invalid JSON', {
      url: `${NEXT_PUBLIC_BACKEND_URL}/project/${normalizedProjectId}`,
      status: response.status,
      statusText: response.statusText,
      body: text,
    });
    throw new Error('Failed to parse project response JSON');
  }
}

export async function getProjectPictures(
  accessToken: string | undefined,
  projectId: string,
): Promise<unknown[]> {
  const normalizedProjectId = projectId.endsWith('_line')
    ? projectId.slice(0, -'_line'.length)
    : projectId;

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(
    `${NEXT_PUBLIC_BACKEND_URL}/project/${normalizedProjectId}/picture`,
    {
      method: 'GET',
      headers,
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch project pictures: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteProjectPicture(
  accessToken: string | undefined,
  projectId: string,
  pictureId: string,
): Promise<void> {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(
    `${NEXT_PUBLIC_BACKEND_URL}/project/${projectId}/picture/${pictureId}`,
    {
      method: 'DELETE',
      headers,
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to delete project picture: ${response.statusText}`);
  }
}

export async function getProjects(
  accessToken: string | undefined,
  tenant?: string,
  category?: string,
  status?: string,
): Promise<unknown[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const params = new URLSearchParams();
  if (tenant) params.set('tenant', tenant);
  if (category) params.set('category', category);
  if (status) params.set('status', status);

  const url = `${NEXT_PUBLIC_BACKEND_URL}/project${
    params.toString() ? `?${params.toString()}` : ''
  }`;

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    let errorBody = '';
    try {
      errorBody = await response.text();
    } catch (err) {
      errorBody = '';
    }
    console.error('[project-service] getProjects failed', {
      url,
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
    });
    throw new Error(
      `Failed to fetch projects: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}
