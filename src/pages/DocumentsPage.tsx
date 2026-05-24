import { useEffect, useState } from 'react'
import { getMyDocuments, getDocumentDownloadUrl, deleteDocument } from '../services/documentService'
import type { GeneratedDocument } from '../types/document'
import AppLayout from '../components/AppLayout'

function DocumentsPage() {
  const [docs, setDocs] = useState<GeneratedDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    getMyDocuments()
      .then((data) => {
        setDocs(data)
        setError(null)
      })
      .catch(() => setError('No se pudieron cargar los documentos'))
      .finally(() => setLoading(false))
  }, [])

  async function handleDownload(id: number) {
    setActionError(null)
    setDownloadingId(id)
    try {
      const res = await getDocumentDownloadUrl(id)
      const link = document.createElement('a')
      link.href = res.downloadUrl
      link.download = res.filename
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {
      setActionError('No se pudo descargar el documento (¿la sesión de AWS ha caducado?)')
    } finally {
      setDownloadingId(null)
    }
  }

  async function handleDelete(id: number) {
    const ok = window.confirm(
      '¿Seguro que quieres eliminar este documento? Se borrará también el PDF y no se puede deshacer.',
    )
    if (!ok) return
    setActionError(null)
    setDeletingId(id)
    try {
      await deleteDocument(id)
      setDocs((prev) => prev.filter((d) => d.id !== id))
    } catch {
      setActionError('No se pudo eliminar el documento')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl">Mis Documentos</h1>
          <p className="text-sm text-muted mt-1">
            PDFs de SGAE que has generado. Haz clic para volver a descargarlos.
          </p>
        </div>

        {loading && <p className="text-muted">Cargando documentos…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {actionError && <p className="text-sm text-red-600">{actionError}</p>}

        {!loading && !error && docs.length === 0 && (
          <div className="card p-12 text-center">
            <p className="font-serif text-lg">Aún no has generado documentos</p>
            <p className="text-sm text-muted mt-2 max-w-md mx-auto">
              Genera el PDF de SGAE desde la ficha de un concierto y aparecerá aquí.
            </p>
          </div>
        )}

        {!loading && !error && docs.length > 0 && (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-line text-muted">
                <tr>
                  <th className="p-3 text-left font-medium">Concierto</th>
                  <th className="p-3 text-left font-medium">Fecha concierto</th>
                  <th className="p-3 text-left font-medium">Generado</th>
                  <th className="p-3 text-left font-medium">Completitud</th>
                  <th className="p-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id} className="border-t border-line">
                    <td className="p-3 font-medium">{d.concert?.showTitle ?? '—'}</td>
                    <td className="p-3 text-muted">{d.concert?.date ?? '—'}</td>
                    <td className="p-3 text-muted">{d.createAt ?? '—'}</td>
                    <td className="p-3 text-muted">{d.completionPercentage}%</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDownload(d.id)}
                          disabled={downloadingId === d.id}
                          className="btn-ghost btn-sm"
                        >
                          {downloadingId === d.id ? 'Descargando…' : 'Descargar'}
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          disabled={deletingId === d.id}
                          className="btn-ghost btn-sm text-red-600"
                        >
                          {deletingId === d.id ? 'Eliminando…' : 'Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default DocumentsPage
