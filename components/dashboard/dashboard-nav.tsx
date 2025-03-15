// components/dashboard/dashboard-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Settings,
  Facebook,
  PanelLeftOpen,
  Clock,
  BarChart,
  UserPlus,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

export function DashboardNav({
  workspaceId,
  userRole,
}: {
  workspaceId: string;
  userRole: string;
}) {
  const pathname = usePathname();
  const isAdmin = userRole === "ADMIN";
  
  const navItems: NavItem[] = [
    {
      title: "Visão Geral",
      href: `/dashboard/${workspaceId}`,
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: "Conversas",
      href: `/dashboard/${workspaceId}/conversations`,
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      title: "Contatos",
      href: `/dashboard/${workspaceId}/contacts`,
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: "Inboxes",
      href: `/dashboard/${workspaceId}/inboxes`,
      icon: <PanelLeftOpen className="w-5 h-5" />,
    },
    {
      title: "Facebook",
      href: `/dashboard/${workspaceId}/facebook`,
      icon: <Facebook className="w-5 h-5" />,
    },
    {
      title: "Agendamentos",
      href: `/dashboard/${workspaceId}/scheduled`,
      icon: <Clock className="w-5 h-5" />,
    },
    {
      title: "Relatórios",
      href: `/dashboard/${workspaceId}/reports`,
      icon: <BarChart className="w-5 h-5" />,
    },
    {
      title: "Equipe",
      href: `/dashboard/${workspaceId}/team`,
      icon: <UserPlus className="w-5 h-5" />,
      adminOnly: true,
    },
    {
      title: "Configurações",
      href: `/dashboard/${workspaceId}/settings`,
      icon: <Settings className="w-5 h-5" />,
      adminOnly: true,
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <nav className="hidden md:block">
      <ul className="mt-6 space-y-1">
        {filteredNavItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {item.icon}
              <span className="ml-3">{item.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}