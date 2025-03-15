"use client";

import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type Message = {
  id: string;
  content: string;
  senderType: "USER" | "CONTACT";
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

export default function ConversationView({ conversationId }: { conversationId: string }) {
  const [conversation, setConversation] = useState<ConversationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConversation = async () => {
      setLoading(true);
      
      // Simular carregamento da conversa da API
      setTimeout(() => {
        const fakeConversation: ConversationDetails = {
          id: conversationId,
          contact: {
            id: "contact1",
            name: conversationId === "1" ? "João Silva" : 
                  conversationId === "2" ? "Maria Souza" : "Pedro Costa",
            avatarUrl: null,
          },
          status: "OPEN",
          messages: [
            {
              id: "msg1",
              content: "Olá, gostaria de saber mais sobre o produto.",
              senderType: "CONTACT",
              createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            },
            {
              id: "msg2",
              content: "Olá! Claro, em que posso ajudar?",
              senderType: "USER",
              createdAt: new Date(Date.now() - 1000 * 60 * 29).toISOString(),
            },
            {
              id: "msg3",
              content: "Quais são as especificações do produto?",
              senderType: "CONTACT",
              createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
            },
            {
              id: "msg4",
              content: "O produto tem 30cm de altura, 50cm de largura e pesa 2kg. Vem em embalagem lacrada e com garantia de 1 ano.",
              senderType: "USER",
              createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
            },
            {
              id: "msg5",
              content: "E qual o prazo de entrega para São Paulo?",
              senderType: "CONTACT",
              createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            },
            {
              id: "msg6",
              content: "Para São Paulo capital, o prazo é de 3 a 5 dias úteis após a confirmação do pagamento.",
              senderType: "USER",
              createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
            },
            {
              id: "msg7",
              content: "Perfeito! Vou fazer o pedido então.",
              senderType: "CONTACT",
              createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            },
          ],
        };
        
        setConversation(fakeConversation);
        setLoading(false);
      }, 800);
    };

    fetchConversation();
  }, [conversationId]);

  useEffect(() => {
    // Rolagem automática para o final da conversa
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);

    // Simular envio de mensagem
    setTimeout(() => {
      if (conversation) {
        const newMessage: Message = {
          id: `new-${Date.now()}`,
          content: message,
          senderType: "USER",
          createdAt: new Date().toISOString(),
        };

        setConversation({
          ...conversation,
          messages: [...conversation.messages, newMessage],
        });

        setMessage("");
        setSending(false);
      }
    }, 500);
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
              Status: {conversation.status === "OPEN" ? "Aberta" : conversation.status === "PENDING" ? "Pendente" : "Resolvida"}
            </p>
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
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
