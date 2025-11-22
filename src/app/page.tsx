import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function Home() {
  const user = await getUser();  

  if (user) {
    redirect("/dashboard");
  }

  redirect("/login");
}
