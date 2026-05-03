"use client";

import { useState } from "react";
import { X, Plus, FolderOpen, Users, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ProjectData } from "@/lib/data/projects";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  ownedProjects: ProjectData[];
  sharedProjects: ProjectData[];
  onCreateProject: () => void;
  onRenameProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

export function ProjectSidebar({
  isOpen,
  onClose,
  ownedProjects,
  sharedProjects,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
}: Readonly<ProjectSidebarProps>) {

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-bg-base/80 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-bg-surface border-r border-border-default shadow-xl transition-transform duration-300 rounded-r-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-default">
            <h2 className="text-lg font-semibold text-text-primary">Projects</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="my-projects" className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-4">
              <TabsTrigger value="my-projects" className="flex-1">
                My Projects
              </TabsTrigger>
              <TabsTrigger value="shared" className="flex-1">
                Shared
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 mt-4">
              <TabsContent value="my-projects" className="m-0 p-4">
                {ownedProjects.length === 0 ? (
                  <EmptyState
                    icon={FolderOpen}
                    title="No projects yet"
                    description="Create your first project to get started"
                  />
                ) : (
                  <div className="space-y-2">
                    {ownedProjects.map((project) => (
                      <ProjectItem
                        key={project.id}
                        project={project}
                        onRename={onRenameProject}
                        onDelete={onDeleteProject}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="shared" className="m-0 p-4">
                {sharedProjects.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No shared projects"
                    description="Projects shared with you will appear here"
                  />
                ) : (
                  <div className="space-y-2">
                    {sharedProjects.map((project) => (
                      <ProjectItem
                        key={project.id}
                        project={project}
                        showActions={false}
                        onRename={onRenameProject}
                        onDelete={onDeleteProject}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>

          {/* Footer */}
          <div className="p-4 border-t border-border-default">
            <Button className="w-full" size="lg" onClick={onCreateProject}>
              <Plus className="h-5 w-5 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function EmptyState({ icon: Icon, title, description }: Readonly<EmptyStateProps>) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-bg-elevated mb-4">
        <Icon className="h-8 w-8 text-text-muted" />
      </div>
      <h3 className="text-sm font-medium text-text-primary mb-1">{title}</h3>
      <p className="text-xs text-text-muted max-w-[200px]">{description}</p>
    </div>
  );
}

interface ProjectItemProps {
  project: ProjectData;
  showActions?: boolean;
  onRename: (projectId: string) => void;
  onDelete: (projectId: string) => void;
}

function ProjectItem({
  project,
  showActions = true,
  onRename,
  onDelete,
}: Readonly<ProjectItemProps>) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="group relative flex items-center justify-between rounded-xl px-3 py-2 hover:bg-bg-elevated transition-colors cursor-pointer">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{project.name}</p>
        <p className="text-xs text-text-muted truncate">{project.slug}</p>
      </div>
      {showActions && (
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
          {showMenu && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setShowMenu(false)}
                aria-label="Close menu"
              />
              <div className="absolute right-0 top-full mt-1 z-20 w-36 rounded-xl bg-bg-surface border border-border-default shadow-lg py-1">
                <button
                  type="button"
                  className="flex items-center w-full px-3 py-2 text-sm text-text-primary hover:bg-bg-elevated transition-colors"
                  onClick={() => {
                    setShowMenu(false);
                    onRename(project.id);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Rename
                </button>
                <button
                  type="button"
                  className="flex items-center w-full px-3 py-2 text-sm text-state-error hover:bg-bg-elevated transition-colors"
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(project.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
