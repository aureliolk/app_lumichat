// components/conversations/conversation-filterable-list.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type Conversation = {
  id: string;
  status: string;
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

export default function ConversationFilterableList({
  workspaceId,
  initialStatus = "OPEN",
}: {
  workspaceId: string;
  initialStatus?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(
    searchParams.get("status") || initialStatus
  );
  const [search, setSearch] = useState("");
  
  const selectedId = searchParams.get("id");
  
  useEffect(() => {
    fetchConversations();
  }, [status, workspaceId]);
  
  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/workspaces/${workspaceId}/conversations?status=${status}${search ? `&search=${search}` : ""}`
      );
      setConversations(response.data);
    } catch (error) {
      console.error("Erro ao buscar conversas:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    
    // Atualizar URL
    const params = new URLSearchParams(searchParams);
    params.set("status", newStatus);
    router.push(`${pathname}?${params.toString()}`);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchConversations();
  };
  
  const handleSelectConversation = (conversationId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("id", conversationId);
    router.push(`${pathname}?${params.toString()}`);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[hsl(var(--border))]">
        <h2 className="text-lg font-semibold">Conversas</h2>
        
        <div className="flex space-x-2 mt-2">
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              status === "OPEN"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
            onClick={() => handleStatusChange("OPEN")}
          >
            Abertas
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              status === "PENDING"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
            onClick={() => handleStatusChange("PENDING")}
          >
            Pendentes
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              status === "RESOLVED"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
            onClick={() => handleStatusChange("RESOLVED")}
          >
            Resolvidas
          </button>
        </div>
        
        <form onSubmit={handleSearch} className="mt-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full px-3 py-2 text-sm border border-[hsl(var(--border))] rounded-md"
          />
        </form>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {loading ? (
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
        ) : conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full p-4 text-center">
            <div>
              <p className="text-muted-foreground">Nenhuma conversa encontrada</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[hsl(var(--border))]">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 cursor-pointer hover:bg-muted/40 transition-colors ${
                  selectedId === conversation.id ? "bg-muted" : ""
                }`}
                onClick={() => handleSelectConversation(conversation.id)}
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
                          {formatDistanceToNow(
                            new Date(conversation.lastMessage.createdAt),
                            {
                              addSuffix: true,
                              locale: ptBR,
                            }
                          )}
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}