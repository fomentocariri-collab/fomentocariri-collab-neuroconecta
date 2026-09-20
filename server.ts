import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {
  ShareGrantsService,
  DiaryEntriesService,
  SensoryRecordsService,
  FunctionalPlanService,
  PeiService,
  SchoolFamilyCommService,
} from "./server/lote1Service";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Helper de extração de ator da requisição
function getActorFromReq(req: express.Request) {
  const actorId = (req.headers["x-actor-id"] as string) || (req.query.actorId as string) || req.body?.actorId || "anon-user";
  const actorRole = (req.headers["x-actor-role"] as string) || (req.query.actorRole as string) || req.body?.actorRole || "pcd";
  const actorName = (req.headers["x-actor-name"] as string) || (req.query.actorName as string) || req.body?.actorName || "Usuário";
  const profRole = (req.headers["x-actor-professional-role"] as string) || (req.query.actorProfRole as string) || req.body?.actorProfRole;

  return { id: actorId, role: actorRole, name: actorName, professionalRoleType: profRole };
}

// ==========================================
// ENDPOINTS DO LOTE 1: ARQUITETURA DE APOIO
// ==========================================

// 1. Matriz de Compartilhamento Granular (Share Grants)
app.get("/api/share-grants", (req, res) => {
  const subjectId = (req.query.subjectId as string) || getActorFromReq(req).id;
  const grants = ShareGrantsService.list(subjectId);
  res.json({ grants });
});

app.post("/api/share-grants", (req, res) => {
  const actor = getActorFromReq(req);
  const { grantedToName, relationship, context, resourceType, permission, description, subjectId } = req.body;

  if (!grantedToName || !context || !resourceType) {
    return res.status(400).json({ error: "Campos obrigatórios: grantedToName, context, resourceType." });
  }

  const newGrant = ShareGrantsService.create({
    subjectId: subjectId || actor.id,
    subjectName: req.body.subjectName,
    grantedBy: actor.id,
    grantedToName,
    grantedToId: req.body.grantedToId,
    relationship: relationship || "outro",
    context,
    resourceType,
    permission: permission || "VIEW",
    description,
  });

  res.status(201).json({ grant: newGrant });
});

app.patch("/api/share-grants/:id/revoke", (req, res) => {
  const actor = getActorFromReq(req);
  const grantId = req.params.id;
  const revoked = ShareGrantsService.revoke(grantId, actor.id);

  if (!revoked) {
    return res.status(404).json({ error: "Concessão não encontrada." });
  }

  res.json({ grant: revoked, message: "Concessão revogada com sucesso." });
});

// 2. Diário & Humor com Isolamento e Controle de Privacidade Estrito
app.get("/api/diary/entries", (req, res) => {
  const actor = getActorFromReq(req);
  const subjectId = (req.query.subjectId as string) || actor.id;

  const { entries, deniedPersonalEntriesCount } = DiaryEntriesService.list(subjectId, actor);
  res.json({ entries, deniedPersonalEntriesCount });
});

app.post("/api/diary/entries", (req, res) => {
  const actor = getActorFromReq(req);
  const entry = req.body;

  if (!entry || !entry.mood) {
    return res.status(400).json({ error: "Dados de humor são obrigatórios." });
  }

  // Previne personificação indevida
  let entryType = entry.entryType;
  if (!entryType) {
    if (actor.role === "escola" || actor.professionalRoleType === "educador") {
      entryType = "school_note";
    } else if (actor.role === "cuidador_educador") {
      entryType = "caregiver_observation";
    } else {
      entryType = "personal";
    }
  }

  // Escola não pode postar no diário íntimo pessoal da pessoa
  if ((actor.role === "escola" || actor.professionalRoleType === "educador") && entryType === "personal") {
    return res.status(403).json({ error: "Acesso negado: escola só pode emitir notas pedagógicas ou de contexto escolar." });
  }

  const created = DiaryEntriesService.create(
    {
      ...entry,
      entryType,
      authorName: actor.name || entry.authorName || "Anônimo",
      authorRole: actor.role,
    },
    actor
  );

  res.status(201).json({ entry: created });
});

app.delete("/api/diary/entries/:id", (req, res) => {
  const actor = getActorFromReq(req);
  const success = DiaryEntriesService.delete(req.params.id, actor);

  if (!success) {
    return res.status(403).json({ error: "Não autorizado a excluir este registro." });
  }

  res.json({ success: true, message: "Registro removido com sucesso." });
});

// 3. Regulação Sensorial (Autopercepção e Check-ins)
app.get("/api/sensory/records", (req, res) => {
  const actor = getActorFromReq(req);
  const subjectId = (req.query.subjectId as string) || actor.id;
  const records = SensoryRecordsService.list(subjectId);
  res.json({ records });
});

app.post("/api/sensory/records", (req, res) => {
  const actor = getActorFromReq(req);
  const record = req.body;

  if (typeof record.energyLevel !== "number" || typeof record.sensoryOverloadLevel !== "number") {
    return res.status(400).json({ error: "energyLevel e sensoryOverloadLevel são obrigatórios." });
  }

  const created = SensoryRecordsService.create(
    {
      ...record,
      subjectId: record.subjectId || actor.id,
      authorName: actor.name,
    },
    actor
  );

  res.status(201).json({ record: created });
});

// 4. Plano Individual de Apoio Funcional
app.get("/api/functional-plan/:subjectId", (req, res) => {
  const plan = FunctionalPlanService.get(req.params.subjectId);
  res.json({ plan });
});

app.put("/api/functional-plan/:subjectId", (req, res) => {
  const actor = getActorFromReq(req);
  const plan = req.body;

  if (!plan || plan.subjectId !== req.params.subjectId) {
    return res.status(400).json({ error: "Identificador subjectId inconsistente no corpo da requisição." });
  }

  const updated = FunctionalPlanService.update(plan, actor);
  res.json({ plan: updated });
});

// 5. Minutas de PEI com Versionamento
app.get("/api/pei/versions/:subjectId", (req, res) => {
  const versions = PeiService.list(req.params.subjectId);
  res.json({ versions });
});

app.post("/api/pei/versions", (req, res) => {
  const actor = getActorFromReq(req);
  const draft = req.body;

  if (!draft.subjectId || !draft.schoolName) {
    return res.status(400).json({ error: "subjectId e schoolName são obrigatórios." });
  }

  const created = PeiService.createVersion(draft, actor);
  res.status(201).json({ version: created });
});

// 6. Comunicação Bidirecional Escola-Família
app.get("/api/school-family-comm/:subjectId", (req, res) => {
  const msgs = SchoolFamilyCommService.list(req.params.subjectId);
  res.json({ messages: msgs });
});

app.post("/api/school-family-comm", (req, res) => {
  const actor = getActorFromReq(req);
  const msg = req.body;

  if (!msg.subjectId || !msg.content || !msg.type) {
    return res.status(400).json({ error: "subjectId, content e type são obrigatórios." });
  }

  const created = SchoolFamilyCommService.create(
    {
      ...msg,
      authorName: actor.name,
      authorContext: msg.authorContext || (actor.role === "escola" || actor.professionalRoleType === "educador" ? "escola" : "familia"),
    },
    actor
  );

  res.status(201).json({ message: created });
});

app.patch("/api/school-family-comm/:id/read", (req, res) => {
  const success = SchoolFamilyCommService.markRead(req.params.id);
  res.json({ success });
});

// Initialize Gemini Client safely
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "dummy-key") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

function normalizeSupportContext(rawRole?: string): string {
  if (!rawRole) return "meu_apoio";
  const r = rawRole.toLowerCase();
  if (r === "usuario" || r === "meu_apoio") return "meu_apoio";
  if (r === "educador" || r === "educacao") return "educacao";
  if (r === "familia_cuidado" || r === "familia") return "familia_cuidado";
  if (r === "comunicacao_acessibilidade" || r === "comunicacao") return "comunicacao_acessibilidade";
  if (r === "organizacao_rotina" || r === "rotina") return "organizacao_rotina";
  if (r === "medico" || r === "enfermeiro" || r === "psiquiatra" || r === "saude") return "saude";
  if (r === "rh" || r === "perito" || r === "trabalho") return "trabalho";
  return "meu_apoio";
}

const SYSTEM_INSTRUCTION = `Você é o copiloto virtual de organização, comunicação e acessibilidade do NeuroConecta.

Sua identidade é:
PESSOA → AUTONOMIA → COMUNICAÇÃO → ACESSIBILIDADE → REDE DE APOIO.
Você NUNCA se apresenta nem assume a persona de um profissional habilitado (médico, psiquiatra, neurologista, enfermeiro, psicólogo clínico, advogado, perito ou gestor de RH).
Você atua como um copiloto prático, acolhedor e neuroafirmativo.

LIMITES DE SEGURANÇA INEGOCIÁVEIS:
- Não realizar diagnóstico clínico nem sugerir confirmação de TEA, TDAH ou transtornos mentais.
- Não afirmar que um comportamento relatado é "prova" de determinada condição.
- Não prescrever medicamentos, dosagens, fórmulas ou suplementos, nem sugerir início ou suspensão medicamentosa.
- Não substituir avaliação profissional presencial.

Você ajusta o direcionamento prático conforme o CONTEXTO DO APOIO selecionado:

1. MEU APOIO (meu_apoio):
   - Foco na própria pessoa e em sua autonomia no dia a dia.
   - Ajudar a: organizar o dia, dividir tarefas complexas em etapas executáveis, criar checklists práticos, preparar conversas, organizar pensamentos antes de reuniões, preparar a ida a novos locais (escola, trabalho, consulta), redigir mensagens de pedido de ajuda ou acomodação, encontrar estratégias que respeitem a energia diária e simplificar textos longos.
   - Não diagnosticar nem julgar.

2. EDUCAÇÃO (educacao):
   - Foco pedagógico inclusivo com base no Desenho Universal para a Aprendizagem (DUA), LBI e Lei Berenice Piana.
   - Primeira pergunta orientadora preferencial: "O que você precisa ensinar ou tornar mais acessível?" (e não "Qual diagnóstico o aluno tem?").
   - Ajudar a: adaptar atividades para reduzir sobrecarga, criar múltiplas formas de participação (oral, escrita, visual), simplificar enunciados mantendo objetivos pedagógicos, organizar instruções por etapas, sugerir apoios visuais para sala de aula, planejar transições entre atividades, redigir minutas de PEI/PDI, registrar observações pedagógicas descritivas e neutras e facilitar o diálogo respeitoso Escola-Família.

3. FAMÍLIA & CUIDADO (familia_cuidado):
   - Foco na rotina familiar e suporte compartilhado.
   - O familiar/cuidador é parceiro de apoio, previsibilidade e acolhimento (nunca corretor punitivo de comportamentos atípicos).
   - Ajudar a: organizar a rotina da casa e da semana, prever momentos de descanso e descompressão sensorial, preparar mudanças de rotina com antecedência, redigir mensagens para a escola ou terapeutas, registrar observações do cotidiano sem julgamentos e reduzir barreiras ambientais em casa (ruído, luz excessiva, imprevisibilidade).

4. COMUNICAÇÃO & ACESSIBILIDADE (comunicacao_acessibilidade):
   - Foco na expressão, escrita e interação social autêntica.
   - Ajudar a: criar scripts sociais personalizados, redigir mensagens curtas e objetivas, solicitar acomodações de forma educada e assertiva, pedir instruções por escrito, preparar conversas difíceis, traduzir expressões com duplo sentido para sentido literal e direto, e apoiar o uso de Comunicação Aumentativa e Alternativa (CAA).

5. ORGANIZAÇÃO & ROTINA (organizacao_rotina):
   - Foco na função executiva diária e ritmo de vida sustentável.
   - Ajudar a: estruturar agendas diárias ou semanais, priorizar demandas, montar sequências visuais de tarefas, planejar pausas e hidratação, dividir tarefas grandes em passos concretos e preparar rotinas adaptadas para dias de baixa energia.

6. SAÚDE — ORGANIZAÇÃO E PREPARAÇÃO (saude):
   - AVISO VISÍVEL OBRIGATÓRIO: A IA oferece apoio para organizar informações e preparar perguntas ou registros. Não substitui profissionais habilitados nem realiza diagnóstico, prescrição ou decisão clínica.
   - Permitido: organizar listas de sintomas e observações relatadas pelo próprio usuário em ordem cronológica para levar à consulta, estruturar perguntas claras para médicos ou terapeutas, resumir rotinas para facilitar o diálogo com a equipe de saúde e ajudar a registrar efeitos percebidos para posterior relato ao profissional.
   - Proibido: emitir laudos/atestados, sugerir diagnósticos conclusivos ou opinar sobre dosagens de medicamentos.

7. TRABALHO — ACESSIBILIDADE & ORGANIZAÇÃO (trabalho):
   - AVISO VISÍVEL OBRIGATÓRIO: A IA oferece apoio para organizar informações e pedidos funcionais. Não emite parecer jurídico, médico ou trabalhista.
   - Permitido: redigir mensagens para solicitar instruções de trabalho por escrito, solicitar autorização para fones com cancelamento de ruído ou ambiente com menos estímulos, estruturar rotina de tarefas e prazos, preparar conversas com gestores ou RH sobre necessidades funcionais e organizar entregas com clareza de prioridades.

Estilo de resposta: Claro, empático, direto, em Português do Brasil, sem jargões artificiais nem promessas de cura.`;

function getFallbackAssistantReply(userMessage: string, userContext?: any, rawRole: string = "meu_apoio"): string {
  const text = (userMessage || "").toLowerCase().trim();
  const name = userContext?.preferredName && userContext.preferredName !== "Visitante" ? `, ${userContext.preferredName}` : "";
  const role = normalizeSupportContext(rawRole);

  // 1. Detecção de Crise e Sobrecarga Aguda (Prioridade Máxima)
  if (
    text.includes("crise") ||
    text.includes("meltdown") ||
    text.includes("shutdown") ||
    text.includes("panico") ||
    text.includes("pânico") ||
    text.includes("desespero") ||
    text.includes("socorro") ||
    text.includes("sobrecarga extrema")
  ) {
    return `Olá${name}. Estou aqui com você. Se estiver passando por um momento de sobrecarga sensorial ou emocional intensa:

💙 **Estratégia Imediata de Descompressão e Acolhimento:**
1. **Reduza Estímulos Imediatamente:** Vá para um local menos iluminado, abaixe o volume ambiente, coloque fones com cancelamento ou feche os olhos por alguns minutos.
2. **Ancoragem Sensorial Suave (Técnica 5-4-3-2-1 Adaptada):**
   - 👁️ Identifique 5 coisas visuais com cores neutras ao seu redor.
   - 🖐️ Sinta o toque de 4 superfícies confortáveis (como sua roupa ou uma almofada).
   - 👂 Foque em 3 sons previsíveis ou coloque ruído marrom/ondas suaves.
   - 👃 Respire no seu ritmo, sem forçar.
   - 💧 Beba um gole de água fria devagar.
3. Não tente resolver tarefas difíceis ou tomar decisões agora. Permita que seu sistema nervoso desacelere no seu tempo.

⚠️ *Se você estiver em risco ou necessitar de apoio humano especializado imediato, use o botão **SOS Crise** no topo da tela ou ligue para o CVV (188) ou SAMU (192).*`;
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
Olá${name}! A paralisia de início não é preguiça — é sobrecarga do cérebro ao tentar processar o todo de uma vez.

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

Qual é a tarefa que você precisa começar hoje? Se quiser, me diga em poucas palavras e eu divido ela em passos numerados para você!`;
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
Olá${name}! O uso de fones abafadores ou com cancelamento ativo de ruído é uma adaptação de acessibilidade essencial e comprovada para reduzir a sobrecarga sensorial e fadiga cognitiva.

Aqui está um modelo assertivo para solicitar essa acomodação no trabalho ou estudo:

---
*"Prezada equipe / [Nome do gestor ou coordenação],*

*Gostaria de formalizar o pedido para utilizar fones com cancelamento de ruído durante as minhas atividades de foco individual.*

*Essa adaptação acústica me permite atenuar os estímulos sonoros concorrentes do ambiente, preservando minha atenção sustentada, conforto sensorial e a qualidade contínua das minhas entregas.*

*Fico à disposição para qualquer alinhamento e agradeço o acolhimento dessa necessidade de acessibilidade.*

*Atenciosamente,*
*[Seu Nome]"*
---

💡 **Dica de aplicação:** Você tem direito a um ambiente com acessibilidade funcional (conforme previsto na LBI e diretrizes de inclusão). O fone não é distração; é ferramenta de trabalho e estudo!`;
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
Olá${name}! Adaptar atividades não significa empobrecer o conteúdo, mas sim remover barreiras para que o aprendizado aconteça.

Aqui estão 4 estratégias práticas de acessibilidade pedagógica:

1. **Fracionamento de Enunciados Extensos:**
   • Dividir perguntas complexas em passos numerados (1, 2, 3).
   • Destacar em **negrito** os verbos de comando (ex: *Identifique*, *Calcule*, *Compare*).

2. **Apoio Visual e Previsibilidade:**
   • Usar quadros visuais simples, tabelas ou fluxogramas para ilustrar conceitos abstratos.
   • Antecipar o tempo estimado para cada atividade.

3. **Múltiplas Vias de Participação:**
   • Permitir respostas por escrito em tópicos, mapas mentais ou áudio, quando o objetivo principal for a demonstração do conhecimento e não a caligrafia.

4. **Pausa Sensorial Programada:**
   • Prever um intervalo de 2 a 3 minutos para hidratação e descompressão entre blocos intensos de conteúdo.

Deseja adaptar uma atividade específica agora? Cole o enunciado ou tema que dividiremos juntos!`;
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
Olá${name}! Dizer "não" de forma educada é um ato de preservação do seu bem-estar e da sua energia vital.

Aqui estão scripts prontos para situações comuns:

1️⃣ **Para recusar uma nova tarefa quando você já está sobrecarregado(a):**
*"Agradeço muito pela confiança. Olhando minhas prioridades atuais, percebo que se eu assumir mais essa entrega, comprometo o prazo e a qualidade do que já estou executando. O que sugerem que despriorizemos para acomodar isso?"*

2️⃣ **Para recusar um evento social ou convite sem culpa:**
*"Muito obrigado(a) pelo convite! Fico feliz por ter lembrado de mim. No momento, preciso desse período para descansar e recarregar as energias, então não poderei ir. Espero que aproveitem bastante!"*

3️⃣ **Para pedir um tempo antes de responder a uma cobrança rápida:**
*"Recebi sua mensagem. Vou analisar os pontos com calma e te dou um retorno completo até [horário ou dia]. Obrigado pela compreensão!"*`;
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
• Inspire pelo nariz contando até 4.
• Segure o ar suavemente contando até 4.
• Solte o ar pela boca bem devagar contando até 6.
*(Repita por 3 ciclos).*

🎧 **2. Conforto Acústico:**
• Se puder, abra a aba **Som & Autorregulação** no menu superior do NeuroConecta.
• Experimente o **Ruído Marrom** ou **Faixa Suave 432 Hz** para criar uma camada contínua e previsível.

🧘 **3. Alívio de Tensão Muscular:**
• Solte a mandíbula (desencoste os dentes).
• Abaixe os ombros afastando-os das orelhas.
• Solte o peso das mãos no colo.

Você merece esse momento de pausa. Como seu corpo está se sentindo agora?`;
  }

  // 9. Autoavaliação / Momento
  if (
    text.includes("autoavaliação") ||
    text.includes("autoavaliacao") ||
    text.includes("momento") ||
    text.includes("resultado") ||
    text.includes("energia")
  ) {
    return `[Apoio à Autoavaliação Funcional do Momento]
Olá${name}! Acompanhar como estão a sua energia, estímulos e foco é a base da autorregulação diária.

💡 **Recomendações Práticas:**
• Se sua energia estiver **baixa** ou houver **sobrecarga sensorial**: ative a proteção executiva — diminua luzes, coloque fones e foque apenas no que for indispensável.
• Se sua energia estiver **estável**: aproveite para estruturar sua principal demanda em blocos de 20 minutos com pausas planejadas.
• Você pode registrar sua autoavaliação completa no menu **Autoavaliação** na aba superior para acompanhar seus padrões ao longo do tempo.

Como está sua energia e o ambiente sonoro ao seu redor agora? Posso te apoiar a planejar o próximo passo!`;
  }

  // Contextos Específicos
  if (role === "saude") {
    return `[Apoio para Organização & Preparação em Saúde]
Olá${name}. 

⚠️ **Aviso Importante:** Esta ferramenta oferece apoio exclusivamente para organizar suas anotações, histórico e dúvidas para consultas. Não realiza diagnóstico, não prescreve medicamentos e não substitui avaliação médica ou multiprofissional.

Como posso te apoiar a se preparar?
1. **Organizar lista de sintomas:** Registrar o que você vem sentindo, quando começou e o que atenua ou agrava o desconforto.
2. **Preparar perguntas para a consulta:** Estruturar as 3 a 5 dúvidas principais para você não esquecer de perguntar durante o atendimento.
3. **Organizar histórico de exames/laudos:** Montar um resumo cronológico simples para apresentar ao seu médico ou terapeuta.

O que você gostaria de organizar para a sua próxima consulta?`;
  }

  if (role === "trabalho") {
    return `[Apoio para Acessibilidade & Organização no Trabalho]
Olá${name}. 

ℹ️ **Aviso:** Este recurso auxilia na redação de comunicações práticas e organização funcional. Não emite parecer jurídico, médico ou trabalhista.

Posso te apoiar a:
1. **Pedir acomodações funcionais:** Modelos educados e objetivos para solicitar fones abafadores, assento mais silencioso ou instruções de tarefas por escrito.
2. **Priorizar demandas:** Alinhar com sua liderança o que deve ser entregue primeiro quando há muitas tarefas abertas.
3. **Preparar conversas:** Estruturar tópicos pontuais para alinhar expectativas com gestores ou equipe.

Qual demanda de trabalho você gostaria de estruturar agora?`;
  }

  if (role === "familia_cuidado") {
    return `[Apoio à Família & Rede de Cuidados]
Olá${name}! O papel da rede de apoio é promover acolhimento, previsibilidade e redução de barreiras no cotidiano.

Como posso apoiar a rotina da sua família hoje?
• **Planejamento da semana:** Montar uma rotina doméstica equilibrada com tempo previsto para descompressão.
• **Antecipação de mudanças:** Preparar a pessoa com antecedência para viagens, consultas ou novos compromissos.
• **Comunicação com escola ou terapeutas:** Escrever mensagens claras relatando como foram os últimos dias.
• **Ajustes no ambiente:** Dicas simples para reduzir sobrecarga de iluminação, ruídos e desorganização visual em casa.`;
  }

  if (role === "comunicacao_acessibilidade") {
    return `[Comunicação & Acessibilidade]
Olá${name}! A comunicação clara e autêntica reduz a ansiedade e evita mal-entendidos.

Posso te apoiar a:
• **Criar scripts sociais:** Textos prontos para conversas delicadas, convites ou recusas educadas.
• **Solicitar instruções por escrito:** Frases diretas para garantir que detalhes e prazos não se percam.
• **Linguagem literal e direta:** Esclarecer expressões figuradas ou redigir mensagens sem ambiguidade.
• **Apoio a CAA:** Estruturar frases curtas e objetivas para painéis ou cartões de comunicação.

Qual mensagem ou conversa você gostaria de preparar?`;
  }

  if (role === "organizacao_rotina") {
    return `[Organização & Rotina Funcional]
Olá${name}! Ter uma rotina visual e previsível alivia a sobrecarga executiva.

Posso te apoiar a:
• **Estruturar seu dia:** Montar uma lista visual de tarefas dividida em Manhã, Tarde e Noite.
• **Dividir uma tarefa grande:** Transformar um projeto assustador em 3 a 5 passos pequenos e fáceis de começar.
• **Rotina de baixa energia:** Ajustar as atividades para dias em que você precisa descansar mais.
• **Lembretes essenciais:** Incluir pausas sensoriais, hidratação e refeições regulares.

Qual atividade ou período do dia você gostaria de organizar?`;
  }

  // Resposta padrão geral acolhedora e neuroafirmativa
  return `Olá${name}! Sou o copiloto de apoio do **NeuroConecta**.

Recebi sua mensagem sobre "${userMessage.substring(0, 80)}".

Como posso apoiar você neste momento? Posso ajudar com:
1. 🗓️ **Organizar o seu dia:** Dividir demandas em blocos realistas com margem para pausas.
2. ✍️ **Preparar mensagens:** Redigir pedidos claros de apoio, acomodação ou instruções por escrito.
3. 🧘 **Autorregulação sensorial:** Sugerir exercícios de respiração e faixas acústicas relaxantes.
4. 🧭 **Navegar pelo app:** Indicar testes funcionais, rotinas visuais ou estratégias de descompressão.

Digite o que você gostaria de estruturar ou clique em uma das sugestões rápidas acima!`;
}

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, userContext, interactionRole } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Campo 'messages' é obrigatório e deve ser um array." });
    }

    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user")?.content || "";
    const activeRole = normalizeSupportContext(interactionRole);
    const ai = getGenAI();

    if (ai) {
      let contextPrompt = `[CONTEXTO DO APOIO SELECIONADO: ${activeRole.toUpperCase()}]\n`;
      if (userContext) {
        contextPrompt += `[Perfil do Usuário: Nome="${userContext.preferredName || "Não informado"}", Status="${userContext.diagnosisStatus || "Não informado"}"]\n\n`;
      }

      const formattedHistory = messages
        .map((m: { role: string; content: string }) => {
          const roleName = m.role === "user" ? "Usuário" : "NeuroConecta";
          return `${roleName}: ${m.content}`;
        })
        .join("\n\n");

      const fullPrompt = `${contextPrompt}${formattedHistory}\n\nNeuroConecta:`;

      // Supported Gemini models per SDK guidelines
      const modelsToTry = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
      for (const modelName of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: fullPrompt,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              temperature: 0.7,
            },
          });

          if (response && response.text) {
            return res.json({ reply: response.text });
          }
        } catch (genErr: any) {
          console.warn(`Tentativa com modelo ${modelName} falhou:`, genErr?.message || genErr);
        }
      }
    }

    // Fallback if AI key is missing or model calls fail
    const fallbackReply = getFallbackAssistantReply(lastUserMsg, userContext, activeRole);
    return res.json({ reply: fallbackReply });
  } catch (error: any) {
    console.error("Erro na rota /api/chat:", error);
    const fallbackReply = getFallbackAssistantReply("", req.body?.userContext, req.body?.interactionRole || "usuario");
    return res.json({ reply: fallbackReply });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NeuroConecta Server rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer();
