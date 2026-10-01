// Diagramma ER (Mermaid) estratto tale e quale dal vecchio schema-gestione-ospedaliera.html
export const ER_DIAGRAM = `erDiagram
    OSPEDALE {
        int codice PK
        string nome
        string via
        string citta
    }
    REPARTO {
        string nome PK
        int ospedale PK,FK
        string telefono
        time orarioinizio
        time orariofine
    }
    STANZA {
        int numero PK
        string reparto PK,FK
        int ospedale PK,FK
        int piano
    }
    LETTO {
        int codletto PK
        int numstanza FK
        string reparto FK
        int ospedale FK
        bool libero
    }
    SALAOPERATORIA {
        int numero PK
        string reparto PK,FK
        int ospedale PK,FK
    }
    AMBULATORIO {
        int codice PK
    }
    AMBULATORIOINTERNO {
        int codice PK,FK
        int numero FK
        string reparto FK
        int ospedale FK
    }
    AMBULATORIOESTERNO {
        int codice PK,FK
        string telefono
        time orarioapertura
        time orariochiusura
        string via
        string citta
    }
    AMBULATORIOESAME {
        int ambulatorio PK,FK
        int codesame PK,FK
    }
    ESAME {
        int codice PK
        text descrizione
        money costonormale
        money costomutua
        bool specialistico
    }
    PRENOTAZIONE {
        string paziente PK,FK
        int codesame PK,FK
        date data PK
        date dataprenotazione
        int ambulatorio FK
        time ora
        string urgenza
        bool assistenzasanitaria
        int medico FK
    }
    PAZIENTE {
        string cf PK
        string nome
        string cognome
        date datanascita
        date datadismissione
    }
    RICOVERO {
        string paziente PK,FK
        date dataricovero PK
        date datadismissione
        int letto FK
    }
    RICOVEROPATOLOGIA {
        string patologia PK,FK
        string paziente PK,FK
        date dataricovero PK,FK
    }
    PATOLOGIA {
        string nome PK
    }
    LAVORATORE {
        int matricola PK
        string nome
        string cognome
        date datanascita
        date dataassunzione
        string nomereparto FK
        int ospedale FK
        string cf
    }
    MEDICO {
        int matricola PK,FK
    }
    INFERMIERE {
        int matricola PK,FK
    }
    PERSONALEAMMINISTRATIVO {
        int matricola PK,FK
    }
    PRIMARIO {
        int matricola PK,FK
        string reparto FK
        int ospedale FK
    }
    VICEPRIMARIO {
        int matricola PK,FK
        date dataruolo
    }
    SOSTITUZIONE {
        int primario PK,FK
        date datainizio PK
        date datafine
        int viceprimario FK
    }
    SPECIALIZZAZIONE {
        string nome PK
    }
    SPECIALIZZAZIONEPRIMARIO {
        int primario PK,FK
        string specializzazione PK,FK
        date dataottenimento
    }
    PRONTOSOCCORSO {
        int ospedale PK,FK
        string telefono
    }
    TURNOPSMEDICO {
        int medico PK,FK
        date datainizio PK
        time orainizio PK
        date datafine
        time orafine
        int prontosoccorso FK
    }
    TURNOPSINFERMIERE {
        int infermiere PK,FK
        date datainizio PK
        time orainizio PK
        date datafine
        time orafine
        int prontosoccorso FK
    }

    OSPEDALE ||--o{ REPARTO : ha
    OSPEDALE ||--o| PRONTOSOCCORSO : ha
    REPARTO ||--o{ STANZA : contiene
    REPARTO ||--o{ LAVORATORE : impiega
    REPARTO ||--o{ PRIMARIO : diretto_da
    STANZA ||--o{ LETTO : contiene
    STANZA ||--o{ AMBULATORIOINTERNO : ospita
    STANZA ||--o{ SALAOPERATORIA : ospita
    AMBULATORIO ||--o| AMBULATORIOINTERNO : tipo
    AMBULATORIO ||--o| AMBULATORIOESTERNO : tipo
    AMBULATORIO ||--o{ AMBULATORIOESAME : offre
    ESAME ||--o{ AMBULATORIOESAME : offerto_in
    AMBULATORIO ||--o{ PRENOTAZIONE : ospita
    ESAME ||--o{ PRENOTAZIONE : richiesto_in
    PAZIENTE ||--o{ PRENOTAZIONE : prenota
    PAZIENTE ||--o{ RICOVERO : subisce
    LETTO ||--o{ RICOVERO : occupato_in
    RICOVERO ||--o{ RICOVEROPATOLOGIA : diagnostica
    PATOLOGIA ||--o{ RICOVEROPATOLOGIA : diagnosticata_in
    LAVORATORE ||--o| MEDICO : specializza_in
    LAVORATORE ||--o| INFERMIERE : specializza_in
    LAVORATORE ||--o| PERSONALEAMMINISTRATIVO : specializza_in
    MEDICO ||--o| PRIMARIO : specializza_in
    MEDICO ||--o| VICEPRIMARIO : specializza_in
    MEDICO ||--o{ PRENOTAZIONE : esegue
    MEDICO ||--o{ TURNOPSMEDICO : effettua
    INFERMIERE ||--o{ TURNOPSINFERMIERE : effettua
    PRONTOSOCCORSO ||--o{ TURNOPSMEDICO : copre
    PRONTOSOCCORSO ||--o{ TURNOPSINFERMIERE : copre
    PRIMARIO ||--o{ SOSTITUZIONE : sostituito_in
    VICEPRIMARIO ||--o{ SOSTITUZIONE : sostituisce
    PRIMARIO ||--o{ SPECIALIZZAZIONEPRIMARIO : ha
    SPECIALIZZAZIONE ||--o{ SPECIALIZZAZIONEPRIMARIO : posseduta_da
`;
