"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function AuthPage() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Erreur d'authentification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#FDF6F3", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: "400px", backgroundColor: "white", borderRadius: "1rem", padding: "2rem", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🌿</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#2A1C18", marginBottom: "0.5rem" }}>Sienne</h1>
          <p style={{ fontSize: "0.875rem", color: "#6B4A42" }}>Gestion budgétaire personnelle</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B4A42", display: "block", marginBottom: "0.5rem" }}>
              Email
            </label>
            <input
              type="email"
              placeholder="vous@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem 1rem", border: "1px solid #E8D4CC", borderRadius: "0.5rem", fontSize: "1rem" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B4A42", display: "block", marginBottom: "0.5rem" }}>
              Mot de passe
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem 1rem", border: "1px solid #E8D4CC", borderRadius: "0.5rem", fontSize: "1rem" }}
            />
          </div>

          {error && (
            <div style={{ backgroundColor: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "0.5rem", padding: "0.75rem", fontSize: "0.875rem", color: "#991B1B" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "0.5rem 1rem", borderRadius: "0.5rem", backgroundColor: "#C4746B", color: "white", fontWeight: "500", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1 }}
          >
            {loading ? "Chargement..." : isSignUp ? "S'inscrire" : "Se connecter"}
          </button>
        </form>

        <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #E8D4CC", textAlign: "center" }}>
          <p style={{ fontSize: "0.875rem", color: "#6B4A42" }}>
            {isSignUp ? "Vous avez un compte ?" : "Pas de compte ?"}
            {" "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              style={{ color: "#C4746B", fontWeight: "600", border: "none", backgroundColor: "transparent", cursor: "pointer" }}
            >
              {isSignUp ? "Se connecter" : "S'inscrire"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
