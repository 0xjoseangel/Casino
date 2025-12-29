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
        return await response.json();
    } catch (error) {
        console.error("Error API:", error);
        return { error: true };
    }
};