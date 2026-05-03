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

// Mock project data
const MOCK_PROJECTS: Project[] = [
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

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9\s-]/g, "")
    .replaceAll(/\s+/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

export function useProjectDialogs(): UseProjectDialogsReturn {
  const [dialogState, setDialogState] = useState<DialogState>({
    type: null,
    projectId: null,
  });
  const [formData, setFormData] = useState<FormData>({ name: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [mockProjects] = useState<Project[]>(MOCK_PROJECTS);

  const openCreateDialog = useCallback(() => {
    setFormData({ name: "" });
    setDialogState({ type: "create", projectId: null });
  }, []);

  const openRenameDialog = useCallback(
    (projectId: string) => {
      const project = mockProjects.find((p) => p.id === projectId);
      setFormData({ name: project?.name ?? "" });
      setDialogState({ type: "rename", projectId });
    },
    [mockProjects],
  );

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
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    closeDialog();
  }, [closeDialog]);

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
