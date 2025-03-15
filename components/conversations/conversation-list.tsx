"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type Conversation = {
  id: string;
  contact: {
    name: string | null;
    avatarUrl: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: string;
  } | null;
  unreadCount: number;
};

export default function ConversationList({
  selectedId,
  status = "OPEN",
}: {
  selectedId?: string;
  status: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulando carregamento de conversas da API
    const fakeConversations: Conversation[] = [
      {
        id: "1",
        contact: {
          name: "João Silva",
          avatarUrl: null,
        },
        lastMessage: {
          content: "Olá, gostaria de saber mais sobre o produto.",
          createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutos atrás
        },
        unreadCount: 2,
      },
      {
        id: "2",
        contact: {
          name: "Maria Souza",
          avatarUrl: null,
        },
        lastMessage: {
          content: "Qual o prazo de entrega para São Paulo?",
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutos atrás
        },
        unreadCount: 0,
      },
      {
        id: "3",
        contact: {
          name: "Pedro Costa",
          avatarUrl: null,
        },
        lastMessage: {
          content: "Obrigado pelo atendimento!",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 horas atrás
        },
        unreadCount: 0,
      },
    ];

    setTimeout(() => {
      setConversations(fakeConversations);
      setLoading(false);
    }, 500);
  }, [status]);

  if (loading) {
    return (
      <div className="p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="mb-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-center">
        <div>
          <p className="text-muted-foreground">Nenhuma conversa encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[hsl(var(--border))]">
      {conversations.map((conversation) => {
        const isSelected = selectedId === conversation.id;
        return (
          <Link
            key={conversation.id}
            href={`${pathname}?id=${conversation.id}&status=${status}`}
            className={`block p-4 hover:bg-muted/40 transition-colors ${isSelected ? "bg-muted" : ""}`}
          >
            <div className="flex items-start space-x-3">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-medium">
                    {conversation.contact.name
                      ? conversation.contact.name.substring(0, 2).toUpperCase()
                      : "??"}
                  </span>
                </div>
                {conversation.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-medium truncate">
                    {conversation.contact.name || "Contato sem nome"}
                  </h3>
                  {conversation.lastMessage && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  )}
                </div>
                {conversation.lastMessage && (
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage.content}
                  </p>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
