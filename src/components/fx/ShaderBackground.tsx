"use client";
import { useEffect, useRef } from "react";
import { cx } from "@/lib/cx";

/**
 * Fond de section animé : un seul triangle plein écran, un fragment shader (WebGL 1, sans three.js).
 * - « aurora » : voile clair, nappes bleu / ciel / pêche qui dérivent lentement (hero, tuiles).
 * - « night »  : bleu nuit profond, caustiques lumineuses façon surface de l'eau (sections sombres).
 * - « sea »    : bleu moyen, houle et reflets (bandeau d'appel).
 * Rendu à ½ résolution (le motif est flou par nature), mis en pause hors écran et onglet caché.
 * Mouvement réduit : une seule image fixe. Sans WebGL : le dégradé CSS de repli reste affiché.
 */
export type ShaderVariant = "aurora" | "night" | "sea" | "dawn";

const palettes: Record<ShaderVariant, { colors: [string, string, string, string]; fallback: string }> = {
  aurora: {
    colors: ["#ffffff", "#e6f1fa", "#b9dbf3", "#ffe6d2"],
    fallback: "radial-gradient(60% 60% at 20% 30%, #d6ebf9 0%, transparent 70%), radial-gradient(50% 50% at 80% 60%, #ffe3cc 0%, transparent 70%), #ffffff",
  },
  night: {
    colors: ["#03101a", "#0a2a40", "#1f6a99", "#6fb6e4"],
    fallback: "radial-gradient(70% 60% at 50% 40%, #0f3653 0%, #05121c 70%)",
  },
  sea: {
    colors: ["#0b3a5a", "#1f6a99", "#4a9fd4", "#bfe2f7"],
    fallback: "linear-gradient(160deg, #1f6a99 0%, #0b3a5a 100%)",
  },
  dawn: {
    colors: ["#fff7f0", "#ffe0c6", "#f8b37a", "#cfe6f7"],
    fallback: "radial-gradient(60% 60% at 70% 30%, #ffe0c6 0%, transparent 70%), #fff7f0",
  },
};

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPointer;
uniform vec3 c0;uniform vec3 c1;uniform vec3 c2;uniform vec3 c3;
uniform float uMode; // 0 aurora/dawn, 1 night (caustiques), 2 sea (houle)
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.02+vec2(1.7,9.2);a*=.5;}return v;}
float caustic(vec2 p,float t){
  float c=0.;vec2 q=p;
  for(int i=0;i<3;i++){
    q+=vec2(sin(q.y*1.7+t*.6+float(i)),cos(q.x*1.5-t*.5+float(i)*1.3))*.35;
    c+=.5/length(vec2(sin(q.x*2.1),cos(q.y*2.3))+.0001);
  }
  return c/3.;
}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 p=(gl_FragCoord.xy-.5*uRes)/min(uRes.x,uRes.y);
  float t=uTime*.045;
  p+=(uPointer-.5)*.08;
  vec2 q=vec2(fbm(p*1.3+t),fbm(p*1.3-t+3.1));
  vec2 r=vec2(fbm(p*1.1+q*1.8+vec2(1.7,9.2)+t*1.3),fbm(p*1.1+q*1.8+vec2(8.3,2.8)-t));
  float f=fbm(p+r*1.6);
  vec3 col=mix(c0,c1,smoothstep(.15,.65,f));
  col=mix(col,c2,smoothstep(.45,.95,length(q))*.85);
  col=mix(col,c3,smoothstep(.55,1.05,r.x)*.7);
  if(uMode>.5&&uMode<1.5){
    float c=caustic(p*2.2+r,uTime*.35);
    col+=c3*pow(smoothstep(1.1,2.8,c),2.)*.28;
    col*=.85+.15*smoothstep(1.2,-.2,length(p));
  }
  if(uMode>1.5){
    // houle : reflets larges et doux qui glissent
    float w=sin((p.y*1.4+fbm(p*1.2+t)*1.2)*5.-uTime*.25);
    col+=c3*smoothstep(.6,1.,w)*.07;
  }
  col+=(h(gl_FragCoord.xy+fract(uTime))-.5)*.018; // grain anti-bandes
  gl_FragColor=vec4(col,1.);
}`;

function hex(c: string): [number, number, number] {
  const v = parseInt(c.slice(1), 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}

export function ShaderBackground({ variant = "aurora", className, scale = 0.5, speed = 1 }: { variant?: ShaderVariant; className?: string; scale?: number; speed?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pal = palettes[variant];

  useEffect(() => {
    // démarrage différé (navigateur inactif) : le dégradé CSS de repli couvre le premier affichage
    let dispose: (() => void) | undefined;
    let cancelled = false;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const idle = w.requestIdleCallback ? w.requestIdleCallback(() => !cancelled && (dispose = init()), { timeout: 2000 }) : window.setTimeout(() => !cancelled && (dispose = init()), 600);
    return () => {
      cancelled = true;
      if (w.cancelIdleCallback) w.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      dispose?.();
    };
  }, [variant, scale, speed, pal]);

  function init(): (() => void) | undefined {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, depth: false, powerPreference: "low-power", preserveDrawingBuffer: false });
    if (!gl) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = u("uRes");
    const uTime = u("uTime");
    const uPointer = u("uPointer");
    pal.colors.forEach((c, i) => gl.uniform3fv(u(`c${i}`), hex(c)));
    gl.uniform1f(u("uMode"), variant === "night" ? 1 : variant === "sea" ? 2 : 0);

    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const w = Math.max(2, Math.round(r.width * scale));
      const hgt = Math.max(2, Math.round(r.height * scale));
      if (canvas.width !== w || canvas.height !== hgt) {
        canvas.width = w;
        canvas.height = hgt;
        gl.viewport(0, 0, w, hgt);
        gl.uniform2f(uRes, w, hgt);
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let visible = false;
    let raf = 0;
    const t0 = performance.now() - Math.random() * 60000;
    const draw = (now: number) => {
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      gl.uniform1f(uTime, ((now - t0) / 1000) * speed);
      gl.uniform2f(uPointer, pointer.x, pointer.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      draw(now);
      raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    };
    const start = () => {
      if (!raf && visible && !reduce) raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
      if (reduce) draw(performance.now());
      else start();
    });
    io.observe(canvas);
    const onVis = () => start();
    document.addEventListener("visibilitychange", onVis);
    const onMove = (e: PointerEvent) => {
      pointer.tx = e.clientX / window.innerWidth;
      pointer.ty = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    canvas.style.opacity = "1";

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }

  return (
    <div aria-hidden="true" className={cx("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)} style={{ background: pal.fallback }}>
      <canvas ref={ref} className="h-full w-full opacity-0 transition-opacity duration-1000" />
    </div>
  );
}
