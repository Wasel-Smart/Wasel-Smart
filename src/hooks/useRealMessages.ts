import { useState } from 'react';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  trip_id: string;
  content: string;
  sent_at: string;
  read: boolean;
}

interface Conversation {
  id: string;
  other_user: {
    id: string;
    name: string;
    avatar?: string;
  };
  last_message: Message;
  unread_count: number;
}

// Production mode - uses real backend
const DEMO_MODE = (import.meta as any)?.env?.VITE_DEMO_MODE !== 'false';

export function useRealMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (recipientId: string, tripId: string, content: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!DEMO_MODE) {
        // Production: Call real backend API
        const response = await fetch('/api/messages/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipientId, tripId, content })
        });
        if (!response.ok) throw new Error('Failed to send message');
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        return { success: true, message: data.message };
      }
      // Demo mode
      const newMessage: Message = {
        id: Date.now().toString(),
        sender_id: 'current-user',
        recipient_id: recipientId,
        trip_id: tripId,
        content,
        sent_at: new Date().toISOString(),
        read: false
      };
      setMessages(prev => [...prev, newMessage]);
      return { success: true, message: newMessage };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!DEMO_MODE) {
        // Production: Call real backend API
        const response = await fetch('/api/messages/conversations');
        if (!response.ok) throw new Error('Failed to fetch conversations');
        const data = await response.json();
        setConversations(data.conversations);
        return { success: true, conversations: data.conversations };
      }
      // Demo mode
      const mockConversations: Conversation[] = [
        {
          id: '1',
          other_user: {
            id: 'driver1',
            name: 'Ahmed Hassan'
          },
          last_message: {
            id: '1',
            sender_id: 'driver1',
            recipient_id: 'current-user',
            trip_id: '1',
            content: 'I\'ll be there in 5 minutes',
            sent_at: new Date().toISOString(),
            read: false
          },
          unread_count: 1
        }
      ];
      setConversations(mockConversations);
      return { success: true, conversations: mockConversations };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getMessages = async (conversationId: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!DEMO_MODE) {
        // Production: Call real backend API
        const response = await fetch(`/api/messages/${conversationId}`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();
        setMessages(data.messages);
        return { success: true, messages: data.messages };
      }
      // Demo mode
      const mockMessages: Message[] = [
        {
          id: '1',
          sender_id: 'driver1',
          recipient_id: 'current-user',
          trip_id: '1',
          content: 'Hello! I\'m your driver for today\'s trip.',
          sent_at: new Date(Date.now() - 3600000).toISOString(),
          read: true
        },
        {
          id: '2',
          sender_id: 'current-user',
          recipient_id: 'driver1',
          trip_id: '1',
          content: 'Great! What time will you arrive?',
          sent_at: new Date(Date.now() - 1800000).toISOString(),
          read: true
        }
      ];
      setMessages(mockMessages);
      return { success: true, messages: mockMessages };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      if (!DEMO_MODE) {
        // Production: Call real backend API
        const response = await fetch(`/api/messages/${messageId}/read`, {
          method: 'PUT'
        });
        if (!response.ok) throw new Error('Failed to mark as read');
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId ? { ...msg, read: true } : msg
          )
        );
        return { success: true };
      }
      // Demo mode
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      );
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return {
    conversations,
    messages,
    loading,
    error,
    sendMessage,
    getConversations,
    getMessages,
    markAsRead,
  };
}
