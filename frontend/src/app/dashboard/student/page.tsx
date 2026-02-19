export default function StudentDashboard() {
  return (
    <>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Welcome back 👋</h2>
        <p className="text-muted">Keep learning. You're making progress.</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card card-hover">
          <h3>Enrolled Courses</h3>
          <p className="text-2xl font-bold mt-2 text-brand">6</p>
        </div>

        <div className="card card-hover">
          <h3>Completed Lessons</h3>
          <p className="text-2xl font-bold mt-2 text-success">42</p>
        </div>

        <div className="card card-hover">
          <h3>Pending Assignments</h3>
          <p className="text-2xl font-bold mt-2 text-warning">3</p>
        </div>

        <div className="card card-hover">
          <h3>Overall Progress</h3>
          <p className="text-2xl font-bold mt-2 text-academic">78%</p>
        </div>
      </div>

      {/* Current Courses */}
      <div className="card mt-6">
        <h3 className="mb-4">Continue Learning</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Advanced Mathematics</p>
              <p className="text-sm text-muted">Next: Linear Algebra</p>
            </div>
            <button className="btn-primary">Resume</button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Physics Fundamentals</p>
              <p className="text-sm text-muted">Next: Thermodynamics</p>
            </div>
            <button className="btn-primary">Resume</button>
          </div>
        </div>
      </div>
    </>
  );
}
