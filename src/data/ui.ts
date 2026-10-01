// Micro-testi dell'interfaccia (etichette per lettori di schermo, messaggi): non fanno parte di translations.json.

interface UiStrings {
  skipToContent: string;
  mainNav: string;
  language: string;
  menu: string;
  home: string;
  themeToLight: string;
  themeToDark: string;
  prevImage: string;
  nextImage: string;
  goToImage: (n: number) => string;
  screenshotAlt: (title: string, i: number, n: number) => string;
  imageOf: (title: string, i: number, n: number) => string;
  close: string;
  enlarged: string;
  newTab: string;
  diagramLabel: string;
  diagramLoading: string;
  diagramFailed: string;
  heroPhotoAlt: string;
  paintingAlt: string;
  mountainAlt: string;
  notFoundTitle: string;
  notFoundText: string;
  notFoundBack: string;
}

export const ui: Record<"it" | "en", UiStrings> = {
  it: {
    skipToContent: "Vai al contenuto",
    mainNav: "Navigazione principale",
    language: "Lingua",
    menu: "Menu",
    home: "Vittoria Bassi, home",
    themeToLight: "Passa al tema chiaro",
    themeToDark: "Passa al tema scuro",
    prevImage: "Immagine precedente",
    nextImage: "Immagine successiva",
    goToImage: (n) => `Vai all'immagine ${n}`,
    screenshotAlt: (title, i, n) => `${title}, schermata ${i} di ${n}`,
    imageOf: (title, i, n) => `${title}, ${i} di ${n}`,
    close: "Chiudi",
    enlarged: "Immagine ingrandita",
    newTab: "(si apre in una nuova scheda)",
    diagramLabel: "Diagramma entità-relazione",
    diagramLoading: "Caricamento del diagramma…",
    diagramFailed: "Impossibile caricare il diagramma.",
    heroPhotoAlt: "Vittoria Bassi in piedi su una cresta di montagna a braccia aperte, con il cielo arancione all'orizzonte e il lago in fondo alla valle",
    paintingAlt: "Un quadro di Vittoria: montagne a fasce di colore sotto un sole rosso",
    mountainAlt: "Vittoria in equilibrio su una gamba sopra un lago alpino, tra rocce e neve",
    notFoundTitle: "Pagina non trovata",
    notFoundText: "L'indirizzo che hai aperto non esiste (più).",
    notFoundBack: "Torna alla home",
  },
  en: {
    skipToContent: "Skip to content",
    mainNav: "Main navigation",
    language: "Language",
    menu: "Menu",
    home: "Vittoria Bassi, home",
    themeToLight: "Switch to light theme",
    themeToDark: "Switch to dark theme",
    prevImage: "Previous image",
    nextImage: "Next image",
    goToImage: (n) => `Go to image ${n}`,
    screenshotAlt: (title, i, n) => `${title}, screenshot ${i} of ${n}`,
    imageOf: (title, i, n) => `${title}, ${i} of ${n}`,
    close: "Close",
    enlarged: "Enlarged image",
    newTab: "(opens in a new tab)",
    diagramLabel: "Entity-relationship diagram",
    diagramLoading: "Loading the diagram…",
    diagramFailed: "The diagram could not be loaded.",
    heroPhotoAlt: "Vittoria Bassi standing on a mountain ridge, arms open, an orange sky on the horizon and a lake in the valley below",
    paintingAlt: "A painting by Vittoria: mountains in bands of colour under a red sun",
    mountainAlt: "Vittoria balancing on one leg above an alpine lake, among rocks and snow",
    notFoundTitle: "Page not found",
    notFoundText: "The address you opened doesn't exist (anymore).",
    notFoundBack: "Back to home",
  },
};
