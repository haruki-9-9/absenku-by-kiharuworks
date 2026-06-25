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
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
