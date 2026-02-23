"use client";

import { useAuth } from "@/hooks/useAuth";

export default function AdminDashboard() {
  const { user, loading } = useAuth();

  // Safe way to get display name
  const displayName =
    user?.name?.split(" ")[0] ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "Admin";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center text-danger text-xl">
        Access denied. Admins only.
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* =========================
          Header Section
      ========================== */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">
            Welcome back, {displayName} 👋
          </h2>
          <p className="text-muted-foreground mt-1">
            Here’s a snapshot of your platform today.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="btn btn-brand">
            Create Course
          </button>
          <button className="btn btn-outline">
            View Reports
          </button>
        </div>
      </section>

      {/* =========================
          Stats Grid
      ========================== */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="card card-hover">
          <h3>Total Students</h3>
          <p className="text-3xl font-bold mt-3 text-brand">
            1,240
          </p>
          <p className="text-sm text-muted mt-1">
            +8% this month
          </p>
        </div>

        <div className="card card-hover">
          <h3>Total Tutors</h3>
          <p className="text-3xl font-bold mt-3 text-academic">
            320
          </p>
          <p className="text-sm text-muted mt-1">
            +3 new this week
          </p>
        </div>

        <div className="card card-hover">
          <h3>Active Courses</h3>
          <p className="text-3xl font-bold mt-3 text-success">
            87
          </p>
          <p className="text-sm text-muted mt-1">
            12 launching soon
          </p>
        </div>

        <div className="card card-hover">
          <h3>Pending Reviews</h3>
          <p className="text-3xl font-bold mt-3 text-warning">
            14
          </p>
          <p className="text-sm text-muted mt-1">
            Needs attention
          </p>
        </div>

      </section>

      {/* =========================
          Analytics & Activity
      ========================== */}
      <section className="grid lg:grid-cols-3 gap-6">

        {/* Platform Overview */}
        <div className="card lg:col-span-2">
          <h3 className="mb-4">Platform Growth</h3>

          <div className="h-64 flex items-center justify-center border border-default rounded-xl bg-muted/20">
            <p className="text-muted-foreground">
              Chart component goes here (e.g. Recharts / ApexCharts)
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="mb-4">Recent Activity</h3>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium">New student registered</span>
              <span className="text-muted-foreground text-xs">2m ago</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium">Course “React Basics” published</span>
              <span className="text-muted-foreground text-xs">1h ago</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium">Tutor account approved</span>
              <span className="text-muted-foreground text-xs">3h ago</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium">Payment received — $249</span>
              <span className="text-muted-foreground text-xs">Yesterday</span>
            </div>
          </div>
        </div>

      </section>

      {/* =========================
          Quick Actions
      ========================== */}
      <section className="card">
        <h3 className="mb-6">Quick Actions</h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <button className="btn btn-academic w-full py-6 text-base">
            Add New Tutor
          </button>

          <button className="btn btn-success w-full py-6 text-base">
            Approve Pending Courses
          </button>

          <button className="btn btn-warning w-full py-6 text-base">
            Review Reports
          </button>

          <button className="btn btn-danger w-full py-6 text-base">
            View System Alerts
          </button>

        </div>
      </section>

    </div>
  );
}