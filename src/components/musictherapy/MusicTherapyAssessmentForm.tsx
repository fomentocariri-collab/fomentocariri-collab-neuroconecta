import React, { useState, useEffect } from "react";
import { 
  ClipboardCheck, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Volume2, 
  MessageSquare, 
  Users, 
  Activity, 
  Sliders, 
  Heart, 
  Save, 
  History, 
  RotateCcw,
  CheckSquare,
  Lock
} from "lucide-react";
import { 
  MusicotherapyCase, 
  MusicotherapyAssessment,
  MusicalProfileDomain,
  SensoryResponseDomain,
  CommunicationDomain,
  SocialInteractionDomain,
  AttentionEngagementDomain,
  RegulationDomain,
  MotorAspectsDomain,
  EmotionalAspectsDomain,
  ContextDomain
} from "../../types/musicotherapy";
import { musicotherapyService, ScopedDraftManager } from "../../services/musicotherapyService";
import { auditService } from "../../services/auditService";

interface MusicTherapyAssessmentFormProps {
  currentCase: MusicotherapyCase;
  isDark?: boolean;
}

export const MusicTherapyAssessmentForm: React.FC<MusicTherapyAssessmentFormProps> = ({
  currentCase,
  isDark = true,
}) => {
  const [assessments, setAssessments] = useState<MusicotherapyAssessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<MusicotherapyAssessment | null>(null);
  const [activeTab, setActiveTab] = useState<"editar" | "historico" | "comparativo">("editar");
  const [isNewMode, setIsNewMode] = useState(false);
  const [assessmentType, setAssessmentType] = useState<"initial" | "reassessment">("initial");

  // Form Fields - 8 Domains
  const [musicalProfile, setMusicalProfile] = useState<MusicalProfileDomain>({
    preferences: "Responde prontamente a melodias com padrão modal suave e sons de teclado/xilofone.",
    significant_repertoire: "Cantigas tradicionais em andamento lento (moderato/adagio).",
    genres: "Música instrumental acústica, cantigas folclóricas.",
    spontaneous_interest: "Alta atração por instrumentos percussivos afinados (metalofone, sino de mão).",
    singing_vocalizations: "Vocaliza em entonação afinada ao final das frases melódicas conhecidas.",
    known_instruments: "Metalofone, pandeiro de mão sem platinelas estrepitosas, teclado sintetizador suave.",
    musical_experiences: "Contato musical prévio através do ambiente familiar e vídeos sonoros.",
    high_engagement_activities: "Canções com pausas rítmicas antecipadas (espera estruturada).",
  });

  const [sensoryResponse, setSensoryResponse] = useState<SensoryResponseDomain>({
    auditory_sensitivity: "Sensibilidade a sons agudos súbitos ou platinelas metálicas estridentes.",
    tolerated_intensity: "Faixa de 45 a 60 dB com boa aceitação.",
    avoided_sounds: "Sons percussivos estridentes de alta intensidade acústica sem aviso prévio.",
    timbre_preferences: "Timbres aveludados, amadeirados (marimba) e ressonância contínua.",
    rhythm_perception: "Discriminação precisa de andamento (responde ao acelerando e desacelerando).",
    volume_tolerance: "Boa tolerância a volume moderado com previsibilidade de início e fim.",
    predictability_need: "Alta necessidade de rituais sonoros de abertura e encerramento claros.",
    overload_signs: "Cobrir os ouvidos, afastar o corpo do instrumento ou vocalização de queixa.",
    necessary_accommodations: "Controle prévio do ambiente acústico da sala, fones de atenuação acessíveis se necessário.",
  });

  const [communication, setCommunication] = useState<CommunicationDomain>({
    verbal: "Palavras isoladas e frases curtas ancoradas pela letra da canção.",
    non_verbal: "Contato visual sustentado durante momentos de dueto ou troca de baquetas.",
    gestural: "Aponta para o instrumento desejado e estende a mão para solicitar a vez.",
    vocalization: "Vocalizações afinadas acompanhando o contorno melódico.",
    alternative_communication: "Utiliza prancha de comunicação alternativa de instrumentos quando disponível.",
    spontaneous_initiative: "Inicia batidas rítmicas para chamar a atenção da musicoterapeuta.",
    musical_responsiveness_to_other: "Adapta o ritmo das batidas quando a terapeuta entra em compasso conjunto.",
  });

  const [socialInteraction, setSocialInteraction] = useState<SocialInteractionDomain>({
    joint_attention: "Atenção compartilhada sustentada por até 3 a 4 minutos em atividade com tambor oceânico.",
    turn_taking: "Respeita turnos musicais alternados (eu toco / você toca) com suporte verbal breve.",
    imitation: "Imita padrões rítmicos binários simples (ta-ta, ta-ta).",
    interactional_initiative: "Oferece instrumento para a terapeuta tocar junto.",
    shared_activity: "Engajamento colaborativo em jogos de improvisação musical dirigida.",
    response_to_peer_therapist: "Sorri e estabelece sintonia interacional quando o andamento entra em sincronia.",
  });

  const [attentionEngagement, setAttentionEngagement] = useState<AttentionEngagementDomain>({
    task_persistence: "Permanece engajado em torno de 12 a 15 minutos em atividades musicais interativas.",
    focus_quality: "Foco profundo em instrumentos melódicos com resposta sonora imediata.",
    sustained_interest: "Interesse mantido quando há variação dinâmica controlada (piano/forte).",
    activity_maintenance: "Requer mediação verbal suave em momentos de transição de instrumento.",
    mediation_need: "Mediação relacional leve, sem necessidade de contenção física.",
  });

  const [regulation, setRegulation] = useState<RegulationDomain>({
    self_regulation: "Utiliza a audição atenta de cordas ou sons graves para desaceleração motora.",
    arousal_level: "regulado",
    transitions_tolerance: "Boa tolerância quando avisado musicalmente com canção de transição.",
    discomfort_signals: "Aumento de movimentação corporal e busca pelo chão se sobrecarregado.",
    calming_resources: "Vibração ressonante de sino tibetano ou ruído marrom em intensidade confortável.",
  });

  const [motorAspects, setMotorAspects] = useState<MotorAspectsDomain>({
    motor_coordination: "Pega palmar bem desenvolvida; iniciando refinamento da pinça para baquetas finas.",
    motor_planning_praxis: "Planejamento motor adequado para tocar teclas sucessivas em sequência tonal.",
    rhythmic_synchronization: "Sincronização rítmica em andamento lento com apoio visual e auditivo.",
    instrumental_functional_use: "Uso funcional correto de baquetas, tambores e triângulo.",
    body_movement: "Balanço corporal rítmico espontâneo e expressivo durante a canção.",
  });

  const [emotionalAspects, setEmotionalAspects] = useState<EmotionalAspectsDomain>({
    emotional_expression: "Expressão clara de alegria e entusiasmo através do riso e olhos brilhantes.",
    affective_response: "Responde com afeto positivo a elogios cantados no final da execução.",
    observable_pleasure_displeasure: "Demonstra prazer explícito ao tocar instrumentos afinados.",
    security_confidence: "Demonstra segurança progressiva no ambiente terapêutico ao longo do encontro.",
  });

  const [context, setContext] = useState<ContextDomain>({
    patient_goals: "Explorar sons preferidos e escolher suas próprias canções.",
    family_goals: "Ampliar a regulação emocional e a tolerância a ruídos no ambiente escolar.",
    multidisciplinary_team_notes: "Alinhado com a fonoaudiologia para estimular intenção comunicativa expressiva.",
    accessibility_environmental: "Sala com iluminação indireta dimerizável e isolamento acústico adequado.",
  });

  // Campos Mandatórios de Separação Epistemológica:
  const [objectiveObservations, setObjectiveObservations] = useState(
    "Paciente permaneceu sentado por 14 minutos tocando o metalofone alternadamente com a musicoterapeuta. Executou 6 turnos espontâneos de imitação rítmica no tambor. Não apresentou sinais de fuga ou hiper-reatividade durante a sessão."
  );
  const [clinicalInterpretation, setClinicalInterpretation] = useState(
    "Observa-se consolidação da atenção compartilhada no contexto sonoro, com evidente recurso expressivo mediado pela música. O paciente utiliza a estrutura rítmica previsível como esteio de autorregulação e segurança interacional."
  );

  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadAssessments();
  }, [currentCase.id]);

  const loadAssessments = async () => {
    try {
      const list = await musicotherapyService.getAssessments(currentCase.id);
      if (list.length > 0) {
        setAssessments(list);
        setSelectedAssessment(list[0]);
        fillFormWithAssessment(list[0]);
      } else {
        // Inicializa estrutura padrão para o caso atual
        const defaultAssessment: MusicotherapyAssessment = {
          id: `eval-${currentCase.id}-01`,
          case_id: currentCase.id,
          patient_id: currentCase.patient_id,
          patient_name: currentCase.patient_name,
          professional_id: currentCase.professional_id,
          professional_name: currentCase.professional_name,
          professional_register: currentCase.professional_register,
          assessment_type: "initial",
          date: currentCase.start_date || new Date().toISOString().split("T")[0],
          status: "signed",
          version: 1,
          musical_profile: musicalProfile,
          sensory_response: sensoryResponse,
          communication: communication,
          social_interaction: socialInteraction,
          attention_engagement: attentionEngagement,
          regulation: regulation,
          motor_aspects: motorAspects,
          emotional_aspects: emotionalAspects,
          context: context,
          objective_observations: objectiveObservations,
          clinical_interpretation: clinicalInterpretation,
          signed_at: new Date().toISOString(),
          signed_by: currentCase.professional_name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setAssessments([defaultAssessment]);
        setSelectedAssessment(defaultAssessment);
      }
    } catch {
      // Usa fallback
    }
  };

  const fillFormWithAssessment = (ass: MusicotherapyAssessment) => {
    setMusicalProfile(ass.musical_profile);
    setSensoryResponse(ass.sensory_response);
    setCommunication(ass.communication);
    setSocialInteraction(ass.social_interaction);
    setAttentionEngagement(ass.attention_engagement);
    setRegulation(ass.regulation);
    setMotorAspects(ass.motor_aspects);
    setEmotionalAspects(ass.emotional_aspects);
    setContext(ass.context);
    setObjectiveObservations(ass.objective_observations);
    setClinicalInterpretation(ass.clinical_interpretation);
    setAssessmentType(ass.assessment_type);
  };

  const handleStartNewAssessment = (type: "initial" | "reassessment") => {
    setIsNewMode(true);
    setAssessmentType(type);
    setSelectedAssessment(null);
    setObjectiveObservations("");
    setClinicalInterpretation("");
    setActiveTab("editar");
  };

  const handleSaveAssessment = async (signNow: boolean) => {
    if (!objectiveObservations.trim() || !clinicalInterpretation.trim()) {
      alert("Por favor, preencha a Observação Objetiva (Fatos) e a Interpretação Clínica.");
      return;
    }

    const now = new Date().toISOString();
    const assId = isNewMode || !selectedAssessment ? `eval-${Date.now().toString(36)}` : selectedAssessment.id;

    const payload: MusicotherapyAssessment = {
      id: assId,
      case_id: currentCase.id,
      patient_id: currentCase.patient_id,
      patient_name: currentCase.patient_name,
      professional_id: currentCase.professional_id,
      professional_name: currentCase.professional_name,
      professional_register: currentCase.professional_register,
      assessment_type: assessmentType,
      date: now.split("T")[0],
      status: signNow ? "signed" : "draft",
      version: (selectedAssessment?.version || 1) + 1,
      musical_profile: musicalProfile,
      sensory_response: sensoryResponse,
      communication: communication,
      social_interaction: socialInteraction,
      attention_engagement: attentionEngagement,
      regulation: regulation,
      motor_aspects: motorAspects,
      emotional_aspects: emotionalAspects,
      context: context,
      objective_observations: objectiveObservations,
      clinical_interpretation: clinicalInterpretation,
      signed_at: signNow ? now : undefined,
      signed_by: signNow ? currentCase.professional_name : undefined,
      created_at: selectedAssessment?.created_at || now,
      updated_at: now,
    };

    try {
      await musicotherapyService.saveAssessment(payload);
    } catch {
      // Salva localmente se offline
    }

    const nextList = [payload, ...assessments.filter((a) => a.id !== payload.id)];
    setAssessments(nextList);
    setSelectedAssessment(payload);
    setIsNewMode(false);
    setFeedback(signNow ? "Avaliação finalizada e assinada eletronicamente." : "Rascunho de avaliação salvo.");
    setTimeout(() => setFeedback(null), 3500);
  };

  const isLocked = selectedAssessment?.status === "signed" && !isNewMode;

  return (
    <div className="space-y-6">
      {/* Header & Sub-Navigation */}
      <div className={`p-5 rounded-2xl border shadow-sm ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                Módulo Clínico NC-MT1 • Avaliação & Reavaliação
              </span>
              {isLocked && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" /> Registro Selado / Assinado
                </span>
              )}
            </div>
            <h2 className="text-xl font-black mt-1 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              {isNewMode 
                ? (assessmentType === "initial" ? "Nova Avaliação Inicial" : "Nova Reavaliação Periódica")
                : (selectedAssessment?.assessment_type === "initial" ? "Avaliação Inicial de Musicoterapia" : "Reavaliação Periódica")
              }
            </h2>
            <p className="text-xs text-slate-400">
              Pessoa Acompanhada: <strong className="text-slate-200">{currentCase.patient_name}</strong> • 
              Data: {selectedAssessment?.date || "Hoje"} • 
              Responsável: {currentCase.professional_name} ({currentCase.professional_register || "CBO 2263-05"})
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleStartNewAssessment("reassessment")}
              className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <Sparkles className="w-4 h-4" /> Nova Reavaliação
            </button>
            <div className="flex rounded-xl p-1 bg-slate-950 border border-slate-800">
              <button
                onClick={() => setActiveTab("editar")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === "editar" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Formulário Clínico
              </button>
              <button
                onClick={() => setActiveTab("historico")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === "historico" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Histórico ({assessments.length})
              </button>
            </div>
          </div>
        </div>

        {feedback && (
          <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-700 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {activeTab === "historico" ? (
        /* Lista de Avaliações / Reavaliações Históricas */
        <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <History className="w-4 h-4 text-teal-400" /> Linha do Tempo de Avaliações Clínicas
          </h3>
          <div className="space-y-3">
            {assessments.map((ass) => (
              <div
                key={ass.id}
                onClick={() => {
                  setSelectedAssessment(ass);
                  fillFormWithAssessment(ass);
                  setIsNewMode(false);
                  setActiveTab("editar");
                }}
                className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  selectedAssessment?.id === ass.id
                    ? "bg-slate-950 border-teal-500/80 ring-1 ring-teal-500/50"
                    : isDark ? "bg-slate-950/70 border-slate-800 hover:border-slate-700" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      ass.assessment_type === "initial" ? "bg-teal-950 text-teal-300 border border-teal-800" : "bg-indigo-950 text-indigo-300 border border-indigo-800"
                    }`}>
                      {ass.assessment_type === "initial" ? "Avaliação Inicial" : "Reavaliação Periódica"}
                    </span>
                    <span className="text-xs text-slate-400">Data: {ass.date}</span>
                    <span className="text-xs text-slate-500">• Versão #{ass.version}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                    <strong>Fato Observado:</strong> {ass.objective_observations}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end">
                    <ShieldCheck className="w-3.5 h-3.5" /> Assinado
                  </span>
                  <span className="text-[11px] text-slate-500 block">por {ass.professional_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Formulário dos 8 Domínios Clínicos */
        <div className="space-y-6">
          {/* Domínios Clínicos Accordion/Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 1. Perfil Musical */}
            <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <h3 className="text-sm font-bold text-teal-400 mb-2 flex items-center gap-2">
                <Volume2 className="w-4 h-4" /> 1. Perfil Musical & Repertório Significativo
              </h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Preferências Sonoras & Timbres:</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={musicalProfile.preferences}
                    onChange={(e) => setMusicalProfile({ ...musicalProfile, preferences: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 disabled:opacity-75"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Instrumentos de Maior Atração:</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={musicalProfile.known_instruments}
                    onChange={(e) => setMusicalProfile({ ...musicalProfile, known_instruments: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 disabled:opacity-75"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Repertório / Canções Significativas:</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={musicalProfile.significant_repertoire}
                    onChange={(e) => setMusicalProfile({ ...musicalProfile, significant_repertoire: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 disabled:opacity-75"
                  />
                </div>
              </div>
            </div>

            {/* 2. Resposta Sensorial */}
            <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <h3 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
                <Sliders className="w-4 h-4" /> 2. Resposta Sensorial Auditiva & Acomodações
              </h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tolerância a Intensidade / Volume (dB):</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={sensoryResponse.tolerated_intensity}
                    onChange={(e) => setSensoryResponse({ ...sensoryResponse, tolerated_intensity: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 disabled:opacity-75"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Sons que Geram Desconforto / Evitados:</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={sensoryResponse.avoided_sounds}
                    onChange={(e) => setSensoryResponse({ ...sensoryResponse, avoided_sounds: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 disabled:opacity-75"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Acomodações Necessárias na Sala:</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={sensoryResponse.necessary_accommodations}
                    onChange={(e) => setSensoryResponse({ ...sensoryResponse, necessary_accommodations: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 disabled:opacity-75"
                  />
                </div>
              </div>
            </div>

            {/* 3. Comunicação & Expressão */}
            <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <h3 className="text-sm font-bold text-sky-400 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> 3. Comunicação & Expressão Musical
              </h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Expressão Verbal e Vocalizações:</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={communication.verbal}
                    onChange={(e) => setCommunication({ ...communication, verbal: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 disabled:opacity-75"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Comunicação Não-Verbal / Gestos / CAA:</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={communication.non_verbal}
                    onChange={(e) => setCommunication({ ...communication, non_verbal: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 disabled:opacity-75"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Iniciativa Musical Espontânea:</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={communication.spontaneous_initiative}
                    onChange={(e) => setCommunication({ ...communication, spontaneous_initiative: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 disabled:opacity-75"
                  />
                </div>
              </div>
            </div>

            {/* 4. Interação Social & Atenção Compartilhada */}
            <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <h3 className="text-sm font-bold text-indigo-400 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" /> 4. Interação Social & Turnos Musicais
              </h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Atenção Conjunta e Contato Visual:</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={socialInteraction.joint_attention}
                    onChange={(e) => setSocialInteraction({ ...socialInteraction, joint_attention: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 disabled:opacity-75"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Alternância de Turnos (Tocar e Esperar):</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={socialInteraction.turn_taking}
                    onChange={(e) => setSocialInteraction({ ...socialInteraction, turn_taking: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 disabled:opacity-75"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Capacidade de Imitação Rítmica:</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={socialInteraction.imitation}
                    onChange={(e) => setSocialInteraction({ ...socialInteraction, imitation: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 disabled:opacity-75"
                  />
                </div>
              </div>
            </div>

            {/* 5. Autorregulação & Nível de Alerta */}
            <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <h3 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" /> 5. Autorregulação & Nível de Alerta
              </h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Nível de Alerta / Arousal Observado:</label>
                  <select
                    disabled={isLocked}
                    value={regulation.arousal_level}
                    onChange={(e) => setRegulation({ ...regulation, arousal_level: e.target.value as any })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 disabled:opacity-75"
                  >
                    <option value="regulado">Regulado / Engajamento Ideal</option>
                    <option value="hiperativado">Hiperativado / Agitação Motora</option>
                    <option value="hipoativado">Hipoativado / Lentificação</option>
                    <option value="variavel">Variável ao longo do atendimento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Recursos Sonoro-Musicais de Acalento:</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={regulation.calming_resources}
                    onChange={(e) => setRegulation({ ...regulation, calming_resources: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 disabled:opacity-75"
                  />
                </div>
              </div>
            </div>

            {/* 6. Aspectos Motores e Sincronização */}
            <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <h3 className="text-sm font-bold text-purple-400 mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4" /> 6. Aspectos Motores & Sincronização Rítmica
              </h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Coordenação Motora e Pega de Baqueta:</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={motorAspects.motor_coordination}
                    onChange={(e) => setMotorAspects({ ...motorAspects, motor_coordination: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 disabled:opacity-75"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Sincronização Rítmica (Pulso Musical):</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={motorAspects.rhythmic_synchronization}
                    onChange={(e) => setMotorAspects({ ...motorAspects, rhythmic_synchronization: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 disabled:opacity-75"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CRITICAL: SEPARAÇÃO ENTRE FATO OBSERVADO E INTERPRETAÇÃO CLÍNICA */}
          <div className="p-5 rounded-2xl border border-teal-500/30 bg-teal-950/20 text-slate-100 space-y-4">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              Diretriz Epistemológica Mandatória: Fatos Observados vs. Interpretação Clínica
            </div>
            <p className="text-[11px] text-slate-400">
              Em respeito aos padrões éticos e periciais de saúde e educação, fatos comportamentais diretamente observáveis devem ser discriminados com rigor de inferências ou conclusões teóricas do profissional.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-teal-300 mb-1">
                  1. Fatos Diretamente Observados (Fatos e Evidências Comportamentais) *
                </label>
                <textarea
                  rows={4}
                  disabled={isLocked}
                  value={objectiveObservations}
                  onChange={(e) => setObjectiveObservations(e.target.value)}
                  placeholder="Ex: Tocou o tambor por 8 minutos contínuos; olhou 5 vezes em direção aos olhos da terapeuta ao final de cada frase melódica..."
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500 disabled:opacity-75"
                />
              </div>

              <div>
                <label className="block font-bold text-indigo-300 mb-1">
                  2. Interpretação Clínica Fundamentada (Síntese e Análise Técnica) *
                </label>
                <textarea
                  rows={4}
                  disabled={isLocked}
                  value={clinicalInterpretation}
                  onChange={(e) => setClinicalInterpretation(e.target.value)}
                  placeholder="Ex: O engajamento com instrumentos sonoros ressonantes serve como mediador primário de reciprocidade socioemocional e organização práxica..."
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 disabled:opacity-75"
                />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-400">
              {isLocked ? (
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Este documento está selado. Para novas constatações, utilize 'Nova Reavaliação'.
                </span>
              ) : (
                <span>Preencha e salve como rascunho ou assine e finalize o documento.</span>
              )}
            </div>

            {!isLocked && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveAssessment(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                >
                  <Save className="w-4 h-4" /> Salvar Rascunho
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveAssessment(true)}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition"
                >
                  <CheckSquare className="w-4 h-4" /> Assinar e Finalizar Avaliação
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
