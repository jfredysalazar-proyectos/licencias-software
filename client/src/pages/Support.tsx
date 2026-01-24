import { useState } from "react";
import { ChevronDown, ChevronUp, Mail, MessageCircle, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "¿Cómo recibo mi licencia después de comprar?",
    answer:
      "Después de completar tu compra por WhatsApp, recibirás la clave de licencia y las instrucciones de instalación en el mismo chat en menos de 5 minutos. Las licencias son 100% originales y legales.",
  },
  {
    question: "¿Puedo usar la licencia en múltiples computadoras?",
    answer:
      "Depende del tipo de licencia que compres. Las licencias de usuario único funcionan en una computadora, mientras que las licencias de múltiples dispositivos permiten instalar en hasta 5 PCs. Verifica las características de cada producto.",
  },
  {
    question: "¿Las licencias son de por vida o tienen vencimiento?",
    answer:
      "Ofrecemos dos tipos: licencias vitalicia (sin vencimiento) y licencias anuales (renovables). Puedes elegir según tus necesidades. Las licencias vitalicia incluyen actualizaciones gratuitas.",
  },
  {
    question: "¿Qué pasa si tengo problemas con la instalación?",
    answer:
      "Nuestro equipo de soporte está disponible 24/7 por WhatsApp. Envíanos un mensaje describiendo tu problema y te ayudaremos a resolverlo paso a paso. Contamos con guías de instalación para cada software.",
  },
  {
    question: "¿Puedo devolver mi compra?",
    answer:
      "Ofrecemos garantía de satisfacción de 48 horas. Si la licencia no funciona correctamente o no es lo que esperabas, te ofreceremos un reembolso completo o un cambio por otro producto.",
  },
  {
    question: "¿Aceptan métodos de pago además de WhatsApp?",
    answer:
      "Actualmente procesamos pedidos principalmente por WhatsApp, lo que permite una comunicación directa y rápida. Puedes consultar sobre otros métodos de pago contactándonos directamente.",
  },
  {
    question: "¿Las licencias son legales y originales?",
    answer:
      "Sí, todas nuestras licencias son 100% originales y legales. Trabajamos directamente con distribuidores autorizados. Cada licencia viene con certificado de autenticidad.",
  },
  {
    question: "¿Qué incluye el soporte técnico?",
    answer:
      "Incluye ayuda con instalación, activación, problemas técnicos y preguntas sobre el software. Nuestro equipo responde en menos de 1 hora durante horario comercial.",
  },
];

export default function Support() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Centro de Ayuda</h1>
          <p className="text-xl text-blue-100">
            Encuentra respuestas a tus preguntas y obtén soporte técnico
          </p>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <MessageCircle className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="font-bold text-lg mb-2">WhatsApp</h3>
            <p className="text-gray-600 text-sm mb-4">
              Chat instantáneo con nuestro equipo
            </p>
            <a
              href="https://wa.me/573334315646"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Contactar →
            </a>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <Mail className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="font-bold text-lg mb-2">Email</h3>
            <p className="text-gray-600 text-sm mb-4">
              Respuesta en menos de 24 horas
            </p>
            <a
              href="mailto:soporte@licenciasdesoftware.org"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              soporte@licenciasdesoftware.org
            </a>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <Clock className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="font-bold text-lg mb-2">Horario</h3>
            <p className="text-gray-600 text-sm">
              Lunes a Viernes: 8:00 AM - 6:00 PM<br />
              Sábados: 9:00 AM - 2:00 PM<br />
              Domingos: Cerrado
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <Phone className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="font-bold text-lg mb-2">Teléfono</h3>
            <p className="text-gray-600 text-sm mb-4">
              Llamadas y mensajes disponibles
            </p>
            <a
              href="tel:+573334315646"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              +57 300 123 4567
            </a>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Preguntas Frecuentes
          </h2>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-left text-gray-900">
                    {item.question}
                  </span>
                  {expandedIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {expandedIndex === index && (
                  <div className="px-6 py-4 bg-white border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-12 bg-blue-50 p-8 rounded-lg border border-blue-200 text-center">
            <h3 className="text-2xl font-bold mb-4">¿No encontraste lo que buscas?</h3>
            <p className="text-gray-700 mb-6">
              Nuestro equipo de soporte está listo para ayudarte con cualquier pregunta
            </p>
            <a
              href="https://wa.me/573334315646"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-green-500 hover:bg-green-600 text-white">
                Contactar por WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
