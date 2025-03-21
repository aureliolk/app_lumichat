import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ConversationList from "@/components/conversations/conversation-list";
import ConversationView from "@/components/conversations/conversation-view";
import ConversationEmpty from "@/components/conversations/conversation-empty";

export const metadata: Metadata = {
  title: "Conversas | ChatLumi",
  description: "Visualize e responda às suas conversas",
};

// Função auxiliar para obter valores seguros de searchParams
async function getSearchParam(params: any, key: string, defaultValue: string = ""): Promise<string> {
  // Se params for uma Promise, espere por ela
  const resolvedParams = params instanceof Promise ? await params : params;
  // Se o valor for undefined ou null, retorne o valor padrão
  return (resolvedParams && resolvedParams[key]) || defaultValue;
}

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: { id?: string; status?: string } | Promise<{ id?: string; status?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Obtenha os parâmetros de forma assíncrona
  const status = await getSearchParam(searchParams, "status", "OPEN");
  const conversationId = await getSearchParam(searchParams, "id", "");

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Lista de conversas */}
      <div className="w-80 border-r border-[hsl(var(--border))] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-lg font-semibold">Conversas</h2>
          <div className="flex space-x-2 mt-2">
            <button
              className={`px-3 py-1 text-sm rounded-md ${status === "OPEN" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
            >
              Abertas
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${status === "PENDING" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
            >
              Pendentes
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${status === "RESOLVED" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
            >
              Resolvidas
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList selectedId={conversationId} status={status} />
        </div>
      </div>

      {/* Área de conversas */}
      <div className="flex-1 flex">
        {conversationId ? (
          <ConversationView conversationId={conversationId} />
        ) : (
          <ConversationEmpty />
        )}
      </div>
    </div>
  );
}