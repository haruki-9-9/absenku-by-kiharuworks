import { getCurrentUser } from "@/lib/auth/get-current-user";
import { redirect } from "next/navigation";
import GantiPasswordForm from "@/components/shared/GantiPasswordForm";

export default async function GantiPasswordPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH") redirect("/login");

  return <GantiPasswordForm />;
}
