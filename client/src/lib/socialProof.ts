/**
 * Genera un número aleatorio consistente basado en una semilla
 * La semilla asegura que el mismo input siempre genere el mismo output
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Obtiene el número de personas viendo el producto
 * Cambia cada vez que se recarga la página (entre 8 y 55)
 */
export function getViewingCount(): number {
  return Math.floor(Math.random() * (55 - 8 + 1)) + 8;
}

/**
 * Obtiene el número de ventas del día para un producto específico
 * El número es consistente durante todo el día para el mismo producto
 * Cambia cada 24 horas
 * 
 * @param productId - ID del producto
 * @returns Número de ventas del día (entre 4 y 13)
 */
export function getDailySales(productId: number): number {
  // Obtener la fecha actual en formato YYYYMMDD
  const today = new Date();
  const dateString = today.getFullYear() * 10000 + 
                     (today.getMonth() + 1) * 100 + 
                     today.getDate();
  
  // Crear semilla única combinando productId y fecha
  const seed = productId * 1000000 + dateString;
  
  // Generar número aleatorio entre 4 y 13
  const random = seededRandom(seed);
  return Math.floor(random * (13 - 4 + 1)) + 4;
}
