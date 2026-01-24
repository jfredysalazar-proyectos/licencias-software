import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import CartDrawer from "@/components/CartDrawer";

export default function Privacy() {
  const [, setLocation] = useLocation();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onCartClick={() => setCartOpen(true)} />

      <main className="flex-1">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12">
          <div className="container mx-auto px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="text-white hover:bg-white/10 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
            <h1 className="text-4xl font-bold">Política de Privacidad</h1>
            <p className="text-blue-100 mt-2">Última actualización: Enero 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <div className="prose prose-sm max-w-none">
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Introducción</h2>
            <p className="text-gray-700 mb-4">
              En LicenciasdeSoftware.org, nos comprometemos a proteger tu privacidad y
              garantizar que entiendas cómo recopilamos, utilizamos y protegemos tu
              información personal. Esta Política de Privacidad explica nuestras
              prácticas de privacidad.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">2. Información que Recopilamos</h2>
            <p className="text-gray-700 mb-4">
              <strong>2.1 Información Personal:</strong> Cuando realizas una compra,
              recopilamos:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Nombre completo</li>
              <li>Número de teléfono/WhatsApp</li>
              <li>Dirección de email</li>
              <li>Información de ubicación (ciudad, departamento)</li>
              <li>Historial de compras</li>
            </ul>

            <p className="text-gray-700 mb-4">
              <strong>2.2 Información de Navegación:</strong> Recopilamos información
              sobre cómo interactúas con nuestro sitio:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Dirección IP</li>
              <li>Tipo de navegador y dispositivo</li>
              <li>Páginas visitadas</li>
              <li>Tiempo de permanencia en el sitio</li>
              <li>Cookies y tecnologías similares</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">3. Cómo Utilizamos tu Información</h2>
            <p className="text-gray-700 mb-4">
              Utilizamos tu información para:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Procesar y completar tus compras</li>
              <li>Enviar claves de licencia y confirmaciones</li>
              <li>Proporcionar soporte técnico</li>
              <li>Mejorar nuestros servicios y experiencia del usuario</li>
              <li>Enviar actualizaciones y promociones (con tu consentimiento)</li>
              <li>Cumplir con obligaciones legales</li>
              <li>Prevenir fraude y actividades ilícitas</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">4. Protección de Datos</h2>
            <p className="text-gray-700 mb-4">
              <strong>4.1 Seguridad:</strong> Implementamos medidas de seguridad
              técnicas, administrativas y físicas para proteger tu información personal
              contra acceso no autorizado, alteración, divulgación o destrucción.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>4.2 Encriptación:</strong> Toda la información sensible se
              transmite mediante encriptación SSL/TLS de 256 bits.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>4.3 Acceso Limitado:</strong> Solo el personal autorizado tiene
              acceso a tu información personal, y solo cuando es necesario para
              proporcionar nuestros servicios.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">5. Compartir Información</h2>
            <p className="text-gray-700 mb-4">
              No vendemos, alquilamos ni compartimos tu información personal con
              terceros para fines de marketing. Sin embargo, podemos compartir
              información:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Con proveedores de servicios que nos ayudan a operar (pagos, hosting)</li>
              <li>Cuando es requerido por ley o autoridades</li>
              <li>Para proteger nuestros derechos legales</li>
              <li>En caso de venta o fusión de la empresa</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">6. Cookies</h2>
            <p className="text-gray-700 mb-4">
              Utilizamos cookies para:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Recordar tus preferencias</li>
              <li>Mantener tu sesión activa</li>
              <li>Analizar el tráfico del sitio</li>
              <li>Mejorar la experiencia del usuario</li>
            </ul>
            <p className="text-gray-700 mb-4">
              Puedes controlar las cookies a través de la configuración de tu navegador.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">7. Derechos del Usuario</h2>
            <p className="text-gray-700 mb-4">
              Tienes derecho a:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Acceder a tu información personal</li>
              <li>Solicitar correcciones de datos inexactos</li>
              <li>Solicitar la eliminación de tu información</li>
              <li>Oponerme al procesamiento de mis datos</li>
              <li>Solicitar portabilidad de datos</li>
              <li>Retirar consentimiento en cualquier momento</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">8. Retención de Datos</h2>
            <p className="text-gray-700 mb-4">
              Retenemos tu información personal durante el tiempo necesario para
              proporcionar nuestros servicios y cumplir con obligaciones legales. Los
              datos de transacciones se mantienen por 7 años según regulaciones fiscales.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">9. Cambios en la Política</h2>
            <p className="text-gray-700 mb-4">
              Nos reservamos el derecho de actualizar esta Política de Privacidad en
              cualquier momento. Los cambios serán efectivos inmediatamente después de
              su publicación. Te recomendamos revisar esta política periódicamente.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">10. Contacto</h2>
            <p className="text-gray-700 mb-4">
              Si tienes preguntas sobre esta Política de Privacidad o deseas ejercer tus
              derechos:
            </p>
            <ul className="list-none text-gray-700 space-y-2">
              <li>WhatsApp: +57 333 431 5646</li>
              <li>Email: privacidad@licenciasdesoftware.org</li>
              <li>Dirección: Bogotá, Colombia</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">11. Cumplimiento Legal</h2>
            <p className="text-gray-700 mb-4">
              Cumplimos con la Ley 1581 de 2012 (Ley de Protección de Datos Personales
              de Colombia) y otras regulaciones de privacidad aplicables.
            </p>
          </div>
        </div>
      </main>

      <Footer />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {}}
      />
    </div>
  );
}
