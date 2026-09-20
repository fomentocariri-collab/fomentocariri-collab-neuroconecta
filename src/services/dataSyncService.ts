import { supabase } from "../lib/supabase";
import { auditService } from "./auditService";
import { SavedTestResult, RoutineTask, MoodLogEntry } from "../types";

export interface SyncStatus {
  lastSyncTime: string | null;
  migratedLegacyRecordsCount: number;
  isMigrating: boolean;
  isSyncing: boolean;
  remoteAvailable: boolean;
  error?: string | null;
}

export const dataSyncService = {
  /**
   * Safe idempotent migration of legacy localStorage data to Supabase
   * Tagged with source = 'legacy_local_import' and owner_user_id = auth.users.id
   */
  async migrateLegacyLocalData(authUserId: string): Promise<number> {
    if (!authUserId) return 0;

    const migrationKey = `neuroconecta_migrated_${authUserId}`;
    if (localStorage.getItem(migrationKey) === "completed") {
      // Already migrated for this user, do not duplicate
      return 0;
    }

    let migratedTotal = 0;

    try {
      // 1. Migrate Test History
      try {
        const rawTests = localStorage.getItem("neuroconecta_test_history");
        if (rawTests) {
          const tests: SavedTestResult[] = JSON.parse(rawTests);
          if (Array.isArray(tests) && tests.length > 0) {
            const rows = tests.map((t) => {
              const pct = t.maxScore > 0 ? Math.round((t.score / t.maxScore) * 100) : 0;
              return {
                id: t.id || `mig_test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                owner_user_id: authUserId,
                test_id: t.testId,
                test_title: t.testTitle,
                date: t.date,
                score: t.score,
                max_score: t.maxScore,
                interpretation_level: t.interpretationLevel,
                percentage: pct,
                source: "legacy_local_import",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
            });

            const { error } = await supabase.from("test_history").upsert(rows, { onConflict: "id" });
            if (!error) {
              migratedTotal += rows.length;
            }
          }
        }
      } catch (e) {
        console.warn("Aviso migração test_history:", e);
      }

      // 2. Migrate Routine Tasks
      try {
        const rawRoutines = localStorage.getItem("neuroconecta_routine_tasks");
        if (rawRoutines) {
          const tasks: any[] = JSON.parse(rawRoutines);
          if (Array.isArray(tasks) && tasks.length > 0) {
            const rows = tasks.map((tk) => ({
              id: tk.id || `mig_task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              owner_user_id: authUserId,
              title: tk.title,
              category: tk.category || "autocuidado",
              target_time: tk.reminderTime || tk.target_time || null,
              duration_minutes: tk.estimatedMinutes || tk.duration_minutes || 15,
              icon: tk.iconName || tk.icon || "CheckCircle2",
              completed: !!tk.completed,
              urgency: tk.timeSlot || tk.urgency || null,
              energy_level: tk.energyLevel || null,
              source: "legacy_local_import",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));

            const { error } = await supabase.from("routine_tasks").upsert(rows, { onConflict: "id" });
            if (!error) {
              migratedTotal += rows.length;
            }
          }
        }
      } catch (e) {
        console.warn("Aviso migração routine_tasks:", e);
      }

      // 3. Migrate Mood Logs
      try {
        const rawMoods = localStorage.getItem("neuroconecta_mood_logs");
        if (rawMoods) {
          const moods: any[] = JSON.parse(rawMoods);
          if (Array.isArray(moods) && moods.length > 0) {
            const rows = moods.map((m) => ({
              id: m.id || `mig_mood_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              owner_user_id: authUserId,
              date: m.date || new Date().toISOString().split("T")[0],
              time: m.time || "12:00",
              mood_score: m.energyLevel || m.moodScore || 3,
              energy_score: m.energyLevel || m.energyScore || 3,
              sensory_overload: !!m.sensoryOverload || m.sensoryLevel >= 4,
              note: m.notes || m.note || null,
              source: "legacy_local_import",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));

            const { error } = await supabase.from("mood_logs").upsert(rows, { onConflict: "id" });
            if (!error) {
              migratedTotal += rows.length;
            }
          }
        }
      } catch (e) {
        console.warn("Aviso migração mood_logs:", e);
      }

      // 4. Migrate Caregiver Notes
      try {
        const rawCaregiver = localStorage.getItem("neuroconecta_caregiver_notes") || localStorage.getItem("neuroconecta_caregiver_logs");
        if (rawCaregiver) {
          const notes = JSON.parse(rawCaregiver);
          if (Array.isArray(notes) && notes.length > 0) {
            const rows = notes.map((n: any) => ({
              id: n.id || `mig_care_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              owner_user_id: authUserId,
              date: n.date || new Date().toISOString().split("T")[0],
              note: n.note || n.text || "",
              tag: n.tag || "geral",
              source: "legacy_local_import",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));

            const { error } = await supabase.from("caregiver_logs").upsert(rows, { onConflict: "id" });
            if (!error) {
              migratedTotal += rows.length;
            }
          }
        }
      } catch (e) {
        console.warn("Aviso migração caregiver_logs:", e);
      }

      // 5. Migrate Agenda Events
      try {
        const rawAgenda = localStorage.getItem("neuroconecta_agenda_events");
        if (rawAgenda) {
          const evts = JSON.parse(rawAgenda);
          if (Array.isArray(evts) && evts.length > 0) {
            const rows = evts.map((e: any) => ({
              id: e.id || `mig_agenda_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              owner_user_id: authUserId,
              title: e.title || "Compromisso",
              category: e.category || "consulta",
              date: e.date || new Date().toISOString().split("T")[0],
              time: e.time || "09:00",
              professional_or_place: e.professionalOrPlace || e.professional_or_place || null,
              notes: e.notes || null,
              completed: !!e.completed,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));

            const { error } = await supabase.from("agenda_events").upsert(rows, { onConflict: "id" });
            if (!error) {
              migratedTotal += rows.length;
            }
          }
        }
      } catch (e) {
        console.warn("Aviso migração agenda_events:", e);
      }

      // 6. Migrate Global Patients / Cadastros Locais
      try {
        const rawPatients = localStorage.getItem("neuroconecta_global_patients");
        if (rawPatients) {
          const patients: any[] = JSON.parse(rawPatients);
          if (Array.isArray(patients) && patients.length > 0) {
            for (const p of patients) {
              if (p.name) {
                const personPayload = {
                  id: p.id || `pat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                  full_name: p.name,
                  preferred_name: p.preferredName || p.name.split(" ")[0],
                  birth_date: p.birthDate || null,
                  registration_number: p.cpf || p.ciptea || p.registrationNumber || null,
                  support_level: p.supportLevel || null,
                  created_by: authUserId,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };
                const { error: pErr } = await supabase.from("assisted_people").upsert(personPayload, { onConflict: "id" });
                if (!pErr) {
                  migratedTotal += 1;
                  // Ensure link to this user
                  await supabase.from("professional_assisted_links").upsert({
                    professional_user_id: authUserId,
                    assisted_user_id: personPayload.id,
                    relationship_type: p.role || "paciente",
                    status: "active",
                    created_at: new Date().toISOString(),
                  }, { onConflict: "professional_user_id,assisted_user_id" });
                }
              }
            }
          }
        }
      } catch (e) {
        console.warn("Aviso migração assisted_people:", e);
      }

      // Mark migration completed
      localStorage.setItem(migrationKey, "completed");

      // Log in immutable audit trail
      await auditService.log({
        actorUserId: authUserId,
        action: "LEGACY_DATA_MIGRATED",
        entityType: "system_migration",
        entityId: authUserId,
        afterData: { totalRecordsMigrated: migratedTotal },
        source: "dataSyncService.migrateLegacyLocalData",
      });

      return migratedTotal;
    } catch (globalErr) {
      console.error("Falha geral na migração de legados:", globalErr);
      return migratedTotal;
    }
  },

  /**
   * Pulls remote data from Supabase for this user and populates active local caches
   * ensuring that a user logging in on Device B instantly sees their data from Device A!
   */
  async pullRemoteUserData(authUserId: string): Promise<void> {
    if (!authUserId) return;

    try {
      // 1. Fetch Test History
      const { data: tests, error: errTests } = await supabase
        .from("test_history")
        .select("*")
        .eq("owner_user_id", authUserId)
        .order("created_at", { ascending: false });

      if (!errTests && tests && tests.length > 0) {
        const localFormat: SavedTestResult[] = tests.map((row: any) => ({
          id: row.id,
          testId: row.test_id,
          testTitle: row.test_title,
          date: row.date,
          score: Number(row.score),
          maxScore: Number(row.max_score),
          interpretationLevel: row.interpretation_level,
          technicalReview: row.interpretation_level || "Resultado registrado.",
          recommendation: "Consulte o Centro de Testes ou seu profissional de referência para diretrizes personalizadas.",
        }));
        localStorage.setItem("neuroconecta_test_history", JSON.stringify(localFormat));
        localStorage.setItem(`neuroconecta_test_history_${authUserId}`, JSON.stringify(localFormat));
      }

      // 2. Fetch Routine Tasks
      const { data: routines, error: errRoutines } = await supabase
        .from("routine_tasks")
        .select("*")
        .eq("owner_user_id", authUserId)
        .order("created_at", { ascending: true });

      if (!errRoutines && routines && routines.length > 0) {
        const localFormat: RoutineTask[] = routines.map((row: any) => ({
          id: row.id,
          title: row.title,
          category: row.category as any,
          timeSlot: (row.urgency as any) || "manha",
          completed: !!row.completed,
          estimatedMinutes: row.duration_minutes || 15,
          iconName: row.icon || "CheckCircle2",
          reminderTime: row.target_time,
        }));
        localStorage.setItem("neuroconecta_routine_tasks", JSON.stringify(localFormat));
      }

      // 3. Fetch Mood Logs
      const { data: moods, error: errMoods } = await supabase
        .from("mood_logs")
        .select("*")
        .eq("owner_user_id", authUserId)
        .order("created_at", { ascending: false });

      if (!errMoods && moods && moods.length > 0) {
        const localFormat: MoodLogEntry[] = moods.map((row: any) => ({
          id: row.id,
          date: row.date,
          time: row.time,
          energyLevel: Number(row.energy_score) || 3,
          sensoryLevel: row.sensory_overload ? 5 : 2,
          notes: row.note,
          privacyLevel: "private",
        }));
        localStorage.setItem("neuroconecta_mood_logs", JSON.stringify(localFormat));
      }

      // 4. Fetch Agenda Events
      const { data: agendaEvents, error: errAgenda } = await supabase
        .from("agenda_events")
        .select("*")
        .eq("owner_user_id", authUserId)
        .order("date", { ascending: true });

      if (!errAgenda && agendaEvents && agendaEvents.length > 0) {
        const localFormat = agendaEvents.map((row: any) => ({
          id: row.id,
          title: row.title,
          category: row.category,
          date: row.date,
          time: row.time,
          professionalOrPlace: row.professional_or_place,
          notes: row.notes,
          completed: !!row.completed,
        }));
        localStorage.setItem("neuroconecta_agenda_events", JSON.stringify(localFormat));
      }

      // 5. Fetch Caregiver Logs
      const { data: careLogs, error: errCare } = await supabase
        .from("caregiver_logs")
        .select("*")
        .eq("owner_user_id", authUserId)
        .order("created_at", { ascending: false });

      if (!errCare && careLogs && careLogs.length > 0) {
        const localFormat = careLogs.map((row: any) => ({
          id: row.id,
          date: row.date,
          note: row.note,
          tag: row.tag || "Observação",
        }));
        localStorage.setItem("neuroconecta_caregiver_logs", JSON.stringify(localFormat));
      }

      // 6. Fetch Assisted People (Pacientes e Cadastros Globais)
      const { data: links, error: errLinks } = await supabase
        .from("professional_assisted_links")
        .select("assisted_user_id, relationship_type")
        .eq("professional_user_id", authUserId);

      if (!errLinks && links && links.length > 0) {
        const assistedIds = links.map(l => l.assisted_user_id);
        const { data: people, error: errPeople } = await supabase
          .from("assisted_people")
          .select("*")
          .in("id", assistedIds);

        if (!errPeople && people && people.length > 0) {
          const currentGlobal: any[] = (() => {
            try {
              return JSON.parse(localStorage.getItem("neuroconecta_global_patients") || "[]");
            } catch {
              return [];
            }
          })();

          const mergedMap = new Map<string, any>();
          currentGlobal.forEach(p => mergedMap.set(p.id, p));

          people.forEach((p: any) => {
            mergedMap.set(p.id, {
              id: p.id,
              name: p.full_name,
              preferredName: p.preferred_name,
              birthDate: p.birth_date,
              cpf: p.registration_number,
              supportLevel: p.support_level,
              role: links.find(l => l.assisted_user_id === p.id)?.relationship_type || "paciente",
            });
          });

          localStorage.setItem("neuroconecta_global_patients", JSON.stringify(Array.from(mergedMap.values())));
        }
      }
    } catch (err) {
      console.warn("Aviso ao puxar dados remotos do usuário:", err);
    }
  },

  /**
   * Full bidirectional synchronization:
   * 1. Migrates unsynced local data to Supabase
   * 2. Pulls remote records down to ensure multi-device consistency
   */
  async syncFullBidirectional(authUserId: string): Promise<{ migratedLegacyCount: number }> {
    const migrated = await this.migrateLegacyLocalData(authUserId);
    await this.pullRemoteUserData(authUserId);
    return { migratedLegacyCount: migrated };
  },
};
