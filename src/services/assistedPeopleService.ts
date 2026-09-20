import { supabase } from "../lib/supabase";
import { auditService } from "./auditService";
import { AssistedUserSummary } from "../types";

export interface CreateAssistedPersonParams {
  displayName: string;
  preferredName?: string;
  birthDate?: string;
  registrationNumber?: string;
  institutionName?: string;
  classGroup?: string;
  relationshipType: "aluno" | "aprendente" | "paciente" | "assistido";
  supportLevel?: 1 | 2 | 3 | "nao_especificado";
  notes?: string;
}

export const assistedPeopleService = {
  /**
   * Retorna todas as pessoas assistidas vinculadas ao profissional logado
   * Busca diretamente de professional_assisted_links e assisted_people no Supabase
   */
  async getAssistedPeopleByProfessional(professionalUserId: string): Promise<AssistedUserSummary[]> {
    if (!professionalUserId) return [];

    const { data: links, error: linksError } = await supabase
      .from("professional_assisted_links")
      .select(`
        id,
        professional_user_id,
        assisted_user_id,
        relationship_type,
        institution_name,
        class_group,
        status,
        created_at
      `)
      .eq("professional_user_id", professionalUserId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (linksError) {
      console.error("[AssistedPeopleService] Erro ao buscar links:", linksError);
      throw new Error(`Falha ao consultar pessoas assistidas: ${linksError.message}`);
    }

    if (!links || links.length === 0) {
      return [];
    }

    const assistedIds = links.map((l) => l.assisted_user_id);

    // Busca os dados cadastrais em assisted_people
    const { data: people, error: peopleError } = await supabase
      .from("assisted_people")
      .select("*")
      .in("id", assistedIds);

    if (peopleError) {
      console.error("[AssistedPeopleService] Erro ao buscar assisted_people:", peopleError);
      throw new Error(`Falha ao consultar dados de assisted_people: ${peopleError.message}`);
    }

    const peopleMap = new Map<string, any>();
    if (people) {
      people.forEach((p) => peopleMap.set(p.id, p));
    }

    // Também verifica se há algum perfil complementar em profiles (se aplicável)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, preferred_name, birth_date, support_level, ciptea_number")
      .in("id", assistedIds);

    const profilesMap = new Map<string, any>();
    if (profiles) {
      profiles.forEach((p) => profilesMap.set(p.id, p));
    }

    return links.map((link) => {
      const person = peopleMap.get(link.assisted_user_id) || {};
      const prof = profilesMap.get(link.assisted_user_id) || {};

      const displayName = person.full_name || prof.display_name || "Atendido";
      const preferredName = person.preferred_name || prof.preferred_name || displayName.split(" ")[0];
      const birthDate = person.birth_date || prof.birth_date;

      return {
        id: link.assisted_user_id,
        displayName,
        preferredName,
        birthDate,
        registrationNumber: person.registration_number,
        institutionName: link.institution_name || person.institution_name,
        classGroup: link.class_group || person.class_group,
        relationshipType: (link.relationship_type as any) || "assistido",
        supportLevel: person.support_level || prof.support_level || "nao_especificado",
        knownStrengths: person.known_strengths || [],
        knownSensoryPreferences: person.sensory_preferences || [],
        knownEffectiveStrategies: person.effective_strategies || [],
      };
    });
  },

  /**
   * Cria uma pessoa assistida em assisted_people e imediatamente vincula ao profissional em professional_assisted_links
   * Ambas as operações são auditadas e lançam erro caso o Supabase falhe.
   */
  async createAndLinkAssistedPerson(
    professionalUserId: string,
    params: CreateAssistedPersonParams
  ): Promise<AssistedUserSummary> {
    if (!professionalUserId) {
      throw new Error("ID do profissional é obrigatório para cadastrar pessoa assistida.");
    }
    if (!params.displayName || !params.displayName.trim()) {
      throw new Error("Nome completo do assistido é obrigatório.");
    }

    // 1. Inserir em assisted_people
    const { data: createdPerson, error: personError } = await supabase
      .from("assisted_people")
      .insert({
        full_name: params.displayName.trim(),
        preferred_name: params.preferredName?.trim() || params.displayName.trim().split(" ")[0],
        birth_date: params.birthDate || null,
        registration_number: params.registrationNumber?.trim() || null,
        institution_name: params.institutionName?.trim() || null,
        class_group: params.classGroup?.trim() || null,
        support_level: params.supportLevel || null,
        notes: params.notes?.trim() || null,
        created_by: professionalUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (personError) {
      console.error("[AssistedPeopleService] Erro ao criar assisted_people:", personError);
      throw new Error(`Falha ao registrar pessoa assistida no Supabase: ${personError.message}`);
    }

    const assistedPersonId = createdPerson.id;

    // 2. Inserir em professional_assisted_links
    const { error: linkError } = await supabase
      .from("professional_assisted_links")
      .insert({
        professional_user_id: professionalUserId,
        assisted_user_id: assistedPersonId,
        relationship_type: params.relationshipType,
        institution_name: params.institutionName?.trim() || null,
        class_group: params.classGroup?.trim() || null,
        status: "active",
        created_at: new Date().toISOString(),
      });

    if (linkError) {
      console.error("[AssistedPeopleService] Erro ao criar professional_assisted_links:", linkError);
      throw new Error(`Falha ao vincular pessoa assistida ao profissional no Supabase: ${linkError.message}`);
    }

    // 3. Registrar auditoria canônica
    await auditService.log({
      actorUserId: professionalUserId,
      action: "ASSISTED_PERSON_CREATED",
      entityType: "assisted_people",
      entityId: assistedPersonId,
      afterData: {
        fullName: createdPerson.full_name,
        relationshipType: params.relationshipType,
        institutionName: params.institutionName,
      },
      source: "assistedPeopleService.createAndLinkAssistedPerson",
    });

    return {
      id: assistedPersonId,
      displayName: createdPerson.full_name,
      preferredName: createdPerson.preferred_name,
      birthDate: createdPerson.birth_date,
      registrationNumber: createdPerson.registration_number,
      institutionName: params.institutionName,
      classGroup: params.classGroup,
      relationshipType: params.relationshipType,
      supportLevel: params.supportLevel || "nao_especificado",
      knownStrengths: [],
      knownSensoryPreferences: [],
      knownEffectiveStrategies: [],
    };
  },

  /**
   * Vincula um usuário já existente (por ID canônico) ao escopo do profissional
   */
  async linkExistingUser(
    professionalUserId: string,
    assistedUserId: string,
    relationshipType: "aluno" | "aprendente" | "paciente" | "assistido",
    institutionName?: string,
    classGroup?: string
  ): Promise<void> {
    const { error } = await supabase
      .from("professional_assisted_links")
      .upsert({
        professional_user_id: professionalUserId,
        assisted_user_id: assistedUserId,
        relationship_type: relationshipType,
        institution_name: institutionName || null,
        class_group: classGroup || null,
        status: "active",
        created_at: new Date().toISOString(),
      }, { onConflict: "professional_user_id,assisted_user_id" });

    if (error) {
      throw new Error(`Falha ao vincular usuário assistido: ${error.message}`);
    }

    await auditService.log({
      actorUserId: professionalUserId,
      action: "ASSISTED_USER_LINKED",
      entityType: "professional_assisted_links",
      entityId: assistedUserId,
      afterData: { relationshipType, institutionName, classGroup },
      source: "assistedPeopleService.linkExistingUser",
    });
  },
};
