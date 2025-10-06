// src/app/(user)/user/dashboard/page.tsx

"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#EEE3CB] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-[#B7C4CF] rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-semibold text-[#967E76]">
              User Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="bg-[#D7C0AE] hover:bg-[#967E76] text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="bg-[#EEE3CB] rounded-lg p-6 mb-6">
            <p className="text-[#967E76] text-lg">
              Welcome, <span className="font-semibold">{user?.email}</span>
            </p>
          </div>

          <div className="text-center py-12">
            <p className="text-[#967E76] text-xl">This is the User dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}
