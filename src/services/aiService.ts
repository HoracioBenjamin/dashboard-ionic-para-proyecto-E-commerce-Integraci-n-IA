import { supabase } from '../supabaseClient';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3000';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export interface SendMessageResponse {
  reply: string;
  error?: string;
}

/**
 * Envía un mensaje de chat al backend de Next.js (`/api/dashboard/chat`)
 * adjuntando el token de sesión de Supabase Auth para validación RBAC.
 */
export async function sendDashboardChatMessage(message: string, conversationHistory: ChatMessage[] = []): Promise<SendMessageResponse> {
  try {
    // 1. Obtener la sesión activa de Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.warn('[aiService] No hay sesión activa en Supabase Auth.');
      // Opcional: Si requieres auth estricta para la Etapa 1, se puede retornar error o enviar sin token.
    }

    const token = session?.access_token;

    // 2. Realizar petición POST al backend Next.js
    const response = await fetch(`${BACKEND_API_URL}/api/dashboard/chat`,   {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        message,
        history: conversationHistory.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }))
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error HTTP ${response.status}`);
    }

    const data = await response.json();
    return { reply: data.reply || data.text || 'Sin respuesta del servidor.' };
  } catch (err: any) {
    console.error('[aiService] Error al enviar mensaje:', err);
    return {
      reply: '',
      error: err.message || 'No se pudo conectar con el servidor de IA.'
    };
  }
}
