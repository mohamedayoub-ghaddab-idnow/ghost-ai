"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ProjectData } from "@/lib/data/projects";

type DialogType = "create" | "rename" | "delete" | null;

interface DialogState {
  type: DialogType;
  projectId: string | null;
}

interface FormData {
  name: string;
}

interface UseProjectActionsProps {
  ownedProjects: ProjectData[];
  sharedProjects: ProjectData[];
}

interface UseProjectActionsReturn {
  dialogState: DialogState;
  formData: FormData;
  isLoading: boolean;
  openCreateDialog: () => void;
  openRenameDialog: (projectId: string) => void;
  openDeleteDialog: (projectId: string) => void;
  closeDialog: () => void;
  setFormData: (data: FormData) => void;
  handleSubmit: () => Promise<void>;
}

function generateSlugPreview(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9\s-]/g, "")
    .replaceAll(/\s+/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

export function useProjectActions({
  ownedProjects,
  sharedProjects,
}: UseProjectActionsProps): UseProjectActionsReturn {
  const router = useRouter();
  const [dialogState, setDialogState] = useState<DialogState>({
    type: null,
    projectId: null,
  });
  const [formData, setFormData] = useState<FormData>({ name: "" });
  const [isLoading, setIsLoading] = useState(false);

  const allProjects = useMemo(
    () => [...ownedProjects, ...sharedProjects],
    [ownedProjects, sharedProjects],
  );

  const openCreateDialog = useCallback(() => {
    setFormData({ name: "" });
    setDialogState({ type: "create", projectId: null });
  }, []);

  const openRenameDialog = useCallback(
    (projectId: string) => {
      const project = allProjects.find((p) => p.id === projectId);
      setFormData({ name: project?.name ?? "" });
      setDialogState({ type: "rename", projectId });
    },
    [allProjects],
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

    try {
      if (dialogState.type === "create") {
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim() || "Untitled Project",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create project");
        }

        const { project } = await response.json();
        closeDialog();
        // Navigate to the workspace using the project id (which is also the room id)
        router.push(`/editor/${project.id}`);
      } else if (dialogState.type === "rename" && dialogState.projectId) {
        const response = await fetch(`/api/projects/${dialogState.projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formData.name.trim() }),
        });

        if (!response.ok) {
          throw new Error("Failed to rename project");
        }

        closeDialog();
        router.refresh();
      } else if (dialogState.type === "delete" && dialogState.projectId) {
        const response = await fetch(`/api/projects/${dialogState.projectId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete project");
        }

        closeDialog();
        router.refresh();
      }
    } catch (error) {
      console.error("Project action error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dialogState, formData, closeDialog, router]);

  return {
    dialogState,
    formData,
    isLoading,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    setFormData,
    handleSubmit,
  };
}

export function useSlugPreview(name: string): string {
  return generateSlugPreview(name);
}

export function isValidSlug(name: string): boolean {
  return generateSlugPreview(name).length > 0;
}
