import React, { useState } from "react";
import { User, X, Plus, Trash2, Save, Shield, Users, Bell, Sparkles, Download, Upload, Database, Calendar } from "lucide-react";
import { UserProfile, DiagnosisStatus, FocusArea, SupportLevel, UserRole, getAgeCategory, calculateAge } from "../types";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
}) => {
  const [name, setName] = useState(userProfile.preferredName);
  const [pronouns, setPronouns] = useState(userProfile.pronouns);
  const [birthDate, setBirthDate] = useState(userProfile.birthDate || "2000-01-01");
  const [role, setRole] = useState<UserRole>(userProfile.userRole || (userProfile.isSuperAdmin ? "superadmin" : "pcd"));
  const [profRoleType, setProfRoleType] = useState(userProfile.professionalRoleType || "pcd");
  const [profRegisterNum, setProfRegisterNum] = useState(userProfile.professionalRegisterNumber || "");
  const [diagnosis, setDiagnosis] = useState<DiagnosisStatus>(userProfile.diagnosisStatus);
  const [supportLevel, setSupportLevel] = useState<SupportLevel>(userProfile.supportLevel || "nao_especificado");
  const [focus, setFocus] = useState<FocusArea>(userProfile.currentFocus);
  const [caregiverMode, setCaregiverMode] = useState<boolean>(userProfile.caregiverMode || false);
  const [notifications, setNotifications] = useState<boolean>(userProfile.notificationsEnabled || false);
  const [contacts, setContacts] = useState(userProfile.emergencyContacts || []);

  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactRel, setNewContactRel] = useState("");

  const [backupStatus, setBackupStatus] = useState("");

  if (!isOpen) return null;

  const handleExportBackup = () => {
    try {
      const dataToExport: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("neuroconecta_")) {
          dataToExport[key] = localStorage.getItem(key);
        }
      }
      const jsonStr = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `neuroconecta_backup_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setBackupStatus("✓ Backup gerado com sucesso!");
    } catch (e) {
      console.error(e);
      setBackupStatus("Erro ao exportar backup.");
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target?.result as string);
          Object.keys(importedData).forEach((key) => {
            if (key.startsWith("neuroconecta_")) {
              localStorage.setItem(key, importedData[key]);
            }
          });
          setBackupStatus("✓ Dados restaurados com sucesso! Recarregue para aplicar.");
          setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
          setBackupStatus("Arquivo de backup inválido.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    setContacts([
      ...contacts,
      {
        name: newContactName.trim(),
        phone: newContactPhone.trim(),
        relationship: newContactRel.trim() || "Apoio",
      },
    ]);
    setNewContactName("");
    setNewContactPhone("");
    setNewContactRel("");
  };

  const handleRemoveContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSaveProfile({
      ...userProfile,
      preferredName: name,
      pronouns,
      birthDate,
      userRole: role,
      professionalRoleType: profRoleType as any,
      professionalRegisterNumber: profRegisterNum.trim() || undefined,
      diagnosisStatus: diagnosis,
      supportLevel,
      currentFocus: focus,
      caregiverMode,
      notificationsEnabled: notifications,
      emergencyContacts: contacts,
      onboardingCompleted: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-800/90 border-b border-slate-700 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-950 text-teal-400 rounded-xl border border-teal-800/60">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Seu Perfil NeuroConecta</h2>
              <p className="text-xs text-slate-400">Personalize como o aplicativo e o assistente se comunicam com você.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          
          {/* Preferred Name */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-200">Como prefere ser chamado(a)?</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Ana, Lucas, Carol, Alex..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Pronouns */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-200">Pronomes de preferência</label>
            <input
              type="text"
              value={pronouns}
              onChange={(e) => setPronouns(e.target.value)}
              placeholder="Ex: ela/dela, ele/dele, elu/delu..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Birth Date & Age Category */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-400" /> Data de Nascimento
              </label>
              <span className="text-xs font-bold text-teal-300 bg-teal-950 px-2 py-0.5 rounded-lg border border-teal-800">
                {getAgeCategory(birthDate)} ({calculateAge(birthDate) !== null ? `${calculateAge(birthDate)} anos` : "N/A"})
              </span>
            </div>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* User Role Selection */}
          <div className="space-y-3 p-3.5 bg-slate-950 border border-teal-800/80 rounded-2xl">
            <label className="block font-bold text-teal-300 text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-400" /> Perfil / Módulo Principal de Acesso
            </label>
            <select
              value={role}
              onChange={(e) => {
                const newRole = e.target.value as UserRole;
                setRole(newRole);
                if (newRole === "cuidador_educador" || newRole === "educador_aee") setProfRoleType("educador");
                else if (newRole === "profissional_apoio") setProfRoleType("terapeuta");
                else setProfRoleType("pcd");
              }}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs font-semibold focus:outline-none focus:border-teal-500"
            >
              <option value="pcd">🧩 Pessoa / Usuário(a) (Autonomia, rotina, comunicação e autorregulação)</option>
              <option value="cuidador_familiar">🏡 Família / Cuidador(a) (Acompanhamento e registro colaborativo)</option>
              <option value="cuidador_educador">🎓 Educador(a) / Escola / AEE (Acomodações DUA e Minuta PEI)</option>
              <option value="profissional_apoio">🤝 Profissional de Apoio (Terapia, Psicopedagogia ou Apoio Funcional)</option>
              <option value="superadmin">⚡ Administrador(a) do Sistema (Gestão técnica)</option>
            </select>

            {role === "profissional_apoio" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">Área de Atuação</label>
                  <select
                    value={profRoleType}
                    onChange={(e) => setProfRoleType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100"
                  >
                    <option value="terapeuta">Terapeuta Ocupacional / Fonoaudiólogo(a)</option>
                    <option value="psicologo">Psicólogo(a) / Neuropsicólogo(a)</option>
                    <option value="educador">Psicopedagogo(a) / Especialista em Inclusão</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Registro Profissional (Conselho / Órgão)
                  </label>
                  <input
                    type="text"
                    value={profRegisterNum}
                    onChange={(e) => setProfRegisterNum(e.target.value)}
                    placeholder="Ex: CREFITO, CRP, CRFa, etc."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100"
                  />
                </div>
              </div>
            )}

            {(role === "cuidador_educador" || role === "educador_aee") && (
              <div className="space-y-1 pt-2">
                <label className="block text-xs font-semibold text-slate-300">Instituição de Ensino / Matrícula / Registro</label>
                <input
                  type="text"
                  value={profRegisterNum}
                  onChange={(e) => setProfRegisterNum(e.target.value)}
                  placeholder="Ex: Matrícula Escolar ou Registro de Docência"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100"
                />
              </div>
            )}

            {role === "pcd" && (
              <div className="space-y-1 pt-2">
                <label className="block text-xs font-semibold text-slate-300">Carteira CIPTEA / Cartão BPC (Opcional)</label>
                <input
                  type="text"
                  value={profRegisterNum}
                  onChange={(e) => setProfRegisterNum(e.target.value)}
                  placeholder="Ex: CIPTEA-CE 2026/001"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100"
                />
              </div>
            )}
          </div>

          {/* Diagnosis & Support Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-200">Identificação & Apoio</label>
              <select
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value as DiagnosisStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-teal-500"
              >
                <option value="autodiagnosticado">Autodiagnosticado / Identificação neurodivergente</option>
                <option value="investigacao">Em processo de avaliação / Investigação</option>
                <option value="laudo_formal">Laudo formal / Diagnóstico confirmado</option>
                <option value="necessidades_sensoriais_comunicacao">Necessidades sensoriais ou de comunicação</option>
                <option value="sem_diagnostico">Sem diagnóstico / Uso de apoio à rotina e regulação</option>
                <option value="familiar_apoiador">Familiar ou cuidador(a)</option>
                <option value="nao_informado">Prefiro não informar</option>
              </select>
              <p className="text-[10px] text-slate-400 leading-tight mt-1">
                Acolhemos pessoas diagnosticadas, em investigação, com necessidades específicas ou que se beneficiem das ferramentas de organização e autorregulação. Não é exigido laudo para utilizar o NeuroConecta.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-200">Nível de Suporte (TEA)</label>
              <select
                value={supportLevel}
                onChange={(e) => {
                  const val = e.target.value;
                  setSupportLevel(val === "1" ? 1 : val === "2" ? 2 : val === "3" ? 3 : "nao_especificado");
                }}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-teal-500"
              >
                <option value="1">Nível 1 (Apoio leve / Leve a moderado)</option>
                <option value="2">Nível 2 (Apoio substancial / Intermediário)</option>
                <option value="3">Nível 3 (Apoio muito substancial / Intenso)</option>
                <option value="nao_especificado">Não especificado / Em avaliação</option>
              </select>
            </div>
          </div>

          {/* Caregiver Mode & Notifications Toggles */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-400" />
                <div>
                  <h4 className="font-semibold text-slate-100 text-xs">Modo Cuidador / Familiar / Rede de Apoio</h4>
                  <p className="text-[11px] text-slate-400">Exibe orientações específicas para familiares acompanharem no dia a dia.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={caregiverMode}
                onChange={(e) => setCaregiverMode(e.target.checked)}
                className="w-5 h-5 accent-teal-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-teal-400" />
                <div>
                  <h4 className="font-semibold text-slate-100 text-xs">Notificações Inteligentes Ativas</h4>
                  <p className="text-[11px] text-slate-400">Lembretes para hidratação, pausas sensoriais e transição de rotina.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-5 h-5 accent-teal-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Current Focus Area */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-200">Área principal de foco hoje</label>
            <select
              value={focus}
              onChange={(e) => setFocus(e.target.value as FocusArea)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500 text-xs"
            >
              <option value="rotina">Rotina Visual e Organização</option>
              <option value="testes">Testes e Autoavaliação</option>
              <option value="sensorial">Regulação Sensorial</option>
              <option value="comunicacao">Comunicação e Scripts Sociais</option>
              <option value="crise">Prevenção e Apoio em Crise</option>
              <option value="aprendizado">Educação e Empoderamento</option>
              <option value="geral">Geral / Diversos</option>
            </select>
          </div>

          {/* Backup & Local Data Export */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-teal-400 font-semibold">
              <Database className="w-4 h-4" />
              <span>Backup Local & Portabilidade dos Dados</span>
            </div>
            <p className="text-xs text-slate-400">
              Exporte seus registros (rotinas, humor, testes, medicamentos) para um arquivo JSON seguro ou restaure em outro aparelho:
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExportBackup}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition"
              >
                <Download className="w-4 h-4" /> Exportar Backup (JSON)
              </button>

              <label className="cursor-pointer px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition">
                <Upload className="w-4 h-4 text-teal-400" /> Restaurar de Arquivo
                <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
              </label>
            </div>

            {backupStatus && (
              <p className="text-xs text-emerald-400 font-medium font-mono">{backupStatus}</p>
            )}
          </div>

          {/* Emergency Contacts */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-teal-400 font-semibold">
              <Shield className="w-4 h-4" />
              <span>Contatos de Emergência Pessoais</span>
            </div>
            <p className="text-xs text-slate-400">
              Esses contatos ficarão salvos localmente e estarão disponíveis para ligação instantânea na tela de crise/SOS.
            </p>

            {contacts.map((c, i) => (
              <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-200">{c.name} ({c.relationship})</p>
                  <p className="text-xs text-slate-400">{c.phone}</p>
                </div>
                <button
                  onClick={() => handleRemoveContact(i)}
                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Add contact form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <input
                type="text"
                placeholder="Nome"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
              />
              <input
                type="text"
                placeholder="Telefone/WhatsApp"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Vínculo (Mãe, Amigo...)"
                  value={newContactRel}
                  onChange={(e) => setNewContactRel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
                />
                <button
                  onClick={handleAddContact}
                  className="px-3 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" /> Salvar Perfil
          </button>
        </div>

      </div>
    </div>
  );
};
