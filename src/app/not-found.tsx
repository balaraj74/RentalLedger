import Link from "next/link";

export default function NotFound() {
  return <main style={{ maxWidth: 560, margin: "12vh auto", padding: 24, textAlign: "center" }}>
    <p style={{ color: "#b8754b", fontSize: 11, fontWeight: 800, letterSpacing: ".12em" }}>404 · NOT FOUND</p>
    <h1 style={{ color: "#182432", fontSize: 32, margin: "10px 0" }}>This page isn’t available</h1>
    <p style={{ color: "#64717b", fontSize: 14, lineHeight: 1.7 }}>The page may have moved or the address may be incorrect.</p>
    <Link href="/dashboard" style={{ display: "inline-block", marginTop: 16, color: "white", background: "#20364d", padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>Return to dashboard</Link>
  </main>;
}
