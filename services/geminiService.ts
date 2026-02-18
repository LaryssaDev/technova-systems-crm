
/**
 * Serviço de mensagens motivacionais.
 * Substituído de Google Gemini API para um sistema local estável
 * para garantir que o deploy na Vercel funcione sem erros de dependência.
 */
export const getMotivationalMessage = async (progress: number, isHit: boolean) => {
  const messages = [
    "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
    "A persistência é o caminho do êxito. Continue prospectando!",
    "Venda não é sobre o que você vende, mas sobre quem você ajuda.",
    "Grandes metas exigem grandes atitudes. Você consegue!",
    "Foco total no fechamento de hoje! O cliente espera por você.",
    "Cada 'não' te deixa mais perto do próximo 'sim'. Mantenha o ritmo!",
    "A disciplina é a ponte entre metas e realizações.",
    "Sua produtividade hoje define o seu faturamento de amanhã.",
    "Transforme obstáculos em degraus para o seu crescimento comercial."
  ];

  const hitMessages = [
    "Meta batida! Você é imparável! 🚀",
    "Excelente trabalho! Vamos rumo ao próximo nível.",
    "Performance de elite! Parabéns pelo resultado excepcional.",
    "Meta superada! Você acaba de elevar a barra da TechNova!",
    "Contrato fechado é resultado de trabalho bem feito. Parabéns!"
  ];

  // Simulamos um delay curto para manter a experiência de UI suave
  await new Promise(resolve => setTimeout(resolve, 100));

  if (isHit) {
    return hitMessages[Math.floor(Math.random() * hitMessages.length)];
  }

  // Se o progresso for alto, foca em encorajar o final
  if (progress > 80) {
    return "Você está quase lá! Falta muito pouco para bater a meta!";
  }

  return messages[Math.floor(Math.random() * messages.length)];
};
