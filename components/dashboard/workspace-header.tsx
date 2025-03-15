// components/dashboard/workspace-header.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import axios from "axios";
import { ChevronDown, LogOut, User, Settings } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

type Workspace = {
  id: string;
  name: string;
  role: string;
};

export function WorkspaceHeader({
  initialWorkspaceId,
  initialWorkspaceName,
  userName,
  userEmail,
}: {
  initialWorkspaceId: string;
  initialWorkspaceName: string;
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/workspaces");
      setWorkspaces(response.data);
    } catch (error) {
      console.error("Erro ao buscar workspaces:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <h1 className="text-lg font-bold">ChatLumi</h1>
          </Link>

          {!loading && workspaces.length > 0 && (
            <div className="relative">
              <button
                className="flex items-center text-sm bg-primary/10 px-3 py-2 rounded-md hover:bg-primary/20 transition-colors"
                onClick={toggleDropdown}
              >
                <span className="font-medium">{initialWorkspaceName}</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-card rounded-md shadow-md z-50 py-1 border border-[hsl(var(--border))]">
                  <div className="py-1 px-3 text-xs text-muted-foreground font-medium uppercase">
                    Seus Workspaces
                  </div>
                  
                  {workspaces.map((workspace) => (
                    <Link
                      key={workspace.id}
                      href={`/dashboard/${workspace.id}`}
                      className={`block px-4 py-2 text-sm hover:bg-muted ${
                        workspace.id === initialWorkspaceId ? "bg-muted" : ""
                      }`}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{workspace.name}</span>
                        <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                          {workspace.role === "ADMIN" ? "Admin" : "Agente"}
                        </span>
                      </div>
                    </Link>
                  ))}
                  
                  <div className="border-t border-[hsl(var(--border))] mt-1 pt-1">
                    <Link
                      href="/dashboard/workspaces"
                      className="block px-4 py-2 text-sm hover:bg-muted"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Gerenciar Workspaces
                    </Link>
                    <Link
                      href="/dashboard/workspaces/new"
                      className="block px-4 py-2 text-sm hover:bg-muted"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Criar Novo Workspace
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              className="flex items-center gap-2"
              onClick={toggleUserMenu}
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-medium">
                  {userName?.substring(0, 2).toUpperCase() || "U"}
                </span>
              </div>
              <span className="text-sm hidden md:inline-block">
                {userName || userEmail}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-card rounded-md shadow-md z-50 py-1 border border-[hsl(var(--border))]">
                <div className="px-4 py-2 border-b border-[hsl(var(--border))]">
                  <p className="font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
                
                <Link
                  href="/dashboard/profile"
                  className="flex items-center px-4 py-2 text-sm hover:bg-muted"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Meu Perfil</span>
                </Link>
                
                <Link
                  href="/dashboard/settings"
                  className="flex items-center px-4 py-2 text-sm hover:bg-muted"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </Link>
                
                <button
                  className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-muted"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}