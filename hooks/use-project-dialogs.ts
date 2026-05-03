"use client";

import { useState, useCallback } from "react";

export interface Project {
  id: string;
  name: string;
  slug: string;
  isOwner: boolean;
}

type DialogType = "create" | "rename" | "delete" | null;

interface DialogState {
  type: DialogType;
  projectId: string | null;
}

interface FormData {
  name: string;
}

interface UseProjectDialogsReturn {
  dialogState: DialogState;
  formData: FormData;
  isLoading: boolean;
  mockProjects: Project[];
  openCreateDialog: () => void;
  openRenameDialog: (projectId: string) => void;
  openDeleteDialog: (projectId: string) => void;
  closeDialog: () => void;
  setFormData: (data: FormData) => void;
  handleSubmit: () => Promise<void>;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9\s-]/g, "")
    .replaceAll(/\s+/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

function generateId(): string {
  return `project-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Initial mock project data
const INITIAL_MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    name: "E-commerce Platform",
    slug: "e-commerce-platform",
    isOwner: true,
  },
  {
    id: "2",
    name: "Mobile App Redesign",
    slug: "mobile-app-redesign",
    isOwner: true,
  },
  {
    id: "3",
    name: "Analytics Dashboard",
    slug: "analytics-dashboard",
    isOwner: false,
  },
];

export function useProjectDialogs(): UseProjectDialogsReturn {
  const [dialogState, setDialogState] = useState<DialogState>({
    type: null,
    projectId: null,
  });
  const [formData, setFormData] = useState<FormData>({ name: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [mockProjects, setMockProjects] = useState<Project[]>(INITIAL_MOCK_PROJECTS);

  const openCreateDialog = useCallback(() => {
    setFormData({ name: "" });
    setDialogState({ type: "create", projectId: null });
  }, []);

  const openRenameDialog = useCallback((projectId: string) => {
    const project = mockProjects.find((p) => p.id === projectId);
    setFormData({ name: project?.name ?? "" });
    setDialogState({ type: "rename", projectId });
  }, [mockProjects]);

  const openDeleteDialog = useCallback((projectId: string) => {
    setDialogState({ type: "delete", projectId });
  }, []);

  const closeDialog = useCallback(() => {
    setDialogState({ type: null, projectId: null });
    setFormData({ name: "" });
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (dialogState.type === "create") {
      const slug = generateSlug(formData.name);
      if (slug) {
        const newProject: Project = {
          id: generateId(),
          name: formData.name.trim(),
          slug,
          isOwner: true,
        };
        setMockProjects((prev) => [newProject, ...prev]);
      }
    } else if (dialogState.type === "rename" && dialogState.projectId) {
      const slug = generateSlug(formData.name);
      if (slug) {
        setMockProjects((prev) =>
          prev.map((p) =>
            p.id === dialogState.projectId
              ? { ...p, name: formData.name.trim(), slug }
              : p
          )
        );
      }
    } else if (dialogState.type === "delete" && dialogState.projectId) {
      setMockProjects((prev) => prev.filter((p) => p.id !== dialogState.projectId));
    }

    setIsLoading(false);
    closeDialog();
  }, [dialogState, formData, closeDialog]);

  return {
    dialogState,
    formData,
    isLoading,
    mockProjects,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    setFormData,
    handleSubmit,
  };
}

export function useSlugPreview(name: string): string {
  return generateSlug(name);
}

export function isValidSlug(name: string): boolean {
  return generateSlug(name).length > 0;
}
