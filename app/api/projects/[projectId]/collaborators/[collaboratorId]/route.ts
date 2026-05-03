import { auth } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ projectId: string; collaboratorId: string }>
}

// DELETE - Remove a collaborator (owner only)
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId, collaboratorId } = await params

  // Verify ownership
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

  // Verify the collaborator exists and belongs to this project
  const collaborator = await prisma.projectCollaborator.findUnique({
    where: { id: collaboratorId },
    select: { projectId: true },
  })

  if (!collaborator) {
    return NextResponse.json({ error: "Collaborator not found" }, { status: 404 })
  }

  if (collaborator.projectId !== projectId) {
    return NextResponse.json({ error: "Collaborator does not belong to this project" }, { status: 400 })
  }

  // Delete the collaborator
  await prisma.projectCollaborator.delete({
    where: { id: collaboratorId },
  })

  return NextResponse.json({ success: true })
}
