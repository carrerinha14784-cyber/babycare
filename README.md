# 🍼 BabyCare

App de acompanhamento diário do bebê e saúde pós-parto da mãe.

**Stack:** Next.js 14 · TypeScript · Supabase · TailwindCSS · Framer Motion · PWA

---

## 🚀 Deploy na Vercel — Passo a Passo

### 1. Configurar Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Vá em **SQL Editor** e cole o conteúdo de `supabase/migrations/001_initial_schema.sql`
3. Execute o script — isso cria todas as tabelas, RLS e triggers
4. Em **Authentication > Settings**, configure:
   - Site URL: `https://seu-app.vercel.app`
   - Redirect URLs: `https://seu-app.vercel.app/**`
5. Copie as chaves em **Settings > API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 2. Deploy na Vercel

**Opção A — Via GitHub (recomendado):**
```bash
# 1. Crie um repositório no GitHub e faça push do projeto
git init
git add .
git commit -m "feat: BabyCare initial commit"
git remote add origin https://github.com/SEU_USUARIO/babycare.git
git push -u origin main

# 2. Acesse vercel.com > New Project > importe o repositório
# 3. Configure as variáveis de ambiente (passo 3 abaixo)
# 4. Clique em Deploy
```

**Opção B — Via CLI:**
```bash
npm i -g vercel
vercel login
vercel --prod
```

### 3. Variáveis de Ambiente na Vercel

No painel da Vercel, vá em **Settings > Environment Variables** e adicione:

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do seu projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key |
| `NEXT_PUBLIC_APP_URL` | URL do seu app na Vercel |

### 4. Instalar como PWA

Após o deploy, acesse o app no celular:
- **Android:** Menu do Chrome > "Adicionar à tela inicial"
- **iOS:** Safari > Compartilhar > "Adicionar à Tela de Início"

---

## 💻 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Criar .env.local com as variáveis do Supabase
cp .env.example .env.local
# Edite .env.local com suas chaves

# Iniciar em modo dev
npm run dev
# Acesse http://localhost:3000
```

---

## 📁 Estrutura do Projeto

```
babycare/
├── src/
│   ├── app/
│   │   ├── auth/         # Login, cadastro, onboarding
│   │   ├── dashboard/    # Tela principal
│   │   ├── baby/         # Registros do bebê
│   │   ├── mother/       # Saúde da mãe
│   │   └── settings/     # Configurações
│   ├── components/
│   │   ├── baby/         # Modais de registro
│   │   ├── mother/       # Modal de saúde
│   │   ├── shared/       # BottomNav, ThemeProvider
│   │   └── ui/           # shadcn components
│   ├── lib/              # Supabase client, utils
│   └── types/            # TypeScript types
├── supabase/
│   └── migrations/       # SQL do banco de dados
├── public/
│   └── manifest.json     # PWA manifest
└── vercel.json           # Config de deploy
```

---

## 🗃️ Banco de Dados

| Tabela | Descrição |
|---|---|
| `profiles` | Perfil do usuário (criado automático no signup) |
| `babies` | Dados do bebê |
| `feeding_records` | Registros de mamadas |
| `sleep_records` | Registros de sono |
| `diaper_records` | Trocas de fraldas |
| `baby_health_records` | Saúde do bebê |
| `mother_health_records` | Saúde da mãe |
| `growth_records` | Crescimento |
| `vaccinations` | Vacinas |
| `appointments` | Consultas |

Todas as tabelas têm **RLS ativo** — cada usuário só vê seus próprios dados.

---

## 🔐 Segurança

- Autenticação via Supabase Auth (email/senha)
- Row Level Security em todas as tabelas
- Middleware Next.js protege todas as rotas autenticadas
- Variáveis sensíveis nunca expostas no cliente

---

## 📱 Funcionalidades

### Bebê
- ✅ Registro de mamadas (leite materno, fórmula, outro)
- ✅ Registro de sono (iniciar agora ou manual)
- ✅ Troca de fraldas (tipo + diarreia)
- ✅ Saúde (febre, temperatura, cólicas, medicamentos)
- ✅ Dashboard com resumo diário

### Mãe
- ✅ Registro de humor e energia
- ✅ Sintomas (dor de cabeça, náusea, febre)
- ✅ Sinais vitais (pressão, FC, temperatura)
- ✅ Qualidade do sono
- ✅ Histórico em timeline
- ✅ Gráficos de pressão e humor

### App
- ✅ Tema dark/light
- ✅ PWA instalável
- ✅ Mobile-first responsivo
- ✅ Animações suaves
- ✅ Proteção de rotas

---

## ⚠️ Próximas Funcionalidades (v2)

- [ ] Exportar PDF do histórico
- [ ] Modo offline completo (Service Worker)
- [ ] Notificações push (lembrete de mamada)
- [ ] Gráficos de crescimento
- [ ] Múltiplos bebês
- [ ] Compartilhar com parceiro(a)
