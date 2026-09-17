"use client";

import { useAuth } from "@/features/auth/AuthProvider";
import Profile from "@/features/profile/components/Profile";

const ProfilePage = () => {
  const { user } = useAuth();

  if (!user?.id) {
    return null;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Profile userId={user.id} />
    </main>
  );
};

export default ProfilePage;
