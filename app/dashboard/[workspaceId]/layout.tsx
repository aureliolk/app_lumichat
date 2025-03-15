// app/dashboard/[workspaceId]/layout.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { WorkspaceHeader } from "@/components/dashboard/workspace-header";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default async function WorkspaceDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
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
    },
  });

  if (!workspaceUser) {
    redirect("/dashboard/workspaces");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <WorkspaceHeader
        initialWorkspaceId={params.workspaceId}
        initialWorkspaceName={workspaceUser.workspace.name}
        userName={session.user.name || ""}
        userEmail={session.user.email || ""}
      />
      
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <DashboardNav workspaceId={params.workspaceId} userRole={workspaceUser.role} />
        <main className="flex w-full flex-col overflow-hidden py-6">
          {children}
        </main>
      </div>
    </div>
  );
}