import { drizzle } from "drizzle-orm/mysql2";
import { categories, products } from "./drizzle/schema.js";
import "dotenv/config";

const db = drizzle(process.env.DATABASE_URL);

const categoriesData = [
  {
    name: "Sistemas Operativos",
    slug: "sistemas-operativos",
    description: "Licencias de sistemas operativos Windows y más",
  },
  {
    name: "Productividad",
    slug: "productividad",
    description: "Software de oficina y productividad",
  },
  {
    name: "Diseño y Creatividad",
    slug: "diseno-creatividad",
    description: "Herramientas profesionales de diseño y edición",
  },
  {
    name: "Inteligencia Artificial",
    slug: "inteligencia-artificial",
    description: "Herramientas potenciadas por IA",
  },
];

const productsData = [
  {
    name: "Windows 11 Pro",
    slug: "windows-11-pro",
    description: "Licencia original de Windows 11 Professional. Incluye todas las características avanzadas para profesionales y empresas. Activación permanente y actualizaciones de por vida.",
    shortDescription: "Sistema operativo profesional con características avanzadas",
    categoryId: 1,
    basePrice: 150000,
    imageUrl: "/images/windows-11-pro.png",
    featured: 1,
    inStock: 1,
    features: JSON.stringify([
      "Activación permanente",
      "Actualizaciones de por vida",
      "Soporte técnico incluido",
      "Entrega instantánea",
      "100% original",
    ]),
  },
  {
    name: "Windows 11 Home",
    slug: "windows-11-home",
    description: "Licencia original de Windows 11 Home. Perfecto para uso doméstico con todas las características esenciales. Activación permanente y actualizaciones automáticas.",
    shortDescription: "Sistema operativo ideal para el hogar",
    categoryId: 1,
    basePrice: 120000,
    imageUrl: "/images/windows-11-home.png",
    featured: 0,
    inStock: 1,
    features: JSON.stringify([
      "Activación permanente",
      "Actualizaciones automáticas",
      "Interfaz moderna",
      "Entrega instantánea",
    ]),
  },
  {
    name: "Microsoft Office 2021 Professional Plus",
    slug: "office-2021-pro",
    description: "Suite completa de Microsoft Office 2021. Incluye Word, Excel, PowerPoint, Outlook, Access, Publisher y más. Licencia perpetua sin suscripción mensual.",
    shortDescription: "Suite completa de Office con licencia perpetua",
    categoryId: 2,
    basePrice: 180000,
    imageUrl: "/images/office-2021.png",
    featured: 1,
    inStock: 1,
    features: JSON.stringify([
      "Word, Excel, PowerPoint, Outlook",
      "Access y Publisher incluidos",
      "Licencia perpetua",
      "Sin suscripción mensual",
      "Activación instantánea",
    ]),
  },
  {
    name: "Microsoft 365 Personal - 1 Año",
    slug: "microsoft-365-personal",
    description: "Suscripción anual de Microsoft 365 Personal. Incluye todas las aplicaciones de Office, 1TB de almacenamiento en OneDrive y actualizaciones continuas.",
    shortDescription: "Suscripción anual con 1TB de OneDrive",
    categoryId: 2,
    basePrice: 250000,
    imageUrl: "/images/microsoft-365.png",
    featured: 1,
    inStock: 1,
    features: JSON.stringify([
      "Todas las apps de Office",
      "1TB de almacenamiento OneDrive",
      "Actualizaciones continuas",
      "Válido por 1 año",
      "Para 1 usuario",
    ]),
  },
  {
    name: "AutoCAD 2024",
    slug: "autocad-2024",
    description: "Licencia de AutoCAD 2024 para diseño y documentación 2D y 3D. Software profesional para arquitectos, ingenieros y diseñadores.",
    shortDescription: "Software profesional de diseño CAD",
    categoryId: 3,
    basePrice: 450000,
    imageUrl: "/images/autocad.png",
    featured: 1,
    inStock: 1,
    features: JSON.stringify([
      "Diseño 2D y 3D",
      "Herramientas profesionales",
      "Documentación técnica",
      "Licencia anual",
      "Soporte técnico",
    ]),
  },
  {
    name: "Adobe Creative Cloud All Apps",
    slug: "adobe-creative-cloud",
    description: "Acceso completo a todas las aplicaciones de Adobe Creative Cloud. Incluye Photoshop, Illustrator, Premiere Pro, After Effects y más de 20 apps creativas.",
    shortDescription: "Suite completa de Adobe con más de 20 aplicaciones",
    categoryId: 3,
    basePrice: 380000,
    imageUrl: "/images/adobe-cc.png",
    featured: 1,
    inStock: 1,
    features: JSON.stringify([
      "Más de 20 aplicaciones",
      "Photoshop, Illustrator, Premiere",
      "100GB de almacenamiento",
      "Actualizaciones incluidas",
      "Licencia anual",
    ]),
  },
  {
    name: "CapCut Pro",
    slug: "capcut-pro",
    description: "Suscripción anual de CapCut Pro. Editor de video profesional con funciones avanzadas de IA, efectos especiales y herramientas de edición.",
    shortDescription: "Editor de video con IA avanzada",
    categoryId: 3,
    basePrice: 95000,
    imageUrl: "/images/capcut.png",
    featured: 0,
    inStock: 1,
    features: JSON.stringify([
      "Edición con IA",
      "Efectos especiales",
      "Sin marca de agua",
      "Exportación 4K",
      "Licencia anual",
    ]),
  },
  {
    name: "Canva Pro",
    slug: "canva-pro",
    description: "Suscripción anual de Canva Pro. Herramienta de diseño gráfico con millones de plantillas, fotos premium y funciones avanzadas.",
    shortDescription: "Diseño gráfico profesional simplificado",
    categoryId: 3,
    basePrice: 110000,
    imageUrl: "/images/canva.png",
    featured: 0,
    inStock: 1,
    features: JSON.stringify([
      "Millones de plantillas",
      "Fotos y elementos premium",
      "Fondo transparente",
      "Kit de marca",
      "Licencia anual",
    ]),
  },
  {
    name: "ChatGPT Plus",
    slug: "chatgpt-plus",
    description: "Suscripción mensual de ChatGPT Plus. Acceso prioritario, respuestas más rápidas y acceso a GPT-4 y funciones avanzadas.",
    shortDescription: "IA conversacional con GPT-4",
    categoryId: 4,
    basePrice: 85000,
    imageUrl: "/images/chatgpt.png",
    featured: 1,
    inStock: 1,
    features: JSON.stringify([
      "Acceso a GPT-4",
      "Respuestas más rápidas",
      "Acceso prioritario",
      "Plugins disponibles",
      "Suscripción mensual",
    ]),
  },
  {
    name: "Perplexity Pro",
    slug: "perplexity-pro",
    description: "Suscripción mensual de Perplexity Pro. Motor de búsqueda con IA que proporciona respuestas precisas con fuentes verificadas.",
    shortDescription: "Búsqueda inteligente con IA",
    categoryId: 4,
    basePrice: 75000,
    imageUrl: "/images/perplexity.png",
    featured: 0,
    inStock: 1,
    features: JSON.stringify([
      "Búsquedas ilimitadas",
      "Fuentes verificadas",
      "Respuestas precisas",
      "Sin anuncios",
      "Suscripción mensual",
    ]),
  },
];

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Insert categories
    console.log("📁 Inserting categories...");
    for (const category of categoriesData) {
      await db.insert(categories).values(category);
    }
    console.log("✅ Categories inserted");

    // Insert products
    console.log("📦 Inserting products...");
    for (const product of productsData) {
      await db.insert(products).values(product);
    }
    console.log("✅ Products inserted");

    console.log("🎉 Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
