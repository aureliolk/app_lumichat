import Image from "next/image";

export default function ConversationEmpty() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center">
      <div className="mb-6 relative w-32 h-32">
        <Image
          src="/message-bubble.svg"
          fill
          alt="Mensagens"
          className="opacity-30"
        />
      </div>
      <h2 className="text-2xl font-semibold mb-2">
        Nenhuma conversa selecionada
      </h2>
      <p className="text-muted-foreground max-w-md">
        Selecione uma conversa da lista à esquerda para visualizar o histórico de mensagens
        e interagir com seus contatos.
      </p>
    </div>
  );
}
