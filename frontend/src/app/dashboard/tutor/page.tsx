export default function TutorDashboard() {
  return (
    <>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Good to see you 👋</h2>
        <p className="text-muted">Here’s your teaching overview.</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card card-hover">
          <h3>Active Students</h3>
          <p className="text-2xl font-bold mt-2 text-brand">48</p>
        </div>

        <div className="card card-hover">
          <h3>Courses Teaching</h3>
          <p className="text-2xl font-bold mt-2 text-academic">5</p>
        </div>

        <div className="card card-hover">
          <h3>Upcoming Sessions</h3>
          <p className="text-2xl font-bold mt-2 text-warning">7</p>
        </div>

        <div className="card card-hover">
          <h3>Pending Reviews</h3>
          <p className="text-2xl font-bold mt-2 text-success">2</p>
        </div>
      </div>

      {/* Upcoming Schedule */}
      <div className="card mt-6">
        <h3 className="mb-4">Upcoming Sessions</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Algebra Class</p>
              <p className="text-sm text-muted">Today • 2:00 PM</p>
            </div>
            <span className="badge-warning">Soon</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Physics Workshop</p>
              <p className="text-sm text-muted">Tomorrow • 11:00 AM</p>
            </div>
            <span className="badge-default">Scheduled</span>
          </div>
        </div>
      </div>
    </>
  );
}
