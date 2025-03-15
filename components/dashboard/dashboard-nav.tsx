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
} from "lucide-react";

import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

export function DashboardNav() {
  const pathname = usePathname();
  
  const navItems: NavItem[] = [
    {
      title: "Visão Geral",
      href: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: "Conversas",
      href: "/dashboard/conversations",
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      title: "Contatos",
      href: "/dashboard/contacts",
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: "Inboxes",
      href: "/dashboard/inboxes",
      icon: <PanelLeftOpen className="w-5 h-5" />,
    },
    {
      title: "Facebook",
      href: "/dashboard/facebook",
      icon: <Facebook className="w-5 h-5" />,
    },
    {
      title: "Configurações",
      href: "/dashboard/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="hidden md:block">
      <ul className="mt-6 space-y-1">
        {navItems.map((item) => (
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