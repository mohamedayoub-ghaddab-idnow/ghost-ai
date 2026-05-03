import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId
  )?.emailAddress;

  return {
    userId,
    email: email ?? null,
  };
}

export async function checkProjectAccess(projectId: string) {
  const user = await getCurrentUser();

  if (!user) {
    return { hasAccess: false, project: null, isOwner: false };
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      status: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!project) {
    return { hasAccess: false, project: null, isOwner: false };
  }

  // Owner has access
  if (project.ownerId === user.userId) {
    return { hasAccess: true, project, isOwner: true };
  }

  // Check if user is a collaborator
  if (user.email) {
    const collaboration = await prisma.projectCollaborator.findUnique({
      where: {
        projectId_collaboratorEmail: {
          projectId,
          collaboratorEmail: user.email,
        },
      },
    });

    if (collaboration) {
      return { hasAccess: true, project, isOwner: false };
    }
  }

  return { hasAccess: false, project: null, isOwner: false };
}

export interface ProjectWithAccess {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  ownerId: string;
  isOwner: boolean;
  createdAt: Date;
  updatedAt: Date;
}
