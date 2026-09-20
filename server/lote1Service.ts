import fs from "fs";
import path from "path";
import {
  ShareGrant,
  ExtendedMoodLogEntry,
  SensoryCheckinRecord,
  FunctionalSupportPlan,
  PeiDraftVersion,
  SchoolFamilyMessage,
} from "../src/types";

const STORAGE_DIR = path.join(process.cwd(), "data", "storage");

if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

function getFilePath(filename: string): string {
  return path.join(STORAGE_DIR, filename);
}

function readJsonFile<T>(filename: string, fallback: T): T {
  try {
    const file = getFilePath(filename);
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(fallback, null, 2), "utf-8");
      return fallback;
    }
    const raw = fs.readFileSync(file, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Erro ao ler ${filename}:`, err);
    return fallback;
  }
}

function writeJsonFile<T>(filename: string, data: T): void {
  try {
    const file = getFilePath(filename);
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`Erro ao salvar ${filename}:`, err);
  }
}

// Interface de Auditoria
export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  subjectId: string;
  timestamp: string;
  context: string;
}

export function logAudit(entry: Omit<AuditLogEntry, "id" | "timestamp">): void {
  const logs = readJsonFile<AuditLogEntry[]>("audit_log.json", []);
  const newEntry: AuditLogEntry = {
    ...entry,
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  logs.unshift(newEntry);
  // Mantém últimos 2000 logs
  if (logs.length > 2000) logs.pop();
  writeJsonFile("audit_log.json", logs);
}

// --- SHARE GRANTS SERVICE ---
export const ShareGrantsService = {
  list(subjectId: string): ShareGrant[] {
    const all = readJsonFile<ShareGrant[]>("share_grants.json", []);
    return all.filter((g) => g.subjectId === subjectId);
  },

  hasActiveGrant(
    subjectId: string,
    resourceType: string,
    context?: string
  ): boolean {
    const all = readJsonFile<ShareGrant[]>("share_grants.json", []);
    return all.some(
      (g) =>
        g.subjectId === subjectId &&
        g.resourceType === resourceType &&
        g.status === "active" &&
        (!context || g.context === context || g.context === "geral")
    );
  },

  create(grant: Omit<ShareGrant, "id" | "status" | "createdAt" | "updatedAt">): ShareGrant {
    const all = readJsonFile<ShareGrant[]>("share_grants.json", []);
    const newGrant: ShareGrant = {
      ...grant,
      id: `grant-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    all.unshift(newGrant);
    writeJsonFile("share_grants.json", all);

    logAudit({
      actorId: grant.grantedBy,
      actorRole: "titular",
      action: "GRANT_PERMISSION",
      resource: "ShareGrant",
      resourceId: newGrant.id,
      subjectId: grant.subjectId,
      context: grant.context,
    });

    return newGrant;
  },

  revoke(grantId: string, actorId: string): ShareGrant | null {
    const all = readJsonFile<ShareGrant[]>("share_grants.json", []);
    const idx = all.findIndex((g) => g.id === grantId);
    if (idx === -1) return null;

    all[idx].status = "revoked";
    all[idx].revokedAt = new Date().toISOString();
    all[idx].updatedAt = new Date().toISOString();
    writeJsonFile("share_grants.json", all);

    logAudit({
      actorId,
      actorRole: "titular",
      action: "REVOKE_PERMISSION",
      resource: "ShareGrant",
      resourceId: grantId,
      subjectId: all[idx].subjectId,
      context: all[idx].context,
    });

    return all[idx];
  },
};

// --- DIARY & MOOD ENTRIES SERVICE ---
export const DiaryEntriesService = {
  list(
    subjectId: string,
    actor: { id: string; role: string; professionalRoleType?: string }
  ): { entries: ExtendedMoodLogEntry[]; deniedPersonalEntriesCount: number } {
    const all = readJsonFile<ExtendedMoodLogEntry[]>("diary_entries.json", []);
    const subjectEntries = all.filter((e) => e.subjectId === subjectId || (!e.subjectId && actor.id === subjectId));

    const isSubject = actor.id === subjectId;
    const isCaregiver = actor.role === "cuidador_educador";
    const isSchool = actor.role === "escola" || actor.professionalRoleType === "educador";
    const isSuperAdmin = actor.role === "superadmin";

    // Verifica se a pessoa concedeu grant para o diário íntimo
    const hasPersonalDiaryGrant = ShareGrantsService.hasActiveGrant(subjectId, "diario_pessoal");

    let allowed: ExtendedMoodLogEntry[] = [];
    let deniedPersonalEntriesCount = 0;

    for (const item of subjectEntries) {
      const entryType = item.entryType || "personal";

      if (entryType === "personal") {
        if (isSubject || hasPersonalDiaryGrant) {
          allowed.push(item);
        } else {
          deniedPersonalEntriesCount++;
        }
      } else if (entryType === "caregiver_observation") {
        // Cuidador e a própria Pessoa podem ver
        allowed.push(item);
      } else if (entryType === "school_note") {
        // Escola, Pessoa e Cuidador autorizado podem ver
        allowed.push(item);
      }
    }

    logAudit({
      actorId: actor.id,
      actorRole: actor.role,
      action: "READ_DIARY_ENTRIES",
      resource: "DiaryEntries",
      subjectId,
      context: isSchool ? "escola" : isCaregiver ? "cuidador" : "pessoa",
    });

    return { entries: allowed, deniedPersonalEntriesCount };
  },

  create(entry: ExtendedMoodLogEntry, actor: { id: string; role: string }): ExtendedMoodLogEntry {
    const all = readJsonFile<ExtendedMoodLogEntry[]>("diary_entries.json", []);
    
    // Assegura autoria correta
    const sanitizedEntry: ExtendedMoodLogEntry = {
      ...entry,
      id: entry.id || `entry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      authorId: actor.id,
      createdAt: entry.createdAt || new Date().toISOString(),
    };

    all.unshift(sanitizedEntry);
    writeJsonFile("diary_entries.json", all);

    logAudit({
      actorId: actor.id,
      actorRole: actor.role,
      action: "CREATE_DIARY_ENTRY",
      resource: "DiaryEntry",
      resourceId: sanitizedEntry.id,
      subjectId: sanitizedEntry.subjectId || actor.id,
      context: sanitizedEntry.entryType || "personal",
    });

    return sanitizedEntry;
  },

  delete(id: string, actor: { id: string; role: string }): boolean {
    const all = readJsonFile<ExtendedMoodLogEntry[]>("diary_entries.json", []);
    const idx = all.findIndex((e) => e.id === id);
    if (idx === -1) return false;

    const target = all[idx];
    // Apenas o próprio autor ou o titular do subjectId pode remover
    if (target.authorId !== actor.id && target.subjectId !== actor.id && actor.role !== "superadmin") {
      return false;
    }

    all.splice(idx, 1);
    writeJsonFile("diary_entries.json", all);

    logAudit({
      actorId: actor.id,
      actorRole: actor.role,
      action: "DELETE_DIARY_ENTRY",
      resource: "DiaryEntry",
      resourceId: id,
      subjectId: target.subjectId || actor.id,
      context: target.entryType || "personal",
    });

    return true;
  },
};

// --- SENSORY CHECKIN RECORDS SERVICE ---
export const SensoryRecordsService = {
  list(subjectId: string): SensoryCheckinRecord[] {
    const all = readJsonFile<SensoryCheckinRecord[]>("sensory_records.json", []);
    return all.filter((r) => r.subjectId === subjectId);
  },

  create(record: SensoryCheckinRecord, actor: { id: string; role: string }): SensoryCheckinRecord {
    const all = readJsonFile<SensoryCheckinRecord[]>("sensory_records.json", []);
    const sanitized: SensoryCheckinRecord = {
      ...record,
      id: record.id || `sensory-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      authorId: actor.id,
      createdAt: record.createdAt || new Date().toISOString(),
    };
    all.unshift(sanitized);
    writeJsonFile("sensory_records.json", all);

    logAudit({
      actorId: actor.id,
      actorRole: actor.role,
      action: "CREATE_SENSORY_CHECKIN",
      resource: "SensoryRecord",
      resourceId: sanitized.id,
      subjectId: sanitized.subjectId,
      context: "regulação_sensorial",
    });

    return sanitized;
  },
};

// --- FUNCTIONAL SUPPORT PLAN SERVICE ---
export const FunctionalPlanService = {
  get(subjectId: string): FunctionalSupportPlan {
    const all = readJsonFile<Record<string, FunctionalSupportPlan>>("functional_plans.json", {});
    if (all[subjectId]) {
      return all[subjectId];
    }
    // Plano inicial padrão neuroafirmativo
    const defaultPlan: FunctionalSupportPlan = {
      id: `plan-${subjectId}`,
      subjectId,
      version: 1,
      updatedAt: new Date().toISOString(),
      updatedBy: subjectId,
      communicationPreferences: [
        "Prefere instruções diretas, claras e fracionadas por escrito.",
        "Em momentos de sobrecarga, aceita respostas por cartões de texto, apontamento ou WhatsApp.",
      ],
      sensoryOverloadSigns: [
        "Cobre os ouvidos com as mãos ou abaixa a cabeça.",
        "Respiração curta ou inquietação motora (stimming aumentado).",
        "Redução drástica ou cessação espontânea da fala verbal (shutdown).",
      ],
      helpfulStrategies: [
        "Permitir ir ao Cantinho da Calma ou ambiente silencioso sem questionamentos.",
        "Uso liberado de fones abafadores de ruído.",
        "Oferecer um copo de água fresca e dar tempo sem cobranças.",
      ],
      whatToAvoid: [
        "Não tocar ou segurar o corpo sem consentimento prévio.",
        "Não exigir contato visual direto nem respostas imediatas.",
        "Não tratar a sobrecarga como birra, afronta ou desobediência.",
      ],
      transitionAlerts: "Avisar com 5 a 10 minutos de antecedência sobre qualquer mudança de sala, tarefa ou rotina.",
      breakRequestProtocol: "O aluno/indivíduo pode exibir o cartão de pausa visual ou sinalizar para se retirar temporariamente.",
      schoolAccommodationsAgreed: [
        "Tempo adicional de 50% em avaliações escritas.",
        "Enunciados claros e objetivos em avaliações.",
        "Assento afastado de portas e caixas de som.",
      ],
      authorizedSupportContacts: [],
    };
    all[subjectId] = defaultPlan;
    writeJsonFile("functional_plans.json", all);
    return defaultPlan;
  },

  update(plan: FunctionalSupportPlan, actor: { id: string; role: string }): FunctionalSupportPlan {
    const all = readJsonFile<Record<string, FunctionalSupportPlan>>("functional_plans.json", {});
    const existing = all[plan.subjectId] || this.get(plan.subjectId);
    
    const updatedPlan: FunctionalSupportPlan = {
      ...plan,
      version: (existing.version || 1) + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.id,
    };
    all[plan.subjectId] = updatedPlan;
    writeJsonFile("functional_plans.json", all);

    logAudit({
      actorId: actor.id,
      actorRole: actor.role,
      action: "UPDATE_FUNCTIONAL_PLAN",
      resource: "FunctionalSupportPlan",
      resourceId: updatedPlan.id,
      subjectId: updatedPlan.subjectId,
      context: "apoio_individual",
    });

    return updatedPlan;
  },
};

// --- PEI DRAFT VERSIONS SERVICE ---
export const PeiService = {
  list(subjectId: string): PeiDraftVersion[] {
    const all = readJsonFile<PeiDraftVersion[]>("pei_versions.json", []);
    return all.filter((p) => p.subjectId === subjectId).sort((a, b) => b.version - a.version);
  },

  createVersion(draft: Omit<PeiDraftVersion, "id" | "version" | "createdAt">, actor: { id: string; role: string }): PeiDraftVersion {
    const all = readJsonFile<PeiDraftVersion[]>("pei_versions.json", []);
    const subjectPeis = all.filter((p) => p.subjectId === draft.subjectId);
    const nextVersion = subjectPeis.length > 0 ? Math.max(...subjectPeis.map((p) => p.version)) + 1 : 1;

    const newVersion: PeiDraftVersion = {
      ...draft,
      id: `pei-${Date.now()}-v${nextVersion}`,
      version: nextVersion,
      createdAt: new Date().toISOString(),
      createdBy: actor.id,
      creatorRole: actor.role,
    };

    all.unshift(newVersion);
    writeJsonFile("pei_versions.json", all);

    logAudit({
      actorId: actor.id,
      actorRole: actor.role,
      action: "CREATE_PEI_DRAFT_VERSION",
      resource: "PeiDraftVersion",
      resourceId: newVersion.id,
      subjectId: newVersion.subjectId,
      context: "educacao_especial_aee",
    });

    return newVersion;
  },
};

// --- SCHOOL-FAMILY BIDIRECTIONAL COMMUNICATION SERVICE ---
export const SchoolFamilyCommService = {
  list(subjectId: string): SchoolFamilyMessage[] {
    const all = readJsonFile<SchoolFamilyMessage[]>("school_family_messages.json", []);
    return all.filter((m) => m.subjectId === subjectId);
  },

  create(msg: Omit<SchoolFamilyMessage, "id" | "createdAt" | "readByOtherContext">, actor: { id: string; role: string }): SchoolFamilyMessage {
    const all = readJsonFile<SchoolFamilyMessage[]>("school_family_messages.json", []);
    const newMsg: SchoolFamilyMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      authorId: actor.id,
      readByOtherContext: false,
      createdAt: new Date().toISOString(),
    };
    all.unshift(newMsg);
    writeJsonFile("school_family_messages.json", all);

    logAudit({
      actorId: actor.id,
      actorRole: actor.role,
      action: "CREATE_SCHOOL_FAMILY_MESSAGE",
      resource: "SchoolFamilyMessage",
      resourceId: newMsg.id,
      subjectId: newMsg.subjectId,
      context: newMsg.authorContext,
    });

    return newMsg;
  },

  markRead(id: string): boolean {
    const all = readJsonFile<SchoolFamilyMessage[]>("school_family_messages.json", []);
    const target = all.find((m) => m.id === id);
    if (!target) return false;
    target.readByOtherContext = true;
    writeJsonFile("school_family_messages.json", all);
    return true;
  },
};
