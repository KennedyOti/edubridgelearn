'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/hooks/auth';
import LoadingSpinner from '@/components/auth/LoadingSpinner';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-[var(--text-muted)]">
                Welcome back, {user.name}!
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-danger text-white rounded-lg hover:opacity-90"
            >
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="font-semibold mb-2">Account Info</h3>
              <div className="space-y-2">
                <p className="text-sm text-[var(--text-muted)]">Email: {user.email}</p>
                <p className="text-sm text-[var(--text-muted)]">Role: <span className="capitalize">{user.role}</span></p>
                <p className="text-sm text-[var(--text-muted)]">
                  Status: {user.approved_at ? 'Approved' : 'Pending Approval'}
                </p>
              </div>
            </div>

            <div className="card md:col-span-2">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                {user.role === 'student' && (
                  <>
                    <button className="card hover:border-primary cursor-pointer transition-colors">
                      <h4 className="font-medium">Enroll in Course</h4>
                    </button>
                    <button className="card hover:border-primary cursor-pointer transition-colors">
                      <h4 className="font-medium">View Progress</h4>
                    </button>
                  </>
                )}
                {user.role === 'tutor' && (
                  <>
                    <button className="card hover:border-primary cursor-pointer transition-colors">
                      <h4 className="font-medium">Create Course</h4>
                    </button>
                    <button className="card hover:border-primary cursor-pointer transition-colors">
                      <h4 className="font-medium">Manage Students</h4>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}