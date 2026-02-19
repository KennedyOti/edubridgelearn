// app/dashboard/page.tsx


"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/providers/AuthProvider";

export default function DashboardRedirect() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    switch (user.role) {
      case "admin":
        router.push("/dashboard/admin");
        break;
      case "student":
        router.push("/dashboard/student");
        break;
      case "tutor":
        router.push("/dashboard/tutor");
        break;
    }
  }, [user]);

  return null;
}
