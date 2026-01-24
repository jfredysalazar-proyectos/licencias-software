import { useEffect, useState } from "react";
import { CheckCircle, Mail, Download, Home, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function OrderSuccess() {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = "/";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onCartClick={() => {}} />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-2xl w-full">
          {/* Success Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <CheckCircle className="w-24 h-24 text-green-500 relative" />
            </div>
          </div>

          {/* Main Message */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              ¡Pago Procesado Exitosamente! 🎉
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              Tu orden ha sido confirmada
            </p>
            <p className="text-muted-foreground">
              Estamos procesando tu compra y generando tus licencias
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-3 text-blue-500" />
              <h3 className="font-semibold mb-2">Procesamiento</h3>
              <p className="text-sm text-muted-foreground">
                1-5 minutos
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <Mail className="w-8 h-8 mx-auto mb-3 text-purple-500" />
              <h3 className="font-semibold mb-2">Email Confirmación</h3>
              <p className="text-sm text-muted-foreground">
                Revisa tu bandeja
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <Download className="w-8 h-8 mx-auto mb-3 text-green-500" />
              <h3 className="font-semibold mb-2">Licencias</h3>
              <p className="text-sm text-muted-foreground">
                Disponibles pronto
              </p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-muted rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">📋 Próximos Pasos</h2>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <div>
                  <p className="font-medium">Revisa tu email</p>
                  <p className="text-sm text-muted-foreground">
                    Te enviaremos un correo con los detalles de tu orden y las licencias
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <div>
                  <p className="font-medium">Descarga tus licencias</p>
                  <p className="text-sm text-muted-foreground">
                    Encontrarás las claves de activación en el email
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </span>
                <div>
                  <p className="font-medium">Activa tu software</p>
                  <p className="text-sm text-muted-foreground">
                    Sigue las instrucciones incluidas en el email
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* Support Info */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              ¿Necesitas ayuda?
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Si no recibes el email en los próximos 10 minutos, revisa tu carpeta de spam o contáctanos por WhatsApp.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const whatsappNumber = "573334315646";
                const message = "Hola, completé mi pago pero no he recibido las licencias";
                window.open(
                  `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
                  "_blank"
                );
              }}
            >
              Contactar Soporte
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => (window.location.href = "/")}
              className="gap-2"
            >
              <Home className="w-5 h-5" />
              Volver a la Tienda
            </Button>
          </div>

          {/* Auto Redirect */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Serás redirigido automáticamente en {countdown} segundos...
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
