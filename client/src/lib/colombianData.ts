/**
 * Nombres colombianos comunes para notificaciones de compra
 */
export const colombianNames = [
  "Sebastián",
  "Camila",
  "Andrés",
  "Valentina",
  "Juan",
  "Sofía",
  "Carlos",
  "María",
  "Daniel",
  "Isabella",
  "Diego",
  "Mariana",
  "Felipe",
  "Laura",
  "Santiago",
  "Daniela",
  "Alejandro",
  "Gabriela",
  "Miguel",
  "Paula",
  "David",
  "Carolina",
  "Nicolás",
  "Natalia",
  "Mateo",
  "Andrea",
  "Luis",
  "Ana",
  "Jorge",
  "Juliana",
  "Ricardo",
  "Catalina",
  "Fernando",
  "Alejandra",
  "Manuel",
  "Diana",
  "Pablo",
  "Paola",
  "Oscar",
  "Claudia",
  "Javier",
  "Melissa",
  "Cristian",
  "Jennifer",
  "Mauricio",
  "Katherine",
  "Esteban",
  "Tatiana",
  "Gustavo",
  "Adriana",
];

/**
 * Ciudades capitales de departamentos de Colombia
 */
export const colombianCities = [
  "Bogotá",
  "Medellín",
  "Cali",
  "Barranquilla",
  "Cartagena",
  "Cúcuta",
  "Bucaramanga",
  "Pereira",
  "Santa Marta",
  "Ibagué",
  "Pasto",
  "Manizales",
  "Neiva",
  "Villavicencio",
  "Armenia",
  "Valledupar",
  "Montería",
  "Popayán",
  "Sincelejo",
  "Tunja",
  "Florencia",
  "Riohacha",
  "Quibdó",
  "Yopal",
  "San Andrés",
  "Leticia",
  "Mocoa",
  "Mitú",
  "Puerto Carreño",
  "Inírida",
  "San José del Guaviare",
];

/**
 * Obtiene un nombre colombiano aleatorio
 */
export function getRandomName(): string {
  return colombianNames[Math.floor(Math.random() * colombianNames.length)];
}

/**
 * Obtiene una ciudad colombiana aleatoria
 */
export function getRandomCity(): string {
  return colombianCities[Math.floor(Math.random() * colombianCities.length)];
}
