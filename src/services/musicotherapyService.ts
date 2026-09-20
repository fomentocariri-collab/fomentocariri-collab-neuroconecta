import { supabase } from "../lib/supabase";
import { 
  MusicotherapyCase, 
  MusicotherapyIndication, 
  MusicotherapistQualification,
  MusicotherapyAssessment, 
  MusicotherapyPlan, 
  MusicotherapyGoal, 
  ClinicalSessionRecord, 
  MusicotherapySessionAddendum, 
  MusicotherapyIndicator, 
  MusicotherapyDocument, 
  MusicotherapyInsuranceRecord,
  MusicotherapyReportVersion
} from "../types/musicotherapy";
import { auditService } from "./auditService";

// ====================================================================
// GERENCIADOR CONTROLADO DE DRAFTS TEMPORÁRIOS DE DIGITAÇÃO ATIVA
// Atende estritamente a todos os requisitos de segurança e privacidade:
// - Temporário (TTL 24h)
// - Escopado por auth.users.id e recordId
// - Não é fonte canônica
// - Removido após persistência remota confirmada
// - Destruído no logout
// - Não exposto a outros usuários
// ====================================================================

interface ScopedDraftEnvelope<T> {
  userId: string;
  recordId: string;
  patientId?: string;
  savedAt: number;
  ttlMs: number;
  data: Partial<T>;
}

const DRAFT_PREFIX = "nc_draft_mt_";
const DEFAULT_DRAFT_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

export const ScopedDraftManager = {
  saveDraft<T>(userId: string, recordId: string, data: Partial<T>, patientId?: string): void {
    if (!userId || !recordId) return;
    try {
      const envelope: ScopedDraftEnvelope<T> = {
        userId,
        recordId,
        patientId,
        savedAt: Date.now(),
        ttlMs: DEFAULT_DRAFT_TTL_MS,
        data,
      };
      const key = `${DRAFT_PREFIX}${userId}_${recordId}`;
      localStorage.setItem(key, JSON.stringify(envelope));
    } catch {
      // Ignora silenciosamente sem vazar dados
    }
  },

  getDraft<T>(userId: string, recordId: string): Partial<T> | null {
    if (!userId || !recordId) return null;
    try {
      const key = `${DRAFT_PREFIX}${userId}_${recordId}`;
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const envelope: ScopedDraftEnvelope<T> = JSON.parse(raw);
      if (envelope.userId !== userId) return null; // Isolamento estrito entre usuários
      if (Date.now() - envelope.savedAt > envelope.ttlMs) {
        localStorage.removeItem(key); // TTL expirado
        return null;
      }
      return envelope.data;
    } catch {
      return null;
    }
  },

  clearDraft(userId: string, recordId: string): void {
    if (!userId || !recordId) return;
    try {
      const key = `${DRAFT_PREFIX}${userId}_${recordId}`;
      localStorage.removeItem(key);
    } catch {}
  },

  clearAllUserDrafts(userId: string): void {
    if (!userId) return;
    try {
      const targetPrefix = `${DRAFT_PREFIX}${userId}_`;
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(targetPrefix)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {}
  },
};

// ====================================================================
// SERVIÇO CLÍNICO CANÔNICO DE MUSICOTERAPIA
// ====================================================================

export const musicotherapyService = {
  // ------------------------------------------------------------------
  // 1. ACOMPANHAMENTO (CASES)
  // ------------------------------------------------------------------
  async getCases(patientId?: string): Promise<MusicotherapyCase[]> {
    try {
      let query = supabase.from("musicotherapy_cases").select("*").order("created_at", { ascending: false });
      if (patientId) query = query.eq("patient_id", patientId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as MusicotherapyCase[];
    } catch (e: any) {
      console.warn("[MT Service] Falha ao consultar casos clínicos:", e.message || "Erro de rede");
      return [];
    }
  },

  async saveCase(caseData: MusicotherapyCase, actorUserId?: string): Promise<MusicotherapyCase> {
    const now = new Date().toISOString();
    const updatedRecord: MusicotherapyCase = {
      ...caseData,
      updated_at: now,
      updated_by: actorUserId || caseData.updated_by,
    };

    const { error } = await supabase.from("musicotherapy_cases").upsert(updatedRecord);
    if (error) {
      console.warn("[MT Service] Erro ao salvar caso clínico:", error.message);
      throw error;
    }

    await auditService.log({
      actorUserId,
      action: caseData.created_at ? "RECORD_UPDATED" : "RECORD_CREATED",
      entityType: "musicotherapy_case",
      entityId: updatedRecord.id,
      afterData: { status: updatedRecord.status, patient_id: updatedRecord.patient_id },
      source: "musicotherapyService.saveCase",
    });

    return updatedRecord;
  },

  async archiveCase(caseId: string, actorUserId: string, reason: string): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("musicotherapy_cases")
      .update({
        status: "archived",
        archived_at: now,
        archived_by: actorUserId,
        archive_reason: reason,
        updated_at: now,
        updated_by: actorUserId,
      })
      .eq("id", caseId);

    if (error) throw error;

    await auditService.log({
      actorUserId,
      action: "RECORD_UPDATED",
      entityType: "musicotherapy_case",
      entityId: caseId,
      afterData: { status: "archived", archive_reason: reason },
      source: "musicotherapyService.archiveCase",
    });
  },

  // ------------------------------------------------------------------
  // 2. INDICAÇÃO / PRESCRIÇÃO
  // ------------------------------------------------------------------
  async getIndications(caseId: string): Promise<MusicotherapyIndication[]> {
    try {
      const { data, error } = await supabase
        .from("musicotherapy_indications")
        .select("*")
        .eq("case_id", caseId)
        .order("indication_date", { ascending: false });
      if (error) throw error;
      return (data || []) as MusicotherapyIndication[];
    } catch {
      return [];
    }
  },

  async saveIndication(indication: MusicotherapyIndication, actorUserId?: string): Promise<MusicotherapyIndication> {
    const { error } = await supabase.from("musicotherapy_indications").upsert(indication);
    if (error) throw error;

    await auditService.log({
      actorUserId,
      action: "RECORD_CREATED",
      entityType: "musicotherapy_indication",
      entityId: indication.id,
      afterData: { origin: indication.origin, prescriber_register: indication.prescriber_register },
      source: "musicotherapyService.saveIndication",
    });

    return indication;
  },

  // ------------------------------------------------------------------
  // 3. HABILITAÇÃO PROFISSIONAL DO MUSICOTERAPEUTA
  // ------------------------------------------------------------------
  async getQualification(professionalId: string): Promise<MusicotherapistQualification | null> {
    try {
      const { data, error } = await supabase
        .from("musicotherapist_qualifications")
        .select("*")
        .eq("professional_id", professionalId)
        .maybeSingle();
      if (error || !data) return null;
      return data as MusicotherapistQualification;
    } catch {
      return null;
    }
  },

  async saveQualification(qualification: MusicotherapistQualification, actorUserId?: string): Promise<MusicotherapistQualification> {
    const payload = { ...qualification, updated_at: new Date().toISOString() };
    const { error } = await supabase.from("musicotherapist_qualifications").upsert(payload);
    if (error) throw error;

    await auditService.log({
      actorUserId,
      action: "RECORD_UPDATED",
      entityType: "musicotherapist_qualification",
      entityId: qualification.professional_id,
      afterData: { degree: qualification.degree, register_info: qualification.register_info },
      source: "musicotherapyService.saveQualification",
    });

    return payload;
  },

  // ------------------------------------------------------------------
  // 4. AVALIAÇÕES MUSICOTERAPÊUTICAS
  // ------------------------------------------------------------------
  async getAssessments(caseId: string): Promise<MusicotherapyAssessment[]> {
    try {
      const { data, error } = await supabase
        .from("musicotherapy_assessments")
        .select("*")
        .eq("case_id", caseId)
        .order("date", { ascending: false });
      if (error) throw error;
      return (data || []) as MusicotherapyAssessment[];
    } catch {
      return [];
    }
  },

  async saveAssessment(assessment: MusicotherapyAssessment, actorUserId?: string): Promise<MusicotherapyAssessment> {
    // Concorrência e bloqueio de edição direta de registro assinado
    if (assessment.id) {
      const { data: remote } = await supabase
        .from("musicotherapy_assessments")
        .select("status, version")
        .eq("id", assessment.id)
        .maybeSingle();

      if (remote) {
        if (remote.status === "signed" && assessment.status !== "signed") {
          throw new Error("Registro de avaliação já finalizado. Utilize versionamento/reavaliação para novas etapas.");
        }
        if (remote.version > assessment.version) {
          throw new Error("Conflito de concorrência: Esta avaliação foi atualizada em outro dispositivo.");
        }
      }
    }

    const updated: MusicotherapyAssessment = {
      ...assessment,
      version: assessment.version || 1,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("musicotherapy_assessments").upsert(updated);
    if (error) throw error;

    await auditService.log({
      actorUserId,
      action: assessment.status === "signed" ? "CLINICAL_SESSION_FINALIZED" : "RECORD_UPDATED",
      entityType: "musicotherapy_assessment",
      entityId: updated.id,
      afterData: { status: updated.status, version: updated.version },
      source: "musicotherapyService.saveAssessment",
    });

    return updated;
  },

  // ------------------------------------------------------------------
  // 5. PLANOS TERAPÊUTICOS E METAS
  // ------------------------------------------------------------------
  async getPlans(caseId: string): Promise<MusicotherapyPlan[]> {
    try {
      const { data, error } = await supabase
        .from("musicotherapy_plans")
        .select("*")
        .eq("case_id", caseId)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return (data || []) as MusicotherapyPlan[];
    } catch {
      return [];
    }
  },

  async savePlan(plan: MusicotherapyPlan, actorUserId?: string): Promise<MusicotherapyPlan> {
    const updated: MusicotherapyPlan = {
      ...plan,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("musicotherapy_plans").upsert(updated);
    if (error) throw error;

    await auditService.log({
      actorUserId,
      action: "RECORD_UPDATED",
      entityType: "musicotherapy_plan",
      entityId: updated.id,
      afterData: { status: updated.status, version: updated.version },
      source: "musicotherapyService.savePlan",
    });

    return updated;
  },

  async getGoals(planId: string): Promise<MusicotherapyGoal[]> {
    try {
      const { data, error } = await supabase
        .from("musicotherapy_goals")
        .select("*")
        .eq("plan_id", planId);
      if (error) throw error;
      return (data || []) as MusicotherapyGoal[];
    } catch {
      return [];
    }
  },

  async saveGoal(goal: MusicotherapyGoal, actorUserId?: string): Promise<MusicotherapyGoal> {
    const { error } = await supabase.from("musicotherapy_goals").upsert(goal);
    if (error) throw error;

    await auditService.log({
      actorUserId,
      action: "RECORD_UPDATED",
      entityType: "musicotherapy_goal",
      entityId: goal.id,
      afterData: { domain: goal.domain, status: goal.status },
      source: "musicotherapyService.saveGoal",
    });

    return goal;
  },

  // ------------------------------------------------------------------
  // 6. SESSÕES CLÍNICAS (DRAFTS, CONCORRÊNCIA, FINALIZAÇÃO E ADENDOS)
  // ------------------------------------------------------------------
  async getSessions(caseId: string): Promise<ClinicalSessionRecord[]> {
    try {
      const { data, error } = await supabase
        .from("musicotherapy_sessions")
        .select("*")
        .eq("case_id", caseId)
        .order("date", { ascending: false });
      if (error) throw error;
      return (data || []) as ClinicalSessionRecord[];
    } catch {
      return [];
    }
  },

  async getSessionById(sessionId: string): Promise<ClinicalSessionRecord | null> {
    try {
      const { data, error } = await supabase
        .from("musicotherapy_sessions")
        .select("*")
        .eq("id", sessionId)
        .maybeSingle();
      if (error || !data) return null;
      return data as ClinicalSessionRecord;
    } catch {
      return null;
    }
  },

  /**
   * Salva sessão em modo Rascunho (Draft) ou Atualização com controle otimista de concorrência
   */
  async saveSession(session: ClinicalSessionRecord, actorUserId?: string): Promise<ClinicalSessionRecord> {
    // 1. Verificação de concorrência e estado remoto
    if (session.id) {
      const remote = await this.getSessionById(session.id);
      if (remote) {
        // Bloqueio de alteração direta após finalização pelo profissional
        if (remote.status === "signed") {
          throw new Error("Este registro clínico já está finalizado. Utilize o fluxo de Adendo/Retificação para correções.");
        }
        // Detecção de concorrência entre múltiplos dispositivos
        if (remote.version > session.version) {
          throw new Error("Conflito de concorrência detectado: O registro foi alterado em outro dispositivo. Recarregue os dados antes de salvar.");
        }
      }
    }

    const nextVersion = (session.version || 1) + 1;
    const updated: ClinicalSessionRecord = {
      ...session,
      version: nextVersion,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("musicotherapy_sessions").upsert(updated);
    if (error) throw error;

    // Se persistência confirmada no Supabase, limpa rascunho temporário de digitação
    if (actorUserId && session.id) {
      ScopedDraftManager.clearDraft(actorUserId, session.id);
    }

    await auditService.log({
      actorUserId,
      action: "RECORD_UPDATED",
      entityType: "musicotherapy_session",
      entityId: updated.id,
      afterData: {
        session_number: updated.session_number,
        date: updated.date,
        status: updated.status,
        version: updated.version,
      },
      source: "musicotherapyService.saveSession",
    });

    return updated;
  },

  /**
   * Finalização oficial do registro clínico pelo usuário autenticado
   * Nomenclatura corrigida: Finalização do registro (sem promessa de ICP-Brasil)
   */
  async finalizeSession(sessionId: string, professionalId: string, professionalName: string): Promise<ClinicalSessionRecord> {
    const existing = await this.getSessionById(sessionId);
    if (!existing) {
      throw new Error("Sessão não encontrada para finalização.");
    }
    if (existing.status === "signed") {
      throw new Error("A sessão já se encontra finalizada.");
    }

    const now = new Date().toISOString();
    const finalizedRecord: ClinicalSessionRecord = {
      ...existing,
      status: "signed",
      signed_by: professionalId,
      signed_at: now,
      finalized_by: professionalId,
      finalized_at: now,
      version: (existing.version || 1) + 1,
      updated_at: now,
    };

    const { error } = await supabase
      .from("musicotherapy_sessions")
      .update({
        status: "signed",
        signed_by: professionalId,
        signed_at: now,
        version: finalizedRecord.version,
        updated_at: now,
      })
      .eq("id", sessionId);

    if (error) throw error;

    // Limpa draft temporário local
    ScopedDraftManager.clearDraft(professionalId, sessionId);

    await auditService.log({
      actorUserId: professionalId,
      action: "CLINICAL_SESSION_FINALIZED",
      entityType: "musicotherapy_sessions",
      entityId: sessionId,
      afterData: {
        status: "signed",
        version: finalizedRecord.version,
        finalized_by: professionalId,
        finalized_by_name: professionalName,
        finalized_at: now,
      },
      source: "musicotherapyService.finalizeSession",
    });

    return finalizedRecord;
  },

  /**
   * Adiciona Adendo ou Retificação Clínica a uma sessão finalizada
   */
  async addAddendum(addendum: MusicotherapySessionAddendum, actorUserId?: string): Promise<MusicotherapySessionAddendum> {
    const { error } = await supabase.from("musicotherapy_session_addenda").insert(addendum);
    if (error) throw error;

    // Atualiza status da sessão para registrar que possui adendo
    await supabase
      .from("musicotherapy_sessions")
      .update({ status: "corrected_by_addendum", updated_at: new Date().toISOString() })
      .eq("id", addendum.session_id);

    await auditService.log({
      actorUserId,
      action: "RECORD_CREATED",
      entityType: "musicotherapy_session_addendum",
      entityId: addendum.id,
      afterData: {
        session_id: addendum.session_id,
        version_number: addendum.version_number,
        reason: addendum.reason,
      },
      source: "musicotherapyService.addAddendum",
    });

    return addendum;
  },

  async getAddenda(sessionId: string): Promise<MusicotherapySessionAddendum[]> {
    try {
      const { data, error } = await supabase
        .from("musicotherapy_session_addenda")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as MusicotherapySessionAddendum[];
    } catch {
      return [];
    }
  },

  // ------------------------------------------------------------------
  // 7. INTERVENÇÃO ADMINISTRATIVA DO SUPERADMIN (COM MOTIVO E AUDITORIA)
  // Preserva autor clínico original (created_by, professional_id, signed_by)
  // ------------------------------------------------------------------
  async applySuperAdminClinicalCorrection(params: {
    sessionId: string;
    superAdminUserId: string;
    interventionReason: string;
    technicalFixes: {
      patient_id?: string;
      plan_id?: string;
      session_number?: number;
      date?: string;
      location?: any;
    };
  }): Promise<ClinicalSessionRecord> {
    if (!params.interventionReason || params.interventionReason.trim().length < 5) {
      throw new Error("O Superadmin deve obrigatoriamente fornecer o motivo da intervenção administrativa.");
    }

    const current = await this.getSessionById(params.sessionId);
    if (!current) throw new Error("Sessão não encontrada.");

    const now = new Date().toISOString();
    const patchPayload = {
      ...params.technicalFixes,
      administrative_intervention: true,
      intervention_reason: params.interventionReason,
      intervention_by: params.superAdminUserId,
      intervention_at: now,
      version: (current.version || 1) + 1,
      updated_at: now,
    };

    const { error } = await supabase
      .from("musicotherapy_sessions")
      .update(patchPayload)
      .eq("id", params.sessionId);

    if (error) throw error;

    await auditService.log({
      actorUserId: params.superAdminUserId,
      action: "SUPERADMIN_RECORD_CORRECTED",
      entityType: "musicotherapy_sessions",
      entityId: params.sessionId,
      beforeData: { version: current.version },
      afterData: {
        reason: params.interventionReason,
        version: patchPayload.version,
        original_professional_id: current.professional_id,
        superadmin_actor: params.superAdminUserId,
      },
      source: "musicotherapyService.applySuperAdminClinicalCorrection",
    });

    return { ...current, ...patchPayload } as ClinicalSessionRecord;
  },

  // ------------------------------------------------------------------
  // 8. INDICADORES CLÍNICOS
  // ------------------------------------------------------------------
  async getIndicators(caseId: string): Promise<MusicotherapyIndicator[]> {
    try {
      const { data, error } = await supabase
        .from("musicotherapy_indicators")
        .select("*")
        .eq("case_id", caseId)
        .order("date", { ascending: true });
      if (error) throw error;
      return (data || []) as MusicotherapyIndicator[];
    } catch {
      return [];
    }
  },

  async recordIndicator(indicator: MusicotherapyIndicator, actorUserId?: string): Promise<MusicotherapyIndicator> {
    const { error } = await supabase.from("musicotherapy_indicators").insert(indicator);
    if (error) throw error;

    await auditService.log({
      actorUserId,
      action: "RECORD_CREATED",
      entityType: "musicotherapy_indicator",
      entityId: indicator.id,
      afterData: { name: indicator.name, date: indicator.date },
      source: "musicotherapyService.recordIndicator",
    });

    return indicator;
  },

  // ------------------------------------------------------------------
  // 9. DOCUMENTOS & ANEXOS PRIVADOS (STORAGE PRIVADO)
  // ------------------------------------------------------------------
  async getDocuments(caseId: string): Promise<MusicotherapyDocument[]> {
    try {
      const { data, error } = await supabase
        .from("musicotherapy_documents")
        .select("*")
        .eq("case_id", caseId)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return (data || []) as MusicotherapyDocument[];
    } catch {
      return [];
    }
  },

  async saveDocumentMetadata(doc: MusicotherapyDocument, actorUserId?: string): Promise<MusicotherapyDocument> {
    const { error } = await supabase.from("musicotherapy_documents").upsert(doc);
    if (error) throw error;

    await auditService.log({
      actorUserId,
      action: "RECORD_CREATED",
      entityType: "musicotherapy_document",
      entityId: doc.id,
      afterData: { title: doc.title, category: doc.category, is_private: true },
      source: "musicotherapyService.saveDocumentMetadata",
    });

    return doc;
  },

  /**
   * Gera URL assinada temporária (Signed URL) para visualização privada de documento clínico
   * NUNCA retorna URL pública permanente
   */
  async getPrivateDocumentSignedUrl(filePath: string, expiresInSeconds: number = 3600): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from("musicotherapy-documents-private")
        .createSignedUrl(filePath, expiresInSeconds);

      if (error || !data?.signedUrl) {
        console.warn("[MT Service] Falha ao obter Signed URL segura:", error?.message);
        return null;
      }
      return data.signedUrl;
    } catch {
      return null;
    }
  },

  // ------------------------------------------------------------------
  // 10. CONVÊNIO / ADMINISTRAÇÃO
  // ------------------------------------------------------------------
  async getInsuranceRecords(caseId: string): Promise<MusicotherapyInsuranceRecord[]> {
    try {
      const { data, error } = await supabase
        .from("musicotherapy_insurance_records")
        .select("*")
        .eq("case_id", caseId);
      if (error) throw error;
      return (data || []) as MusicotherapyInsuranceRecord[];
    } catch {
      return [];
    }
  },

  async saveInsuranceRecord(record: MusicotherapyInsuranceRecord, actorUserId?: string): Promise<MusicotherapyInsuranceRecord> {
    const updated = { ...record, updated_at: new Date().toISOString() };
    const { error } = await supabase.from("musicotherapy_insurance_records").upsert(updated);
    if (error) throw error;

    await auditService.log({
      actorUserId,
      action: "RECORD_UPDATED",
      entityType: "musicotherapy_insurance_record",
      entityId: updated.id,
      afterData: { operator: updated.operator, status: updated.status },
      source: "musicotherapyService.saveInsuranceRecord",
    });

    return updated;
  },

  // ------------------------------------------------------------------
  // 11. RELATÓRIOS LONGITUDINAIS & HISTÓRICO DE VERSÕES
  // ------------------------------------------------------------------
  async getReportVersions(caseId: string): Promise<MusicotherapyReportVersion[]> {
    try {
      const { data, error } = await supabase
        .from("musicotherapy_reports")
        .select("*")
        .eq("case_id", caseId)
        .order("version", { ascending: false });
      if (error) throw error;
      return (data || []) as MusicotherapyReportVersion[];
    } catch {
      return [];
    }
  },

  async saveReportVersion(report: MusicotherapyReportVersion, actorUserId?: string): Promise<MusicotherapyReportVersion> {
    const { error } = await supabase.from("musicotherapy_reports").upsert(report);
    if (error) throw error;

    await auditService.log({
      actorUserId,
      action: "RECORD_CREATED",
      entityType: "musicotherapy_report_version",
      entityId: `${report.report_id}_v${report.version}`,
      afterData: { version: report.version, period_start: report.period_start, period_end: report.period_end },
      source: "musicotherapyService.saveReportVersion",
    });

    return report;
  },

  // ------------------------------------------------------------------
  // 12. OPERAÇÕES DE ENCERRAMENTO DE SESSÃO / LOGOUT
  // ------------------------------------------------------------------
  clearUserSessionData(userId: string): void {
    ScopedDraftManager.clearAllUserDrafts(userId);
    auditService.clearLocalCache();
  },
};
