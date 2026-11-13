const links = ["dashboard", "climate", "soil", "strategies", "compare", "session"];
export function Sidebar() { return <aside className="flex flex-wrap gap-3">{links.map(x => <a key={x} href={`/${x}`} className="capitalize text-green-800 underline">{x}</a>)}</aside>; }
