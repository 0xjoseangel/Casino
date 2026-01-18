const API_URL = 'http://127.0.0.1:8000/api'; // Puerto de Django

// Función genérica para pedir datos
export const getData = async (endpoint) => {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`);
        return await response.json();
    } catch (error) {
        console.error("Error API:", error);
        return [];
    }
};

// Función genérica para enviar datos (POST)
export const postData = async (endpoint, data) => {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        // Devolvemos el JSON incluso si hay error (ej: 400 Bad Request) para leer los detalles
        return await response.json();
    } catch (error) {
        console.error("Error API:", error);
        return { error: true, detail: "Error de conexión con el servidor" };
    }
};

// Función genérica para actualizar datos (PUT)
export const putData = async (endpoint, body) => {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                // Si usas tokens, recuerda añadirlos aquí también
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const errorData = await response.json();
            return { error: true, ...errorData }; // Devuelve los errores
        }
        return await response.json();
    } catch (error) {
        console.error("Error PUT:", error);
        return { error: true, detail: "Error de conexión" };
    }
};