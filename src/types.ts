export type DiagnosisStatus = 
  | "autodiagnosticado" 
  | "investigacao" 
  | "laudo_formal" 
  | "familiar_apoiador" 
  | "necessidades_sensoriais_comunicacao"
  | "sem_diagnostico"
  | "nao_informado";

export type FocusArea = 
  | "rotina" 
  | "testes" 
  | "sensorial" 
  | "comunicacao" 
  | "crise" 
  | "aprendizado"
  | "geral";

export type SupportLevel = 1 | 2 | 3 | "nao_especificado";

export type UserRole = 
  | "pcd" 
  | "cuidador_familiar" 
  | "cuidador_educador" 
  | "educador_aee" 
  | "profissional_apoio" 
  | "saude_caps" 
  | "rh_gestor" 
  | "superadmin";

export type ProfessionalRoleType = "educador" | "terapeuta" | "psicologo" | "medico" | "enfermeiro" | "perito" | "rh" | "pcd";

export interface UserProfile {
  id?: string;
  email?: string;
  preferredName: string;
  pronouns: string;
  birthDate?: string; // YYYY-MM-DD
  userRole?: UserRole;
  professionalRoleType?: ProfessionalRoleType;
  professionalRegisterNumber?: string; // e.g. CRM/SP 123456, COREN/RJ 654321, CRA/BR 98765, MEC/PE 45678, CIPTEA 001/2026
  diagnosisStatus: DiagnosisStatus;
  supportLevel?: SupportLevel;
  currentFocus: FocusArea;
  emergencyContacts: {
    name: string;
    phone: string;
    relationship: string;
  }[];
  lowStimulationMode: boolean;
  caregiverMode?: boolean;
  notificationsEnabled?: boolean;
  onboardingCompleted: boolean;
  createdAt?: string;
  isGuest?: boolean;
  isSuperAdmin?: boolean;
  hiddenModules?: string[];
}

export function calculateAge(birthDateString?: string): number | null {
  if (!birthDateString) return null;
  const birth = new Date(birthDateString);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age < 0 ? 0 : age;
}

export function getAgeCategory(birthDateString?: string): "Criança / Adolescente (Menor de 18 anos)" | "Adulto (18+ anos)" | "Idade Não Informada" {
  const age = calculateAge(birthDateString);
  if (age === null) return "Idade Não Informada";
  return age < 18 ? "Criança / Adolescente (Menor de 18 anos)" : "Adulto (18+ anos)";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Question {
  id: number;
  text: string;
  category?: string; // Sub-domain / sub-scale name e.g. "Relacionamento Social", "Talento", "Linguagem"
  options: {
    label: string;
    score: number;
  }[];
}

export interface TestDefinition {
  id: string; // "raads-r" | "aq50" | "aspie-quiz" | "aq10" | "sqeq" | "sensory" | "burnout" | "catq"
  title: string;
  shortDescription: string;
  fullDescription: string;
  validatedClinically: boolean;
  validationReference?: string;
  usageType: "Triagem Clínica Adultos" | "Triagem Geral" | "Triagem Rápida" | "Reflexão Pessoal Online";
  estimatedMinutes: number;
  questionsCount: number;
  domains?: string[];
  questions: Question[];
  interpretResult: (score: number, domainScores?: Record<string, { scored: number; max: number }>) => {
    level: string;
    technicalReview: string; // Resenha técnica em prosa contínua e denso referencial psicométrico sem marcadores
    recommendation: string;
    aspieScore?: number;
    neurotypicalScore?: number;
  };
}

export interface SavedTestResult {
  id: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  testId: string;
  testTitle: string;
  score: number;
  maxScore: number;
  date: string;
  interpretationLevel: string;
  technicalReview: string; // Resenha técnica densa em texto único sem marcadores
  recommendation: string;
  clinicalStatus?: string;
  domainScores?: Record<string, { scored: number; max: number }>;
  validatedClinically?: boolean;
  validationReference?: string;
}

export interface RoutineTask {
  id: string;
  timeSlot: "manha" | "tarde" | "noite";
  title: string;
  description?: string;
  completed: boolean;
  estimatedMinutes: number;
  iconName?: string;
  category: "trabalho" | "autocuidado" | "refeicao" | "pausa_sensorial" | "lazer" | "estudo";
  steps?: string[];
  imageUrl?: string;
  reminderTime?: string;
}

export interface SensoryTrigger {
  id: string;
  sense: "audicao" | "visao" | "tato" | "olfato_paladar" | "propriocepcao";
  trigger: string;
  impactLevel: 1 | 2 | 3 | 4 | 5;
  copingStrategy: string;
  notes?: string;
}

export interface MoodLogEntry {
  id: string;
  date: string;
  time?: string;
  mood?: "excelente" | "calmo" | "neutro" | "sobrecarregado" | "exausto";
  energyLevel?: number; // 1 to 5
  sensoryLevel?: number; // 1 to 5 (1 = tranquilo, 5 = sobrecarga)
  notes?: string;
  triggers?: string[];
  privacyLevel?: "private" | "shared_caregivers" | "shared_school";
  // Novas propriedades do Lote 1 para autoria, contexto e isolamento
  subjectId?: string;
  entryType?: "personal" | "caregiver_observation" | "school_note";
  authorId?: string;
  authorName?: string;
  authorRole?: string;
  contextTag?: "vitoria" | "rotina" | "gatilho" | "comunicacao" | "geral" | "sala_de_aula" | "intervalo";
  createdAt?: string;
}

export type ExtendedMoodLogEntry = MoodLogEntry;

// --- LOTE 1: ARQUITETURA PESSOA • FAMÍLIA • ESCOLA ---

export type ShareContext = "familia_cuidador" | "escola_educador" | "geral";

export type ShareResourceType = 
  | "plano_funcional" 
  | "estrategias_comunicacao" 
  | "rotina_escolar" 
  | "necessidades_sensoriais" 
  | "observacoes_cuidador"
  | "diario_pessoal"; // Estritamente opcional com consentimento explícito, bloqueado por padrão

export type SharePermission = "VIEW" | "CONTRIBUTE" | "EDIT";

export interface ShareGrant {
  id: string;
  subjectId: string; // ID da pessoa no centro
  subjectName?: string;
  grantedBy: string; // ID do titular/responsável que concedeu
  grantedToName: string; // Nome da pessoa ou entidade (ex: "Escola Municipal", "Profª Renata - AEE", "Pai / Cuidador")
  grantedToId?: string;
  relationship: "mae_pai_responsavel" | "cuidador" | "professor_aee" | "escola" | "outro";
  context: ShareContext;
  resourceType: ShareResourceType;
  permission: SharePermission;
  status: "active" | "revoked";
  createdAt: string;
  updatedAt: string;
  revokedAt?: string;
  description?: string;
}

export interface SensoryCheckinRecord {
  id: string;
  subjectId: string;
  authorId: string;
  authorName: string;
  date: string;
  time: string;
  energyLevel: number; // 1-5
  sensoryOverloadLevel: number; // 1-5
  notes?: string;
  activeSensoryTags: string[]; // ruído, luz, toque, textura, aglomeração, etc.
  groundingUsed?: boolean;
  breathingUsed?: boolean;
  audioUsed?: boolean;
  createdAt: string;
}

export interface FunctionalSupportPlan {
  id: string;
  subjectId: string;
  subjectName?: string;
  version: number;
  updatedAt: string;
  updatedBy: string;
  communicationPreferences: string[];
  sensoryOverloadSigns: string[];
  helpfulStrategies: string[];
  whatToAvoid: string[];
  transitionAlerts: string;
  breakRequestProtocol: string;
  schoolAccommodationsAgreed: string[];
  authorizedSupportContacts: { name: string; phone: string; role: string }[];
}

export interface PeiDraftVersion {
  id: string;
  subjectId: string;
  version: number;
  createdAt: string;
  createdBy: string;
  creatorRole: string;
  studentName: string;
  schoolName: string;
  grade: string;
  specialistName: string;
  functionalNeeds: string;
  sensoryAccommodations: string[];
  curricularAccommodations: string[];
  pedagogicalGoals: string;
  status: "minuta_rascunho" | "em_revisao_equipe" | "aprovado_com_familia";
  reviewNotes?: string;
}

export type SchoolFamilyNoteType = 
  | "SCHOOL_NOTE"
  | "FAMILY_NOTE"
  | "ROUTINE_UPDATE"
  | "ACCOMMODATION_REQUEST"
  | "ACCOMMODATION_FEEDBACK"
  | "SUPPORT_STRATEGY"
  | "MEETING_NOTE";

export interface SchoolFamilyMessage {
  id: string;
  subjectId: string;
  authorId: string;
  authorName: string;
  authorContext: "escola" | "familia";
  type: SchoolFamilyNoteType;
  title: string;
  content: string;
  date: string;
  time: string;
  readByOtherContext: boolean;
  createdAt: string;
}

export interface CaregiverGuideItem {
  id: string;
  situation: string;
  category: "meltdown_shutdown" | "comunicacao" | "rotina_sensorial" | "escola_trabalho";
  levelTarget: "Todos" | "Nível 1" | "Nível 2" | "Nível 3";
  whatToDo: string[];
  whatToAvoid: string[];
  phrasesToUse: string[];
}

export type SupportContext = 
  | "meu_apoio" 
  | "educacao" 
  | "familia_cuidado" 
  | "comunicacao_acessibilidade" 
  | "organizacao_rotina" 
  | "saude" 
  | "trabalho";

export interface SocialScript {
  id: string;
  title: string;
  category: "trabalho" | "saude" | "familia" | "social" | "acomodacoes" | "tdah_organizacao";
  description: string;
  scriptText: string;
  tips: string[];
  diagnosticOptionalText?: string;
}

export interface EducationArticle {
  id: string;
  term: string;
  category: "direitos" | "educacao" | "comunicacao" | "conceito" | "estrategia" | "mito";
  shortDefinition: string;
  fullExplanation: string;
  practicalTips: string[];
}

export * from "./types/musicotherapy";
export * from "./types/smartPlanner";

// -------------------------------------------------------------
// SESSÃO DE MUSICOTERAPIA - ESTRUTURA CLÍNICA AUDITÁVEL
// -------------------------------------------------------------

export type MusicTherapyGoalKey =
  | "comunicacao"
  | "interacao_social"
  | "atencao"
  | "regulacao_emocional"
  | "coordenacao_motora"
  | "imitacao"
  | "integracao_sensorial";

export type MusicTherapyInterventionKey =
  | "canto"
  | "instrumento"
  | "ritmo"
  | "improvisacao"
  | "escuta"
  | "movimento";

export type MusicTherapyResponseKey =
  | "engajamento"
  | "tolerancia_sensorial"
  | "interacao"
  | "comunicacao"
  | "autorregulacao"
  | "comportamento";

export interface MusicTherapySessionGoal {
  key: MusicTherapyGoalKey;
  label: string;
  selected: boolean;
  targetFocus: string;
  notes?: string;
}

export interface MusicTherapySessionIntervention {
  key: MusicTherapyInterventionKey;
  label: string;
  applied: boolean;
  details: string;
  techniquesUsed: string[];
  bpm?: number;
  durationMinutes: number;
}

export interface MusicTherapySessionResponse {
  key: MusicTherapyResponseKey;
  label: string;
  score: number; // 1 to 5
  descriptor: string;
  notes?: string;
}

export interface MusicTherapySession {
  id: string;
  sessionNumber: number;
  date: string; // YYYY-MM-DD
  time?: string;
  durationMinutes: number;
  patientName: string;
  patientId?: string;
  therapistName: string;
  therapistRole: string; // e.g. "Musicoterapeuta Clínico", "Terapeuta Ocupacional / MT"
  therapistRegister?: string; // UBAM / CBO / CRM / CRP
  contextSetting: "clinica" | "escola_aee" | "caps" | "domicilio" | "hospital" | "neuroconecta_sala";
  
  // 1. Objetivos Terapêuticos
  goals: Record<MusicTherapyGoalKey, MusicTherapySessionGoal>;
  
  // 2. Intervenção
  interventions: Record<MusicTherapyInterventionKey, MusicTherapySessionIntervention>;
  
  // 3. Resposta Observada
  observedResponses: Record<MusicTherapyResponseKey, MusicTherapySessionResponse>;
  
  // 4. Evolução Clínica & Auditoria Longitudinal
  evolutionSummary: string;
  interdisciplinaryAlignment?: string; // Fonoaudiologia, T.O., Psicologia, PEI
  recommendationsForFamily?: string;
  sensoryAlerts?: string;
  
  audit: {
    createdAt: string;
    createdBy: string;
    auditHash: string;
    verifiedAuditable: boolean;
    source: string;
    version: number;
  };
}

