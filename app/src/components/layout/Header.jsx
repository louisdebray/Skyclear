export default function Header() {
  return (
    <header className="flex items-center gap-3 mb-8">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-brand/40 blur-lg animate-pulse-glow" />
        <img src={`${import.meta.env.BASE_URL}logo-skyclear.png`} alt="Skyclear" className="relative w-11 h-11 rounded-full" />
      </div>
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Skyclear</h1>
        <p className="text-muted text-sm">Le ciel ce soir, en un coup d'œil.</p>
      </div>
    </header>
  )
}
