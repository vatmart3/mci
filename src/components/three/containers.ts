/**
 * Les 6 contenants MCI, modélisés en code (lathe / extrude / tube) — aucun modèle téléchargé.
 * Chaque constructeur renvoie un THREE.Group centré sur l'axe Y, pied à y = 0.
 * Matières : PEHD blanc cassé, bouchons bleu MCI, aérosol en métal brossé.
 */
import * as THREE from "three";
import type { ContainerKind } from "@/lib/types";
import { makeLabelTexture, type LabelInput } from "./label";

export type LabelSpec = Omit<LabelInput, "aspect" | "wrap">;

/** Échelle relative entre contenants (un jerrican 20 L est plus gros qu'un aérosol) */
export const containerScale: Record<ContainerKind, number> = {
  aerosol: 0.82,
  spray: 0.9,
  can5: 1.05,
  jerrican20: 1.28,
  bucket: 1.08,
  cartridge: 0.78,
};

interface Mats {
  plastic: THREE.MeshStandardMaterial;
  cap: THREE.MeshStandardMaterial;
  metal: THREE.MeshStandardMaterial;
  dark: THREE.MeshStandardMaterial;
  capDark: THREE.MeshStandardMaterial;
}

let shared: Mats | null = null;
function mats(): Mats {
  if (shared) return shared;
  shared = {
    // PEHD blanc cassé, légèrement satiné
    plastic: new THREE.MeshPhysicalMaterial({ color: "#EFECE3", roughness: 0.48, metalness: 0, clearcoat: 0.25, clearcoatRoughness: 0.6, sheen: 0.3, sheenColor: new THREE.Color("#ffffff") }),
    cap: new THREE.MeshStandardMaterial({ color: "#206996", roughness: 0.32, metalness: 0.05 }),
    // métal brossé
    metal: new THREE.MeshStandardMaterial({ color: "#D3D8DC", roughness: 0.36, metalness: 0.85 }),
    dark: new THREE.MeshStandardMaterial({ color: "#8E979E", roughness: 0.4, metalness: 0.8 }),
    capDark: new THREE.MeshStandardMaterial({ color: "#1B5A80", roughness: 0.4 }),
  };
  return shared;
}

function labelMaterial(spec: LabelSpec | null, aspect: number, wrap: boolean) {
  if (!spec) return new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.6 });
  const map = makeLabelTexture({ ...spec, aspect, wrap });
  return new THREE.MeshStandardMaterial({ map, roughness: 0.55, metalness: 0 });
}

function lathe(points: [number, number][], segments: number) {
  return new THREE.LatheGeometry(
    points.map(([x, y]) => new THREE.Vector2(x, y)),
    segments,
  );
}

function roundedRect(w: number, d: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -d / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + d - r);
  s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  s.lineTo(x + r, y + d);
  s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function box(w: number, h: number, d: number, bevel: number, radius: number, segments = 4) {
  const g = new THREE.ExtrudeGeometry(roundedRect(w, d, radius), {
    depth: h - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: segments,
    curveSegments: segments * 2,
  });
  g.rotateX(-Math.PI / 2);
  g.translate(0, bevel, 0);
  return g;
}

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, shadows: boolean) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = shadows;
  m.receiveShadow = false;
  return m;
}

function cap(r: number, h: number, seg: number, shadows: boolean) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(r, r, h, seg), mats().cap, shadows));
  // stries
  g.add(mesh(new THREE.CylinderGeometry(r * 1.02, r * 1.02, h * 0.7, seg, 1, true), mats().capDark, shadows));
  return g;
}

export interface BuiltContainer {
  group: THREE.Group;
  height: number;
  dispose: () => void;
}

export function buildContainer(kind: ContainerKind, label: LabelSpec | null, opts: { quality?: "low" | "high"; shadows?: boolean } = {}): BuiltContainer {
  const seg = opts.quality === "low" ? 28 : 56;
  const sh = !!opts.shadows;
  const M = mats();
  const g = new THREE.Group();
  const owned: THREE.BufferGeometry[] = [];
  const ownedMats: THREE.Material[] = [];
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, pos?: [number, number, number], rot?: [number, number, number]) => {
    owned.push(geo);
    const m = mesh(geo, mat, sh);
    if (pos) m.position.set(...pos);
    if (rot) m.rotation.set(...rot);
    g.add(m);
    return m;
  };
  let height = 1.6;

  switch (kind) {
    case "aerosol": {
      const r = 0.33;
      add(
        lathe(
          [
            [0, 0],
            [r - 0.04, 0],
            [r, 0.05],
            [r, 1.24],
            [r - 0.03, 1.33],
            [0.22, 1.43],
            [0.13, 1.48],
            [0.13, 1.52],
            [0, 1.52],
          ],
          seg,
        ),
        M.metal,
      );
      // bourrelet de fond
      add(new THREE.TorusGeometry(r - 0.02, 0.02, 8, seg), M.dark, [0, 0.03, 0], [Math.PI / 2, 0, 0]);
      // étiquette enveloppante
      const lh = 1.04;
      const lm = labelMaterial(label, (2 * Math.PI * r) / lh, true);
      ownedMats.push(lm);
      add(new THREE.CylinderGeometry(r + 0.003, r + 0.003, lh, seg, 1, true, Math.PI, Math.PI * 2), lm, [0, 0.14 + lh / 2, 0]);
      // capot bleu
      add(
        lathe(
          [
            [0, 1.72],
            [0.24, 1.72],
            [0.3, 1.66],
            [0.315, 1.36],
            [0, 1.36],
          ],
          seg,
        ),
        M.cap,
      );
      height = 1.72;
      break;
    }
    case "spray": {
      const r = 0.31;
      add(
        lathe(
          [
            [0, 0],
            [r - 0.05, 0],
            [r, 0.05],
            [r, 0.2],
            [r, 0.98],
            [r - 0.03, 1.12],
            [0.2, 1.24],
            [0.12, 1.3],
            [0.12, 1.4],
            [0, 1.4],
          ],
          seg,
        ),
        M.plastic,
      );
      const lh = 0.7;
      const theta = 2.0;
      const lm = labelMaterial(label, ((r + 0.003) * theta) / lh, false);
      ownedMats.push(lm);
      add(new THREE.CylinderGeometry(r + 0.003, r + 0.003, lh, seg, 1, true, -theta / 2, theta), lm, [0, 0.18 + lh / 2, 0]);
      // tête gâchette, buse orientée vers la droite
      const head = new THREE.Group();
      head.rotation.y = Math.PI / 2;
      head.position.set(0, 0, 0);
      const hadd = (geo: THREE.BufferGeometry, pos: [number, number, number], rot?: [number, number, number]) => {
        owned.push(geo);
        const m = mesh(geo, M.cap, sh);
        m.position.set(...pos);
        if (rot) m.rotation.set(...rot);
        head.add(m);
      };
      hadd(new THREE.CylinderGeometry(0.14, 0.14, 0.1, seg), [0, 1.43, 0]);
      hadd(box(0.22, 0.28, 0.3, 0.03, 0.06, 2), [0, 1.47, 0.0]);
      hadd(box(0.11, 0.09, 0.3, 0.02, 0.035, 2), [0, 1.62, 0.22]);
      hadd(box(0.08, 0.26, 0.06, 0.015, 0.02, 2), [0, 1.3, 0.22], [0.28, 0, 0]);
      g.add(head);
      height = 1.76;
      break;
    }
    case "can5": {
      const w = 1.0;
      const d = 0.62;
      const h = 1.22;
      add(box(w, h, d, 0.07, 0.12), M.plastic);
      // épaulement
      add(box(w * 0.92, 0.08, d * 0.9, 0.03, 0.1, 2), M.plastic, [0, h - 0.02, 0]);
      // poignée
      const path = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.38, h, -0.08),
        new THREE.Vector3(-0.34, h + 0.2, -0.08),
        new THREE.Vector3(-0.08, h + 0.22, -0.08),
        new THREE.Vector3(0.06, h + 0.2, -0.08),
        new THREE.Vector3(0.1, h, -0.08),
      ]);
      add(new THREE.TubeGeometry(path, 24, 0.055, 10, false), M.plastic);
      // goulot + bouchon
      add(new THREE.CylinderGeometry(0.1, 0.11, 0.08, seg), M.plastic, [0.3, h + 0.06, 0.12]);
      const c = cap(0.12, 0.14, seg, sh);
      c.position.set(0.3, h + 0.16, 0.12);
      g.add(c);
      const lw = 0.82;
      const lh = 0.72;
      const lm = labelMaterial(label, lw / lh, false);
      ownedMats.push(lm);
      add(new THREE.PlaneGeometry(lw, lh), lm, [0, 0.12 + lh / 2 + 0.06, d / 2 + 0.071]);
      height = h + 0.24;
      break;
    }
    case "jerrican20": {
      const w = 1.12;
      const d = 0.78;
      const h = 1.5;
      add(box(w, h, d, 0.08, 0.14), M.plastic);
      // nervures latérales
      for (const y of [0.35, 0.75, 1.15]) add(box(0.04, 0.26, d * 0.8, 0.01, 0.01, 1), M.plastic, [-w / 2 - 0.005, y, 0]);
      // poignée intégrée
      const path = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.46, h - 0.02, 0),
        new THREE.Vector3(-0.44, h + 0.22, 0),
        new THREE.Vector3(-0.1, h + 0.24, 0),
        new THREE.Vector3(0.08, h + 0.22, 0),
        new THREE.Vector3(0.1, h - 0.02, 0),
      ]);
      add(new THREE.TubeGeometry(path, 24, 0.075, 10, false), M.plastic);
      add(new THREE.CylinderGeometry(0.12, 0.13, 0.1, seg), M.plastic, [0.34, h + 0.06, 0.18]);
      const c = cap(0.145, 0.16, seg, sh);
      c.position.set(0.34, h + 0.18, 0.18);
      g.add(c);
      const lw = 0.92;
      const lh = 0.86;
      const lm = labelMaterial(label, lw / lh, false);
      ownedMats.push(lm);
      add(new THREE.PlaneGeometry(lw, lh), lm, [0, 0.2 + lh / 2, d / 2 + 0.081]);
      height = h + 0.3;
      break;
    }
    case "bucket": {
      const rb = 0.5;
      const rt = 0.6;
      const h = 1.1;
      add(
        lathe(
          [
            [0, 0.02],
            [rb - 0.03, 0.02],
            [rb, 0.05],
            [rt, h],
            [rt + 0.04, h + 0.02],
            [rt + 0.04, h - 0.06],
            [rt - 0.005, h - 0.08],
          ],
          seg,
        ),
        M.plastic,
      );
      // couvercle bleu
      add(
        lathe(
          [
            [0, h + 0.1],
            [rt - 0.08, h + 0.1],
            [rt - 0.06, h + 0.06],
            [rt + 0.06, h + 0.06],
            [rt + 0.07, h - 0.02],
            [rt + 0.05, h - 0.02],
            [rt + 0.05, h + 0.02],
            [0, h + 0.02],
          ],
          seg,
        ),
        M.cap,
      );
      // anse métallique
      const handle = new THREE.TorusGeometry(rt + 0.07, 0.014, 8, 48, Math.PI);
      add(handle, M.dark, [0, h - 0.12, -0.05], [-0.35, 0, 0]);
      const lh = 0.66;
      const theta = 2.2;
      const ly = 0.2 + lh / 2;
      const rAt = (y: number) => rb + ((rt - rb) * (y - 0.05)) / (h - 0.05) + 0.004;
      const lm = labelMaterial(label, (((rAt(ly) + 0) * theta) / lh) * 1, false);
      ownedMats.push(lm);
      add(new THREE.CylinderGeometry(rAt(ly + lh / 2), rAt(ly - lh / 2), lh, seg, 1, true, -theta / 2, theta), lm, [0, ly, 0]);
      height = h + 0.12;
      break;
    }
    case "cartridge": {
      const r = 0.2;
      const h = 1.36;
      add(new THREE.CylinderGeometry(r, r, h, seg), M.plastic, [0, h / 2 + 0.04, 0]);
      add(new THREE.CylinderGeometry(r * 0.92, r * 0.92, 0.04, seg), M.dark, [0, 0.02, 0]);
      // épaule + buse bleue
      add(
        lathe(
          [
            [0, h + 0.04],
            [r, h + 0.04],
            [r * 0.5, h + 0.14],
            [0.05, h + 0.46],
            [0.02, h + 0.5],
            [0, h + 0.5],
          ],
          seg,
        ),
        M.cap,
      );
      const lh = 1.1;
      const lm = labelMaterial(label, (2 * Math.PI * r) / lh, true);
      ownedMats.push(lm);
      add(new THREE.CylinderGeometry(r + 0.003, r + 0.003, lh, seg, 1, true, Math.PI, Math.PI * 2), lm, [0, 0.16 + lh / 2, 0]);
      height = h + 0.5;
      break;
    }
  }

  return {
    group: g,
    height,
    dispose: () => {
      owned.forEach((o) => o.dispose());
      ownedMats.forEach((m) => m.dispose());
      g.traverse((o) => {
        if (o instanceof THREE.Mesh && !owned.includes(o.geometry)) o.geometry.dispose();
      });
    },
  };
}
