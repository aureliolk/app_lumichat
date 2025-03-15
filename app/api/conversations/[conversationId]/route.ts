// app/api/conversations/[conversationId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Obter detalhes da conversa
export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }
  
  const conversationId = params.conversationId;
  
  try {
    // Verificar se o usuário tem acesso à conversa
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        contact: true,
        messages: {
          orderBy: { createdAt: "asc" }
        },
        workspace: {
          include: {
            users: {
              where: { userId: session.user.id }
            }
          }
        }
      }
    });
    
    if (!conversation || conversation.workspace.users.length === 0) {
      return NextResponse.json({ message: "Conversa não encontrada" }, { status: 404 });
    }
    
    return NextResponse.json({
      id: conversation.id,
      status: conversation.status,
      contact: {
        id: conversation.contact.id,
        name: conversation.contact.name,
        avatarUrl: conversation.contact.avatarUrl
      },
      messages: conversation.messages.map(message => ({
        id: message.id,
        content: message.content,
        contentType: message.contentType,
        senderType: message.senderType,
        attachments: message.attachments,
        createdAt: message.createdAt
      }))
    });
  } catch (error) {
    console.error("Erro ao obter conversa:", error);
    return NextResponse.json(
      { message: "Erro ao processar sua solicitação" },
      { status: 500 }
    );
  }
}

// Atualizar status da conversa
export async function PATCH(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }
  
  const conversationId = params.conversationId;
  const { status } = await request.json();
  
  if (!["OPEN", "PENDING", "RESOLVED"].includes(status)) {
    return NextResponse.json(
      { message: "Status inválido" },
      { status: 400 }
    );
  }
  
  try {
    // Verificar se o usuário tem acesso à conversa
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        workspace: {
          include: {
            users: {
              where: { userId: session.user.id }
            }
          }
        }
      }
    });
    
    if (!conversation || conversation.workspace.users.length === 0) {
      return NextResponse.json({ message: "Conversa não encontrada" }, { status: 404 });
    }
    
    // Atualizar status
    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: { status }
    });
    
    // Adicionar mensagem de sistema para registro
    await prisma.message.create({
      data: {
        conversationId,
        content: `Conversa marcada como ${status === "OPEN" ? "Aberta" : status === "PENDING" ? "Pendente" : "Resolvida"}`,
        senderType: "SYSTEM",
        private: true
      }
    });
    
    return NextResponse.json(updatedConversation);
  } catch (error) {
    console.error("Erro ao atualizar conversa:", error);
    return NextResponse.json(
      { message: "Erro ao processar sua solicitação" },
      { status: 500 }
    );
  }
}