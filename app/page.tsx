import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await currentUser();

  if (user) {
    redirect("/editor");
  }

  redirect("/sign-in");
}
