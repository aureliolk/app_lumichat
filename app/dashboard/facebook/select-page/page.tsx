// app/dashboard/facebook/select-page/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";

type FacebookPage = {
  id: string;
  name: string;
  access_token: string;
};

export default function SelectFacebookPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [userAccessToken, setUserAccessToken] = useState("");
  const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null);
  const [inboxName, setInboxName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(data));
        setPages(parsedData.pages || []);
        setUserAccessToken(parsedData.userAccessToken || "");
        
        if (parsedData.pages?.length === 1) {
          setSelectedPage(parsedData.pages[0]);
          setInboxName(`${parsedData.pages[0].name} Messenger`);
        }
      } catch (err) {
        setError("Erro ao processar dados das páginas");
        console.error(err);
      }
    } else {
      router.push("/dashboard/facebook");
    }
  }, [searchParams, router]);

  const handlePageSelect = (page: FacebookPage) => {
    setSelectedPage(page);
    setInboxName(`${page.name} Messenger`);
  };

  const handleSubmit = async () => {
    if (!selectedPage || !inboxName.trim()) {
      setError("Por favor, selecione uma página e defina um nome para o inbox");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post("/api/workspaces/facebook-pages", {
        pageId: selectedPage.id,
        pageName: selectedPage.name,
        pageAccessToken: selectedPage.access_token,
        userAccessToken,
        inboxName: inboxName.trim(),
      });
      
      router.push("/dashboard/facebook?success=true");
    } catch (err: any) {
      setError(err.response?.data?.message || "Ocorreu um erro ao configurar a página");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (pages.length === 0 && !error) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-md mx-auto p-6 bg-card rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold mb-4">Nenhuma página encontrada</h1>
          <p className="text-muted-foreground mb-4">
            Não encontramos nenhuma página do Facebook associada à sua conta. 
            Verifique se você tem páginas criadas e tente novamente.
          </p>
          <Button onClick={() => router.push("/dashboard/facebook")}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-xl mx-auto p-6 bg-card rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Selecione uma página</h1>
        
        <div className="space-y-6">
          <div className="grid gap-4">
            <h2 className="text-lg font-medium">Suas páginas do Facebook</h2>
            <div className="border rounded-md divide-y">
              {pages.map((page) => (
                <div 
                  key={page.id}
                  className={`p-4 cursor-pointer hover:bg-muted/50 ${
                    selectedPage?.id === page.id ? "bg-muted" : ""
                  }`}
                  onClick={() => handlePageSelect(page)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{page.name}</h3>
                      <p className="text-sm text-muted-foreground">ID: {page.id}</p>
                    </div>
                    <div className="w-4 h-4 rounded-full border border-primary flex items-center justify-center">
                      {selectedPage?.id === page.id && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {selectedPage && (
            <div className="grid gap-4">
              <h2 className="text-lg font-medium">Configuração do Inbox</h2>
              <div className="grid gap-2">
                <label htmlFor="inboxName" className="text-sm font-medium">
                  Nome do Inbox
                </label>
                <Input
                  id="inboxName"
                  value={inboxName}
                  onChange={(e) => setInboxName(e.target.value)}
                  placeholder="Ex: Atendimento Facebook"
                />
              </div>
            </div>
          )}
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/facebook")}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !selectedPage || !inboxName.trim()}
            >
              {loading ? "Configurando..." : "Configurar Página"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}