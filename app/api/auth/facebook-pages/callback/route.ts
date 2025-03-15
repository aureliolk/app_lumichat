// app/api/auth/facebook-pages/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // userId
  
  if (!code || !state) {
    return NextResponse.redirect(new URL("/dashboard/facebook?error=missing_params", process.env.NEXTAUTH_URL as string));
  }
  
  try {
    // Trocar o código por um token de acesso
    const appId = process.env.FACEBOOK_CLIENT_ID;
    const appSecret = process.env.FACEBOOK_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/facebook-pages/callback`;
    
    const tokenResponse = await axios.get(
      `https://graph.facebook.com/v17.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`
    );
    
    const userAccessToken = tokenResponse.data.access_token;
    
    // Obter as páginas do usuário
    const pagesResponse = await axios.get(
      `https://graph.facebook.com/v17.0/me/accounts?access_token=${userAccessToken}`
    );
    
    // Redirecionar para a página de seleção de páginas com os dados necessários
    const pagesData = encodeURIComponent(JSON.stringify({
      pages: pagesResponse.data.data,
      userAccessToken
    }));
    
    return NextResponse.redirect(new URL(`/dashboard/facebook/select-page?data=${pagesData}`, process.env.NEXTAUTH_URL as string));
  } catch (error) {
    console.error("Erro na autenticação do Facebook:", error);
    return NextResponse.redirect(new URL("/dashboard/facebook?error=auth_failed", process.env.NEXTAUTH_URL as string));
  }
}