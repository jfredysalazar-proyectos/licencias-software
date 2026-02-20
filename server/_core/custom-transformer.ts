/**
 * Transformador personalizado que evita que superjson convierta
 * strings de fecha (YYYY-MM-DD) en objetos Date
 */

const customTransformer = {
  serialize: (obj: any) => {
    // Solo serializar objetos Date que NO sean strings de fecha YYYY-MM-DD
    if (obj instanceof Date) {
      return {
        $type: 'date',
        value: obj.toISOString(),
      };
    }
    return obj;
  },
  deserialize: (obj: any) => {
    // Solo deserializar objetos Date que fueron serializados por nosotros
    if (obj && obj.$type === 'date') {
      return new Date(obj.value);
    }
    return obj;
  },
};

/**
 * Transformador simple que solo maneja JSON básico
 * Evita problemas con superjson convirtiendo fechas automáticamente
 */
export const simpleTransformer = {
  serialize: (value: any): any => {
    return JSON.parse(JSON.stringify(value, (key, val) => {
      // Convertir Dates a ISO strings
      if (val instanceof Date) {
        return val.toISOString();
      }
      return val;
    }));
  },
  deserialize: (value: any): any => {
    // No hacer nada especial, mantener los strings como están
    return value;
  },
};
