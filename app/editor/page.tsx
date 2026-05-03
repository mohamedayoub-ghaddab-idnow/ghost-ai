import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { EditorHome } from "@/components/editor/editor-home";
import { getUserProjects } from "@/lib/data/projects";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editor | Ghost AI",
};

export default async function EditorPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { owned, shared } = await getUserProjects(userId);

  return <EditorHome ownedProjects={owned} sharedProjects={shared} />;
}
