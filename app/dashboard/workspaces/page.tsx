// app/dashboard/workspaces/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function WorkspacesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Buscar workspaces do usuário
  const workspaces = await prisma.workspaceUser.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      workspace: {
        include: {
          _count: {
            select: {
              conversations: true,
              contacts: true,
              inboxes: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Seus Workspaces</h1>
        <Link href="/dashboard/workspaces/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Criar Workspace
          </Button>
        </Link>
      </div>

      {workspaces.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Nenhum workspace encontrado</h2>
          <p className="text-muted-foreground mb-6">
            Você ainda não possui workspaces. Crie um novo para começar a usar o ChatLumi.
          </p>
          <Link href="/dashboard/workspaces/new">
            <Button>Criar Primeiro Workspace</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspaceUser) => (
            <div
              key={workspaceUser.workspace.id}
              className="bg-card rounded-lg shadow-sm p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold truncate">
                  {workspaceUser.workspace.name}
                </h2>
                <span className="text-xs font-medium bg-secondary px-2 py-1 rounded-full text-secondary-foreground">
                  {workspaceUser.role === "ADMIN" ? "Admin" : "Agente"}
                </span>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Conversas</span>
                  <span className="font-medium">
                    {workspaceUser.workspace._count.conversations}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Contatos</span>
                  <span className="font-medium">
                    {workspaceUser.workspace._count.contacts}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Inboxes</span>
                  <span className="font-medium">
                    {workspaceUser.workspace._count.inboxes}
                  </span>
                </div>
              </div>

              <div className="flex justify-end mt-auto pt-4 border-t border-[hsl(var(--border))]">
                <Link href={`/dashboard/${workspaceUser.workspace.id}`}>
                  <Button variant="outline" size="sm">
                    Acessar
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}