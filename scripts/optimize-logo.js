/**
 * NeuroConecta • Script de Automação e Inlining de Assets (Vercel & Cloud)
 * Execução: node scripts/optimize-logo.js
 */

const fs = require('fs');
const path = require('path');

function run() {
  console.log('⚡ Iniciando script de otimização de imagem/logo NeuroConecta...');
  
  const possibleSourcePaths = [
    path.join(__dirname, '../src/assets/neuroconecta_logo.png'),
    path.join(__dirname, '../public/neuroconecta_exact.png'),
    path.join(__dirname, '../public/neuroconecta_logo.png'),
  ];

  let sourcePath = null;
  for (const p of possibleSourcePaths) {
    if (fs.existsSync(p)) {
      sourcePath = p;
      break;
    }
  }

  if (!sourcePath) {
    console.error('❌ Erro: Arquivo de imagem fonte não foi encontrado.');
    process.exit(1);
  }

  console.log('📁 Imagem fonte encontrada:', sourcePath);
  const fileBuf = fs.readFileSync(sourcePath);
  const base64Data = fileBuf.toString('base64');
  const dataUri = `data:image/png;base64,${base64Data}`;

  const tsContent = `// Gerado automaticamente pelo script de otimização de assets
export const neuroconectaBase64 = "${dataUri}";
export const neuroconectaLogo = neuroconectaBase64;
export default neuroconectaLogo;
`;

  const outputPath = path.join(__dirname, '../src/assets/logo.ts');
  fs.writeFileSync(outputPath, tsContent);
  console.log('✅ Arquivo gerado com sucesso em:', outputPath);
  console.log('🎉 Logo embutido em Base64 DataURI! 100% à prova de falhas no Vercel.');
}

run();
