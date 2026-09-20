import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Printer, 
  FileText, 
  Layers, 
  Eye, 
  Clock, 
  Users, 
  CheckCircle2, 
  HelpCircle,
  Lightbulb,
  RotateCcw,
  BookOpen,
  Brain,
  HeartHandshake,
  History,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Search,
  Filter,
  Trash2,
  Edit2,
  Send,
  Download
} from "lucide-react";
import { 
  PlannedActivity, 
  PlannerMode, 
  AssistedUserSummary, 
  ActivityApplicationRecord,
  PsychopedagogyPlan,
  PsychologyTherapeuticProcess,
  PsychopedagogyGoal,
  STANDARD_DISCIPLINES,
  PSYCHOPEDAGOGY_PROCESSES,
  SupportLevelType
} from "../types";
import { smartPlannerService } from "../services/smartPlannerService";
import { useAuth } from "../contexts/AuthContext";
import { PlannerHeader } from "./planner/PlannerHeader";
import { UserSelectModal } from "./planner/UserSelectModal";
import { ActivityApplicationModal } from "./planner/ActivityApplicationModal";
import { ActivityReportModal } from "./planner/ActivityReportModal";
import { PsychopedagogyCycleView } from "./planner/PsychopedagogyCycleView";
import { PsychologyAllianceView } from "./planner/PsychologyAllianceView";

interface AccessibleActivityPlannerProps {
  isDark?: boolean;
}

export const AccessibleActivityPlanner: React.FC<AccessibleActivityPlannerProps> = ({ isDark = true }) => {
  const { user, canonicalUserId, userProfile } = useAuth();
  const professionalId = canonicalUserId || user?.id || "00000000-0000-4000-8000-000000000001";
  const professionalName = userProfile?.preferredName || (user?.email ? user.email.split("@")[0] : "Equipe NeuroConecta");

  // 1. Estado Principal do Usuário Vinculado e Modo
  const [plannerMode, setPlannerMode] = useState<PlannerMode>("escolar");
  const [assistedUsers, setAssistedUsers] = useState<AssistedUserSummary[]>([]);
  const [selectedUser, setSelectedUser] = useState<AssistedUserSummary | null>(null);

  // Modais
  const [isUserSelectModalOpen, setIsUserSelectModalOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activityToApply, setActivityToApply] = useState<PlannedActivity | null>(null);
  const [activityForReport, setActivityForReport] = useState<PlannedActivity | null>(null);

  // Aba Ativa Principal
  const [activeTab, setActiveTab] = useState<"editor" | "banco" | "psicopedagogia" | "psicologia" | "historico">("editor");

  // Lista de Atividades e Aplicações
  const [activities, setActivities] = useState<PlannedActivity[]>([]);
  const [applicationRecords, setApplicationRecords] = useState<ActivityApplicationRecord[]>([]);
  const [currentPsychopedagogyPlan, setCurrentPsychopedagogyPlan] = useState<PsychopedagogyPlan | null>(null);
  const [currentPsychologyProcess, setCurrentPsychologyProcess] = useState<PsychologyTherapeuticProcess | null>(null);

  // 2. Estado do Formulário do Planejador Inteligente
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [activityTitle, setActivityTitle] = useState("Ciclo da Água e Estados Físicos");
  const [pedagogicalGoal, setPedagogicalGoal] = useState("Compreender as etapas do ciclo da água (evaporação, condensação e precipitação)");
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>(["Ciências da Natureza"]);
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>(["Compreensão e Interpretação Textual"]);
  const [gradeLevel, setGradeLevel] = useState("5º Ano do Ensino Fundamental");
  const [durationMinutes, setDurationMinutes] = useState(50);
  const [studentInterests, setStudentInterests] = useState("Jogos de construção (Minecraft), música rítmica e mapas territoriais");
  const [availableResources, setAvailableResources] = useState("Quadro branco, cartolinas, canetas coloridas, copos com água e projetor");
  const [desiredParticipation, setDesiredParticipation] = useState("Produção em duplas ou individual, com opção de desenho esquemático ou colagem");
  const [observableNeeds, setObservableNeeds] = useState("Sensibilidade a ruído da sala, preferência por instruções visuais passo a passo, cansaço em cópias longas");

  // Campos DUA e Planejamento
  const [directInstruction, setDirectInstruction] = useState(
    "Hoje vamos explorar o Ciclo da Água. Você poderá demonstrar o que entendeu escolhendo o caminho que melhor expressa seu pensamento: texto, mapa visual, tirinha, gravação em áudio ou cartões móveis."
  );
  const [stepByStep, setStepByStep] = useState<string[]>([
    "Etapa 1 (5 min): Previsibilidade — Apresentar roteiro visual com as etapas da aula no canto do quadro.",
    "Etapa 2 (10 min): Apresentação Visual — Exibir o conceito central com apoio de imagens claras, sem sobrecarga de leitura.",
    "Etapa 3 (20 min): Produção Acessível — O estudante escolhe seu caminho de expressão (individualmente ou em dupla).",
    "Etapa 4 (5 min): Pausa Sensorial Suave — Momento para descompressão, esticar o corpo, beber água ou silêncio.",
    "Etapa 5 (10 min): Conclusão sem Pressão — Compartilhamento voluntário do que foi produzido (sem exigência de fala obrigatória)."
  ]);
  const [suggestedVisualSupport, setSuggestedVisualSupport] = useState<string[]>([
    "Roteiro da aula no quadro em tópicos visuais com caixas de seleção.",
    "Fichas móveis com imagens concretas ilustrando os conceitos centrais.",
    "Timer visual ou combinados de tempo prévios ('Faltam 5 minutos para a próxima etapa').",
    "Modelo de exemplo concreto já pronto para servir de consulta e diminuir a hesitação inicial."
  ]);
  const [adaptations, setAdaptations] = useState<string[]>([
    "Participação em duplas estruturadas com papéis divididos.",
    "Possibilidade de trabalhar individualmente em mesa de menor circulação.",
    "Ordenação de cartões e palavras-chave em vez de cópia manual exaustiva.",
    "Opção de entrega em áudio, HQ ou esquema visual."
  ]);
  const [environmentalAdaptations, setEnvironmentalAdaptations] = useState<string[]>([
    "Permitir fones de redução de ruído ou abafadores.",
    "Posicionar o estudante em mesa com boa visibilidade e menor tráfego.",
    "Diminuir estímulos concorrentes durante o momento de instrução coletiva.",
    "Acesso garantido a espaço calmo de autorregulação se houver fadiga sensorial."
  ]);

  // Filtros de busca no banco
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState<string>("todas");
  const [copied, setCopied] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [confirmingSaveStatus, setConfirmingSaveStatus] = useState<"DRAFT" | "READY" | null>(null);

  // Carregamento inicial de dados
  useEffect(() => {
    loadData();
  }, [selectedUser, professionalId]);

  const loadData = async () => {
    try {
      const users = await smartPlannerService.getAuthorizedAssistedUsers(professionalId);
      setAssistedUsers(users);

      const acts = await smartPlannerService.getActivities(professionalId, {
        assistedUserId: selectedUser?.id,
      });
      setActivities(acts);

      if (selectedUser) {
        const apps = await smartPlannerService.getApplicationsForStudent(selectedUser.id);
        setApplicationRecords(apps);

        const plan = await smartPlannerService.getPsychopedagogyPlan(selectedUser.id, professionalId);
        setCurrentPsychopedagogyPlan(plan);

        const proc = await smartPlannerService.getPsychologyProcess(selectedUser.id, professionalId);
        setCurrentPsychologyProcess(proc);
      } else {
        setApplicationRecords([]);
        const genericPlan = await smartPlannerService.getPsychopedagogyPlan("generic", professionalId);
        setCurrentPsychopedagogyPlan(genericPlan);
        const genericProc = await smartPlannerService.getPsychologyProcess("generic", professionalId);
        setCurrentPsychologyProcess(genericProc);
      }
    } catch (e) {
      console.error("[AccessibleActivityPlanner] Erro ao carregar dados:", e);
    }
  };

  // Alternar disciplina selecionada (múltipla escolha)
  const toggleDiscipline = (disc: string) => {
    setSelectedDisciplines((prev) =>
      prev.includes(disc) ? prev.filter((d) => d !== disc) : [...prev, disc]
    );
  };

  // Alternar processo selecionado (múltipla escolha)
  const toggleProcess = (proc: string) => {
    setSelectedProcesses((prev) =>
      prev.includes(proc) ? prev.filter((p) => p !== proc) : [...prev, proc]
    );
  };

  // Pre-sets de exemplo para agilizar o professor/terapeuta
  const applyPreset = (type: "artes" | "geografia" | "filosofia" | "ciencias" | "matematica") => {
    if (type === "artes") {
      setActivityTitle("Paisagens Sonoras e Expressão Corporal");
      setPedagogicalGoal("Identificar timbres, dinâmicas sonoras e expressar emoções por meio da criação musical e do movimento");
      setSelectedDisciplines(["Artes (Visuais, Música, Dança, Teatro)"]);
      setSelectedProcesses(["Percepção Visuoespacial", "Coordenação Visomotora"]);
      setGradeLevel("Ensino Fundamental / Atendimento Multiprofissional");
      setDurationMinutes(45);
      setStudentInterests("Instrumentos de percussão, ritmos regionais, desenho e sons de animais");
      setAvailableResources("Instrumentos Orff, sinos afinados, cartões visuais de intensidade, lenços e tapete sensorial");
      setDesiredParticipation("Participação rítmica conjunta, regência alternada ou exploração livre de timbres com apoio visual");
      setObservableNeeds("Sensibilidade a picos sonoros súbitos (necessidade de volume gradual), busca proprioceptiva");
      setDirectInstruction("Hoje vamos descobrir e criar os sons da natureza usando instrumentos e nosso próprio corpo no ritmo que você escolher!");
      setStepByStep([
        "Etapa 1 (5 min): Acolhimento e afinação coletiva com som suave de sino afinado.",
        "Etapa 2 (10 min): Escuta ativa — Ouvir sons gravados e apontar no cartão visual (vento, chuva, trovão).",
        "Etapa 3 (15 min): Prática instrumental em duplas ou solo — Escolher um instrumento para reproduzir a intensidade indicada.",
        "Etapa 4 (5 min): Descompressão com respiração ritmada e relaxamento dos ombros.",
        "Etapa 5 (10 min): Compartilhamento espontâneo do ritmo preferido sem pressão."
      ]);
    } else if (type === "geografia") {
      setActivityTitle("Mapeamento do Nosso Território e Espaço Vivido");
      setPedagogicalGoal("Reconhecer elementos da paisagem local e construir um mapa esquemático acessível do trajeto escola-casa");
      setSelectedDisciplines(["Geografia"]);
      setSelectedProcesses(["Percepção Visuoespacial", "Compreensão e Interpretação Textual"]);
      setGradeLevel("6º Ano do Ensino Fundamental");
      setDurationMinutes(50);
      setStudentInterests("Mapas, trens, rotas de ônibus, satélites, maquetes e fotos aéreas");
      setAvailableResources("Imagens aéreas impressas, massinha de modelar, blocos de madeira, cartolina e régua com texturas");
      setDesiredParticipation("Construção em maquete tátil, desenho vetorial simplificado ou colagem com legendas visuais");
      setObservableNeeds("Sobrecarga com textos explicativos densos; alta retenção com recursos táteis e visuais tridimensionais");
      setDirectInstruction("Vamos mapear os pontos de referência do nosso caminho usando cores, texturas e maquete!");
      setStepByStep([
        "Etapa 1 (5 min): Visualizar o mapa ilustrado no projetor com os principais pontos destacados.",
        "Etapa 2 (10 min): Identificar três lugares conhecidos por onde você passa todos os dias.",
        "Etapa 3 (20 min): Montar no papel ou na maquete o percurso usando miniaturas e setas.",
        "Etapa 4 (5 min): Pausa para esticar e beber água.",
        "Etapa 5 (10 min): Apresentação oral rápida ou apontamento das escolhas no mapa."
      ]);
    } else if (type === "filosofia") {
      setActivityTitle("Comunidade de Investigação: O Que é a Justiça?");
      setPedagogicalGoal("Refletir criticamente sobre situações de cooperação e justiça a partir de dilemas éticos ilustrados");
      setSelectedDisciplines(["Filosofia"]);
      setSelectedProcesses(["Raciocínio Lógico-Matemático", "Autonomia e Autorregulação"]);
      setGradeLevel("8º Ano do Ensino Fundamental / Ensino Médio");
      setDurationMinutes(50);
      setStudentInterests("Debates, jogos com regras, dilemas de heróis em histórias em quadrinhos");
      setAvailableResources("Cartões de dilema ilustrados com situações práticas, balões de fala, quadro de argumentos");
      setDesiredParticipation("Expressão por voto com placas coloridas (Concordo / Discordo), fala voluntária ou escrita de uma frase síntese");
      setObservableNeeds("Ansiedade ao falar em público grande; participação facilitada quando há placas visuais e tempo prévio de reflexão");
      setDirectInstruction("Hoje vamos analisar uma história em que dois amigos têm necessidades diferentes. O que é mais justo?");
      setStepByStep([
        "Etapa 1 (5 min): Apresentação do dilema moral por meio de tirinha ilustrada de 3 quadrinhos.",
        "Etapa 2 (10 min): Momento individual de reflexão com auxílio de ficha de perguntas guiadas.",
        "Etapa 3 (20 min): Círculo de investigação — Cada estudante expressa sua posição pelo meio preferido (placa visual, fala ou cartão escrito).",
        "Etapa 4 (5 min): Síntese colaborativa das conclusões no quadro com mapa conceitual.",
        "Etapa 5 (10 min): Registro final de uma frase ou desenho representando 'Cuidar uns dos outros'."
      ]);
    } else if (type === "ciencias") {
      setActivityTitle("Ciclo da Água e Estados Físicos");
      setPedagogicalGoal("Compreender as etapas do ciclo da água (evaporação, condensação e precipitação)");
      setSelectedDisciplines(["Ciências da Natureza"]);
      setSelectedProcesses(["Compreensão e Interpretação Textual", "Funções Executivas (Planejamento e Organização)"]);
      setGradeLevel("5º Ano do Ensino Fundamental");
      setDurationMinutes(50);
      setStudentInterests("Jogos de construção (Minecraft), experimentos com água e desenho");
      setAvailableResources("Quadro, cartolina, canetinhas, projetor, copos descartáveis");
      setDesiredParticipation("Opção de desenho esquemático, colagem ou montagem em dupla");
      setObservableNeeds("Sensibilidade a ruídos da sala, preferência por etapas visuais, cansaço em cópias longas");
      setDirectInstruction("Hoje vamos explorar o Ciclo da Água de forma prática com experiências visuais e escolhas de produção!");
    } else {
      setActivityTitle("Sistema Monetário e Resolução Concreta de Problemas");
      setPedagogicalGoal("Resolver situações-problema de adição e subtração contextualizadas em compras cotidianas");
      setSelectedDisciplines(["Matemática"]);
      setSelectedProcesses(["Raciocínio Lógico-Matemático", "Resolução de Problemas Cotidianos"]);
      setGradeLevel("4º Ano do Ensino Fundamental");
      setDurationMinutes(45);
      setStudentInterests("Coleção de figurinhas, mercadinho e contagem concreta");
      setAvailableResources("Folhetos de supermercado, cédulas ilustrativas de mentirinha, fichas com valores");
      setDesiredParticipation("Manuseio concreto de materiais, resolução em duplas estruturadas");
      setObservableNeeds("Sobrecarga com enunciados textuais muito extensos, benefício de material manipulável concreto");
      setDirectInstruction("Vamos montar nossa feirinha e calcular o troco usando moedas e fichas concretas!");
    }
  };

  // Salvar Atividade (Dispara confirmação explícita NC-CORE-03)
  const handleSaveActivity = (status: "DRAFT" | "READY" = "READY") => {
    setConfirmingSaveStatus(status);
  };

  // Executar a gravação após a confirmação explícita de vínculo
  const executeSaveActivity = async (status: "DRAFT" | "READY" = "READY") => {
    setConfirmingSaveStatus(null);
    try {
      const activityPayload: PlannedActivity = {
        id: editingActivityId || `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        professionalUserId: professionalId,
        professionalName,
        assistedUserId: selectedUser?.id || null,
        assistedUserName: selectedUser?.displayName,
        specialty: plannerMode,
        title: activityTitle.trim() || "Atividade Pedagógica Acessível",
        objective: pedagogicalGoal.trim() || "Objetivo de aprendizagem",
        disciplines: selectedDisciplines,
        learningProcesses: selectedProcesses,
        educationStage: selectedUser?.educationStage || "fundamental_1",
        gradeLevel,
        duration: `${durationMinutes} minutos`,
        format: "dupla",
        materials: availableResources,
        instructions: directInstruction,
        stepByStep,
        visualSupport: suggestedVisualSupport,
        multiplePathways: [
          { format: "Texto Convencional", description: "Produção escrita direta ou tópicos curtos." },
          { format: "Áudio / Relato Oral", description: "Gravação de áudio ou explicação oral direta." },
          { format: "Sequência de Imagens", description: "História em quadrinhos ou tirinha ilustrada." },
          { format: "Mapa Mental / Esquema", description: "Diagrama visual com setas e conceitos-chave." },
          { format: "Manipulação Concreta", description: "Ordenação de cartões móveis ou prancha CAA." }
        ],
        challengeLevel: "intermediario",
        adaptations,
        environmentalAdaptations,
        studentInterestsBridging: studentInterests,
        professionalNotes: observableNeeds,
        status,
        version: 1,
        isTemplate: !selectedUser,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { activity: saved } = await smartPlannerService.saveActivity(activityPayload, professionalId);

      setSaveSuccessMsg(`Atividade "${saved.title}" salva com sucesso (v${saved.version})!`);
      setTimeout(() => setSaveSuccessMsg(""), 3500);

      setEditingActivityId(saved.id);
      loadData();
    } catch (err: any) {
      alert(`Erro ao salvar atividade: ${err.message}`);
    }
  };

  // Carregar atividade existente no editor
  const handleEditActivity = (act: PlannedActivity) => {
    setEditingActivityId(act.id);
    setActivityTitle(act.title);
    setPedagogicalGoal(act.objective);
    setSelectedDisciplines(act.disciplines || []);
    setSelectedProcesses(act.learningProcesses || []);
    setGradeLevel(act.gradeLevel || "");
    const parsedMinutes = parseInt(act.duration) || 45;
    setDurationMinutes(parsedMinutes);
    setDirectInstruction(act.instructions || "");
    setStepByStep(act.stepByStep || []);
    setSuggestedVisualSupport(act.visualSupport || []);
    setAdaptations(act.adaptations || []);
    setEnvironmentalAdaptations(act.environmentalAdaptations || []);
    setStudentInterests(act.studentInterestsBridging || "");
    setObservableNeeds(act.professionalNotes || "");
    setAvailableResources(act.materials || "");
    setPlannerMode(act.specialty || "escolar");
    setActiveTab("editor");
  };

  // Duplicar atividade
  const handleDuplicateActivity = async (act: PlannedActivity) => {
    await smartPlannerService.duplicateActivity(act, selectedUser, professionalId);
    loadData();
  };

  // Arquivar atividade
  const handleArchiveActivity = async (id: string) => {
    if (window.confirm("Deseja realmente arquivar esta atividade?")) {
      await smartPlannerService.archiveActivity(id, professionalId);
      loadData();
    }
  };

  // Abrir Modal de Aplicação Real
  const handleOpenApplyModal = (act: PlannedActivity) => {
    setActivityToApply(act);
    setIsAppModalOpen(true);
  };

  // Abrir Modal de Relatório
  const handleOpenReportModal = (act: PlannedActivity) => {
    setActivityForReport(act);
    setIsReportModalOpen(true);
  };

  // Ação disparada pelo Ciclo Psicopedagógico: "Planejar Atividade para este Objetivo"
  const handlePlanActivityForGoal = (goal: PsychopedagogyGoal) => {
    setActivityTitle(`Intervenção: ${goal.targetProcess} - ${goal.description.slice(0, 30)}...`);
    setPedagogicalGoal(goal.description);
    setSelectedProcesses([goal.targetProcess]);
    setDirectInstruction(`Hoje vamos praticar estratégias para fortalecer nossa habilidade em ${goal.targetProcess}: "${goal.description}".`);
    setStepByStep([
      "Etapa 1: Acolhimento e ativação de conhecimentos prévios com material visual.",
      "Etapa 2: Demonstração explícita da estratégia pelo mediador (passo a passo claro).",
      "Etapa 3: Prática guiada com suporte reduzido gradualmente.",
      "Etapa 4: Descompressão e reflexão sobre o que ajudou a superar a dificuldade.",
    ]);
    setPlannerMode("psicopedagogia");
    setActiveTab("editor");
  };

  // Ação disparada pela Aliança TCC de Psicologia
  const handlePlanForTherapeuticGoal = (goalTitle: string, goalDesc: string) => {
    setActivityTitle(`Recurso TCC: ${goalTitle}`);
    setPedagogicalGoal(goalTitle);
    setDirectInstruction(`Atividade colaborativa combinada em sessão para apoio ao objetivo terapêutico: ${goalTitle}`);
    setObservableNeeds(goalDesc);
    setPlannerMode("psicologia");
    setActiveTab("editor");
  };

  // Copiar plano gerado em texto simples
  const handleCopyText = () => {
    const text = `PROPOSTA DE ATIVIDADE PEDAGÓGICA ACESSÍVEL (DUA)
NeuroConecta • Planejamento Multiprofissional
Título: ${activityTitle}
Modo: ${plannerMode.toUpperCase()}
Aluno/Atendido: ${selectedUser ? selectedUser.displayName : "Modelo Geral / Sem Vínculo"}
Disciplinas: ${selectedDisciplines.join(", ") || "Geral"}
Habilidades/Processos: ${selectedProcesses.join(", ") || "Geral"}
Objetivo: ${pedagogicalGoal}
Instrução Direta: "${directInstruction}"

Passo a Passo Previsível:
${stepByStep.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Apoio Visual:
${suggestedVisualSupport.map((v) => `• ${v}`).join("\n")}

Adaptações e DUA:
${adaptations.map((a) => `• ${a}`).join("\n")}

Adaptações do Ambiente:
${environmentalAdaptations.map((e) => `• ${e}`).join("\n")}

AVISO ÉTICO: O professor não diagnostica nem medica. As adaptações são direitos pedagógicos fundamentais.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Filtragem de atividades no banco
  const filteredActivities = activities.filter((act) => {
    const matchesQuery = 
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.disciplines.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSpecialty = filterSpecialty === "todas" || act.specialty === filterSpecialty;
    return matchesQuery && matchesSpecialty;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Header com Seletor de Modo Profissional e Usuário Vinculado */}
      <PlannerHeader
        selectedUser={selectedUser}
        onOpenSelectUserModal={() => setIsUserSelectModalOpen(true)}
        plannerMode={plannerMode}
        onSelectPlannerMode={(mode) => setPlannerMode(mode)}
        isDark={isDark}
      />

      {/* 2. Barra de Navegação das Abas Centrais */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("editor")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
              activeTab === "editor"
                ? "bg-teal-600 text-white border-teal-500 shadow-md"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Editor Inteligente DUA</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("banco")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
              activeTab === "banco"
                ? "bg-teal-600 text-white border-teal-500 shadow-md"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Banco de Atividades ({activities.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("psicopedagogia")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
              activeTab === "psicopedagogia"
                ? "bg-amber-600 text-white border-amber-500 shadow-md"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-amber-400" />
            <span>Ciclo Psicopedagógico</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("psicologia")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
              activeTab === "psicologia"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-indigo-400" />
            <span>Aliança Terapêutica (TCC)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("historico")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
              activeTab === "historico"
                ? "bg-teal-600 text-white border-teal-500 shadow-md"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Memória de Aplicações ({applicationRecords.length})</span>
          </button>
        </div>

        {/* Mensagem de sucesso ao salvar */}
        {saveSuccessMsg && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-semibold rounded-xl animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: EDITOR INTELIGENTE DUA & MULTIDISCIPLINAR                          */}
      {/* ========================================================================= */}
      {activeTab === "editor" && (
        <div className="space-y-6">
          {/* Banner de Não Diagnóstico */}
          <div className="p-4 rounded-2xl border bg-teal-950/30 border-teal-800/60 text-teal-200 flex items-start gap-3 text-xs leading-relaxed">
            <Lightbulb className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block font-bold">Princípio Fundamental: O Professor não Diagnostica — Acessibiliza!</strong>
              <p className="text-teal-300/80">
                O planejamento inclusivo organiza o ensino através de múltiplos caminhos de entrada e de expressão (DUA). 
                Não é exigido diagnóstico formal para assegurar a acessibilidade, adaptações sensoriais e tempos diferenciados.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Formulário de Parâmetros e Componentes */}
            <div className="lg:col-span-5 p-5 sm:p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-400" />
                    <span>Dados do Planejamento</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {selectedUser ? `Personalizando para ${selectedUser.displayName}` : "Atividade Geral / Sem vínculo"}
                  </p>
                </div>

                {/* Presets Rápidos com Artes, Geografia, Filosofia */}
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    onClick={() => applyPreset("artes")}
                    className="px-2 py-1 bg-pink-950/70 hover:bg-pink-900 border border-pink-800 text-[10px] font-bold text-pink-300 rounded-lg transition"
                    title="Artes (Música, Dança, Visuais, Teatro)"
                  >
                    Artes
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("geografia")}
                    className="px-2 py-1 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 text-[10px] font-bold text-emerald-300 rounded-lg transition"
                    title="Geografia"
                  >
                    Geografia
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("filosofia")}
                    className="px-2 py-1 bg-purple-950/70 hover:bg-purple-900 border border-purple-800 text-[10px] font-bold text-purple-300 rounded-lg transition"
                    title="Filosofia"
                  >
                    Filosofia
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("ciencias")}
                    className="px-2 py-1 bg-teal-950/70 hover:bg-teal-900 border border-teal-800 text-[10px] font-bold text-teal-300 rounded-lg transition"
                    title="Ciências"
                  >
                    Ciências
                  </button>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                {/* Título da Atividade */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Título da Atividade / Proposta:</label>
                  <input
                    type="text"
                    value={activityTitle}
                    onChange={(e) => setActivityTitle(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500 font-semibold"
                  />
                </div>

                {/* Objetivo Pedagógico */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Objetivo Pedagógico / Intencionalidade:</label>
                  <textarea
                    rows={2}
                    value={pedagogicalGoal}
                    onChange={(e) => setPedagogicalGoal(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* SELETOR DE DISCIPLINAS (COM ARTES, GEOGRAFIA, FILOSOFIA) - MÚLTIPLA ESCOLHA */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-300">
                      Componentes Curriculares (Interdisciplinar):
                    </label>
                    <span className="text-[10px] text-teal-400 font-semibold">
                      {selectedDisciplines.length} selecionada(s)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-xl">
                    {STANDARD_DISCIPLINES.map((disc) => {
                      const isSel = selectedDisciplines.includes(disc);
                      return (
                        <button
                          key={disc}
                          type="button"
                          onClick={() => toggleDiscipline(disc)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition border ${
                            isSel
                              ? "bg-teal-900 border-teal-500 text-teal-200"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {isSel ? "✓ " : "+ "}
                          {disc}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* PROCESSOS E HABILIDADES DE APRENDIZAGEM */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-300">
                      Processos Cognitivos & Habilidades Foco:
                    </label>
                    <span className="text-[10px] text-amber-400 font-semibold">
                      {selectedProcesses.length} selecionada(s)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-xl">
                    {PSYCHOPEDAGOGY_PROCESSES.map((proc) => {
                      const isSel = selectedProcesses.includes(proc);
                      return (
                        <button
                          key={proc}
                          type="button"
                          onClick={() => toggleProcess(proc)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition border ${
                            isSel
                              ? "bg-amber-950 border-amber-500 text-amber-200"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {isSel ? "✓ " : "+ "}
                          {proc}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ano e Duração */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Ano / Nível / Turma:</label>
                    <input
                      type="text"
                      value={gradeLevel}
                      onChange={(e) => setGradeLevel(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Duração Estimada (min):</label>
                    <input
                      type="number"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                {/* Interesses e Contexto */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Interesses & Contexto Significativo (Engajadores):
                  </label>
                  <input
                    type="text"
                    value={studentInterests}
                    onChange={(e) => setStudentInterests(e.target.value)}
                    placeholder="Ex: Música, percussão, Minecraft, trens, mapas, arte..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Recursos Disponíveis */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Recursos Disponíveis:</label>
                  <input
                    type="text"
                    value={availableResources}
                    onChange={(e) => setAvailableResources(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Necessidades Observáveis */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Necessidades Observáveis:</label>
                  <textarea
                    rows={2}
                    value={observableNeeds}
                    onChange={(e) => setObservableNeeds(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Botões de Ação do Formulário */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveActivity("READY")}
                    className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg transition"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Salvar Atividade Pronta</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveActivity("DRAFT")}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition border border-slate-700"
                    >
                      Salvar como Rascunho
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSaveActivity("READY");
                        if (editingActivityId) {
                          const act = activities.find((a) => a.id === editingActivityId);
                          if (act) handleOpenApplyModal(act);
                        }
                      }}
                      className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Salvar e Registrar Aplicação</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Visualizador da Proposta Acessível Gerada / Editada */}
            <div className="lg:col-span-7 p-5 sm:p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-sm flex flex-col justify-between">
              {/* Topo da Proposta com Ações */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-teal-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{activityTitle || "Nova Proposta Acessível"}</span>
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="capitalize">{plannerMode}</span>
                    <span>•</span>
                    <span>{selectedDisciplines.join(", ") || "Geral"}</span>
                    <span>•</span>
                    <span>{durationMinutes} min</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copiado!" : "Copiar"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const tempAct: PlannedActivity = {
                        id: editingActivityId || "temp",
                        professionalUserId: professionalId,
                        professionalName,
                        specialty: plannerMode,
                        title: activityTitle,
                        objective: pedagogicalGoal,
                        disciplines: selectedDisciplines,
                        learningProcesses: selectedProcesses,
                        assistedUserId: selectedUser?.id || null,
                        assistedUserName: selectedUser?.displayName,
                        educationStage: selectedUser?.educationStage || "fundamental_1",
                        gradeLevel,
                        duration: `${durationMinutes} minutos`,
                        format: "dupla",
                        materials: availableResources,
                        instructions: directInstruction,
                        stepByStep,
                        visualSupport: suggestedVisualSupport,
                        multiplePathways: [
                          { format: "Texto Convencional", description: "Produção escrita direta ou tópicos curtos." },
                          { format: "Áudio / Relato Oral", description: "Gravação de áudio ou explicação oral direta." },
                          { format: "Sequência de Imagens", description: "História em quadrinhos ou tirinha ilustrada." },
                          { format: "Mapa Mental / Esquema", description: "Diagrama visual com setas e conceitos-chave." },
                          { format: "Manipulação Concreta", description: "Ordenação de cartões móveis ou prancha CAA." }
                        ],
                        challengeLevel: "intermediario",
                        adaptations,
                        environmentalAdaptations,
                        studentInterestsBridging: studentInterests,
                        professionalNotes: observableNeeds,
                        status: "READY",
                        version: 1,
                        isTemplate: !selectedUser,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      };
                      handleOpenReportModal(tempAct);
                    }}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Relatório / PDF</span>
                  </button>
                </div>
              </div>

              {/* Seções Estruturadas do DUA */}
              <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1 text-xs">
                {/* 1. Instrução Principal em Linguagem Direta */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                  <strong className="text-teal-400 block uppercase tracking-wider text-[10px]">
                    1. Instrução Principal Direta e Previsível
                  </strong>
                  <textarea
                    rows={2}
                    value={directInstruction}
                    onChange={(e) => setDirectInstruction(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500 italic text-xs"
                  />
                </div>

                {/* 2. Passo a Passo Fracionado */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                  <strong className="text-amber-400 block uppercase tracking-wider text-[10px]">
                    2. Roteiro Fracionado em Passos Curtos
                  </strong>
                  <div className="space-y-1.5">
                    {stepByStep.map((st, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-2">
                        <span className="text-slate-300 leading-snug">{st}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Apoio Visual Sugerido */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                  <strong className="text-cyan-400 block uppercase tracking-wider text-[10px]">
                    3. Apoio Visual & Previsibilidade para a Sala
                  </strong>
                  <ul className="space-y-1 text-slate-300">
                    {suggestedVisualSupport.map((vis, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Eye className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{vis}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 4. Mesmo Objetivo, Diferentes Caminhos (DUA) */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-amber-400 block uppercase tracking-wider text-[10px]">
                      4. Mesmo Objetivo, Múltiplas Vias de Expressão
                    </strong>
                    <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                      Princípio do DUA
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {[
                      { title: "Texto Convencional ou Tópicos", desc: "Produção escrita direta ou preenchimento de palavras-chave estruturadas." },
                      { title: "Áudio Gravado ou Relato Oral", desc: "Explicação em fala natural gravada ou diálogo direto com o mediador." },
                      { title: "Sequência de Imagens ou HQ", desc: "Desenho esquemático em vinhetas com situações práticas do conceito." },
                      { title: "Mapa Mental ou Esquema", desc: "Diagrama visual com setas, cores e conceitos-chave interligados." },
                      { title: "Manipulação Concreta / CAA", desc: "Uso de pranchas de comunicação aumentativa ou cartões móveis." },
                      { title: "Expressão Corporal / Ritmo", desc: "Demonstração gestual, percussão ou teatro mudo sem exigência de escrita." }
                    ].map((pw, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-0.5">
                        <span className="text-[11px] font-bold text-teal-300 block">{pw.title}</span>
                        <p className="text-[10px] text-slate-400">{pw.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Adaptações do Ambiente & Boas Práticas */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                  <strong className="text-purple-400 block uppercase tracking-wider text-[10px]">
                    5. Adaptações do Ambiente & Manejo Sensorial
                  </strong>
                  <ul className="space-y-1 text-slate-300">
                    {environmentalAdaptations.map((env, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-purple-400 font-bold">•</span>
                        <span>{env}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: BANCO DE ATIVIDADES PLANEJADAS                                     */}
      {/* ========================================================================= */}
      {activeTab === "banco" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 border border-slate-800 rounded-2xl">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, disciplina (ex: Artes, Geografia, Filosofia) ou objetivo..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="todas">Todas as Especialidades</option>
                <option value="escolar">Escolar</option>
                <option value="psicopedagogia">Psicopedagógico</option>
                <option value="psicologia">Psicologia (TCC)</option>
                <option value="aee">AEE / Especial</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setEditingActivityId(null);
                  setActivityTitle("");
                  setPedagogicalGoal("");
                  setActiveTab("editor");
                }}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Atividade</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActivities.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl space-y-2">
                <BookOpen className="w-8 h-8 text-slate-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">Nenhuma atividade encontrada</h4>
                <p className="text-xs text-slate-500">
                  Crie novas propostas ou ajuste os filtros de busca acima.
                </p>
              </div>
            ) : (
              filteredActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl space-y-3 transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-teal-300 text-[10px] font-bold uppercase">
                        {act.specialty}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-semibold">v{act.version}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          act.status === "APPLIED"
                            ? "bg-emerald-950 border border-emerald-800 text-emerald-300"
                            : act.status === "READY"
                            ? "bg-teal-950 border border-teal-800 text-teal-300"
                            : "bg-slate-800 text-slate-400"
                        }`}>
                          {act.status}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100 line-clamp-1">{act.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{act.objective}</p>

                    {act.disciplines && act.disciplines.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {act.disciplines.map((d, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-slate-950 rounded text-[10px] text-slate-300 border border-slate-800">
                            {d}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/60">
                      <span>{act.assistedUserName || "Sem vínculo direto"}</span>
                      <span>Duração: {act.duration}</span>
                    </div>
                  </div>

                  {/* Ações da Atividade */}
                  <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleOpenApplyModal(act)}
                      className="py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 col-span-2 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Aplicar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEditActivity(act)}
                      className="py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[11px] font-semibold transition flex items-center justify-center"
                      title="Editar Atividade"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenReportModal(act)}
                      className="py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl text-[11px] font-semibold transition flex items-center justify-center"
                      title="Emitir Relatório"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: CICLO PSICOPEDAGÓGICO INTEGRADO                                   */}
      {/* ========================================================================= */}
      {activeTab === "psicopedagogia" && currentPsychopedagogyPlan && (
        <PsychopedagogyCycleView
          plan={currentPsychopedagogyPlan}
          selectedUser={selectedUser}
          onSavePlan={async (updatedPlan) => {
            await smartPlannerService.savePsychopedagogyPlan(updatedPlan, professionalId);
            setCurrentPsychopedagogyPlan(updatedPlan);
          }}
          onPlanActivityForGoal={handlePlanActivityForGoal}
          isDark={isDark}
        />
      )}

      {/* ========================================================================= */}
      {/* ABA 4: ALIANÇA TERAPÊUTICA (TCC)                                         */}
      {/* ========================================================================= */}
      {activeTab === "psicologia" && currentPsychologyProcess && (
        <PsychologyAllianceView
          process={currentPsychologyProcess}
          selectedUser={selectedUser}
          onSaveProcess={async (updatedProc) => {
            await smartPlannerService.savePsychologyProcess(updatedProc, professionalId);
            setCurrentPsychologyProcess(updatedProc);
          }}
          onPlanActivityForGoal={handlePlanForTherapeuticGoal}
          isDark={isDark}
        />
      )}

      {/* ========================================================================= */}
      {/* ABA 5: HISTÓRICO E MEMÓRIA DE APLICAÇÕES                                 */}
      {/* ========================================================================= */}
      {activeTab === "historico" && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <History className="w-4 h-4 text-teal-400" />
                Registros de Aplicação Real e Memória Pedagógica
              </h4>
              <p className="text-xs text-slate-400">
                Histórico consolidado do que foi aplicado e níveis reais de apoio observados
              </p>
            </div>
            <span className="px-3 py-1 bg-slate-800 text-teal-300 text-xs font-bold rounded-xl">
              {applicationRecords.length} registro(s)
            </span>
          </div>

          <div className="space-y-3">
            {applicationRecords.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl space-y-2">
                <History className="w-8 h-8 text-slate-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">Nenhum registro de aplicação ainda</h4>
                <p className="text-xs text-slate-500">
                  Aplique uma atividade do seu banco para registrar o nível de apoio e o que funcionou.
                </p>
              </div>
            ) : (
              applicationRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500">{rec.appliedDate} • {rec.actualDurationMinutes} min</span>
                      <h4 className="text-sm font-bold text-slate-100">{rec.activityTitle}</h4>
                      <p className="text-xs text-slate-400">
                        Atendido: <strong className="text-teal-300">{rec.assistedUserName}</strong> • Aplicador: {rec.professionalName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 text-xs font-semibold">
                        Apoio: <strong className="text-teal-400 uppercase">{rec.supportLevel.replace("_", " ")}</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-teal-950 border border-teal-800 text-teal-300 text-xs font-bold">
                        Engajamento {rec.engagementScore}/5
                      </span>
                    </div>
                  </div>

                  {rec.strategiesWorked && rec.strategiesWorked.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Estratégias que Ajudaram:</span>
                      <div className="flex flex-wrap gap-1">
                        {rec.strategiesWorked.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-950 text-teal-300 text-[11px] border border-slate-800">
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {rec.observations && (
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300">
                      <strong>Observações do Profissional:</strong> "{rec.observations}"
                    </div>
                  )}

                  {rec.learnerFeedback && (
                    <div className="text-xs text-slate-400 italic">
                      Feedback do Aprendente: {rec.learnerFeedback.likedScore ? `(Gostou: ${rec.learnerFeedback.likedScore}) ` : ""}
                      {rec.learnerFeedback.whatHelped ? `O que ajudou: "${rec.learnerFeedback.whatHelped}" ` : ""}
                      {rec.learnerFeedback.whatWasHard ? `Dificuldade: "${rec.learnerFeedback.whatWasHard}"` : ""}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAIS DO ECOSSISTEMA                                                     */}
      {/* ========================================================================= */}
      {/* Modal de Seleção de Usuário (Pinçar Usuário) */}
      <UserSelectModal
        isOpen={isUserSelectModalOpen}
        onClose={() => setIsUserSelectModalOpen(false)}
        assistedUsers={assistedUsers}
        selectedUserId={selectedUser?.id || null}
        onSelectUser={(user) => {
          setSelectedUser(user);
          setIsUserSelectModalOpen(false);
        }}
        onAddNewUser={async (newUserParams) => {
          const linkedUser = await smartPlannerService.linkAssistedUser(professionalId, newUserParams);
          setSelectedUser(linkedUser);
          setIsUserSelectModalOpen(false);
          await loadData();
        }}
        isDark={isDark}
      />

      {/* Modal de Aplicação Real de Atividade */}
      {activityToApply && (
        <ActivityApplicationModal
          isOpen={isAppModalOpen}
          onClose={() => {
            setIsAppModalOpen(false);
            setActivityToApply(null);
          }}
          activity={activityToApply}
          onSaveApplication={async (data) => {
            await smartPlannerService.recordApplication({
              activityId: activityToApply.id,
              activityVersion: activityToApply.version,
              activityTitle: activityToApply.title,
              professionalUserId: professionalId,
              professionalName,
              assistedUserId: activityToApply.assistedUserId || selectedUser?.id || "user-general",
              assistedUserName: activityToApply.assistedUserName || selectedUser?.displayName || "Aprendente",
              appliedDate: data.appliedDate,
              wasCompleted: data.wasCompleted,
              actualDurationMinutes: data.actualDurationMinutes,
              supportLevel: data.supportLevel,
              engagementScore: data.engagementScore,
              strategiesWorked: data.strategiesWorked,
              difficultiesObserved: data.difficultiesObserved,
              adaptationsMade: data.adaptationsMade,
              learnerFeedback: data.learnerFeedback,
              observations: data.observations,
              nextSteps: data.nextSteps,
            }, professionalId);

            setIsAppModalOpen(false);
            setActivityToApply(null);
            loadData();
          }}
          isDark={isDark}
        />
      )}

      {/* Modal de Relatório Estruturado da Atividade */}
      {activityForReport && (
        <ActivityReportModal
          isOpen={isReportModalOpen}
          onClose={() => {
            setIsReportModalOpen(false);
            setActivityForReport(null);
          }}
          activity={activityForReport}
          applications={applicationRecords.filter((a) => a.activityId === activityForReport.id)}
          assistedUser={selectedUser}
          isDark={isDark}
        />
      )}

      {/* Modal de Confirmação Explícita de Vínculo e Governança (NC-CORE-03) */}
      {confirmingSaveStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 space-y-4 ${
              isDark ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                  Governança & Confirmação Explícita
                </span>
                <h3 className="text-base font-bold">Associação do Planejamento</h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                  PLANEJANDO PARA:
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <strong className="text-sm text-teal-300">
                    {selectedUser ? selectedUser.displayName : "Modelo Geral / Biblioteca (Sem Vínculo Específico)"}
                  </strong>
                </div>
                {selectedUser && (
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Etapa: {selectedUser.gradeLevel || "Não informada"} • Relação: {selectedUser.relationshipType}
                  </p>
                )}
              </div>

              <div className="border-t border-slate-800/80 pt-2">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                  CONTEXTO / DOMÍNIO:
                </span>
                <strong className="text-xs text-slate-200">
                  {plannerMode === "escolar"
                    ? "Educação Escolar (Aluno/Estudante)"
                    : plannerMode === "psicopedagogia"
                    ? "Ciclo Psicopedagógico (Aprendente)"
                    : "Aliança Psicológica / TCC (Paciente)"}
                </strong>
              </div>

              <div className="p-3 bg-teal-950/40 border border-teal-800/50 rounded-xl text-xs text-teal-200 space-y-1">
                <p className="font-semibold">
                  Este registro será associado a: <u>{selectedUser ? selectedUser.displayName : "Modelo Geral"}</u> no contexto: <u>{plannerMode.toUpperCase()}</u>.
                </p>
                <p className="text-[11px] text-slate-400">
                  {editingActivityId
                    ? "A alteração preservará o histórico com rastreabilidade canônica no banco de dados."
                    : "Uma nova atividade auditable será gravada no seu espaço profissional."}
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmingSaveStatus(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                Cancelar / Revisar
              </button>
              <button
                type="button"
                onClick={() => executeSaveActivity(confirmingSaveStatus)}
                className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Gravação</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
