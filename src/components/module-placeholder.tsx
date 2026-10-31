import Link from "next/link";
import { ArrowLeft, BookOpenCheck, Construction, Search } from "lucide-react";

export function ModulePlaceholder({ title, description, nextSteps }: { title: string; description: string; nextSteps: string[] }) {
  return <main className="page-content">
    <div className="page-heading">
      <div><p className="eyebrow">Rental Ledger workspace</p><h1 className="page-title">{title}</h1><p className="page-subtitle">{description}</p></div>
      <Link className="button button-secondary" href="/dashboard"><ArrowLeft size={14}/> Back to overview</Link>
    </div>
    <section className="module-placeholder">
      <div style={{ display: "inline-grid", placeItems: "center", width: 44, height: 44, borderRadius: 12, background: "#edf1f4", color: "#20364d", marginBottom: 16 }}><Construction size={21}/></div>
      <h2>This module is in the implementation queue</h2>
      <p>The route is wired into the application shell. Complete the real workflow defined in <code>docs/product/FRONTEND_SPEC.md</code>; do not leave this placeholder as the final implementation.</p>
      <div style={{ fontWeight: 750, fontSize: 12, marginTop: 20 }}>Required next steps</div>
      <ul style={{ margin: "9px 0 0", paddingLeft: 20, color: "#64717b", fontSize: 12, lineHeight: 1.9 }}>{nextSteps.map((step) => <li key={step}>{step}</li>)}</ul>
      <div className="module-actions"><Link href="/catalog" className="button button-primary"><Search size={14}/> Open package discovery</Link><Link href="/dashboard" className="button button-secondary"><BookOpenCheck size={14}/> Review dashboard</Link></div>
    </section>
    <footer className="page-footer"><span>Development scaffold</span><span>Agent: implement this route according to the acceptance criteria</span></footer>
  </main>;
}
