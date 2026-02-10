export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-lg font-bold">EduBridge</span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              Empowering learners worldwide
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <a
              href="#"
              className="text-sm text-[var(--text-muted)] hover:text-primary transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-sm text-[var(--text-muted)] hover:text-primary transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-sm text-[var(--text-muted)] hover:text-primary transition-colors"
            >
              Contact
            </a>
            <p className="text-sm text-[var(--text-muted)]">
              © {new Date().getFullYear()} EduBridge. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}