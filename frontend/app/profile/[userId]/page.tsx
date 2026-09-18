"use client";

import { useParams } from "next/navigation";
import Profile from "@/features/profile/components/Profile";
import AppShell from "@/components/layout/AppShell";

export default function UserProfilePage() {
  const params = useParams();

  const userId = params.userId as string;

  return (
    <AppShell>
        <Profile userId={userId} />
    </AppShell>
  );
}
