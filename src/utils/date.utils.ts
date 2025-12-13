/**
 * Utilidad para parsear fechas evitando problemas de zona horaria.
 * 
 * Cuando se recibe una fecha en formato 'YYYY-MM-DD' (sin hora) y se usa
 * new Date(), JavaScript la interpreta como medianoche UTC (00:00:00 UTC).
 * En zonas horarias negativas (ej: Argentina UTC-3), esto resulta en
 * 21:00:00 del día anterior, causando que se guarde el día incorrecto.
 * 
 * Esta función agrega T12:00:00 (mediodía) cuando recibe solo una fecha,
 * evitando el problema de cambio de día en cualquier zona horaria.
 */
export function parseLocalDate(value: string | Date): Date {
    // Si ya es una fecha válida, devolverla
    if (value instanceof Date && !isNaN(value.getTime())) {
        return value;
    }

    // Si es una cadena, procesarla
    if (typeof value === 'string') {
        // Si es formato YYYY-MM-DD (sin hora), agregar T12:00:00 para evitar
        // problemas de zona horaria
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const date = new Date(value + 'T12:00:00');
            if (isNaN(date.getTime())) {
                throw new Error('La fecha no es válida');
            }
            return date;
        }
        
        // Si ya tiene hora incluida, parsear directamente
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            throw new Error('La fecha no es válida');
        }
        return date;
    }

    throw new Error('La fecha debe ser una cadena o un objeto Date válido');
}
