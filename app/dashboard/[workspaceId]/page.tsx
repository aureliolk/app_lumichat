// app/dashboard/[workspaceId]/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Users, 
  Inbox,
  Facebook, 
  TrendingUp,
  Headphones
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function WorkspaceDashboardPage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Verificar se o usuário tem acesso ao workspace
  const workspaceUser = await prisma.workspaceUser.findFirst({
    where: {
      workspaceId: params.workspaceId,
      userId: session.user.id,
    },
    include: {
      workspace: true,
    }
  });

  if (!workspaceUser) {
    redirect("/dashboard/workspaces");
  }

  // Obter estatísticas
  const stats = await prisma.$transaction([
    // Total de conversas
    prisma.conversation.count({
      where: { workspaceId: params.workspaceId }
    }),
    // Conversas abertas
    prisma.conversation.count({
      where: { 
        workspaceId: params.workspaceId,
        status: "OPEN" 
      }
    }),
    // Total de contatos
    prisma.contact.count({
      where: { workspaceId: params.workspaceId }
    }),
    // Total de inboxes
    prisma.inbox.count({
      where: { workspaceId: params.workspaceId }
    }),
    // Canais do Facebook
    prisma.facebookChannel.count({
      where: { workspaceId: params.workspaceId }
    }),
    // Conversas recentes
    prisma.conversation.findMany({
      where: { workspaceId: params.workspaceId },
      orderBy: { lastMessageAt: "desc" },
      take: 5,
      include: {
        contact: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    })
  ]);

  const [
    totalConversations,
    openConversations,
    totalContacts,
    totalInboxes,
    facebookChannels,
    recentConversations
  ] = stats;

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {workspaceUser.workspace.name}
        </h1>
        <div className="flex space-x-2">
          <Link href={`/dashboard/${params.workspaceId}/settings`}>
            <Button variant="outline">Configurações</Button>
          </Link>
          <Link href={`/dashboard/${params.workspaceId}/conversations`}>
            <Button>
              <MessageSquare className="w-4 h-4 mr-2" />
              Conversas
            </Button>
          </Link>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
        <div className="bg-card rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Conversas</h3>
          </div>
          <p className="text-3xl font-bold mt-2">{totalConversations}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {openConversations} aberta{openConversations !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Contatos</h3>
          </div>
          <p className="text-3xl font-bold mt-2">{totalContacts}</p>
          <p className="text-sm text-muted-foreground mt-1">Total de contatos</p>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Inbox className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Inboxes</h3>
          </div>
          <p className="text-3xl font-bold mt-2">{totalInboxes}</p>
          <p className="text-sm text-muted-foreground mt-1">Caixas de entrada</p>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Facebook className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Facebook</h3>
          </div>
          <p className="text-3xl font-bold mt-2">{facebookChannels}</p>
          <p className="text-sm text-muted-foreground mt-1">Páginas conectadas</p>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Taxa de Resolução</h3>
          </div>
          <p className="text-3xl font-bold mt-2">0%</p>
          <p className="text-sm text-muted-foreground mt-1">Últimos 7 dias</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversas Recentes */}
        <div className="bg-card rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Conversas Recentes</h2>
            <Link href={`/dashboard/${params.workspaceId}/conversations`}>
              <Button variant="outline" size="sm">Ver Todas</Button>
            </Link>
          </div>

          {recentConversations.length === 0 ? (
            <div className="text-center py-8">
              <Headphones className="w-10 h-10 mx-auto text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">Nenhuma conversa recente</p>
            </div>
          ) : (
            <div className="divide-y divide-[hsl(var(--border))]">
              {recentConversations.map((conversation) => (
                <Link 
                  key={conversation.id}
                  href={`/dashboard/${params.workspaceId}/conversations?id=${conversation.id}`}
                  className="block py-3 hover:bg-muted/40 -mx-6 px-6 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-medium">
                        {conversation.contact.name
                          ? conversation.contact.name.substring(0, 2).toUpperCase()
                          : "??"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">
                          {conversation.contact.name || "Contato sem nome"}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(conversation.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.messages[0]?.content || "Sem mensagens"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Guia de Início Rápido */}
        <div className="bg-card rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Guia de Início Rápido</h2>
          
          <div className="space-y-4">
            <div className="flex items-start border rounded-md p-3">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <span className="font-bold text-primary">1</span>
              </div>
              <div>
                <h3 className="font-medium">Conecte uma página do Facebook</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Integre sua página para receber mensagens do Messenger
                </p>
                <Link href={`/dashboard/${params.workspaceId}/facebook`}>
                  <Button variant="outline" size="sm">Conectar Facebook</Button>
                </Link>
              </div>
            </div>
            
            <div className="flex items-start border rounded-md p-3">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <span className="font-bold text-primary">2</span>
              </div>
              <div>
                <h3 className="font-medium">Convide sua equipe</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Adicione agentes para colaborar no atendimento
                </p>
                <Link href={`/dashboard/${params.workspaceId}/team`}>
                  <Button variant="outline" size="sm">Convidar Equipe</Button>
                </Link>
              </div>
            </div>
            
            <div className="flex items-start border rounded-md p-3">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <span className="font-bold text-primary">3</span>
              </div>
              <div>
                <h3 className="font-medium">Personalize seu workspace</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Configure seu perfil e ajuste as configurações
                </p>
                <Link href={`/dashboard/${params.workspaceId}/settings`}>
                  <Button variant="outline" size="sm">Configurar</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}