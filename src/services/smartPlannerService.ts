import { supabase } from "../lib/supabase";
import { auditService } from "./auditService";
import { assistedPeopleService } from "./assistedPeopleService";
import { 
  PlannedActivity, 
  ActivityApplicationRecord, 
  AssistedUserSummary, 
  ActivityFilterOptions,
  PsychopedagogyPlan,
  PsychopedagogyGoal,
  PsychologyTherapeuticProcess,
  TherapeuticProcessCheckIn,
  TherapeuticRuptureAlert,
  PlannerMode
} from "../types";

export const smartPlannerService = {
  // =========================================================================
  // 1. GESTÃO DE USUÁRIOS ASSISTIDOS (VÍNCULOS E ESCOPO AUTORIZADO)
  // =========================================================================

  /**
   * Retorna os usuários do escopo autorizado do profissional.
   * Não expõe todos os usuários da base indiscriminadamente.
   * Fonte da verdade estrita: Supabase (professional_assisted_links e assisted_people).
   * Retorna lista vazia caso não haja registros — sem seeds de teste fixos.
   */
  async getAuthorizedAssistedUsers(professionalUserId: string): Promise<AssistedUserSummary[]> {
    if (!professionalUserId) return [];
    return assistedPeopleService.getAssistedPeopleByProfessional(professionalUserId);
  },

  /**
   * Salva ou vincula um novo usuário ao escopo do profissional
   */
  async linkAssistedUser(
    professionalUserId: string,
    params: {
      displayName: string;
      preferredName?: string;
      registrationNumber?: string;
      gradeLevel?: string;
      institutionName?: string;
      relationshipType: "aluno" | "aprendente" | "paciente" | "assistido";
    }
  ): Promise<AssistedUserSummary> {
    return assistedPeopleService.createAndLinkAssistedPerson(professionalUserId, params);
  },

  /**
   * Recupera o contexto autorizado (mínimo necessário) de um usuário assistido
   */
  async getAssistedUserContext(assistedUserId: string): Promise<AssistedUserSummary | null> {
    if (!assistedUserId) return null;

    try {
      const { data: person } = await supabase
        .from("assisted_people")
        .select("*")
        .eq("id", assistedUserId)
        .maybeSingle();

      if (person) {
        return {
          id: person.id,
          displayName: person.full_name,
          preferredName: person.preferred_name,
          birthDate: person.birth_date,
          registrationNumber: person.registration_number,
          institutionName: person.institution_name,
          classGroup: person.class_group,
          relationshipType: "assistido",
          supportLevel: person.support_level || "nao_especificado",
          knownStrengths: person.known_strengths || [],
          knownSensoryPreferences: person.sensory_preferences || [],
          knownEffectiveStrategies: person.effective_strategies || [],
        };
      }

      // Se for id de auth.users / profiles
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", assistedUserId)
        .maybeSingle();

      if (prof) {
        return {
          id: prof.id,
          displayName: prof.display_name || "Usuário Assistido",
          preferredName: prof.preferred_name,
          birthDate: prof.birth_date,
          relationshipType: "assistido",
          supportLevel: prof.support_level || "nao_especificado",
        };
      }
    } catch (e) {
      console.error("[SmartPlannerService] Erro ao buscar contexto do assistido:", e);
    }

    return null;
  },

  // =========================================================================
  // 2. ATIVIDADES PLANEJADAS (CRUD, PERSISTÊNCIA CANÔNICA, VERSIONAMENTO)
  // =========================================================================

  /**
   * Busca atividades no Supabase aplicando filtros por especialidade, aluno, status ou busca textual
   * Fonte de verdade: tabela planned_activities do Supabase.
   */
  async getActivities(
    professionalUserId: string,
    filters?: ActivityFilterOptions
  ): Promise<PlannedActivity[]> {
    if (!professionalUserId) return [];

    let query = supabase
      .from("planned_activities")
      .select("*")
      .or(`professional_user_id.eq.${professionalUserId},assisted_user_id.eq.${professionalUserId}`)
      .order("created_at", { ascending: false });

    if (filters?.specialty && (filters.specialty as string) !== "todos" && (filters.specialty as string) !== "todas") {
      query = query.eq("specialty", filters.specialty);
    }
    if (filters?.assistedUserId && filters.assistedUserId !== "todos") {
      query = query.eq("assisted_user_id", filters.assistedUserId);
    }
    if (filters?.status && filters.status !== "todos") {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[SmartPlannerService] Erro ao consultar planned_activities:", error);
      throw new Error(`Falha ao buscar atividades no Supabase: ${error.message}`);
    }

    let result: PlannedActivity[] = (data || []).map((row: any) => this.mapDatabaseToActivity(row));

    // Filtros em memória adicionais (ex: busca textual)
    if (filters) {
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        result = result.filter(
          (a: PlannedActivity) =>
            a.title.toLowerCase().includes(term) ||
            a.objective.toLowerCase().includes(term) ||
            a.assistedUserName?.toLowerCase().includes(term) ||
            a.disciplines.some((d) => d.toLowerCase().includes(term)) ||
            a.learningProcesses.some((p) => p.toLowerCase().includes(term))
        );
      }
      if (filters.isTemplateOnly) {
        result = result.filter((a: PlannedActivity) => a.isTemplate);
      }
    }

    return result;
  },

  /**
   * Salva ou atualiza uma atividade no Supabase.
   * Regra estrita: Se a atividade já foi aplicada (status === APPLIED), ela NÃO é alterada retroativamente!
   * Uma nova versão (v2, v3...) é gerada com parentActivityId.
   */
  async saveActivity(
    activity: PlannedActivity,
    actorUserId: string
  ): Promise<{ activity: PlannedActivity; isNewVersion: boolean }> {
    let activityToSave = { ...activity };
    let isNewVersion = false;

    // Se já foi aplicada, preserva o histórico criando nova versão
    if (activity.status === "APPLIED") {
      isNewVersion = true;
      activityToSave = {
        ...activity,
        id: crypto.randomUUID ? crypto.randomUUID() : `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        version: (activity.version || 1) + 1,
        parentActivityId: activity.id,
        status: "READY",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else {
      activityToSave.updatedAt = new Date().toISOString();
      if (!activityToSave.id) {
        activityToSave.id = crypto.randomUUID ? crypto.randomUUID() : `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      }
    }

    const dbPayload = this.mapActivityToDatabase(activityToSave);
    const { error } = await supabase
      .from("planned_activities")
      .upsert(dbPayload, { onConflict: "id" });

    if (error) {
      console.error("[SmartPlannerService] Erro ao gravar planned_activities no Supabase:", error);
      throw new Error(`Falha ao salvar atividade no Supabase: ${error.message}`);
    }

    // Auditoria Imutável
    await auditService.log({
      actorUserId,
      action: isNewVersion ? "ACTIVITY_CREATED" : "ACTIVITY_UPDATED",
      entityType: "planned_activity",
      entityId: activityToSave.id,
      afterData: {
        title: activityToSave.title,
        specialty: activityToSave.specialty,
        assistedUserId: activityToSave.assistedUserId,
        version: activityToSave.version,
        status: activityToSave.status,
      },
      source: "smartPlannerService.saveActivity",
    });

    return { activity: activityToSave, isNewVersion };
  },

  /**
   * Duplica uma atividade gerando NOVO ID independente.
   * Pode ser duplicada para o mesmo aluno, para outro aluno ou como modelo sem vínculo.
   */
  async duplicateActivity(
    sourceActivity: PlannedActivity,
    targetAssistedUser: AssistedUserSummary | null,
    actorUserId: string
  ): Promise<PlannedActivity> {
    const newId = crypto.randomUUID ? crypto.randomUUID() : `act-copy-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const duplicated: PlannedActivity = {
      ...sourceActivity,
      id: newId,
      title: `${sourceActivity.title} (Cópia)`,
      assistedUserId: targetAssistedUser ? targetAssistedUser.id : null,
      assistedUserName: targetAssistedUser ? targetAssistedUser.displayName : undefined,
      gradeLevel: targetAssistedUser?.gradeLevel || sourceActivity.gradeLevel,
      educationStage: targetAssistedUser?.educationStage || sourceActivity.educationStage,
      status: "READY",
      version: 1,
      parentActivityId: null,
      copiedFromActivityId: sourceActivity.id,
      isTemplate: !targetAssistedUser,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archivedAt: null,
      archivedBy: null,
    };

    await this.saveActivity(duplicated, actorUserId);

    await auditService.log({
      actorUserId,
      action: "ACTIVITY_DUPLICATED",
      entityType: "planned_activity",
      entityId: duplicated.id,
      beforeData: { sourceId: sourceActivity.id },
      afterData: { newId: duplicated.id, targetUserId: targetAssistedUser?.id },
      source: "smartPlannerService.duplicateActivity",
    });

    return duplicated;
  },

  /**
   * Arquivamento lógico de atividade. Para atividades aplicadas, nunca apaga fisicamente.
   */
  async archiveActivity(activityId: string, actorUserId: string): Promise<void> {
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("planned_activities")
      .update({
        status: "ARCHIVED",
        archived_at: now,
        archived_by: actorUserId,
        updated_at: now,
      })
      .eq("id", activityId);

    if (error) {
      console.error("[SmartPlannerService] Erro ao arquivar atividade:", error);
      throw new Error(`Falha ao arquivar atividade no Supabase: ${error.message}`);
    }

    await auditService.log({
      actorUserId,
      action: "ACTIVITY_ARCHIVED",
      entityType: "planned_activity",
      entityId: activityId,
      source: "smartPlannerService.archiveActivity",
    });
  },

  // =========================================================================
  // 3. REGISTRO DE APLICAÇÃO (FEEDBACK, NÍVEL DE APOIO, MEMÓRIA PEDAGÓGICA)
  // =========================================================================

  async recordApplication(
    applicationData: Omit<ActivityApplicationRecord, "id" | "createdAt">,
    actorUserId: string
  ): Promise<ActivityApplicationRecord> {
    const recordId = crypto.randomUUID ? crypto.randomUUID() : `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const record: ActivityApplicationRecord = {
      ...applicationData,
      id: recordId,
      createdAt: now,
    };

    // 1. Salva na tabela activity_applications
    const { error: appError } = await supabase.from("activity_applications").insert({
      id: record.id,
      activity_id: record.activityId,
      activity_version: record.activityVersion,
      activity_title: record.activityTitle,
      professional_user_id: record.professionalUserId,
      professional_name: record.professionalName,
      assisted_user_id: record.assistedUserId,
      assisted_user_name: record.assistedUserName,
      applied_date: record.appliedDate,
      was_completed: record.wasCompleted,
      actual_duration_minutes: record.actualDurationMinutes,
      support_level: record.supportLevel,
      engagement_score: record.engagementScore,
      strategies_worked: record.strategiesWorked,
      difficulties_observed: record.difficultiesObserved,
      adaptations_made: record.adaptationsMade,
      learner_feedback: record.learnerFeedback,
      observations: record.observations,
      next_steps: record.nextSteps,
      created_at: record.createdAt,
    });

    if (appError) {
      console.error("[SmartPlannerService] Erro ao gravar activity_applications:", appError);
      throw new Error(`Falha ao registrar aplicação no Supabase: ${appError.message}`);
    }

    // 2. Marca a atividade como APPLIED
    const { error: actUpdateError } = await supabase
      .from("planned_activities")
      .update({ status: "APPLIED", updated_at: now })
      .eq("id", record.activityId);

    if (actUpdateError) {
      console.warn("[SmartPlannerService] Aviso ao atualizar status da atividade para APPLIED:", actUpdateError);
    }

    // 3. Auditoria
    await auditService.log({
      actorUserId,
      action: "ACTIVITY_APPLIED",
      entityType: "activity_application",
      entityId: record.id,
      afterData: {
        activityId: record.activityId,
        assistedUserId: record.assistedUserId,
        supportLevel: record.supportLevel,
        engagementScore: record.engagementScore,
      },
      source: "smartPlannerService.recordApplication",
    });

    return record;
  },

  async getApplicationsForStudent(assistedUserId: string): Promise<ActivityApplicationRecord[]> {
    if (!assistedUserId) return [];

    const { data, error } = await supabase
      .from("activity_applications")
      .select("*")
      .eq("assisted_user_id", assistedUserId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[SmartPlannerService] Erro ao buscar aplicações do aluno:", error);
      throw new Error(`Falha ao consultar aplicações no Supabase: ${error.message}`);
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      activityId: d.activity_id,
      activityVersion: d.activity_version,
      activityTitle: d.activity_title,
      professionalUserId: d.professional_user_id,
      professionalName: d.professional_name,
      assistedUserId: d.assisted_user_id,
      assistedUserName: d.assisted_user_name,
      appliedDate: d.applied_date,
      wasCompleted: d.was_completed,
      actualDurationMinutes: d.actual_duration_minutes,
      supportLevel: d.support_level,
      engagementScore: d.engagement_score,
      strategiesWorked: d.strategies_worked || [],
      difficultiesObserved: d.difficulties_observed,
      adaptationsMade: d.adaptations_made,
      learnerFeedback: d.learner_feedback,
      observations: d.observations,
      nextSteps: d.next_steps,
      createdAt: d.created_at,
    }));
  },

  // =========================================================================
  // 4. PSICOPEDAGOGIA — PLANO E CICLO DE APRENDIZAGEM
  // =========================================================================

  async getPsychopedagogyPlan(
    assistedUserId: string,
    professionalUserId: string
  ): Promise<PsychopedagogyPlan> {
    const { data, error } = await supabase
      .from("psychopedagogy_plans")
      .select("*")
      .eq("assisted_user_id", assistedUserId)
      .maybeSingle();

    if (error) {
      console.error("[SmartPlannerService] Erro ao buscar psychopedagogy_plans:", error);
      throw new Error(`Falha ao consultar plano psicopedagógico no Supabase: ${error.message}`);
    }

    if (data) {
      return {
        id: data.id,
        professionalUserId: data.professional_user_id,
        assistedUserId: data.assisted_user_id,
        assistedUserName: data.assisted_user_name,
        demandDescription: data.demand_description,
        developmentContext: data.development_context,
        strengthsObserved: data.strengths_observed || [],
        difficultiesObserved: data.difficulties_observed || [],
        priorityGoals: data.priority_goals || [],
        environmentalAdaptations: data.environmental_adaptations || [],
        indicatorsOfProgress: data.indicators_of_progress || [],
        status: data.status,
        lastReviewDate: data.last_review_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }

    // Se ainda não existe no Supabase, cria um plano base vinculado
    const student = await this.getAssistedUserContext(assistedUserId);
    const planId = crypto.randomUUID ? crypto.randomUUID() : `plan-pp-${Date.now()}`;
    const now = new Date().toISOString();

    const defaultPlan: PsychopedagogyPlan = {
      id: planId,
      professionalUserId,
      assistedUserId,
      assistedUserName: student?.displayName || "Aprendente",
      demandDescription: "Acompanhamento das estratégias de autorregulação e aprendizagem no contexto escolar/clínico.",
      developmentContext: "Plano individualizado construído com base nas necessidades observadas.",
      strengthsObserved: student?.knownStrengths || [],
      difficultiesObserved: [],
      priorityGoals: [],
      environmentalAdaptations: [],
      indicatorsOfProgress: [],
      status: "ativo",
      lastReviewDate: now.split("T")[0],
      createdAt: now,
      updatedAt: now,
    };

    return defaultPlan;
  },

  async savePsychopedagogyPlan(
    plan: PsychopedagogyPlan,
    actorUserId: string
  ): Promise<PsychopedagogyPlan> {
    const updatedPlan: PsychopedagogyPlan = {
      ...plan,
      updatedAt: new Date().toISOString(),
    };

    const { error } = await supabase.from("psychopedagogy_plans").upsert({
      id: updatedPlan.id,
      professional_user_id: updatedPlan.professionalUserId,
      assisted_user_id: updatedPlan.assistedUserId,
      assisted_user_name: updatedPlan.assistedUserName,
      demand_description: updatedPlan.demandDescription,
      development_context: updatedPlan.developmentContext,
      strengths_observed: updatedPlan.strengthsObserved,
      difficulties_observed: updatedPlan.difficultiesObserved,
      priority_goals: updatedPlan.priorityGoals,
      environmental_adaptations: updatedPlan.environmentalAdaptations,
      indicators_of_progress: updatedPlan.indicatorsOfProgress,
      status: updatedPlan.status,
      last_review_date: updatedPlan.lastReviewDate,
      created_at: updatedPlan.createdAt,
      updated_at: updatedPlan.updatedAt,
    });

    if (error) {
      console.error("[SmartPlannerService] Erro ao gravar psychopedagogy_plans:", error);
      throw new Error(`Falha ao salvar plano psicopedagógico no Supabase: ${error.message}`);
    }

    await auditService.log({
      actorUserId,
      action: "PLAN_UPDATED",
      entityType: "psychopedagogy_plan",
      entityId: updatedPlan.id,
      afterData: { goalsCount: updatedPlan.priorityGoals.length, status: updatedPlan.status },
      source: "smartPlannerService.savePsychopedagogyPlan",
    });

    return updatedPlan;
  },

  // =========================================================================
  // 5. PSICOLOGIA — PROCESSO TERAPÊUTICO & ALIANÇA (FUNDAMENTAÇÃO TCC JÚLIA)
  // =========================================================================

  async getPsychologyProcess(
    patientUserId: string,
    professionalUserId: string
  ): Promise<PsychologyTherapeuticProcess> {
    const { data, error } = await supabase
      .from("psychology_processes")
      .select("*")
      .eq("patient_user_id", patientUserId)
      .maybeSingle();

    if (error) {
      console.error("[SmartPlannerService] Erro ao buscar psychology_processes:", error);
      throw new Error(`Falha ao consultar processo psicológico no Supabase: ${error.message}`);
    }

    if (data) {
      return {
        id: data.id,
        professionalUserId: data.professional_user_id,
        patientUserId: data.patient_user_id,
        patientName: data.patient_name,
        startDate: data.start_date,
        therapeuticApproach: data.therapeutic_approach,
        collaborativeGoals: data.collaborative_goals || [],
        sessionAgendas: data.session_agendas || [],
        interSessionActivities: data.inter_session_activities || [],
        processCheckIns: data.process_check_ins || [],
        ruptureAlerts: data.rupture_alerts || [],
        status: data.status,
        updatedAt: data.updated_at,
      };
    }

    const patient = await this.getAssistedUserContext(patientUserId);
    const procId = crypto.randomUUID ? crypto.randomUUID() : `psy-proc-${Date.now()}`;
    const now = new Date().toISOString();

    return {
      id: procId,
      professionalUserId,
      patientUserId,
      patientName: patient?.displayName || "Paciente",
      startDate: now.split("T")[0],
      therapeuticApproach: "Terapia Cognitivo-Comportamental (TCC) Neuroafirmativa",
      collaborativeGoals: [],
      sessionAgendas: [],
      interSessionActivities: [],
      processCheckIns: [],
      ruptureAlerts: [],
      status: "em_andamento",
      updatedAt: now,
    };
  },

  async savePsychologyProcess(
    process: PsychologyTherapeuticProcess,
    actorUserId: string
  ): Promise<PsychologyTherapeuticProcess> {
    const updated: PsychologyTherapeuticProcess = {
      ...process,
      updatedAt: new Date().toISOString(),
    };

    const { error } = await supabase.from("psychology_processes").upsert({
      id: updated.id,
      professional_user_id: updated.professionalUserId,
      patient_user_id: updated.patientUserId,
      patient_name: updated.patientName,
      start_date: updated.startDate,
      therapeutic_approach: updated.therapeuticApproach,
      collaborative_goals: updated.collaborativeGoals,
      session_agendas: updated.sessionAgendas,
      inter_session_activities: updated.interSessionActivities,
      process_check_ins: updated.processCheckIns,
      rupture_alerts: updated.ruptureAlerts,
      status: updated.status,
      updated_at: updated.updatedAt,
    });

    if (error) {
      console.error("[SmartPlannerService] Erro ao gravar psychology_processes:", error);
      throw new Error(`Falha ao salvar processo psicológico no Supabase: ${error.message}`);
    }

    await auditService.log({
      actorUserId,
      action: "PLAN_UPDATED",
      entityType: "psychology_process",
      entityId: updated.id,
      afterData: {
        patientId: updated.patientUserId,
        goalsCount: updated.collaborativeGoals.length,
        ruptureAlertsCount: updated.ruptureAlerts.length,
      },
      source: "smartPlannerService.savePsychologyProcess",
    });

    return updated;
  },

  // =========================================================================
  // MAPPERS DATABASE <-> FRONTEND
  // =========================================================================

  mapDatabaseToActivity(row: any): PlannedActivity {
    return {
      id: row.id,
      professionalUserId: row.professional_user_id,
      professionalName: row.professional_name,
      assistedUserId: row.assisted_user_id,
      assistedUserName: row.assisted_user_name,
      specialty: row.specialty,
      title: row.title,
      objective: row.objective,
      disciplines: row.disciplines || [],
      learningProcesses: row.learning_processes || [],
      educationStage: row.education_stage,
      gradeLevel: row.grade_level,
      duration: row.duration,
      format: row.format,
      materials: row.materials,
      instructions: row.instructions,
      stepByStep: row.step_by_step || [],
      visualSupport: row.visual_support || [],
      multiplePathways: row.multiple_pathways || [],
      challengeLevel: row.challenge_level,
      adaptations: row.adaptations || [],
      environmentalAdaptations: row.environmental_adaptations || [],
      studentInterestsBridging: row.student_interests_bridging,
      professionalNotes: row.professional_notes,
      status: row.status,
      version: row.version || 1,
      parentActivityId: row.parent_activity_id,
      copiedFromActivityId: row.copied_from_activity_id,
      isTemplate: !!row.is_template,
      tags: row.tags || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      archivedAt: row.archived_at,
      archivedBy: row.archived_by,
    };
  },

  mapActivityToDatabase(activity: PlannedActivity): any {
    return {
      id: activity.id,
      professional_user_id: activity.professionalUserId,
      professional_name: activity.professionalName,
      assisted_user_id: activity.assistedUserId || null,
      assisted_user_name: activity.assistedUserName || null,
      specialty: activity.specialty,
      title: activity.title,
      objective: activity.objective,
      disciplines: activity.disciplines,
      learning_processes: activity.learningProcesses,
      education_stage: activity.educationStage,
      grade_level: activity.gradeLevel,
      duration: activity.duration,
      format: activity.format,
      materials: activity.materials,
      instructions: activity.instructions,
      step_by_step: activity.stepByStep,
      visual_support: activity.visualSupport,
      multiple_pathways: activity.multiplePathways,
      challenge_level: activity.challengeLevel,
      adaptations: activity.adaptations,
      environmental_adaptations: activity.environmentalAdaptations,
      student_interests_bridging: activity.studentInterestsBridging,
      professional_notes: activity.professionalNotes,
      status: activity.status,
      version: activity.version,
      parent_activity_id: activity.parentActivityId || null,
      copied_from_activity_id: activity.copiedFromActivityId || null,
      is_template: activity.isTemplate,
      tags: activity.tags || [],
      created_at: activity.createdAt,
      updated_at: activity.updatedAt,
      archived_at: activity.archivedAt || null,
      archived_by: activity.archivedBy || null,
    };
  },
};
