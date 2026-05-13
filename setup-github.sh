#!/bin/bash
# ==========================================
# BabyCare - GitHub Setup Script
# Rode: bash setup-github.sh SEU_USERNAME
# ==========================================

USERNAME=$1

if [ -z "$USERNAME" ]; then
  echo "Uso: bash setup-github.sh SEU_USERNAME_GITHUB"
  exit 1
fi

echo "🚀 Inicializando repositório..."
git init
git add .
git commit -m "feat: BabyCare initial commit - Next.js + Supabase"

echo "📦 Criando repositório no GitHub..."
gh repo create babycare --public --source=. --remote=origin --push

echo ""
echo "✅ Repositório criado e código enviado!"
echo ""
echo "🔗 Próximo passo - Deploy na Vercel:"
echo "1. Acesse https://vercel.com/new"
echo "2. Importe o repositório 'babycare' do GitHub"
echo "3. Adicione estas variáveis de ambiente:"
echo ""
echo "   NEXT_PUBLIC_SUPABASE_URL=https://iejevlxlpmefmzxdpyxr.supabase.co"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllamV2bHhscG1lZm16eGRweXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MzQ1ODEsImV4cCI6MjA5NDIxMDU4MX0.Pvi1XaaUaSBkKtA75NpinD7UOIRo1rWWVfoEUk7sO1g"
echo "   NEXT_PUBLIC_APP_URL=https://babycare.vercel.app"
echo ""
echo "4. Clique em Deploy 🎉"
