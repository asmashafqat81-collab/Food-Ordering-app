import { useState } from "react";
import { X, LockKeyhole } from "lucide-react";

export default function AuthModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (mode: "login"|"register", values: any) => Promise<void> }) {
  const [mode, setMode] = useState<"login"|"register">("login");
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try { await onSubmit(mode, values); } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }
  return <div className="modal-backdrop"><div className="modal">
    <button className="icon-btn modal-close" onClick={onClose}><X/></button>
    <div className="auth-icon"><LockKeyhole/></div><h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2><p>{mode === "login" ? "Sign in to continue your order." : "Join Urban Bites and track every order."}</p>
    <form onSubmit={submit}>{mode === "register" && <input placeholder="Full name" required value={values.name} onChange={e => setValues({...values,name:e.target.value})}/>}<input type="email" placeholder="Email address" required value={values.email} onChange={e => setValues({...values,email:e.target.value})}/><input type="password" placeholder="Password" minLength={6} required value={values.password} onChange={e => setValues({...values,password:e.target.value})}/>{error && <div className="form-error">{error}</div>}<button className="primary wide" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button></form>
    <button className="text-btn" onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "Need an account? Register" : "Already have an account? Sign in"}</button>
  </div></div>;
}