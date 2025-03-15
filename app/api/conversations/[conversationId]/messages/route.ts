// app/api/conversations/[conversationId]/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import axios from "axios";

// Enviar mensagem
export async function POST(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }
  
  const conversationId = params.conversationId;
  const { content, contentType = "TEXT" } = await request.json();
  
  if (!content || content.trim() === "") {
    return NextResponse.json(
      { message: "Conteúdo da mensagem não pode estar vazio" },
      { status: 400 }
    );
  }
  
  try {
    // Verificar se o usuário tem acesso à conversa
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        contact: true,
        inbox: {
          include: { facebookChannel: true }
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
    
    if (conversation.status === "RESOLVED") {
      return NextResponse.json(
        { message: "Não é possível enviar mensagens em uma conversa resolvida" },
        { status: 400 }
      );
    }
    
    // Criar a mensagem no banco de dados
    const message = await prisma.message.create({
      data: {
        conversationId,
        content,
        contentType,
        senderType: "USER",
        senderId: session.user.id,
      }
    });
    
    // Atualizar data da última mensagem na conversa
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() }
    });
    
    // Enviar mensagem para o Facebook se for um canal do Facebook
    if (
      conversation.inbox.facebookChannel && 
      conversation.contact.identifier
    ) {
      try {
        await sendMessageToFacebook(
          conversation.inbox.facebookChannel.pageAccessToken,
          conversation.contact.identifier,
          content
        );
      } catch (error) {
        console.error("Erro ao enviar mensagem para o Facebook:", error);
        // Não falhar a operação, apenas registrar o erro
      }
    }
    
    return NextResponse.json(message);
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return NextResponse.json(
      { message: "Erro ao processar sua solicitação" },
      { status: 500 }
    );
  }
}

// Função para enviar mensagem para o Facebook
async function sendMessageToFacebook(
  pageAccessToken: string,
  recipientId: string,
  messageText: string
) {
  const url = `https://graph.facebook.com/v17.0/me/messages?access_token=${pageAccessToken}`;
  
  const data = {
    recipient: { id: recipientId },
    message: { text: messageText }
  };
  
  const response = await axios.post(url, data);
  return response.data;
}