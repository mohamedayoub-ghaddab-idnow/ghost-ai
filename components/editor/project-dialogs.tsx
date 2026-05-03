"use client";

import { useEffect, useRef } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSlugPreview, isValidSlug, type Project } from "@/hooks/use-project-dialogs";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onSubmit: () => Promise<void>;
  isLoading: boolean;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  projectName,
  onProjectNameChange,
  onSubmit,
  isLoading,
}: Readonly<CreateProjectDialogProps>) {
  const slugPreview = useSlugPreview(projectName);
  const hasValidSlug = isValidSlug(projectName);
  const showSlugError = projectName.trim().length > 0 && !hasValidSlug;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasValidSlug) {
      onSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Enter a name for your new project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="project-name" className="text-sm font-medium text-text-primary">
                Project name
              </label>
              <Input
                ref={inputRef}
                id="project-name"
                placeholder="My awesome project"
                value={projectName}
                onChange={(e) => onProjectNameChange(e.target.value)}
              />
            </div>
            {showSlugError ? (
              <p className="text-sm text-state-error">
                Project name must contain at least one letter or number
              </p>
            ) : projectName && (
              <div className="space-y-1">
                <span className="text-xs text-text-muted">Slug preview</span>
                <p className="text-sm text-text-secondary font-mono">{slugPreview}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!hasValidSlug || isLoading}>
              {isLoading ? (
                "Creating..."
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Project
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface RenameProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | undefined;
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onSubmit: () => Promise<void>;
  isLoading: boolean;
}

export function RenameProjectDialog({
  open,
  onOpenChange,
  project,
  projectName,
  onProjectNameChange,
  onSubmit,
  isLoading,
}: Readonly<RenameProjectDialogProps>) {
  const hasValidSlug = isValidSlug(projectName);
  const showSlugError = projectName.trim().length > 0 && !hasValidSlug;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasValidSlug) {
      onSubmit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (hasValidSlug) {
        onSubmit();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Project</DialogTitle>
          <DialogDescription>
            Current name: <span className="font-medium text-text-primary">{project?.name}</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="rename-project" className="text-sm font-medium text-text-primary">
                New name
              </label>
              <Input
                ref={inputRef}
                id="rename-project"
                value={projectName}
                onChange={(e) => onProjectNameChange(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            {showSlugError && (
              <p className="text-sm text-state-error">
                Project name must contain at least one letter or number
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!hasValidSlug || isLoading}>
              {isLoading ? (
                "Renaming..."
              ) : (
                <>
                  <Pencil className="h-4 w-4" />
                  Rename
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | undefined;
  onSubmit: () => Promise<void>;
  isLoading: boolean;
}

export function DeleteProjectDialog({
  open,
  onOpenChange,
  project,
  onSubmit,
  isLoading,
}: Readonly<DeleteProjectDialogProps>) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-text-primary">{project?.name}</span>? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isLoading}>
              {isLoading ? (
                "Deleting..."
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Project
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
