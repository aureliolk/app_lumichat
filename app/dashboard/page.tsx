import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Bem-vindo, {session.user.name || "Usuário"}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-2">Workspaces</h2>
          <p className="text-muted-foreground">Nenhum workspace encontrado. Crie um novo workspace para começar.</p>
          <button className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
            Criar Workspace
          </button>
        </div>
        
        <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-2">Integração Facebook</h2>
          <p className="text-muted-foreground">Conecte sua página do Facebook para começar a receber mensagens.</p>
          <button className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
            Conectar Facebook
          </button>
        </div>
        
        <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-2">Ajuda</h2>
          <p className="text-muted-foreground">Precisa de ajuda para configurar seu sistema de atendimento?</p>
          <button className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
            Ver Documentação
          </button>
        </div>
      </div>
    </div>
  );
}