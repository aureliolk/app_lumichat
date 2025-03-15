import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

// Função para verificar a assinatura do Facebook
function verifyFacebookSignature(payload: string, signature: string): boolean {
  try {
    const appSecret = process.env.FACEBOOK_APP_SECRET || "";
    if (!appSecret) return false;

    // Remover o 'sha256=' do início da assinatura
    const signatureHash = signature.replace("sha256=", "");
    
    // Calcular o hash esperado
    const expectedHash = createHash("sha256")
      .update(payload)
      .update(appSecret)
      .digest("hex");
    
    // Comparar os hashes de maneira segura
    const signatureBuffer = Buffer.from(signatureHash, "hex");
    const expectedBuffer = Buffer.from(expectedHash, "hex");
    
    return expectedBuffer.length === signatureBuffer.length && 
           timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch (error) {
    console.error("Erro ao verificar assinatura:", error);
    return false;
  }
}

// Rota GET para verificação do webhook
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  
  // Token de verificação definido no .env
  const verifyToken = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN;
  
  // Verificar se o token é válido
  if (mode === "subscribe" && token === verifyToken) {
    console.log("Webhook verificado com sucesso!");
    return new Response(challenge, { status: 200 });
  }
  
  console.error("Falha na verificação do webhook");
  return new Response("Verification failed", { status: 403 });
}

// Rota POST para receber eventos do webhook
export async function POST(request: NextRequest) {
  try {
    // Verificar assinatura do Facebook para segurança
    const signature = request.headers.get("x-hub-signature-256");
    const body = await request.text();
    
    if (!signature /* || !verifyFacebookSignature(body, signature) */) {
      console.error("Assinatura inválida do webhook");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    
    const data = JSON.parse(body);
    
    // Verificar se é um evento de página
    if (data.object !== "page") {
      return NextResponse.json({ error: "Invalid event object" }, { status: 400 });
    }
    
    // Processar cada entrada de eventos
    for (const entry of data.entry) {
      const pageId = entry.id;
      
      // Encontrar o canal do Facebook correspondente
      const facebookChannel = await prisma.facebookChannel.findFirst({
        where: { pageId },
        include: {
          inbox: true,
          workspace: true
        }
      });
      
      if (!facebookChannel) {
        console.log(`Canal do Facebook não encontrado para pageId ${pageId}`);
        continue;
      }
      
      // Processar eventos de mensagem
      if (entry.messaging) {
        for (const event of entry.messaging) {
          if (event.message) {
            // Processar evento de mensagem recebida
            await processMessageEvent(event, facebookChannel);
          } else if (event.delivery) {
            // Processar evento de entrega
            // await processDeliveryEvent(event, facebookChannel);
          } else if (event.read) {
            // Processar evento de leitura
            // await processReadEvent(event, facebookChannel);
          }
        }
      }
    }
    
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Função para processar eventos de mensagem
async function processMessageEvent(event: any, facebookChannel: any) {
  try {
    const senderId = event.sender.id;
    const messageId = event.message.mid;
    const messageText = event.message.text || "";
    
    // Buscar ou criar contato
    let contact = await prisma.contact.findFirst({
      where: {
        workspaceId: facebookChannel.workspaceId,
        identifier: senderId
      }
    });
    
    if (!contact) {
      // Implementar lógica para buscar nome do usuário no Facebook
      const contactName = `Facebook User (${senderId.substring(0, 8)})`;
      
      contact = await prisma.contact.create({
        data: {
          workspaceId: facebookChannel.workspaceId,
          identifier: senderId,
          name: contactName
        }
      });
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
    
    // Criar mensagem
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: messageText,
        sourceId: messageId,
        senderType: "CONTACT",
        contentType: event.message.attachments?.length ? "ATTACHMENT" : "TEXT",
        attachments: event.message.attachments
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