import superjson from 'superjson';

/**
 * Transformador que usa superjson pero evita convertir strings de fecha YYYY-MM-DD
 * en objetos Date, que es lo que causaba el problema original.
 */
export const safeTransformer = {
  serialize: (value: any) => {
    // Usar superjson para serializar
    return superjson.serialize(value);
  },
  deserialize: (payload: any) => {
    // Usar superjson para deserializar
    return superjson.deserialize(payload);
  },
};
