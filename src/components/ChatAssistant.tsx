import React, { useState, useRef, useEffect } from "react";
import { 
  Send, Bot, User, Sparkles, Copy, Check, 
  UserCheck, GraduationCap, Users, MessageSquare, 
  Clock, HeartPulse, Building2, AlertTriangle, Info
} from "lucide-react";
import { UserProfile, ChatMessage, FocusArea, DiagnosisStatus } from "../types";

interface ChatAssistantProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onNavigateToTab: (tab: any) => void;
  onOpenCrisis: () => void;
  initialPrompt?: { prompt: string; role?: InteractionRole } | null;
  onClearInitialPrompt?: () => void;
}

export type InteractionRole = 
  | "meu_apoio" 
  | "educacao" 
  | "familia_cuidado" 
  | "comunicacao_acessibilidade" 
  | "organizacao_rotina";

const getSmartAssistantReply = (userMessage: string, profile: UserProfile, role: InteractionRole = "meu_apoio"): string => {
  const text = (userMessage || "").toLowerCase().trim();
  const name = profile.preferredName && profile.preferredName !== "Visitante" ? `, ${profile.preferredName}` : "";

  // 1. Crise e Sobrecarga Aguda
  if (
    text.includes("crise") ||
    text.includes("meltdown") ||
    text.includes("shutdown") ||
    text.includes("panico") ||
    text.includes("pânico") ||
    text.includes("desespero") ||
    text.includes("socorro") ||
    text.includes("sobrecarga") ||
    text.includes("ansiedade")
  ) {
    return `Olá${name}. Estou aqui com você. Se estiver sentindo sobrecarga sensorial ou emocional:

Sua segurança e bem-estar vêm em primeiro lugar.

💙 **Estratégia Imediata de Descompressão:**
1. **Reduza Estímulos:** Vá para um local silencioso, diminua as luzes ou use fones de ouvido.
2. **Exercício de Apoio Sensorial (5-4-3-2-1 Adaptado):**
   - 👁️ Olhe para 5 objetos seguros ao seu redor.
   - 🖐️ Toque em 4 texturas que tragam conforto.
   - 👂 Ouça 3 sons suaves no ambiente (ou teste o Ruído Marrom na aba Som).
   - 👃 Sinta aromas suaves ou respire devagar.
   - 💧 Beba um gole de água fresca devagar.
3. Não tente resolver decisões difíceis agora. Apenas respire no seu próprio ritmo.

⚠️ *Se precisar de acolhimento emergencial humano, use o botão **SOS Crise** no topo ou ligue para o CVV (188) ou SAMU (192).*`;
  }

  // 2. Organizar o Dia e Rotina
  if (
    text.includes("organizar") ||
    text.includes("meu dia") ||
    text.includes("rotina") ||
    text.includes("planejar") ||
    text.includes("agenda")
  ) {
    return `[Apoio à Função Executiva: Estrutura do Dia]
Olá${name}! Ter uma previsão clara do dia reduz a ansiedade e evita a sobrecarga cognitiva.

Aqui está uma proposta de **Estrutura Visual em 4 Blocos Flexíveis**:

🌅 **1. Bloco Manhã (Ativação e Foco Principal):**
• *Ativação Suave (15 min):* Hidratação, luz natural e conferir o que é estritamente essencial.
• *Foco Único do Dia:* Escolha **apenas 1 prioridade central**. Fazer essa única coisa já torna o dia produtivo.
• *Pausa Sensorial (10 min):* Alongamento leve ou silêncio com fones.

☀️ **2. Bloco Tarde (Manutenção e Demandas Práticas):**
• Tarefas mecânicas ou mensagens curtas.
• Intervalo de descompressão antes de mudar de ambiente ou atividade.

🌆 **3. Bloco Fim de Tarde (Fechamento sem Culpa):**
• Registrar o que foi concluído (mesmo as pequenas coisas).
• Deixar pendências anotadas por escrito para esvaziar a mente.

🌙 **4. Bloco Noite (Regulação do Sono):**
• Reduzir luzes brancas 1 hora antes de dormir.
• Som contínuo (ruído marrom ou sons da natureza na aba *Som & Autorregulação*).

💡 **Dica neuroafirmativa:** Se a sua energia estiver baixa hoje, faça a *Regra do 1 Item*: escolha só uma coisa e comemore ao finalizar!`;
  }

  // 3. Dividir Tarefa em Etapas / Paralisia de Início
  if (
    text.includes("dividir") ||
    text.includes("tarefa") ||
    text.includes("etapa") ||
    text.includes("bloqueio") ||
    text.includes("começar") ||
    text.includes("procrastina") ||
    text.includes("paralisia")
  ) {
    return `[Protocolo de Desbloqueio Executivo & Micro-Passos]
Olá${name}! A paralisia de início não é falta de vontade — é sobrecarga do cérebro ao tentar processar o todo de uma vez.

Vamos transformar essa tarefa grande em **micro-ações fáceis de começar**:

1️⃣ **Micro-Ação Zero (Menos de 2 minutos):**
• *Apenas prepare o cenário, sem compromisso de fazer tudo.*
• Exemplo: Se for escrever um texto, abra o documento em branco e digite apenas o título. Se for estudar, abra o livro na página.

2️⃣ **Bloco dos 10 Minutos (Sem Cobrança de Perfeição):**
• Coloque um cronômetro de 10 minutos.
• Faça o que for possível, sabendo que você tem permissão total para parar quando o alarme tocar.

3️⃣ **Pausa de Recompensa (3 a 5 minutos):**
• Levante-se, beba água ou faça um estímulo que te acalme.

4️⃣ **Decisão Consciente:**
• Sente que o fluxo engrenou? Faça mais um bloco de 10 a 15 min.
• Sente que atingiu o limite? Respeite seu ritmo e pause sem culpa.

Qual é a tarefa que você precisa começar hoje? Me diga em poucas palavras e eu divido ela em passos simples para você!`;
  }

  // 4. Pedir Instruções por Escrito
  if (
    text.includes("instruções por escrito") ||
    text.includes("por escrito") ||
    text.includes("pedir instrução") ||
    text.includes("mensagem por escrito")
  ) {
    return `[Modelo de Comunicação: Solicitação por Escrito]
Olá${name}! Pedir orientações por escrito garante clareza, previsibilidade e evita lapsos de memória de trabalho.

Aqui está um modelo pronto, educado e assertivo para você enviar por email ou mensagem:

---
*"Olá [Nome do colega, gestor ou professor], tudo bem?*

*Para que eu possa organizar as etapas com precisão e garantir que nenhum detalhe importante se perca, você poderia me enviar por escrito o resumo dessa demanda com os pontos principais e o prazo de entrega esperado?*

*Isso me ajuda a alinhar expectativas e planejar a execução com qualidade.*

*Muito obrigado(a) pela colaboração!"*
---

💡 **Variação curta para WhatsApp ou chat interno:**
*"Olá! Pode me mandar esses pontos por escrito por aqui rapidinho? Fica bem mais fácil para eu acompanhar e checar cada etapa sem esquecer nada. Obrigado!"*`;
  }

  // 5. Pedir Uso de Fones com Cancelamento de Ruído / Acomodação
  if (
    text.includes("fone") ||
    text.includes("abafador") ||
    text.includes("ruído") ||
    text.includes("acomodação") ||
    text.includes("cancelamento")
  ) {
    return `[Modelo de Comunicação: Acomodação Sensorial & Fones]
Olá${name}! O uso de fones abafadores ou com cancelamento ativo de ruído é uma adaptação de acessibilidade essencial para atenuar ruídos concorrentes e proteger o foco e bem-estar.

Aqui está um modelo assertivo para solicitar essa acomodação no trabalho ou estudo:

---
*"Prezada equipe / [Nome do gestor ou coordenação],*

*Gostaria de formalizar o pedido para utilizar fones com cancelamento de ruído durante as minhas atividades de foco individual.*

*Essa adaptação acústica me permite atenuar os estímulos sonoros concorrentes do ambiente, preservando minha atenção sustentada, conforto sensorial e a qualidade contínua das minhas entregas.*

*Fico à disposição para qualquer alinhamento e agradeço o acolhimento dessa necessidade de acessibilidade.*

*Atenciosamente,*
*[Seu Nome]"*
---

💡 **Dica prática:** Conforme a Lei Brasileira de Inclusão (LBI), adaptações razoáveis de ambiente são direitos que viabilizam a autonomia e produtividade.`;
  }

  // 6. Adaptação Pedagógica & Estudo Escolar
  if (
    text.includes("adaptar atividade") ||
    text.includes("estudo") ||
    text.includes("escola") ||
    text.includes("aula") ||
    text.includes("aluno") ||
    text.includes("pedagógico") ||
    role === "educacao"
  ) {
    return `[Apoio Pedagógico & Desenho Universal para a Aprendizagem (DUA)]
Olá${name}! No contexto educacional, adaptar atividades significa remover barreiras desnecessárias mantendo os objetivos de aprendizado.

Aqui estão 4 estratégias práticas de acessibilidade pedagógica:

1. **Fracionamento de Enunciados Extensos:**
   • Dividir instruções longas em passos numerados e destacados.
   • Usar verbos de comando claros (*Identifique*, *Organize*, *Resolva*).

2. **Apoios Visuais & Previsibilidade:**
   • Quadros visuais e roteiros da aula para antecipar transições de matéria.

3. **Múltiplas Formas de Expressão:**
   • Permitir respostas em tópicos, desenhos explicativos ou áudio quando o foco for a assimilação do conteúdo.

4. **Pausa Sensorial Programada:**
   • Intervalos regulares de 2 minutos para hidratação e autorregulação.`;
  }

  // 7. Script para Conversa Difícil e Limites
  if (
    text.includes("conversa difícil") ||
    text.includes("limite") ||
    text.includes("dizer não") ||
    text.includes("recusar") ||
    text.includes("limites")
  ) {
    return `[Script Social Assertivo: Estabelecendo Limites Saudáveis]
Olá${name}! Dizer "não" de forma educada é um ato de preservação da sua saúde mental e funcionalidade.

Aqui estão roteiros prontos:

1️⃣ **Recusar uma tarefa extra quando você já está no limite:**
*"Agradeço pela confiança. No momento, para manter a qualidade e o prazo das demandas já em andamento, não poderei assumir essa nova tarefa sem sobrecarga. O que podemos priorizar juntos?"*

2️⃣ **Recusar um convite social sem culpa:**
*"Muito obrigado pelo convite! Hoje preciso de um tempo para descansar e recarregar a bateria social, então não poderei comparecer. Espero que se divirtam bastante!"*

3️⃣ **Pedir tempo para pensar:**
*"Recebi sua solicitação. Vou analisar com calma e te respondo até [horário/dia]. Obrigado pela compreensão!"*`;
  }

  // 8. Autorregulação & Pausa Sensorial
  if (
    text.includes("autorregulação") ||
    text.includes("pausa") ||
    text.includes("estresse") ||
    text.includes("ansiedade") ||
    text.includes("respiração")
  ) {
    return `[Guia Rápido de Autorregulação & Pausa Restauradora]
Olá${name}. Reserve estes próximos 3 minutos para cuidar do seu equilíbrio sensorial:

🌬️ **1. Respiração no Ritmo 4-4-6:**
• Inspire suavemente pelo nariz contando até 4.
• Segure o ar com calma contando até 4.
• Solte o ar pela boca bem devagar contando até 6.
*(Repita por 3 ciclos).*

🎧 **2. Conforto Acústico:**
• Na aba **Som & Autorregulação**, teste a *Pausa de 2 minutos* com Ruído Marrom ou Faixa 432 Hz para atenuar ruídos imprevisíveis.

🧘 **3. Alívio de Tensão Muscular:**
• Solte a mandíbula (desencoste os dentes).
• Abaixe os ombros afastando-os das orelhas.
• Solte o peso das mãos sobre o colo.

Você merece esse momento de pausa. Como você está se sentindo agora?`;
  }

  // 9. Autoavaliação do Momento / Discussão
  if (
    text.includes("autoavaliação") ||
    text.includes("autoavaliacao") ||
    text.includes("momento") ||
    text.includes("energia") ||
    text.includes("resultado")
  ) {
    return `[Apoio à Autoavaliação Funcional do Momento]
Olá${name}! Mapear o seu estado atual de energia e sobrecarga sensorial é o primeiro passo para agir com respeito ao seu ritmo.

💡 **Recomendações Práticas:**
• **Se a energia estiver baixa ou houver sobrecarga:** Reduza estímulos imediatamente, proteja-se contra interações sociais exaustivas e adote a *Regra da Única Coisa*.
• **Se a energia estiver estável:** Mantenha blocos curtos de trabalho (15 a 25 min) com pausas obrigatórias para não exaurir sua bateria tardiamente.
• **Se houver paralisia de início:** Escolha uma micro-tarefa de 2 minutos apenas para destravar o movimento.

Como posso te apoiar com o seu próximo passo prático?`;
  }

  // 10. Contextos Específicos
  if (role === "familia_cuidado") {
    return `[Apoio à Família & Rede de Cuidados]
Olá${name}! O papel da rede de apoio é construir um ambiente seguro, com previsibilidade e acolhimento mútuo.

Como posso apoiar a rotina familiar hoje?
• **Previsibilidade doméstica:** Organizar horários estáveis para as refeições, descanso e momentos de silêncio.
• **Antecipação de mudanças:** Planejar como conversar antes sobre alterações de horários, visitas ou consultas.
• **Divisão de tarefas colaborativas:** Estruturar afazeres com a participação da pessoa apoiada respeitando seu ritmo.
• **Comunicação com a escola:** Preparar mensagens informando sobre a semana com clareza e empatia.
• **Ajustes ambientais:** Reduzir excesso de estímulos luminosos, sonoros ou desorganização física nos espaços de descanso.`;
  }

  if (role === "comunicacao_acessibilidade") {
    return `[Comunicação & Acessibilidade]
Olá${name}! Uma comunicação autêntica e clara reduz a ansiedade e garante que suas necessidades sejam compreendidas.

Posso te apoiar a:
• **Criar scripts sociais:** Textos prontos para dizer 'não' educadamente, pedir um tempo para pensar ou recusar um convite sem constrangimento.
• **Solicitar instruções por escrito:** Frases diretas para garantir que detalhes de conversas orais fiquem registrados.
• **Tradução para linguagem literal:** Ajudar a interpretar metáforas ou expressões implícitas que pareçam confusas.
• **Apoio a CAA (Comunicação Aumentativa e Alternativa):** Elaborar frases curtas com vocabulário direto para painéis ou cartões.

Qual situação comunicativa você gostaria de praticar ou preparar?`;
  }

  if (role === "organizacao_rotina") {
    return `[Organização & Rotina Funcional]
Olá${name}! Estruturar a rotina com clareza visual alivia a fadiga mental e facilita o início das tarefas.

Posso te apoiar com:
• **Estruturação do dia:** Dividir o dia em blocos realistas (Manhã, Tarde e Noite) com margem para pausas.
• **Dividir uma tarefa grande em etapas:** Transformar uma demanda complexa em passos de 10 a 15 minutos.
• **Rotina para dias de baixa energia:** Identificar o que é estritamente essencial e o que pode esperar quando a energia está baixa.
• **Checklist de saída de casa:** Listar itens essenciais para não esquecer nada ao sair (chaves, documentos, fones, água).

Qual atividade você gostaria de organizar agora?`;
  }

  return `Olá${name}! Sou o copiloto de apoio do **NeuroConecta**.

Recebi sua mensagem sobre "${userMessage.substring(0, 80)}".

Como posso te apoiar agora?
1. 🗓️ **Organizar o seu dia:** Dividir tarefas grandes em passos simples e fáceis de começar.
2. ✍️ **Preparar mensagens:** Redigir pedidos de apoio, acomodação ou instruções por escrito.
3. 🧘 **Autorregulação:** Encontrar momentos de pausa e estratégias de descompressão sensorial.
4. 🧭 **Recursos do NeuroConecta:** Indicar sons relaxantes, scripts sociais prontos ou rotinas visuais.

Selecione o **Contexto do Apoio** acima ou escolha uma das ações rápidas!`;
};

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  userProfile,
  onUpdateProfile,
  onNavigateToTab,
  onOpenCrisis,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const isDark = userProfile.lowStimulationMode;

  const [interactionRole, setInteractionRole] = useState<InteractionRole>("meu_apoio");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Onboarding local state if user hasn't filled profile
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3 | "done">(
    userProfile.onboardingCompleted ? "done" : 1
  );
  const [tempName, setTempName] = useState(userProfile.preferredName || "");

  useEffect(() => {
    if (userProfile.onboardingCompleted) {
      setOnboardingStep("done");
    }
    if (userProfile.preferredName && userProfile.preferredName !== "Visitante") {
      setTempName(userProfile.preferredName);
    }
  }, [userProfile.onboardingCompleted, userProfile.preferredName]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initial welcome message if conversation is empty
  useEffect(() => {
    if ((messages.length === 0 || (messages.length === 1 && messages[0].id === "msg-welcome")) && onboardingStep === "done") {
      const realName = userProfile.preferredName && userProfile.preferredName !== "Visitante" ? `, ${userProfile.preferredName}` : "";
      const initialGreeting: ChatMessage = {
        id: "msg-welcome",
        role: "assistant",
        content: `Olá${realName}! Sou o copiloto de apoio do **NeuroConecta**.

Como posso apoiar você hoje? Posso ajudar a:
• Organizar o seu dia ou dividir uma tarefa difícil em etapas
• Redigir uma mensagem objetiva ou pedir uma acomodação funcional
• Adaptar uma atividade de estudo ou apoiar a rotina familiar
• Guiar estratégias simples de pausa e autorregulação

Selecione no menu acima o **Contexto do Apoio** mais adequado para o seu momento ou digite sua mensagem abaixo.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages([initialGreeting]);
    }
  }, [onboardingStep, userProfile.preferredName]);

  // Auto-trigger message if navigated with initialPrompt
  useEffect(() => {
    if (initialPrompt && initialPrompt.prompt) {
      if (initialPrompt.role) {
        setInteractionRole(initialPrompt.role);
      }
      handleSendMessage(initialPrompt.prompt);
      onClearInitialPrompt?.();
    }
  }, [initialPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText("");
    setIsLoading(true);

    let replyText = "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          interactionRole,
          userContext: {
            preferredName: userProfile.preferredName,
            diagnosisStatus: userProfile.diagnosisStatus,
            currentFocus: userProfile.currentFocus,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.reply) {
          replyText = data.reply;
        }
      }
    } catch (err) {
      console.warn("API de chat indisponível, utilizando resposta local inteligente:", err);
    }

    // Always fallback to smart response if API returned empty or failed
    if (!replyText) {
      replyText = getSmartAssistantReply(text, userProfile, interactionRole);
    }

    const assistantMsg: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setIsLoading(false);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Onboarding submit
  const finishOnboarding = (focus: FocusArea, diagStatus?: DiagnosisStatus) => {
    const updated = {
      ...userProfile,
      preferredName: tempName.trim() || "Amigo(a)",
      diagnosisStatus: diagStatus || userProfile.diagnosisStatus,
      currentFocus: focus,
      onboardingCompleted: true,
    };
    onUpdateProfile(updated);
    setOnboardingStep("done");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] w-full max-w-7xl mx-auto p-2 sm:p-4 space-y-3 flex-1">
      
      {/* Support Context Selector */}
      <div className={`border rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-sm flex-shrink-0 ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-2 pl-1">
          <Sparkles className="w-4 h-4 text-violet-500 shrink-0" />
          <span className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>Contexto do Apoio:</span>
          <span className="text-[11px] text-slate-400 hidden lg:inline">• Orientação para organização executiva, scripts e acessibilidade</span>
        </div>

        <div className="flex flex-wrap gap-1.5 text-xs">
          {[
            { id: "meu_apoio", label: "Meu Apoio", icon: UserCheck, color: isDark ? "text-violet-300 bg-violet-950/80 border-violet-700" : "text-violet-800 bg-violet-50 border-violet-300" },
            { id: "educacao", label: "Educação & DUA", icon: GraduationCap, color: isDark ? "text-amber-300 bg-amber-950/80 border-amber-700" : "text-amber-900 bg-amber-50 border-amber-300" },
            { id: "familia_cuidado", label: "Família & Cuidado", icon: Users, color: isDark ? "text-indigo-300 bg-indigo-950/80 border-indigo-700" : "text-indigo-900 bg-indigo-50 border-indigo-300" },
            { id: "comunicacao_acessibilidade", label: "Comunicação & Acessibilidade", icon: MessageSquare, color: isDark ? "text-sky-300 bg-sky-950/80 border-sky-700" : "text-sky-900 bg-sky-50 border-sky-300" },
            { id: "organizacao_rotina", label: "Organização & Rotina", icon: Clock, color: isDark ? "text-purple-300 bg-purple-950/80 border-purple-700" : "text-purple-900 bg-purple-50 border-purple-300" },
          ].map((ctx) => {
            const Icon = ctx.icon;
            const isSelected = interactionRole === ctx.id;
            return (
              <button
                key={ctx.id}
                onClick={() => setInteractionRole(ctx.id as InteractionRole)}
                className={`px-3 py-1.5 rounded-xl border font-medium flex items-center gap-1.5 transition text-xs ${
                  isSelected
                    ? ctx.color + (isDark ? " ring-1 ring-offset-1 ring-offset-slate-950 shadow-md font-bold" : " ring-1 ring-violet-500 shadow-sm font-bold")
                    : isDark 
                      ? "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{ctx.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Onboarding Box if not completed */}
      {onboardingStep !== "done" && (
        <div className={`mb-2 rounded-2xl p-5 shadow-xl space-y-4 border ${
          isDark 
            ? "bg-slate-900 border-teal-700/80 text-slate-100" 
            : "bg-white border-teal-200 text-slate-900 shadow-md"
        }`}>
          <div className="flex items-center gap-3 text-teal-600 dark:text-teal-300">
            <Sparkles className="w-6 h-6 text-teal-500 animate-pulse" />
            <h2 className="text-lg font-bold">Bem-vindo(a) ao NeuroConecta!</h2>
          </div>
          <p className={`${isDark ? "text-slate-300" : "text-slate-600"} text-sm leading-relaxed`}>
            Para personalizar melhor seu atendimento com linguagem neuroafirmativa, nos diga brevemente:
          </p>

          {onboardingStep === 1 && (
            <div className="space-y-3">
              <label className={`block text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                1. Como prefere ser chamado(a)?
              </label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Seu nome ou apelido"
                className={`w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  isDark
                    ? "bg-slate-950 border border-slate-700 text-slate-100"
                    : "bg-slate-50 border border-slate-300 text-slate-900"
                }`}
              />
              <button
                onClick={() => setOnboardingStep(2)}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-semibold transition"
              >
                Avançar
              </button>
            </div>
          )}

          {onboardingStep === 2 && (
            <div className="space-y-3">
              <label className={`block text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                2. {tempName ? `${tempName}, você` : "Você"} já possui diagnóstico de TEA ou está em processo de investigação?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                {[
                  { label: "Autodiagnosticado / Identificação", val: "autodiagnosticado" },
                  { label: "Em processo de investigação", val: "investigacao" },
                  { label: "Possuo laudo formal confirmado", val: "laudo_formal" },
                  { label: "Familiar / Cuidador", val: "familiar_apoiador" },
                  { label: "Prefiro não informar", val: "nao_informado" },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => {
                      onUpdateProfile({ ...userProfile, diagnosisStatus: opt.val as DiagnosisStatus });
                      setOnboardingStep(3);
                    }}
                    className={`p-3 border rounded-xl text-left font-medium transition ${
                      isDark
                        ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                        : "bg-slate-50 hover:bg-teal-50 border-slate-200 text-slate-800"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {onboardingStep === 3 && (
            <div className="space-y-3">
              <label className={`block text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                3. Qual área da vida você gostaria de trabalhar hoje?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs sm:text-sm">
                {[
                  { label: "📅 Rotina & Pausas", focus: "rotina" },
                  { label: "📋 Testes & Autoavaliação", focus: "testes" },
                  { label: "🌊 Regulação Sensorial", focus: "sensorial" },
                  { label: "💬 Comunicação & Scripts", focus: "comunicacao" },
                  { label: "🆘 Prevenção de Crises", focus: "crise" },
                  { label: "📚 Aprendizado & Conceitos", focus: "aprendizado" },
                ].map((item) => (
                  <button
                    key={item.focus}
                    onClick={() => finishOnboarding(item.focus as FocusArea)}
                    className={`p-3 border rounded-xl text-center font-medium transition ${
                      isDark
                        ? "bg-teal-950/80 hover:bg-teal-900 border-teal-800 text-teal-200"
                        : "bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Chat Conversation Container (Turns: Pergunta + Resposta agrupadas em 1 turno visual) */}
      <div className={`flex-1 rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-4 border ${
        isDark
          ? "bg-slate-900/80 border-slate-800"
          : "bg-white border-slate-200"
      }`}>
        {(() => {
          interface ChatTurn {
            id: string;
            user?: ChatMessage;
            assistant?: ChatMessage;
          }

          const turns: ChatTurn[] = [];
          let pendingUser: ChatMessage | null = null;

          for (const msg of messages) {
            if (msg.role === "user") {
              if (pendingUser) {
                turns.push({ id: `turn-${pendingUser.id}`, user: pendingUser });
              }
              pendingUser = msg;
            } else {
              if (pendingUser) {
                turns.push({ id: `turn-${pendingUser.id}`, user: pendingUser, assistant: msg });
                pendingUser = null;
              } else {
                turns.push({ id: `turn-${msg.id}`, assistant: msg });
              }
            }
          }
          if (pendingUser) {
            turns.push({ id: `turn-${pendingUser.id}`, user: pendingUser });
          }

          return turns.map((turn, turnIdx) => (
            <div
              key={turn.id}
              className={`p-4 sm:p-5 rounded-2xl border transition space-y-4 ${
                isDark
                  ? "bg-slate-950/40 border-slate-800/70"
                  : "bg-slate-50/70 border-slate-200/80"
              }`}
            >
              {/* User Prompt (Pergunta) */}
              {turn.user && (
                <div className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isDark ? "bg-slate-800 text-teal-300" : "bg-teal-100 text-teal-800"
                  }`}>
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        {userProfile.preferredName && userProfile.preferredName !== "Visitante" ? userProfile.preferredName : "Você"}
                      </span>
                      <span className="text-[11px] text-slate-400">{turn.user.timestamp}</span>
                    </div>
                    <p className={`text-sm sm:text-base mt-1 font-medium leading-relaxed ${
                      isDark ? "text-slate-100" : "text-slate-900"
                    }`}>
                      {turn.user.content}
                    </p>
                  </div>
                </div>
              )}

              {/* Divider between Question & Answer if user prompt exists */}
              {turn.user && turn.assistant && (
                <div className={`border-t ${isDark ? "border-slate-800/60" : "border-slate-200"}`} />
              )}

              {/* Assistant Response (Resposta) */}
              {turn.assistant && (
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold ${isDark ? "text-teal-400" : "text-teal-800"}`}>
                        Copiloto NeuroConecta
                      </span>
                      <span className="text-[11px] text-slate-400">{turn.assistant.timestamp}</span>
                    </div>
                    <div className={`text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans ${
                      isDark ? "text-slate-200" : "text-slate-800"
                    }`}>
                      {turn.assistant.content}
                    </div>
                    <div className="flex items-center justify-end pt-1">
                      <button
                        onClick={() => handleCopy(turn.assistant!.id, turn.assistant!.content)}
                        className={`text-xs transition flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
                          isDark ? "hover:bg-slate-800 text-slate-400 hover:text-slate-200" : "hover:bg-slate-200 text-slate-600 hover:text-slate-900"
                        }`}
                        title="Copiar resposta do copiloto"
                      >
                        {copiedId === turn.assistant.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === turn.assistant.id ? "Copiado" : "Copiar"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State in active turn */}
              {!turn.assistant && isLoading && turnIdx === turns.length - 1 && (
                <div className="flex items-center gap-3 text-xs italic pl-10 text-teal-600 dark:text-teal-400">
                  <Bot className="w-4 h-4 animate-spin" />
                  <span>O copiloto NeuroConecta está formulando a resposta...</span>
                </div>
              )}
            </div>
          ));
        })()}

        {isLoading && messages.length === 0 && (
          <div className="flex items-center gap-3 text-slate-500 text-xs italic p-2">
            <Bot className="w-4 h-4 text-teal-600 animate-spin" />
            <span>O copiloto NeuroConecta está iniciando...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Action Chips */}
      <div className="py-1 overflow-x-auto no-scrollbar flex items-center gap-2 text-xs">
        {[
          { label: "🗓️ Organizar meu dia", prompt: "Pode me ajudar a organizar o meu dia de forma clara e sem sobrecarga?" },
          { label: "🧩 Dividir tarefa em etapas", prompt: "Tenho uma tarefa grande para fazer e estou com dificuldade de começar. Pode me ajudar a dividi-la em etapas simples?" },
          { label: "✍️ Pedir instruções por escrito", prompt: "Pode redigir uma mensagem curta e educada pedindo que as instruções da tarefa sejam enviadas por escrito?" },
          { label: "🎧 Pedir uso de fones abafadores", prompt: "Pode me ajudar a redigir um pedido para utilizar fones com cancelamento de ruído no ambiente de trabalho ou estudo?" },
          { label: "🎓 Adaptar atividade escolar", prompt: "Como posso tornar uma atividade de estudo mais acessível e dividida em passos para reduzir sobrecarga?" },
          { label: "💬 Script para conversa difícil", prompt: "Tenho uma conversa delicada pela frente. Pode me sugerir um roteiro respeitoso para expressar meus limites?" },
          { label: "🧘 Autorregulação & Pausa", prompt: "Estou me sentindo sobrecarregado(a). Pode me guiar em uma estratégia simples de respiração ou descompressão sensorial?" },
          { label: "🆘 Apoio em crise", action: onOpenCrisis },
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (chip.action) chip.action();
              else if (chip.prompt) handleSendMessage(chip.prompt);
            }}
            className={`px-3 py-1.5 border rounded-full font-medium whitespace-nowrap transition flex items-center gap-1.5 flex-shrink-0 shadow-sm ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-teal-300"
                : "bg-white hover:bg-teal-50 border-slate-300 text-slate-700 hover:text-teal-800"
            }`}
          >
            <span>{chip.label}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="mt-1 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Digite sua mensagem ou o que deseja organizar hoje..."
          disabled={isLoading}
          className={`flex-1 px-4 py-3 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-sm transition ${
            isDark
              ? "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500"
              : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
          }`}
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="px-5 py-3 bg-violet-700 hover:bg-violet-600 disabled:opacity-40 text-white font-semibold rounded-2xl shadow-md transition flex items-center gap-2 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Enviar</span>
        </button>
      </form>

    </div>
  );
};
