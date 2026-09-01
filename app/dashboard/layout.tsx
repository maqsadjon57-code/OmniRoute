import { Sidebar } from "@/components/dashboard/sidebar";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-xl sm:px-8">
          <div>
            <div className="text-sm font-bold">Gateway Console</div>
            <div className="text-xs text-muted-foreground">port 20128 · localhost</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right text-xs text-muted-foreground sm:block">
              <div className="font-semibold text-foreground">Local Admin</div>
              <div>admin@omniroute.local</div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-xs font-bold text-white">LA</div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
