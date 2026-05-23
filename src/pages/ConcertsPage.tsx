import AppLayout from '../components/AppLayout'

const metrics: Array<[string, string]> = [
  ['Conciertos registrados', '0'],
  ['Próximos a caducar', '0'],
  ['PDFs generados', '0'],
]

function ConcertsPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl">Conciertos</h1>
            <p className="text-sm text-muted mt-1">
              Registra tus conciertos y genera el documento oficial de SGAE en un clic.
            </p>
          </div>
          <button className="btn-primary" disabled title="Disponible en el siguiente paso">
            + Nuevo concierto
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {metrics.map(([label, value]) => (
            <div key={label} className="rounded-xl bg-paper border border-line p-4">
              <div className="text-xs text-muted">{label}</div>
              <div className="font-serif text-2xl font-semibold mt-1">{value}</div>
            </div>
          ))}
        </div>

        <div className="card p-12 text-center">
          <p className="font-serif text-lg">Aún no hay conciertos</p>
          <p className="text-sm text-muted mt-2 max-w-md mx-auto">
            Esta sección se completará en el siguiente paso: alta de conciertos con todos los
            datos que pide el formulario de SGAE, selección del setlist y generación del PDF.
          </p>
        </div>
      </div>
    </AppLayout>
  )
}

export default ConcertsPage
