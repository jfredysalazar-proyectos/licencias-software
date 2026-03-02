import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";

interface Reseller {
  id: number;
  email: string;
  name?: string;
  phone?: string;
  balance: number;
  role: string;
  createdAt: Date;
}

export default function ResellersAdmin() {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [page, setPage] = useState(1);
  const [showAddBalance, setShowAddBalance] = useState<number | null>(null);
  const [balanceAmount, setBalanceAmount] = useState("");
  const pageSize = 10;

  const utils = trpc.useUtils();
  const { data: customersData, isLoading } = trpc.admin.users.customers.list.useQuery();

  useEffect(() => {
    if (customersData) {
      setResellers(customersData.filter((c: any) => c.role === "reseller"));
    }
  }, [customersData]);

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
    onSuccess: () => {
      toast.success("Rol actualizado exitosamente");
      utils.admin.users.customers.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleAddBalance = (resellerId: number) => {
    if (!balanceAmount || isNaN(Number(balanceAmount))) {
      toast.error("Ingresa una cantidad válida");
      return;
    }

    updateBalanceMutation.mutate({
      id: resellerId,
      amount: Number(balanceAmount),
    });
  };

  const handleRemoveReseller = (resellerId: number) => {
    if (confirm("¿Estás seguro de cambiar el rol de este usuario?")) {
      updateRoleMutation.mutate({
        id: resellerId,
        role: "customer",
      });
    }
  };

  const paginatedResellers = resellers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  const totalPages = Math.ceil(resellers.length / pageSize);

  return (
    <AdminLayout>
      <div className="p-4 sm:p-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Resellers</h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
              Gestiona los resellers y sus saldos prepago
            </p>
          </div>
          <Button type="button" className="flex items-center gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Nuevo Reseller
          </Button>
        </div>

        {/* LOADING STATE */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
            <span className="text-gray-500">Cargando resellers...</span>
          </div>
        )}

        {/* TABLE */}
        {!isLoading && (
          <div className="hidden md:block rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Saldo
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedResellers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                        No hay resellers registrados aún.
                      </td>
                    </tr>
                  )}
                  {paginatedResellers.map((reseller) => (
                    <tr key={reseller.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{reseller.email}</td>
                      <td className="px-4 py-3 text-gray-700">{reseller.name || "-"}</td>
                      <td className="px-4 py-3 text-gray-700">{reseller.phone || "-"}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          ${reseller.balance.toLocaleString("es-CO")} COP
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setShowAddBalance(reseller.id)}
                            title="Añadir saldo"
                            className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                          >
                            <DollarSign className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveReseller(reseller.id)}
                            title="Cambiar a cliente"
                            className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
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
            {paginatedResellers.map((reseller) => (
              <div
                key={reseller.id}
                className="rounded-xl border border-gray-200 bg-white shadow-sm p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{reseller.email}</p>
                    <p className="text-xs text-gray-500">{reseller.name || "-"}</p>
                    <p className="text-xs text-gray-500">{reseller.phone || "-"}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    ${reseller.balance.toLocaleString("es-CO")} COP
                  </span>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => setShowAddBalance(reseller.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <DollarSign className="h-3.5 w-3.5" />
                    Saldo
                  </button>
                  <button
                    onClick={() => handleRemoveReseller(reseller.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Cambiar
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
              <span className="font-medium">{Math.min(page * pageSize, resellers.length)}</span> de{" "}
              <span className="font-medium">{resellers.length}</span> resultados
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={page === p ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 p-0 ${page === p ? "pointer-events-none" : ""}`}
                  >
                    {p}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 w-8 p-0"
              >
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
                  <Label htmlFor="balance">Cantidad (COP)</Label>
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
                  <Button
                    onClick={() => handleAddBalance(showAddBalance)}
                    disabled={updateBalanceMutation.isPending}
                    className="flex-1"
                  >
                    {updateBalanceMutation.isPending ? "Guardando..." : "Guardar"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddBalance(null);
                      setBalanceAmount("");
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
