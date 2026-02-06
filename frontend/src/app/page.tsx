import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-8">

      {/* Page Title */}
      <h1>Welcome to Our Website</h1>

      {/* Short description */}
      <p className="mt-2 max-w-xl">
        This page uses styles defined once in Tailwind and global.css.
        No colors or spacing are chosen here.
      </p>

      {/* Card Section */}
      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="card">
          <h2>Simple Design</h2>
          <p className="mt-2">
            Cards, buttons, and text follow global rules.
            If the theme changes, this card changes automatically.
          </p>

          <button className="btn-primary mt-4">
            Primary Action
          </button>
        </div>

        <div className="card">
          <h2>Safe & Consistent</h2>
          <p className="mt-2">
            No raw colors like blue or red are used here.
            Everything uses named styles.
          </p>

          <div className="mt-4 flex gap-3">
            <button className="btn-secondary">
              Secondary
            </button>
            <button className="btn-danger">
              Delete
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
