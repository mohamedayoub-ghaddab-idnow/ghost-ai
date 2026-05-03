import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { AccessDenied } from "@/components/editor/access-denied";
import { WorkspaceClient } from "@/components/editor/workspace-client";
import { checkProjectAccess } from "@/lib/project-access";
import { getUserProjects } from "@/lib/data/projects";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editor | Ghost AI",
};

interface EditorRoomPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function EditorRoomPage({ params }: EditorRoomPageProps) {
  const { userId } = await auth();

  // Unauthenticated users redirect to sign-in
  if (!userId) {
    redirect("/sign-in");
  }

  const { roomId } = await params;

  // Check project access
  const { hasAccess, project, isOwner } = await checkProjectAccess(roomId);

  // Non-existent or unauthorized projects show AccessDenied
  if (!hasAccess || !project) {
    return <AccessDenied />;
  }

  // Get all projects for sidebar
  const { owned, shared } = await getUserProjects(userId);

  // Create the project data with isOwner flag
  const currentProject = {
    ...project,
    isOwner,
  };

  return (
    <WorkspaceClient
      project={currentProject}
      ownedProjects={owned}
      sharedProjects={shared}
    />
  );
}
