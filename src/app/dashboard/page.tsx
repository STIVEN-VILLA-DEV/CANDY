import Navbar from "@/components/navbar";
import DashboardClient from "@/components/dashboard/dashboard-client";

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <DashboardClient />
      </main>
    </>
  );
}
