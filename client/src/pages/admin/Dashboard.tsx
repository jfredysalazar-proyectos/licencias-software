import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Package, FolderTree, ShoppingCart, Users, Key, AlertCircle, Calendar } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { data: products } = trpc.admin.products.list.useQuery();
  const { data: categories } = trpc.admin.categories.list.useQuery();
  const { data: orders } = trpc.admin.orders.list.useQuery();
  const { data: users } = trpc.admin.users.list.useQuery();
  const { data: licenses } = trpc.admin.soldLicenses.list.useQuery();
  const { data: expiringSoon } = trpc.admin.soldLicenses.getExpiringSoon.useQuery({ days: 30 });

  const stats = [
    {
      title: "Total Productos",
      value: products?.length || 0,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Categorías",
      value: categories?.length || 0,
      icon: FolderTree,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Pedidos",
      value: orders?.length || 0,
      icon: ShoppingCart,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Clientes",
      value: users?.length || 0,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Licencias Vendidas",
      value: licenses?.length || 0,
      icon: Key,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  const pendingOrders = orders?.filter((o) => o.status === "pending").length || 0;
  const completedOrders = orders?.filter((o) => o.status === "completed").length || 0;

  const getDaysUntilExpiration = (expirationDate: string | Date) => {
    const today = new Date();
    const expiration = new Date(expirationDate);
    const diffTime = expiration.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpirationBadgeColor = (days: number) => {
    if (days < 0) return "bg-red-100 text-red-800";
    if (days <= 7) return "bg-orange-100 text-orange-800";
    if (days <= 30) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const expiredLicenses = licenses?.filter(l => getDaysUntilExpiration(l.expirationDate) < 0).length || 0;
  const criticalLicenses = licenses?.filter(l => {
    const days = getDaysUntilExpiration(l.expirationDate);
    return days >= 0 && days <= 7;
  }).length || 0;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido al panel de administración
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Orders Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-600">{pendingOrders}</div>
              <p className="text-sm text-muted-foreground mt-2">
                Pedidos esperando procesamiento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pedidos Completados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">{completedOrders}</div>
              <p className="text-sm text-muted-foreground mt-2">
                Pedidos finalizados exitosamente
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Licenses Expiration Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                Licencias Vencidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-600">{expiredLicenses}</div>
              <p className="text-sm text-muted-foreground mt-2">
                Requieren atención inmediata
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Calendar className="h-5 w-5" />
                Vencen en 7 días o menos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-600">{criticalLicenses}</div>
              <p className="text-sm text-muted-foreground mt-2">
                Contactar clientes pronto
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Expiring Soon Licenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Licencias Próximas a Vencer (30 días)</CardTitle>
            <Link href="/admin/sold-licenses">
              <Button variant="outline" size="sm">
                Ver Todas
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {expiringSoon && expiringSoon.length > 0 ? (
              <div className="space-y-4">
                {expiringSoon.slice(0, 5).map((license) => {
                  const daysLeft = getDaysUntilExpiration(license.expirationDate);
                  return (
                    <div
                      key={license.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{license.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {license.productName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {license.customerEmail}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium mb-1">
                          {new Date(license.expirationDate).toLocaleDateString("es-CO")}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getExpirationBadgeColor(daysLeft)
                          }`}
                        >
                          {daysLeft < 0 ? (
                            <>
                              <AlertCircle className="h-3 w-3" />
                              Vencida
                            </>
                          ) : (
                            `${daysLeft} días`
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No hay licencias próximas a vencer
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">Pedido #{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customerName || "Cliente anónimo"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        ${order.totalAmount.toLocaleString("es-CO")} COP
                      </p>
                      <p className="text-sm">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : order.status === "pending"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {order.status === "completed"
                            ? "Completado"
                            : order.status === "pending"
                            ? "Pendiente"
                            : "Cancelado"}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No hay pedidos registrados
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
