import React, { useState } from "react";
import { 
  FolderLock, 
  FileText, 
  UploadCloud, 
  ShieldCheck, 
  Download, 
  Trash2, 
  Eye, 
  Calendar, 
  AlertCircle,
  FileCheck2,
  Lock
} from "lucide-react";
import { MusicotherapyCase, MusicotherapyDocument } from "../../types/musicotherapy";

interface MusicTherapyDocumentsViewProps {
  currentCase: MusicotherapyCase;
  isDark?: boolean;
}

export const MusicTherapyDocumentsView: React.FC<MusicTherapyDocumentsViewProps> = ({
  currentCase,
  isDark = true,
}) => {
  const [documents, setDocuments] = useState<MusicotherapyDocument[]>([
    {
      id: "doc-01",
      case_id: currentCase.id,
      patient_id: currentCase.patient_id,
      title: "Encaminhamento Neuropediatria (Dr. Carlos Queiroz)",
      category: "indicacao_prescricao",
      file_name: "encaminhamento_neuropediatria_2026.pdf",
      file_path: "/docs/encaminhamento_neuropediatria_2026.pdf",
      file_size: 245000,
      mime_type: "application/pdf",
      is_private: true,
      uploaded_by: currentCase.professional_name,
      uploaded_at: "2026-02-10",
      notes: "Indicação formal de musicoterapia com solicitação de 40 sessões anuais.",
    },
    {
      id: "doc-02",
      case_id: currentCase.id,
      patient_id: currentCase.patient_id,
      title: "Autorização de Convênio / Guia TISS",
      category: "convenio_guia",
      file_name: "guia_tiss_autorizada_mar2026.pdf",
      file_path: "/docs/guia_tiss_autorizada_mar2026.pdf",
      file_size: 180000,
      mime_type: "application/pdf",
      is_private: true,
      uploaded_by: currentCase.professional_name,
      uploaded_at: "2026-03-01",
      notes: "Guia autorizada para o primeiro semestre com código de procedimento de Musicoterapia.",
    },
    {
      id: "doc-03",
      case_id: currentCase.id,
      patient_id: currentCase.patient_id,
      title: "Comprovante de Habilitação Profissional (UBAM/CBO)",
      category: "comprovacao_profissional",
      file_name: "certidao_regularidade_ubam.pdf",
      file_path: "/docs/certidao_regularidade_ubam.pdf",
      file_size: 320000,
      mime_type: "application/pdf",
      is_private: true,
      uploaded_by: currentCase.professional_name,
      uploaded_at: "2026-01-15",
      notes: "Certidão de regularidade do musicoterapeuta anexada para fins de credenciamento.",
    },
  ]);

  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState<MusicotherapyDocument["category"]>("indicacao_prescricao");
  const [uploadNotes, setUploadNotes] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    const newDoc: MusicotherapyDocument = {
      id: `doc-${Date.now().toString(36)}`,
      case_id: currentCase.id,
      patient_id: currentCase.patient_id,
      title: uploadTitle.trim(),
      category: uploadCategory,
      file_name: `${uploadTitle.toLowerCase().replace(/\s+/g, "_")}.pdf`,
      file_path: `/docs/${uploadTitle.toLowerCase().replace(/\s+/g, "_")}.pdf`,
      file_size: 210000,
      mime_type: "application/pdf",
      is_private: true,
      uploaded_by: currentCase.professional_name,
      uploaded_at: new Date().toISOString().split("T")[0],
      notes: uploadNotes.trim() || undefined,
    };

    setDocuments([newDoc, ...documents]);
    setShowUploadModal(false);
    setUploadTitle("");
    setUploadNotes("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-2xl border shadow-sm ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                Repositório Clínico Privado & Seguro
              </span>
              <span className="text-xs text-slate-400">Pessoa Acompanhada: <strong>{currentCase.patient_name}</strong></span>
            </div>
            <h2 className="text-xl font-black mt-1 flex items-center gap-2">
              <FolderLock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Documentos, Prescrições & Guias de Convênio
            </h2>
            <p className="text-xs text-slate-400">
              Armazenamento protegido com isolamento por caso clínico e conformidade com a LGPD e sigilo profissional.
            </p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <UploadCloud className="w-4 h-4" /> Anexar Documento
          </button>
        </div>

        <div className="pt-4 flex items-center gap-2 text-xs text-slate-400">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Todos os arquivos são criptografados e acessíveis exclusivamente pela equipe autorizada do caso.</span>
        </div>
      </div>

      {/* Grid de Documentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-between ${
              isDark ? "bg-slate-900 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-950/80 text-teal-300 border border-teal-800">
                  {doc.category === "indicacao_prescricao" && "Prescrição Médica"}
                  {doc.category === "convenio_guia" && "Guia TISS / Convênio"}
                  {doc.category === "comprovacao_profissional" && "Habilitação UBAM"}
                  {doc.category === "laudo" && "Laudo Multidisciplinar"}
                  {doc.category === "plano" && "Plano Terapêutico"}
                  {doc.category === "relatorio" && "Relatório Anterior"}
                  {doc.category === "outro" && "Outro Documento"}
                </span>
                <span className="text-[10px] text-slate-500">{doc.uploaded_at}</span>
              </div>

              <h4 className="text-xs font-bold text-slate-100 mb-1 flex items-start gap-1.5">
                <FileText className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>{doc.title}</span>
              </h4>

              {doc.notes && (
                <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {doc.notes}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800 text-[11px]">
              <span className="text-slate-500 font-mono text-[10px]">
                {(doc.file_size / 1024).toFixed(0)} KB • PDF
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => alert(`Visualizando documento protegido: ${doc.title}`)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
                  title="Visualizar documento"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => alert(`Baixando cópia autêntica: ${doc.file_name}`)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-teal-400 hover:text-teal-300 transition"
                  title="Baixar arquivo"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Anexar Documento */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2 text-teal-400">
                <UploadCloud className="w-5 h-5" /> Anexar Documento ao Prontuário
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddDocument} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Título do Documento *</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Ex: Laudo Neuropsicológico / Guia de Encaminhamento"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Categoria Clínica *</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                >
                  <option value="indicacao_prescricao">Indicação / Prescrição Médica</option>
                  <option value="convenio_guia">Guia de Convênio / TISS</option>
                  <option value="comprovacao_profissional">Comprovante de Habilitação UBAM/CBO</option>
                  <option value="laudo">Laudo de Suporte / Avaliação Multidisciplinar</option>
                  <option value="plano">Plano de Atendimento Anterior</option>
                  <option value="outro">Outro Documento de Apoio</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Observações Técnicas</label>
                <textarea
                  rows={2}
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="Detalhes ou observações sobre a validade ou conteúdo do documento..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="p-3 bg-slate-950 border border-dashed border-slate-700 rounded-xl text-center space-y-1">
                <UploadCloud className="w-6 h-6 text-teal-400 mx-auto" />
                <span className="text-xs text-slate-300 block font-semibold">Arraste ou selecione o arquivo PDF</span>
                <span className="text-[10px] text-slate-500 block">Tamanho máximo: 25MB • Formatos aceitos: PDF, PNG, JPEG</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-md"
                >
                  Salvar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
