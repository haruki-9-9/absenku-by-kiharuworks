import { logoutAction } from "@/app/login/actions";

type User = {
  name: string;
  email: string;
};

export default function Header({ user }: { user: User }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        height: 64,
        padding: "0 24px",
        gap: 16,
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "0.5px solid rgba(255,255,255,0.9)",
        position: "relative",
        zIndex: 10,
      }}
    >
      <div style={{ textAlign: "right" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
          {user.name}
        </p>
        <p style={{ fontSize: 11, color: "#94a3b8" }}>{user.email}</p>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          style={{
            padding: "7px 16px",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 500,
            background: "rgba(255,255,255,0.7)",
            border: "0.5px solid rgba(0,0,0,0.1)",
            color: "#475569",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Logout
        </button>
      </form>
    </header>
  );
}
