window.RELIVN_PHASE1 = {
  version: '0.1.0-alpha',
  promise: 'Recupere clareza e escolha seu próximo passo em um mundo acelerado pela IA.',
  modules: [
    {
      id: 'attention',
      number: 1,
      title: 'Atenção',
      description: 'Treine o foco, reconheça a distração e retorne ao que você escolheu.',
      priceCents: 2990,
      days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      status: 'available'
    },
    {
      id: 'self-awareness',
      number: 2,
      title: 'Autoconsciência',
      description: 'Diferencie fatos, emoções, narrativas e pressões externas.',
      priceCents: 2990,
      days: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      status: 'available'
    },
    {
      id: 'self-regulation',
      number: 3,
      title: 'Autorregulação',
      description: 'Crie espaço entre impulso e escolha e transforme clareza em ação.',
      priceCents: 2990,
      days: [21],
      status: 'preparing'
    }
  ],
  questions: [
    { id: 'q1', dimension: 'attention', text: 'Minha atenção muda de direção sempre que aparece uma nova ferramenta, tendência ou possibilidade.' },
    { id: 'q2', dimension: 'attention', text: 'Termino o dia tendo consumido muita informação e avançado pouco no que escolhi fazer.' },
    { id: 'q3', dimension: 'uncertainty', text: 'Pensar nas mudanças da IA e do mercado gera uma sensação constante de urgência.' },
    { id: 'q4', dimension: 'uncertainty', text: 'Sinto que preciso prever o futuro antes de tomar meu próximo passo.' },
    { id: 'q5', dimension: 'agency', text: 'Tenho dificuldade para transformar minhas reflexões em uma ação pequena e concreta.' },
    { id: 'q6', dimension: 'agency', text: 'Começo novos estudos ou projetos antes de testar suficientemente os atuais.' },
    { id: 'q7', dimension: 'reactivity', text: 'Respondo a mensagens, notícias ou mudanças antes de compreender o que estou sentindo.' },
    { id: 'q8', dimension: 'reactivity', text: 'Levo o estado de alerta do trabalho para outros momentos da minha vida.' },
    { id: 'q9', dimension: 'direction', text: 'Tenho possibilidades demais e critérios de menos para escolher entre elas.' },
    { id: 'q10', dimension: 'direction', text: 'Comparo minha trajetória real com a imagem pública do avanço de outras pessoas.' }
  ],
  scale: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Quase sempre'],
  days: [
    { day: 1, practiceId: 'atencao-1', cycle: 'Perceber', title: 'Respiração', prompt: 'O que está ocupando sua atenção sem que você tenha escolhido?', action: 'Faça três respirações antes de abrir uma rede ou ferramenta de IA.' },
    { day: 2, practiceId: 'atencao-2', cycle: 'Perceber', title: 'Distração não é fracasso', prompt: 'Para onde sua mente vai quando perde o foco?', action: 'Registre sua principal distração sem tentar eliminá-la.' },
    { day: 3, practiceId: 'atencao-3', cycle: 'Perceber', title: 'Presença e retorno', prompt: 'Qual novidade tem capturado sua atenção repetidamente?', action: 'Retorne a uma tarefa escolhida quando perceber a captura.' },
    { day: 4, practiceId: 'atencao-4', cycle: 'Perceber', title: 'Estabilidade', prompt: 'Quais estímulos tornam sua atenção mais instável?', action: 'Proteja um bloco curto sem notificações.' },
    { day: 5, practiceId: 'atencao-5', cycle: 'Perceber', title: 'Sinais da aceleração', prompt: 'Onde a urgência aparece primeiro no seu corpo?', action: 'Observe o corpo antes de uma decisão não urgente.' },
    { day: 6, practiceId: 'atencao-6', cycle: 'Perceber', title: 'Atenção escolhida', prompt: 'O que você escolheu acompanhar e o que apenas entrou no seu campo?', action: 'Remova uma fonte de ruído por 24 horas.' },
    { day: 7, practiceId: 'atencao-7', cycle: 'Perceber', title: 'Uma prioridade', prompt: 'O que mudou quando você começou a perceber a distração?', action: 'Escolha uma prioridade para a próxima semana.' },
    { day: 8, practiceId: 'atencao-8', cycle: 'Distinguir', title: 'Pensamento recorrente', prompt: 'Qual pensamento sobre IA ou carreira mais se repetiu?', action: 'Escreva esse pensamento como hipótese, não como fato.' },
    { day: 9, practiceId: 'atencao-9', cycle: 'Distinguir', title: 'Possibilidades em disputa', prompt: 'Quais opções estão competindo pela sua atenção?', action: 'Adie conscientemente uma opção por sete dias.' },
    { day: 10, practiceId: 'atencao-10', cycle: 'Distinguir', title: 'Do consumo ao experimento', prompt: 'Que informação você já tem em excesso?', action: 'Troque consumo adicional por um pequeno experimento.' },
    { day: 11, practiceId: 'autoconsciencia-1', cycle: 'Distinguir', title: 'Estado não é identidade', prompt: 'Você está sentindo medo ou se definindo por ele?', action: 'Nomeie o estado usando “estou percebendo...”.' },
    { day: 12, practiceId: 'autoconsciencia-2', cycle: 'Distinguir', title: 'Fato e interpretação', prompt: 'O que aconteceu concretamente e que história sua mente criou?', action: 'Escreva uma frase de fato e outra de interpretação.' },
    { day: 13, practiceId: 'autoconsciencia-3', cycle: 'Distinguir', title: 'Comparação', prompt: 'Com quem você está se comparando e o que não consegue ver?', action: 'Interrompa uma fonte de comparação por um dia.' },
    { day: 14, practiceId: 'autoconsciencia-4', cycle: 'Distinguir', title: 'Informação no medo', prompt: 'Qual medo contém informação útil e qual apenas produz urgência?', action: 'Transforme um medo útil em pergunta investigável.' },
    { day: 15, practiceId: 'autoconsciencia-5', cycle: 'Escolher', title: 'Valores', prompt: 'O que sua preocupação revela que você valoriza?', action: 'Escreva um critério que deseja preservar.' },
    { day: 16, practiceId: 'autoconsciencia-6', cycle: 'Escolher', title: 'Desejo e pressão', prompt: 'Qual objetivo é realmente seu e qual parece obrigação social?', action: 'Retire uma obrigação não essencial da lista.' },
    { day: 17, practiceId: 'autoconsciencia-7', cycle: 'Escolher', title: 'Capacidades transferíveis', prompt: 'Que capacidade sua permanece útil quando as ferramentas mudam?', action: 'Aplique essa capacidade em um problema atual.' },
    { day: 18, practiceId: 'autoconsciencia-8', cycle: 'Agir', title: 'Aprender ou evitar?', prompt: 'Você aprende algo novo para avançar ou para evitar terminar?', action: 'Conclua uma parte antes de começar outro estudo.' },
    { day: 19, practiceId: 'autoconsciencia-9', cycle: 'Agir', title: 'Direção provisória', prompt: 'Que escolha faria se não precisasse ter certeza definitiva?', action: 'Escolha um experimento reversível.' },
    { day: 20, practiceId: 'autoconsciencia-10', cycle: 'Agir', title: 'Intenção e renúncia', prompt: 'O que importa nos próximos 30 dias e o que não importa agora?', action: 'Escreva uma intenção, um critério e uma renúncia.' },
    { day: 21, practiceId: 'autorregulacao-1', cycle: 'Revisar', title: 'Do impulso à escolha', prompt: 'Qual padrão você passou a perceber e como deseja responder?', action: 'Defina um experimento de 30 dias e a primeira revisão.' }
  ]
};
