import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Users, 
  ShoppingCart, 
  Settings, 
  LogOut,
  Key,
  CreditCard
} from "lucide-react";
import { toast } from "sonner";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { data: admin, isLoading, error } = trpc.admin.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const logoutMutation = trpc.admin.logout.useMutation({
    onSuccess: () => {
      // Clear admin token from localStorage
      localStorage.removeItem('admin_token');
      toast.success("Sesión cerrada");
      window.location.href = "/admin/login";
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!admin || error) {
    if (location !== "/admin/login") {
      setLocation("/admin/login");
    }
    return null;
  }

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
    { icon: Package, label: "Productos", path: "/admin/products" },
    { icon: FolderTree, label: "Categorías", path: "/admin/categories" },
    { icon: ShoppingCart, label: "Pedidos", path: "/admin/orders" },
    { icon: Key, label: "Licencias Vendidas", path: "/admin/sold-licenses" },
    { icon: Users, label: "Clientes", path: "/admin/customers" },
    { icon: CreditCard, label: "Métodos de Pago", path: "/admin/payment-methods" },
    { icon: Settings, label: "Configuración", path: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/admin/dashboard">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-12 w-auto cursor-pointer"
            />
          </Link>
          <p className="text-sm text-muted-foreground mt-2">Panel de Administración</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="mb-3 px-3">
            <p className="text-sm font-medium">{admin.name || admin.username}</p>
            <p className="text-xs text-muted-foreground">{admin.email}</p>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
