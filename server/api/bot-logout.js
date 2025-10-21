// server/api/bot-logout.js

import fs from 'fs';
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    // Ajusta la ruta del archivo de sesión si es diferente
    const SESSION_FILE_PATH = './session.json'; 
    
    // Obtener la instancia global del cliente de WhatsApp
    const client = globalThis.whatsappClient;

    try {
        if (client && client.destroy) {
            // Destruir la sesión activa
            await client.destroy();
        }
        
        // Eliminar el archivo de sesión guardado para forzar un nuevo QR
        if (fs.existsSync(SESSION_FILE_PATH)) {
            fs.unlinkSync(SESSION_FILE_PATH);
        }
        
        // Limpiar los estados globales (Necesario si mantienes el estado del bot globalmente)
        globalThis.whatsappClient = null;
        globalThis.clientStatus = 'disconnected';
        globalThis.sessionInfo = null;
        globalThis.qrCodeText = null;

        console.log('✅ Sesión cerrada y archivo eliminado exitosamente.');
        
        return { success: true, message: 'Sesión cerrada exitosamente.' };

    } catch (e) {
        console.error('Error al intentar cerrar la sesión:', e);
        // Forzar la limpieza del archivo incluso si la destrucción falla
        if (fs.existsSync(SESSION_FILE_PATH)) {
            fs.unlinkSync(SESSION_FILE_PATH);
        }
        // Devolvemos éxito para forzar la redirección del frontend
        return { success: true, message: 'Error en la desconexión, pero se eliminó el archivo de sesión.' };
    }
});