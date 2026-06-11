import { useMemo, useState } from 'react'
import { Document as PdfDocument, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const demoDocuments = [
  {
    id: 'demo-contract',
    title: 'Vendor Agreement',
    originalFileName: 'vendor-agreement.pdf',
    fileSize: 248000,
    status: 'draft',
    createdAt: new Date().toISOString(),
    previewUrl: '',
  },
  {
    id: 'demo-nda',
    title: 'Employee NDA',
    originalFileName: 'employee-nda.pdf',
    fileSize: 192000,
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    previewUrl: '',
  },
]

const formatFileSize = (size) => {
  if (!size) return '0 KB'

  return `${(size / 1024).toFixed(1)} KB`
}

const formatDate = (date) =>
  new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))

function App() {
  const [token, setToken] = useState(localStorage.getItem('authToken') || '')
  const [documents, setDocuments] = useState(demoDocuments)
  const [selectedDocument, setSelectedDocument] = useState(demoDocuments[0])
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingSignature, setIsSavingSignature] = useState(false)
  const [error, setError] = useState('')
  const [numPages, setNumPages] = useState(null)
  const [signatures, setSignatures] = useState([])
  const [signerName, setSignerName] = useState('')
  const [signerEmail, setSignerEmail] = useState('')
  const [draftSignature, setDraftSignature] = useState(null)

  const hasLiveDocuments = documents.some((document) => document.previewUrl)

  const statusCounts = useMemo(
    () =>
      documents.reduce(
        (counts, document) => ({
          ...counts,
          [document.status]: (counts[document.status] || 0) + 1,
        }),
        {}
      ),
    [documents]
  )

  const fetchDocuments = async () => {
    if (!token.trim()) {
      setError('Paste a JWT token from login to fetch your uploaded files.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      localStorage.setItem('authToken', token.trim())

      const response = await fetch(`${API_BASE_URL}/api/docs`, {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to fetch documents')
      }

      const nextDocuments = data.documents || []
      setDocuments(nextDocuments)
      setSelectedDocument(nextDocuments[0] || null)

      if (nextDocuments[0]) {
        fetchSignatures(nextDocuments[0].id)
      } else {
        setSignatures([])
      }
    } catch (fetchError) {
      setError(fetchError.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSignatures = async (documentId) => {
    if (!token.trim() || !documentId || documentId.startsWith('demo')) {
      setSignatures([])
      return
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/docs/${documentId}/signatures`,
        {
          headers: {
            Authorization: `Bearer ${token.trim()}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to fetch signatures')
      }

      setSignatures(data.signatures || [])
      setDraftSignature(null)
    } catch (fetchError) {
      setError(fetchError.message)
    }
  }

  const placeDraftSignature = (event) => {
    if (!selectedDocument?.previewUrl || !token.trim()) {
      setError('Load a live PDF document before placing a signature.')
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const width = 180
    const height = 56
    const x = Math.min(
      Math.max(0, Math.round(event.clientX - rect.left - width / 2)),
      Math.max(0, Math.round(rect.width - width))
    )
    const y = Math.min(
      Math.max(0, Math.round(event.clientY - rect.top - height / 2)),
      Math.max(0, Math.round(rect.height - height))
    )

    setDraftSignature({
      coordinates: {
        page: 1,
        x,
        y,
        width,
        height,
      },
    })
    setError('')
  }

  const saveSignaturePlaceholder = async () => {
    if (!selectedDocument?.previewUrl || !token.trim()) {
      setError('Load a live PDF document before saving a signature.')
      return
    }

    if (!draftSignature) {
      setError('Drag the signature field onto the PDF before saving.')
      return
    }

    if (!signerEmail.trim()) {
      setError('Signer email is required before saving a signature.')
      return
    }

    setIsSavingSignature(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/signatures`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: selectedDocument.id,
          signer: {
            name: signerName.trim(),
            email: signerEmail.trim(),
          },
          ...draftSignature.coordinates,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save signature position')
      }

      setSignatures((currentSignatures) => [
        data.signature,
        ...currentSignatures,
      ])
      setDraftSignature(null)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setIsSavingSignature(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-ink">
      <section className="mx-auto w-full max-w-7xl px-5 py-6">
        <nav className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-trust text-lg font-bold text-white">
              DS
            </div>
            <div>
              <p className="text-sm font-semibold text-trust">
                Document Signature
              </p>
              <h1 className="text-2xl font-bold">Documents Dashboard</h1>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="h-11 min-w-72 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-trust"
              onChange={(event) => setToken(event.target.value)}
              placeholder="Paste JWT token"
              type="password"
              value={token}
            />
            <button
              className="h-11 rounded-lg bg-trust px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={isLoading}
              onClick={fetchDocuments}
              type="button"
            >
              {isLoading ? 'Loading...' : 'Fetch Files'}
            </button>
          </div>
        </nav>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-500">Total files</p>
            <p className="mt-2 text-3xl font-bold">{documents.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-500">Draft</p>
            <p className="mt-2 text-3xl font-bold">{statusCounts.draft || 0}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-500">Pending</p>
            <p className="mt-2 text-3xl font-bold">
              {statusCounts.pending || 0}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-500">Signed</p>
            <p className="mt-2 text-3xl font-bold">
              {statusCounts.signed || 0}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {!hasLiveDocuments && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Showing demo rows. Paste a JWT token and click Fetch Files to load
            uploaded PDFs from the backend.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-bold">Uploaded Documents</h2>
              <p className="mt-1 text-sm text-slate-500">
                Files returned from your protected document API.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {documents.length === 0 && (
                <div className="p-6 text-sm text-slate-500">
                  No documents uploaded yet.
                </div>
              )}

              {documents.map((document) => (
                <button
                  className={`block w-full px-5 py-4 text-left transition hover:bg-slate-50 ${
                    selectedDocument?.id === document.id ? 'bg-blue-50' : ''
                  }`}
                  key={document.id}
                  onClick={() => {
                    setSelectedDocument(document)
                    setNumPages(null)
                    setDraftSignature(null)
                    fetchSignatures(document.id)
                  }}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{document.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {document.originalFileName}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">
                      {document.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>{formatFileSize(document.fileSize)}</span>
                    <span>{formatDate(document.createdAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold">PDF Preview</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedDocument
                    ? selectedDocument.originalFileName
                    : 'Select a file'}
                </p>
              </div>
              {selectedDocument?.previewUrl && (
                <a
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-trust hover:text-trust"
                  href={selectedDocument.previewUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open PDF
                </a>
              )}
            </div>

            <div className="grid gap-3 border-b border-slate-100 px-5 py-4 lg:grid-cols-[1fr_1fr_auto_auto]">
              <input
                className="h-10 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-trust"
                onChange={(event) => setSignerName(event.target.value)}
                placeholder="Signer name"
                value={signerName}
              />
              <input
                className="h-10 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-trust"
                onChange={(event) => setSignerEmail(event.target.value)}
                placeholder="Signer email"
                type="email"
                value={signerEmail}
              />
              <div
                className="grid h-10 cursor-grab place-items-center rounded-lg border border-dashed border-teal-500 bg-teal-50 px-4 text-xs font-bold text-teal-800 active:cursor-grabbing"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData('text/plain', 'signature-field')
                  event.dataTransfer.effectAllowed = 'copy'
                }}
              >
                Drag signature field
              </div>
              <button
                className="h-10 rounded-lg bg-trust px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={isSavingSignature || !draftSignature}
                onClick={saveSignaturePlaceholder}
                type="button"
              >
                {isSavingSignature ? 'Saving...' : 'Save Position'}
              </button>
            </div>

            <div className="min-h-[620px] bg-slate-200 p-4">
              {selectedDocument?.previewUrl ? (
                <div className="mx-auto flex max-w-3xl justify-center overflow-auto rounded-lg bg-white p-4">
                  <PdfDocument
                    file={selectedDocument.previewUrl}
                    loading={
                      <p className="p-8 text-sm text-slate-500">
                        Loading PDF preview...
                      </p>
                    }
                    onLoadSuccess={({ numPages: nextNumPages }) =>
                      setNumPages(nextNumPages)
                    }
                  >
                    <div
                      className="relative"
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={placeDraftSignature}
                    >
                      <Page pageNumber={1} width={620} />
                      {signatures.map((signature) => (
                        <div
                          className="absolute grid place-items-center rounded-md border-2 border-dashed border-teal-600 bg-teal-100/80 px-3 text-center text-xs font-bold text-teal-800 shadow-sm"
                          key={signature._id || signature.id}
                          style={{
                            left: `${signature.coordinates.x}px`,
                            top: `${signature.coordinates.y}px`,
                            width: `${signature.coordinates.width}px`,
                            height: `${signature.coordinates.height}px`,
                          }}
                        >
                          Sign here
                          <span className="block truncate font-medium">
                            {signature.signer.email}
                          </span>
                        </div>
                      ))}
                      {draftSignature && (
                        <div
                          className="absolute grid place-items-center rounded-md border-2 border-dashed border-blue-600 bg-blue-100/80 px-3 text-center text-xs font-bold text-blue-800 shadow-sm"
                          style={{
                            left: `${draftSignature.coordinates.x}px`,
                            top: `${draftSignature.coordinates.y}px`,
                            width: `${draftSignature.coordinates.width}px`,
                            height: `${draftSignature.coordinates.height}px`,
                          }}
                        >
                          New signature
                          <span className="block truncate font-medium">
                            {signerEmail || 'pending signer'}
                          </span>
                        </div>
                      )}
                    </div>
                    {numPages > 1 && (
                      <p className="mt-3 text-center text-sm text-slate-500">
                        Page 1 of {numPages}
                      </p>
                    )}
                  </PdfDocument>
                </div>
              ) : (
                <div className="grid min-h-[560px] place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <div>
                    <p className="text-lg font-bold text-slate-700">
                      Preview appears after live documents load
                    </p>
                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Upload a PDF through the backend, login to get a JWT, and
                      fetch files here to render the first page with react-pdf.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}

export default App
