// app/api/workspaces/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }
  
  try {
    const { name } = await request.json();
    
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { message: "O nome do workspace é obrigatório" },
        { status: 400 }
      );
    }
    
    // Criar workspace e adicionar o usuário como admin
    const workspace = await prisma.workspace.create({
      data: {
        name,
        users: {
          create: {
            userId: session.user.id,
            role: "ADMIN"
          }
        }
      }
    });
    
    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Erro ao criar workspace:", error);
    return NextResponse.json(
      { message: "Erro ao processar sua solicitação" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }
  
  try {
    // Buscar workspaces do usuário
    const workspaces = await prisma.workspaceUser.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        workspace: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    
    return NextResponse.json(
      workspaces.map(wu => ({
        id: wu.workspace.id,
        name: wu.workspace.name,
        role: wu.role,
        createdAt: wu.createdAt
      }))
    );
  } catch (error) {
    console.error("Erro ao listar workspaces:", error);
    return NextResponse.json(
      { message: "Erro ao processar sua solicitação" },
      { status: 500 }
    );
  }
}