"use client";

import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen, Share2, Sparkles } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProjectData } from "@/lib/data/projects";

interface WorkspaceLayoutProps {
  project: ProjectData;
  ownedProjects: ProjectData[];
  sharedProjects: ProjectData[];
  onCreateProject: () => void;
  onRenameProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

export function WorkspaceLayout({
  project,
  ownedProjects,
  sharedProjects,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
}: Readonly<WorkspaceLayoutProps>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-bg-base flex flex-col overflow-hidden">
      {/* Top Navbar */}
      <nav className="flex-shrink-0 h-14 bg-bg-surface border-b border-border-default flex items-center justify-between px-4 z-30">
        {/* Left: Sidebar toggle + Project name */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeftOpen className="h-5 w-5" />
            )}
          </Button>
          <h1 className="ml-3 text-lg font-semibold text-text-primary truncate max-w-[200px]">
            {project.name}
          </h1>
        </div>

        {/* Right: Actions + User */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
            aria-label={isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
            className={cn(isAiSidebarOpen && "bg-bg-subtle")}
          >
            <Sparkles className="h-5 w-5" />
          </Button>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
                userButtonTrigger: "focus:shadow-none",
                userButtonPopoverCard: "bg-bg-elevated border border-border-default rounded-2xl",
                userButtonPopoverActionButton: "text-text-primary hover:bg-bg-subtle rounded-xl",
                userButtonPopoverActionButtonText: "text-text-primary",
                userButtonPopoverFooter: "hidden",
              },
            }}
          />
        </div>
      </nav>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas area - fills remaining space */}
        <div className="flex-1 flex items-center justify-center bg-bg-base">
          <p className="text-text-muted text-sm">
            Canvas placeholder
          </p>
        </div>

        {/* AI Sidebar placeholder */}
        <aside
          className={cn(
            "w-80 bg-bg-surface border-l border-border-default flex flex-col transition-transform duration-300",
            isAiSidebarOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="p-4 border-b border-border-default">
            <h2 className="text-lg font-semibold text-text-primary">AI Chat</h2>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-text-muted text-sm">
              AI chat placeholder
            </p>
          </div>
        </aside>
      </div>

      {/* Project Sidebar (overlay) */}
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        activeProjectId={project.id}
        onCreateProject={onCreateProject}
        onRenameProject={onRenameProject}
        onDeleteProject={onDeleteProject}
      />
    </div>
  );
}
