export default function AdminDashboard() {
  return (
    <div className="space-y-8">

      {/* =========================
          Header Section
      ========================== */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2>Welcome back 👋</h2>
          <p>Here’s a snapshot of your platform today.</p>
        </div>

        <div className="flex gap-3">
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

          <div className="h-64 flex items-center justify-center border border-default rounded-xl">
            <p className="text-muted">
              Chart component goes here
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="mb-4">Recent Activity</h3>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span>New student registered</span>
              <span className="text-muted">2m ago</span>
            </div>

            <div className="flex justify-between">
              <span>Course “React Basics” published</span>
              <span className="text-muted">1h ago</span>
            </div>

            <div className="flex justify-between">
              <span>Tutor approved</span>
              <span className="text-muted">3h ago</span>
            </div>

            <div className="flex justify-between">
              <span>Payment received</span>
              <span className="text-muted">Yesterday</span>
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

          <button className="btn btn-academic w-full">
            Add Tutor
          </button>

          <button className="btn btn-success w-full">
            Approve Courses
          </button>

          <button className="btn btn-warning w-full">
            Review Reports
          </button>

          <button className="btn btn-danger w-full">
            System Alerts
          </button>

        </div>
      </section>

    </div>
  );
}
