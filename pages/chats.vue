<script setup>
import { ref, onMounted } from 'vue';
import { navigateTo } from '#app';

const sessionInfo = ref(null);
const chats = ref([]); 
const selectedChat = ref(null); 
const messageInput = ref('');

// 1. Cargar el estado y verificar si es necesario redirigir
const checkStatusAndLoadData = async () => {
    // Si no tenemos info en el cliente (ej: recarga de página), pedimos el estado.
    const statusResponse = await fetch('/api/bot-status');
    const statusData = await statusResponse.json();
    
    // Si el bot no está ready o no hay info, redirigimos a la página de QR
    if (statusData.status !== 'ready' || !statusData.sessionInfo) {
        navigateTo('/'); 
        return;
    }

    sessionInfo.value = statusData.sessionInfo;
    
    // Simulación de carga de chats
    chats.value = [
        { id: '1', name: 'Usuario Pruebas', number: '123456789', lastMessage: 'Hola, ¿puedes enviar un mensaje?' },
        { id: '2', name: 'Soporte Nuxt', number: '987654321', lastMessage: 'Pendiente de confirmación.' },
    ];

    // Seleccionar el primer chat automáticamente (opcional)
    if (chats.value.length > 0) {
        selectedChat.value = chats.value[0];
    }
};

// 2. Función para cerrar sesión
const logout = async () => {
    if (!confirm("¿Estás seguro de que deseas cerrar la sesión de WhatsApp?")) {
        return;
    }
    try {
        // Llama a la API para desconectar y borrar la sesión
        const response = await fetch('/api/bot-logout', { method: 'POST' });
        const result = await response.json();

        if (result.success) {
            // Redirigir a la página de inicio para ver el nuevo QR
            navigateTo('/');
        } else {
            alert('Error al cerrar sesión: ' + result.message);
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('Ocurrió un error de red al intentar cerrar sesión.');
    }
};

// 3. Función para enviar un mensaje (Temporal)
const sendMessage = () => {
    if (!messageInput.value.trim() || !selectedChat.value) {
        return;
    }

    console.log(`Enviando a ${selectedChat.value.name}: ${messageInput.value}`);
    alert(`Simulación: Mensaje enviado a ${selectedChat.value.name}`);

    // Lógica real de API para enviar mensaje (p. ej., POST /api/send-message)
    
    messageInput.value = ''; // Limpiar input
};

onMounted(() => {
    checkStatusAndLoadData();
});
</script>

<template>
    <div class="bg-gray-100 min-h-screen flex">
        <div class="w-full max-w-6xl mx-auto flex flex-col md:flex-row shadow-lg rounded-xl overflow-hidden my-8">
            
            <div class="w-full md:w-1/3 bg-gray-50 border-r border-gray-200 p-4">
                <header class="mb-4 pb-4 border-b">
                    <h2 class="text-xl font-bold text-gray-800">Chats Activos</h2>
                    <p v-if="sessionInfo" class="text-sm text-green-600 mt-1">Conectado como: **{{ sessionInfo.name }}**</p>
                </header>

                <button 
                    @click="logout"
                    class="w-full mb-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-150"
                >
                    Cerrar Sesión
                </button>

                <div class="space-y-2 max-h-96 overflow-y-auto">
                    <div 
                        v-for="chat in chats" 
                        :key="chat.id" 
                        @click="selectedChat = chat"
                        :class="['p-3 rounded-lg shadow-sm cursor-pointer transition duration-150', selectedChat && selectedChat.id === chat.id ? 'bg-blue-100 border-l-4 border-blue-500' : 'bg-white hover:bg-gray-100']"
                    >
                        <p class="font-semibold text-gray-900">{{ chat.name }}</p>
                        <p class="text-xs text-gray-500 truncate">{{ chat.lastMessage }}</p>
                    </div>
                </div>
            </div>

            <div class="w-full md:w-2/3 flex flex-col bg-white">
                <header class="p-4 border-b">
                    <h2 class="text-lg font-semibold text-gray-800">
                        {{ selectedChat ? selectedChat.name : 'Selecciona un Chat' }}
                    </h2>
                </header>
                
                <div v-if="selectedChat" class="flex-grow p-4 overflow-y-auto space-y-4">
                    <div class="flex justify-start">
                        <div class="bg-blue-100 text-blue-900 p-3 rounded-xl max-w-xs">
                            ¡Bienvenido al chat!
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <div class="bg-green-100 text-green-900 p-3 rounded-xl max-w-xs">
                            Ya puedo ver la interfaz. ¿Cómo envío un mensaje?
                        </div>
                    </div>
                </div>
                <div v-else class="flex-grow p-4 flex items-center justify-center text-gray-500">
                    Comienza seleccionando un contacto para ver y enviar mensajes.
                </div>

                <div v-if="selectedChat" class="p-4 border-t bg-gray-50">
                    <form @submit.prevent="sendMessage" class="flex space-x-3">
                        <input 
                            type="text" 
                            v-model="messageInput"
                            placeholder="Escribe tu mensaje..." 
                            class="flex-grow border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button 
                            type="submit"
                            class="px-5 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-150"
                        >
                            Enviar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>