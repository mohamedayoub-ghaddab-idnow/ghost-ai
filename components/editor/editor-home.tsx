"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import {
  CreateProjectDialog,
  RenameProjectDialog,
  DeleteProjectDialog,
} from "@/components/editor/project-dialogs";
import { useProjectActions } from "@/hooks/use-project-actions";
import { Button } from "@/components/ui/button";
import type { ProjectData } from "@/lib/data/projects";

interface EditorHomeProps {
  ownedProjects: ProjectData[];
  sharedProjects: ProjectData[];
}

export function EditorHome({ ownedProjects, sharedProjects }: Readonly<EditorHomeProps>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    <div className="min-h-screen bg-bg-base">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        onCreateProject={openCreateDialog}
        onRenameProject={openRenameDialog}
        onDeleteProject={openDeleteDialog}
      />
      <main className="pt-14 h-screen">
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-2xl font-semibold text-text-primary mb-2">
            Create a project or open an existing one
          </h1>
          <p className="text-text-muted mb-6 max-w-md">
            Start a new architecture workspace, or choose a project from the sidebar.
          </p>
          <Button size="lg" onClick={openCreateDialog}>
            <Plus className="h-5 w-5 mr-2" />
            New Project
          </Button>
        </div>
      </main>

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
    </div>
  );
}
