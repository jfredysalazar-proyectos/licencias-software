import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Package, Clock, CheckCircle, XCircle, LogOut } from "lucide-react";

export default function MyAccount() {
  const [, setLocation] = useLocation();
  const [customerData, setCustomerData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    const data = localStorage.getItem("customerData");
    
    if (!token || !data) {
      toast.error("Debes iniciar sesión");
      setLocation("/login");
      return;
    }
    
    setCustomerData(JSON.parse(data));
  }, [setLocation]);

  const { data: orders, isLoading } = trpc.customer.myOrders.useQuery(undefined, {
    enabled: !!customerData,
  });

  const logoutMutation = trpc.customer.logout.useMutation({
    onSuccess: () => {
      localStorage.removeItem("customerToken");
      localStorage.removeItem("customerData");
      toast.success("Sesión cerrada");
      setLocation("/");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const calculateDaysRemaining = (expiresAt: Date | null) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Completado
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" />
            Pendiente
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  if (!customerData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Cuenta</h1>
            <p className="text-gray-600 mt-1">
              Bienvenido, {customerData.name || customerData.email}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Cuenta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Email:</span> {customerData.email}
            </div>
            {customerData.name && (
              <div>
                <span className="font-medium">Nombre:</span> {customerData.name}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Mis Pedidos y Licencias
            </CardTitle>
            <CardDescription>
              Historial de compras y vigencia de licencias
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Cargando pedidos...</div>
            ) : !orders || orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tienes pedidos aún
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => {
                  const items = JSON.parse(order.items);
                  const daysRemaining = calculateDaysRemaining(order.expiresAt);
                  
                  return (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            Pedido #{order.id}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(order.createdAt), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>

                      <div className="space-y-2">
                        {items.map((item: any, idx: number) => (
                          <div key={idx} className="text-sm">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-gray-500"> × {item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-bold text-lg">
                          ${order.totalAmount.toLocaleString("es-CO")} COP
                        </span>
                        {order.status === "completed" && daysRemaining !== null && (
                          <div className="text-right">
                            {daysRemaining > 0 ? (
                              <p className="text-sm font-medium text-green-600">
                                Vigencia: {daysRemaining} días restantes
                              </p>
                            ) : (
                              <p className="text-sm font-medium text-red-600">
                                Licencia expirada
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              Expira: {new Date(order.expiresAt).toLocaleDateString("es-CO")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
