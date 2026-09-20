// ====================================================================
// NEUROCONECTA — NC-MT1: TIPOS DO MÓDULO CLÍNICO DE MUSICOTERAPIA
// ====================================================================

export type CaseStatus = "active" | "paused" | "completed" | "archived";

export interface MusicotherapyCase {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_birth_date?: string;
  patient_pronouns?: string;
  patient_ciptea?: string;
  patient_diagnosis_status?: string;
  professional_id: string;
  professional_name: string;
  professional_register?: string;
  start_date: string;
  status: CaseStatus;
  end_date?: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  archived_at?: string;
  archived_by?: string;
  archive_reason?: string;
  // Campos de intervenção administrativa do Superadmin (se houver correção técnica de suporte)
  administrative_intervention?: boolean;
  intervention_reason?: string;
  intervention_by?: string;
  intervention_at?: string;
}

export interface MusicotherapyIndication {
  id: string;
  case_id: string;
  patient_id: string;
  indication_date: string;
  prescriber_name: string;
  prescriber_specialty: string;
  prescriber_register: string; // CRM, CRP, etc.
  origin: "neuropediatria" | "psiquiatria" | "pediatria" | "clinica_geral" | "escola_aee" | "equipe_multidisciplinar" | "demanda_espontanea" | "outro";
  recommended_frequency: string;
  recommended_duration: string;
  mentioned_goals: string;
  notes: string;
  validity_date?: string;
  attached_document_id?: string;
  attached_document_name?: string;
  created_at: string;
  created_by: string;
}

export interface MusicotherapistQualification {
  professional_id: string;
  professional_name: string;
  degree: string;
  institution: string;
  qualification_type: "graduacao" | "pos_graduacao" | "mestrado" | "especializacao";
  completion_date: string;
  register_info: string; // Ex: CBO 2263-05 / UBAM / Associação
  administrative_notes?: string;
  supporting_document_name?: string;
  verified_at?: string; // Conferido administrativamente
  verified_by?: string;
}

export interface MusicalProfileDomain {
  preferences: string;
  significant_repertoire: string;
  genres: string;
  spontaneous_interest: string;
  singing_vocalizations: string;
  known_instruments: string;
  musical_experiences: string;
  high_engagement_activities: string;
}

export interface SensoryResponseDomain {
  auditory_sensitivity: string;
  tolerated_intensity: string;
  avoided_sounds: string;
  timbre_preferences: string;
  rhythm_perception: string;
  volume_tolerance: string;
  predictability_need: string;
  overload_signs: string;
  necessary_accommodations: string;
}

export interface CommunicationDomain {
  verbal: string;
  non_verbal: string;
  gestural: string;
  vocalization: string;
  alternative_communication: string;
  spontaneous_initiative: string;
  musical_responsiveness_to_other: string;
}

export interface SocialInteractionDomain {
  joint_attention: string;
  turn_taking: string;
  imitation: string;
  interactional_initiative: string;
  shared_activity: string;
  response_to_peer_therapist: string;
}

export interface AttentionEngagementDomain {
  task_persistence: string;
  focus_quality: string;
  sustained_interest: string;
  activity_maintenance: string;
  mediation_need: string;
}

export interface RegulationDomain {
  self_regulation: string;
  arousal_level: "hipoativado" | "regulado" | "hiperativado" | "variavel";
  transitions_tolerance: string;
  discomfort_signals: string;
  calming_resources: string;
}

export interface MotorAspectsDomain {
  motor_coordination: string;
  motor_planning_praxis: string;
  rhythmic_synchronization: string;
  instrumental_functional_use: string;
  body_movement: string;
}

export interface EmotionalAspectsDomain {
  emotional_expression: string;
  affective_response: string;
  observable_pleasure_displeasure: string;
  security_confidence: string;
}

export interface ContextDomain {
  patient_goals: string;
  family_goals: string;
  multidisciplinary_team_notes: string;
  accessibility_environmental: string;
}

export interface MusicotherapyAssessment {
  id: string;
  case_id: string;
  patient_id: string;
  patient_name: string;
  professional_id: string;
  professional_name: string;
  professional_register?: string;
  assessment_type: "initial" | "reassessment";
  date: string;
  status: "draft" | "signed" | "archived";
  version: number;
  previous_assessment_id?: string;

  musical_profile: MusicalProfileDomain;
  sensory_response: SensoryResponseDomain;
  communication: CommunicationDomain;
  social_interaction: SocialInteractionDomain;
  attention_engagement: AttentionEngagementDomain;
  regulation: RegulationDomain;
  motor_aspects: MotorAspectsDomain;
  emotional_aspects: EmotionalAspectsDomain;
  context: ContextDomain;

  objective_observations: string; // Fato Observado
  clinical_interpretation: string; // Interpretação Clínica

  signed_at?: string; // Data/hora da finalização do registro pelo profissional
  signed_by?: string; // ID do profissional autenticado que finalizou
  finalized_at?: string;
  finalized_by?: string;
  // Suporte administrativo excepcional do Superadmin
  administrative_intervention?: boolean;
  intervention_reason?: string;
  intervention_by?: string;
  intervention_at?: string;
  created_at: string;
  updated_at: string;
}

export type GoalDomainKey =
  | "comunicacao"
  | "interacao_social"
  | "atencao"
  | "autorregulacao"
  | "resposta_sensorial"
  | "aspectos_motores"
  | "cognicao"
  | "expressao_emocional"
  | "participacao"
  | "autonomia"
  | "qualidade_de_vida"
  | "outros";

export interface MusicotherapyGoal {
  id: string;
  plan_id: string;
  case_id: string;
  patient_id: string;
  domain: GoalDomainKey;
  description: string;
  baseline: string;
  target: string;
  status: "active" | "achieved" | "partially_achieved" | "modified" | "discontinued";
  start_date: string;
  review_date?: string;
  professional_id: string;
}

export interface MusicotherapyPlan {
  id: string;
  case_id: string;
  patient_id: string;
  assessment_id: string;
  professional_id: string;
  start_date: string;
  review_date: string;
  general_goals: string;
  strategies: string;
  frequency: string;
  tracking_criteria: string;
  observations?: string;
  status: "draft" | "active" | "revised" | "archived";
  version: number;
  created_at: string;
  updated_at: string;
}

export interface AppliedIntervention {
  key: string;
  label: string;
  applied: boolean;
  details: string;
  instruments: string[];
}

export interface ClinicalSessionRecord {
  id: string;
  case_id: string;
  plan_id?: string;
  patient_id: string;
  patient_name: string;
  professional_id: string;
  professional_name: string;
  professional_register?: string;
  session_number: number;
  date: string;
  time?: string;
  duration_minutes: number;
  modality: "individual" | "grupo" | "familiar";
  location: "consultorio" | "escola_aee" | "caps" | "domicilio" | "hospital" | "outro";
  participants: string;
  status: "draft" | "signed" | "corrected_by_addendum" | "cancelled";
  attendance_status: "realizada" | "falta" | "falta_justificada" | "cancelada" | "remarcada";
  
  selected_goal_ids: string[];
  interventions: AppliedIntervention[];

  objective_observation: string; // Fato Observado
  clinical_interpretation: string; // Interpretação Clínica
  sensory_response?: string;
  communication_interaction?: string;
  regulation_response?: string;
  intercurrences?: string;
  next_steps?: string;

  version: number;
  signed_at?: string; // Data/hora da finalização do registro pelo profissional
  signed_by?: string; // ID do profissional autenticado que finalizou
  finalized_at?: string;
  finalized_by?: string;
  
  // Suporte administrativo excepcional do Superadmin
  administrative_intervention?: boolean;
  intervention_reason?: string;
  intervention_by?: string;
  intervention_at?: string;

  created_at: string;
  updated_at: string;
}

export interface MusicotherapySessionAddendum {
  id: string;
  session_id: string;
  version_number: number;
  previous_snapshot: Partial<ClinicalSessionRecord>;
  addendum_text: string;
  reason: string;
  author_id: string;
  author_name: string;
  is_administrative_support?: boolean;
  intervention_reason?: string;
  created_at: string;
}

export type IndicatorType = 
  | "duracao" 
  | "frequencia" 
  | "contagem" 
  | "percentual" 
  | "presenca_ausencia" 
  | "escala_profissional" 
  | "texto_estruturado";

export interface MusicotherapyIndicator {
  id: string;
  case_id: string;
  patient_id: string;
  goal_id?: string;
  session_id?: string;
  name: string;
  domain: string;
  description: string;
  type: IndicatorType;
  unit?: string;
  baseline?: string | number;
  value: string | number;
  date: string;
  context: string;
  observation?: string;
  professional_id: string;
  created_at: string;
}

export type DocumentCategory = 
  | "indicacao_prescricao"
  | "comprovacao_profissional"
  | "plano"
  | "relatorio"
  | "laudo"
  | "convenio_guia"
  | "outro";

export interface MusicotherapyDocument {
  id: string;
  case_id: string;
  patient_id: string;
  title: string;
  category: DocumentCategory;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  is_private: boolean; // Storage privado
  uploaded_by: string;
  uploaded_at: string;
  notes?: string;
}

export type InsuranceStatus = "solicitado" | "autorizado" | "negado" | "em_recurso";

export interface MusicotherapyInsuranceRecord {
  id: string;
  case_id: string;
  patient_id: string;
  operator: string;
  plan_name: string;
  protocol: string;
  requested_sessions: number;
  authorized_sessions: number;
  validity_date: string;
  status: InsuranceStatus;
  denial_reason?: string;
  administrative_appeal?: string;
  notes?: string;
  updated_at: string;
}

export interface MusicotherapyReportVersion {
  report_id: string;
  version: number;
  patient_id: string;
  patient_name: string;
  case_id: string;
  period_start: string;
  period_end: string;
  generated_at: string;
  generated_by: string;
  status: "draft" | "signed" | "archived";
  professional_synthesis: string;
  recommendations_continuity: string;
  included_sections: string[];
  provenance_summary: {
    evaluations_count: number;
    plans_count: number;
    sessions_count: number;
    indicators_count: number;
  };
}
