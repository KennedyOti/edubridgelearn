// app/page.tsx

import Link from "next/link";

export default function HomePage() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 text-center">
      
      {/* Hero */}
      <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
        Learn. Teach. Build. <br />
        <span className="text-indigo-600">
          Together.
        </span>
      </h2>

      <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
        EduBridgeLearn connects students, tutors, and knowledge contributors 
        in one collaborative learning universe.
      </p>

      <div className="mt-10 flex justify-center gap-6">
        <Link
          href="/register"
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
        >
          Start Your Journey
        </Link>

        <Link
          href="/login"
          className="border border-gray-300 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
        >
          I Already Have Superpowers
        </Link>
      </div>

      {/* Features Section */}
      <div className="mt-24 grid md:grid-cols-3 gap-10 text-left">
        
        <div className="bg-white p-8 rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg mb-3">🎓 Students</h3>
          <p className="text-gray-600 text-sm">
            Discover lessons, ask questions, and unlock knowledge at your pace.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg mb-3">🧑‍🏫 Tutors</h3>
          <p className="text-gray-600 text-sm">
            Share expertise, guide learners, and grow your teaching presence.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg mb-3">📚 Contributors</h3>
          <p className="text-gray-600 text-sm">
            Create valuable educational content and shape the learning ecosystem.
          </p>
        </div>

      </div>
    </section>
  );
}
