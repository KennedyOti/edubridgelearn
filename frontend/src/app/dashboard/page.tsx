'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/hooks/auth';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import { useTheme } from 'next-themes';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();

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
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full capitalize">
                  {user.role}
                </span>
                <span className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full">
                  {user.approved_at ? 'Approved' : 'Pending Approval'}
                </span>
                <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">
                  {theme} mode
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-danger text-white rounded-lg hover:opacity-90"
            >
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats Card */}
            <div className="card">
              <h3 className="font-semibold mb-4 flex items-center justify-between">
                <span>Account Info</span>
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Email:</span>
                  <span className="text-sm font-medium">{user.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Role:</span>
                  <span className="text-sm font-medium capitalize">{user.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Status:</span>
                  <span className={`text-sm font-medium ${user.approved_at ? 'text-secondary' : 'text-accent'}`}>
                    {user.approved_at ? 'Approved' : 'Pending Approval'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Email Verified:</span>
                  <span className={`text-sm font-medium ${user.email_verified_at ? 'text-secondary' : 'text-danger'}`}>
                    {user.email_verified_at ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card md:col-span-2">
              <h3 className="font-semibold mb-4 flex items-center justify-between">
                <span>Quick Actions</span>
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.role === 'student' && (
                  <>
                    <button className="card hover:border-primary cursor-pointer transition-colors text-left">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium">Enroll in Course</h4>
                          <p className="text-xs text-[var(--text-muted)]">Browse available courses</p>
                        </div>
                      </div>
                    </button>
                    <button className="card hover:border-primary cursor-pointer transition-colors text-left">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium">View Progress</h4>
                          <p className="text-xs text-[var(--text-muted)]">Track your learning journey</p>
                        </div>
                      </div>
                    </button>
                  </>
                )}
                {user.role === 'tutor' && (
                  <>
                    <button className="card hover:border-primary cursor-pointer transition-colors text-left">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium">Create Course</h4>
                          <p className="text-xs text-[var(--text-muted)]">Design new learning content</p>
                        </div>
                      </div>
                    </button>
                    <button className="card hover:border-primary cursor-pointer transition-colors text-left">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium">Manage Students</h4>
                          <p className="text-xs text-[var(--text-muted)]">View and assist learners</p>
                        </div>
                      </div>
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