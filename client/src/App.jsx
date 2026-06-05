function App() {
  const steps = [
    'Upload secure PDFs',
    'Place signature coordinates',
    'Share signer links',
    'Generate audit trails',
  ]

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-10">
        <nav className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-trust text-lg font-bold text-white">
              DS
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-trust">
                Labmentrix Internship
              </p>
              <h1 className="text-xl font-bold text-ink">Document Signature</h1>
            </div>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
            MERN Stack
          </span>
        </nav>

        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-mint">
              Day 1 setup complete
            </p>
            <h2 className="max-w-3xl text-4xl font-black leading-tight text-ink sm:text-5xl">
              Secure signing workflows for documents, identities, and audit
              trails.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              A production-style digital signature app foundation with React,
              Tailwind CSS, Express, MongoDB, JWT auth, file uploads, and PDF
              processing libraries ready for the next build phase.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button className="rounded-lg bg-trust px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                Upload Document
              </button>
              <button className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-trust hover:text-trust">
                View Dashboard
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Contract_2026.pdf
                </p>
                <p className="text-xs text-slate-400">Pending signature</p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                Pending
              </span>
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  className="flex items-center gap-3 rounded-lg bg-slate-50 p-3"
                  key={step}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-sm font-bold text-trust shadow-sm">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-700">
                    {step}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-lg border border-dashed border-mint bg-teal-50 p-4">
              <p className="text-sm font-semibold text-teal-800">
                Signature field
              </p>
              <p className="mt-1 text-sm text-teal-700">
                Coordinates, signer token, timestamp, and IP address will be
                stored in the audit log.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
