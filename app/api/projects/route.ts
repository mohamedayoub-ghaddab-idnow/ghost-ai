import { auth } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch owned projects
  const ownedProjects = await prisma.project.findMany({
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

  // Fetch shared projects (where user is a collaborator)
  const collaborations = await prisma.projectCollaborator.findMany({
    where: { collaboratorEmail: userId },
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

  const sharedProjects = collaborations
    .filter((c) => c.project)
    .map((c) => ({
      ...c.project,
      isOwner: false,
    }))

  return NextResponse.json({
    owned: ownedProjects.map((p) => ({ ...p, isOwner: true })),
    shared: sharedProjects,
  })
}

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9\s-]/g, "")
    .replaceAll(/\s+/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "")
  return base || "project"
}

function generateSuffix(): string {
  return Math.random().toString(36).slice(2, 8)
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : "Untitled Project"
  const description = typeof body.description === "string" ? body.description : null

  // Generate slug with unique suffix to create roomId
  const baseSlug = generateSlug(name)
  const suffix = generateSuffix()
  const slug = `${baseSlug}-${suffix}`

  const project = await prisma.project.create({
    data: {
      ownerId: userId,
      name,
      description,
      slug,
    },
    select: {
      id: true,
      name: true,
      description: true,
      slug: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({ project: { ...project, isOwner: true } }, { status: 201 })
}
