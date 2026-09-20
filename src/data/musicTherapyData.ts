import { 
  MusicTherapyGoalKey, 
  MusicTherapyInterventionKey, 
  MusicTherapyResponseKey, 
  MusicTherapySession 
} from "../types";

export interface GoalDefinition {
  key: MusicTherapyGoalKey;
  label: string;
  category: string;
  defaultFocus: string;
  clinicalRationale: string;
}

export const MUSIC_THERAPY_GOAL_DEFINITIONS: GoalDefinition[] = [
  {
    key: "comunicacao",
    label: "Comunicação",
    category: "Linguagem & Expressão",
    defaultFocus: "Prosódia, vocalização, turnos comunicativos e intenção expressiva",
    clinicalRationale: "A melodia e a métrica ativam redes bilaterais da linguagem, facilitando a emergência de vocalizações e turnos comunicativos recíprocos."
  },
  {
    key: "interacao_social",
    label: "Interação Social",
    category: "Relacional & Vínculo",
    defaultFocus: "Contato visual mediado pelo som, sincronia interpessoal e cooperação",
    clinicalRationale: "O instrumento musical funciona como terceiro objeto mediador, despressurizando o contato direto e criando espaço seguro para sincronia e empatia."
  },
  {
    key: "atencao",
    label: "Atenção",
    category: "Funções Executivas",
    defaultFocus: "Atenção sustentada ao pulso musical, foco compartilhado e alternância",
    clinicalRationale: "A previsibilidade rítmica ancora os ciclos oscilatórios corticais, treinando controle inibitório e permanência atenta na proposta."
  },
  {
    key: "regulacao_emocional",
    label: "Regulação Emocional",
    category: "Afeto & Sistema Autônomo",
    defaultFocus: "Modulação autonômica do estresse, descompressão e identificação afetiva",
    clinicalRationale: "Andamentos moderados e harmonias modais estáveis ativam o sistema nervoso parassimpático, reduzindo estados de hiperarousal e ansiedade."
  },
  {
    key: "coordenacao_motora",
    label: "Coordenação Motora",
    category: "Neurofuncional & Práxis",
    defaultFocus: "Estimulação auditivo-motora (RAS), dissociação de cinturas e motricidade fina",
    clinicalRationale: "O acoplamento auditivo-motor (córtex auditivo-cerebelo-área motora) otimiza o planejamento motor e a fluidez dos movimentos corporais."
  },
  {
    key: "imitacao",
    label: "Imitação",
    category: "Neurodesenvolvimento",
    defaultFocus: "Espelhamento de padrões rítmicos, gestos sonoros e modulações vocais",
    clinicalRationale: "Estimula o sistema de neurônios-espelho por meio da reprodução de gestos percussivos simples e inflexões sonoras lúdicas."
  },
  {
    key: "integracao_sensorial",
    label: "Integração Sensorial",
    category: "Processamento Sensorial",
    defaultFocus: "Acomodação proprioceptiva (tocar), vibração tátil e tolerância acústica",
    clinicalRationale: "A vibração acústica corporal e a exploração de timbres diversos organizam respostas sensoriais em pessoas com hipo ou hiper-reatividade."
  }
];

export interface InterventionDefinition {
  key: MusicTherapyInterventionKey;
  label: string;
  description: string;
  suggestedTechniques: string[];
  recommendedInstruments: string[];
}

export const MUSIC_THERAPY_INTERVENTIONS: InterventionDefinition[] = [
  {
    key: "canto",
    label: "Canto",
    description: "Uso vocal expressivo para ancoragem afetiva, prosódia e estruturação da fala.",
    suggestedTechniques: [
      "Canção de Acolhimento Previsível",
      "Vocalizações Lúdicas com Vogais Sustentadas",
      "Canção Temática Estruturada com Pausas",
      "Canção de Despedida e Fechamento"
    ],
    recommendedInstruments: ["Voz do Terapeuta", "Microfone Suave", "Ukulele Acompanhador"]
  },
  {
    key: "instrumento",
    label: "Instrumento",
    description: "Exploração instrumental direta para causa-efeito, preensão e expressão não-verbal.",
    suggestedTechniques: [
      "Exploração Sensorial Tátil dos Timbres",
      "Alternância de Turnos Instrumentais",
      "Tocar Forte/Fraco (Dinâmica Sonoro-Motora)",
      "Escolha Autônoma de Instrumento"
    ],
    recommendedInstruments: ["Ocean Drum", "Tambor Xamânico / Djembê", "Xilofone Pentatônico", "Sinos Tubulares", "Teclado com Timbres Quentes"]
  },
  {
    key: "ritmo",
    label: "Ritmo",
    description: "Estruturação temporal neuromotora para ancoragem atencional e regulação motora.",
    suggestedTechniques: [
      "Pulso Isocrônico Estável (60-80 BPM)",
      "Estimulação Auditivo-Motora (RAS)",
      "Jogos Rítmicos de 'Toca e Para' (Controle Inibitório)",
      "Sincronização Bilateral de Mãos"
    ],
    recommendedInstruments: ["Metrônomo Acústico / Visual", "Claves de Madeira", "Chocalhos Suaves", "Bloco Sonoro"]
  },
  {
    key: "improvisacao",
    label: "Improvisação",
    description: "Diálogo sonoro espontâneo onde terapeuta e paciente co-criam a paisagem acústica.",
    suggestedTechniques: [
      "Espelhamento Clínico Sonoro",
      "Diálogo Não-Verbal Pergunta-Resposta",
      "Sustentação Harmônica Estável (Grounding)",
      "Validação Emocional da Expressão Livre"
    ],
    recommendedInstruments: ["Escala Pentatônica (sem notas de tensão)", "Tambor Compartilhado", "Metalofone", "Handpan / Hang Drum"]
  },
  {
    key: "escuta",
    label: "Escuta",
    description: "Experiência receptiva direcionada para dessensibilização, relaxamento ou foco.",
    suggestedTechniques: [
      "Escuta Receptiva Guiada de Relaxamento",
      "Dessensibilização Gradual de Timbre Metálico",
      "Paisagem Sonora Imersiva (Natureza + Harmonia)",
      "Transição Sonoro-Visual Pós-Agitação"
    ],
    recommendedInstruments: ["Fones Over-Ear Acolchoados", "Bolsa de Vibroacústica / Almofada Sonora", "Chime de Vento Koshi"]
  },
  {
    key: "movimento",
    label: "Movimento",
    description: "Integração do corpo no espaço com apoio de pulsos e cadências rítmicas.",
    suggestedTechniques: [
      "Marcha Rítmica com Andamento Estável",
      "Dança Livre com Fitas e Tecidos Sensoriais",
      "Esquema Corporal Apontado pelo Som",
      "Alongamento Guiado por Melodia Fluida"
    ],
    recommendedInstruments: ["Fitas Coloridas", "Passos Sonoros", "Panderola sem Platinelas Estridentes"]
  }
];

export interface ResponseDomainDefinition {
  key: MusicTherapyResponseKey;
  label: string;
  description: string;
  descriptors: Record<number, string>;
}

export const MUSIC_THERAPY_RESPONSE_DOMAINS: ResponseDomainDefinition[] = [
  {
    key: "engajamento",
    label: "Engajamento",
    description: "Nível de motivação intrínseca, adesão ativa e tempo de permanência na atividade musical.",
    descriptors: {
      1: "1 - Mínimo: Recusa, desinteresse ou fuga ativa da atividade",
      2: "2 - Baixo: Participação passiva, necessita de incentivo contínuo",
      3: "3 - Moderado: Engaja em momentos com mediação direta do terapeuta",
      4: "4 - Alto: Adesão constante, foco e curiosidade espontânea",
      5: "5 - Pleno: Liderança, entusiasmo intrínseco e continuidade autônoma"
    }
  },
  {
    key: "tolerancia_sensorial",
    label: "Tolerância Sensorial",
    description: "Resposta do sistema auditivo e tátil aos estímulos sonoros, timbres e volumes.",
    descriptors: {
      1: "1 - Aversão: Sobrecarga sensorial acústica, cobrimento de ouvidos/choro",
      2: "2 - Hiper-reativo: Inquietação ante sons específicos, necessita pausas frequentes",
      3: "3 - Tolerável: Acomoda com volume moderado e instrumentos suaves",
      4: "4 - Boa Acomodação: Conforto em timbres diversos sem sinais de aversão",
      5: "5 - Excelente Integração: Busca e exploração prazerosa de contrastes sonoros"
    }
  },
  {
    key: "interacao",
    label: "Interação",
    description: "Reciprocidade social, contato visual mediado pelo instrumento e alternância de turnos.",
    descriptors: {
      1: "1 - Isolado: Não compartilha o espaço sonoro, foco exclusivamente solitário",
      2: "2 - Contato Breve: Olhares fugazes ou toque incidental no instrumento do terapeuta",
      3: "3 - Reciprocidade Parcial: Responde a estímulos sonoros e aceita trocas guiadas",
      4: "4 - Turnos Sustentados: Alternância rítmica clara ('eu toco, você toca')",
      5: "5 - Iniciativa Social Plena: Convida o terapeuta para tocar em conjunto e celebra a sincronia"
    }
  },
  {
    key: "comunicacao",
    label: "Comunicação",
    description: "Expressão verbal, emissão de fonemas/vocalizações melódicas ou comunicação alternativa.",
    descriptors: {
      1: "1 - Sem Resposta: Nenhuma emissão sonora ou intenção comunicativa visível",
      2: "2 - Vocalização Esparsa: Sons reflexos ou gestos pontuais sem intencionalidade clara",
      3: "3 - Tentativas Vocais/Gestuais: Acompanha refrão com balbucios ou prancha visual",
      4: "4 - Intenção Expressiva Clara: Emite palavras-chave ou modula a voz melodicamente",
      5: "5 - Linguagem Fluida: Canta frases completas ou utiliza a música como diálogo expressivo"
    }
  },
  {
    key: "autorregulacao",
    label: "Autorregulação",
    description: "Capacidade de manter a homeostase fisiológica e comportamental diante da dinâmica sonora.",
    descriptors: {
      1: "1 - Desregulado: Disparada de choro, rigidez ou crise iminente",
      2: "2 - Lenta Recuperação: Necessita contenção ambiental profunda para acalmar",
      3: "3 - Regulado com Suporte: Acalma-se rapidamente com canção de acolhimento ou pulso lento",
      4: "4 - Retorno Autônomo: Percebe a agitação e busca o instrumento relaxante por si",
      5: "5 - Homeostase Plena: Serenidade, respiração ritmada e foco harmonioso"
    }
  },
  {
    key: "comportamento",
    label: "Comportamento",
    description: "Organização postural, respeito à previsibilidade e ausência de condutas disruptivas.",
    descriptors: {
      1: "1 - Disruptivo: Atirar instrumentos, agitação motora extrema ou autoagressão",
      2: "2 - Resistente: Oposição frequente às transições de instrumentos ou atividades",
      3: "3 - Cooperativo com Apoio: Segue regras com suporte de prancha visual",
      4: "4 - Muito Cooperativo: Cuidado com os instrumentos e respeito ao término do som",
      5: "5 - Exemplar: Conduta segura, afetuosa, organizada e autônoma na sala"
    }
  }
];

export function generateAuditHash(session: Partial<MusicTherapySession>): string {
  const seed = `${session.patientName}-${session.date}-${session.sessionNumber}-${session.therapistName}-${JSON.stringify(session.observedResponses || {})}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  const rand = Math.random().toString(16).substring(2, 6);
  return `MT-NC-${hex}-${rand}`.toUpperCase();
}

export function createBlankSession(sessionNumber = 1, patientName = "Paciente"): MusicTherapySession {
  const today = new Date().toISOString().split("T")[0];
  
  const goals: Record<MusicTherapyGoalKey, any> = {} as any;
  MUSIC_THERAPY_GOAL_DEFINITIONS.forEach((def) => {
    goals[def.key] = {
      key: def.key,
      label: def.label,
      selected: def.key === "comunicacao" || def.key === "regulacao_emocional" || def.key === "interacao_social",
      targetFocus: def.defaultFocus,
      notes: ""
    };
  });

  const interventions: Record<MusicTherapyInterventionKey, any> = {} as any;
  MUSIC_THERAPY_INTERVENTIONS.forEach((def) => {
    interventions[def.key] = {
      key: def.key,
      label: def.label,
      applied: def.key === "canto" || def.key === "ritmo" || def.key === "instrumento",
      details: "",
      techniquesUsed: [def.suggestedTechniques[0]],
      bpm: def.key === "ritmo" ? 72 : undefined,
      durationMinutes: 10
    };
  });

  const observedResponses: Record<MusicTherapyResponseKey, any> = {} as any;
  MUSIC_THERAPY_RESPONSE_DOMAINS.forEach((def) => {
    observedResponses[def.key] = {
      key: def.key,
      label: def.label,
      score: 3,
      descriptor: def.descriptors[3],
      notes: ""
    };
  });

  const session: MusicTherapySession = {
    id: `session_mt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    sessionNumber,
    date: today,
    time: new Date().toTimeString().substring(0, 5),
    durationMinutes: 45,
    patientName,
    therapistName: "Equipe NeuroConecta",
    therapistRole: "Musicoterapeuta Clínico",
    therapistRegister: "UBAM-BR 2026/042",
    contextSetting: "clinica",
    goals,
    interventions,
    observedResponses,
    evolutionSummary: "",
    interdisciplinaryAlignment: "Metas alinhadas com Fonoaudiologia e Terapia Ocupacional (PEI).",
    recommendationsForFamily: "Manter escuta da canção de acolhimento durante as transições de rotina em casa.",
    sensoryAlerts: "Evitar instrumentos de percussão metálica estridente no início da sessão.",
    audit: {
      createdAt: new Date().toISOString(),
      createdBy: "Musicoterapia NeuroConecta",
      auditHash: "",
      verifiedAuditable: true,
      source: "SessaoMusicoterapiaClinica",
      version: 1
    }
  };

  session.audit.auditHash = generateAuditHash(session);
  return session;
}

// -------------------------------------------------------------
// HISTÓRICO LONGITUDINAL AUDITÁVEL INICIAL (SEED)
// Demonstração clara da evolução terapêutica ao longo de 4 sessões
// -------------------------------------------------------------
export const INITIAL_LONGITUDINAL_SESSIONS: MusicTherapySession[] = [
  {
    id: "mt_sess_seed_01",
    sessionNumber: 1,
    date: "2026-08-12",
    time: "14:00",
    durationMinutes: 45,
    patientName: "Lucas Mendonça (TEA Nível 2)",
    therapistName: "Dra. Carolina Freitas (MT)",
    therapistRole: "Musicoterapeuta Clínica",
    therapistRegister: "UBAM/SP 1482",
    contextSetting: "clinica",
    goals: {
      comunicacao: { key: "comunicacao", label: "Comunicação", selected: true, targetFocus: "Vocalização e intenção comunicativa", notes: "Inicialmente sem contato verbal" },
      interacao_social: { key: "interacao_social", label: "Interação Social", selected: true, targetFocus: "Contato visual mediado pelo tambor", notes: "Evitou proximidade no início" },
      atencao: { key: "atencao", label: "Atenção", selected: true, targetFocus: "Atenção sustentada a estímulos sonoros", notes: "Dispersão a cada 2 minutos" },
      regulacao_emocional: { key: "regulacao_emocional", label: "Regulação Emocional", selected: true, targetFocus: "Acolhimento da ansiedade inicial", notes: "Sinais de inquietação motora" },
      coordenacao_motora: { key: "coordenacao_motora", label: "Coordenação Motora", selected: false, targetFocus: "", notes: "" },
      imitacao: { key: "imitacao", label: "Imitação", selected: false, targetFocus: "", notes: "" },
      integracao_sensorial: { key: "integracao_sensorial", label: "Integração Sensorial", selected: true, targetFocus: "Acomodação ao timbre do tambor", notes: "Recuo diante de sons agudos" }
    },
    interventions: {
      canto: { key: "canto", label: "Canto", applied: true, details: "Canção de acolhimento personalizada em tom de Ré Maior", techniquesUsed: ["Canção de Acolhimento Previsível"], durationMinutes: 10 },
      instrumento: { key: "instrumento", label: "Instrumento", applied: true, details: "Apresentação suave de Ocean Drum e Tambor de som grave", techniquesUsed: ["Exploração Sensorial Tátil dos Timbres"], durationMinutes: 15 },
      ritmo: { key: "ritmo", label: "Ritmo", applied: true, details: "Pulso lento e constante a 64 BPM", techniquesUsed: ["Pulso Isocrônico Estável (60-80 BPM)"], bpm: 64, durationMinutes: 10 },
      improvisacao: { key: "improvisacao", label: "Improvisação", applied: false, details: "", techniquesUsed: [], durationMinutes: 0 },
      escuta: { key: "escuta", label: "Escuta", applied: true, details: "Harmonia relaxante ao final para descompressão", techniquesUsed: ["Escuta Receptiva Guiada de Relaxamento"], durationMinutes: 10 },
      movimento: { key: "movimento", label: "Movimento", applied: false, details: "", techniquesUsed: [], durationMinutes: 0 }
    },
    observedResponses: {
      engajamento: { key: "engajamento", label: "Engajamento", score: 2, descriptor: "2 - Baixo: Participação passiva, necessitou estímulo contínuo", notes: "Permaneceu na sala observando à distância" },
      tolerancia_sensorial: { key: "tolerancia_sensorial", label: "Tolerância Sensorial", score: 2, descriptor: "2 - Hiper-reativo: Inquietação ante sons específicos", notes: "Cobriu os ouvidos ao som da panderola" },
      interacao: { key: "interacao", label: "Interação", score: 2, descriptor: "2 - Contato Breve: Olhares fugazes para o terapeuta", notes: "Olhou para as mãos da terapeuta tocando" },
      comunicacao: { key: "comunicacao", label: "Comunicação", score: 1, descriptor: "1 - Sem Resposta: Nenhuma emissão verbal funcional", notes: "Sem vocalização espontânea durante a canção" },
      autorregulacao: { key: "autorregulacao", label: "Autorregulação", score: 2, descriptor: "2 - Lenta Recuperação: Necessitou suporte contínuo", notes: "Acalmou-se com a vibração do tambor nas mãos" },
      comportamento: { key: "comportamento", label: "Comportamento", score: 2, descriptor: "2 - Resistente: Tentou sair da sala nos primeiros 10 minutos", notes: "Organizou-se após introdução do Ocean Drum" }
    },
    evolutionSummary: "Primeira sessão de acolhimento e avaliação diagnóstica em musicoterapia. Paciente apresentou alta vigilância e sensibilidade a agudos, mas acolheu bem o pulso grave e contínuo do tambor e do Ocean Drum.",
    interdisciplinaryAlignment: "Recomendado à fonoaudiologia manter músicas de ritmo lento durante treinos de vocalização.",
    recommendationsForFamily: "Evitar ambientes com múltiplos ruídos simultâneos nos 30 minutos antecedentes à terapia.",
    sensoryAlerts: "Não utilizar instrumentos metálicos com brilho acústico excessivo.",
    audit: {
      createdAt: "2026-08-12T14:50:00Z",
      createdBy: "Carolina Freitas (UBAM 1482)",
      auditHash: "MT-NC-A891F4-E1C0",
      verifiedAuditable: true,
      source: "SessaoMusicoterapiaClinica",
      version: 1
    }
  },
  {
    id: "mt_sess_seed_02",
    sessionNumber: 2,
    date: "2026-08-19",
    time: "14:00",
    durationMinutes: 45,
    patientName: "Lucas Mendonça (TEA Nível 2)",
    therapistName: "Dra. Carolina Freitas (MT)",
    therapistRole: "Musicoterapeuta Clínica",
    therapistRegister: "UBAM/SP 1482",
    contextSetting: "clinica",
    goals: {
      comunicacao: { key: "comunicacao", label: "Comunicação", selected: true, targetFocus: "Produção de vocalizações melódicas", notes: "Incentivo a sílabas simples no refrão" },
      interacao_social: { key: "interacao_social", label: "Interação Social", selected: true, targetFocus: "Alternância de toque no tambor compartilhado", notes: "Turno de 1 toque cada" },
      atencao: { key: "atencao", label: "Atenção", selected: true, targetFocus: "Atenção sustentada aumentada para 5 min", notes: "Foco no movimento das contas do Ocean Drum" },
      regulacao_emocional: { key: "regulacao_emocional", label: "Regulação Emocional", selected: true, targetFocus: "Redução do tônus muscular com harmonia", notes: "Menos rigidez postural" },
      coordenacao_motora: { key: "coordenacao_motora", label: "Coordenação Motora", selected: true, targetFocus: "Segurar baqueta com preensão palmar", notes: "Treino de toque com baqueta macia" },
      imitacao: { key: "imitacao", label: "Imitação", selected: true, targetFocus: "Espelhar 1 batida no tambor", notes: "Resposta de imitação motora simples" },
      integracao_sensorial: { key: "integracao_sensorial", label: "Integração Sensorial", selected: true, targetFocus: "Aceitação tátil do xilofone de madeira", notes: "Boa exploração das teclas de madeira" }
    },
    interventions: {
      canto: { key: "canto", label: "Canto", applied: true, details: "Canção de acolhimento repetida com pausas para resposta", techniquesUsed: ["Canção de Acolhimento Previsível", "Canção Temática Estruturada com Pausas"], durationMinutes: 12 },
      instrumento: { key: "instrumento", label: "Instrumento", applied: true, details: "Xilofone pentatônico e Tambor com baqueta de lã", techniquesUsed: ["Alternância de Turnos Instrumentais", "Tocar Forte/Fraco (Dinâmica Sonoro-Motora)"], durationMinutes: 15 },
      ritmo: { key: "ritmo", label: "Ritmo", applied: true, details: "Pulso rítmico acompanhado de palmas e baqueta", techniquesUsed: ["Pulso Isocrônico Estável (60-80 BPM)", "Jogos Rítmicos de 'Toca e Para' (Controle Inibitório)"], bpm: 68, durationMinutes: 10 },
      improvisacao: { key: "improvisacao", label: "Improvisação", applied: true, details: "Espelhamento sonoro dos movimentos livres do paciente", techniquesUsed: ["Espelhamento Clínico Sonoro"], durationMinutes: 8 },
      escuta: { key: "escuta", label: "Escuta", applied: false, details: "", techniquesUsed: [], durationMinutes: 0 },
      movimento: { key: "movimento", label: "Movimento", applied: false, details: "", techniquesUsed: [], durationMinutes: 0 }
    },
    observedResponses: {
      engajamento: { key: "engajamento", label: "Engajamento", score: 3, descriptor: "3 - Moderado: Engajou em momentos com mediação direta", notes: "Tocou o xilofone espontaneamente após modelagem" },
      tolerancia_sensorial: { key: "tolerancia_sensorial", label: "Tolerância Sensorial", score: 3, descriptor: "3 - Tolerável: Acomodou com volume moderado", notes: "Sem cobrir os ouvidos; aceitou xilofone pentatônico" },
      interacao: { key: "interacao", label: "Interação", score: 3, descriptor: "3 - Reciprocidade Parcial: Respondeu a trocas guiadas", notes: "Sustentou 3 turnos de batida no tambor com a terapeuta" },
      comunicacao: { key: "comunicacao", label: "Comunicação", score: 2, descriptor: "2 - Vocalização Esparsa: Emitiu fonemas vocálicos ('Aaa')", notes: "Vocalizou no final da canção de acolhimento" },
      autorregulacao: { key: "autorregulacao", label: "Autorregulação", score: 3, descriptor: "3 - Regulado com Suporte: Acalmou-se com pulso constante", notes: "Respiração desacelerada ao som das teclas pentatônicas" },
      comportamento: { key: "comportamento", label: "Comportamento", score: 3, descriptor: "3 - Cooperativo com Apoio: Permaneceu sentado na maior parte", notes: "Não houve tentativas de fuga da sala" }
    },
    evolutionSummary: "Evolução evidente na tolerância acústica e início de reciprocidade. O paciente aceitou o xilofone e participou de turnos rítmicos com o tambor, emitindo vocalizações melódicas espontâneas no refrão.",
    interdisciplinaryAlignment: "Terapia Ocupacional informada sobre boa resposta à preensão de baquetas macias.",
    recommendationsForFamily: "Utilizar canções curtas com pausas em momentos de rotina para estimular resposta verbal.",
    sensoryAlerts: "Manter iluminação baixa durante a execução do xilofone.",
    audit: {
      createdAt: "2026-08-19T14:52:00Z",
      createdBy: "Carolina Freitas (UBAM 1482)",
      auditHash: "MT-NC-B129C3-F42A",
      verifiedAuditable: true,
      source: "SessaoMusicoterapiaClinica",
      version: 1
    }
  },
  {
    id: "mt_sess_seed_03",
    sessionNumber: 3,
    date: "2026-08-26",
    time: "14:00",
    durationMinutes: 45,
    patientName: "Lucas Mendonça (TEA Nível 2)",
    therapistName: "Dra. Carolina Freitas (MT)",
    therapistRole: "Musicoterapeuta Clínica",
    therapistRegister: "UBAM/SP 1482",
    contextSetting: "clinica",
    goals: {
      comunicacao: { key: "comunicacao", label: "Comunicação", selected: true, targetFocus: "Produção intencional de turnos sonoros", notes: "Sinalização com gesto e som para pedir 'mais'" },
      interacao_social: { key: "interacao_social", label: "Interação Social", selected: true, targetFocus: "Contato visual sustentado durante o canto", notes: "Contato visual sustentado de 4 a 6 segundos" },
      atencao: { key: "atencao", label: "Atenção", selected: true, targetFocus: "Atenção compartilhada xilofone e terapeuta", notes: "Apontou para a tecla de cor diferente" },
      regulacao_emocional: { key: "regulacao_emocional", label: "Regulação Emocional", selected: true, targetFocus: "Transição suave entre atividades musicais", notes: "Aceitou guardar o tambor e pegar o chocalho" },
      coordenacao_motora: { key: "coordenacao_motora", label: "Coordenação Motora", selected: true, targetFocus: "Alternância bimanual no xilofone", notes: "Mão direita e esquerda coordenadas" },
      imitacao: { key: "imitacao", label: "Imitação", selected: true, targetFocus: "Imitação de sequências rítmicas de 2 tempos", notes: "Imitou padrão 'pá-pá'" },
      integracao_sensorial: { key: "integracao_sensorial", label: "Integração Sensorial", selected: true, targetFocus: "Vibração tátil no peito com tambor", notes: "Acomodação proprioceptiva com feedback tátil" }
    },
    interventions: {
      canto: { key: "canto", label: "Canto", applied: true, details: "Canção interativa de chamada pelo nome", techniquesUsed: ["Canção de Acolhimento Previsível", "Canção Temática Estruturada com Pausas"], durationMinutes: 10 },
      instrumento: { key: "instrumento", label: "Instrumento", applied: true, details: "Xilofone pentatônico, Chocalho de sementes e Tambor", techniquesUsed: ["Alternância de Turnos Instrumentais", "Escolha Autônoma de Instrumento"], durationMinutes: 18 },
      ritmo: { key: "ritmo", label: "Ritmo", applied: true, details: "Jogos de 'Toca e Para' com sinal musical de silêncio", techniquesUsed: ["Jogos Rítmicos de 'Toca e Para' (Controle Inibitório)", "Sincronização Bilateral de Mãos"], bpm: 72, durationMinutes: 10 },
      improvisacao: { key: "improvisacao", label: "Improvisação", applied: true, details: "Diálogo musical de pergunta-resposta melódica", techniquesUsed: ["Diálogo Não-Verbal Pergunta-Resposta", "Validação Emocional da Expressão Livre"], durationMinutes: 7 },
      escuta: { key: "escuta", label: "Escuta", applied: false, details: "", techniquesUsed: [], durationMinutes: 0 },
      movimento: { key: "movimento", label: "Movimento", applied: false, details: "", techniquesUsed: [], durationMinutes: 0 }
    },
    observedResponses: {
      engajamento: { key: "engajamento", label: "Engajamento", score: 4, descriptor: "4 - Alto: Adesão constante, foco e curiosidade espontânea", notes: "Pegou as duas baquetas e sorriu ao produzir sons" },
      tolerancia_sensorial: { key: "tolerancia_sensorial", label: "Tolerância Sensorial", score: 4, descriptor: "4 - Boa Acomodação: Conforto em timbres diversos", notes: "Acolheu inclusive o chocalho de sementes sem aversão" },
      interacao: { key: "interacao", label: "Interação", score: 4, descriptor: "4 - Turnos Sustentados: Alternância rítmica clara ('eu toco, você toca')", notes: "Contato visual frequente com sorriso compartilhado" },
      comunicacao: { key: "comunicacao", label: "Comunicação", score: 3, descriptor: "3 - Tentativas Vocais/Gestuais: Acompanhou pausas com 'Dá' e 'Mais'", notes: "Intenção comunicativa pragmática clara" },
      autorregulacao: { key: "autorregulacao", label: "Autorregulação", score: 4, descriptor: "4 - Retorno Autônomo: Buscou o ritmo lento para se acalmar", notes: "Quando acelerou, conseguiu reduzir a velocidade com apoio sonoro" },
      comportamento: { key: "comportamento", label: "Comportamento", score: 4, descriptor: "4 - Muito Cooperativo: Cuidado com os instrumentos e foco", notes: "Entregou a baqueta na mão da terapeuta com delicadeza" }
    },
    evolutionSummary: "Salto qualitativo marcante na atenção compartilhada e interação social. Lucas sustentou contato visual durante os turnos musicais e demonstrou intenção comunicativa clara, vocalizando para solicitar a continuidade da canção.",
    interdisciplinaryAlignment: "Dados compartilhados com a equipe escolar (AEE) para inclusão de apoio musical em sala.",
    recommendationsForFamily: "Estimular o uso de gestos e sons antes de entregar brinquedos desejados.",
    sensoryAlerts: "Acomodação sensorial estável. Manter instrumentos com afinação pentatônica.",
    audit: {
      createdAt: "2026-08-26T14:55:00Z",
      createdBy: "Carolina Freitas (UBAM 1482)",
      auditHash: "MT-NC-C349D8-A81E",
      verifiedAuditable: true,
      source: "SessaoMusicoterapiaClinica",
      version: 1
    }
  },
  {
    id: "mt_sess_seed_04",
    sessionNumber: 4,
    date: "2026-09-02",
    time: "14:00",
    durationMinutes: 45,
    patientName: "Lucas Mendonça (TEA Nível 2)",
    therapistName: "Dra. Carolina Freitas (MT)",
    therapistRole: "Musicoterapeuta Clínica",
    therapistRegister: "UBAM/SP 1482",
    contextSetting: "clinica",
    goals: {
      comunicacao: { key: "comunicacao", label: "Comunicação", selected: true, targetFocus: "Canto estruturado e linguagem expressiva", notes: "Completou final das frases cantadas" },
      interacao_social: { key: "interacao_social", label: "Interação Social", selected: true, targetFocus: "Iniciativa de convidar terapeuta para tocar", notes: "Pegou na mão da terapeuta para tocar tambor junto" },
      atencao: { key: "atencao", label: "Atenção", selected: true, targetFocus: "Manutenção atencional por 15 min consecutivos", notes: "Engajamento contínuo no jogo de ritmo" },
      regulacao_emocional: { key: "regulacao_emocional", label: "Regulação Emocional", selected: true, targetFocus: "Conforto afetivo e autonomia emocional", notes: "Expressão de júbilo e segurança" },
      coordenacao_motora: { key: "coordenacao_motora", label: "Coordenação Motora", selected: true, targetFocus: "Movimento rítmico corporal associado ao pulso", notes: "Bateu os pés no chão no tempo do tambor" },
      imitacao: { key: "imitacao", label: "Imitação", selected: true, targetFocus: "Imitação de dinâmica sonoro-motora (forte/fraco)", notes: "Excelente precisão na resposta motora" },
      integracao_sensorial: { key: "integracao_sensorial", label: "Integração Sensorial", selected: true, targetFocus: "Tolerância a múltiplos timbres combinados", notes: "Integração plena entre voz, teclado e percussão" }
    },
    interventions: {
      canto: { key: "canto", label: "Canto", applied: true, details: "Canção de acolhimento e canção narrativa temática com instrumentos", techniquesUsed: ["Canção de Acolhimento Previsível", "Canção Temática Estruturada com Pausas", "Vocalizações Lúdicas com Vogais Sustentadas"], durationMinutes: 15 },
      instrumento: { key: "instrumento", label: "Instrumento", applied: true, details: "Xilofone, Tambor e Sinos de afinação perfeita", techniquesUsed: ["Alternância de Turnos Instrumentais", "Tocar Forte/Fraco (Dinâmica Sonoro-Motora)", "Escolha Autônoma de Instrumento"], durationMinutes: 15 },
      ritmo: { key: "ritmo", label: "Ritmo", applied: true, details: "Andamentos variados (60 a 90 BPM) com parada no sinal sonoro", techniquesUsed: ["Estimulação Auditivo-Motora (RAS)", "Jogos Rítmicos de 'Toca e Para' (Controle Inibitório)"], bpm: 76, durationMinutes: 10 },
      improvisacao: { key: "improvisacao", label: "Improvisação", applied: true, details: "Improvisação clínica dialógica no teclado suave e xilofone", techniquesUsed: ["Diálogo Não-Verbal Pergunta-Resposta", "Espelhamento Clínico Sonoro"], durationMinutes: 5 },
      escuta: { key: "escuta", label: "Escuta", applied: false, details: "", techniquesUsed: [], durationMinutes: 0 },
      movimento: { key: "movimento", label: "Movimento", applied: false, details: "", techniquesUsed: [], durationMinutes: 0 }
    },
    observedResponses: {
      engajamento: { key: "engajamento", label: "Engajamento", score: 5, descriptor: "5 - Pleno: Liderança, entusiasmo intrínseco e autonomia", notes: "Iniciou o ritmo e chamou a terapeuta para acompanhar" },
      tolerancia_sensorial: { key: "tolerancia_sensorial", label: "Tolerância Sensorial", score: 4, descriptor: "4 - Boa Acomodação: Conforto em timbres diversos", notes: "Nenhum sinal de sobrecarga acústica em 45 minutos" },
      interacao: { key: "interacao", label: "Interação", score: 5, descriptor: "5 - Iniciativa Social Plena: Convida e celebra sincronia", notes: "Bateu palmas e olhou nos olhos da terapeuta com afeto" },
      comunicacao: { key: "comunicacao", label: "Comunicação", score: 4, descriptor: "4 - Intenção Expressiva Clara: Vocalizou fonemas estruturados", notes: "Completou 'Bom dia, Lu...' com vocalização clara '...CAS!'" },
      autorregulacao: { key: "autorregulacao", label: "Autorregulação", score: 5, descriptor: "5 - Homeostase Plena: Serenidade e foco harmonioso", notes: "Manteve-se regulado em todas as transições da sessão" },
      comportamento: { key: "comportamento", label: "Comportamento", score: 5, descriptor: "5 - Exemplar: Conduta segura, afetuosa e organizada", notes: "Respeitou o fechamento da sessão e guardou os instrumentos" }
    },
    evolutionSummary: "Consolidação dos ganhos terapêuticos longitudinais: evolução notável da tolerância sensorial, saída de postura esquiva para iniciativa social ativa e vocalização expressiva contextualizada na música.",
    interdisciplinaryAlignment: "Relatório de evolução clínica encaminhado para Neuropediatra e coordenação pedagógica.",
    recommendationsForFamily: "Celebrar as vocalizações melódicas espontâneas e manter a rotina auditiva previsível em casa.",
    sensoryAlerts: "Excelente adaptação sensorial acústica. Seguir para o nível de desafio rítmico bimanual.",
    audit: {
      createdAt: "2026-09-02T14:58:00Z",
      createdBy: "Carolina Freitas (UBAM 1482)",
      auditHash: "MT-NC-D721E9-C59F",
      verifiedAuditable: true,
      source: "SessaoMusicoterapiaClinica",
      version: 1
    }
  }
];
