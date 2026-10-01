import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";

// Tre voci, ognuna con un compito (vedi DESIGN.md):
// - Bricolage Grotesque per i titoli: grottesco con carattere (le "ink trap" si vedono nei corpi grandi), asse opsz
//   per restare nitido sia a 160 px che a 20 px;
// - Geist per il testo: neutro e molto leggibile, lascia la scena ai titoli;
// - Geist Mono per i dati (date, quote, tecnologie): stessa famiglia del testo, cifre a larghezza fissa.
export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  axes: ["opsz"],
});

export const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  weight: ["400", "500"],
});

export const fontVariables = `${bricolage.variable} ${geist.variable} ${geistMono.variable}`;
