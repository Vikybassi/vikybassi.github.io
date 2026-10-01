// Script inline nell'<head>: applica il tema (salvato o del sistema) PRIMA del primo disegno, così non c'è lampo chiaro→scuro.
// Sta in un file a parte (non "use client") perché lo legge un componente server.
export const THEME_STORAGE_KEY = "vb-theme";

export const THEME_INIT_SCRIPT = `try{var k='${THEME_STORAGE_KEY}',t=localStorage.getItem(k);if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';var d=document.documentElement;d.classList.toggle('dark',t==='dark');d.style.colorScheme=t}catch(e){}`;
