// app/api/workspaces/[workspaceId]/conversations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }
  
  const workspaceId = params.workspaceId;
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status") || "OPEN";
  const search = searchParams.get("search") || "";
  
  try {
    // Verificar se o usuário tem acesso ao workspace
    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: {
        workspaceId,
        userId: session.user.id
      }
    });
    
    if (!workspaceUser) {
      return NextResponse.json({ message: "Workspace não encontrado" }, { status: 404 });
    }
    
    // Buscar conversas
    const conversations = await prisma.conversation.findMany({
      where: {
        workspaceId,
        status,
        OR: search
          ? [
              { contact: { name: { contains: search, mode: "insensitive" } } },
              { messages: { some: { content: { contains: search, mode: "insensitive" } } } }
            ]
          : undefined
      },
      include: {
        contact: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        },
        _count: {
          select: {
            messages: {
              where: {
                senderType: "CONTACT",
                // Adicione uma lógica para 'não lido' se implementar isso
              }
            }
          }
        }
      },
      orderBy: { lastMessageAt: "desc" }
    });
    
    // Formatar resposta
    const formattedConversations = conversations.map(conversation => ({
      id: conversation.id,
      status: conversation.status,
      contact: {
        name: conversation.contact.name,
        avatarUrl: conversation.contact.avatarUrl
      },
      lastMessage: conversation.messages[0]
        ? {
            content: conversation.messages[0].content,
            createdAt: conversation.messages[0].createdAt
          }
        : null,
      unreadCount: 0 // Implementar lógica de contagem de não lidos se necessário
    }));
    
    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error("Erro ao listar conversas:", error);
    return NextResponse.json(
      { message: "Erro ao processar sua solicitação" },
      { status: 500 }
    );
  }
}