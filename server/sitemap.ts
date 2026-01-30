import { Request, Response } from 'express';
import * as db from './db';

export async function generateSitemap(req: Request, res: Response) {
  try {
    const products = await db.getAllProducts();
    const categories = await db.getAllCategories();
    
    const baseUrl = 'https://licenciasdesoftware.org';
    const currentDate = new Date().toISOString().split('T')[0];
    
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Homepage
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}/</loc>\n`;
    sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
    sitemap += '    <changefreq>daily</changefreq>\n';
    sitemap += '    <priority>1.0</priority>\n';
    sitemap += '  </url>\n';
    
    // Products
    for (const product of products) {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}/producto/${product.slug}</loc>\n`;
      sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
      sitemap += '    <changefreq>weekly</changefreq>\n';
      sitemap += '    <priority>0.8</priority>\n';
      sitemap += '  </url>\n';
    }
    
    // Categories (if you have category pages)
    for (const category of categories) {
      if (category.slug) {
        sitemap += '  <url>\n';
        sitemap += `    <loc>${baseUrl}/categoria/${category.slug}</loc>\n`;
        sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
        sitemap += '    <changefreq>weekly</changefreq>\n';
        sitemap += '    <priority>0.7</priority>\n';
        sitemap += '  </url>\n';
      }
    }
    
    // Static pages
    const staticPages = [
      { url: '/terminos', priority: '0.5', changefreq: 'monthly' },
      { url: '/privacidad', priority: '0.5', changefreq: 'monthly' },
      { url: '/devoluciones', priority: '0.6', changefreq: 'monthly' },
      { url: '/soporte', priority: '0.6', changefreq: 'monthly' },
      { url: '/metodos-pago', priority: '0.6', changefreq: 'monthly' },
    ];
    
    for (const page of staticPages) {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}${page.url}</loc>\n`;
      sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += '  </url>\n';
    }
    
    sitemap += '</urlset>';
    
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}
