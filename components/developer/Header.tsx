import { logoutAction } from "@/app/login/actions";

type User = {
  name: string;
  email: string;
};

export default function Header({ user }: { user: User }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-800">{user.name}</p>
          <p className="text-[11px] text-slate-400">{user.email}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
          >
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}
