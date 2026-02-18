// src/app/page.tsx

import Link from "next/link";

export default function HomePage() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 text-center">
      
      {/* Hero */}
      <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
        Learn. Teach. Build. <br />
        <span className="text-brand">
          Together.
        </span>
      </h2>

      <p className="mt-6 text-text-muted text-lg max-w-2xl mx-auto">
        EduBridgeLearn connects students, tutors, and knowledge contributors 
        in one collaborative learning universe.
      </p>

      {/* Call-to-Action */}
      <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
        <Link href="/register" className="btn btn-brand">
          Start Your Journey
        </Link>

        <Link href="/login" className="btn btn-outline">
          I Already Have Superpowers
        </Link>
      </div>

      {/* Features Section */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 text-left">
        
        <div className="card card-hover">
          <h3 className="font-bold text-lg mb-3">Students</h3>
          <p className="text-text-muted text-sm">
            Discover lessons, ask questions, and unlock knowledge at your pace.
          </p>
        </div>

        <div className="card card-hover">
          <h3 className="font-bold text-lg mb-3">Tutors</h3>
          <p className="text-text-muted text-sm">
            Share expertise, guide learners, and grow your teaching presence.
          </p>
        </div>

        <div className="card card-hover">
          <h3 className="font-bold text-lg mb-3">Contributors</h3>
          <p className="text-text-muted text-sm">
            Create valuable educational content and shape the learning ecosystem.
          </p>
        </div>

      </div>
    </section>
  );
}
