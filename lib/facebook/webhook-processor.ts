// lib/facebook/webhook-processor.ts
import { prisma } from "@/lib/prisma";

type FacebookMessage = {
  mid: string;
  text?: string;
  attachments?: Array<{
    type: string;
    payload: {
      url: string;
    };
  }>;
};

type FacebookEvent = {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: FacebookMessage;
  delivery?: {
    mids: string[];
    watermark: number;
  };
  read?: {
    watermark: number;
  };
};

export async function processMessageEvent(event: FacebookEvent, facebookChannel: any) {
  try {
    const senderId = event.sender.id;
    const messageId = event.message?.mid;
    const messageText = event.message?.text || "";
    
    // Ignorar mensagens enviadas pelo próprio app
    if (senderId === facebookChannel.pageId) {
      return true;
    }
    
    // Buscar ou criar contato
    let contact = await prisma.contact.findFirst({
      where: {
        workspaceId: facebookChannel.workspaceId,
        identifier: senderId
      }
    });
    
    if (!contact) {
      // Buscar informações do contato no Facebook
      try {
        const contactInfo = await fetchUserInfoFromFacebook(senderId, facebookChannel.pageAccessToken);
        const contactName = contactInfo?.name || `Facebook User (${senderId.substring(0, 8)})`;
        
        contact = await prisma.contact.create({
          data: {
            workspaceId: facebookChannel.workspaceId,
            identifier: senderId,
            name: contactName,
            avatarUrl: contactInfo?.profile_pic,
            additionalInfo: contactInfo ? { facebookData: contactInfo } : undefined
          }
        });
      } catch (error) {
        // Se falhar ao buscar info do usuário, criar contato básico
        contact = await prisma.contact.create({
          data: {
            workspaceId: facebookChannel.workspaceId,
            identifier: senderId,
            name: `Facebook User (${senderId.substring(0, 8)})`
          }
        });
      }
    }
    
    // Buscar ou criar conversa
    let conversation = await prisma.conversation.findFirst({
      where: {
        workspaceId: facebookChannel.workspaceId,
        inboxId: facebookChannel.inboxId,
        contactId: contact.id,
        status: { not: "RESOLVED" }
      }
    });
    
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          workspaceId: facebookChannel.workspaceId,
          inboxId: facebookChannel.inboxId,
          contactId: contact.id,
          status: "OPEN"
        }
      });
    }
    
    // Processar anexos, se houver
    const attachments = event.message?.attachments?.map(attachment => ({
      type: attachment.type,
      url: attachment.payload.url
    })) || [];
    
    // Criar mensagem
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: messageText,
        sourceId: messageId,
        senderType: "CONTACT",
        contentType: attachments.length ? "ATTACHMENT" : "TEXT",
        attachments: attachments.length ? attachments : undefined
      }
    });
    
    // Atualizar data da última mensagem na conversa
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() }
    });
    
    return true;
  } catch (error) {
    console.error("Erro ao processar mensagem:", error);
    return false;
  }
}

async function fetchUserInfoFromFacebook(userId: string, pageAccessToken: string) {
  try {
    const url = `https://graph.facebook.com/${userId}?fields=name,profile_pic&access_token=${pageAccessToken}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar informações do usuário: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar informações do usuário do Facebook:", error);
    return null;
  }
}

export async function processDeliveryEvent(event: FacebookEvent, facebookChannel: any) {
  // Implementar lógica para marcar mensagens como entregues
  // Útil para analytics e acompanhamento de status
  return true;
}

export async function processReadEvent(event: FacebookEvent, facebookChannel: any) {
  // Implementar lógica para marcar mensagens como lidas
  // Útil para analytics e experiência do usuário
  return true;
}