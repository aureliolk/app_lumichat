// app/api/auth/facebook-pages/connect/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session: any = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL));
  }

  // Construir URL para autenticação do Facebook
  const appId = process.env.FACEBOOK_CLIENT_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/facebook-pages/callback`;
  const scope = "pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement";
  
  const authUrl = `https://www.facebook.com/v17.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${session.user.id}`;
  
  return NextResponse.redirect(authUrl);
}