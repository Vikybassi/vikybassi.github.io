# Portfolio di Vittoria Bassi · Next.js + Aceternity UI

Nuova versione del portfolio, bilingue (italiano e inglese) con tema chiaro/scuro. Il vecchio sito statico è in `~/Desktop/portfolio-site ` e resta invariato finché non pubblichi questo.

**Stack:** Next.js 16 (App Router, export statico) · React 19 · Tailwind CSS 4 · motion · componenti [Aceternity UI](https://ui.aceternity.com) · Mermaid (solo nella pagina dello schema ER).

## Comandi

```bash
npm install        # una volta sola
npm run dev        # sviluppo su http://localhost:3000
npm run build      # genera il sito statico nella cartella out/
npx serve out      # prova locale di ciò che pubblicherai
```

## Dove si modificano le cose

| Cosa | Dove |
|---|---|
| **Tutti i testi IT/EN** (progetti, esperienza, competenze, certificazioni, schema ER) | `src/data/translations.json` |
| Etichette per lettori di schermo e messaggi dell'interfaccia | `src/data/ui.ts` |
| Titoli e descrizioni per motori di ricerca e anteprime social | `src/lib/seo.ts` |
| Diagramma ER (Mermaid) | `src/data/er-diagram.ts` |
| CV, certificati, documenti | `public/cv`, `public/certificates`, `public/docs` |
| Immagini e video (vedi «Media» sotto) | `public/media` |
| Colori (chiaro e scuro) | `src/app/globals.css` (variabili `:root` e `.dark`) |
| Font | `src/lib/fonts.ts` |
| **Regole di design** (colori, font, componenti, cosa fare e cosa no) | `DESIGN.md` |
| Rilievo dello sfondo del sito | `src/data/ridges/disgrazia.json`, generato da `scripts/make-ridges.mjs` |
| Pagine | `src/app/(it)/…` (italiano) e `src/app/(en)/en/…` (inglese): sono sottili, mostrano le stesse viste con la lingua giusta |
| Componenti Aceternity (copiati nel progetto, modificabili) | `src/components/ui/` |

Per aggiornare i CV basta sostituire `public/cv/cv-it.pdf` e `public/cv/cv-en.pdf`.

## Lingue

Ogni lingua ha le sue pagine statiche: `/` e `/projects`… in italiano, `/en` e `/en/projects`… in inglese. Così `lang`, titoli, descrizioni, anteprime social e `hreflang` sono corretti già nell'HTML, per i motori di ricerca e i lettori di schermo.

Il selettore IT/EN porta alla pagina equivalente e ricorda la scelta (stessa chiave `vb-lang` del vecchio sito): chi ha scelto l'inglese e apre una pagina italiana viene portato a quella inglese.

## Tema chiaro/scuro

Segue il sistema operativo finché non si sceglie a mano col pulsante nella barra; la scelta si ricorda (`vb-theme`). Nessuna sezione cambia tema a metà pagina.

## Media (immagini e video)

`public/media` contiene versioni **ottimizzate** (da 16 MB a 3 MB). Se aggiungi o cambi un'immagine, rigenerale dagli originali:

```bash
node scripts/optimize-media.mjs "$HOME/Desktop/portfolio-site /media"
```

Lo script (non modifica mai gli originali) ridimensiona le foto, ricodifica il video, crea il poster e riscrive `src/data/media-manifest.json` (dimensioni reali, usate per evitare salti di pagina). Lavora solo sui file citati in `translations.json`.

## Pubblicazione su GitHub Pages

Il sito è statico (`npm run build` produce la cartella **`out/`**) ed è pubblicato su **https://vikybassi.github.io**.

- **Pubblicare = push su `main`.** Il workflow `.github/workflows/pages.yml` controlla il lint, costruisce (con controllo dei tipi) il sito e lo pubblica (repository: impostazioni *Pages → Source: GitHub Actions*). Niente crediti da consumare.
- **Prima di fare push** conviene provare la build in locale: `npm run build`, poi `npx serve out` e controllare le pagine.
- **Tornare a una versione precedente:** `git revert` del commit sbagliato e push (oppure rilanciare il workflow da un commit precedente).
- `sitemap.xml` e `robots.txt` sono generati dalla build a partire da `SITE` in `src/lib/seo.ts`.

Il vecchio indirizzo **vittoriabassi.netlify.app** resta attivo solo come reindirizzamento: ogni pagina rimanda alla stessa pagina su GitHub Pages, così i link già condivisi (LinkedIn, CV) continuano a funzionare.

## Impostazione grafica

Le regole complete sono in **`DESIGN.md`**: cartografia alpina contemporanea, fondo chiaro e freddo, un solo accento bordeaux, titoli in Bricolage Grotesque, testo in Geist, dati in Geist Mono. Il redesign del 26 settembre 2026 ha seguito le indicazioni di taste-skill (redesign e anti-"AI slop"), delle Web Interface Guidelines di Vercel e il formato DESIGN.md.

| Dove | Cosa | Riferimento |
|---|---|---|
| Sfondo di tutte le pagine | il Monte Disgrazia a linee di cresta (dati veri del terreno); scorrendo le creste si muovono in parallasse e il sole tramonta con i colori del crepuscolo fino alla notte; il mouse accende la cresta sotto il cursore | dati Copernicus, `ridge-sky.tsx` |
| Home, PiccoliPassi | la finestra con l'analisi di gruppo si raddrizza mentre scorri, una seconda sporge dal bordo | Container Scroll Animation (Aceternity) |
| Home, Rientro e Fotogram | affiancati, larghezze diverse: cornice da browser e telefono con il video | |
| Home, «Cosa mi muove» | cinque celle, cinque trattamenti (pannello, bordeaux, negativo, quadro, foto) | |
| Home, Competenze | quattro colonne tipografiche | |
| Progetti | testo che scorre, visuale ferma che cambia (screenshot, video, rete, catena, mappa delle tabelle) | Sticky Scroll Reveal (Aceternity) |
| Chi sono, Radici | pannello a tutta immagine e muri di foto a velocità diverse | Parallax Scroll (Aceternity) |
| Percorso, timeline | linea che si traccia con lo scroll | Tracing Beam (Aceternity) |
| Percorso, Certificazioni | la riga sotto il mouse si evidenzia e scivola alla successiva | Card Hover Effect (Aceternity) |
| Navigazione | barra sottile a tutta larghezza, fondo sfocato quando si scorre | Resizable Navbar (Aceternity) |

I componenti Aceternity sono copiati in `src/components/ui/` e **adattati** (scorrono con la pagina, colori del sito, tema scuro, «riduci animazioni», schermi stretti). Ognuno ha in testa un commento con le differenze dall'originale.

**Sfondo del sito (tutte le pagine):** `node scripts/make-ridges.mjs <tessera Copernicus N46 E009 .tif>` rigenera `src/data/ridges/disgrazia.json` (la tessera è quella scaricata per il progetto "Rientro prima del buio"). Il file si scarica dopo il primo disegno della pagina. I colori del cielo sono in `src/components/site/ridge-sky.tsx`, montato una volta sola in `SiteShell`: il tramonto segue lo scroll di ogni pagina.

**Scorrimento:** su tutto il sito c'è un po' di inerzia (Lenis, `src/components/site/smooth-scroll.tsx`), spenta con "riduci animazioni"; la lightbox la ferma mentre è aperta.

**Anteprima dei link:** `public/og-image.jpg` si genera da `assets-source/og-image.html` con un browser senza finestra.

Le visuali dei progetti (`src/components/projects/visuals.tsx`) sono generate: la rete di community (5 gruppi) e la catena di blocchi sono disegni, la mappa delle tabelle usa i **nomi veri** delle 27 tabelle da `translations.json`. I certificati non hanno anteprime: il PDF dell'attestato di sicurezza contiene il codice fiscale.

**Foto della hero:** sta in `public/photos` (non in `public/media`, perché `optimize-media.mjs` cancella da lì ciò che non è citato nei testi). L'originale, che non viene pubblicato, è in `assets-source/hero-vetta.jpg` (lì c'è anche `valle.jpg`, la foto della fascia tolta dalla home il 26/09/2026). Per cambiarla: sostituisci il file, lancia `node scripts/optimize-photos.mjs` (crea `vetta-*.jpg`, senza metadati) e aggiorna la descrizione `heroPhotoAlt` in `src/data/ui.ts` (IT ed EN).

Per far apparire un'altra foto in una sezione basta cambiare il percorso in `src/components/home/home-sections.tsx` (celle di «Cosa mi muove») o `src/components/about/roots-panels.tsx` (radici); le immagini vanno prima passate da `scripts/optimize-media.mjs`.

## Accessibilità

Controllata con axe-core su tutte le pagine, in entrambe le lingue, in entrambi i temi, su computer e telefono (0 violazioni, a parte i progetti volutamente sfumati mentre si scorre la pagina Progetti). Contrasti oltre lo standard AA, link «Vai al contenuto», navigazione da tastiera, lightbox con gestione del focus, animazioni ridotte per chi le disattiva nel sistema operativo.
