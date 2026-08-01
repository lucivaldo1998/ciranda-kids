import { getSettings } from "@/lib/settings";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { logoutAction } from "@/app/admin/login/actions";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 lg:flex">
      <AdminSidebar brandName={settings.brandName} logoutAction={logoutAction} />
      <div className="min-w-0 flex-1 p-5 sm:p-8">{children}</div>
    </div>
  );
}
