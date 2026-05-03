"use client";

import { useState } from "react";
import { WorkspaceLayout } from "@/components/editor/workspace-layout";
import {
  CreateProjectDialog,
  RenameProjectDialog,
  DeleteProjectDialog,
} from "@/components/editor/project-dialogs";
import { useProjectActions } from "@/hooks/use-project-actions";
import type { ProjectData } from "@/lib/data/projects";

interface WorkspaceClientProps {
  project: ProjectData;
  ownedProjects: ProjectData[];
  sharedProjects: ProjectData[];
}

export function WorkspaceClient({
  project,
  ownedProjects,
  sharedProjects,
}: Readonly<WorkspaceClientProps>) {
  const {
    dialogState,
    formData,
    isLoading,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    setFormData,
    handleSubmit,
  } = useProjectActions({ ownedProjects, sharedProjects });

  const allProjects = [...ownedProjects, ...sharedProjects];
  const currentProject = allProjects.find((p) => p.id === dialogState.projectId);

  return (
    <>
      <WorkspaceLayout
        project={project}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        onCreateProject={openCreateDialog}
        onRenameProject={openRenameDialog}
        onDeleteProject={openDeleteDialog}
      />

      {/* Dialogs */}
      <CreateProjectDialog
        open={dialogState.type === "create"}
        onOpenChange={(open) => !open && closeDialog()}
        projectName={formData.name}
        onProjectNameChange={(name) => setFormData({ name })}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      <RenameProjectDialog
        open={dialogState.type === "rename"}
        onOpenChange={(open) => !open && closeDialog()}
        project={currentProject}
        projectName={formData.name}
        onProjectNameChange={(name) => setFormData({ name })}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      <DeleteProjectDialog
        open={dialogState.type === "delete"}
        onOpenChange={(open) => !open && closeDialog()}
        project={currentProject}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </>
  );
}
