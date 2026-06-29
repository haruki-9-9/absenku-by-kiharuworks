import { getCurrentUser } from "@/lib/auth/get-current-user";
import { redirect } from "next/navigation";
import Sidebar from "@/components/sekretaris/Sidebar";
import Header from "@/components/shared/SharedHeader";
import SekretarisBottomNav from "@/components/sekretaris/SekretarisBottomNav";

export default async function SekretarisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "SEKRETARIS") {
    redirect("/login");
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        background:
          "linear-gradient(135deg, #e0e7ff 0%, #f0e6ff 30%, #fce7f3 60%, #e0f2fe 100%)",
      }}
    >
      {/* Blob background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)", top: -100, left: -100 }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)", bottom: -50, right: -50 }} />
      </div>

      {/* Desktop sidebar */}
      <div className="absenku-sidebar-wrap">
        <Sidebar />
      </div>
      <style>{`
        .absenku-sidebar-wrap { width: 220px; flex-shrink: 0; position: relative; z-index: 10; }
        @media (max-width: 768px) { .absenku-sidebar-wrap { display: none; } }
      `}</style>

      {/* Mobile top bar */}
      <SekretarisBottomNav />

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Desktop header */}
        <div className="absenku-desktop-header">
          <Header user={user} />
        </div>
        <style>{`
          .absenku-desktop-header { display: block; }
          @media (max-width: 768px) { .absenku-desktop-header { display: none; } }
        `}</style>

        <main style={{ flex: 1, overflowY: "auto", background: "transparent" }}>
          <div className="absenku-main-padding">
            {children}
          </div>
          <style>{`
            .absenku-main-padding { padding: 28px 32px; }
            @media (max-width: 768px) {
              .absenku-main-padding {
                padding: 16px 16px 80px;
              }
            }
          `}</style>
        </main>
      </div>
    </div>
  );
}
