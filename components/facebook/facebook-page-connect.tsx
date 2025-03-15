// components/facebook/facebook-page-connect.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";

export function FacebookPageConnect() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleConnectFacebook = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Redirecionar para a URL de autenticação do Facebook
      // Isso vai iniciar o fluxo OAuth
      window.location.href = "/api/auth/facebook-pages/connect";
    } catch (err: any) {
      setError("Ocorreu um erro ao conectar com o Facebook");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-md">
        <div>
          <h3 className="font-medium">Status</h3>
          <p className="text-sm text-muted-foreground">Não conectado</p>
        </div>
        <Button onClick={handleConnectFacebook} disabled={loading}>
          {loading ? "Conectando..." : "Conectar Facebook"}
        </Button>
      </div>
      
      {error && <p className="text-red-500 text-sm">{error}</p>}
      
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
  );
}