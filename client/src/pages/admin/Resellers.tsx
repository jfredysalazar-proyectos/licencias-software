import { useState } from "react";
import { Plus, Edit, Trash2, DollarSign, ChevronLeft, ChevronRight, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";

interface Customer {
  id: number;
  email: string;
  name?: string | null;
  phone?: string | null;
  balance: number;
  role: string;
  createdAt: Date;
}

export default function ResellersAdmin() {
  const [page, setPage] = useState(1);
  const [showAddBalance, setShowAddBalance] = useState<number | null>(null);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [showNewReseller, setShowNewReseller] = useState(false);
  const [filterRole, setFilterRole] = useState<"all" | "reseller" | "customer">("all");

  // New reseller form state
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const pageSize = 10;

  const utils = trpc.useUtils();
  const { data: customersData, isLoading } = trpc.admin.users.customers.list.useQuery();

  const customers: Customer[] = (customersData as any[]) || [];

  const filteredCustomers = customers.filter((c) => {
    if (filterRole === "all") return true;
    return c.role === filterRole;
  });

  const paginatedCustomers = filteredCustomers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  const totalPages = Math.ceil(filteredCustomers.length / pageSize);

  const updateBalanceMutation = trpc.admin.users.customers.updateBalance.useMutation({
    onSuccess: () => {
      toast.success("Saldo actualizado exitosamente");
      utils.admin.users.customers.list.invalidate();
      setShowAddBalance(null);
      setBalanceAmount("");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const updateRoleMutation = trpc.admin.users.customers.updateRole.useMutation({
    onSuccess: (_, variables) => {
      const msg = variables.role === "reseller"
        ? "Usuario promovido a Reseller"
        : "Usuario cambiado a Cliente";
      toast.success(msg);
      utils.admin.users.customers.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const createCustomerMutation = trpc.admin.users.customers.create.useMutation({
    onSuccess: () => {
      toast.success("Reseller creado exitosamente");
      utils.admin.users.customers.list.invalidate();
      setShowNewReseller(false);
      setNewEmail("");
      setNewPassword("");
      setNewName("");
      setNewPhone("");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleAddBalance = (customerId: number) => {
    if (!balanceAmount || isNaN(Number(balanceAmount))) {
      toast.error("Ingresa una cantidad válida");
      return;
    }
    updateBalanceMutation.mutate({ id: customerId, amount: Number(balanceAmount) });
  };

  const handleToggleRole = (customer: Customer) => {
    const newRole = customer.role === "reseller" ? "customer" : "reseller";
    const msg = newRole === "reseller"
      ? `¿Promover a ${customer.email} como Reseller?`
      : `¿Cambiar a ${customer.email} de vuelta a Cliente?`;
    if (confirm(msg)) {
      updateRoleMutation.mutate({ id: customer.id, role: newRole as "customer" | "reseller" });
    }
  };

  const handleCreateReseller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) {
      toast.error("Email y contraseña son obligatorios");
      return;
    }
    createCustomerMutation.mutate({
      email: newEmail,
      password: newPassword,
      name: newName || undefined,
      phone: newPhone || undefined,
      role: "reseller",
    });
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Clientes / Resellers</h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
              Gestiona los clientes, asigna roles de reseller y administra saldos prepago
            </p>
          </div>
          <Button
            type="button"
            className="flex items-center gap-2 shrink-0"
            onClick={() => setShowNewReseller(true)}
          >
            <Plus className="h-4 w-4" />
            Nuevo Reseller
          </Button>
        </div>

        {/* FILTER TABS */}
        <div className="flex gap-2 mb-4">
          {(["all", "reseller", "customer"] as const).map((role) => (
            <button
              key={role}
              onClick={() => { setFilterRole(role); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterRole === role
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {role === "all" ? "Todos" : role === "reseller" ? "Resellers" : "Clientes"}
              <span className="ml-1.5 text-xs opacity-75">
                ({role === "all" ? customers.length : customers.filter(c => c.role === role).length})
              </span>
            </button>
          ))}
        </div>

        {/* LOADING STATE */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
            <span className="text-gray-500">Cargando clientes...</span>
          </div>
        )}

        {/* TABLE - Desktop */}
        {!isLoading && (
          <div className="hidden md:block rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Teléfono</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Saldo</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedCustomers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                        No hay clientes registrados aún.
                      </td>
                    </tr>
                  )}
                  {paginatedCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{customer.email}</td>
                      <td className="px-4 py-3 text-gray-700">{customer.name || "-"}</td>
                      <td className="px-4 py-3 text-gray-700">{customer.phone || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          customer.role === "reseller"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {customer.role === "reseller" ? "Reseller" : "Cliente"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          ${(customer.balance ?? 0).toLocaleString("es-CO")} COP
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setShowAddBalance(customer.id)}
                            title="Añadir saldo"
                            className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                          >
                            <DollarSign className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleRole(customer)}
                            title={customer.role === "reseller" ? "Cambiar a Cliente" : "Promover a Reseller"}
                            className={`p-1.5 rounded transition-colors ${
                              customer.role === "reseller"
                                ? "hover:bg-red-50 text-red-500"
                                : "hover:bg-purple-50 text-purple-600"
                            }`}
                          >
                            {customer.role === "reseller" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MOBILE CARDS */}
        {!isLoading && (
          <div className="md:hidden space-y-3">
            {paginatedCustomers.length === 0 && (
              <p className="text-center text-gray-400 py-8">No hay clientes registrados aún.</p>
            )}
            {paginatedCustomers.map((customer) => (
              <div key={customer.id} className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{customer.email}</p>
                    <p className="text-xs text-gray-500">{customer.name || "-"}</p>
                    <p className="text-xs text-gray-500">{customer.phone || "-"}</p>
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                    customer.role === "reseller"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {customer.role === "reseller" ? "Reseller" : "Cliente"}
                  </span>
                </div>
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    ${(customer.balance ?? 0).toLocaleString("es-CO")} COP
                  </span>
                </div>
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => setShowAddBalance(customer.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <DollarSign className="h-3.5 w-3.5" />
                    Saldo
                  </button>
                  <button
                    onClick={() => handleToggleRole(customer)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      customer.role === "reseller"
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                    }`}
                  >
                    {customer.role === "reseller" ? (
                      <><UserX className="h-3.5 w-3.5" /> A Cliente</>
                    ) : (
                      <><UserCheck className="h-3.5 w-3.5" /> A Reseller</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 px-1">
            <div className="text-sm text-gray-500">
              Mostrando <span className="font-medium">{((page - 1) * pageSize) + 1}</span> a{" "}
              <span className="font-medium">{Math.min(page * pageSize, filteredCustomers.length)}</span> de{" "}
              <span className="font-medium">{filteredCustomers.length}</span> resultados
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-8 w-8 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button key={p} variant={page === p ? "default" : "outline"} size="sm" onClick={() => setPage(p)} className={`h-8 w-8 p-0 ${page === p ? "pointer-events-none" : ""}`}>
                    {p}
                  </Button>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ADD BALANCE MODAL */}
        {showAddBalance && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Añadir Saldo</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="balance">Cantidad a añadir (COP)</Label>
                  <Input
                    id="balance"
                    type="number"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    placeholder="Ej: 50000"
                    min="0"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleAddBalance(showAddBalance)} disabled={updateBalanceMutation.isPending} className="flex-1">
                    {updateBalanceMutation.isPending ? "Guardando..." : "Guardar"}
                  </Button>
                  <Button variant="outline" onClick={() => { setShowAddBalance(null); setBalanceAmount(""); }} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NEW RESELLER MODAL */}
        {showNewReseller && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-1">Nuevo Reseller</h2>
              <p className="text-sm text-gray-500 mb-4">Crea una cuenta de reseller directamente desde el panel de administración.</p>
              <form onSubmit={handleCreateReseller} className="space-y-4">
                <div>
                  <Label htmlFor="new-email">Email *</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="reseller@ejemplo.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="new-password">Contraseña *</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <Label htmlFor="new-name">Nombre</Label>
                  <Input
                    id="new-name"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <Label htmlFor="new-phone">Teléfono</Label>
                  <Input
                    id="new-phone"
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+57 300 000 0000"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={createCustomerMutation.isPending} className="flex-1">
                    {createCustomerMutation.isPending ? "Creando..." : "Crear Reseller"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowNewReseller(false);
                      setNewEmail(""); setNewPassword(""); setNewName(""); setNewPhone("");
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
