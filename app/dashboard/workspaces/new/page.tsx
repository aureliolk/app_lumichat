// app/dashboard/workspaces/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";

export default function NewWorkspacePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("O nome do workspace é obrigatório");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post("/api/workspaces", { name });
      router.push(`/dashboard/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao criar workspace");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-md">
      <div className="bg-card rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6">Criar Novo Workspace</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nome do Workspace
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Minha Empresa"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/workspaces")}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Workspace"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}