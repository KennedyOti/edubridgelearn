export default function AdminDashboard() {
  return (
    <>
      <div>
        <h2>Welcome back 👋</h2>
        <p>Here’s what’s happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="card card-hover">
          <h3>Total Students</h3>
          <p className="text-2xl font-bold mt-2 text-brand">1,240</p>
        </div>

        <div className="card card-hover">
          <h3>Total Tutors</h3>
          <p className="text-2xl font-bold mt-2 text-academic">320</p>
        </div>

        <div className="card card-hover">
          <h3>Active Courses</h3>
          <p className="text-2xl font-bold mt-2 text-success">87</p>
        </div>

        <div className="card card-hover">
          <h3>Pending Reviews</h3>
          <p className="text-2xl font-bold mt-2 text-warning">14</p>
        </div>

      </div>
    </>
  );
}
