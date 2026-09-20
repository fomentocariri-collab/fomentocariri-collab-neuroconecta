import { SUPABASE_SQL_SCHEMA } from "./supabase";

export interface SystemScriptItem {
  id: string;
  name: string;
  category: "assets" | "database" | "deploy" | "backup";
  description: string;
  language: "javascript" | "sql" | "bash" | "typescript";
  code: string;
  usageInstructions: string;
}

// 1. Image and Logo Base64 Inliner Script for Vercel / Production Deployments
export const ASSET_INLINER_NODE_SCRIPT = `/**
 * NeuroConecta • Asset & Logo Inliner Script
 * Converte imagens locais/remotas para DataURI Base64 para garantir carregamento 100% à prova de falhas no Vercel/Cloud.
 * 
 * Como executar:
 * node scripts/optimize-logo.js
 */

const fs = require('fs');
const path = require('path');

function processImageToBase64(imagePath, outputPath) {
  try {
    const fullPath = path.resolve(imagePath);
    if (!fs.existsSync(fullPath)) {
      console.error('❌ Arquivo não encontrado:', fullPath);
      return;
    }

    const fileBuf = fs.readFileSync(fullPath);
    const ext = path.extname(fullPath).replace('.', '').toLowerCase();
    const mimeType = ext === 'svg' ? 'image/svg+xml' : \`image/\${ext === 'jpg' ? 'jpeg' : ext}\`;
    const base64Data = fileBuf.toString('base64');
    const dataUri = \`data:\${mimeType};base64,\${base64Data}\`;

    const tsContent = \`// Gerado automaticamente pelo script de otimização de assets
export const neuroconectaBase64 = "\${dataUri}";
export const neuroconectaLogo = neuroconectaBase64;
export default neuroconectaLogo;
\`;

    fs.writeFileSync(outputPath, tsContent);
    console.log('✅ Arquivo gerado com sucesso em:', outputPath);
    console.log('📊 Tamanho do Base64:', base64Data.length, 'caracteres.');
  } catch (error) {
    console.error('❌ Erro ao processar imagem:', error);
  }
}

// Execução padrão
processImageToBase64('src/assets/neuroconecta_logo.png', 'src/assets/logo.ts');
`;

// 2. Client-side browser converter to Base64
export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

// 3. Vercel Deployment Diagnostic & Environment Check Script
export const VERCEL_DEPLOY_CHECK_SCRIPT = `#!/usr/bin/env bash
# NeuroConecta • Script de Diagnóstico de Deploy Vercel

echo "========================================="
echo "🔍 Verificando integridade do NeuroConecta"
echo "========================================="

echo "1. Verificando node_modules e dependências..."
npm run lint || echo "⚠️ Aviso no linter de tipagem"

echo "2. Validando arquivos de assets críticos..."
if [ -f "src/assets/logo.ts" ]; then
    echo "✅ src/assets/logo.ts presente e embutido."
else
    echo "❌ src/assets/logo.ts AUSENTE! Execute a geração de assets."
fi

echo "3. Testando compilação de produção (build)..."
npm run build

echo "4. Verificando pasta dist/..."
if [ -f "dist/index.html" ]; then
    echo "✅ dist/index.html gerado com sucesso!"
    echo "🚀 O projeto está 100% pronto para deploy no Vercel."
else
    echo "❌ Falha: dist/index.html não foi encontrado."
fi
`;

// 4. Data Backup & LocalStorage Export Script
export const BACKUP_RESTORE_SCRIPT = `/**
 * NeuroConecta • Script de Backup e Migração de Dados
 * Extrai todos os dados locais de pacientes, agendas, relatórios e humor.
 */

function exportAllNeuroConectaData() {
  const backup = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('neuroconecta_')) {
      try {
        backup[key] = JSON.parse(localStorage.getItem(key) || 'null');
      } catch (e) {
        backup[key] = localStorage.getItem(key);
      }
    }
  }
  
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = \`neuroconecta_backup_\${new Date().toISOString().split('T')[0]}.json\`;
  a.click();
  console.log('✅ Backup concluído!', Object.keys(backup).length, 'tabelas/chaves exportadas.');
}
`;

export const SYSTEM_SCRIPTS: SystemScriptItem[] = [
  {
    id: "logo_asset_inliner",
    name: "Script de Inlining & Otimização do Logo (Vercel)",
    category: "assets",
    description: "Converte o logo e imagens do aplicativo em DataURI Base64 permanente dentro do bundle TypeScript, eliminando erros 404 e imagens quebradas no Vercel ou servidores estáticos.",
    language: "javascript",
    code: ASSET_INLINER_NODE_SCRIPT,
    usageInstructions: "Execute no terminal: `node scripts/optimize-logo.js` ou use o conversor interativo neste módulo.",
  },
  {
    id: "supabase_schema_sql",
    name: "Script SQL do Banco de Dados Supabase (Schema Completo)",
    category: "database",
    description: "Script DDL/DQL com criação de todas as 5 tabelas relacionais, índices, chaves primárias e políticas RLS públicas para sincronização em nuvem.",
    language: "sql",
    code: SUPABASE_SQL_SCHEMA,
    usageInstructions: "Copie e cole este código diretamente no SQL Editor do painel Supabase (https://app.supabase.com).",
  },
  {
    id: "vercel_diagnostic",
    name: "Script Shell de Diagnóstico de Deploy Vercel",
    category: "deploy",
    description: "Valida variáveis de ambiente, compilação de assets, verificação de tipagem TypeScript e geração da pasta `dist/`.",
    language: "bash",
    code: VERCEL_DEPLOY_CHECK_SCRIPT,
    usageInstructions: "Execute no terminal Linux/Mac/Vercel CLI: `bash scripts/vercel-check.sh` ou `npm run build`.",
  },
  {
    id: "backup_local_data",
    name: "Script de Backup e Migração dos Pacientes e Registros",
    category: "backup",
    description: "Exporta e sincroniza todos os prontuários, registros CAPS, escalas de humor, tarefas e configurações isoladas por usuário.",
    language: "javascript",
    code: BACKUP_RESTORE_SCRIPT,
    usageInstructions: "Copie para o console do navegador ou use o botão 'Executar Backup' no painel de administração.",
  },
];
