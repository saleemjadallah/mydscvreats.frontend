import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RestaurantProvider } from "@/hooks/use-restaurant";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <main className="min-h-screen px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Clerk configuration required</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-stone">
              Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to
              `frontend/.env.local`, then reload the dashboard.
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <RestaurantProvider>
      <main className="grain min-h-screen px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto max-w-7xl md:flex md:items-start md:gap-6">
          <DashboardSidebar />
          <div className="min-w-0 flex-1 space-y-6 overflow-x-hidden">
            <DashboardTopbar />
            {children}
          </div>
        </div>
      </main>
    </RestaurantProvider>
  );
}
