import { auth } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ projectId: string }>
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

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, slug: true },
  })

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  if (project.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : undefined

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  // Generate new slug with unique suffix
  const baseSlug = generateSlug(name)
  const suffix = generateSuffix()
  const slug = `${baseSlug}-${suffix}`

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { name, slug },
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

  return NextResponse.json({ project: { ...updated, isOwner: true } })
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  })

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  if (project.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.project.delete({
    where: { id: projectId },
  })

  return NextResponse.json({ success: true })
}
