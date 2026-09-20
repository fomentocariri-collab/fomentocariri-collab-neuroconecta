import { CaregiverGuideItem } from "../types";

export const CAREGIVER_GUIDE: CaregiverGuideItem[] = [
  {
    id: "cg-1",
    situation: "Durante Crise de Sobrecarga (Meltdown)",
    category: "meltdown_shutdown",
    levelTarget: "Todos",
    whatToDo: [
      "Mantenha a calma e reduza estímulos ambientais (desligue luzes fortes, TV, ruídos).",
      "Garanta a segurança física sem segurar à força, a menos que haja risco de ferimento.",
      "Ofereça espaço seguro e protetor auricular ou abafador.",
      "Aguarde o sistema nervoso descarregar sem fazer perguntas complexas."
    ],
    whatToAvoid: [
      "Evite dar broncas, explicações longas ou exigir respostas imediatas.",
      "Não toque na pessoa subitamente sem consentimento verbal prévio.",
      "Não force contato visual nem exija que 'se acalme rápido'."
    ],
    phrasesToUse: [
      "\"Estou aqui com você. Vamos diminuir os estímulos para ajudar você a passar por este momento.\"",
      "\"Não precisa falar agora. Respire no seu tempo.\"",
      "\"Vou diminuir a luz e o barulho.\""
    ]
  },
  {
    id: "cg-2",
    situation: "Durante o Shutdown (Desligamento/Mutismo)",
    category: "meltdown_shutdown",
    levelTarget: "Todos",
    whatToDo: [
      "Respeite o silêncio. O cérebro está em modo de economia de energia.",
      "Ofereça meios alternativos de comunicação (cartões com emojis, chat de texto no celular, acenos de cabeça).",
      "Deixe água e um lanche leve por perto sem cobrar consumo imediato."
    ],
    whatToAvoid: [
      "Não force a fala verbal se a pessoa perdeu a capacidade de articular palavras.",
      "Não interprete o isolamento como birra, frieza ou desfeita."
    ],
    phrasesToUse: [
      "\"Pode me responder por mensagem se for mais fácil.\"",
      "\"Se precisar de algo, aponte ou mande um emoji.\"",
      "\"Vou te deixar descansar um pouco.\""
    ]
  },
  {
    id: "cg-3",
    situation: "Apoio no Nível de Suporte 2 (Intermediário/Substancial)",
    category: "rotina_sensorial",
    levelTarget: "Nível 2",
    whatToDo: [
      "Use rotinas visuais estruturadas com fotos e ícones claros.",
      "Antecipe transições com avisos suaves (ex: 'Em 10 minutos vamos sair').",
      "Ofereça escolhas limitadas para evitar paralisia de decisão (ex: 'Prefere a camiseta azul ou a verde?').",
      "Acompanhe o planejamento de higiene, refeição e descanso de forma acolhedora."
    ],
    whatToAvoid: [
      "Não mude planos de última hora sem explicar o motivo de forma simples.",
      "Não sobrecarregue com múltiplas ordens encadeadas em uma só frase."
    ],
    phrasesToUse: [
      "\"Aqui está a foto do nosso próximo passo da rotina.\"",
      "\"Faltam 5 minutos para terminar esta atividade.\"",
      "\"Quer ajuda para começar esta etapa?\""
    ]
  },
  {
    id: "cg-4",
    situation: "Apoio no Nível de Suporte 3 (Intenso/Muito Substancial)",
    category: "rotina_sensorial",
    levelTarget: "Nível 3",
    whatToDo: [
      "Utilize pistas concretas e objetos de transição (ex: entregar a colher antes do almoço).",
      "Implemente agendas visuais em quadros ou no aplicativo com fotos reais do ambiente.",
      "Preste atenção contínua aos sinais não-verbais de dor, fome ou sobrecarga sensorial.",
      "Incentive e proteja o stimming motor e vocal inofensivo como regulação vital."
    ],
    whatToAvoid: [
      "Não assuma incompetência por falta de comunicação verbal tradicional.",
      "Não ignore sinais sutis de desconforto físico ou hipersensibilidade."
    ],
    phrasesToUse: [
      "\"Vamos ver a foto do almoço juntas.\"",
      "\"Aqui está seu objeto confortador.\""
    ]
  },
  {
    id: "cg-5",
    situation: "Apoio Escolar, Universitário e Profissional",
    category: "escola_trabalho",
    levelTarget: "Todos",
    whatToDo: [
      "Ajude a solicitar acomodações razoáveis por escrito (fones, sala reservada, prazos claros).",
      "Incentive pausas sensoriais programadas durante blocos longos de foco.",
      "Valorize o hiperfoco e as habilidades únicas em vez de focar apenas nas dificuldades."
    ],
    whatToAvoid: [
      "Não pressione para interação social contínua nos intervalos.",
      "Não diminua a necessidade do uso de abafadores de ruído."
    ],
    phrasesToUse: [
      "\"Quer que eu te ajude a enviar o pedido de fones para o RH/Escola?\"",
      "\"Sua dedicação a este tema é impressionante.\""
    ]
  }
];
