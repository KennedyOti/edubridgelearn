// app/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authService } from "@/lib/services/auth.service";

export default async function DashboardRedirect() {
  // Server component: cookies() returns a Promise
  const cookieStore = await cookies();
  // const token = cookieStore.get("token")?.value;
  const token = cookieStore.get("token");

  if (!token) redirect("/login");

  let user;
  try {
    // Fetch user from backend; cookie sent automatically
    user = await authService.getUser();
  } catch {
    redirect("/login");
  }

  // Redirect to role-specific dashboard
  redirect(`/dashboard/${user.role}`);
}
