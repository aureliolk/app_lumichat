import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Integração Facebook | ChatLumi",
  description: "Conecte sua página do Facebook com o ChatLumi",
};

export default async function FacebookPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Integração com Facebook</h1>
      
      <div className="grid gap-6">
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">Conectar Página do Facebook</h2>
          <p className="text-muted-foreground mb-6">
            Conecte sua página do Facebook para receber e responder mensagens do Facebook Messenger e comentários diretamente do ChatLumi.
          </p>
          
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <h3 className="font-medium">Status</h3>
                <p className="text-sm text-muted-foreground">Não conectado</p>
              </div>
              <Button>Conectar Facebook</Button>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Como conectar:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Clique no botão "Conectar Facebook" acima</li>
                <li>Faça login na sua conta do Facebook</li>
                <li>Selecione a página que deseja conectar</li>
                <li>Conceda as permissões necessárias</li>
                <li>Pronto! Sua página está conectada ao ChatLumi</li>
              </ol>
            </div>
          </div>
        </div>
        
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">Configurações Avançadas</h2>
          <p className="text-muted-foreground mb-6">
            Configure opções avançadas para a integração com Facebook.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <h3 className="font-medium">Webhook</h3>
                <p className="text-sm text-muted-foreground">URL de callback para eventos do Facebook</p>
              </div>
              <div className="text-sm bg-muted p-2 rounded-md font-mono">
                https://sua-url.com/api/webhooks/facebook
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <h3 className="font-medium">Token de Verificação</h3>
                <p className="text-sm text-muted-foreground">Token para verificar webhooks do Facebook</p>
              </div>
              <Button variant="outline" size="sm">
                Gerar Token
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}