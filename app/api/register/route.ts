import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = userSchema.parse(body);

    // Verificar se o e-mail já está sendo usado
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Este email já está em uso" },
        { status: 409 }
      );
    }

    // Criptografar a senha
    const hashedPassword = await hash(password, 10);

    // Criar o usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
      },
    });

    // Não retornar a senha no response
    const { hashedPassword: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        user: userWithoutPassword,
        message: "Usuário registrado com sucesso",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dados de entrada inválidos", error: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Erro ao registrar usuário", error },
      { status: 500 }
    );
  }
}