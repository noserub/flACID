/**
 * WebGL psychedelic tunnel — forward travel, rainbow wireframe corridor, floating
 * polyhedra & torus rings, EQ/FFT-reactive hues. WebGL canvas only (see PsychedelicVisualizer).
 */

import * as THREE from 'three';
import type { EQBands, VisualizerDrawOptions } from '../types';

export type ThreeTunnelFrameArgs = {
  eq: EQBands;
  time: number;
  dataArray: Uint8Array;
  bufferLength: number;
  beatPulse: number;
  calm: number;
  descent: boolean;
  isPlaying: boolean;
};

export type ThreeTunnelHandle = {
  dispose: () => void;
  setSize: (cssW: number, cssH: number, pixelRatio: number) => void;
  frame: (args: ThreeTunnelFrameArgs) => void;
};

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function disposeMesh(m: THREE.Mesh) {
  m.geometry.dispose();
  const mat = m.material;
  if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
  else mat.dispose();
}

export function createNeonTunnelRenderer(canvas: HTMLCanvasElement): ThreeTunnelHandle {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x0a0218, 1);

  const scene = new THREE.Scene();
  const expFog = new THREE.FogExp2(0x120428, 0.032);
  scene.fog = expFog;
  const clearCol = new THREE.Color();

  const camera = new THREE.PerspectiveCamera(72, 1, 0.06, 260);
  const eyeY = 1.45;
  let camZ = 3.35;
  camera.position.set(0, eyeY, camZ);

  const mainMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color().setHSL(0.55, 0.95, 0.45),
    wireframe: true,
    transparent: true,
    opacity: 0.9,
  });
  const innerMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color().setHSL(0.85, 0.95, 0.55),
    wireframe: true,
    transparent: true,
    opacity: 0.45,
  });

  const segsRadial = 24;
  const segsH = 56;
  const tunnelLen = 140;
  const tunnelMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(5.4, 9.8, tunnelLen, segsRadial, segsH, true),
    mainMat
  );
  tunnelMesh.rotation.x = Math.PI / 2;
  tunnelMesh.position.set(0, eyeY, -48);
  scene.add(tunnelMesh);

  const innerMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(5.0, 9.2, tunnelLen - 3, 18, 40, true),
    innerMat
  );
  innerMesh.rotation.x = Math.PI / 2;
  innerMesh.position.set(0, eyeY, -48);
  scene.add(innerMesh);

  const grid = new THREE.GridHelper(160, 40, 0xff00cc, 0x4400aa);
  grid.position.set(0, 0.02, -52);
  scene.add(grid);

  const railGeo = new THREE.BufferGeometry();
  const railVerts = new Float32Array([
    -1.15, 0.06, 4, -1.15, 0.06, -145, 1.15, 0.06, 4, 1.15, 0.06, -145,
  ]);
  railGeo.setAttribute('position', new THREE.BufferAttribute(railVerts, 3));
  const railMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.75,
  });
  const rails = new THREE.LineSegments(railGeo, railMat);
  scene.add(rails);

  type Floater = {
    mesh: THREE.Mesh;
    spin: THREE.Vector3;
    hueOff: number;
    wobble: number;
    baseX: number;
    baseY: number;
  };
  const floaters: Floater[] = [];
  const makeFloaterMat = () =>
    new THREE.MeshBasicMaterial({
      wireframe: true,
      transparent: true,
      opacity: 0.72,
    });

  const geoms = [
    () => new THREE.IcosahedronGeometry(0.75, 0),
    () => new THREE.OctahedronGeometry(0.68, 0),
    () => new THREE.TetrahedronGeometry(0.82, 0),
    () => new THREE.DodecahedronGeometry(0.62, 0),
    () => new THREE.TorusGeometry(0.5, 0.14, 8, 20),
    () => new THREE.TorusKnotGeometry(0.42, 0.1, 48, 8),
  ];

  const nFloat = 18;
  for (let i = 0; i < nFloat; i++) {
    const geo = geoms[i % geoms.length]();
    const mat = makeFloaterMat();
    const mesh = new THREE.Mesh(geo, mat);
    const a = i * 2.39996322972865332;
    const radius = 1.8 + (i % 4) * 0.55;
    mesh.position.set(
      Math.sin(a) * radius,
      eyeY + Math.cos(a * 1.3) * 1.35 + (i % 3) * 0.25,
      -6 - i * 5.8
    );
    mesh.rotation.set(Math.random() * 0.8, Math.random() * 0.8, Math.random() * 0.8);
    const spin = new THREE.Vector3(
      0.35 + (i % 4) * 0.12,
      0.45 + (i % 5) * 0.1,
      0.28 + (i % 3) * 0.09
    );
    scene.add(mesh);
    floaters.push({
      mesh,
      spin,
      hueOff: frac(i * 0.618033988749895 + 0.17),
      wobble: 0.4 + (i % 7) * 0.11,
      baseX: mesh.position.x,
      baseY: mesh.position.y,
    });
  }

  type RingSlot = { mesh: THREE.Mesh; hueOff: number; speed: number };
  const portalRings: RingSlot[] = [];
  const nRings = 22;
  for (let i = 0; i < nRings; i++) {
    const r = 1.9 + (i % 5) * 0.35 + Math.sin(i * 0.7) * 0.25;
    const geo = new THREE.TorusGeometry(r, 0.035, 8, 40);
    const mat = new THREE.MeshBasicMaterial({
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      Math.sin(i * 0.55) * 0.35,
      eyeY + Math.cos(i * 0.48) * 0.25,
      -2.5 - i * 5.2
    );
    mesh.rotation.x = Math.PI / 2 + (i % 3) * 0.2;
    mesh.rotation.z = i * 0.35;
    scene.add(mesh);
    portalRings.push({
      mesh,
      hueOff: frac(i * 0.273 + 0.41),
      speed: 0.6 + (i % 4) * 0.15,
    });
  }

  let lastW = 0;
  let lastH = 0;
  let lastPr = 0;

  const dispose = () => {
    disposeMesh(tunnelMesh);
    disposeMesh(innerMesh);
    grid.geometry.dispose();
    const gm = grid.material;
    if (Array.isArray(gm)) gm.forEach((m) => m.dispose());
    else (gm as THREE.Material).dispose();
    railGeo.dispose();
    railMat.dispose();
    for (const f of floaters) disposeMesh(f.mesh);
    for (const r of portalRings) disposeMesh(r.mesh);
    renderer.dispose();
  };

  const setSize = (cssW: number, cssH: number, pixelRatio: number) => {
    if (cssW < 2 || cssH < 2) return;
    if (lastW === cssW && lastH === cssH && lastPr === pixelRatio) return;
    lastW = cssW;
    lastH = cssH;
    lastPr = pixelRatio;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(cssW, cssH, false);
    camera.aspect = cssW / cssH;
    camera.updateProjectionMatrix();
  };

  const frame = ({
    eq,
    time,
    dataArray,
    bufferLength,
    beatPulse,
    calm,
    descent,
    isPlaying,
  }: ThreeTunnelFrameArgs) => {
    const t = time * 0.001;
    const energyN = clamp(eq.energy / 255, 0, 1);
    const bassN = clamp(eq.bass / 255, 0, 1);
    const midN = clamp(eq.mid / 255, 0, 1);
    const highN = clamp(eq.high / 255, 0, 1);
    const bl = Math.max(16, bufferLength);
    const bin1 = dataArray[Math.floor(bl * 0.05)] ?? 0;
    const binM = dataArray[Math.floor(bl * 0.32)] ?? 0;
    const binH = dataArray[Math.floor(bl * 0.78)] ?? 0;
    const pk = Math.max(bin1, binM, binH) / 255;

    const intensity = isPlaying
      ? clamp(energyN * 0.52 + bassN * 0.28 + beatPulse * 0.48, 0, 1) * (1 - calm * 0.18)
      : 0.14;

    const travel =
      (descent ? 0.14 : 0.26) + intensity * 0.52 + beatPulse * 0.42 + pk * 0.22;
    camZ -= travel * 0.062;
    if (camZ < -12) camZ += 21;
    if (camZ > 4.4) camZ = 4.4;
    camera.position.z = camZ;
    camera.position.x =
      Math.sin(t * 0.48) * 0.48 * midN +
      Math.sin(t * 0.19 + bassN * 3) * 0.18 +
      beatPulse * 0.08;
    camera.position.y =
      eyeY +
      Math.cos(t * 0.36) * 0.11 * highN +
      Math.sin(t * 0.27) * 0.07 * pk +
      beatPulse * 0.07;
    camera.lookAt(
      Math.sin(t * 0.21) * 0.25 * midN,
      eyeY + Math.cos(t * 0.33) * 0.08,
      -130
    );

    const rainbow = (t * 0.11 + bassN * 0.14 + beatPulse * 0.08) % 1;
    mainMat.color.setHSL(
      frac(rainbow + 0.02),
      0.92 + energyN * 0.06,
      0.38 + energyN * 0.2 + beatPulse * 0.14
    );
    mainMat.opacity = 0.78 + energyN * 0.18 + beatPulse * 0.12;

    innerMat.color.setHSL(
      frac(rainbow + 0.42 + midN * 0.08),
      0.95,
      0.48 + binH / 255 * 0.32 + beatPulse * 0.12
    );
    innerMat.opacity = 0.32 + beatPulse * 0.38 + pk * 0.28 + highN * 0.15;

    tunnelMesh.rotation.z = Math.sin(t * 0.62) * 0.055 * midN + beatPulse * 0.045;
    tunnelMesh.rotation.y = t * 0.04 * (0.4 + highN);
    innerMesh.rotation.z = tunnelMesh.rotation.z * 0.9;
    innerMesh.rotation.y = -t * 0.035 * (0.35 + bassN * 0.4);

    const fogD = 0.024 + (1 - intensity) * 0.02 + descent * 0.014;
    expFog.density = fogD;
    expFog.color.setHSL(frac(t * 0.025 + bassN * 0.06), 0.75, 0.055 + energyN * 0.035);

    const gm = grid.material;
    if (Array.isArray(gm)) {
      gm.forEach((m, idx) => {
        if (m instanceof THREE.LineBasicMaterial) {
          m.color.setHSL(frac(rainbow + idx * 0.33 + midN * 0.1), 0.9, 0.42 + beatPulse * 0.25);
        }
      });
    }
    grid.rotation.y = t * 0.22 + midN * 0.4 + beatPulse * 0.15;
    grid.position.z = -52 + frac(time * 0.024) * 6;

    railMat.opacity = 0.5 + beatPulse * 0.5 + energyN * 0.25;
    railMat.color.setHSL(frac(rainbow + 0.85), 0.85, 0.55 + highN * 0.25);

    clearCol.setHSL(frac(t * 0.04 + bassN * 0.07), 0.62, 0.035 + energyN * 0.045 + beatPulse * 0.03);
    renderer.setClearColor(clearCol, 1);

    const pulse = 1 + beatPulse * 1.2 + pk * 0.8;
    for (let fi = 0; fi < floaters.length; fi++) {
      const f = floaters[fi]!;
      const m = f.mesh;
      m.visible = !descent || fi % 2 === 0;
      const mat = m.material as THREE.MeshBasicMaterial;
      m.rotation.x += f.spin.x * 0.014 * pulse;
      m.rotation.y += f.spin.y * 0.017 * pulse;
      m.rotation.z += f.spin.z * 0.012 * (1 + midN * 0.6);
      const hue = frac(t * 0.14 + f.hueOff + bassN * 0.1 + binM / 255 * 0.15);
      mat.color.setHSL(hue, 0.94, 0.48 + energyN * 0.22 + beatPulse * 0.18);
      mat.opacity = 0.42 + energyN * 0.38 + beatPulse * 0.28 + pk * 0.2;
      const w = f.wobble;
      const wx = Math.sin(t * w + f.hueOff * 10) * 0.22 * (1 + midN);
      const wy = Math.cos(t * w * 1.1) * 0.18 * (1 + highN);
      m.position.x = f.baseX + wx;
      m.position.y = f.baseY + wy;
    }

    for (let ri = 0; ri < portalRings.length; ri++) {
      const pr = portalRings[ri]!;
      pr.mesh.visible = !descent || ri % 2 === 0;
      const m = pr.mesh;
      const mat = m.material as THREE.MeshBasicMaterial;
      m.rotation.z += 0.011 * pr.speed * (1 + beatPulse + midN * 0.5);
      m.rotation.y += 0.008 * pr.speed * (1 + highN * 0.6);
      const hue = frac(t * 0.12 + pr.hueOff + rainbow * 0.5 + pk * 0.12);
      mat.color.setHSL(hue, 0.92, 0.5 + beatPulse * 0.2);
      mat.opacity = 0.38 + energyN * 0.35 + beatPulse * 0.3;
    }

    renderer.render(scene, camera);
  };

  return { dispose, setSize, frame };
}

function frac(x: number) {
  return x - Math.floor(x);
}

/** Stub — real rendering uses WebGL path in PsychedelicVisualizer. */
export function drawThreeNeonTunnelStub(
  _ctx: CanvasRenderingContext2D,
  _w: number,
  _h: number,
  _data: Uint8Array,
  _eq: EQBands,
  _time: number,
  _buf: number,
  _opt?: VisualizerDrawOptions
): void {}
