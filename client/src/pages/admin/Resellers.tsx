import { useState } from "react";
import { Plus, Edit, Trash2, DollarSign, ChevronLeft, ChevronRight, UserCheck, UserX, Clock, CheckCircle, XCircle, MessageCircle } from "lucide-react";
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
  active: number;
}

const ADMIN_WHATSAPP = "573334315646";

export default function ResellersAdmin() {
  const [page, setPage] = useState(1);
  const [showAddBalance, setShowAddBalance] = useState<number | null>(null);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [showNewReseller, setShowNewReseller] = useState(false);
  const [filterRole, setFilterRole] = useState<"all" | "reseller" | "customer">("all");
  const [activeSection, setActiveSection] = useState<"list" | "pending">("pending");

  // New reseller form state
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const pageSize = 10;

  const utils = trpc.useUtils();
  const { data: customersData, isLoading } = trpc.admin.users.customers.list.useQuery();
  const { data: pendingData, isLoading: isPendingLoading } = trpc.admin.users.customers.listPending.useQuery();

  const customers: Customer[] = (customersData as any[]) || [];
  const pendingCustomers: Customer[] = (pendingData as any[]) || [];

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

  const approveMutation = trpc.admin.users.customers.approve.useMutation({
    onSuccess: () => {
      toast.success("Reseller aprobado exitosamente");
      utils.admin.users.customers.listPending.invalidate();
      utils.admin.users.customers.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const rejectMutation = trpc.admin.users.customers.reject.useMutation({
    onSuccess: () => {
      toast.success("Solicitud rechazada y eliminada");
      utils.admin.users.customers.listPending.invalidate();
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

  const handleApprove = (customer: Customer) => {
    if (confirm(`¿Aprobar el registro de ${customer.email} como Reseller?`)) {
      approveMutation.mutate({ id: customer.id });
    }
  };

  const handleReject = (customer: Customer) => {
    if (confirm(`¿Rechazar y eliminar el registro de ${customer.email}? Esta acción no se puede deshacer.`)) {
      rejectMutation.mutate({ id: customer.id });
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

  const buildWhatsAppLink = (customer: Customer) => {
    const phone = customer.phone?.replace(/\D/g, "") || ADMIN_WHATSAPP;
    const msg = encodeURIComponent(
      `Hola ${customer.name || customer.email}, tu solicitud de registro como Reseller en Licencias de Software Colombia ha sido aprobada. Ya puedes iniciar sesión en https://licenciasdesoftware.org/reseller`
    );
    return `https://wa.me/${phone}?text=${msg}`;
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Clientes / Resellers</h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
              Gestiona los clientes, aprueba solicitudes de reseller y administra saldos prepago
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

        {/* SECTION TABS */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveSection("pending")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === "pending"
                ? "bg-yellow-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Clock className="h-4 w-4" />
            Solicitudes Pendientes
            {pendingCustomers.length > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                activeSection === "pending" ? "bg-white text-yellow-600" : "bg-yellow-500 text-white"
              }`}>
                {pendingCustomers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSection("list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === "list"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <UserCheck className="h-4 w-4" />
            Resellers Activos
          </button>
        </div>

        {/* ─── PENDING APPROVAL SECTION ─── */}
        {activeSection === "pending" && (
          <div>
            {isPendingLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mr-3" />
                <span className="text-gray-500">Cargando solicitudes...</span>
              </div>
            )}

            {!isPendingLoading && pendingCustomers.length === 0 && (
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No hay solicitudes pendientes de aprobación</p>
                <p className="text-gray-400 text-sm mt-1">Cuando alguien se registre como reseller, aparecerá aquí.</p>
              </div>
            )}

            {!isPendingLoading && pendingCustomers.length > 0 && (
              <div className="space-y-4">
                {pendingCustomers.map((customer) => (
                  <div key={customer.id} className="rounded-xl border border-yellow-200 bg-yellow-50 shadow-sm p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-200 text-yellow-800">
                            <Clock className="h-3 w-3" />
                            Pendiente de Aprobación
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900 text-base">{customer.email}</p>
                        {customer.name && <p className="text-sm text-gray-600">{customer.name}</p>}
                        {customer.phone && (
                          <p className="text-sm text-gray-500">
                            Tel: {customer.phone}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Registrado: {new Date(customer.createdAt).toLocaleString("es-CO")}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {customer.phone && (
                          <a
                            href={`https://wa.me/${customer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${customer.name || ""}, tu solicitud de registro como Reseller en Licencias de Software Colombia está siendo revisada.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                          >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                          </a>
                        )}
                        <button
                          onClick={() => handleApprove(customer)}
                          disabled={approveMutation.isPending}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Aceptar
                        </button>
                        <button
                          onClick={() => handleReject(customer)}
                          disabled={rejectMutation.isPending}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Rechazar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── ACTIVE RESELLERS / CUSTOMERS LIST ─── */}
        {activeSection === "list" && (
          <div>
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
