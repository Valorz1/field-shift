export default function Home() {
  return <main className="mx-auto max-w-5xl p-8">
    <p className="text-sm font-semibold uppercase tracking-widest text-green-700">Field Shift</p>
    <h1 className="mt-3 text-4xl font-semibold">Plan with the field in mind.</h1>
    <p className="mt-4 max-w-2xl text-lg text-gray-600">Explore climate signals, soil conditions, and practical farm strategies in one workspace.</p>
    <nav className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {["onboarding", "dashboard", "climate", "soil", "strategies", "compare", "session"].map((item) =>
        <a className="rounded-xl border bg-white p-5 capitalize shadow-sm hover:border-green-700" href={`/${item}`} key={item}>{item} →</a>
      )}
    </nav>
  </main>;
}
