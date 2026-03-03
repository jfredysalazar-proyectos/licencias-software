import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Calendar, Package, User, DollarSign, Clock, CheckCircle,
  XCircle, AlertTriangle, Edit, Search, Filter, Eye
} from "lucide-react";

interface Order {
  id: number;
  customerId?: number | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  items: string;
  totalAmount: number;
  status: string;
  expiresAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface ParsedItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  accountData?: string;
}

function parseItems(itemsStr: string): ParsedItem[] {
  try { return JSON.parse(itemsStr); } catch { return []; }
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    pending:   { label: "Pendiente",  color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    completed: { label: "Completado", color: "bg-green-100 text-green-700 border-green-200" },
    cancelled: { label: "Cancelado",  color: "bg-red-100 text-red-700 border-red-200" },
  };
  const s = map[status] || { label: status, color: "bg-gray-100 text-gray-700 border-gray-200" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${s.color}`}>
      {s.label}
    </span>
  );
}

function ExpiryBadge({ expiresAt }: { expiresAt?: string | Date | null }) {
  if (!expiresAt) return <span className="text-gray-400 text-xs italic">Sin fecha</span>;
  const exp = new Date(expiresAt);
  const now = new Date();
  const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
      <XCircle className="h-3 w-3" /> Vencida
    </span>
  );
  if (diffDays <= 3) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
      <AlertTriangle className="h-3 w-3" /> {diffDays}d
    </span>
  );
  if (diffDays <= 7) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
      <Clock className="h-3 w-3" /> {diffDays}d
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
      <CheckCircle className="h-3 w-3" /> {diffDays}d
    </span>
  );
}

export default function ResellerOrders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [expiresAtInput, setExpiresAtInput] = useState("");
  const [accountDataInput, setAccountDataInput] = useState("");
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const ordersQuery = trpc.admin.orders.resellerOrders.useQuery();
  const utils = trpc.useContext();

  const updateExpiryMutation = trpc.admin.orders.updateExpiry.useMutation({
    onSuccess: () => {
      toast.success("Orden actualizada correctamente");
      setEditingOrder(null);
      utils.admin.orders.resellerOrders.invalidate();
    },
    onError: (err) => toast.error(err.message || "Error al actualizar la orden"),
  });

  const updateStatusMutation = trpc.admin.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Estado actualizado");
      utils.admin.orders.resellerOrders.invalidate();
    },
    onError: (err) => toast.error(err.message || "Error al actualizar el estado"),
  });

  const orders: Order[] = (ordersQuery.data as any) || [];

  const filtered = orders.filter((o) => {
    const matchSearch =
      !search ||
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail?.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search) ||
      parseItems(o.items).some((i) => i.productName.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openEdit = (order: Order) => {
    setEditingOrder(order);
    if (order.expiresAt) {
      const d = new Date(order.expiresAt);
      setExpiresAtInput(d.toISOString().split("T")[0]);
    } else {
      setExpiresAtInput("");
    }
    const items = parseItems(order.items);
    setAccountDataInput(items[0]?.accountData || "");
  };

  const handleSave = () => {
    if (!editingOrder) return;
    updateExpiryMutation.mutate({
      id: editingOrder.id,
      expiresAt: expiresAtInput ? new Date(expiresAtInput).toISOString() : null,
      accountData: accountDataInput || undefined,
    });
  };

  // Summary stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const expiringOrders = orders.filter((o) => {
    if (!o.expiresAt) return false;
    const d = Math.ceil((new Date(o.expiresAt).getTime() - Date.now()) / 86400000);
    return d >= 0 && d <= 7;
  }).length;
  const withoutExpiry = orders.filter((o) => !o.expiresAt).length;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Órdenes de Resellers</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gestiona las compras de resellers: asigna fechas de vencimiento y datos de cuenta.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Órdenes", value: totalOrders, icon: Package, color: "text-blue-600 bg-blue-50" },
            { label: "Pendientes", value: pendingOrders, icon: Clock, color: "text-yellow-600 bg-yellow-50" },
            { label: "Vencen en 7 días", value: expiringOrders, icon: AlertTriangle, color: "text-red-600 bg-red-50" },
            { label: "Sin fecha asignada", value: withoutExpiry, icon: Calendar, color: "text-gray-600 bg-gray-50" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, email, producto o ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="completed">Completados</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {ordersQuery.isLoading ? (
            <div className="p-12 text-center text-gray-400">
              <Package className="h-10 w-10 mx-auto mb-3 animate-pulse" />
              <p>Cargando órdenes...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Package className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No hay órdenes que coincidan con los filtros.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["#", "Cliente", "Producto(s)", "Total", "Estado", "Vencimiento", "Fecha compra", "Acciones"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((order) => {
                    const items = parseItems(order.items);
                    const productNames = items.map((i) => i.productName).join(", ");
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-gray-500 text-xs">#{order.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-3.5 w-3.5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-xs">{order.customerName || "—"}</p>
                              <p className="text-gray-400 text-xs">{order.customerEmail || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 max-w-[200px]">
                          <p className="text-gray-700 text-xs truncate" title={productNames}>{productNames || "—"}</p>
                          {items[0]?.accountData && (
                            <p className="text-green-600 text-xs mt-0.5 truncate" title={items[0].accountData}>
                              🔑 {items[0].accountData.substring(0, 30)}...
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-gray-900 font-semibold text-xs">
                            <DollarSign className="h-3 w-3 text-gray-400" />
                            {order.totalAmount.toLocaleString("es-CO")}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3">
                          <ExpiryBadge expiresAt={order.expiresAt} />
                          {order.expiresAt && (
                            <p className="text-gray-400 text-xs mt-0.5">
                              {new Date(order.expiresAt).toLocaleDateString("es-CO")}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {new Date(order.createdAt).toLocaleDateString("es-CO")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setViewingOrder(order)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver detalle"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openEdit(order)}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Asignar vencimiento y datos de cuenta"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-4 rounded-t-2xl">
              <h2 className="text-white font-bold text-lg">Gestionar Orden #{editingOrder.id}</h2>
              <p className="text-blue-100 text-sm">{editingOrder.customerName} — {editingOrder.customerEmail}</p>
            </div>
            <div className="p-6 space-y-4">
              {/* Products */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Productos</p>
                {parseItems(editingOrder.items).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.productName} x{item.quantity}</span>
                    <span className="font-semibold">${item.price.toLocaleString("es-CO")}</span>
                  </div>
                ))}
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado de la orden</label>
                <select
                  value={editingOrder.status}
                  onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pendiente</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              {/* Fecha de vencimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1 text-blue-600" />
                  Fecha de vencimiento
                </label>
                <input
                  type="date"
                  value={expiresAtInput}
                  onChange={(e) => setExpiresAtInput(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">Esta fecha aparecerá en "Cuentas próximas a vencer" del reseller.</p>
              </div>

              {/* Datos de cuenta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🔑 Datos de cuenta / Credenciales
                </label>
                <textarea
                  value={accountDataInput}
                  onChange={(e) => setAccountDataInput(e.target.value)}
                  placeholder="Email: usuario@ejemplo.com&#10;Contraseña: pass123&#10;Perfil: 1"
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">Estos datos serán visibles para el reseller en su panel.</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditingOrder(null)}
                  className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateExpiryMutation.isLoading || updateStatusMutation.isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {updateExpiryMutation.isLoading ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── View Modal ── */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-6 py-4 rounded-t-2xl">
              <h2 className="text-white font-bold text-lg">Detalle Orden #{viewingOrder.id}</h2>
              <p className="text-gray-300 text-sm">{new Date(viewingOrder.createdAt).toLocaleString("es-CO")}</p>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Cliente</p>
                  <p className="font-medium">{viewingOrder.customerName || "—"}</p>
                  <p className="text-gray-500">{viewingOrder.customerEmail || "—"}</p>
                  <p className="text-gray-500">{viewingOrder.customerPhone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Estado</p>
                  <StatusBadge status={viewingOrder.status} />
                  <p className="text-xs text-gray-400 uppercase font-semibold mt-2">Vencimiento</p>
                  <ExpiryBadge expiresAt={viewingOrder.expiresAt} />
                </div>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Productos</p>
                {parseItems(viewingOrder.items).map((item, i) => (
                  <div key={i} className="mb-2">
                    <div className="flex justify-between">
                      <span>{item.productName} x{item.quantity}</span>
                      <span className="font-semibold">${item.price.toLocaleString("es-CO")}</span>
                    </div>
                    {item.accountData && (
                      <div className="mt-1 bg-green-50 border border-green-200 rounded p-2 font-mono text-xs text-green-800 whitespace-pre-wrap">
                        {item.accountData}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>${viewingOrder.totalAmount.toLocaleString("es-CO")} COP</span>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="w-full mt-2 border border-gray-200 text-gray-600 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
