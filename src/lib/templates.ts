export type TemplateId = 'midnight-rose' | 'dreamy-blush' | 'teal-whisper' | 'golden-hour';

export type FontId = 'cormorant' | 'playfair' | 'great-vibes' | 'inter' | 'caveat';

export interface RomanticPrompt {
  id: string;
  title: string; // Ex: "Quando te vi pela primeira vez"
  content: string; // Ex: "Meu coração disparou..."
}

export interface LetterContent {
  id?: string;
  senderName: string;
  recipientName: string;
  question: string;
  // 1. Texto da Carta ANTES da pergunta
  letterText: string;
  accentNote?: string;
  // 2. Carrossel de momentos especiais editáveis
  prompts: RomanticPrompt[];
  // 3. Segredo da Raspadinha
  scratchSecret: string;
  // 4. NOVO: Texto da Carta APÓS o aceite ("SIM")
  postYesHeadline: string; // Ex: "Eu escolheria você de novo."
  postYesText: string; // Ex: "Você é incrível, e eu quero todos os meus dias e amanheceres ao seu lado..."
  postYesPromise: string; // Ex: "Sempre estarei aqui para te abraçar, te amar e ser o seu porto seguro."
  // Configurações visuais e mídia
  templateId: TemplateId;
  fontId: FontId;
  photoUrl?: string;
  spotifyUrl?: string;
  createdAt?: string;
  isPaid?: boolean;
}

export interface TemplateConfig {
  id: TemplateId;
  name: string;
  tagline: string;
  description: string;
  palette: {
    bg: string;
    cardBg: string;
    cardBorder: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    accentGlow: string;
    yesBtnBg: string;
    yesBtnText: string;
    noBtnBg: string;
    noBtnText: string;
    badgeBg: string;
  };
  particles: {
    types: ('heart' | 'star' | 'sparkle' | 'rose')[];
    colors: string[];
  };
}

export const TEMPLATES: Record<TemplateId, TemplateConfig> = {
  'midnight-rose': {
    id: 'midnight-rose',
    name: 'Rosa Meia-Noite',
    tagline: 'Elegante & Apaixonante',
    description: 'Fundo preto aveludado com detalhes em dourado champagne e rosas vermelhas intensas.',
    palette: {
      bg: 'linear-gradient(135deg, #090306 0%, #15060d 50%, #080205 100%)',
      cardBg: 'rgba(28, 8, 16, 0.75)',
      cardBorder: 'rgba(230, 185, 128, 0.35)',
      textPrimary: '#FFF5EB',
      textSecondary: '#E8C5C8',
      accent: '#E63956',
      accentGlow: 'rgba(230, 57, 86, 0.4)',
      yesBtnBg: 'linear-gradient(135deg, #E63956 0%, #B31333 100%)',
      yesBtnText: '#FFFFFF',
      noBtnBg: 'rgba(255, 255, 255, 0.08)',
      noBtnText: '#D1B4B8',
      badgeBg: 'rgba(230, 57, 86, 0.2)',
    },
    particles: {
      types: ['rose', 'heart', 'sparkle'],
      colors: ['#E63956', '#D98292', '#E6B980'],
    },
  },
  'dreamy-blush': {
    id: 'dreamy-blush',
    name: 'Sonho Rosa',
    tagline: 'Doce & Delicado',
    description: 'Tons de algodão doce, rosa pastel carinhoso e luzes suaves de romance juvenil.',
    palette: {
      bg: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4E9 50%, #FDF2F8 100%)',
      cardBg: 'rgba(255, 255, 255, 0.85)',
      cardBorder: 'rgba(244, 114, 182, 0.35)',
      textPrimary: '#4A1D2F',
      textSecondary: '#83475E',
      accent: '#EC4899',
      accentGlow: 'rgba(236, 72, 153, 0.35)',
      yesBtnBg: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)',
      yesBtnText: '#FFFFFF',
      noBtnBg: 'rgba(255, 255, 255, 0.7)',
      noBtnText: '#7C3A4B',
      badgeBg: 'rgba(244, 114, 182, 0.25)',
    },
    particles: {
      types: ['heart', 'sparkle'],
      colors: ['#F43F5E', '#FB7185', '#F472B6'],
    },
  },
  'teal-whisper': {
    id: 'teal-whisper',
    name: 'Sussurro Teal',
    tagline: 'Luxo Nobre & Íntimo',
    description: 'Teal profundo com toques de menta perolada, marfim antigo e moldura de alta joalheria.',
    palette: {
      bg: 'linear-gradient(135deg, #041819 0%, #0A2E2F 50%, #061F21 100%)',
      cardBg: 'rgba(11, 46, 47, 0.78)',
      cardBorder: 'rgba(198, 237, 224, 0.38)',
      textPrimary: '#FFF8F0',
      textSecondary: '#C6EDE0',
      accent: '#38B2AC',
      accentGlow: 'rgba(56, 178, 172, 0.45)',
      yesBtnBg: 'linear-gradient(135deg, #C6EDE0 0%, #81E6D9 100%)',
      yesBtnText: '#062828',
      noBtnBg: 'rgba(255, 255, 255, 0.08)',
      noBtnText: '#A7D4C8',
      badgeBg: 'rgba(56, 178, 172, 0.2)',
    },
    particles: {
      types: ['heart', 'star', 'sparkle'],
      colors: ['#C6EDE0', '#81E6D9', '#F2C6D1'],
    },
  },
  'golden-hour': {
    id: 'golden-hour',
    name: 'Hora Dourada',
    tagline: 'Pôr do Sol & Paixão',
    description: 'Cores quentes de entardecer dourado, âmbar radiante e luz cinematográfica de cinema.',
    palette: {
      bg: 'linear-gradient(135deg, #1C0A00 0%, #2E1505 50%, #150600 100%)',
      cardBg: 'rgba(46, 21, 5, 0.82)',
      cardBorder: 'rgba(245, 158, 11, 0.4)',
      textPrimary: '#FFFBEB',
      textSecondary: '#FDE68A',
      accent: '#F59E0B',
      accentGlow: 'rgba(245, 158, 11, 0.45)',
      yesBtnBg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      yesBtnText: '#2B1200',
      noBtnBg: 'rgba(255, 255, 255, 0.08)',
      noBtnText: '#D7B48C',
      badgeBg: 'rgba(245, 158, 11, 0.22)',
    },
    particles: {
      types: ['star', 'sparkle', 'heart'],
      colors: ['#F59E0B', '#FCD34D', '#F43F5E'],
    },
  },
};

export const FONTS: Record<FontId, { name: string; styleClass: string; family: string; sample: string }> = {
  cormorant: {
    name: 'Cormorant Garamond (Clássica & Poética)',
    styleClass: 'tracking-wide',
    family: "var(--font-cormorant), Georgia, serif",
    sample: 'Meu amor por você é infinito',
  },
  playfair: {
    name: 'Playfair Display (Luxuosa & Nobre)',
    styleClass: 'font-medium',
    family: "var(--font-playfair), Georgia, serif",
    sample: 'Para sempre a pessoa mais especial',
  },
  'great-vibes': {
    name: 'Cursiva Romântica (Manuscrita)',
    styleClass: 'text-[1.12em]',
    family: "var(--font-great-vibes), 'Brush Script MT', cursive",
    sample: 'Com todo meu coração e carinho',
  },
  inter: {
    name: 'Moderna & Minimalista',
    styleClass: 'font-light',
    family: "var(--font-inter), system-ui, sans-serif",
    sample: 'Cada segundo ao seu lado vale a pena',
  },
  caveat: {
    name: 'Bilhete Íntimo (Feito à Mão)',
    styleClass: 'text-[1.15em]',
    family: "var(--font-caveat), 'Comic Sans MS', cursive",
    sample: 'Você é o meu lugar favorito no mundo',
  },
};

export const DEFAULT_PROMPTS: RomanticPrompt[] = [
  {
    id: 'p1',
    title: 'Quando te vi pela primeira vez...',
    content: 'Parecia que o mundo inteiro tinha diminuído a velocidade só para eu prestar atenção em você.',
  },
  {
    id: 'p2',
    title: 'Eu amo isso em você...',
    content: 'A forma espontânea como você sorri com os olhos e ilumina qualquer lugar onde você entra.',
  },
  {
    id: 'p3',
    title: 'Quando eu te vejo eu sinto...',
    content: 'Uma paz tão profunda que parece que finalmente cheguei no lugar onde sempre deveria estar.',
  },
  {
    id: 'p4',
    title: 'Meus dias sem você...',
    content: 'Parecem perder a cor e o ritmo. Nada substitui a sua presença e o seu riso.',
  },
  {
    id: 'p5',
    title: 'O meu dia perfeito...',
    content: 'Seria qualquer dia simples com você: café quentinho, nossas conversas e você nos meus braços.',
  },
];

export const DEFAULT_LETTER: LetterContent = {
  senderName: 'Felipe',
  recipientName: 'Inaya',
  question: 'Quer ser minha para sempre?',
  letterText:
    'Dois meses atrás, eu me aproximei de alguém que transformou meus dias em algo muito mais leve, brilhante e acolhedor.\n\nVocê é incrível de formas que jamais caberiam em uma única página. Se eu pudesse escolher onde estar todos os dias, seria ouvindo sua risada, te abraçando bem forte e fazendo de cada pequeno instante um momento inesquecível ao seu lado.',
  accentNote: 'Então criei este pequeno cantinho na internet. Só para você. Só porque eu te amo.',
  prompts: DEFAULT_PROMPTS,
  scratchSecret: 'Você é o meu maior presente de todos os dias ♡',
  postYesHeadline: 'Eu escolheria você de novo.',
  postYesText:
    'Você é incrível de todas as formas possíveis, e eu quero cada um dos meus dias e amanheceres ao seu lado.',
  postYesPromise:
    'Sempre estarei aqui para te abraçar, te amar, te ouvir e ser o seu porto seguro para todo o sempre.',
  templateId: 'teal-whisper',
  fontId: 'cormorant',
  spotifyUrl: '',
};
