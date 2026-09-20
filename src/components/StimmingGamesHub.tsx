import React, { useState, useRef, useEffect } from "react";
import neuroconectaLogo from "../assets/logo";
import { 
  Gamepad2, 
  Sparkles, 
  RotateCcw, 
  Smile, 
  Volume2, 
  VolumeX, 
  Zap, 
  CheckCircle2, 
  Award,
  CircleDot,
  Heart,
  Headphones,
  CalendarCheck,
  Shield,
  Feather,
  Shapes,
  Grid,
  Hash,
  Palette,
  Puzzle,
  Eraser,
  Download,
  Brush,
  Trash2,
  Undo2,
  Trophy,
  Star,
  Check,
  Brain,
  Cpu,
  Layers,
  Binary,
  HelpCircle,
  Activity
} from "lucide-react";

interface StimmingGamesHubProps {
  isDark?: boolean;
}

type ToyMode = "popit" | "numeros" | "superdotacao" | "pintura" | "puzzle" | "memoria" | "bolhas" | "classificador";

export const StimmingGamesHub: React.FC<StimmingGamesHubProps> = ({ isDark = false }) => {
  const [activeToy, setActiveToy] = useState<ToyMode>("popit");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Audio Synth Ref for Pops & Clicks
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playPopSound = (pitch = 1) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(300 * pitch, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120 * pitch, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {
      console.warn("Audio pop error:", e);
    }
  };

  const playWinSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.35);
      });
    } catch (e) {
      console.warn("Win sound error:", e);
    }
  };

  // --- 1. POP-IT STATE ---
  const [popItGrid, setPopItGrid] = useState<boolean[]>(Array(36).fill(false));
  const [popCount, setPopCount] = useState(0);

  const handlePopBubble = (index: number) => {
    const nextGrid = [...popItGrid];
    const newState = !nextGrid[index];
    nextGrid[index] = newState;
    setPopItGrid(nextGrid);
    if (newState) {
      setPopCount((prev) => prev + 1);
      playPopSound(0.8 + Math.random() * 0.5);
    } else {
      playPopSound(0.6);
    }
  };

  const handleResetPopIt = () => {
    setPopItGrid(Array(36).fill(false));
    playPopSound(1.2);
  };

  // --- 2. TOY COM NÚMEROS (15-PUZZLE & SEQUÊNCIA NUMÉRICA EXPANDIDA) ---
  const [numberMode, setNumberMode] = useState<"sequencia" | "15puzzle">("sequencia");
  const [seqType, setSeqType] = useState<"1a36" | "1a100" | "primos" | "fibonacci" | "potencias">("1a36");
  
  // Sequência Numérica State
  const [nextExpectedIndex, setNextExpectedIndex] = useState(0);
  const [numberPops, setNumberPops] = useState<boolean[]>(Array(100).fill(false));
  const [numberStreak, setNumberStreak] = useState(0);

  // Helper arrays for advanced sequences
  const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
  const FIBONACCI = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610];
  const POWERS_OF_TWO = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096];

  const getActiveSequenceList = (): number[] => {
    if (seqType === "1a36") return Array.from({ length: 36 }, (_, i) => i + 1);
    if (seqType === "1a100") return Array.from({ length: 100 }, (_, i) => i + 1);
    if (seqType === "primos") return PRIMES;
    if (seqType === "fibonacci") return FIBONACCI;
    if (seqType === "potencias") return POWERS_OF_TWO;
    return Array.from({ length: 36 }, (_, i) => i + 1);
  };

  const activeSeqList = getActiveSequenceList();

  const handleNumberPop = (numValue: number, idx: number) => {
    const updated = [...numberPops];
    const isCurrentlyPopped = updated[idx];
    updated[idx] = !isCurrentlyPopped;
    setNumberPops(updated);

    if (!isCurrentlyPopped) {
      if (idx === nextExpectedIndex) {
        setNextExpectedIndex(prev => prev + 1);
        setNumberStreak(prev => prev + 1);
        playPopSound(0.8 + (idx / activeSeqList.length) * 0.8);
        if (idx === activeSeqList.length - 1) {
          playWinSound();
        }
      } else {
        playPopSound(0.7);
      }
    } else {
      playPopSound(0.5);
    }
  };

  const handleResetNumbers = () => {
    setNumberPops(Array(100).fill(false));
    setNextExpectedIndex(0);
    setNumberStreak(0);
    playPopSound(1.0);
  };

  // --- 2B. DESAFIOS DE SUPERDOTAÇÃO & ALTAS HABILIDADES (AH/SD & ADULTOS) ---
  const [superMode, setSuperMode] = useState<"raven" | "hanoi" | "nback">("raven");

  // RAVEN LOGICAL MATRICES STATE
  const RAVEN_QUESTIONS = [
    {
      id: "r1",
      title: "Desafio 1: Rotação & Projeção Geométrica 2D",
      description: "Uma figura quadrada de 4 quadrantes gira 90° no sentido horário a cada coluna e inverte o padrão de cor (preto/branco) a cada linha. Qual elemento completa a posição vazia [?]:",
      grid: [
        ["▲ Branco (Topo)", "► Branco (Direita)", "▼ Branco (Base)"],
        ["▲ Preto (Topo)", "► Preto (Direita)", "▼ Preto (Base)"],
        ["▲ Alter (Topo)", "► Alter (Direita)", "[ ? ]"]
      ],
      options: [
        { label: "▼ Alter (Base)", correct: true, explanation: "Correto! A regra combina rotação horário (0° -> 90° -> 180°) com alternância de preenchimento." },
        { label: "◄ Alter (Esquerda)", correct: false, explanation: "Incorreto. A rotação no 3º passo do vetor de 180° deve apontar para baixo (▼)." },
        { label: "▲ Preto (Topo)", correct: false, explanation: "Incorreto. A direção de rotação da coluna 3 é 180° (para baixo)." },
        { label: "▼ Branco (Base)", correct: false, explanation: "Incorreto. Falhou a alternância da linha 3." }
      ]
    },
    {
      id: "r2",
      title: "Desafio 2: Lógica Booleana de Formas (Operação XOR)",
      description: "A 3ª coluna de cada linha é o resultado da fusão XOR (ou exclusivo) entre a 1ª e a 2ª coluna. Linhas sobrepostas se cancelam. Qual padrão completa [?]:",
      grid: [
        ["Linha Vertical (|)", "Linha Horizontal (-)", "Cruz (+)"],
        ["Círculo (○)", "Linha Vertical (|)", "Círculo com Risco (🛈)"],
        ["Quadrado (□)", "Linha Diagonal (/)", "[ ? ]"]
      ],
      options: [
        { label: "Quadrado cortado por Diagonal (□ + /)", correct: true, explanation: "Exato! Como não há segmentos comuns entre o Quadrado e a Diagonal, a operação XOR preserva ambos os elementos." },
        { label: "Apenas Quadrado (□)", correct: false, explanation: "Incorreto. A diagonal da 2ª coluna não foi cancelada por nada no quadrado." },
        { label: "Apenas Diagonal (/)", correct: false, explanation: "Incorreto. O quadrado não se cancela." },
        { label: "Cruz sem borda (+)", correct: false, explanation: "Incorreto. Operação XOR mantém traços não-coincidentes." }
      ]
    },
    {
      id: "r3",
      title: "Desafio 3: Matriz Aritmética Modular & Primos",
      description: "Observe a regra: Elemento C(i,j) = (Prime(i) * Prime(j)) mod 7. Onde Primes = [2, 3, 5]. Qual o valor de [?]:",
      grid: [
        ["(2*2) mod 7 = 4", "(2*3) mod 7 = 6", "(2*5) mod 7 = 3"],
        ["(3*2) mod 7 = 6", "(3*3) mod 7 = 2", "(3*5) mod 7 = 1"],
        ["(5*2) mod 7 = 3", "(5*3) mod 7 = 1", "[ ? ]"]
      ],
      options: [
        { label: "4", correct: true, explanation: "Excelente! (5 * 5) = 25. 25 mod 7 = 4 (pois 21 é o múltiplo de 7 mais próximo e 25 - 21 = 4)." },
        { label: "2", correct: false, explanation: "Incorreto. 25 mod 7 é 4, não 2." },
        { label: "6", correct: false, explanation: "Incorreto. 25 mod 7 = 4." },
        { label: "1", correct: false, explanation: "Incorreto. 25 / 7 = 3 com resto 4." }
      ]
    }
  ];

  const [ravenIndex, setRavenIndex] = useState(0);
  const [selectedRavenOpt, setSelectedRavenOpt] = useState<number | null>(null);
  const [ravenScore, setRavenScore] = useState(0);

  const handleAnswerRaven = (optIdx: number) => {
    setSelectedRavenOpt(optIdx);
    if (RAVEN_QUESTIONS[ravenIndex].options[optIdx].correct) {
      setRavenScore(prev => prev + 1);
      playWinSound();
    } else {
      playPopSound(0.5);
    }
  };

  // TOWERS OF HANOI STATE
  const [hanoiDisksCount, setHanoiDisksCount] = useState<number>(4);
  const [hanoiTowers, setHanoiTowers] = useState<number[][]>([[4, 3, 2, 1], [], []]);
  const [hanoiSelectedTower, setHanoiSelectedTower] = useState<number | null>(null);
  const [hanoiMoves, setHanoiMoves] = useState(0);

  const resetHanoi = (count = hanoiDisksCount) => {
    const initialPeg: number[] = [];
    for (let i = count; i >= 1; i--) initialPeg.push(i);
    setHanoiTowers([initialPeg, [], []]);
    setHanoiSelectedTower(null);
    setHanoiMoves(0);
    setHanoiDisksCount(count);
    playPopSound(1.0);
  };

  const handleHanoiClick = (towerIdx: number) => {
    if (hanoiSelectedTower === null) {
      // Select source tower if not empty
      if (hanoiTowers[towerIdx].length > 0) {
        setHanoiSelectedTower(towerIdx);
        playPopSound(1.1);
      }
    } else {
      // Target tower selected
      if (hanoiSelectedTower === towerIdx) {
        // Deselect
        setHanoiSelectedTower(null);
        playPopSound(0.6);
        return;
      }

      const sourcePeg = [...hanoiTowers[hanoiSelectedTower]];
      const targetPeg = [...hanoiTowers[towerIdx]];

      const movingDisk = sourcePeg[sourcePeg.length - 1];
      const targetTopDisk = targetPeg.length > 0 ? targetPeg[targetPeg.length - 1] : Infinity;

      // Rule: cannot place larger disk on smaller disk
      if (movingDisk < targetTopDisk) {
        sourcePeg.pop();
        targetPeg.push(movingDisk);

        const newTowers = [...hanoiTowers];
        newTowers[hanoiSelectedTower] = sourcePeg;
        newTowers[towerIdx] = targetPeg;

        setHanoiTowers(newTowers);
        setHanoiMoves(prev => prev + 1);
        setHanoiSelectedTower(null);
        playPopSound(1.4);

        // Win check (if target peg 2 or 3 has all disks)
        if (newTowers[1].length === hanoiDisksCount || newTowers[2].length === hanoiDisksCount) {
          playWinSound();
        }
      } else {
        // Invalid move
        playPopSound(0.4);
        setHanoiSelectedTower(null);
      }
    }
  };

  // DUAL N-BACK STATE
  const [nBackLevel, setNBackLevel] = useState<1 | 2 | 3>(2);
  const [nBackActive, setNBackActive] = useState(false);
  const [nBackHistory, setNBackHistory] = useState<{ pos: number; sound: string }[]>([]);
  const [nBackStep, setNBackStep] = useState(0);
  const [nBackScore, setNBackScore] = useState(0);
  const [nBackFeedback, setNBackFeedback] = useState("");

  const NBACK_POSITIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const NBACK_SOUNDS = ["A", "B", "C", "D", "E", "F"];

  const handleStartNBack = () => {
    setNBackActive(true);
    setNBackHistory([]);
    setNBackStep(0);
    setNBackScore(0);
    setNBackFeedback("Sessão Iniciada! Observe o quadrado e o som.");
    generateNextNBackStep([]);
  };

  const generateNextNBackStep = (currentHist: { pos: number; sound: string }[]) => {
    const nextPos = Math.floor(Math.random() * 9);
    const nextSound = NBACK_SOUNDS[Math.floor(Math.random() * NBACK_SOUNDS.length)];
    const newHist = [...currentHist, { pos: nextPos, sound: nextSound }];
    setNBackHistory(newHist);
    playPopSound(1.2 + nextPos * 0.1);
  };

  const handleNBackCheckPos = () => {
    if (nBackHistory.length <= nBackLevel) return;
    const current = nBackHistory[nBackHistory.length - 1];
    const target = nBackHistory[nBackHistory.length - 1 - nBackLevel];
    if (current.pos === target.pos) {
      setNBackScore(prev => prev + 10);
      setNBackFeedback("✓ Correto! Coincidência de posição detectada (+10 pts)");
      playWinSound();
    } else {
      setNBackFeedback("✗ Incorreto. A posição não correspondia a N-passos atrás.");
      playPopSound(0.5);
    }
  };

  // 15-Puzzle Sliding Numbers State
  const INITIAL_PUZZLE_BOARD = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
  const [puzzleBoard, setPuzzleBoard] = useState<number[]>(INITIAL_PUZZLE_BOARD);
  const [puzzleMoves, setPuzzleMoves] = useState(0);

  const shuffle15Puzzle = () => {
    let board = [...INITIAL_PUZZLE_BOARD];
    for (let i = 0; i < 80; i++) {
      const zeroIdx = board.indexOf(0);
      const validMoves: number[] = [];
      const row = Math.floor(zeroIdx / 4);
      const col = zeroIdx % 4;
      if (row > 0) validMoves.push(zeroIdx - 4);
      if (row < 3) validMoves.push(zeroIdx + 4);
      if (col > 0) validMoves.push(zeroIdx - 1);
      if (col < 3) validMoves.push(zeroIdx + 1);
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      board[zeroIdx] = board[randomMove];
      board[randomMove] = 0;
    }
    setPuzzleBoard(board);
    setPuzzleMoves(0);
    playPopSound(1.1);
  };

  const handleSlideTile = (index: number) => {
    const zeroIdx = puzzleBoard.indexOf(0);
    const row = Math.floor(index / 4);
    const col = index % 4;
    const zRow = Math.floor(zeroIdx / 4);
    const zCol = zeroIdx % 4;

    const isAdjacent = (Math.abs(row - zRow) + Math.abs(col - zCol)) === 1;
    if (isAdjacent) {
      const updated = [...puzzleBoard];
      updated[zeroIdx] = updated[index];
      updated[index] = 0;
      setPuzzleBoard(updated);
      setPuzzleMoves(prev => prev + 1);
      playPopSound(1.0 + (updated[zeroIdx] / 15) * 0.5);

      // Check win
      if (updated.every((val, i) => val === INITIAL_PUZZLE_BOARD[i])) {
        playWinSound();
      }
    }
  };

  // --- 3. PAINEL DE PINTURA SENSORIAL ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#0d9488");
  const [brushSize, setBrushSize] = useState(8);
  const [activeTool, setActiveTool] = useState<"brush" | "eraser" | "stamp">("brush");
  const [selectedStamp, setSelectedStamp] = useState("❤️");
  const [canvasHistory, setCanvasHistory] = useState<ImageData[]>([]);

  const PALETTE_COLORS = [
    { label: "Teal Calmo", hex: "#0d9488" },
    { label: "Azul Céu", hex: "#06b6d4" },
    { label: "Lilás Suave", hex: "#8b5cf6" },
    { label: "Rosa Calmo", hex: "#ec4899" },
    { label: "Verde Menta", hex: "#10b981" },
    { label: "Amarelo Sol", hex: "#f59e0b" },
    { label: "Branco", hex: "#ffffff" },
    { label: "Grafite", hex: "#1e293b" },
  ];

  const STAMP_OPTIONS = ["❤️", "⭐", "🌸", "🦋", "🧩", "☀️", "🌈", "😊"];

  // Initialize canvas width/height to match container width
  useEffect(() => {
    if (activeToy === "pintura" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const containerWidth = canvas.parentElement?.clientWidth || 700;
        const targetWidth = Math.max(containerWidth - 16, 320);
        const targetHeight = 400;

        // Save existing canvas image if resizing
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx && canvas.width > 0 && canvas.height > 0) {
          tempCtx.drawImage(canvas, 0, 0);
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Fill background
        ctx.fillStyle = isDark ? "#0f172a" : "#ffffff";
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // Restore image if previous canvas had contents
        if (tempCanvas.width > 0 && tempCanvas.height > 0) {
          ctx.drawImage(tempCanvas, 0, 0, targetWidth, targetHeight);
        }
      }
    }
  }, [activeToy, isDark]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;

    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    return { x, y };
  };

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setCanvasHistory(prev => [...prev.slice(-10), imageData]);
  };

  const handleUndoPaint = () => {
    if (canvasHistory.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const previousState = canvasHistory[canvasHistory.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setCanvasHistory(prev => prev.slice(0, -1));
    playPopSound(0.8);
  };

  const handleClearPaint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    saveCanvasState();
    ctx.fillStyle = isDark ? "#0f172a" : "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    playPopSound(0.6);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    saveCanvasState();

    const { x, y } = getCanvasCoords(e);

    if (activeTool === "stamp") {
      ctx.font = `${brushSize * 4}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(selectedStamp, x, y);
      playPopSound(1.2);
      return;
    }

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = activeTool === "eraser" ? (isDark ? "#0f172a" : "#ffffff") : brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(x + 0.1, y + 0.1);
    ctx.stroke();
  };

  const drawMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool === "stamp") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.closePath();
    }
  };

  const handleDownloadPaint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `Pintura-Sensorial-NeuroConecta-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    playWinSound();
  };

  // --- 4. QUEBRA-CABEÇA DE IMAGEM / PUZZLE ---
  const PUZZLE_PIECES_COUNT = 9;
  const [puzzleTiles, setPuzzleTiles] = useState<number[]>([4, 1, 7, 0, 8, 2, 5, 3, 6]);
  const [selectedPieceIdx, setSelectedPieceIdx] = useState<number | null>(null);
  const [puzzleCompleted, setPuzzleCompleted] = useState(false);

  const shuffleImagePuzzle = () => {
    const shuffled = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5);
    setPuzzleTiles(shuffled);
    setSelectedPieceIdx(null);
    setPuzzleCompleted(false);
    playPopSound(1.0);
  };

  const handleTileClick = (index: number) => {
    if (selectedPieceIdx === null) {
      setSelectedPieceIdx(index);
      playPopSound(1.1);
    } else {
      // Swap tiles
      const updated = [...puzzleTiles];
      const temp = updated[selectedPieceIdx];
      updated[selectedPieceIdx] = updated[index];
      updated[index] = temp;

      setPuzzleTiles(updated);
      setSelectedPieceIdx(null);
      playPopSound(1.3);

      // Check win
      if (updated.every((val, i) => val === i)) {
        setPuzzleCompleted(true);
        playWinSound();
      }
    }
  };

  // --- 5. JOGO DA MEMÓRIA STATE ---
  const MEMORY_CARDS_DATA = [
    { id: "c1", label: "Abafador", icon: Headphones, color: "bg-teal-500 text-white" },
    { id: "c2", label: "Rotina", icon: CalendarCheck, color: "bg-emerald-500 text-white" },
    { id: "c3", label: "Stimming", icon: Sparkles, color: "bg-amber-500 text-white" },
    { id: "c4", label: "Hiperfoco", icon: Zap, color: "bg-cyan-500 text-white" },
    { id: "c5", label: "Calma", icon: Feather, color: "bg-indigo-500 text-white" },
    { id: "c6", label: "Acolhimento", icon: Heart, color: "bg-rose-500 text-white" },
  ];

  const generateMemoryDeck = () => {
    const deck = [...MEMORY_CARDS_DATA, ...MEMORY_CARDS_DATA].map((card, idx) => ({
      ...card,
      uniqueId: `${card.id}-${idx}-${Math.random()}`,
      isFlipped: false,
      isMatched: false,
    }));
    return deck.sort(() => Math.random() - 0.5);
  };

  const [memoryDeck, setMemoryDeck] = useState(generateMemoryDeck);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryCompleted, setMemoryCompleted] = useState(false);

  const handleFlipCard = (index: number) => {
    if (selectedCards.length === 2 || memoryDeck[index].isFlipped || memoryDeck[index].isMatched) return;

    playPopSound(1.1);

    const updatedDeck = [...memoryDeck];
    updatedDeck[index].isFlipped = true;
    setMemoryDeck(updatedDeck);

    const nextSelected = [...selectedCards, index];
    setSelectedCards(nextSelected);

    if (nextSelected.length === 2) {
      setMemoryMoves((prev) => prev + 1);
      const [firstIdx, secondIdx] = nextSelected;

      if (updatedDeck[firstIdx].id === updatedDeck[secondIdx].id) {
        setTimeout(() => {
          updatedDeck[firstIdx].isMatched = true;
          updatedDeck[secondIdx].isMatched = true;
          setMemoryDeck([...updatedDeck]);
          setSelectedCards([]);
          playPopSound(1.6);

          if (updatedDeck.every((c) => c.isMatched)) {
            setMemoryCompleted(true);
            playWinSound();
          }
        }, 500);
      } else {
        setTimeout(() => {
          updatedDeck[firstIdx].isFlipped = false;
          updatedDeck[secondIdx].isFlipped = false;
          setMemoryDeck([...updatedDeck]);
          setSelectedCards([]);
        }, 1100);
      }
    }
  };

  const handleResetMemory = () => {
    setMemoryDeck(generateMemoryDeck());
    setSelectedCards([]);
    setMemoryMoves(0);
    setMemoryCompleted(false);
  };

  // --- 6. RESPIRAÇÃO BUBBLE BLOWER STATE ---
  const [bubbleSize, setBubbleSize] = useState(20);
  const [bubblesCreated, setBubblesCreated] = useState<
    { id: string; size: number; x: number; y: number; color: string }[]
  >([]);

  const handleInflateBubble = () => {
    if (bubbleSize < 120) {
      setBubbleSize((prev) => prev + 12);
      playPopSound(0.5 + bubbleSize / 100);
    } else {
      const newBubble = {
        id: `b-${Date.now()}`,
        size: bubbleSize,
        x: Math.random() * 70 + 15,
        y: Math.random() * 50 + 20,
        color: [
          "from-teal-400 to-cyan-300",
          "from-pink-400 to-purple-300",
          "from-emerald-400 to-teal-200",
          "from-amber-300 to-orange-400",
        ][Math.floor(Math.random() * 4)],
      };
      setBubblesCreated((prev) => [newBubble, ...prev.slice(0, 15)]);
      setBubbleSize(20);
      playPopSound(1.8);
    }
  };

  // --- 7. CLASSIFICADOR DE CORES & FORMAS STATE ---
  const SORTING_ITEMS = [
    { id: "item-1", color: "bg-teal-500", label: "Tranquilidade", category: "calma" },
    { id: "item-2", color: "bg-cyan-500", label: "Foco", category: "foco" },
    { id: "item-3", color: "bg-rose-500", label: "Carinho", category: "afeto" },
    { id: "item-4", color: "bg-amber-500", label: "Alegria", category: "alegria" },
    { id: "item-5", color: "bg-teal-600", label: "Pausa", category: "calma" },
    { id: "item-6", color: "bg-cyan-600", label: "Estudo", category: "foco" },
  ];

  const [sortedBuckets, setSortedBuckets] = useState<{ [key: string]: string[] }>({
    calma: [],
    foco: [],
    afeto: [],
    alegria: [],
  });

  const handleSortItem = (itemId: string, targetCategory: string) => {
    setSortedBuckets((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((cat) => {
        updated[cat] = updated[cat].filter((id) => id !== itemId);
      });
      updated[targetCategory] = [...updated[targetCategory], itemId];
      return updated;
    });
    playPopSound(1.3);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8 animate-fadeIn">
      
      {/* Banner Superior */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm transition ${
        isDark 
          ? "bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-indigo-800/60 text-slate-100" 
          : "bg-gradient-to-r from-cyan-50/90 via-teal-50/80 to-emerald-50/90 border-cyan-200/80 text-slate-800"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
              <Gamepad2 className="w-4 h-4 text-cyan-500" />
              <span>Espaço Lúdico &amp; Autorregulação</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Jogos &amp; Toys Sensoriais Neuroafirmativos
            </h1>
            <p className="text-sm sm:text-base opacity-90 leading-relaxed font-sans">
              Brinquedos e jogos sem pressão de tempo, telas estressantes ou pontuações punitivas. O stimming (autorregulação sensorial e motora) é uma forma legítima de regulação e processamento: aqui você encontra um espaço livre, seguro e acolhedor.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-3 rounded-2xl border transition flex items-center gap-2 text-xs font-bold ${
                soundEnabled
                  ? "bg-teal-600 text-white border-teal-500"
                  : isDark
                  ? "bg-slate-800 text-slate-400 border-slate-700"
                  : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? "Sons Ativos" : "Sons Mutos"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Selector for Toys */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: "popit", label: "Pop-It Infinito", icon: Grid, color: "text-amber-500" },
          { id: "numeros", label: "Toys com Números", icon: Hash, color: "text-teal-400" },
          { id: "superdotacao", label: "Lógica & Superdotação (AH/SD)", icon: Brain, color: "text-purple-400" },
          { id: "pintura", label: "Painel de Pintura", icon: Palette, color: "text-rose-400" },
          { id: "puzzle", label: "Quebra-Cabeça", icon: Puzzle, color: "text-indigo-400" },
          { id: "memoria", label: "Jogo da Memória", icon: Shapes, color: "text-cyan-400" },
          { id: "bolhas", label: "Bolhas de Sabão", icon: Sparkles, color: "text-emerald-400" },
          { id: "classificador", label: "Organizador", icon: CircleDot, color: "text-amber-400" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveToy(tab.id as ToyMode)}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition ${
              activeToy === tab.id
                ? "bg-teal-600 text-white shadow-md"
                : isDark
                ? "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            {React.createElement(tab.icon, { className: `w-4 h-4 ${activeToy === tab.id ? "text-white" : tab.color}` })}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* --- TOY 1: POP-IT INFINITO --- */}
      {activeToy === "popit" && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-sm ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Grid className="w-5 h-5 text-amber-500" />
                <span>Pop-It Sensorial Interativo</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pressione as bolhas para estourar. Total de estalos na sessão: <strong className="text-teal-500">{popCount}</strong>
              </p>
            </div>

            <button
              onClick={handleResetPopIt}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition self-start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Desfazer / Reiniciar</span>
            </button>
          </div>

          {/* Technical Explanation Callout */}
          <div className="p-3.5 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-start gap-3 text-xs text-teal-800 dark:text-teal-200">
            <HelpCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Por que a matriz padrão tem 36 bolhas (6x6)?</p>
              <p className="text-[11px] leading-relaxed opacity-90">
                A contagem até 36 deriva da escala $6 \times 6$ tátil. Em ergonomia cognitiva, $36$ elementos formam a densidade de toque ideal para telas sensíveis, permitindo subitização visual (reconhecimento rápido de quantidade sem contar um a um) e descompressão rápida de estresse sem exigir rolagem de tela. Para desafios mais complexos voltados a adultos e Superdotação/Altas Habilidades (AH/SD), acesse a aba <strong>Lógica &amp; Superdotação</strong> ou escolha o modo 1 a 100/Primos nos Toys com Números.
              </p>
            </div>
          </div>

          {/* Pop-It Tactile Grid */}
          <div className="max-w-md mx-auto p-6 bg-gradient-to-br from-purple-500 via-pink-500 to-amber-400 rounded-3xl shadow-xl grid grid-cols-6 gap-3 sm:gap-4">
            {popItGrid.map((isPopped, idx) => (
              <button
                key={idx}
                onClick={() => handlePopBubble(idx)}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-inner flex items-center justify-center transition-all transform active:scale-90 ${
                  isPopped
                    ? "bg-slate-900/60 shadow-black/50 inset-2 scale-95"
                    : "bg-white/80 hover:bg-white shadow-md scale-100 hover:scale-105"
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${isPopped ? "bg-purple-300/30" : "bg-white/50"}`} />
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-slate-400">
            Dica: O movimento repetitivo de estalar ajuda na descompressão do estresse no TDAH e Autismo.
          </p>
        </div>
      )}

      {/* --- TOY 2: TOYS COM NÚMEROS --- */}
      {activeToy === "numeros" && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-sm ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2 text-teal-400">
                <Hash className="w-5 h-5 text-teal-400" />
                <span>Brinquedos &amp; Jogos com Números</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atividades numéricas com modos adaptados para diferentes perfis e níveis de complexidade.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setNumberMode("sequencia")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  numberMode === "sequencia" ? "bg-teal-600 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                Sequência Numérica
              </button>
              <button
                onClick={() => setNumberMode("15puzzle")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  numberMode === "15puzzle" ? "bg-teal-600 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                Sliding 15-Puzzle
              </button>
            </div>
          </div>

          {/* Sub-mode 1: Sequência Numérica */}
          {numberMode === "sequencia" && (
            <div className="space-y-5">
              
              {/* Type Selector for Sequence */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Selecione o Padrão:</span>
                {[
                  { id: "1a36", label: "1 a 36 (Padrão 6x6)" },
                  { id: "1a100", label: "1 a 100 (Extenso 10x10)" },
                  { id: "primos", label: "Números Primos" },
                  { id: "fibonacci", label: "Sequência de Fibonacci" },
                  { id: "potencias", label: "Potências de 2" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSeqType(s.id as any);
                      handleResetNumbers();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                      seqType === s.id
                        ? "bg-teal-600 text-white shadow"
                        : isDark
                        ? "bg-slate-950 text-slate-300 border border-slate-800"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between bg-teal-950/60 border border-teal-800 p-3.5 rounded-2xl">
                <div className="text-xs text-slate-200 space-y-0.5">
                  <p>Próximo esperado: <strong className="text-teal-300 text-sm">
                    {nextExpectedIndex < activeSeqList.length
                      ? activeSeqList[nextExpectedIndex]
                      : "Concluído!"}
                  </strong></p>
                  <p className="text-slate-400 text-[11px]">Progresso na sequência: {nextExpectedIndex} / {activeSeqList.length}</p>
                </div>
                <button
                  onClick={handleResetNumbers}
                  className="px-3 py-1.5 bg-teal-900 hover:bg-teal-800 text-teal-200 text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
                </button>
              </div>

              <div className={`grid gap-2 sm:gap-2.5 max-w-2xl mx-auto p-4 bg-slate-950 rounded-3xl border border-slate-800 ${
                activeSeqList.length > 50 ? "grid-cols-10" : "grid-cols-6"
              }`}>
                {activeSeqList.map((num, idx) => {
                  const isPopped = numberPops[idx];
                  const isNext = idx === nextExpectedIndex;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleNumberPop(num, idx)}
                      className={`h-9 sm:h-11 rounded-xl font-bold text-xs flex items-center justify-center transition transform active:scale-90 ${
                        isPopped
                          ? "bg-teal-950 border border-teal-700 text-teal-400 scale-95 shadow-inner"
                          : isNext
                          ? "bg-teal-500 text-white animate-bounce shadow-lg ring-2 ring-teal-300"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sub-mode 2: 15-Puzzle */}
          {numberMode === "15puzzle" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3.5 rounded-2xl">
                <div className="text-xs text-slate-300">
                  <p>Ordene os números de 1 a 15 deslizando os blocos no espaço vazio.</p>
                  <p className="text-teal-400 font-bold text-[11px]">Movimentos realizados: {puzzleMoves}</p>
                </div>
                <button
                  onClick={shuffle15Puzzle}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Embaralhar
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2.5 max-w-xs mx-auto p-4 bg-slate-950 rounded-3xl border border-slate-800 shadow-xl">
                {puzzleBoard.map((val, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSlideTile(idx)}
                    disabled={val === 0}
                    className={`h-14 sm:h-16 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center transition ${
                      val === 0
                        ? "bg-slate-900 border border-dashed border-slate-800 opacity-20"
                        : "bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-md hover:scale-105 active:scale-95"
                    }`}
                  >
                    {val !== 0 ? val : ""}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TOY 3: LÓGICA & SUPERDOTAÇÃO (AH/SD & ADULTOS) --- */}
      {activeToy === "superdotacao" && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-sm ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>Desafios Cognitivos Avançados &amp; AH/SD</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                Módulo para Adultos &amp; Superdotação / Altas Habilidades
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atividades interativas de lógica dedutiva, padrões espaciais e sequências reflexivas para exploração no seu ritmo e momentos de foco.
              </p>
            </div>

            {/* Mode selector */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {[
                { id: "raven", label: "Matrizes de Raven", icon: Cpu },
                { id: "hanoi", label: "Torre de Hanói", icon: Layers },
                { id: "nback", label: "Dual N-Back", icon: Activity },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSuperMode(m.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    superMode === m.id
                      ? "bg-purple-600 text-white shadow-md"
                      : isDark
                      ? "bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  <m.icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SUB-MODULE 1: RAVEN LOGICAL MATRICES */}
          {superMode === "raven" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-purple-950/40 border border-purple-800/60 p-4 rounded-2xl">
                <div>
                  <h3 className="font-bold text-sm text-purple-200">{RAVEN_QUESTIONS[ravenIndex].title}</h3>
                  <p className="text-xs text-slate-300 mt-0.5">{RAVEN_QUESTIONS[ravenIndex].description}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-purple-400">Pontuação:</span>
                  <div className="text-lg font-black text-purple-300">{ravenScore} / {RAVEN_QUESTIONS.length}</div>
                </div>
              </div>

              {/* Matrix Display Grid */}
              <div className="max-w-md mx-auto p-4 bg-slate-950 rounded-3xl border border-slate-800 grid grid-cols-3 gap-3">
                {RAVEN_QUESTIONS[ravenIndex].grid.map((row, rIdx) =>
                  row.map((cell, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`h-20 rounded-2xl border flex items-center justify-center p-2 text-center text-xs font-bold ${
                        cell.includes("[ ? ]")
                          ? "bg-purple-950/80 border-purple-500 text-purple-300 animate-pulse text-sm"
                          : "bg-slate-900 border-slate-800 text-slate-200"
                      }`}
                    >
                      {cell}
                    </div>
                  ))
                )}
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400">Selecione a resposta correta:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {RAVEN_QUESTIONS[ravenIndex].options.map((opt, optIdx) => {
                    const isSelected = selectedRavenOpt === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleAnswerRaven(optIdx)}
                        className={`p-3.5 rounded-2xl border text-left text-xs font-semibold transition ${
                          isSelected
                            ? opt.correct
                              ? "bg-emerald-950 border-emerald-500 text-emerald-200"
                              : "bg-rose-950 border-rose-500 text-rose-200"
                            : isDark
                            ? "bg-slate-950 border-slate-800 hover:border-purple-600 text-slate-200"
                            : "bg-slate-50 border-slate-200 hover:border-purple-400 text-slate-800"
                        }`}
                      >
                        <div>{opt.label}</div>
                        {isSelected && (
                          <div className="mt-2 text-[11px] opacity-90 border-t border-white/20 pt-1.5 italic font-sans">
                            {opt.explanation}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  disabled={ravenIndex === 0}
                  onClick={() => { setRavenIndex(prev => prev - 1); setSelectedRavenOpt(null); }}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold disabled:opacity-30"
                >
                  Anterior
                </button>

                <button
                  disabled={ravenIndex === RAVEN_QUESTIONS.length - 1}
                  onClick={() => { setRavenIndex(prev => prev + 1); setSelectedRavenOpt(null); }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold disabled:opacity-30"
                >
                  Próximo Desafio
                </button>
              </div>
            </div>
          )}

          {/* SUB-MODULE 2: TOWERS OF HANOI */}
          {superMode === "hanoi" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-purple-300">Otimização Algorítmica: Torre de Hanói</h3>
                  <p className="text-xs text-slate-400">
                    Mova a torre inteira da haste 1 para a haste 3. Mínimo teórico de movimentos: <strong className="text-purple-400">{Math.pow(2, hanoiDisksCount) - 1}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <span>Discos:</span>
                    {[3, 4, 5, 6].map((cnt) => (
                      <button
                        key={cnt}
                        onClick={() => resetHanoi(cnt)}
                        className={`w-7 h-7 rounded-lg font-bold text-xs ${
                          hanoiDisksCount === cnt ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => resetHanoi()}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
                  </button>
                </div>
              </div>

              {/* Hanoi Board View */}
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto p-6 bg-slate-950 rounded-3xl border border-slate-800 items-end min-h-[220px]">
                {hanoiTowers.map((peg, pegIdx) => {
                  const isSelected = hanoiSelectedTower === pegIdx;
                  return (
                    <div
                      key={pegIdx}
                      onClick={() => handleHanoiClick(pegIdx)}
                      className={`flex flex-col-reverse items-center gap-1.5 p-3 rounded-2xl border-2 cursor-pointer transition min-h-[180px] relative ${
                        isSelected
                          ? "border-purple-500 bg-purple-950/30 shadow-lg shadow-purple-500/20"
                          : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                      }`}
                    >
                      {/* Pole line */}
                      <div className="absolute inset-y-2 left-1/2 w-1.5 bg-slate-700 -translate-x-1/2 rounded-full -z-0" />

                      {peg.map((diskVal) => {
                        const widthPercent = 30 + diskVal * 14;
                        return (
                          <div
                            key={diskVal}
                            style={{ width: `${widthPercent}%` }}
                            className="h-7 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black text-xs flex items-center justify-center shadow z-10"
                          >
                            {diskVal}
                          </div>
                        );
                      })}

                      <span className="text-[10px] font-bold uppercase text-slate-400 absolute bottom-1">
                        Haste {pegIdx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="text-center text-xs text-slate-400">
                Movimentos executados: <strong className="text-purple-400 text-sm">{hanoiMoves}</strong> | Regra: Um disco maior nunca pode ser colocado sobre um menor.
              </div>
            </div>
          )}

          {/* SUB-MODULE 3: DUAL N-BACK */}
          {superMode === "nback" && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-purple-300">Treinador de Memória de Trabalho Dual N-Back</h3>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-400">Nível (N-passos):</span>
                    {[1, 2, 3].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setNBackLevel(lvl as any)}
                        className={`w-6 h-6 rounded-md font-bold text-xs ${
                          nBackLevel === lvl ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        N={lvl}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  O Dual N-Back é um exercício interativo de memória de trabalho e alternância de foco espacial e auditivo, sem pressão de tempo ou cobrança.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                
                {/* 3x3 Spatial Grid */}
                <div className="grid grid-cols-3 gap-2.5 w-60 h-60 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  {NBACK_POSITIONS.map((pos) => {
                    const currentStep = nBackHistory[nBackHistory.length - 1];
                    const isLit = currentStep && currentStep.pos === pos;
                    return (
                      <div
                        key={pos}
                        className={`rounded-xl border transition flex items-center justify-center font-bold text-sm ${
                          isLit
                            ? "bg-purple-500 border-purple-300 text-white shadow-lg shadow-purple-500/50 scale-105"
                            : "bg-slate-900 border-slate-800 text-slate-700"
                        }`}
                      >
                        {isLit ? currentStep.sound : ""}
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4 flex-1 text-center sm:text-left">
                  <button
                    onClick={handleStartNBack}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
                  >
                    {nBackActive ? "Avançar Próximo Estímulo" : "Iniciar Sessão Dual N-Back"}
                  </button>

                  {nBackActive && (
                    <div className="space-y-2">
                      <button
                        onClick={handleNBackCheckPos}
                        className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl transition"
                      >
                        Match Posição Igual a N={nBackLevel} Passos Atrás!
                      </button>

                      {nBackFeedback && (
                        <p className="text-xs font-semibold text-purple-300">{nBackFeedback}</p>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-slate-400">
                    Pontuação atual: <strong className="text-purple-400">{nBackScore} pts</strong>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* --- TOY 4: PAINEL DE PINTURA SENSORIAL --- */}
      {activeToy === "pintura" && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-5 shadow-sm ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2 text-rose-400">
                <Palette className="w-5 h-5 text-rose-400" />
                <span>Painel de Pintura Sensorial</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Desenhe livremente com paleta de cores calmas, carimbos expressivos e sem regras.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleUndoPaint}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1 transition ${
                  isDark
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
                }`}
                title="Desfazer traço"
              >
                <Undo2 className="w-3.5 h-3.5" /> Desfazer
              </button>
              <button
                onClick={handleClearPaint}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1 transition ${
                  isDark
                    ? "bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800"
                    : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                }`}
                title="Limpar tela"
              >
                <Trash2 className="w-3.5 h-3.5" /> Limpar
              </button>
              <button
                onClick={handleDownloadPaint}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow"
              >
                <Download className="w-3.5 h-3.5" /> Baixar PNG
              </button>
            </div>
          </div>

          {/* Palette Controls */}
          <div className={`flex flex-wrap items-center justify-between gap-4 p-3 rounded-2xl border ${
            isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"
          }`}>
            {/* Tool Selection */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTool("brush")}
                className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 ${
                  activeTool === "brush"
                    ? "bg-teal-600 text-white shadow"
                    : isDark
                    ? "bg-slate-900 text-slate-300"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                <Brush className="w-4 h-4" /> Pincel
              </button>
              <button
                onClick={() => setActiveTool("eraser")}
                className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 ${
                  activeTool === "eraser"
                    ? "bg-teal-600 text-white shadow"
                    : isDark
                    ? "bg-slate-900 text-slate-300"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                <Eraser className="w-4 h-4" /> Borracha
              </button>
              <button
                onClick={() => setActiveTool("stamp")}
                className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 ${
                  activeTool === "stamp"
                    ? "bg-teal-600 text-white shadow"
                    : isDark
                    ? "bg-slate-900 text-slate-300"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                <Sparkles className="w-4 h-4" /> Carimbo
              </button>
            </div>

            {/* Colors */}
            {activeTool !== "eraser" && activeTool !== "stamp" && (
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {PALETTE_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => { setBrushColor(c.hex); setActiveTool("brush"); }}
                    style={{ backgroundColor: c.hex }}
                    className={`w-7 h-7 rounded-full border-2 transition ${
                      brushColor === c.hex ? "border-teal-400 scale-110 shadow" : "border-slate-400 dark:border-slate-800"
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            )}

            {/* Stamps */}
            {activeTool === "stamp" && (
              <div className="flex items-center gap-1 overflow-x-auto">
                {STAMP_OPTIONS.map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStamp(st)}
                    className={`px-2.5 py-1 rounded-xl text-sm transition ${
                      selectedStamp === st
                        ? "bg-teal-600 text-white border border-teal-500 scale-110 shadow"
                        : isDark
                        ? "bg-slate-900 text-slate-200"
                        : "bg-white text-slate-800 border border-slate-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}

            {/* Brush Size Slider */}
            <div className={`flex items-center gap-2 text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              <span>Espessura:</span>
              <input
                type="range"
                min="3"
                max="36"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-20 accent-teal-500"
              />
              <span className="font-bold text-teal-600 dark:text-teal-400">{brushSize}px</span>
            </div>
          </div>

          {/* HTML5 Painting Canvas */}
          <div className={`rounded-3xl border overflow-hidden shadow-xl flex items-center justify-center p-2 ${
            isDark ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-slate-100"
          }`}>
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={drawMove}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={drawMove}
              onTouchEnd={stopDrawing}
              className="cursor-crosshair rounded-2xl touch-none w-full max-w-full"
            />
          </div>
        </div>
      )}

      {/* --- TOY 4: QUEBRA-CABEÇA / PUZZLE --- */}
      {activeToy === "puzzle" && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-sm ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2 text-indigo-400">
                <Puzzle className="w-5 h-5 text-indigo-400" />
                <span>Quebra-Cabeça da Neurodivergência</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Clique em uma peça para selecioná-la e depois em outra para trocar as posições até montar o símbolo oficial do NeuroConecta.
              </p>
            </div>

            <button
              onClick={shuffleImagePuzzle}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition self-start"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Embaralhar Peças
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Reference Thumbnail */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-center">
              <p className="text-xs font-semibold text-slate-300">Imagem de Referência:</p>
              <div className="p-2 bg-white rounded-xl border border-teal-200 inline-block mx-auto">
                <img src={neuroconectaLogo} alt="NeuroConecta" className="w-36 h-36 object-contain aspect-square mx-auto" />
              </div>
              <p className="text-[11px] text-teal-400">Troque as peças do painel ao lado para recriar este símbolo.</p>
            </div>

            {/* Interactive 3x3 Tile Grid */}
            <div className="md:col-span-2">
              <div className="grid grid-cols-3 gap-2.5 max-w-sm mx-auto p-3 bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl">
                {puzzleTiles.map((pieceNum, gridIdx) => {
                  const isSelected = selectedPieceIdx === gridIdx;
                  const isCorrect = pieceNum === gridIdx;

                  return (
                    <button
                      key={gridIdx}
                      onClick={() => handleTileClick(gridIdx)}
                      className={`h-24 sm:h-28 rounded-2xl border-2 flex flex-col items-center justify-center p-2 font-bold text-xs transition transform ${
                        isSelected
                          ? "border-amber-400 bg-amber-950/80 scale-105 shadow-xl ring-2 ring-amber-400"
                          : isCorrect
                          ? "border-emerald-600 bg-emerald-950/40 text-emerald-300"
                          : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 via-purple-500 to-rose-500 flex items-center justify-center text-white font-extrabold text-sm mb-1 shadow">
                        {pieceNum + 1}
                      </div>
                      <span className="text-[10px] text-slate-400">Bloco #{pieceNum + 1}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {puzzleCompleted && (
            <div className="p-4 bg-emerald-950/80 border border-emerald-800 rounded-2xl text-center space-y-2 text-emerald-200 animate-fadeIn">
              <Trophy className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="font-bold text-base">Parabéns! Quebra-Cabeça Montado com Sucesso!</h3>
              <p className="text-xs">Você exercitou sua visão espacial e raciocínio lógico de forma acolhedora.</p>
            </div>
          )}
        </div>
      )}

      {/* --- TOY 5: JOGO DA MEMÓRIA --- */}
      {activeToy === "memoria" && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-sm ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Shapes className="w-5 h-5 text-teal-500" />
                <span>Jogo da Memória Neuroafirmativo</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Encontre os pares com calma. Tentativas suaves: <strong className="text-teal-500">{memoryMoves}</strong>
              </p>
            </div>

            <button
              onClick={handleResetMemory}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition self-start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Embaralhar Novamente</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
            {memoryDeck.map((card, idx) => {
              const Icon = card.icon;
              const isOpen = card.isFlipped || card.isMatched;

              return (
                <button
                  key={card.uniqueId}
                  onClick={() => handleFlipCard(idx)}
                  className={`h-24 sm:h-28 rounded-2xl p-2 flex flex-col items-center justify-center gap-1 transition-all duration-300 transform ${
                    isOpen
                      ? `${card.color} shadow-lg scale-100`
                      : isDark
                      ? "bg-slate-950 border border-slate-800 hover:border-teal-500 text-slate-500 hover:scale-105"
                      : "bg-slate-100 border border-slate-200 hover:border-teal-400 text-slate-400 hover:scale-105"
                  }`}
                >
                  {isOpen ? (
                    <>
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
                      <span className="text-xs font-bold">{card.label}</span>
                    </>
                  ) : (
                    <Sparkles className="w-6 h-6 opacity-40" />
                  )}
                </button>
              );
            })}
          </div>

          {memoryCompleted && (
            <div className="p-4 bg-emerald-950/80 border border-emerald-800 rounded-2xl text-center space-y-2 text-emerald-200 animate-fadeIn">
              <Award className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="font-bold text-base">Parabéns! Você completou todos os pares!</h3>
              <p className="text-xs">Você exercitou sua memória em um ambiente tranquilo e seguro.</p>
            </div>
          )}
        </div>
      )}

      {/* --- TOY 6: BOLHAS DE SABÃO RESPIRATÓRIAS --- */}
      {activeToy === "bolhas" && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-sm relative overflow-hidden ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="space-y-1">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-500" />
              <span>Soprador de Bolhas de Sabão</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clique e segure para inflar a bolha enquanto inspira devagar. Solte o clique quando a bolha explodir ou flutuar suavemente!
            </p>
          </div>

          <div className="h-64 rounded-3xl bg-gradient-to-b from-slate-950 via-cyan-950 to-slate-950 relative flex items-center justify-center p-6 overflow-hidden">
            
            {/* Floating Generated Bubbles */}
            {bubblesCreated.map((b) => (
              <div
                key={b.id}
                style={{
                  width: `${b.size}px`,
                  height: `${b.size}px`,
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                }}
                className={`absolute rounded-full bg-gradient-to-br ${b.color} opacity-70 blur-[1px] border border-white/40 shadow-lg animate-pulse transition-all duration-1000`}
              />
            ))}

            {/* Active Inflating Bubble */}
            <button
              onClick={handleInflateBubble}
              style={{ width: `${bubbleSize * 2}px`, height: `${bubbleSize * 2}px` }}
              className="rounded-full bg-gradient-to-br from-cyan-300 via-teal-400 to-emerald-300 shadow-2xl shadow-cyan-500/50 border-2 border-white/80 flex items-center justify-center text-slate-900 font-extrabold text-xs transition-all duration-200 cursor-pointer active:scale-95"
            >
              <span>{bubbleSize > 100 ? "SOLTAR!" : "INFLAR"}</span>
            </button>
          </div>

          <p className="text-center text-xs text-slate-400">
            Bolhas soltas na sessão: <strong>{bubblesCreated.length}</strong>
          </p>
        </div>
      )}

      {/* --- TOY 7: ORGANIZADOR DE EMOÇÕES --- */}
      {activeToy === "classificador" && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-sm ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="space-y-1">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CircleDot className="w-5 h-5 text-indigo-500" />
              <span>Organizador de Emoções &amp; Pensamentos</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clique nas fichas de pensamentos abaixo para guardá-las na gaveta correspondente e organizar sua mente.
            </p>
          </div>

          {/* Buckets Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { id: "calma", title: "Tranquilidade", color: "border-teal-500 bg-teal-500/10" },
              { id: "foco", title: "Foco & Estudos", color: "border-cyan-500 bg-cyan-500/10" },
              { id: "afeto", title: "Acolhimento", color: "border-rose-500 bg-rose-500/10" },
              { id: "alegria", title: "Alegria & Lazer", color: "border-amber-500 bg-amber-500/10" },
            ].map((bucket) => (
              <div
                key={bucket.id}
                className={`p-4 rounded-2xl border-2 ${bucket.color} min-h-[120px] space-y-2`}
              >
                <h3 className="text-xs font-bold">{bucket.title}</h3>
                <div className="space-y-1">
                  {sortedBuckets[bucket.id]?.map((itemId) => {
                    const item = SORTING_ITEMS.find((i) => i.id === itemId);
                    return item ? (
                      <span
                        key={item.id}
                        className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold text-white ${item.color} mr-1 mb-1 shadow-sm`}
                      >
                        {item.label}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Unsorted Items Palette */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs font-semibold mb-3">Fichas disponíveis para classificar:</p>
            <div className="flex flex-wrap gap-2">
              {SORTING_ITEMS.map((item) => (
                <div key={item.id} className="inline-flex items-center gap-1">
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white ${item.color}`}>
                    {item.label}
                  </span>
                  <select
                    onChange={(e) => handleSortItem(item.id, e.target.value)}
                    className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1"
                  >
                    <option value="">Mover...</option>
                    <option value="calma">Tranquilidade</option>
                    <option value="foco">Foco</option>
                    <option value="afeto">Acolhimento</option>
                    <option value="alegria">Alegria</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
