import { Zap, Shield, Headphones, CheckCircle } from "lucide-react";

export default function WhyChooseUs() {
  const benefits = [
    {
      icon: Zap,
      title: "Entrega Instantánea",
      description:
        "Recibe tu clave de licencia por WhatsApp en menos de 1 minuto después de confirmar el pago.",
    },
    {
      icon: Shield,
      title: "Licencias 100% Originales",
      description:
        "Garantizamos que todas nuestras licencias son auténticas y legales, directas de proveedores autorizados.",
    },
    {
      icon: Headphones,
      title: "Soporte 24/7",
      description:
        "Nuestro equipo está disponible todo el día para ayudarte con instalación, activación y problemas técnicos.",
    },
    {
      icon: CheckCircle,
      title: "Garantía de Satisfacción",
      description:
        "Si no estás satisfecho, ofrecemos reembolso completo dentro de 48 horas sin preguntas.",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            ¿Por qué Elegirnos?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Somos la plataforma más confiable para comprar licencias de software
            en Colombia. Aquí te mostramos por qué miles de clientes nos prefieren.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300"
              >
                {/* Icon */}
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {benefit.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg p-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <p className="text-blue-100">Clientes Satisfechos</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9/5</div>
              <p className="text-blue-100">Calificación Promedio</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <p className="text-blue-100">Soporte Disponible</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
