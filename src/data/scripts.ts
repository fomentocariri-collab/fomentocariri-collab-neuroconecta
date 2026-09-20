import { SocialScript } from "../types";

export const SOCIAL_SCRIPTS: SocialScript[] = [
  {
    id: "medico_consulta",
    title: "Consulta Médica sem Sobrecarga",
    category: "saude",
    description: "Script para comunicar ao médico que você prefere explicações diretas e escritas, reduzindo ansiedade.",
    scriptText: `"Olá, doutor(a). Eu sou uma pessoa autista e processo informações com mais facilidade quando são diretas e explicadas passo a passo. 

Gostaria de pedir, se possível:
1. Que me avise antes de qualquer toque ou procedimento físico.
2. Que possa me entregar as orientações principais anotadas ou por escrito.
3. Se puder me fazer perguntas objetivas, agradeço muito!"`,
    tips: [
      "Leve suas dúvidas anotadas em um papel ou bloco de notas do celular.",
      "Você pode ter um acompanhante de confiança para te apoiar."
    ]
  },
  {
    id: "trabalho_fones",
    title: "Pedir permissão para fones com cancelamento de ruído no trabalho",
    category: "acomodacoes",
    description: "Modelo de mensagem para o supervisor ou RH explicando a necessidade sensorial.",
    scriptText: `"Prezado(a) [Nome do Gestor/RH],

Gostaria de solicitar uma pequena acomodação sensorial no meu ambiente de trabalho para otimizar meu foco e produtividade. 

Sou sensível ao ruído de fundo do escritório e gostaria de autorização para utilizar fones de ouvido com cancelamento de ruído durante as tarefas individuais. 

Fico à disposição no chat e por e-mail para qualquer demanda urgente. Essa medida simples ajudará muito no meu bem-estar diário e rendimento. 

Atenciosamente,
[Seu Nome]"`,
    tips: [
      "Reforce que a medida aumenta sua produtividade e foco.",
      "Mostre que você continuará acessível por canais assíncronos (e-mail, Teams, Slack)."
    ]
  },
  {
    id: "recusar_evento",
    title: "Recusar convite social sem parecer indelicado",
    category: "social",
    description: "Mensagem objetiva e carinhosa para declinar um evento barulhento ou cansativo sem culpas.",
    scriptText: `"Oi, [Nome]! Fico muito feliz pelo convite para o [Evento] e por ter lembrado de mim. 

No momento estou precisando de um tempo de descanso e baixa estimulação, por isso não conseguirei ir desta vez. 

Agradeço demais o carinho e nos falamos em breve!"`,
    tips: [
      "Não precisa inventar desculpas elaboradas; 'preciso de descanso' é suficiente e honesto.",
      "Agradeça a lembrança para manter o vínculo positivo."
    ]
  },
  {
    id: "explicar_duplo_sentido",
    title: "Pedir esclarecimento sobre ironia ou metáfora ambígua",
    category: "familia",
    description: "Frase para pedir que a pessoa seja literal e objetiva.",
    scriptText: `"Entendi as palavras, mas fiquei em dúvida se você falou no sentido literal ou com ironia/brincadeira. Pode me explicar de forma direta o que você quis dizer ou o que precisa que eu faça?"`,
    tips: [
      "Pedir clareza evita mal-entendidos e ressentimentos acumulados."
    ]
  },
  {
    id: "instrucoes_escritas",
    title: "Solicitar instruções por escrito (Escola / Trabalho)",
    category: "trabalho",
    description: "Pedir que prazos e tarefas sejam enviados por texto para não perder detalhes verbais.",
    scriptText: `"Para garantir que eu não perca nenhum detalhe importante e possa organizar minha rotina com precisão, você poderia me enviar esses pontos chave e prazos por e-mail ou mensagem? Agradeço muito!"`,
    tips: [
      "Processar instruções verbais rápidas consome muita memória de trabalho; texto escrito é acessibilidade."
    ]
  },
  // CATEGORIA: ORGANIZAÇÃO, ATENÇÃO & TDAH (Acessível a todas as pessoas, com ou sem diagnóstico)
  {
    id: "tdah_etapas",
    title: "Pedir instruções por etapas",
    category: "tdah_organizacao",
    description: "Para quando tarefas passadas de uma só vez causam sobrecarga de memória de trabalho.",
    scriptText: `“Eu consigo me organizar melhor quando as orientações são divididas em etapas. Você pode me passar uma tarefa de cada vez ou deixar os passos por escrito? Assim consigo acompanhar melhor e reduzir a chance de esquecer alguma parte.”`,
    diagnosticOptionalText: `“Tenho TDAH e me organizo melhor quando as orientações são divididas em etapas. Você pode me passar uma tarefa de cada vez ou deixar os passos por escrito? Assim consigo acompanhar melhor e reduzir a chance de esquecer alguma parte.”`,
    tips: [
      "Dividir tarefas reduz a dispersão e facilita a execução sequencial.",
      "Pedir o envio por escrito cria uma referência externa confiável."
    ]
  },
  {
    id: "tdah_priorizacao",
    title: "Quando há muitas tarefas ao mesmo tempo",
    category: "tdah_organizacao",
    description: "Para alinhar prioridades claras quando chegam demandas simultâneas.",
    scriptText: `“Tenho várias demandas abertas e preciso organizar a prioridade. Você pode me dizer quais são as mais urgentes e qual devo concluir primeiro? Depois sigo para as próximas.”`,
    diagnosticOptionalText: `“Tenho TDAH e funciono com muito mais rendimento quando há uma ordem clara de prioridades. Você pode me dizer quais são as mais urgentes e qual devo concluir primeiro? Depois sigo para as próximas.”`,
    tips: [
      "Evita a paralisia decisória diante de múltiplos prazos concorrentes.",
      "Alinha expectativas de entrega diretamente com quem solicitou."
    ]
  },
  {
    id: "tdah_resumo_escrito",
    title: "Pedir resumo por escrito",
    category: "tdah_organizacao",
    description: "Para registrar pontos essenciais e encaminhamentos após reuniões ou aulas.",
    scriptText: `“Para eu acompanhar melhor e não perder informações importantes, você pode me enviar os principais pontos ou próximos passos por escrito depois da reunião/aula?”`,
    diagnosticOptionalText: `“Para eu acompanhar sem perder informações e compensar oscilações de atenção (TDAH), você pode me enviar os principais pontos ou próximos passos por escrito depois da reunião/aula?”`,
    tips: [
      "Reuniões verbais longas sobrecarregam o foco; notas escritas consolidam os combinados.",
      "Você também pode enviar sua própria anotação rápida pedindo confirmação do outro."
    ]
  },
  {
    id: "tdah_confirmar_prazo",
    title: "Pedir confirmação de prazo",
    category: "tdah_organizacao",
    description: "Para ter clareza exata de datas, horários finais e etapas intermediárias.",
    scriptText: `“Quero confirmar a entrega para me organizar corretamente: qual é a data e o horário final? Se houver etapas intermediárias, você pode me informar também?”`,
    diagnosticOptionalText: `“Para calibrar meu planejamento com antecedência, você pode confirmar a data e o horário final da entrega? Se houver marcos intermediários, me ajuda muito saber também.”`,
    tips: [
      "Prazos abstratos como 'o quanto antes' geram ansiedade e adiamentos; solicite dia e horário exatos.",
      "Definir entregas parciais ajuda a manter o ritmo contínuo."
    ]
  },
  {
    id: "tdah_reorganizar_demandas",
    title: "Pedir ajuda para reorganizar demandas",
    category: "tdah_organizacao",
    description: "Para renegociar prazos e fatiar pendências acumuladas em partes menores.",
    scriptText: `“Estou com dificuldade para organizar todas as demandas ao mesmo tempo. Podemos revisar o que é prioridade, o que pode esperar e o que pode ser dividido em partes menores?”`,
    diagnosticOptionalText: `“Estou com sobrecarga para gerenciar todas as demandas simultâneas. Podemos revisar rapidamente o que é prioridade, o que pode esperar e o que pode ser dividido em partes menores?”`,
    tips: [
      "Pedir alinhamento preventivo demonstra responsabilidade profissional e compromisso com entregas.",
      "Fatiar em microetapas diminui o peso de iniciar tarefas grandes."
    ]
  },
  {
    id: "tdah_iniciar_atividade",
    title: "Pedir apoio para iniciar uma atividade",
    category: "tdah_organizacao",
    description: "Para superar a inércia inicial (dificuldade de ativação executiva) em tarefas escolares ou projetos.",
    scriptText: `“Eu entendi a atividade, mas estou com dificuldade para começar. Você pode me indicar qual é o primeiro passo? Depois consigo seguir a sequência.”`,
    diagnosticOptionalText: `“Compreendi o objetivo da atividade, mas travei na largada. Você pode me indicar qual é o primeiro passo concreto? Depois consigo engatar na sequência.”`,
    tips: [
      "A inércia de início é uma barreira de função executiva, não desinteresse ou falta de capacidade.",
      "Uma vez dado o primeiro clique ou rascunho, o fluxo de trabalho se estabelece."
    ]
  },
  {
    id: "tdah_reducao_distracoes",
    title: "Pedir redução de distrações",
    category: "tdah_organizacao",
    description: "Para solicitar ambiente com menor ruído e interrupções durante tarefas que exigem foco sustentado.",
    scriptText: `“Estou tendo dificuldade para manter o foco com muitos estímulos ao redor. Se for possível, gostaria de trabalhar em um local com menos interrupções ou ruído durante esta tarefa.”`,
    diagnosticOptionalText: `“Minha atenção se fragmenta facilmente com estímulos no ambiente ao redor. Se for possível, gostaria de trabalhar em um local com menos interrupções ou ruído durante esta tarefa.”`,
    tips: [
      "Atenção sustentada depende diretamente da higiene do ambiente sensorial e social.",
      "Fones abafadores ou assento longe de circulação ajudam a manter a concentração."
    ]
  }
];

export const LITERAL_LANGUAGE_GUIDE = [
  {
    expression: "Dar uma mãozinha",
    literalMeaning: "Oferecer ajuda em uma tarefa curta.",
    avoid: "Não significa literalmente entregar uma mão física."
  },
  {
    expression: "Chover no molhado",
    literalMeaning: "Repetir algo redundante ou óbvio que não adiciona novidade.",
    avoid: "Não se refere ao tempo ou clima."
  },
  {
    expression: "Tirar o cavalo da chuva",
    literalMeaning: "Desistir de uma expectativa ou ideia irreal.",
    avoid: "Não tem relação com animais ou tempestades reais."
  },
  {
    expression: "Ficar em cima do muro",
    literalMeaning: "Estar indeciso ou não querer tomar partido em uma discussão.",
    avoid: "Não é sobre subir em uma parede ou muro físico."
  },
  {
    expression: "Segurar a onda",
    literalMeaning: "Aguardar com paciência ou manter o autocontrole emocional.",
    avoid: "Não é sobre o mar ou surfe."
  }
];
