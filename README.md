# Relivn

Plataforma de práticas contemplativas e reflexão guiada para recuperar clareza e agência em um mundo acelerado pela IA.

## Desenvolvimento

```bash
npm install
npm run check
npm run serve
```

Abra `http://localhost:4173`.

## Fase 1 Alpha

A branch `feat/phase-1-mvp` contém uma primeira fatia vertical testável:

- landing page;
- diagnóstico de clareza;
- resultado personalizado;
- jornada de 21 dias usando os áudios existentes;
- reflexão estruturada;
- diário e progresso;
- exportação e exclusão de dados;
- experiência responsiva e PWA.

No modo alpha, perfil, diagnóstico e diário ficam no `localStorage`. A síntese é determinística e não envia dados a um modelo externo. Isso permite validar UX e conteúdo sem expor informações pessoais ou chaves secretas.

## Integrações pendentes para produção

- autenticação e banco de dados;
- endpoint seguro de IA;
- checkout e webhooks de pagamento;
- analytics sem conteúdo sensível;
- e-mail transacional;
- termos, política de privacidade e revisão do fluxo de risco.

Configurações públicas ficam em `relivn-config.js`. Nunca coloque chaves secretas no repositório ou no JavaScript entregue ao navegador.
