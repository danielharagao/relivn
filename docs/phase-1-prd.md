# PRD — Relivn Fase 1

**Versão:** 0.1 Alpha  
**Status:** primeira fatia vertical implementada

## Objetivo

Permitir que um profissional entenda a proposta, conclua um diagnóstico, receba um ponto de partida, entre na jornada de 21 dias, registre reflexões e controle os próprios dados sem assistência do fundador.

## Fluxo principal

1. Landing page.
2. Diagnóstico com dez perguntas.
3. Identificação local por nome e e-mail.
4. Resultado em cinco dimensões.
5. Ativação do acesso alpha.
6. Tela Hoje com prática, pergunta e ação.
7. Registro de reflexão.
8. Progresso e desbloqueio do próximo dia.
9. Diário.
10. Exportação ou exclusão dos dados.

## Dimensões do diagnóstico

- atenção capturada;
- incerteza;
- agência;
- reatividade;
- direção.

O diagnóstico não é clínico e não deve receber linguagem de patologia.

## Critérios de aceite implementados

- visitante novo visualiza a proposta antes do aplicativo;
- todas as perguntas são obrigatórias;
- resultado reflete a dimensão de maior pontuação;
- os 21 dias correspondem aos 21 áudios completos existentes;
- somente o próximo dia é liberado;
- uma reflexão concluída avança a jornada;
- registros podem ser revistos no diário;
- dados podem ser exportados em JSON;
- dados locais podem ser apagados;
- nenhuma chave secreta é entregue ao cliente;
- existe fallback local quando não há endpoint de IA;
- fluxo completo possui teste E2E em Chrome.

## Arquitetura atual

- HTML, CSS e JavaScript sem framework;
- GitHub Pages;
- PWA e service worker;
- `localStorage` para estado alpha;
- adaptador configurável para checkout e reflexão.

## Arquitetura proposta para produção

### Frontend

Manter a PWA durante o beta para reduzir migração e tempo. Modularizar gradualmente após evidência de produto.

### Backend

Supabase como hipótese padrão:

- Auth por magic link e Google;
- Postgres;
- Row Level Security;
- Edge Function para IA;
- exclusão e exportação por usuário.

A escolha deve ser confirmada antes de provisionar serviços e assumir custos.

### IA

Endpoint server-side autenticado. O navegador nunca recebe a chave do provedor.

Entrada mínima:

- dia;
- pergunta da jornada;
- estado;
- preocupação;
- insight;
- ação.

Saída:

- síntese curta;
- no máximo uma pergunta opcional;
- linguagem não clínica;
- nenhum diagnóstico ou decisão pelo usuário.

### Pagamento

Checkout hospedado e webhook server-side. O acesso não pode depender somente de redirect no navegador.

Tabelas mínimas:

- profiles;
- diagnostics;
- reflections;
- entitlements;
- product_events sem conteúdo do diário.

## Analytics

Eventos mínimos:

- landing_viewed;
- diagnostic_started;
- diagnostic_completed;
- result_viewed;
- checkout_started;
- purchase_completed;
- day_started;
- audio_started;
- reflection_completed;
- day_completed;
- data_exported;
- account_deleted.

Nunca enviar texto do diário para a ferramenta de analytics.

## Segurança e privacidade

Antes do beta público:

- política de privacidade;
- termos;
- consentimento de IA;
- fluxo de risco revisado;
- dados criptografados;
- exclusão real no backend;
- separação entre analytics e conteúdo íntimo;
- revisão de LGPD;
- canal de suporte.

## Fora do escopo do MVP

- terapia por IA;
- aplicativo nativo;
- comunidade;
- dashboard B2B;
- gamificação complexa;
- modelo próprio;
- múltiplas jornadas;
- aconselhamento de carreira automatizado.

## Dependências para concluir produção

1. escolha e provisionamento do backend;
2. credenciais do provedor de IA;
3. conta de pagamento e produto/preço;
4. domínio/remetente de e-mail;
5. política de privacidade e termos;
6. decisão sobre preço fundador;
7. revisão do conteúdo dos 21 dias.

## Definition of Done da Fase 1

- autenticação real;
- persistência entre dispositivos;
- IA segura em endpoint server-side;
- pagamento confirmado por webhook;
- entitlement aplicado no backend;
- analytics funcionando;
- exclusão e exportação reais;
- fluxo de risco e documentos legais;
- E2E em ambiente publicado;
- teste por uma pessoa que não participou da construção.
