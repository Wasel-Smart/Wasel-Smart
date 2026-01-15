import { useState, useEffect } from 'react';
import { ScanSearch, SendHorizontal } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { webRealtime } from '../services/realtime';
import { toast } from 'sonner';

interface Conversation {
  id: string;
  trip: {
    id: string;
    from_location: string;
    to_location: string;
  };
  otherUser: {
    id: string;
    name: string;
    initials: string;
  };
  lastMessage?: {
    content: string;
    created_at: string;
  };
  unread: number;
  messages: Message[];
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sent: boolean;
}

export function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch conversations (trips where user is involved)
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        // Get trips where user is driver or passenger
        const { data: trips, error } = await supabase
          .from('trips')
          .select(`
            id,
            from_location,
            to_location,
            driver_id,
            profiles!trips_driver_id_fkey (
              id,
              full_name
            ),
            bookings (
              passenger_id,
              profiles!bookings_passenger_id_fkey (
                id,
                full_name
              )
            )
          `)
          .or(`driver_id.eq.${user.id},bookings.passenger_id.eq.${user.id}`)
          .eq('status', 'active');

        if (error) throw error;

        // Transform to conversations
        const convs: Conversation[] = [];
        for (const trip of trips || []) {
          // Determine the other user
          let otherUser;
          if (trip.driver_id === user.id) {
            // User is driver, get passenger from bookings
            const booking = trip.bookings?.[0];
            if (booking) {
              otherUser = {
                id: booking.profiles?.id || '',
                name: booking.profiles?.full_name || 'Unknown',
                initials: booking.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'
              };
            }
          } else {
            // User is passenger, get driver
            otherUser = {
              id: trip.profiles?.id || '',
              name: trip.profiles?.full_name || 'Unknown',
              initials: trip.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'
            };
          }

          if (otherUser) {
            // Get last message
            const { data: lastMsg } = await supabase
              .from('messages')
              .select('content, created_at')
              .eq('conversation_id', trip.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            // Get unread count (messages not read by current user)
            const { count: unreadCount } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', trip.id)
              .neq('sender_id', user.id)
              .not('read_by', 'cs', `{${user.id}}`);

            convs.push({
              id: trip.id,
              trip: {
                id: trip.id,
                from_location: trip.from_location,
                to_location: trip.to_location
              },
              otherUser,
              lastMessage: lastMsg,
              unread: unreadCount || 0,
              messages: [] // Will be loaded when selected
            });
          }
        }

        setConversations(convs);
        if (convs.length > 0) {
          setSelectedChat(convs[0]!);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast.error('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedChat || !user) return;

    const fetchMessages = async () => {
      try {
        const { data: messages, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', selectedChat.id)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const formattedMessages: Message[] = (messages || []).map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          sender_id: msg.sender_id,
          created_at: msg.created_at,
          sent: msg.sender_id === user.id
        }));

        setSelectedChat(prev => prev ? { ...prev, messages: formattedMessages } : null);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      }
    };

    fetchMessages();

    // Subscribe to real-time messages
    const channelName = webRealtime.subscribeToConversationMessages(selectedChat.id, {
      onNewMessage: (message) => {
        setSelectedChat(prev => {
          if (!prev) return prev;
          const newMsg: Message = {
            id: message.id,
            content: message.content,
            sender_id: message.sender_id,
            created_at: message.created_at,
            sent: message.sender_id === user.id
          };
          return {
            ...prev,
            messages: [...prev.messages, newMsg],
            lastMessage: {
              content: message.content,
              created_at: message.created_at
            }
          };
        });
      },
      onError: (error) => {
        console.error('Realtime error:', error);
      }
    });

    return () => {
      webRealtime.unsubscribe(channelName);
    };
  }, [selectedChat?.id, user]);

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedChat || !user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedChat.id,
          sender_id: user.id,
          content: messageText.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1>Messages</h1>
          <p className="text-gray-600">Chat with your co-travelers</p>
        </div>
        <Card className="h-[calc(100vh-16rem)] flex items-center justify-center">
          <p>Loading conversations...</p>
        </Card>
      </div>
    );
  }

  if (!selectedChat) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1>Messages</h1>
          <p className="text-gray-600">Chat with your co-travelers</p>
        </div>
        <Card className="h-[calc(100vh-16rem)] flex items-center justify-center">
          <p>No conversations yet</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1>Messages</h1>
        <p className="text-gray-600">Chat with your co-travelers</p>
      </div>

      <Card className="h-[calc(100vh-16rem)] flex">
        {/* Conversations List */}
        <div className="w-full md:w-80 border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <ScanSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search messages..." className="pl-10" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedChat(conversation)}
                className={`w-full p-4 border-b text-left hover:bg-gray-50 transition-colors ${selectedChat?.id === conversation.id ? 'bg-primary/5' : ''
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span>{conversation.otherUser.initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium truncate">{conversation.otherUser.name}</p>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {conversation.lastMessage ? formatTime(conversation.lastMessage.created_at) : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage?.content || 'No messages yet'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {conversation.trip.from_location} → {conversation.trip.to_location}
                    </p>
                  </div>
                  {conversation.unread > 0 && (
                    <Badge className="bg-primary text-primary-foreground flex-shrink-0">{conversation.unread}</Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span>{selectedChat.otherUser.initials}</span>
              </div>
              <div>
                <p className="font-medium">{selectedChat.otherUser.name}</p>
                <p className="text-sm text-gray-500">
                  {selectedChat.trip.from_location} → {selectedChat.trip.to_location}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedChat.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sent
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-100 text-gray-900'
                    }`}
                >
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${message.sent ? 'text-primary-foreground/70' : 'text-gray-500'}`}>
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    setMessageText('');
                  }
                }}
              />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <SendHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}