import { getCurrentUser } from "@/lib/auth/get-current-user";
import { redirect } from "next/navigation";
import Sidebar from "@/components/developer/Sidebar";
import Header from "@/components/developer/Header";

export default async function DeveloperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "DEVELOPER") {
    redirect("/login");
  }

  return (
    <div className="flex h-screen font-sans overflow-hidden" style={{
      background: "linear-gradient(135deg, #e0e7ff 0%, #f0e6ff 30%, #fce7f3 60%, #e0f2fe 100%)",
    }}>
      {/* Blob background */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          top: -100, left: -100,
        }} />
        <div style={{
          position: "absolute", width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)",
          bottom: -50, right: -50,
        }} />
      </div>
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden" style={{ position: "relative", zIndex: 1 }}>
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
