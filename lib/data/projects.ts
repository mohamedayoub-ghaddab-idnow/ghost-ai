import { clerkClient } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export interface ProjectData {
  id: string
  name: string
  slug: string
  description: string | null
  status: string
  isOwner: boolean
  createdAt: Date
  updatedAt: Date
}

export async function getOwnedProjects(userId: string): Promise<ProjectData[]> {
  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return projects.map((p) => ({ ...p, isOwner: true }))
}

export async function getSharedProjects(userEmail: string): Promise<ProjectData[]> {
  const collaborations = await prisma.projectCollaborator.findMany({
    where: { collaboratorEmail: userEmail },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          ownerId: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return collaborations
    .filter((c) => c.project)
    .map((c) => ({
      ...c.project,
      isOwner: false,
    }))
}

export async function getUserProjects(userId: string): Promise<{
  owned: ProjectData[]
  shared: ProjectData[]
}> {
  // Get user email from Clerk
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const email = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId
  )?.emailAddress

  const [owned, shared] = await Promise.all([
    getOwnedProjects(userId),
    getSharedProjects(email ?? ""),
  ])

  return { owned, shared }
}
