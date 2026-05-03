import { auth, clerkClient } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ projectId: string }>
}

interface ClerkUser {
  id: string
  emailAddresses: Array<{ id: string; emailAddress: string }>
  primaryEmailAddressId: string | null
  firstName: string | null
  lastName: string | null
  imageUrl: string
}

async function enrichCollaborators(
  collaborators: Array<{ id: string; collaboratorEmail: string; isOwner?: boolean }>,
  ownerId: string
) {
  const client = await clerkClient()

  // Get all collaborator emails
  const emails = collaborators.map((c) => c.collaboratorEmail)

  // Fetch all users by email from Clerk
  const usersMap = new Map<string, ClerkUser>()

  try {
    // Clerk API allows fetching users by email
    const usersResponse = await client.users.getUserList({
      emailAddress: emails,
    })

    for (const user of usersResponse.data) {
      const email = user.emailAddresses.find(
        (e) => e.id === user.primaryEmailAddressId
      )?.emailAddress

      if (email) {
        usersMap.set(email, user)
      }
    }
  } catch (error) {
    console.error("Failed to fetch Clerk users:", error)
  }

  // Also fetch the owner for display
  let ownerData: { displayName: string | null; avatarUrl: string | null; email: string } | null = null

  try {
    const ownerUser = await client.users.getUser(ownerId)
    const ownerEmail = ownerUser.emailAddresses.find(
      (e) => e.id === ownerUser.primaryEmailAddressId
    )?.emailAddress
    const ownerDisplayName = [ownerUser.firstName, ownerUser.lastName]
      .filter(Boolean)
      .join(" ") || null

    ownerData = {
      displayName: ownerDisplayName,
      avatarUrl: ownerUser.imageUrl,
      email: ownerEmail || "Unknown",
    }
  } catch (error) {
    console.error("Failed to fetch owner:", error)
  }

  // Map collaborators to enriched data
  const enrichedCollaborators = collaborators.map((c) => {
    const user = usersMap.get(c.collaboratorEmail)
    const displayName = user
      ? [user.firstName, user.lastName].filter(Boolean).join(" ") || null
      : null

    return {
      id: c.id,
      email: c.collaboratorEmail,
      displayName,
      avatarUrl: user?.imageUrl || null,
      isOwner: c.isOwner ?? false,
    }
  })

  // Add owner to the list
  if (ownerData) {
    enrichedCollaborators.unshift({
      id: "owner",
      email: ownerData.email,
      displayName: ownerData.displayName,
      avatarUrl: ownerData.avatarUrl,
      isOwner: true,
    })
  }

  return enrichedCollaborators
}

// GET - List collaborators
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params

  // Check if user has access to this project
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  })

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  // Get user email to check if they're a collaborator
  const client = await clerkClient()
  const currentUser = await client.users.getUser(userId)
  const userEmail = currentUser.emailAddresses.find(
    (e) => e.id === currentUser.primaryEmailAddressId
  )?.emailAddress

  // Check access: owner or collaborator
  const isOwner = project.ownerId === userId
  let isCollaborator = false

  if (!isOwner && userEmail) {
    const collaboration = await prisma.projectCollaborator.findUnique({
      where: {
        projectId_collaboratorEmail: {
          projectId,
          collaboratorEmail: userEmail,
        },
      },
    })
    isCollaborator = !!collaboration
  }

  if (!isOwner && !isCollaborator) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Fetch all collaborators
  const collaborators = await prisma.projectCollaborator.findMany({
    where: { projectId },
    select: {
      id: true,
      collaboratorEmail: true,
    },
    orderBy: { createdAt: "asc" },
  })

  // Enrich with Clerk data
  const enrichedCollaborators = await enrichCollaborators(
    collaborators,
    project.ownerId
  )

  return NextResponse.json({ collaborators: enrichedCollaborators })
}

// POST - Invite a collaborator (owner only)
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params

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

  // Parse request body
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const email = typeof body.email === "string" && body.email.trim()
    ? body.email.trim().toLowerCase()
    : null

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
  }

  // Check if already a collaborator
  const existing = await prisma.projectCollaborator.findUnique({
    where: {
      projectId_collaboratorEmail: {
        projectId,
        collaboratorEmail: email,
      },
    },
  })

  if (existing) {
    return NextResponse.json({ error: "User is already a collaborator" }, { status: 400 })
  }

  // Create collaborator
  const collaborator = await prisma.projectCollaborator.create({
    data: {
      projectId,
      collaboratorEmail: email,
    },
    select: {
      id: true,
      collaboratorEmail: true,
    },
  })

  // Enrich with Clerk data
  const client = await clerkClient()

  let displayName: string | null = null
  let avatarUrl: string | null = null

  try {
    const usersResponse = await client.users.getUserList({
      emailAddress: [email],
    })

    if (usersResponse.data.length > 0) {
      const user = usersResponse.data[0]
      displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || null
      avatarUrl = user.imageUrl
    }
  } catch (error) {
    console.error("Failed to fetch Clerk user:", error)
  }

  return NextResponse.json({
    collaborator: {
      id: collaborator.id,
      email: collaborator.collaboratorEmail,
      displayName,
      avatarUrl,
      isOwner: false,
    },
  }, { status: 201 })
}
