import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  DollarSign,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";

type RechargeStatus = "pending" | "approved" | "rejected" | "all";

interface RechargeRequest {
  id: number;
  customerId: number;
  customerEmail?: string;
  customerName?: string;
  declaredAmount: number;
  paymentMethod: string;
  voucherUrl?: string;
  status: string;
  aiVerified?: number;
  aiConfidence?: number;
  aiNotes?: string;
  adminNotes?: string;
  createdAt: string | Date;
  processedAt?: string | Date | null;
}

export default function AdminRechargeRequests() {
  const [statusFilter, setStatusFilter] = useState<RechargeStatus>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<RechargeRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<"approve" | "reject" | "view">("view");

  const { data: requests = [], isLoading, refetch } = trpc.admin.rechargeRequests.list.useQuery(undefined, {
    refetchInterval: 30000, // auto-refresh every 30s
  });

  const approveMutation = trpc.admin.rechargeRequests.approve.useMutation({
    onSuccess: () => {
      toast.success("✅ Recarga aprobada y saldo acreditado");
      setShowModal(false);
      setSelectedRequest(null);
      setAdminNotes("");
      refetch();
    },
    onError: (err) => toast.error(err.message || "Error al aprobar"),
  });

  const rejectMutation = trpc.admin.rechargeRequests.reject.useMutation({
    onSuccess: () => {
      toast.success("Solicitud rechazada");
      setShowModal(false);
      setSelectedRequest(null);
      setAdminNotes("");
      refetch();
    },
    onError: (err) => toast.error(err.message || "Error al rechazar"),
  });

  const filtered = (requests as RechargeRequest[]).filter((r) => {
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchSearch =
      !searchTerm ||
      r.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(r.id).includes(searchTerm);
    return matchStatus && matchSearch;
  });

  const pending = (requests as RechargeRequest[]).filter((r) => r.status === "pending").length;
  const approved = (requests as RechargeRequest[]).filter((r) => r.status === "approved").length;
  const rejected = (requests as RechargeRequest[]).filter((r) => r.status === "rejected").length;

  const formatDate = (d: string | Date | null | undefined) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("es-CO", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const formatAmount = (n: number) =>
    `$${Number(n).toLocaleString("es-CO")} COP`;

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700"><CheckCircle className="h-3 w-3" />Aprobado</span>;
      case "rejected":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700"><XCircle className="h-3 w-3" />Rechazado</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700"><Clock className="h-3 w-3" />Pendiente</span>;
    }
  };

  const aiConfidenceBadge = (confidence?: number, aiVerified?: number) => {
    if (confidence === undefined || confidence === null) return <span className="text-xs text-gray-400">—</span>;
    const pct = Math.round(confidence * 100);
    const color = pct >= 80 ? "text-green-600" : pct >= 50 ? "text-amber-600" : "text-red-600";
    return (
      <span className={`text-xs font-semibold ${color}`}>
        {aiVerified ? "✅" : "⚠️"} {pct}%
      </span>
    );
  };

  const openModal = (req: RechargeRequest, action: "approve" | "reject" | "view") => {
    setSelectedRequest(req);
    setModalAction(action);
    setAdminNotes("");
    setShowModal(true);
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recargas Reseller</h1>
            <p className="text-sm text-gray-500 mt-1">Gestiona las solicitudes de recarga de saldo verificadas por IA</p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="bg-amber-100 rounded-xl p-2.5"><Clock className="h-5 w-5 text-amber-600" /></div>
            <div>
              <p className="text-2xl font-bold text-amber-700">{pending}</p>
              <p className="text-xs text-amber-600 font-medium">Pendientes</p>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="bg-green-100 rounded-xl p-2.5"><CheckCircle className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-green-700">{approved}</p>
              <p className="text-xs text-green-600 font-medium">Aprobadas</p>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="bg-red-100 rounded-xl p-2.5"><XCircle className="h-5 w-5 text-red-600" /></div>
            <div>
              <p className="text-2xl font-bold text-red-700">{rejected}</p>
              <p className="text-xs text-red-600 font-medium">Rechazadas</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por email, nombre o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            {(["all", "pending", "approved", "rejected"] as RechargeStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  statusFilter === s
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s === "all" ? "Todos" : s === "pending" ? "Pendientes" : s === "approved" ? "Aprobados" : "Rechazados"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No hay solicitudes</p>
              <p className="text-sm mt-1">Las solicitudes de recarga aparecerán aquí</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Reseller</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Monto</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Método</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">IA</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Estado</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Fecha</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-gray-500">#{req.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{req.customerName || "—"}</div>
                        <div className="text-xs text-gray-400">{req.customerEmail}</div>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-800">{formatAmount(req.declaredAmount)}</td>
                      <td className="px-4 py-3 capitalize text-gray-600">{req.paymentMethod}</td>
                      <td className="px-4 py-3">{aiConfidenceBadge(req.aiConfidence ?? undefined, req.aiVerified ?? undefined)}</td>
                      <td className="px-4 py-3">{statusBadge(req.status)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDate(req.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openModal(req, "view")}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalle"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {req.status === "pending" && (
                            <>
                              <button
                                onClick={() => openModal(req, "approve")}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Aprobar"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openModal(req, "reject")}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Rechazar"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalle / aprobar / rechazar */}
      {showModal && selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900">
                  {modalAction === "approve" ? "✅ Aprobar Recarga" :
                   modalAction === "reject" ? "❌ Rechazar Recarga" :
                   "🔍 Detalle de Solicitud"}
                </h2>
                <p className="text-xs text-gray-500">Solicitud #{selectedRequest.id}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Info básica */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Reseller</p>
                  <p className="font-semibold text-gray-800 text-sm">{selectedRequest.customerName || "—"}</p>
                  <p className="text-xs text-gray-500">{selectedRequest.customerEmail}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Monto declarado</p>
                  <p className="font-bold text-green-700 text-lg">{formatAmount(selectedRequest.declaredAmount)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Método de pago</p>
                  <p className="font-semibold text-gray-800 text-sm capitalize">{selectedRequest.paymentMethod}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Estado</p>
                  {statusBadge(selectedRequest.status)}
                </div>
              </div>

              {/* Análisis IA */}
              {selectedRequest.aiNotes && (
                <div className={`rounded-xl p-4 border ${ selectedRequest.aiVerified ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200" }`}>
                  <p className="text-xs font-semibold text-gray-600 mb-1">🤖 Análisis de la IA</p>
                  <p className="text-sm text-gray-700">{selectedRequest.aiNotes}</p>
                  {selectedRequest.aiConfidence !== undefined && (
                    <p className="text-xs text-gray-500 mt-1">
                      Confianza: <strong>{Math.round((selectedRequest.aiConfidence ?? 0) * 100)}%</strong>
                    </p>
                  )}
                </div>
              )}

              {/* Comprobante */}
              {selectedRequest.voucherUrl && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">📎 Comprobante de pago</p>
                  <a href={selectedRequest.voucherUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={selectedRequest.voucherUrl}
                      alt="Comprobante"
                      className="w-full max-h-72 object-contain rounded-xl border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer"
                    />
                  </a>
                  <p className="text-xs text-gray-400 mt-1 text-center">Clic para ver en tamaño completo</p>
                </div>
              )}

              {/* Notas del admin (solo en aprobar/rechazar) */}
              {(modalAction === "approve" || modalAction === "reject") && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Notas del administrador (opcional)
                  </label>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={modalAction === "approve" ? "Ej: Pago verificado manualmente" : "Ej: El monto no coincide con el comprobante"}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              )}

              {/* Notas previas del admin */}
              {modalAction === "view" && selectedRequest.adminNotes && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-blue-700 mb-1">Notas del administrador</p>
                  <p className="text-sm text-blue-800">{selectedRequest.adminNotes}</p>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-3 pt-2">
                {modalAction === "approve" && (
                  <>
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 border border-gray-300 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      disabled={approveMutation.isLoading}
                      onClick={() => approveMutation.mutate({ id: selectedRequest.id, adminNotes })}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                    >
                      {approveMutation.isLoading ? "Procesando..." : "✅ Aprobar y Acreditar Saldo"}
                    </button>
                  </>
                )}
                {modalAction === "reject" && (
                  <>
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 border border-gray-300 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      disabled={rejectMutation.isLoading}
                      onClick={() => rejectMutation.mutate({ id: selectedRequest.id, adminNotes })}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                    >
                      {rejectMutation.isLoading ? "Procesando..." : "❌ Rechazar Solicitud"}
                    </button>
                  </>
                )}
                {modalAction === "view" && (
                  <div className="flex gap-3 w-full">
                    {selectedRequest.status === "pending" && (
                      <>
                        <button
                          onClick={() => setModalAction("reject")}
                          className="flex-1 border border-red-300 text-red-600 font-medium py-2.5 rounded-xl hover:bg-red-50 transition-colors text-sm"
                        >
                          Rechazar
                        </button>
                        <button
                          onClick={() => setModalAction("approve")}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                        >
                          Aprobar
                        </button>
                      </>
                    )}
                    {selectedRequest.status !== "pending" && (
                      <button
                        onClick={() => setShowModal(false)}
                        className="w-full border border-gray-300 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                      >
                        Cerrar
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
