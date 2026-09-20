// ====================================================================
// NEUROCONECTA — NC-PSI-PP-01: TIPOS DO PLANEJADOR INTELIGENTE
// MULTIPROFISSIONAL (ESCOLAR, PSICOPEDAGOGIA, PSICOLOGIA, AEE)
// ====================================================================

export type PlannerMode = "escolar" | "psicopedagogia" | "psicologia" | "aee";

export type EducationStage = 
  | "educacao_infantil"
  | "fundamental_1"
  | "fundamental_2"
  | "ensino_medio"
  | "eja"
  | "atendimento_clinico";

export type ActivityStatus = "DRAFT" | "READY" | "APPLIED" | "ARCHIVED" | "CANCELLED";

export type SupportLevelType = 
  | "INDEPENDENTE" 
  | "APOIO_LEVE" 
  | "APOIO_FREQUENTE" 
  | "APOIO_INTENSIVO";

export type ActivityFormat = 
  | "individual"
  | "dupla"
  | "pequeno_grupo"
  | "turma_toda"
  | "sessao_individual"
  | "entre_sessoes"
  | "casa"
  | "sala_recursos_aee";

export type ChallengeLevel = "introdutorio" | "intermediario" | "avancado";

// -------------------------------------------------------------
// VÍNCULO PROFISSIONAL <-> USUÁRIO ASSISTIDO
// -------------------------------------------------------------
export interface AssistedUserSummary {
  id: string; // ID canônico no Supabase (auth.users.id ou profiles.id)
  displayName: string;
  preferredName?: string;
  registrationNumber?: string; // Matrícula ou ID institucional
  birthDate?: string;
  age?: number | null;
  educationStage?: EducationStage;
  gradeLevel?: string;
  institutionName?: string;
  classGroup?: string; // Turma
  relationshipType: "aluno" | "aprendente" | "paciente" | "assistido";
  supportLevel?: 1 | 2 | 3 | "nao_especificado";
  activeGoalsCount?: number;
  knownStrengths?: string[];
  knownSensoryPreferences?: string[];
  knownEffectiveStrategies?: string[];
  lastActivityDate?: string;
}

// -------------------------------------------------------------
// COMPONENTES CURRICULARES (ESCOLAR)
// -------------------------------------------------------------
export const STANDARD_DISCIPLINES = [
  "Língua Portuguesa",
  "Matemática",
  "Ciências da Natureza",
  "História",
  "Geografia",
  "Artes (Visuais, Música, Dança, Teatro)",
  "Educação Física",
  "Língua Inglesa",
  "Filosofia",
  "Sociologia",
  "Ensino Religioso",
  "Projetos Interdisciplinares",
  "Eletivas e Trilhas",
  "Interdisciplinar",
] as const;

// -------------------------------------------------------------
// HABILIDADES E PROCESSOS DE APRENDIZAGEM (PSICOPEDAGOGIA / AEE)
// -------------------------------------------------------------
export const PSYCHOPEDAGOGY_PROCESSES = [
  "Leitura e Decodificação",
  "Compreensão e Interpretação Textual",
  "Escrita e Grafomotricidade",
  "Produção Textual Estruturada",
  "Consciência Fonológica",
  "Raciocínio Lógico-Matemático",
  "Numeracia e Conceito de Número",
  "Resolução de Problemas Cotidianos",
  "Memória de Trabalho (Auditiva e Visuoespacial)",
  "Atenção Sustentada e Seletiva",
  "Funções Executivas (Planejamento e Organização)",
  "Flexibilidade Cognitiva",
  "Autonomia e Autorregulação",
  "Estratégias de Estudo e Metacognição",
  "Sequenciação Temporal e Espacial",
  "Percepção Visuoespacial",
  "Coordenação Visomotora",
  "Motivação e Engajamento para Aprender",
] as const;

// -------------------------------------------------------------
// MODELO PRINCIPAL DA ATIVIDADE PLANEJADA
// -------------------------------------------------------------
export interface PlannedActivity {
  id: string; // UUID canônico
  professionalUserId: string; // UUID do profissional criador
  professionalName?: string;
  assistedUserId?: string | null; // UUID do usuário assistido (null se for template/biblioteca)
  assistedUserName?: string;
  specialty: PlannerMode; // escolar | psicopedagogia | psicologia | aee
  title: string;
  objective: string;
  
  // Eixos curriculares e de aprendizagem (não obrigatórios para psicologia)
  disciplines: string[]; // Ex: ["História", "Artes (Visuais, Música, Dança, Teatro)"]
  learningProcesses: string[]; // Ex: ["Compreensão e Interpretação", "Atenção Sustentada"]
  
  educationStage: EducationStage;
  gradeLevel?: string;
  duration: string;
  format: ActivityFormat;
  materials: string;
  
  // Instrução e Roteiro Acessível
  instructions: string;
  stepByStep: string[];
  visualSupport: string[];
  multiplePathways: { format: string; description: string }[];
  
  // Nível de desafio e adaptações
  challengeLevel: ChallengeLevel;
  adaptations: string[];
  environmentalAdaptations: string[];
  studentInterestsBridging?: string;
  professionalNotes?: string;
  
  // Ciclo de Vida e Versionamento
  status: ActivityStatus;
  version: number;
  parentActivityId?: string | null; // ID da versão anterior se gerada após aplicação
  copiedFromActivityId?: string | null; // ID da atividade duplicada
  isTemplate: boolean;
  tags?: string[];
  
  // Metadados e Auditoria
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
  archivedBy?: string | null;
}

// -------------------------------------------------------------
// REGISTRO DE APLICAÇÃO DA ATIVIDADE
// -------------------------------------------------------------
export interface ActivityApplicationRecord {
  id: string; // UUID
  activityId: string;
  activityVersion: number;
  activityTitle: string;
  professionalUserId: string;
  professionalName: string;
  assistedUserId: string;
  assistedUserName: string;
  appliedDate: string; // YYYY-MM-DD
  wasCompleted: boolean;
  actualDurationMinutes: number;
  
  supportLevel: SupportLevelType;
  engagementScore: number; // 1 a 5
  
  strategiesWorked: string[];
  difficultiesObserved?: string;
  adaptationsMade?: string;
  
  // Feedback participativo do aprendente (quando aplicável)
  learnerFeedback?: {
    likedScore?: "gostei_muito" | "gostei" | "mais_ou_menos" | "dificil" | "nao_gostei";
    understood?: "sim" | "mais_ou_menos" | "nao";
    whatHelped?: string;
    whatWasHard?: string;
    whatHelpWasUseful?: string;
  };
  
  observations: string;
  nextSteps?: string;
  createdAt: string;
}

// -------------------------------------------------------------
// PLANO PSICOPEDAGÓGICO E OBJETIVOS (CICLO PSICOPEDAGÓGICO)
// -------------------------------------------------------------
export interface PsychopedagogyGoal {
  id: string;
  description: string;
  targetProcess: string; // Processo de aprendizagem relacionado
  priority: "alta" | "media" | "manutencao";
  status: "ativo" | "em_progresso" | "alcancado" | "revisado";
  strategiesPlanned: string[];
  reachCriteria: string;
  reviewDate?: string;
  notes?: string;
  linkedActivitiesCount?: number;
}

export interface PsychopedagogyPlan {
  id: string;
  professionalUserId: string;
  assistedUserId: string;
  assistedUserName: string;
  demandDescription: string;
  developmentContext: string;
  strengthsObserved: string[];
  difficultiesObserved: string[];
  priorityGoals: PsychopedagogyGoal[];
  environmentalAdaptations: string[];
  indicatorsOfProgress: string[];
  status: "ativo" | "em_revisao" | "concluido";
  lastReviewDate: string;
  createdAt: string;
  updatedAt: string;
}

// -------------------------------------------------------------
// PSICOLOGIA: PROCESSO TERAPÊUTICO & ALIANÇA (FUNDAMENTAÇÃO TCC)
// -------------------------------------------------------------
export interface TherapeuticGoal {
  id: string;
  description: string;
  priority: "alta" | "media" | "baixa";
  status: "ativo" | "em_revisao" | "alcancado";
  discussedWithPatient: boolean;
  understoodByPatient: boolean;
  reviewDate?: string;
  notes?: string;
}

export interface CollaborativeSessionAgenda {
  id: string;
  sessionDate: string;
  patientPriorities: string;
  professionalPriorities: string;
  agreedAgendaTopics: string[];
  summaryNotes: string;
  nextSessionTopic?: string;
}

export interface InterSessionResource {
  id: string;
  title: string;
  resourceCategory: 
    | "psicoeducacao" 
    | "reflexao" 
    | "identificacao_pensamentos" 
    | "registro_emocoes" 
    | "resolucao_problemas" 
    | "organizacao_rotina" 
    | "habilidades_sociais" 
    | "recurso_ludico";
  description: string;
  objectiveExplanation: string;
  patientUnderstandsGoal: boolean;
  wasAgreedInSession: boolean;
  status: "proposta" | "em_andamento" | "concluida" | "revisada";
  createdAt: string;
}

export interface TherapeuticProcessCheckIn {
  id: string;
  date: string;
  feltHeardScore: 1 | 2 | 3 | 4 | 5; // 1 discorda totalmente a 5 concorda plenamente
  sessionMadeSenseScore: 1 | 2 | 3 | 4 | 5;
  understoodGoalsScore: 1 | 2 | 3 | 4 | 5;
  taskFeasibleScore: 1 | 2 | 3 | 4 | 5;
  openMessageForTherapist?: string;
  createdAt: string;
}

export interface TherapeuticRuptureAlert {
  id: string;
  date: string;
  alertType: 
    | "desacordo_objetivo" 
    | "dificuldade_tarefa" 
    | "desconforto_emocional" 
    | "critica_ao_processo" 
    | "queda_engajamento" 
    | "faltas_adiamentos" 
    | "outro";
  description: string;
  wasDiscussedInSession: boolean;
  clinicalManagementNotes: string;
  reviewInNextSession: boolean;
  status: "identificado" | "em_manejo" | "reparado";
  createdAt: string;
}

export interface PsychologyTherapeuticProcess {
  id: string;
  professionalUserId: string;
  patientUserId: string;
  patientName: string;
  startDate: string;
  therapeuticApproach: string; // Ex: Terapia Cognitivo-Comportamental
  collaborativeGoals: TherapeuticGoal[];
  sessionAgendas: CollaborativeSessionAgenda[];
  interSessionActivities: InterSessionResource[];
  processCheckIns: TherapeuticProcessCheckIn[];
  ruptureAlerts: TherapeuticRuptureAlert[];
  status: "em_andamento" | "em_pausa" | "concluido";
  updatedAt: string;
}

// -------------------------------------------------------------
// FILTROS E BUSCA DO HISTÓRICO
// -------------------------------------------------------------
export interface ActivityFilterOptions {
  searchTerm?: string;
  specialty?: PlannerMode | "todos";
  assistedUserId?: string | "todos";
  status?: ActivityStatus | "todos";
  discipline?: string | "todos";
  learningProcess?: string | "todos";
  appliedOnly?: boolean;
  isTemplateOnly?: boolean;
  dateFrom?: string;
  dateTo?: string;
}
