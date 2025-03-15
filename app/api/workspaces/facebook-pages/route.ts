// app/api/workspaces/facebook-pages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  const session : any= await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }
  
  try {
    const {
      pageId,
      pageName,
      pageAccessToken,
      userAccessToken,
      inboxName
    } = await request.json();
    
    // Verificar se todos os campos necessários foram fornecidos
    if (!pageId || !pageAccessToken || !userAccessToken || !inboxName) {
      return NextResponse.json(
        { message: "Dados incompletos" }, 
        { status: 400 }
      );
    }
    
    // Verificar se o usuário tem workspace
    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        workspace: true
      }
    }) as any;
    
    if (!workspaceUser) {
      // Criar um workspace para o usuário se não existir
      const newWorkspace = await prisma.workspace.create({
        data: {
          name: `${session.user.name || "Meu"} Workspace`,
          users: {
            create: {
              userId: session.user.id,
              role: "ADMIN"
            }
          }
        }
      });
      
      workspaceUser = {
        workspaceId: newWorkspace.id,
        workspace: newWorkspace
      };
    }
    
    // Verificar se já existe um canal para esta página
    const existingChannel = await prisma.facebookChannel.findUnique({
      where: { pageId }
    });
    
    if (existingChannel) {
      return NextResponse.json(
        { message: "Esta página já está conectada a um workspace" },
        { status: 400 }
      );
    }
    
    // Criar inbox e canal do Facebook em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar inbox
      const inbox = await tx.inbox.create({
        data: {
          name: inboxName,
          description: `Inbox para a página ${pageName}`,
          workspaceId: workspaceUser.workspaceId,
          channelType: "FACEBOOK",
        }
      });
      
      // Criar canal do Facebook
      const facebookChannel = await tx.facebookChannel.create({
        data: {
          pageId,
          pageAccessToken,
          userAccessToken,
          workspaceId: workspaceUser.workspaceId,
          inboxId: inbox.id,
        }
      });
      
      return { inbox, facebookChannel };
    });
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Erro ao configurar página do Facebook:", error);
    return NextResponse.json(
      { message: "Erro ao processar sua solicitação" },
      { status: 500 }
    );
  }
}