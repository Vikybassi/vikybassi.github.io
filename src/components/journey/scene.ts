import * as THREE from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import ridge from "@/data/ridges/disgrazia.json";

/**
 * Il viaggio della home: un lago al crepuscolo con cinque isole (codice, pittura, musica, movimento, montagna) che
 * emergono mentre si scorre, dall'alba alla notte, e alla fine un vinile da far girare. Tutto costruito nel codice,
 * niente modelli scaricati. Le scelte che contano per la fluidità sono commentate dove stanno (riscaldamento iniziale,
 * luci sempre presenti, risoluzione adattiva).
 */

export type JourneyTexts = {
  /** nome di ogni tappa, per la barra in basso ("Codice", "Pittura"…) */
  stopNames: string[];
  /** il codice che si scrive sullo schermo: nome del file, 6 righe, la risposta finale */
  code: { file: string; lines: string[]; answer: string };
  progress: { start: string; drag: string };
};

export type JourneyRefs = {
  /** la sezione alta (lo spazio da scorrere) */
  root: HTMLElement;
  /** il palco fisso dove va la tela 3D */
  stage: HTMLElement;
  /** le 6 didascalie (5 tappe + fine) */
  captions: HTMLElement[];
  intro: HTMLElement;
  end: HTMLElement;
  pbar: HTMLElement;
  pnum: HTMLElement;
  plabel: HTMLElement;
};

const PAL = ["#e63946", "#ffb703", "#2ec4b6", "#f0919f", "#8e1b31", "#7b6cd9", "#ff8a5b"];
const CODE_COLORS = ["#f0919f", "#ffd49a", "#7ee0d8", "#f0919f", "#ffffff", "#eceeec"];

type Stop = { z: number; x: number; update?: (t: number) => void };

export async function createJourney(refs: JourneyRefs, texts: JourneyTexts): Promise<() => void> {
  const { root, stage } = refs;
  // i testi disegnati sulle texture (schermo, disco) devono avere già i caratteri del sito
  await document.fonts.ready;
  const css = getComputedStyle(document.documentElement);
  const display = css.getPropertyValue("--font-bricolage").trim() || "sans-serif";
  const mono = css.getPropertyValue("--font-geist-mono").trim() || "monospace";

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const W = () => stage.clientWidth;
  const H = () => stage.clientHeight;
  const narrow = W() <= 760;
  const SIDE = narrow ? 3.6 : 6.0; // quanto le isole stanno di lato: la camera resta al centro e non le attraversa
  const END_Z = -262;
  const Z0 = 14;
  const Z1 = END_Z + 13;

  // ---------------- scena ----------------
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  // la scena 3D non ha bisogno della densità retina piena (i testi sono HTML e restano nitidi): costa il doppio e la rende
  // a scatti. Si parte da qui e, se il computer fatica, si scende da soli (vedi `adapt`).
  const DPR_MAX = Math.min(narrow ? 1.25 : 1.35, devicePixelRatio);
  let dpr = DPR_MAX;
  renderer.setPixelRatio(dpr);
  renderer.setSize(W(), H());
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.className = "jy-canvas";
  stage.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(narrow ? 64 : 50, W() / H(), 0.1, 1200);
  const fog = new THREE.Fog(0xf4e4de, 18, 120);
  scene.fog = fog;
  const hemi = new THREE.HemisphereLight(0xfff1ea, 0xd9b3c6, 1.3);
  scene.add(hemi);
  const sunL = new THREE.DirectionalLight(0xffd6b0, 2.2);
  sunL.position.set(-20, 18, -40);
  scene.add(sunL);

  // il cielo: sfumatura, sole basso all'orizzonte, stelle col buio
  const skyU = {
    uTop: { value: new THREE.Color() },
    uHor: { value: new THREE.Color() },
    uSun: { value: new THREE.Color() },
    uSunY: { value: 0.1 },
    uNight: { value: 0 },
    uTime: { value: 0 },
  };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(900, 48, 24),
    new THREE.ShaderMaterial({
      uniforms: skyU,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
      fragmentShader: `
        uniform vec3 uTop, uHor, uSun; uniform float uSunY, uNight, uTime; varying vec3 vW;
        float hash(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,45.164)))*43758.5453); }
        void main(){
          vec3 d = normalize(vW - cameraPosition);
          vec3 col = mix(uHor, uTop, smoothstep(-0.02, 0.5, d.y));
          vec3 sd = normalize(vec3(0.0, uSunY, -1.0));
          float s = max(dot(d, sd), 0.0);
          col += uSun * (pow(s, 18.0) * 0.5 + smoothstep(0.9975, 0.998, s) * 0.9);
          vec3 g = floor(d * 300.0); float st = step(0.996, hash(g)) * smoothstep(0.05, 0.4, d.y);
          col += st * uNight * (0.6 + 0.4 * sin(uTime * 2.0 + hash(g + 1.0) * 40.0));
          gl_FragColor = vec4(col, 1.0);
        }`,
    }),
  );
  scene.add(sky);

  // l'acqua: uno specchio con increspature e foschia (i riflessi fanno metà dell'atmosfera)
  const water = new Reflector(new THREE.PlaneGeometry(1600, 1600), {
    textureWidth: W() * dpr * 0.45,
    textureHeight: H() * dpr * 0.45,
    clipBias: 0.003,
    shader: {
      name: "JourneyWater",
      uniforms: {
        color: { value: new THREE.Color(0xffffff) },
        tDiffuse: { value: null },
        textureMatrix: { value: null },
        uTime: { value: 0 },
        uTint: { value: new THREE.Color() },
      },
      vertexShader: `
        uniform mat4 textureMatrix; varying vec4 vUv; varying vec3 vW;
        void main(){ vUv = textureMatrix * vec4(position, 1.0); vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
      fragmentShader: `
        uniform sampler2D tDiffuse; uniform float uTime; uniform vec3 uTint; varying vec4 vUv; varying vec3 vW;
        void main(){
          vec2 rip = vec2(sin(vW.x * 0.9 + uTime * 1.1) + sin(vW.z * 1.7 - uTime * 0.8), cos(vW.z * 1.1 + uTime * 0.9) + sin(vW.x * 2.3 + uTime)) * 0.012;
          vec4 uv = vUv; uv.xy += rip * uv.w;
          vec3 refl = texture2DProj(tDiffuse, uv).rgb;
          float dist = length(vW - cameraPosition);
          vec3 col = mix(refl, uTint, 0.42);
          col = mix(col, uTint, smoothstep(20.0, 120.0, dist));
          gl_FragColor = vec4(col, 1.0);
        }`,
    },
  });
  water.rotation.x = -Math.PI / 2;
  scene.add(water);
  const waterU = (water.material as THREE.ShaderMaterial).uniforms;

  // coriandoli di colore che cadono piano
  const CONF = narrow ? 260 : 620;
  const conf = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(0.11, 0.2),
    new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.6 }),
    CONF,
  );
  const confData: { x: number; y: number; z: number; vy: number; r: number; vr: number }[] = [];
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e3 = new THREE.Euler();
  const v3 = new THREE.Vector3();
  const s3 = new THREE.Vector3(1, 1, 1);
  for (let i = 0; i < CONF; i++) {
    confData.push({ x: (Math.random() - 0.5) * 34, y: Math.random() * 14, z: Z0 - Math.random() * (Z0 - END_Z + 30), vy: 0.25 + Math.random() * 0.5, r: Math.random() * 6, vr: 0.5 + Math.random() * 1.5 });
    conf.setColorAt(i, new THREE.Color(PAL[i % PAL.length]));
  }
  scene.add(conf);

  // ---------------- isole e oggetti ----------------
  function island(r: number) {
    const g = new THREE.IcosahedronGeometry(r, 3);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      v3.fromBufferAttribute(p, i);
      const n = 1 + 0.12 * Math.sin(v3.x * 2.1) * Math.cos(v3.z * 1.7) + 0.06 * Math.sin(v3.y * 5.0);
      v3.multiplyScalar(n);
      v3.y *= v3.y > 0 ? 0.35 : 0.8;
      p.setXYZ(i, v3.x, v3.y, v3.z);
    }
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0xf6ece8, roughness: 0.95 }));
    m.position.y = 0.05;
    return m;
  }
  function canvasTex(w: number, h: number, draw: (x: CanvasRenderingContext2D) => void) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const x = c.getContext("2d")!;
    draw(x);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return { t, x };
  }

  // 01 · Codice: uno schermo sospeso dove si scrive da solo il codice di "rientro prima del buio"
  function makeCode(stop: Stop) {
    const g = new THREE.Group();
    const lines = texts.code.lines;
    const TOTAL = lines.reduce((n, l) => n + l.length + 1, 0);
    const scr = canvasTex(1024, 640, () => {});
    let typed = 0;
    function draw() {
      const x = scr.x;
      x.fillStyle = "#16121c";
      x.fillRect(0, 0, 1024, 640);
      x.fillStyle = "#231c2c";
      x.fillRect(0, 0, 1024, 56);
      ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
        x.fillStyle = c;
        x.beginPath();
        x.arc(34 + i * 30, 28, 10, 0, 7);
        x.fill();
      });
      x.fillStyle = "#8a7f99";
      x.font = `500 24px ${mono}`;
      x.fillText(texts.code.file, 140, 36);
      x.font = `500 34px ${mono}`;
      let left = typed;
      lines.forEach((line, i) => {
        const show = line.slice(0, Math.max(0, left));
        left -= line.length + 1;
        x.fillStyle = CODE_COLORS[i] ?? "#eceeec";
        x.fillText(show, 44, 124 + i * 56);
        if (left < 0 && left > -line.length - 2 && Math.floor(performance.now() / 450) % 2) {
          const w = x.measureText(show).width;
          x.fillStyle = "#f0919f";
          x.fillRect(46 + w, 96 + i * 56, 18, 38);
        }
      });
      // finito di scrivere: la risposta compare grande, in un riquadro verde
      if (typed >= TOTAL) {
        x.fillStyle = "#1f3a2a";
        x.beginPath();
        x.roundRect(44, 470, 936, 112, 18);
        x.fill();
        x.fillStyle = "#9be89b";
        x.font = `500 50px ${mono}`;
        x.fillText(texts.code.answer, 78, 543);
      }
      scr.t.needsUpdate = true;
    }
    draw();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.4, 0.18), new THREE.MeshStandardMaterial({ color: 0x2a2233, roughness: 0.4, metalness: 0.3 }));
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(4.9, 3.06), new THREE.MeshBasicMaterial({ map: scr.t, toneMapped: false }));
    screen.position.z = 0.095;
    const mon = new THREE.Group();
    mon.add(frame, screen);
    mon.position.y = 2.9;
    mon.rotation.y = narrow ? 0.12 : 0.3;
    g.add(mon);
    // cubetti che orbitano: i "pezzi" di un'app
    const cubes = Array.from({ length: 9 }, (_, i) => {
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), new THREE.MeshStandardMaterial({ color: PAL[i % PAL.length], roughness: 0.35, emissive: PAL[i % PAL.length], emissiveIntensity: 0.15 }));
      g.add(c);
      return c;
    });
    g.add(island(3.4));
    let last = 0;
    let hold = 0;
    stop.update = (t) => {
      mon.position.y = 2.9 + Math.sin(t * 0.8) * 0.1;
      cubes.forEach((c, i) => {
        const a = t * 0.5 + i * 0.7;
        c.position.set(Math.cos(a) * 2.7, 1.6 + Math.sin(a * 1.3) * 0.9, Math.sin(a) * 1.4);
        c.rotation.set(t + i, t * 0.7, 0);
      });
      if (t - last > 0.07) {
        last = t;
        if (typed < TOTAL) {
          typed++;
          draw();
        } else if (++hold > 70) {
          hold = 0; // la risposta resta qualche secondo, poi si ricomincia
          typed = 0;
          draw();
        } else if (hold === 1) draw();
      }
    };
    return g;
  }

  // 02 · Pittura: pennellate di colore che si avvolgono e girano, con gocce
  function makePaint(stop: Stop) {
    const g = new THREE.Group();
    const cols = ["#e63946", "#ffb703", "#2ec4b6", "#f0919f", "#3a86ff", "#ff8a5b"];
    const sculpt = new THREE.Group();
    sculpt.position.y = 2.4;
    g.add(sculpt);
    cols.forEach((c, k) => {
      const pts: THREE.Vector3[] = [];
      const turns = 1.2 + Math.random() * 0.8;
      const ph = k * 1.05;
      for (let i = 0; i <= 40; i++) {
        const u = i / 40;
        const a = ph + u * Math.PI * 2 * turns;
        const r = 1.1 + Math.sin(u * 3.1 + k) * 0.55;
        pts.push(new THREE.Vector3(Math.cos(a) * r, (u - 0.5) * 3.0 + Math.sin(a * 2) * 0.3, Math.sin(a) * r));
      }
      sculpt.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.16 + (k % 3) * 0.04, 10), new THREE.MeshStandardMaterial({ color: c, roughness: 0.25, metalness: 0.05, emissive: c, emissiveIntensity: 0.12 })));
    });
    const drops = Array.from({ length: 14 }, (_, i) => {
      const d = new THREE.Mesh(new THREE.SphereGeometry(0.1 + Math.random() * 0.1, 16, 12), new THREE.MeshStandardMaterial({ color: cols[i % cols.length], roughness: 0.2 }));
      g.add(d);
      return d;
    });
    g.add(island(3.0));
    stop.update = (t) => {
      sculpt.rotation.y = t * 0.35;
      sculpt.rotation.z = Math.sin(t * 0.4) * 0.12;
      drops.forEach((d, i) => {
        const a = t * 0.7 + i;
        d.position.set(Math.cos(a) * (narrow ? 1.6 + (i % 3) * 0.25 : 2.2 + (i % 3) * 0.4), 1.2 + ((t * 0.6 + i * 0.37) % 3.2), Math.sin(a) * (narrow ? 1.2 : 1.8));
      });
    };
    return g;
  }

  // 03 · Musica: la consolle con due vinili che girano, le cuffie, l'equalizzatore a tempo e le onde sonore
  function makeMusic(stop: Stop) {
    const g = new THREE.Group();
    const deck = new THREE.Group();
    deck.position.y = 1.75;
    deck.rotation.y = -0.4;
    deck.scale.setScalar(1.4);
    g.add(deck);
    deck.add(new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.32, 1.7), new THREE.MeshStandardMaterial({ color: 0x1d1822, roughness: 0.45, metalness: 0.4 })));
    const vinylTex = canvasTex(512, 512, (x) => {
      x.fillStyle = "#0d0b10";
      x.fillRect(0, 0, 512, 512);
      for (let r = 250; r > 70; r -= 3) {
        x.strokeStyle = r % 2 ? "#1c1822" : "#141117";
        x.lineWidth = 2;
        x.beginPath();
        x.arc(256, 256, r, 0, 7);
        x.stroke();
      }
      x.fillStyle = "#c2375a";
      x.beginPath();
      x.arc(256, 256, 70, 0, 7);
      x.fill();
      x.fillStyle = "#f4e4de";
      x.font = `800 30px ${display}`;
      x.textAlign = "center";
      x.fillText("VB", 256, 266);
    });
    const plates = [-0.95, 0.95].map((px) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.05, 64), [new THREE.MeshStandardMaterial({ color: 0x0d0b10 }), new THREE.MeshStandardMaterial({ map: vinylTex.t, roughness: 0.3, metalness: 0.2 }), new THREE.MeshStandardMaterial({ color: 0x0d0b10 })]);
      p.position.set(px, 0.19, 0);
      deck.add(p);
      return p;
    });
    const knobs = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 1.1), new THREE.MeshStandardMaterial({ color: 0x2a2433 }));
    knobs.position.y = 0.18;
    deck.add(knobs);
    // le cuffie appoggiate sulla consolle
    const phones = new THREE.Group();
    phones.position.set(1.45, 0.42, 0.55);
    phones.rotation.set(-0.9, 0.5, 0.25);
    deck.add(phones);
    phones.add(new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.045, 12, 40, Math.PI), new THREE.MeshStandardMaterial({ color: 0x231c2c, roughness: 0.35, metalness: 0.4 })));
    [-0.34, 0.34].forEach((x) => {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.12, 28), new THREE.MeshStandardMaterial({ color: 0x1b1622, roughness: 0.4 }));
      cup.rotation.z = Math.PI / 2;
      cup.position.set(x, -0.04, 0);
      const pad = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.035, 10, 28), new THREE.MeshStandardMaterial({ color: 0xc2375a, roughness: 0.6 }));
      pad.rotation.y = Math.PI / 2;
      pad.position.set(x * 0.82, -0.04, 0);
      phones.add(cup, pad);
    });
    // equalizzatore dietro la consolle
    const BARS = 18;
    const bars = Array.from({ length: BARS }, (_, i) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1, 0.2), new THREE.MeshStandardMaterial({ color: PAL[i % PAL.length], emissive: PAL[i % PAL.length], emissiveIntensity: 0.5, roughness: 0.3 }));
      b.position.set(-2.1 + i * 0.25, 2.2, -1.75);
      g.add(b);
      return b;
    });
    // onde sonore: anelli che si allargano
    const rings = Array.from({ length: 3 }, () => {
      const r = new THREE.Mesh(new THREE.TorusGeometry(1, 0.025, 8, 96), new THREE.MeshBasicMaterial({ color: 0xc2375a, transparent: true }));
      r.rotation.x = Math.PI / 2;
      r.position.y = 0.2;
      g.add(r);
      return r;
    });
    g.add(island(3.2));
    stop.update = (t) => {
      plates.forEach((p, i) => (p.rotation.y = -t * (i ? 3.1 : 3.4)));
      const beat = t * 2.07; // ~124 bpm
      // l'equalizzatore finge un ritmo a 124 bpm
      bars.forEach((b, i) => {
        const h =
          0.25 + Math.abs(Math.sin(beat * Math.PI + i * 0.55)) * (0.8 + 0.6 * Math.sin(i * 1.7 + t)) * (1 + 0.5 * Math.max(0, Math.sin(beat * Math.PI * 0.5)));
        b.scale.y += (h - b.scale.y) * 0.4;
        b.position.y = 2.05 + b.scale.y / 2;
      });
      rings.forEach((r, i) => {
        const k = (t * 0.5 + i / 3) % 1;
        r.scale.setScalar(1 + k * 3.6);
        (r.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.8;
      });
    };
    return g;
  }

  // 04 · Movimento: una pista d'atletica vera, quasi piatta, con il corridore di luce; prese d'arrampicata dietro
  function makeMove(stop: Stop) {
    const g = new THREE.Group();
    const L = 2.4;
    const R1 = 1.0;
    const R2 = 1.9;
    const stadium = <T extends THREE.Path>(sh: T, r: number) => {
      sh.moveTo(-L / 2, -r);
      sh.lineTo(L / 2, -r);
      sh.absarc(L / 2, 0, r, -Math.PI / 2, Math.PI / 2, false);
      sh.lineTo(-L / 2, r);
      sh.absarc(-L / 2, 0, r, Math.PI / 2, Math.PI * 1.5, false);
      return sh;
    };
    const ring = stadium(new THREE.Shape(), R2);
    ring.holes.push(stadium(new THREE.Path(), R1));
    const track = new THREE.Group();
    track.position.y = 1.55;
    track.rotation.x = -Math.PI / 2 + 0.55;
    g.add(track);
    const band = new THREE.Mesh(new THREE.ExtrudeGeometry(ring, { depth: 0.12, bevelEnabled: false, curveSegments: 40 }), new THREE.MeshStandardMaterial({ color: 0xc8553d, roughness: 0.85 }));
    const field = new THREE.Mesh(new THREE.ShapeGeometry(stadium(new THREE.Shape(), R1), 40), new THREE.MeshStandardMaterial({ color: 0x6f9a5f, roughness: 0.9 }));
    field.position.z = 0.06;
    track.add(band, field);
    // un punto della pista a distanza s lungo la corsia di raggio r
    const at = (s: number, r: number, out: THREE.Vector3) => {
      const per = 2 * L + 2 * Math.PI * r;
      let d = ((s % per) + per) % per;
      if (d < L) return out.set(-L / 2 + d, -r, 0);
      d -= L;
      if (d < Math.PI * r) {
        const a = -Math.PI / 2 + d / r;
        return out.set(L / 2 + Math.cos(a) * r, Math.sin(a) * r, 0);
      }
      d -= Math.PI * r;
      if (d < L) return out.set(L / 2 - d, r, 0);
      d -= L;
      const a = Math.PI / 2 + d / r;
      return out.set(-L / 2 + Math.cos(a) * r, Math.sin(a) * r, 0);
    };
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (const r of [R1 + 0.3, R1 + 0.6]) {
      const per = 2 * L + 2 * Math.PI * r;
      const pts = Array.from({ length: 121 }, (_, i) => at((i / 120) * per, r, new THREE.Vector3()).setZ(0.13));
      track.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 160, 0.014, 4, true), lineMat));
    }
    // il corridore di luce, con la scia
    const LANE = R1 + 0.45;
    const runner = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfff3c4, toneMapped: false }));
    const trail = Array.from({ length: 18 }, (_, i) => {
      const d = new THREE.Mesh(new THREE.SphereGeometry(0.11 * (1 - i / 20), 10, 8), new THREE.MeshBasicMaterial({ color: 0xffd49a, transparent: true, opacity: 1 - i / 18, toneMapped: false }));
      track.add(d);
      return d;
    });
    track.add(runner);
    // prese d'arrampicata che fluttuano dietro la pista, lontano dalla camera
    const holds = Array.from({ length: 8 }, (_, i) => {
      const h = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16 + Math.random() * 0.12, 0), new THREE.MeshStandardMaterial({ color: PAL[(i * 3) % PAL.length], roughness: 0.5, flatShading: true }));
      h.userData.o = new THREE.Vector3((Math.random() - 0.5) * (narrow ? 3.4 : 6), 2.2 + Math.random() * 2, -0.4 - Math.random() * 1.6);
      g.add(h);
      return h;
    });
    g.add(island(3.3));
    stop.update = (t) => {
      const s = t * 2.2;
      at(s, LANE, runner.position).setZ(0.28);
      trail.forEach((d, i) => at(s - i * 0.13, LANE, d.position).setZ(0.26));
      holds.forEach((h, i) => {
        h.position.copy(h.userData.o as THREE.Vector3);
        h.position.y += Math.sin(t * 0.9 + i) * 0.2;
        h.rotation.set(t * 0.3 + i, t * 0.2, 0);
      });
    };
    return g;
  }

  // 05 · Montagna: un Disgrazia in miniatura con la neve rosata (una tappa tra le altre)
  function makeMountain(stop: Stop) {
    const g = new THREE.Group();
    const holder = new THREE.Group();
    holder.position.y = 0.35;
    g.add(holder);
    const raw = Uint8Array.from(atob(ridge.data), (c) => c.charCodeAt(0));
    const SX = 80;
    const SZ = 38;
    const geo = new THREE.PlaneGeometry(7.4, 3.6, SX - 1, SZ - 1);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const col = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const ix = i % SX;
      const iz = Math.floor(i / SX);
      const cc = Math.floor((ix / (SX - 1)) * (ridge.cols - 1) * 0.7 + ridge.cols * 0.15);
      const rr = Math.floor((iz / (SZ - 1)) * (ridge.rows - 1));
      const h = raw[rr * ridge.cols + cc] / 255;
      const edge = Math.min(ix, SX - 1 - ix, iz, SZ - 1 - iz) / 4;
      pos.setY(i, h * 2.15 * Math.min(1, edge));
      c.set(h > 0.66 ? "#fff4f6" : h > 0.42 ? "#b8aab3" : "#86977f");
      col.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo.computeVertexNormals();
    holder.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9 })));
    g.add(island(4.4));
    stop.update = (t) => {
      holder.rotation.y = Math.sin(t * 0.25) * 0.3;
    };
    return g;
  }

  // ---------------- il disco finale: si fa girare trascinando ----------------
  const disc = new THREE.Group();
  disc.position.set(0, 4.4, END_Z);
  scene.add(disc);
  const labelTex = canvasTex(1024, 1024, (x) => {
    x.fillStyle = "#0d0b10";
    x.fillRect(0, 0, 1024, 1024);
    for (let r = 505; r > 190; r -= 4) {
      x.strokeStyle = r % 8 ? "#1b1720" : "#141117";
      x.lineWidth = 2.5;
      x.beginPath();
      x.arc(512, 512, r, 0, 7);
      x.stroke();
    }
    const gr = x.createLinearGradient(330, 330, 700, 700);
    gr.addColorStop(0, "#ffd49a");
    gr.addColorStop(0.5, "#f0919f");
    gr.addColorStop(1, "#c2375a");
    x.fillStyle = gr;
    x.beginPath();
    x.arc(512, 512, 190, 0, 7);
    x.fill();
    x.fillStyle = "#231a2b";
    x.textAlign = "center";
    x.font = `800 64px ${display}`;
    x.fillText("Vittoria", 512, 482);
    x.fillText("Bassi", 512, 590);
    x.fillStyle = "#0d0b10";
    x.beginPath();
    x.arc(512, 512, 12, 0, 7);
    x.fill();
  });
  const labelMat = new THREE.MeshStandardMaterial({ map: labelTex.t, roughness: 0.28, metalness: 0.25, emissive: 0xffffff, emissiveMap: labelTex.t, emissiveIntensity: 0.55 });
  const vinyl = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 0.08, 128), [new THREE.MeshStandardMaterial({ color: 0x0d0b10, roughness: 0.4 }), labelMat, new THREE.MeshStandardMaterial({ color: 0x0d0b10 })]);
  vinyl.rotation.x = Math.PI / 2;
  disc.add(vinyl);
  const discLight = new THREE.PointLight(0xffc7d6, 60, 30, 1.6);
  discLight.position.set(2, 3, 7);
  disc.add(discLight);
  const discIsland = island(2.7);
  discIsland.position.y = -4.3;
  disc.add(discIsland);
  let spin = 0;
  let spinV = reduce ? 0 : 0.02;
  let dragging = false;
  let lastA = 0;
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const canvas = renderer.domElement;
  const toNdc = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  };
  const discAngle = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    v3.copy(disc.position).project(camera);
    return Math.atan2(e.clientY - r.top - (-v3.y * 0.5 + 0.5) * r.height, e.clientX - r.left - (v3.x * 0.5 + 0.5) * r.width);
  };
  const onDown = (e: PointerEvent) => {
    toNdc(e);
    ray.setFromCamera(ndc, camera);
    if (ray.intersectObject(vinyl).length) {
      dragging = true;
      lastA = discAngle(e);
      canvas.setPointerCapture(e.pointerId);
    }
  };
  const onMove = (e: PointerEvent) => {
    toNdc(e);
    if (!dragging) {
      ray.setFromCamera(ndc, camera);
      canvas.style.cursor = ray.intersectObject(vinyl).length ? "grab" : "";
      return;
    }
    const a = discAngle(e);
    let d = a - lastA;
    if (d > Math.PI) d -= 2 * Math.PI;
    if (d < -Math.PI) d += 2 * Math.PI;
    lastA = a;
    spin -= d;
    spinV = -d;
  };
  const onUp = () => (dragging = false);
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);

  // la luce rosa del tramonto sulla neve della montagna (l'enrosadira). Sta sempre nella scena, anche spenta: se comparisse
  // e sparisse con l'isola cambierebbe il numero di luci, e il browser dovrebbe ripreparare tutti i materiali (uno scatto).
  const glow = new THREE.PointLight(0xff7aa0, 0, 16, 1.4);
  scene.add(glow);

  // ---------------- le tappe ----------------
  const makers = [makeCode, makePaint, makeMusic, makeMove, makeMountain];
  const STOPS: Stop[] = makers.map((_, i) => ({ z: -40 - i * 44, x: i % 2 ? SIDE : -SIDE }));
  const built = STOPS.map((s, i) => {
    const g = makers[i](s);
    g.position.set(s.x, 0, s.z);
    scene.add(g);
    return g;
  });

  // ---------------- la luce del viaggio: dall'alba alla notte ----------------
  type Key = { p: number; top: string; hor: string; sun: string; fog: string; hemiS: string; hemiG: string; sunY: number };
  const KEYS: Key[] = [
    { p: 0.0, top: "#f7d9cf", hor: "#fbe9e1", sun: "#ffd6b0", fog: "#f4e4de", hemiS: "#fff1ea", hemiG: "#d9b3c6", sunY: 0.16 },
    { p: 0.35, top: "#bcd3ea", hor: "#f3e7e4", sun: "#fff0d6", fog: "#eee6e8", hemiS: "#ffffff", hemiG: "#c7c3d6", sunY: 0.22 },
    { p: 0.62, top: "#e7a3a8", hor: "#f9c8a6", sun: "#ff9a6b", fog: "#f1c9b8", hemiS: "#ffd9c7", hemiG: "#c99aa8", sunY: 0.05 },
    { p: 0.8, top: "#5c4a86", hor: "#d98aa2", sun: "#ff7a7a", fog: "#b98aa6", hemiS: "#e6b6d6", hemiG: "#5b4a73", sunY: -0.01 },
    { p: 1.0, top: "#0c0f24", hor: "#2c2552", sun: "#6a3a6a", fog: "#231d40", hemiS: "#8a86c8", hemiG: "#1b1830", sunY: -0.06 },
  ];
  const cA = new THREE.Color();
  const cB = new THREE.Color();
  const seg = (p: number) => {
    let i = 0;
    while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
    return { a: KEYS[i], b: KEYS[i + 1], t: THREE.MathUtils.smoothstep(p, KEYS[i].p, KEYS[i + 1].p) };
  };
  const keyColor = (p: number, k: "top" | "hor" | "sun" | "fog" | "hemiS" | "hemiG", out: THREE.Color) => {
    const { a, b, t } = seg(p);
    return out.copy(cA.set(a[k])).lerp(cB.set(b[k]), t);
  };
  const keyNum = (p: number) => {
    const { a, b, t } = seg(p);
    return a.sunY + (b.sunY - a.sunY) * t;
  };

  // ---------------- scroll, mouse, testi ----------------
  const mouse = new THREE.Vector2();
  const mouseS = new THREE.Vector2();
  const onMouse = (e: PointerEvent) => {
    if (e.pointerType === "mouse") mouse.set(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5);
  };
  addEventListener("pointermove", onMouse);
  // avanzamento dentro la sezione del viaggio (non di tutta la pagina: sotto c'è il piè di pagina)
  const scrollP = () => {
    const r = root.getBoundingClientRect();
    return THREE.MathUtils.clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
  };
  let sp = scrollP();
  let camX = 0;
  let lastIdx = -2;
  const clock = new THREE.Clock();
  const lookS = new THREE.Vector3(0, 3.4, Z0 - 16);
  const lookT = new THREE.Vector3();
  let lastT = performance.now();
  let frames = 0;
  let acc = 0;
  let lastAdapt = 0;
  const damp = (k: number, dt: number) => 1 - Math.exp(-k * dt);

  // qualità automatica: se per un secondo e mezzo i fotogrammi sono lenti, si abbassa un poco la risoluzione
  function resize() {
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(dpr);
    renderer.setSize(W(), H());
    water.getRenderTarget().setSize(W() * dpr * 0.45, H() * dpr * 0.45);
  }
  function adapt(dt: number, now: number) {
    frames++;
    acc += dt;
    if (frames < 90) return;
    const avg = acc / frames;
    frames = 0;
    acc = 0;
    let nd = dpr;
    if (avg > 0.021 && dpr > 0.85) nd = Math.max(0.85, dpr - 0.15);
    else if (avg < 0.0135 && dpr < DPR_MAX && now - lastAdapt > 6000) nd = Math.min(DPR_MAX, dpr + 0.1);
    if (nd !== dpr) {
      dpr = nd;
      lastAdapt = now;
      resize();
    }
  }

  // fuori dalla sezione (sul piè di pagina) non si disegna niente
  let inView = true;
  const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting));
  io.observe(root);

  let raf = 0;
  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - lastT) / 1000) || 0.016;
    lastT = now;
    if (!inView) return;
    const t = clock.getElapsedTime();
    adapt(dt, now);
    sp += (scrollP() - sp) * (reduce ? 1 : damp(4.5, dt));
    mouseS.lerp(mouse, damp(3, dt));

    // la camera resta sul percorso e si scosta appena dall'isola che arriva (non ci passa mai attraverso); per inquadrarla
    // si gira, e il punto guardato scivola invece di saltare
    const z = THREE.MathUtils.lerp(Z0, Z1, sp);
    let target = 0;
    let near: Stop | null = null;
    for (const s of STOPS) {
      const d = z - s.z;
      if (d > -6 && d < 34) {
        target = -s.x * 0.12;
        near = s;
      }
    }
    camX += (target - camX) * damp(1.8, dt);
    camera.position.set(camX + mouseS.x * 1.2, 2.3 + (reduce ? 0 : Math.sin(t * 0.6) * 0.06) - mouseS.y * 0.5, z);
    // si guarda un poco sopra l'isola: l'oggetto sta nella metà bassa e la didascalia in alto resta libera
    if (z < END_Z + 28) lookT.set(0, 5.2, END_Z);
    else lookT.set(near ? near.x * (narrow ? 1.05 : 0.8) : 0, near ? 3.3 : 3.4, z - 16);
    lookS.x += (lookT.x - lookS.x) * damp(2.2, dt);
    lookS.y += (lookT.y - lookS.y) * damp(2.2, dt);
    lookS.z += (lookT.z - lookS.z) * damp(6, dt);
    camera.lookAt(lookS);

    // luce, cielo, nebbia
    keyColor(sp, "top", skyU.uTop.value);
    keyColor(sp, "hor", skyU.uHor.value);
    keyColor(sp, "sun", skyU.uSun.value);
    skyU.uSunY.value = keyNum(sp);
    skyU.uNight.value = THREE.MathUtils.smoothstep(sp, 0.78, 0.98);
    skyU.uTime.value = t;
    keyColor(sp, "fog", fog.color);
    keyColor(sp, "hemiS", hemi.color);
    keyColor(sp, "hemiG", hemi.groundColor);
    keyColor(sp, "sun", sunL.color);
    sunL.intensity = 2.2 * (1 - skyU.uNight.value * 0.7);
    (waterU.uTint.value as THREE.Color).copy(fog.color);
    waterU.uTime.value = t;
    renderer.setClearColor(fog.color);
    sky.position.copy(camera.position);
    root.classList.toggle("jy-night", sp > 0.78);

    // le isole emergono dall'acqua quando ci si avvicina
    built.forEach((g, i) => {
      const d = z - STOPS[i].z;
      const k = THREE.MathUtils.clamp(1 - (d - 10) / 30, 0, 1);
      const e = k === 0 ? 0 : 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2);
      g.visible = k > 0 && d > -30;
      g.scale.setScalar(Math.max(0.001, e));
      g.position.y = (1 - k) * -2.5;
      if (g.visible) STOPS[i].update?.(t);
    });
    const m = STOPS[4];
    glow.position.set(m.x - 4, 5, m.z + 3);
    glow.intensity = 26 * THREE.MathUtils.clamp(1 - Math.abs(z - m.z - 8) / 30, 0, 1);
    // disco finale
    if (!dragging) {
      spin += spinV * dt * 60;
      spinV += ((reduce ? 0 : 0.02) - spinV) * damp(1.2, dt);
    }
    vinyl.rotation.y = spin;
    disc.scale.setScalar(THREE.MathUtils.clamp(1 - (z - END_Z - 14) / 40, 0.001, 1));

    // coriandoli
    if (!reduce) {
      for (let i = 0; i < CONF; i++) {
        const c = confData[i];
        c.y -= c.vy * dt;
        c.r += c.vr * dt;
        if (c.y < 0) c.y = 12 + Math.random() * 3;
        v3.set(c.x + Math.sin(t * 0.5 + i) * 0.4, c.y, c.z);
        e3.set(c.r, c.r * 0.7, c.r * 0.3);
        q.setFromEuler(e3);
        m4.compose(v3, q, s3);
        conf.setMatrixAt(i, m4);
      }
      conf.instanceMatrix.needsUpdate = true;
    }

    // testi: titolo all'inizio, didascalia della tappa vicina, disco alla fine (il DOM si tocca solo quando cambia)
    const idx = z < END_Z + 30 ? STOPS.length : near ? STOPS.indexOf(near) : -1;
    refs.pbar.style.transform = `scaleX(${sp.toFixed(4)})`;
    if (idx !== lastIdx) {
      lastIdx = idx;
      refs.captions.forEach((c, i) => c.classList.toggle("jy-off", i !== idx));
      refs.pnum.textContent = `${String(idx >= 0 ? idx + 1 : 0).padStart(2, "0")} / 06`;
      refs.plabel.textContent = idx >= 0 ? (idx === STOPS.length ? texts.progress.drag : texts.stopNames[idx]) : texts.progress.start;
    }
    refs.intro.classList.toggle("jy-gone", sp > 0.035);
    refs.end.classList.toggle("jy-on", z < END_Z + 22);

    renderer.render(scene, camera);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(stage);

  // "riscaldamento": prima del viaggio si disegna una volta tutto, isole comprese e anche fuori inquadratura. Il riflesso
  // dell'acqua usa varianti dei materiali diverse da quelle della vista normale (niente correzione dei colori finale): se
  // si preparassero solo quando un'isola compare, il browser si fermerebbe fino a mezzo secondo proprio a metà viaggio.
  scene.traverse((o) => {
    const mat = (o as THREE.Mesh).material;
    const ms = mat ? ([] as THREE.Material[]).concat(mat) : [];
    ms.forEach((mm) => {
      const s = mm as THREE.MeshStandardMaterial;
      if (s.map) renderer.initTexture(s.map);
      if (s.emissiveMap) renderer.initTexture(s.emissiveMap);
    });
  });
  await renderer.compileAsync(scene, camera);
  renderer.setRenderTarget(water.getRenderTarget());
  await renderer.compileAsync(scene, camera);
  renderer.setRenderTarget(null);
  const culled: [THREE.Object3D, boolean][] = [];
  scene.traverse((o) => {
    if ((o as THREE.Mesh).isMesh || (o as THREE.InstancedMesh).isInstancedMesh) {
      culled.push([o, o.frustumCulled]);
      o.frustumCulled = false;
    }
  });
  built.forEach((g, i) => {
    g.visible = true;
    g.scale.setScalar(1);
    STOPS[i].update?.(0);
  });
  renderer.render(scene, camera);
  culled.forEach(([o, f]) => (o.frustumCulled = f));
  raf = requestAnimationFrame(frame);

  // ---------------- pulizia, quando si lascia la home ----------------
  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    removeEventListener("pointermove", onMouse);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      mesh.geometry?.dispose();
      const mat = mesh.material;
      ([] as THREE.Material[]).concat(mat ?? []).forEach((mm) => {
        const s = mm as THREE.MeshStandardMaterial;
        s.map?.dispose();
        s.emissiveMap?.dispose();
        mm.dispose();
      });
    });
    water.dispose();
    renderer.dispose();
    canvas.remove();
  };
}

/** Il viaggio funziona solo con WebGL: senza, la home mostra la versione semplice (titolo e link). */
export function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
