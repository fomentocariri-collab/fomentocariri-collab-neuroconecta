import {
  ShareGrant,
  ExtendedMoodLogEntry,
  SensoryCheckinRecord,
  FunctionalSupportPlan,
  PeiDraftVersion,
  SchoolFamilyMessage,
  UserProfile,
} from "../types";

function getHeaders(userProfile: UserProfile): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-actor-id": userProfile.email || "user-local",
    "x-actor-name": userProfile.preferredName || "Usuário",
    "x-actor-role": userProfile.userRole || (userProfile.isSuperAdmin ? "superadmin" : "pcd"),
    "x-actor-professional-role": userProfile.professionalRoleType || "",
  };
}

export const Lote1Api = {
  // --- SHARE GRANTS ---
  async getShareGrants(subjectId: string, profile: UserProfile): Promise<ShareGrant[]> {
    try {
      const res = await fetch(`/api/share-grants?subjectId=${encodeURIComponent(subjectId)}`, {
        headers: getHeaders(profile),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(`neuroconecta_grants_${subjectId}`, JSON.stringify(data.grants));
        return data.grants;
      }
    } catch (e) {
      console.warn("Offline/Fallback ao buscar share grants:", e);
    }
    const cached = localStorage.getItem(`neuroconecta_grants_${subjectId}`);
    return cached ? JSON.parse(cached) : [];
  },

  async createShareGrant(
    grant: Omit<ShareGrant, "id" | "status" | "createdAt" | "updatedAt">,
    profile: UserProfile
  ): Promise<ShareGrant> {
    try {
      const res = await fetch("/api/share-grants", {
        method: "POST",
        headers: getHeaders(profile),
        body: JSON.stringify(grant),
      });
      if (res.ok) {
        const data = await res.json();
        return data.grant;
      }
    } catch (e) {
      console.warn("Fallback ao criar share grant:", e);
    }
    // Fallback local
    const fallback: ShareGrant = {
      ...grant,
      id: `grant-local-${Date.now()}`,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const cached = await this.getShareGrants(grant.subjectId, profile);
    const updated = [fallback, ...cached];
    localStorage.setItem(`neuroconecta_grants_${grant.subjectId}`, JSON.stringify(updated));
    return fallback;
  },

  async revokeShareGrant(grantId: string, subjectId: string, profile: UserProfile): Promise<boolean> {
    try {
      const res = await fetch(`/api/share-grants/${grantId}/revoke`, {
        method: "PATCH",
        headers: getHeaders(profile),
      });
      if (res.ok) return true;
    } catch (e) {
      console.warn("Fallback ao revogar grant:", e);
    }
    const cached = await this.getShareGrants(subjectId, profile);
    const updated = cached.map((g) => (g.id === grantId ? { ...g, status: "revoked" as const } : g));
    localStorage.setItem(`neuroconecta_grants_${subjectId}`, JSON.stringify(updated));
    return true;
  },

  // --- DIARY & MOOD ENTRIES ---
  async getDiaryEntries(
    subjectId: string,
    profile: UserProfile
  ): Promise<{ entries: ExtendedMoodLogEntry[]; deniedPersonalEntriesCount: number }> {
    try {
      const res = await fetch(`/api/diary/entries?subjectId=${encodeURIComponent(subjectId)}`, {
        headers: getHeaders(profile),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(`neuroconecta_diary_${subjectId}`, JSON.stringify(data.entries));
        return data;
      }
    } catch (e) {
      console.warn("Offline/Fallback ao buscar diary entries:", e);
    }
    // Fallback local com migração suave dos logs legados caso não existam
    const cached = localStorage.getItem(`neuroconecta_diary_${subjectId}`);
    if (cached) {
      return { entries: JSON.parse(cached), deniedPersonalEntriesCount: 0 };
    }

    // Tenta ler do legado global 'neuroconecta_mood_logs' preservando dados pré-existentes
    const legacy = localStorage.getItem("neuroconecta_mood_logs");
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy);
        const migrated: ExtendedMoodLogEntry[] = parsed.map((item: any) => ({
          ...item,
          subjectId,
          entryType: item.entryType || "personal",
          authorName: item.authorName || profile.preferredName || "Usuário",
          authorRole: item.authorRole || profile.userRole || "pcd",
        }));
        localStorage.setItem(`neuroconecta_diary_${subjectId}`, JSON.stringify(migrated));
        return { entries: migrated, deniedPersonalEntriesCount: 0 };
      } catch (err) {
        console.error("Erro ao migrar dados legados:", err);
      }
    }

    return { entries: [], deniedPersonalEntriesCount: 0 };
  },

  async createDiaryEntry(entry: ExtendedMoodLogEntry, profile: UserProfile): Promise<ExtendedMoodLogEntry> {
    try {
      const res = await fetch("/api/diary/entries", {
        method: "POST",
        headers: getHeaders(profile),
        body: JSON.stringify(entry),
      });
      if (res.ok) {
        const data = await res.json();
        return data.entry;
      }
    } catch (e) {
      console.warn("Fallback ao criar diary entry:", e);
    }
    // Fallback local
    const fallback: ExtendedMoodLogEntry = {
      ...entry,
      id: entry.id || `entry-local-${Date.now()}`,
      authorId: profile.email || "local",
      authorName: profile.preferredName || "Usuário",
      authorRole: profile.userRole || "pcd",
      createdAt: new Date().toISOString(),
    };
    const key = `neuroconecta_diary_${entry.subjectId || profile.email || "default"}`;
    const raw = localStorage.getItem(key);
    const existing = raw ? JSON.parse(raw) : [];
    localStorage.setItem(key, JSON.stringify([fallback, ...existing]));
    // Também sincroniza com legado para manter compatibilidade
    localStorage.setItem("neuroconecta_mood_logs", JSON.stringify([fallback, ...existing]));
    return fallback;
  },

  async deleteDiaryEntry(id: string, subjectId: string, profile: UserProfile): Promise<boolean> {
    try {
      const res = await fetch(`/api/diary/entries/${id}`, {
        method: "DELETE",
        headers: getHeaders(profile),
      });
      if (res.ok) return true;
    } catch (e) {
      console.warn("Fallback ao deletar entry:", e);
    }
    const key = `neuroconecta_diary_${subjectId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const existing = JSON.parse(raw);
      const filtered = existing.filter((e: any) => e.id !== id);
      localStorage.setItem(key, JSON.stringify(filtered));
      localStorage.setItem("neuroconecta_mood_logs", JSON.stringify(filtered));
    }
    return true;
  },

  // --- SENSORY RECORDS ---
  async getSensoryRecords(subjectId: string, profile: UserProfile): Promise<SensoryCheckinRecord[]> {
    try {
      const res = await fetch(`/api/sensory/records?subjectId=${encodeURIComponent(subjectId)}`, {
        headers: getHeaders(profile),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(`neuroconecta_sensory_${subjectId}`, JSON.stringify(data.records));
        return data.records;
      }
    } catch (e) {
      console.warn("Offline/Fallback ao buscar sensory records:", e);
    }
    const cached = localStorage.getItem(`neuroconecta_sensory_${subjectId}`);
    return cached ? JSON.parse(cached) : [];
  },

  async createSensoryRecord(
    record: SensoryCheckinRecord,
    profile: UserProfile
  ): Promise<SensoryCheckinRecord> {
    try {
      const res = await fetch("/api/sensory/records", {
        method: "POST",
        headers: getHeaders(profile),
        body: JSON.stringify(record),
      });
      if (res.ok) {
        const data = await res.json();
        return data.record;
      }
    } catch (e) {
      console.warn("Fallback ao criar sensory record:", e);
    }
    const fallback: SensoryCheckinRecord = {
      ...record,
      id: record.id || `sensory-local-${Date.now()}`,
      authorId: profile.email || "local",
      authorName: profile.preferredName || "Usuário",
      createdAt: new Date().toISOString(),
    };
    const key = `neuroconecta_sensory_${record.subjectId}`;
    const raw = localStorage.getItem(key);
    const existing = raw ? JSON.parse(raw) : [];
    localStorage.setItem(key, JSON.stringify([fallback, ...existing]));
    return fallback;
  },

  // --- FUNCTIONAL SUPPORT PLAN ---
  async getFunctionalPlan(subjectId: string, profile: UserProfile): Promise<FunctionalSupportPlan> {
    try {
      const res = await fetch(`/api/functional-plan/${encodeURIComponent(subjectId)}`, {
        headers: getHeaders(profile),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(`neuroconecta_plan_${subjectId}`, JSON.stringify(data.plan));
        return data.plan;
      }
    } catch (e) {
      console.warn("Offline/Fallback ao buscar plano funcional:", e);
    }
    const cached = localStorage.getItem(`neuroconecta_plan_${subjectId}`);
    if (cached) return JSON.parse(cached);

    // Fallback padrão neuroafirmativo
    return {
      id: `plan-${subjectId}`,
      subjectId,
      version: 1,
      updatedAt: new Date().toISOString(),
      updatedBy: profile.preferredName || "Usuário",
      communicationPreferences: [
        "Prefere instruções diretas, claras e fracionadas por escrito.",
        "Em momentos de sobrecarga, aceita respostas por cartões de texto, apontamento ou chat.",
      ],
      sensoryOverloadSigns: [
        "Cobre os ouvidos ou apoia a cabeça na mesa.",
        "Inquietação motora e necessidade de stimming.",
        "Redução drástica ou suspensão da fala verbal espontânea (shutdown).",
      ],
      helpfulStrategies: [
        "Pausa no Cantinho da Calma ou ambiente com iluminação reduzida.",
        "Permissão irrestrita para uso de fones abafadores de ruído.",
        "Oferecer água fresca e dar tempo sem cobranças imediatas.",
      ],
      whatToAvoid: [
        "Não tocar a pessoa subitamente sem consentimento prévio.",
        "Não exigir contato visual direto nem insistir em explicações longas durante a crise.",
        "Não interpretar a sobrecarga como birra ou desafio à autoridade.",
      ],
      transitionAlerts: "Avisar com 5 a 10 minutos de antecedência sobre trocas de atividade ou horários.",
      breakRequestProtocol: "O aluno/indivíduo pode exibir o cartão de pausa visual para se retirar temporariamente.",
      schoolAccommodationsAgreed: [
        "Tempo estendido (50% a mais) em provas e trabalhos.",
        "Avaliações com enunciados diretos e opções de resposta com apoio visual.",
        "Assento posicionado longe de portas de grande fluxo e caixas de som.",
      ],
      authorizedSupportContacts: profile.emergencyContacts?.map((c) => ({
        name: c.name,
        phone: c.phone,
        role: c.relationship,
      })) || [],
    };
  },

  async updateFunctionalPlan(
    plan: FunctionalSupportPlan,
    profile: UserProfile
  ): Promise<FunctionalSupportPlan> {
    try {
      const res = await fetch(`/api/functional-plan/${encodeURIComponent(plan.subjectId)}`, {
        method: "PUT",
        headers: getHeaders(profile),
        body: JSON.stringify(plan),
      });
      if (res.ok) {
        const data = await res.json();
        return data.plan;
      }
    } catch (e) {
      console.warn("Fallback ao salvar plano funcional:", e);
    }
    const updated: FunctionalSupportPlan = {
      ...plan,
      version: (plan.version || 1) + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: profile.preferredName || "Usuário",
    };
    localStorage.setItem(`neuroconecta_plan_${plan.subjectId}`, JSON.stringify(updated));
    return updated;
  },

  // --- PEI DRAFT VERSIONS ---
  async getPeiVersions(subjectId: string, profile: UserProfile): Promise<PeiDraftVersion[]> {
    try {
      const res = await fetch(`/api/pei/versions/${encodeURIComponent(subjectId)}`, {
        headers: getHeaders(profile),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(`neuroconecta_pei_${subjectId}`, JSON.stringify(data.versions));
        return data.versions;
      }
    } catch (e) {
      console.warn("Offline/Fallback ao buscar versões do PEI:", e);
    }
    const cached = localStorage.getItem(`neuroconecta_pei_${subjectId}`);
    return cached ? JSON.parse(cached) : [];
  },

  async createPeiVersion(
    draft: Omit<PeiDraftVersion, "id" | "version" | "createdAt">,
    profile: UserProfile
  ): Promise<PeiDraftVersion> {
    try {
      const res = await fetch("/api/pei/versions", {
        method: "POST",
        headers: getHeaders(profile),
        body: JSON.stringify(draft),
      });
      if (res.ok) {
        const data = await res.json();
        return data.version;
      }
    } catch (e) {
      console.warn("Fallback ao criar versão do PEI:", e);
    }
    const cached = await this.getPeiVersions(draft.subjectId, profile);
    const nextVer = cached.length > 0 ? Math.max(...cached.map((p) => p.version)) + 1 : 1;
    const fallback: PeiDraftVersion = {
      ...draft,
      id: `pei-local-v${nextVer}`,
      version: nextVer,
      createdAt: new Date().toISOString(),
    };
    const updated = [fallback, ...cached];
    localStorage.setItem(`neuroconecta_pei_${draft.subjectId}`, JSON.stringify(updated));
    return fallback;
  },

  // --- SCHOOL-FAMILY MESSAGES ---
  async getSchoolFamilyMessages(subjectId: string, profile: UserProfile): Promise<SchoolFamilyMessage[]> {
    try {
      const res = await fetch(`/api/school-family-comm/${encodeURIComponent(subjectId)}`, {
        headers: getHeaders(profile),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(`neuroconecta_school_comm_${subjectId}`, JSON.stringify(data.messages));
        return data.messages;
      }
    } catch (e) {
      console.warn("Offline/Fallback ao buscar mensagens escola-família:", e);
    }
    const cached = localStorage.getItem(`neuroconecta_school_comm_${subjectId}`);
    return cached ? JSON.parse(cached) : [];
  },

  async createSchoolFamilyMessage(
    msg: Omit<SchoolFamilyMessage, "id" | "createdAt" | "readByOtherContext">,
    profile: UserProfile
  ): Promise<SchoolFamilyMessage> {
    try {
      const res = await fetch("/api/school-family-comm", {
        method: "POST",
        headers: getHeaders(profile),
        body: JSON.stringify(msg),
      });
      if (res.ok) {
        const data = await res.json();
        return data.message;
      }
    } catch (e) {
      console.warn("Fallback ao criar mensagem escola-família:", e);
    }
    const fallback: SchoolFamilyMessage = {
      ...msg,
      id: `msg-local-${Date.now()}`,
      authorName: profile.preferredName || "Remetente",
      readByOtherContext: false,
      createdAt: new Date().toISOString(),
    };
    const cached = await this.getSchoolFamilyMessages(msg.subjectId, profile);
    const updated = [fallback, ...cached];
    localStorage.setItem(`neuroconecta_school_comm_${msg.subjectId}`, JSON.stringify(updated));
    return fallback;
  },
};
