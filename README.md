# NeuroWork — Front-end (primeira versão)

Plataforma web de recrutamento neuroinclusivo. Esta é a **primeira versão do front-end**: todas as telas do backlog (FE01–FE19) navegáveis, com **dados de exemplo** e sem back-end. A integração com o Firebase (autenticação, Firestore, Storage) fica para as próximas etapas.

TCC — Turma DS302: Hilario Feliciano Neto, Igor Gabriel Pasquali, Kaue Mezzomo Mazzonetto e Pedro Luan Chaikoski.

## Tecnologias

| Tecnologia | Uso |
|---|---|
| Next.js 15 (App Router) + React 19 | Aplicação e navegação entre telas |
| TypeScript | Tipagem de todo o código |
| Tailwind CSS 4 | Estilização e layout responsivo |
| shadcn/ui (Radix UI) | Componentes base (botão, card, diálogo…) |
| lucide-react | Ícones |
| React Hook Form + Yup | Formulários e validação de campos |
| Sonner | Mensagens de feedback (toast) |

## Identidade visual

A interface segue o Manual de Identidade Visual do NeuroWork:

| Uso | Cor |
|---|---|
| Azul principal (logo, ícones, foco) | `#1E88E5` |
| Verde (logo, destaques) | `#43A047` |
| Cinza escuro (texto) | `#263238` |
| Cinza claro (superfícies) | `#ECEFF1` |
| Azul-marinho (menu, títulos, rodapé) | `#0D2A5C` |

Tipografia: **Montserrat** nos títulos e **Roboto** no texto (via `next/font/google`).

**Acessibilidade das cores:** o azul `#1E88E5` e o verde `#43A047` têm contraste de 3,7:1 e 3,3:1 com o branco, abaixo dos 4,5:1 exigidos pela WCAG para texto. Por isso, botões, links e textos usam tons mais escuros da mesma família (`#1565C0` e `#2E7D32`), e as cores originais ficam no logotipo, em ícones e em detalhes. Todos os tokens estão em `src/app/globals.css`.

O símbolo do logo foi redesenhado em SVG (`src/components/brand/logo-symbol.tsx` e `public/brand/neurowork-simbolo.svg`). Se tiverem o arquivo vetorial original do logo, basta substituir esses dois arquivos.

## Como rodar

Pré-requisito: Node.js 20 ou superior.

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

**Conta de demonstração:** `demo@neurowork.com.br` / `neurowork123` (a tela de login tem um botão que preenche os dados).

Outros comandos:

```bash
npm run build      # build de produção (também roda lint e checagem de tipos)
npm run lint       # ESLint
npm run typecheck  # só a checagem do TypeScript
```

## Roteiro de demonstração (fluxo principal)

1. **Empresa:** entre com a conta de demonstração (ou crie uma em "Criar conta").
2. **Vagas → Criar vaga:** preencha o formulário. Ao salvar, o link da vaga aparece para copiar.
3. **Montar processo seletivo:** adicione etapas e perguntas; use "Ver como o candidato".
4. **Candidato:** abra o link da vaga (de preferência em outra aba), candidate-se sem conta, anexe um PDF e responda à avaliação.
5. **Empresa:** em **Candidatos**, abra a candidatura, veja as respostas e altere o status.
6. **Relatórios** e **Plano** (contratação simulada, sem cobrança).

> Os dados ficam no `localStorage` do navegador. Para voltar ao estado inicial, use **"Restaurar dados de exemplo"** no menu do painel.

## Organização das pastas

```
src/
├── app/                        # Rotas (App Router): cada pasta é uma URL
│   ├── page.tsx                # Landing page
│   ├── (auth)/                 # Cadastro, login e recuperação de senha
│   ├── painel/                 # Área da empresa (protegida por sessão)
│   │   ├── vagas/              # Lista, criar, detalhe, editar e processo seletivo
│   │   ├── candidatos/         # Lista e detalhe do candidato
│   │   ├── plano/              # Meu plano e checkout simulado
│   │   ├── relatorios/         # Relatório por vaga
│   │   └── empresa/            # Dados da conta da empresa
│   ├── privacidade/            # Política de privacidade (LGPD)
│   └── vaga/[slug]/            # Jornada do candidato (link público, sem conta)
│       ├── candidatura/        # Formulário em etapas
│       ├── avaliacao/          # Avaliação etapa por etapa
│       └── concluido/          # Conclusão
├── components/
│   ├── brand/                  # Logotipo (símbolo em SVG + versão horizontal)
│   ├── ui/                     # Componentes base no padrão shadcn/ui
│   ├── feedback/               # Estados: carregando, vazio, erro, sucesso + toast
│   ├── forms/                  # Campo com rótulo/erro, máscara de entrada, alertas
│   ├── accessibility/          # Alto contraste, fonte, modo simplificado, leitura em voz alta
│   ├── layout/                 # Cabeçalhos, menu do painel, cabeçalho de página
│   ├── vagas/ processo/ candidatura/  # Componentes de cada funcionalidade
├── lib/
│   ├── services/               # Camada de serviços: ÚNICO ponto de acesso aos dados
│   ├── validations/            # Schemas Yup dos formulários
│   ├── masks.ts                # Máscaras de CNPJ, telefone e moeda + validação de CNPJ
│   └── constants.ts, utils.ts
├── data/                       # Dados de exemplo (seed) e planos
├── hooks/use-service.ts        # Controla carregando/erro/sucesso das chamadas de serviço
└── types/                      # Tipos do domínio (Empresa, Vaga, Candidatura…)
```

**Decisão de arquitetura (RNF-09):** as telas nunca leem dados diretamente. Tudo passa por `src/lib/services`, que hoje usa dados de exemplo e o `localStorage`. Na próxima etapa, só essas funções serão reescritas para usar o Firebase, e as telas continuam iguais.

## Histórias do backlog → telas

| História | Rota / arquivo |
|---|---|
| FE01 Base do projeto | `src/components/ui`, `src/types`, `src/lib/services`, `src/data` |
| FE02 Contraste, fonte, modo simplificado | `src/components/accessibility/*` (botão "Acessibilidade" em todas as telas) |
| FE03 Feedback e teclado | `src/components/feedback/states.tsx`, link "Pular para o conteúdo", foco visível |
| FE04 Ouvir em voz alta | `src/components/accessibility/speak-button.tsx` |
| FE05 Cadastro e login | `/cadastro`, `/login`, `/recuperar-senha` |
| FE06 Painel | `/painel` |
| FE07 Lista de vagas | `/painel/vagas` |
| FE08 Criar/editar/encerrar vaga | `/painel/vagas/nova`, `/painel/vagas/[id]/editar`, `/painel/vagas/[id]` |
| FE09 Link da vaga | `src/components/vagas/job-link-card.tsx` |
| FE10 Landing page | `/` |
| FE11 Processo seletivo | `/painel/vagas/[id]/processo` |
| FE12 Candidatos | `/painel/candidatos` |
| FE13 Detalhe do candidato | `/painel/candidatos/[id]` |
| FE14 Planos e checkout simulado | `/painel/plano`, `/painel/plano/checkout/[plano]` |
| FE15 Relatório | `/painel/relatorios` |
| FE16 Página da vaga | `/vaga/[slug]` |
| FE17 Candidatura | `/vaga/[slug]/candidatura` |
| FE18 Avaliação | `/vaga/[slug]/avaliacao` |
| FE19 Conclusão | `/vaga/[slug]/concluido` |
| Complemento: dados da empresa | `/painel/empresa` |
| Complemento: política de privacidade (LGPD) | `/privacidade` |

## Limitações desta versão (previstas no escopo)

- Autenticação simulada: nenhuma senha é armazenada; só a conta de demonstração confere a senha.
- Os arquivos (currículo/portfólio) são validados, mas **não são enviados**; só o nome e o tamanho ficam registrados.
- O pagamento é **simulado**: nenhum dado de cartão é pedido e nada é cobrado.
- Os dados ficam no navegador de quem está usando.
- A plataforma não solicita, não infere e não registra diagnósticos.
