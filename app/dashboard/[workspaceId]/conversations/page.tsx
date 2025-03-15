// app/dashboard/[workspaceId]/conversations/page.tsx
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import ConversationFilterableList from "@/components/conversations/conversation-filterable-list";
import RealTimeConversation from "@/components/conversations/real-time-conversation";
import ConversationEmpty from "@/components/conversations/conversation-empty";

export default async function ConversationsPage({
  params,
  searchParams,
}: {
  params: { workspaceId: string };
  searchParams: { id?: string; status?: string };
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
  });

  if (!workspaceUser) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Lista de conversas */}
      <div className="w-80 border-r border-[hsl(var(--border))] overflow-hidden flex flex-col">
        <Suspense fallback={<div className="p-4">Carregando...</div>}>
          <ConversationFilterableList
            workspaceId={params.workspaceId}
            initialStatus={searchParams.status || "OPEN"}
          />
        </Suspense>
      </div>

      {/* Área de conversas */}
      <div className="flex-1 flex">
        {searchParams.id ? (
          <Suspense fallback={<div className="p-4">Carregando conversa...</div>}>
            <RealTimeConversation conversationId={searchParams.id} />
          </Suspense>
        ) : (
          <ConversationEmpty />
        )}
      </div>
    </div>
  );
}