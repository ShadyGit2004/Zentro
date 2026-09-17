"use client";

import { useParams } from "next/navigation";
import Profile from "@/features/profile/components/Profile";

export default function UserProfilePage() {
  const params = useParams();

  const userId = params.userId as string;

  return (
    <main className="container mx-auto px-4 py-8">
      <Profile userId={userId} />
    </main>
  );
}
