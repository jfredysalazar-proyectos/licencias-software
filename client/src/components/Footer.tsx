import { Link } from "wouter";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const whatsappNumber = "573001234567"; // Número de ejemplo
  const whatsappMessage = "Hola, tengo una consulta sobre las licencias de software";

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <img 
              src="/logo.png" 
              alt="LicenciasdeSoftware.org" 
              className="h-14 w-auto"
            />
            <p className="text-sm text-muted-foreground">
              Tu tienda confiable de licencias de software originales con entrega instantánea.
            </p>
          </div>

          {/* Soporte */}
          <div>
            <h3 className="font-semibold mb-4">Soporte</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/soporte">
                  <span className="text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                    Centro de Ayuda
                  </span>
                </Link>
              </li>
              <li>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                    whatsappMessage
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Contacto Directo
                </a>
              </li>
              <li>
                <a
                  href="mailto:soporte@licenciasdesoftware.org"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Email de Soporte
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terminos">
                  <span className="text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                    Términos y Condiciones
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/privacidad">
                  <span className="text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                    Política de Privacidad
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/devoluciones">
                  <span className="text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                    Garantía y Devoluciones
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Mi Cuenta */}
          <div>
            <h3 className="font-semibold mb-4">Mi Cuenta</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/mis-pedidos">
                  <span className="text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                    Mis Pedidos
                  </span>
                </Link>
              </li>
              <li>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                    whatsappMessage
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chatear en WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2025 LicenciasdeSoftware.org - Todos los derechos reservados</p>
            <p>⭐ 4.9/5 basado en más de 10,000+ reseñas verificadas</p>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          whatsappMessage
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40"
      >
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg hover:scale-110 transition-transform bg-green-500 hover:bg-green-600"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </a>
    </footer>
  );
}
