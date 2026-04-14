export interface ImageFile {
  id: string;
  name: string;
  base64: string;
  label: string;
  isHero: boolean;
  inGallery: boolean;
}

export interface FormData {
  name: string;
  location: string;
  typology: string;
  area: string;
  parking: string;
  differentials: string;
  lpType: 'moradia' | 'investimento' | 'neutra';
  audience: 'moradia' | 'investidor' | 'misto';
  mainTrigger: 'preco' | 'localizacao' | 'vista' | 'condicao';
  aggressiveness: 'baixo' | 'medio' | 'alto';
  price: string;
  entry: string;
  installments: string;
  highlightConditionTop: boolean;
  conditionAsMainArg: boolean;
  strongPoints: string[];
  primaryColor: string;
  secondaryColor: string;
  style: 'clean' | 'sofisticado' | 'moderno';
  animations: boolean;
  arrows: boolean;
  hasVideo: boolean;
  videoUrl: string;
  videoType: 'drone' | 'institucional' | 'lifestyle';
  withPrice: boolean;
  withoutPrice: boolean;
  investorVersion: boolean;
  housingVersion: boolean;
  headlineVariation: boolean;
  whatsapp: string;
  pixelId: string;
  formEmail: string;
  images: ImageFile[];
  logoType: 'text' | 'image';
  logoBase64: string;
}

export interface GeneratedLP {
  id: string;
  name: string;
  type: string;
  variant: string;
  html: string;
  createdAt: string;
  formData?: FormData;
}
