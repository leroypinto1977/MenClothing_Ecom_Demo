import { getStaffAndRoles } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/admin/guard";
import { setUserRole, setUserBanned } from "@/app/(admin)/admin/_actions/users";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Staff & roles" };

const ROLES = ["customer", "staff", "admin"] as const;

export default async function UsersPage() {
  const session = await requireAdmin();
  const people = await getStaffAndRoles();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl tracking-tight md:text-3xl">Staff &amp; roles</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Customers can shop; staff manage products and orders; admins also manage
          users, refunds, and revenue.
        </p>
      </div>

      <div className="overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30 text-left text-xs uppercase tracking-[0.1em] text-muted-foreground">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Access</th>
            </tr>
          </thead>
          <tbody>
            {people.map((u) => {
              const isSelf = u.id === session.user.id;
              return (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">
                    {u.name}
                    {isSelf && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatDate(u.createdAt.toISOString())}
                  </td>
                  <td className="px-4 py-3">
                    <form action={setUserRole} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={u.id} />
                      <select
                        name="role"
                        defaultValue={u.role}
                        disabled={isSelf}
                        className="h-9 border border-input bg-background px-2 text-sm capitalize outline-none focus-visible:border-foreground disabled:opacity-50"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      {!isSelf && (
                        <button className="h-9 border border-border px-3 text-xs hover:bg-secondary">
                          Save
                        </button>
                      )}
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    {isSelf ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <form action={setUserBanned}>
                        <input type="hidden" name="id" value={u.id} />
                        <input type="hidden" name="banned" value={u.banned ? "false" : "true"} />
                        <button
                          className={
                            "text-xs underline-offset-4 hover:underline " +
                            (u.banned ? "text-brand" : "text-destructive")
                          }
                        >
                          {u.banned ? "Re-enable" : "Disable"}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
