import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome to Our
              <span className="text-primary"> Learning Platform</span>
            </h1>
            <p className="text-xl text-[var(--text-muted)] mb-8 max-w-2xl mx-auto">
              Join thousands of students, tutors, and contributors in our vibrant learning community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn-primary px-8 py-3 text-lg">
                Get Started
              </Link>
              <Link href="/login" className="btn border border-primary text-primary hover:bg-primary/10 px-8 py-3 text-lg">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Choose Your Role</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Student',
                description: 'Learn from expert tutors, access curated resources, and track your progress.',
                icon: '🎓',
                color: 'primary',
              },
              {
                title: 'Tutor',
                description: 'Share your knowledge, create courses, and mentor students.',
                icon: '👨‍🏫',
                color: 'secondary',
              },
              {
                title: 'Contributor',
                description: 'Create learning materials, contribute resources, and help improve content.',
                icon: '📚',
                color: 'accent',
              },
            ].map((feature, index) => (
              <div key={index} className="card text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-[var(--text-muted)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="card bg-gradient-to-r from-primary/10 to-secondary/10">
            <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
            <p className="text-xl text-[var(--text-muted)] mb-8">
              Create your account and start your learning journey today.
            </p>
            <Link href="/register" className="btn-primary px-8 py-3 text-lg inline-block">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}