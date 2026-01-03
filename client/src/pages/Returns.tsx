import { CheckCircle, AlertCircle, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Returns() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">Política de Devolución y Garantía</h1>
          <p className="text-blue-100 mt-2">Última actualización: Enero 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Guarantee Section */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-12">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-green-900 mb-2">
                Garantía de Satisfacción 48 Horas
              </h2>
              <p className="text-green-800">
                Si no estás completamente satisfecho con tu compra, te ofrecemos
                reembolso completo o cambio por otro producto dentro de 48 horas.
              </p>
            </div>
          </div>
        </div>

        {/* Return Process */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8">Proceso de Devolución</h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                  1
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Solicita la Devolución</h3>
                <p className="text-gray-700">
                  Contacta a nuestro equipo por WhatsApp o email dentro de 48 horas
                  de tu compra. Proporciona el número de pedido y el motivo de la
                  devolución.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Verificación</h3>
                <p className="text-gray-700">
                  Verificamos que la licencia cumpla con los requisitos de
                  devolución (no haya sido instalada en más de una computadora,
                  dentro del plazo de 48 horas).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Aprobación</h3>
                <p className="text-gray-700">
                  Si tu solicitud es aprobada, procesaremos el reembolso o te
                  ofreceremos un cambio por otro producto de igual o mayor valor.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                  4
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Reembolso</h3>
                <p className="text-gray-700">
                  El reembolso se procesará en 3-5 días hábiles a tu cuenta bancaria
                  o método de pago original.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8">Condiciones para Devolución</h2>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-2">Requisitos Aceptados</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• Solicitud dentro de 48 horas de la compra</li>
                  <li>• Licencia no instalada o instalada en una sola computadora</li>
                  <li>• Prueba de compra (número de pedido)</li>
                  <li>• Razón válida de insatisfacción</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-red-900 mb-2">Requisitos No Aceptados</h3>
                <ul className="text-red-800 space-y-1">
                  <li>• Solicitudes después de 48 horas</li>
                  <li>• Licencia instalada en más de una computadora</li>
                  <li>• Cambio de opinión sin motivo técnico válido</li>
                  <li>• Licencia utilizada para reventa</li>
                  <li>• Licencia compartida con otros usuarios</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Warranty */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8">Garantía Técnica</h2>

          <div className="space-y-6">
            <div className="border-l-4 border-blue-600 pl-6">
              <h3 className="font-bold text-lg mb-2">Garantía de Funcionalidad</h3>
              <p className="text-gray-700">
                Garantizamos que todas las claves de licencia funcionarán correctamente
                en sistemas operativos compatibles. Si una licencia no se activa
                correctamente, nuestro equipo de soporte te ayudará a resolver el
                problema sin costo adicional.
              </p>
            </div>

            <div className="border-l-4 border-blue-600 pl-6">
              <h3 className="font-bold text-lg mb-2">Garantía de Autenticidad</h3>
              <p className="text-gray-700">
                Garantizamos que todas las licencias son 100% originales y legales.
                Si descubres que una licencia es falsa o ilegal, ofreceremos reembolso
                completo más compensación adicional.
              </p>
            </div>

            <div className="border-l-4 border-blue-600 pl-6">
              <h3 className="font-bold text-lg mb-2">Soporte Técnico Gratuito</h3>
              <p className="text-gray-700">
                Incluye soporte técnico gratuito durante 30 días después de la compra
                para ayudarte con instalación, activación y problemas técnicos.
              </p>
            </div>
          </div>
        </div>

        {/* Refund Timeline */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8">Cronograma de Reembolso</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <Clock className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-bold mb-2">Solicitud</h3>
              <p className="text-gray-700 text-sm">
                Dentro de 48 horas de la compra
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <RefreshCw className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-bold mb-2">Procesamiento</h3>
              <p className="text-gray-700 text-sm">
                1-2 días hábiles para verificación
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <CheckCircle className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-bold mb-2">Reembolso</h3>
              <p className="text-gray-700 text-sm">
                3-5 días hábiles en tu cuenta
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-blue-50 p-8 rounded-lg border border-blue-200 text-center">
          <h3 className="text-2xl font-bold mb-4">¿Necesitas Ayuda?</h3>
          <p className="text-gray-700 mb-6">
            Nuestro equipo está disponible para responder preguntas sobre devoluciones
            y garantías
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/573001234567"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-green-500 hover:bg-green-600 text-white w-full">
                WhatsApp
              </Button>
            </a>
            <a href="mailto:soporte@licenciasdesoftware.org">
              <Button variant="outline" className="w-full">
                Email
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
