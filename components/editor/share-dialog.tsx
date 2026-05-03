"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Users, Mail, X, Copy, Check, Loader2, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Collaborator {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  isOwner: boolean;
}

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  isOwner: boolean;
}

export function ShareDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  isOwner,
}: Readonly<ShareDialogProps>) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const prevOpenRef = useRef(open);

  const fetchCollaborators = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`);
      if (response.ok) {
        const data = await response.json();
        setCollaborators(data.collaborators);
      }
    } catch (error) {
      console.error("Failed to fetch collaborators:", error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Handle dialog open/close changes
  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;

    if (open && !wasOpen) {
      // Dialog just opened - fetch collaborators
      fetchCollaborators();
    } else if (!open && wasOpen) {
      // Dialog just closed - reset state via setTimeout to avoid synchronous setState
      const timeoutId = setTimeout(() => {
        setCollaborators([]);
        setInviteEmail("");
        setCopied(false);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [open, fetchCollaborators]);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !isOwner) return;

    setIsInviting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setCollaborators((prev) => [...prev, data.collaborator]);
        setInviteEmail("");
      } else {
        const error = await response.json();
        console.error("Failed to invite:", error);
      }
    } catch (error) {
      console.error("Failed to invite collaborator:", error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (collaboratorId: string) => {
    if (!isOwner) return;

    setRemovingId(collaboratorId);
    try {
      const response = await fetch(
        `/api/projects/${projectId}/collaborators/${collaboratorId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setCollaborators((prev) =>
          prev.filter((c) => c.id !== collaboratorId)
        );
      }
    } catch (error) {
      console.error("Failed to remove collaborator:", error);
    } finally {
      setRemovingId(null);
    }
  };

  const projectLink = typeof window !== "undefined"
    ? `${window.location.origin}/editor/${projectId}`
    : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(projectLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
          <DialogDescription>
            Manage access to <span className="font-medium text-text-primary">{projectName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Copy Link Section */}
          {isOwner && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Project Link
              </label>
              <div className="flex gap-2">
                <Input
                  value={projectLink}
                  readOnly
                  className="text-sm text-text-secondary"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-state-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-state-success">Copied!</p>
              )}
            </div>
          )}

          {/* Invite Section - Owner Only */}
          {isOwner && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Invite by Email
              </label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleInvite();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim() || isInviting}
                  className="shrink-0"
                >
                  {isInviting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Collaborators List */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary flex items-center gap-2">
              <Users className="h-4 w-4" />
              Collaborators
            </label>
            <div className="border border-border-default rounded-2xl divide-y divide-border-default max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
                </div>
              ) : collaborators.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm text-text-muted">No collaborators yet</p>
                </div>
              ) : (
                collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center justify-between p-3 hover:bg-bg-subtle/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <div className="flex items-center gap-3">
                      {collaborator.avatarUrl ? (
                        <img
                          src={collaborator.avatarUrl}
                          alt={collaborator.displayName || collaborator.email}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-bg-subtle flex items-center justify-center">
                          <Mail className="h-4 w-4 text-text-muted" />
                        </div>
                      )}
                      <div className="min-w-0">
                        {collaborator.displayName ? (
                          <>
                            <p className="text-sm font-medium text-text-primary truncate">
                              {collaborator.displayName}
                            </p>
                            <p className="text-xs text-text-muted truncate">
                              {collaborator.email}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-text-primary truncate">
                            {collaborator.email}
                          </p>
                        )}
                      </div>
                      {collaborator.isOwner && (
                        <span className="text-xs bg-accent-primary-dim text-accent-primary px-2 py-0.5 rounded-lg">
                          Owner
                        </span>
                      )}
                    </div>
                    {isOwner && !collaborator.isOwner && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(collaborator.id)}
                        disabled={removingId === collaborator.id}
                        className="shrink-0 text-text-muted hover:text-state-error"
                      >
                        {removingId === collaborator.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
