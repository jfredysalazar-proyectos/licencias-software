import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  price?: number;
  currency?: string;
  availability?: 'instock' | 'outofstock';
  structuredData?: object;
}

export default function SEO({
  title = 'LicenciasdeSoftware.org - Licencias Originales de Software',
  description = 'Compra licencias originales de software en Colombia. Windows, Office, Adobe, AutoCAD y más. Entrega instantánea por WhatsApp. Garantía 100% original.',
  keywords = 'licencias software, licencias originales, Windows 11, Office 365, Adobe Creative Cloud, AutoCAD, software Colombia, licencias digitales',
  image = 'https://licenciasdesoftware.org/logo.png',
  url,
  type = 'website',
  price,
  currency = 'COP',
  availability = 'instock',
  structuredData,
}: SEOProps) {
  const siteUrl = 'https://licenciasdesoftware.org';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', fullImage, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'LicenciasdeSoftware.org', true);
    updateMetaTag('og:locale', 'es_CO', true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', fullImage);

    // Product specific tags
    if (type === 'product' && price) {
      updateMetaTag('product:price:amount', price.toString(), true);
      updateMetaTag('product:price:currency', currency, true);
      updateMetaTag('product:availability', availability, true);
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    // Structured Data (JSON-LD)
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]#dynamic-structured-data');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('id', 'dynamic-structured-data');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
  }, [title, description, keywords, image, url, type, price, currency, availability, structuredData, fullUrl, fullImage]);

  return null;
}
