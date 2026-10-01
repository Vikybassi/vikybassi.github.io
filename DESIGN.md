# DESIGN.md · Portfolio di Vittoria Bassi

Il sistema di design del portfolio, scritto perché chiunque (una persona o un agente) possa aggiungere una pagina o una sezione senza tradirne il carattere. La struttura segue il formato DESIGN.md (tema, colori, tipografia, componenti, layout, profondità, cosa fare e cosa no, comportamento sui vari schermi, indicazioni per chi genera interfacce).

In una riga: **cartografia alpina contemporanea**. Precisa come una carta topografica, luminosa, personale. Una sviluppatrice cresciuta in Valtellina: il codice e i dati in primo piano, la montagna come radice, non come decorazione.

## 1. Atmosfera

- **Carta, non schermo scuro.** Fondo chiaro e freddo (grigio pietra), inchiostro quasi nero. Il tema scuro esiste ed è curato con la stessa attenzione, ma nessuna sezione cambia tema a metà pagina.
- **Un segno vero.** L'unico elemento grafico "decorativo" è un dato: dietro a tutte le pagine c'è il Monte Disgrazia (3678 m) disegnato a **linee di cresta**, profili sovrapposti calcolati dal modello del terreno Copernicus (`scripts/make-ridges.mjs`). Mentre scorri le creste vicine si muovono più di quelle lontane e **il sole tramonta** dietro la montagna: ora d'oro, tramonto, crepuscolo rosa, ora blu, notte con le stelle ai contatti. Niente motivi inventati, niente sfumature viola, niente bagliori.
- **Le immagini sono contenuto.** Foto in montagna, quadri, schermate reali delle app. Nessuna immagine di repertorio, nessuna schermata finta disegnata con i `div`.
- **Dichiarazione dei tre quadranti** (dal metodo taste-skill): varietà di impaginazione 7/10, movimento 5/10, densità 3/10.

## 2. Colori e ruoli

Un solo accento: il **bordeaux**, lo stesso del CV. I neutri sono freddi apposta (il beige + ottone + bordeaux è la combinazione più abusata dalle interfacce generate).

**Unica eccezione: i colori del cielo** nello sfondo del sito (oro, arancio, rosa, viola, blu notte, in `ridge-sky.tsx`). Raccontano la luce che cambia, non sono colori dell'interfaccia: nessun bottone, link o testo li usa. Hanno un tetto di intensità (28% nel tema chiaro, 35% nello scuro) perché il testo piccolo sopra resti oltre 4,5:1 in ogni fase del tramonto.

| Token | Chiaro | Scuro | Ruolo |
|---|---|---|---|
| `paper` | `#f3f3f0` | `#0f1211` | fondo della pagina |
| `raised` | `#fbfbf9` | `#161a18` | pannelli, cornici, celle |
| `ink` | `#141816` | `#eceeec` | testo e titoli |
| `ink-soft` | `#535a56` | `#a4aba7` | testo secondario, metadati |
| `line` | `#d6d9d5` | `#2a302d` | fili e bordi |
| `accent` | `#8e1b31` | `#f0919f` | link, segni attivi, curve accese |
| `bordeaux` | `#8e1b31` | `#a3263f` | riempimenti con testo bianco (bottone principale) |
| `teal`, `gold` | | | **solo** per distinguere categorie nei grafici (le comunità della rete), mai nell'interfaccia |

Tutti i testi passano il contrasto AA (4,5:1) in entrambi i temi; l'unica eccezione voluta sono i progetti non ancora in lettura nella pagina Progetti, sfumati mentre si scorre.

## 3. Tipografia

| Voce | Font | Uso |
|---|---|---|
| Titoli | **Bricolage Grotesque** 700–800, asse `opsz` | nome in hero (fino a 128 px), titoli di sezione, nomi dei progetti, elenchi di competenze |
| Testo | **Geist** 400–500 | paragrafi, navigazione, bottoni |
| Dati | **Geist Mono** 400–500 | date, tecnologie, indirizzi nelle cornici, didascalie tecniche |

- Titoli stretti: `tracking` da −0.02 a −0.05 em, interlinea 0.84–1.05. Sempre `text-wrap: balance`.
- Paragrafi entro ~62 caratteri, `text-wrap: pretty`. Numeri in colonna con `tabular-nums`.
- **Niente maiuscoletto decorativo**: il contesto sopra un titolo (tipo di progetto, anno) è testo piccolo in minuscolo, grigio.
- **Niente trattino lungo (—) come separatore.** Titolo e descrizione sono due righe (`title` + `subtitle`); nelle frasi si usano punto, virgola o due punti. Il trattino medio resta solo negli intervalli di date (2025 – luglio 2026).
- Le etichette dei bottoni stanno su una riga.

## 4. Componenti

- **Bottone principale** (`Btn`, `primary`): rettangolo bordeaux, raggio 6 px, testo bianco 15 px, freccia. Uno per sezione al massimo.
- **Link d'azione** (`Btn`, `link`): testo sottolineato solo nell'etichetta, freccia `→` (interno) o `↗` (esterno, con avviso "si apre in una nuova scheda" per i lettori di schermo). È la seconda scelta accanto al bottone principale, al posto del classico bottone "fantasma".
- **Cornice da browser**: bordo `line`, tre puntini, l'indirizzo vero del sito in mono. Per le schermate delle web app.
- **Cornice da telefono**: per il video di Fotogram.
- **Celle** (Cosa mi muove): raggio 6 px, ognuna con un trattamento diverso (pannello, bordeaux pieno, negativo, foto in alto).
- **Barra di navigazione**: una riga, 64 px, trasparente in cima e con fondo sfocato quando si scorre. Voce attiva con filo bordeaux sotto.
- **Etichette di dati** (`Chip`): rettangoli piccoli, mai pillole.

Un solo sistema di raggi: 6 px (`rounded-md`) per tutto ciò che è una superficie, 4 px per le etichette.

## 5. Impaginazione

- Contenitore di 1240 px, margini 20 px sul telefono e 32 px sopra i 640 px. Griglia a 12 colonne dove serve asimmetria.
- La hero sta tutta nella prima schermata: la parola "Portfolio" in bordeaux, il nome, una frase (meno di 20 parole), un bottone e un link. Niente altro.
- Le sezioni cambiano famiglia di impaginazione: hero divisa, progetto grande con finestra in prospettiva, due progetti affiancati di larghezza diversa (7 + 5 colonne), griglia a celle, colonne tipografiche, contatto a tutta riga.
- Molto spazio verticale tra le sezioni (96–144 px), separate da un filo `line`.

## 6. Profondità e movimento

- Ombre solo sotto le cornici delle schermate, tinte con l'inchiostro (mai nere pure), lunghe e morbide.
- Ogni animazione ha un motivo:
  - lo **scorrimento ha un po' di inerzia** (Lenis): la pagina e lo sfondo si muovono in modo continuo;
  - il **tramonto**: il sole scende dietro le creste e il cielo cambia colore con la posizione nella pagina;
  - la **parallasse delle creste**: le vicine scorrono più delle lontane, come i monti visti dal treno;
  - il mouse sposta appena il punto di vista e **accende di bordeaux la cresta** sotto il cursore;
  - la finestra di PiccoliPassi **si raddrizza** mentre scorri: il progetto principale si presenta;
  - le foto scorrono appena più piano della pagina (parallasse leggera);
  - gli elementi **entrano** con una breve salita quando arrivano sullo schermo.
- Si animano solo `transform`, `opacity` e il tratteggio delle linee. Con "riduci animazioni" tutto è fermo e visibile.

## 7. Cosa fare e cosa no

**Sì:** dati veri al posto delle decorazioni; foto e quadri di Vittoria; frasi brevi e concrete; un solo bordeaux; titoli grandi e stretti; link di testo per le azioni secondarie.

**No:** trattini lunghi; maiuscoletto con spaziatura larga come etichetta; pillole; sfumature viola o blu; bagliori, fasci di luce, testi che si scrivono da soli; fasce scorrevoli di parole chiave; tre riquadri uguali in fila; numeri di sezione decorativi ("01", "02"); scritte sopra le foto come etichette; frecce "scorri"; parole come "elevare", "rivoluzionare", "senza soluzione di continuità".

## 8. Schermi

- Sotto i 768 px tutto va in una colonna: la hero mette il testo prima della foto (il bottone resta visibile senza scorrere), le celle si impilano nell'ordine dei testi, i progetti affiancati uno sotto l'altro.
- Sotto i 1024 px la navigazione diventa un menu a tendina con voci grandi.
- Sul telefono le creste sono meno numerose e più basse; la cresta accesa esiste solo con il mouse.
- Nessun elemento esce dallo schermo a 360 px (controllato).

## 9. Indicazioni per chi genera interfacce

> Portfolio personale, cartografia alpina contemporanea. Fondo `#f3f3f0`, inchiostro `#141816`, unico accento bordeaux `#8e1b31`. Titoli in Bricolage Grotesque 800 molto stretti, testo in Geist, dati in Geist Mono. Raggio 6 px. Niente trattini lunghi, niente maiuscoletto, niente pillole, niente sfumature. Le immagini sono foto e schermate vere; l'unico segno grafico è il Monte Disgrazia vero a linee di cresta, col tramonto che segue lo scroll. Un solo bottone pieno per sezione, le altre azioni sono link sottolineati con freccia.
