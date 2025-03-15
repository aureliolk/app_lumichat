// components/conversations/real-time-conversation.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import axios from "axios";
import { Button } from "@/components/ui/button";

type Message = {
  id: string;
  content: string;
  senderType: "USER" | "CONTACT";
  contentType: string;
  attachments?: any[];
  createdAt: string;
};

type Contact = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
};

type ConversationDetails = {
  id: string;
  contact: Contact;
  status: string;
  messages: Message[];
};

export default function RealTimeConversation({ conversationId }: { conversationId: string }) {
  const [conversation, setConversation] = useState<ConversationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchConversation = async () => {
    try {
      const response = await axios.get(`/api/conversations/${conversationId}`);
      setConversation(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar conversa:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversation();

    // Configurar polling para atualizações a cada 5 segundos
    pollingRef.current = setInterval(fetchConversation, 5000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [conversationId]);

  useEffect(() => {
    // Rolagem automática para o final da conversa
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);

    try {
      await axios.post(`/api/conversations/${conversationId}/messages`, {
        content: message,
        contentType: "TEXT",
      });

      setMessage("");
      fetchConversation(); // Atualizar imediatamente
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await axios.patch(`/api/conversations/${conversationId}`, {
        status: newStatus
      });
      
      fetchConversation(); // Atualizar a conversa
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full p-4">
        <div className="animate-pulse mb-4">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        
        <div className="flex-1 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse flex">
              <div className="w-10 h-10 bg-muted rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Conversa não encontrada</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Cabeçalho */}
      <div className="p-4 border-b border-[hsl(var(--border))]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-medium">
                {conversation.contact.name
                  ? conversation.contact.name.substring(0, 2).toUpperCase()
                  : "??"}
              </span>
            </div>
            <div>
              <h2 className="font-medium">
                {conversation.contact.name || "Contato sem nome"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Status: {conversation.status === "OPEN" ? "Aberta" : 
                        conversation.status === "PENDING" ? "Pendente" : "Resolvida"}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {conversation.status !== "RESOLVED" && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleStatusChange("RESOLVED")}
              >
                Resolver
              </Button>
            )}
            
            {conversation.status !== "PENDING" && conversation.status !== "RESOLVED" && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleStatusChange("PENDING")}
              >
                Marcar como Pendente
              </Button>
            )}
            
            {conversation.status === "RESOLVED" && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleStatusChange("OPEN")}
              >
                Reabrir
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.map((message) => {
          const isUser = message.senderType === "USER";
          return (
            <div
              key={message.id}
              className={`flex ${isUser ? "justify-end" : ""}`}
            >
              <div className={`max-w-[80%] ${isUser ? "order-2" : ""}`}>
                <div
                  className={`rounded-lg p-3 ${isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                >
                  <p>{message.content}</p>
                  
                  {/* Renderizar anexos se houver */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.attachments.map((attachment, index) => {
                        if (attachment.type === "image") {
                          return (
                            <div key={index} className="relative">
                              <img 
                                src={attachment.url} 
                                alt="Anexo" 
                                className="max-w-full rounded-md"
                              />
                            </div>
                          );
                        } else if (attachment.type === "file") {
                          return (
                            <div key={index} className="bg-background/50 p-2 rounded-md">
                              <a 
                                href={attachment.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary underline text-sm"
                              >
                                Baixar arquivo
                              </a>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(message.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </p>
              </div>
              {!isUser && (
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                  <span className="text-primary text-xs font-medium">
                    {conversation.contact.name
                      ? conversation.contact.name.substring(0, 2).toUpperCase()
                      : "??"}
                  </span>
                </div>
              )}
              // components/conversations/real-time-conversation.tsx (continuação)
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Formulário de envio */}
      <div className="p-4 border-t border-[hsl(var(--border))]">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 border border-[hsl(var(--border))] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={sending || conversation.status === "RESOLVED"}
          />
          <Button
            type="submit"
            disabled={sending || !message.trim() || conversation.status === "RESOLVED"}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors disabled:cursor-not-allowed"
          >
            {sending ? "Enviando..." : "Enviar"}
          </Button>
        </form>
      </div>
    </div>
  );
}