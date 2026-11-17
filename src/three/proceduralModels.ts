import * as THREE from 'three';
import { createClockFaceTexture } from './proceduralTextures';

export type AnimalNpcSpecies = 'rabbit' | 'dog' | 'cat' | 'bear' | 'mouse';

// Shared soft circular/rounded contact shadow
function createContactShadow(size = 1.4): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 28);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.42)');
  grad.addColorStop(0.7, 'rgba(15, 23, 42, 0.18)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;

  const geo = new THREE.PlaneGeometry(size * 1.9, size * 1.9);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.032;
  mesh.renderOrder = 1;
  return mesh;
}

// Helper: create a crisp framed window assembly (frame + sill + recessed glowing pane)
function createFramedWindow(
  w: number,
  h: number,
  frameColor = 0xf8fafc,
  glassColor = 0x7dd3fc,
  emissiveColor = 0x38bdf8,
  emissiveIntensity = 0.25
): THREE.Group {
  const wg = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({ color: frameColor, roughness: 0.55 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: glassColor,
    roughness: 0.08,
    metalness: 0.85,
    emissive: emissiveColor,
    emissiveIntensity,
  });

  const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.08, h + 0.08, 0.05), frameMat);
  wg.add(frame);

  const pane = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.065), glassMat);
  wg.add(pane);

  const mullionV = new THREE.Mesh(new THREE.BoxGeometry(0.028, h, 0.075), frameMat);
  wg.add(mullionV);
  const mullionH = new THREE.Mesh(new THREE.BoxGeometry(w, 0.028, 0.075), frameMat);
  wg.add(mullionH);

  const sill = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, 0.045, 0.09), frameMat);
  sill.position.set(0, -h / 2 - 0.03, 0.02);
  wg.add(sill);

  return wg;
}

// Helper: create detailed cylindrical wheel with rubber tire + metallic alloy rim + lug hub
function createDetailedWheel(radius = 0.2, width = 0.16, rimColor = 0xd4d4d8): THREE.Group {
  const wg = new THREE.Group();
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.88, metalness: 0.05 });
  const rimMat = new THREE.MeshStandardMaterial({ color: rimColor, roughness: 0.22, metalness: 0.85 });
  const capMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.35, metalness: 0.6 });

  const tire = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, width, 16), tireMat);
  tire.rotation.z = Math.PI / 2;
  tire.castShadow = true;
  wg.add(tire);

  const rim = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.58, radius * 0.58, width + 0.015, 14), rimMat);
  rim.rotation.z = Math.PI / 2;
  wg.add(rim);

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.22, radius * 0.22, width + 0.028, 10), capMat);
  hub.rotation.z = Math.PI / 2;
  wg.add(hub);

  wg.userData = { isWheel: true };
  return wg;
}

// ==========================================
// 1. 地鐵站 Metro Kiosk (Refined Curved Glass Canopy & Roundel)
// ==========================================
export function createMetroKiosk(): THREE.Group {
  const group = new THREE.Group();
  const shadow = createContactShadow(1.65);
  shadow.scale.set(1.25, 0.72, 1.0);
  group.add(shadow);

  const graniteMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.82 });
  const darkStoneMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.88 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.72, roughness: 0.28 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.22 });

  // Two-tier platform plinth tailored cleanly to 2x1 footprint (<= 3.24m x 1.56m)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.36, 0.18, 1.44), graniteMat);
  plinth.position.y = 0.09;
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  group.add(plinth);

  const upperPlinth = new THREE.Mesh(new THREE.BoxGeometry(2.08, 0.14, 1.24), darkStoneMat);
  upperPlinth.position.y = 0.25;
  group.add(upperPlinth);

  // Descending tiled steps into the Underground
  const voidMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.42, 0.12, 0.86),
    new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.95 })
  );
  voidMesh.position.set(0, 0.28, 0.02);
  group.add(voidMesh);

  for (let s = 0; s < 3; s++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(1.34, 0.05, 0.16), graniteMat);
    step.position.set(0, 0.31 - s * 0.045, 0.38 - s * 0.15);
    group.add(step);
  }

  // Cylindrical iron corner columns with ornamental caps & brass rings
  [[-0.88, -0.52], [0.88, -0.52], [-0.88, 0.52], [0.88, 0.52]].forEach(([px, pz]) => {
    const colBase = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.16, 12), ironMat);
    colBase.position.set(px, 0.4, pz);
    group.add(colBase);

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 1.18, 12), ironMat);
    post.position.set(px, 1.0, pz);
    post.castShadow = true;
    group.add(post);

    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 12), brassMat);
    collar.position.set(px, 1.54, pz);
    group.add(collar);
  });

  // Curved glass barrel-vault canopy
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    metalness: 0.18,
    roughness: 0.08,
    transparent: true,
    opacity: 0.72,
    side: THREE.DoubleSide,
  });
  const canopyGeo = new THREE.CylinderGeometry(0.66, 0.66, 1.9, 16, 1, true, -Math.PI * 0.42, Math.PI * 0.84);
  canopyGeo.rotateZ(Math.PI / 2);
  canopyGeo.rotateY(Math.PI / 2);
  const canopy = new THREE.Mesh(canopyGeo, glassMat);
  canopy.position.set(0, 1.32, 0);
  canopy.scale.set(1.0, 0.68, 1.0);
  group.add(canopy);

  // Iron structural arch ribs along canopy
  [-0.52, 0, 0.52].forEach(rz => {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.032, 8, 20, Math.PI * 0.85), ironMat);
    arch.position.set(0, 1.36, rz);
    arch.rotation.z = Math.PI * 0.075;
    arch.scale.set(1.0, 0.64, 1.0);
    group.add(arch);
  });

  // Classic Circular London Underground Roundel Post (positioned strictly inside 2x1 bounds)
  const signPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.055, 1.95, 10),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.25 })
  );
  signPole.position.set(1.28, 0.98, 0.48);
  signPole.castShadow = true;
  group.add(signPole);

  const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.35 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.3 });

  const roundelGroup = new THREE.Group();
  roundelGroup.position.set(1.28, 1.95, 0.48);
  const redRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.065, 10, 24), redMat);
  roundelGroup.add(redRing);
  const innerDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 18), whiteMat);
  innerDisc.rotation.x = Math.PI / 2;
  roundelGroup.add(innerDisc);
  const blueBar = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.14, 0.11), blueMat);
  roundelGroup.add(blueBar);
  group.add(roundelGroup);

  return group;
}

// ==========================================
// 2. 梅菲爾飯店 May Fair Hotel (Refined Edwardian Facade & Canopy)
// ==========================================
export function createMayfairHotel(): THREE.Group {
  const group = new THREE.Group();
  group.add(createContactShadow(2.4));

  const creamMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.72 });
  const brickMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.84 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.65 });
  const slateRoofMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.65, metalness: 0.2 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.22, metalness: 0.88 });

  // Stone rustication ground floor + steps
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.85, 0.65, 2.42), creamMat);
  base.position.y = 0.325;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const frontStep = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.1, 0.35), trimMat);
  frontStep.position.set(0, 0.05, 1.32);
  group.add(frontStep);

  // Main upper red-terracotta hotel facade
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.64, 2.35, 2.22), brickMat);
  body.position.y = 1.825;
  body.castShadow = true;
  group.add(body);

  // Horizontal stone stringcourses between floors
  [1.32, 2.08, 3.0].forEach(sy => {
    const course = new THREE.Mesh(new THREE.BoxGeometry(2.74, 0.09, 2.32), trimMat);
    course.position.y = sy;
    group.add(course);
  });

  // Corner quoins positioned strictly between horizontal stone stringcourses (1.32, 2.08, 3.0)
  [[-1.33, -1.12], [1.33, -1.12], [-1.33, 1.12], [1.33, 1.12]].forEach(([qx, qz]) => {
    [0.92, 1.7, 2.54].forEach(qy => {
      const q = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.34, 0.18), creamMat);
      q.position.set(qx, qy, qz);
      group.add(q);
    });
  });

  // Revolving glass entrance doors + brass frame
  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.72, 0.1), goldMat);
  doorFrame.position.set(0, 0.44, 1.2);
  group.add(doorFrame);
  const doorGlass = new THREE.Mesh(
    new THREE.BoxGeometry(0.76, 0.6, 0.12),
    new THREE.MeshStandardMaterial({ color: 0xfde68a, emissive: 0xf59e0b, emissiveIntensity: 0.45, roughness: 0.15 })
  );
  doorGlass.position.set(0, 0.42, 1.2);
  group.add(doorGlass);

  // Crimson velvet entrance marquee awning with gold trim & brass pillars (strictly inside 2x2 footprint)
  const awningMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.55 });
  const awning = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.14, 0.48), awningMat);
  awning.position.set(0, 0.92, 1.32);
  awning.castShadow = true;
  group.add(awning);
  const awningCrown = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 0.52), goldMat);
  awningCrown.position.set(0, 1.0, 1.32);
  group.add(awningCrown);

  [-0.58, 0.58].forEach(px => {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.88, 8), goldMat);
    rod.position.set(px, 0.46, 1.5);
    group.add(rod);
  });

  // Framed windows with mullions & sills (front & side)
  [-0.78, 0, 0.78].forEach(wx => {
    [1.66, 2.48].forEach(wy => {
      const win = createFramedWindow(0.36, 0.46, 0xf8fafc, 0xbae6fd, 0xfef08a, 0.35);
      win.position.set(wx, wy, 1.12);
      group.add(win);
    });
  });
  [-0.52, 0.52].forEach(wz => {
    [1.66, 2.48].forEach(wy => {
      const winR = createFramedWindow(0.36, 0.46, 0xf8fafc, 0xbae6fd, 0xfef08a, 0.3);
      winR.rotation.y = Math.PI / 2;
      winR.position.set(1.33, wy, wz);
      group.add(winR);

      const winL = createFramedWindow(0.36, 0.46, 0xf8fafc, 0xbae6fd, 0xfef08a, 0.3);
      winL.rotation.y = -Math.PI / 2;
      winL.position.set(-1.33, wy, wz);
      group.add(winL);
    });
  });

  // Mansard slate roof + twin chimneys with chimney pots
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.88, 0.55, 4), slateRoofMat);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 3.32;
  roof.scale.set(1.06, 1.0, 0.9);
  roof.castShadow = true;
  group.add(roof);

  const chimMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.88 });
  [-0.82, 0.82].forEach(cx => {
    const chim = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 0.3), chimMat);
    chim.position.set(cx, 3.62, 0);
    group.add(chim);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.16, 8), creamMat);
    pot.position.set(cx, 3.98, 0);
    group.add(pot);
  });

  // Golden hotel crest signboard
  const signPlate = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.2, 0.08), goldMat);
  signPlate.position.set(0, 1.18, 1.15);
  group.add(signPlate);

  return group;
}

// ==========================================
// 3. 大笨鐘 Big Ben (Refined Gothic Clock Tower & Spire)
// ==========================================
export function createBigBen(): THREE.Group {
  const group = new THREE.Group();
  group.add(createContactShadow(2.3));

  const plinthMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.8 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xdccbb8, roughness: 0.78 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xb89f82, roughness: 0.72 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.9 });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0x1e5f58, roughness: 0.42, metalness: 0.35 });

  // Two-step stone podium plinth
  const plinth1 = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.35, 2.35), plinthMat);
  plinth1.position.y = 0.175;
  plinth1.castShadow = true;
  group.add(plinth1);
  const plinth2 = new THREE.Mesh(new THREE.BoxGeometry(2.02, 0.4, 2.02), trimMat);
  plinth2.position.y = 0.55;
  group.add(plinth2);

  // Main Gothic stone shaft
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(1.56, 3.9, 1.56), stoneMat);
  shaft.position.y = 2.7;
  shaft.castShadow = true;
  group.add(shaft);

  // Corner buttresses terminating cleanly at the cantilevered gallery underside (y = 4.60)
  [[-0.82, -0.82], [0.82, -0.82], [-0.82, 0.82], [0.82, 0.82]].forEach(([bx, bz]) => {
    const buttress = new THREE.Mesh(new THREE.BoxGeometry(0.22, 3.85, 0.22), trimMat);
    buttress.position.set(bx, 2.675, bz);
    group.add(buttress);
  });

  // Recessed Gothic lancet slit windows along the shaft
  const lancetMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    emissive: 0xfef08a,
    emissiveIntensity: 0.2,
    roughness: 0.4,
  });
  [-0.36, 0, 0.36].forEach(ox => {
    const fSlit = new THREE.Mesh(new THREE.BoxGeometry(0.11, 2.8, 0.05), lancetMat);
    fSlit.position.set(ox, 2.75, 0.79);
    group.add(fSlit);
    const bSlit = new THREE.Mesh(new THREE.BoxGeometry(0.11, 2.8, 0.05), lancetMat);
    bSlit.position.set(ox, 2.75, -0.79);
    group.add(bSlit);
    const rSlit = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.8, 0.11), lancetMat);
    rSlit.position.set(0.79, 2.75, ox);
    group.add(rSlit);
    const lSlit = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.8, 0.11), lancetMat);
    lSlit.position.set(-0.79, 2.75, ox);
    group.add(lSlit);
  });

  // Cantilevered clock stage + gilded gallery band + outer corner pinnacles clear of clockBox
  const gallery = new THREE.Mesh(new THREE.BoxGeometry(2.14, 0.16, 2.14), goldMat);
  gallery.position.y = 4.68;
  group.add(gallery);

  [[-0.96, -0.96], [0.96, -0.96], [-0.96, 0.96], [0.96, 0.96]].forEach(([px, pz]) => {
    const pinnacle = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.36, 4), goldMat);
    pinnacle.rotation.y = Math.PI / 4;
    pinnacle.position.set(px, 4.94, pz);
    group.add(pinnacle);
  });

  const clockBox = new THREE.Mesh(new THREE.BoxGeometry(1.88, 1.56, 1.88), stoneMat);
  clockBox.position.y = 5.52;
  clockBox.castShadow = true;
  group.add(clockBox);

  // 4 Illuminated Clock Dials with Golden Bezels (offset slightly outward to avoid Z-fighting)
  const clockTex = createClockFaceTexture();
  const dialMat = new THREE.MeshStandardMaterial({
    map: clockTex,
    emissive: 0xfef9c3,
    emissiveMap: clockTex,
    emissiveIntensity: 0.45,
    roughness: 0.3,
  });
  const dialGeo = new THREE.CircleGeometry(0.62, 24);
  const bezelGeo = new THREE.TorusGeometry(0.65, 0.055, 10, 24);

  const dialConfigs: Array<{ dialPos: [number, number, number]; bezelPos: [number, number, number]; rotY: number }> = [
    { dialPos: [0, 5.52, 0.964], bezelPos: [0, 5.52, 0.955], rotY: 0 },
    { dialPos: [0, 5.52, -0.964], bezelPos: [0, 5.52, -0.955], rotY: Math.PI },
    { dialPos: [0.964, 5.52, 0], bezelPos: [0.955, 5.52, 0], rotY: Math.PI / 2 },
    { dialPos: [-0.964, 5.52, 0], bezelPos: [-0.955, 5.52, 0], rotY: -Math.PI / 2 },
  ];
  dialConfigs.forEach(dc => {
    const dial = new THREE.Mesh(dialGeo, dialMat);
    dial.position.set(...dc.dialPos);
    dial.rotation.y = dc.rotY;
    group.add(dial);

    const bezel = new THREE.Mesh(bezelGeo, goldMat);
    bezel.position.set(...dc.bezelPos);
    bezel.rotation.y = dc.rotY;
    group.add(bezel);
  });

  // Ornate Belfry Lantern Stage
  const belfryBase = new THREE.Mesh(new THREE.BoxGeometry(1.94, 0.14, 1.94), goldMat);
  belfryBase.position.y = 6.35;
  group.add(belfryBase);

  const belfry = new THREE.Mesh(
    new THREE.BoxGeometry(1.46, 0.72, 1.46),
    new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.55, metalness: 0.35 })
  );
  belfry.position.y = 6.76;
  group.add(belfry);

  // Tapered Gothic Copper Spire
  const lowerRoof = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 1.15, 0.65, 4), copperMat);
  lowerRoof.rotation.y = Math.PI / 4;
  lowerRoof.position.y = 7.44;
  lowerRoof.castShadow = true;
  group.add(lowerRoof);

  const crownBand = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.16, 1.06), goldMat);
  crownBand.position.y = 7.82;
  group.add(crownBand);

  const upperSpire = new THREE.Mesh(new THREE.ConeGeometry(0.68, 1.45, 4), copperMat);
  upperSpire.rotation.y = Math.PI / 4;
  upperSpire.position.y = 8.62;
  upperSpire.castShadow = true;
  group.add(upperSpire);

  const finialBall = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), goldMat);
  finialBall.position.y = 9.42;
  group.add(finialBall);

  const spireNeedle = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.45, 8), goldMat);
  spireNeedle.position.y = 9.68;
  group.add(spireNeedle);

  return group;
}

// ==========================================
// 4. 雙層紅巴士 London Double-Decker Red Bus
// ==========================================
export function createRedBus(): THREE.Group {
  const group = new THREE.Group();
  group.add(createContactShadow(2.2));

  // Cylindrical wheels
  [[-0.64, -0.82], [0.64, -0.82], [-0.64, 0.82], [0.64, 0.82]].forEach(([wx, wz]) => {
    const w = createDetailedWheel(0.22, 0.16, 0xcbd5e1);
    w.position.set(wx, 0.22, wz);
    group.add(w);
  });

  const chassisMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.75 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.32, metalness: 0.15 });
  const creamStripeMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.4 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.08, metalness: 0.88 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.9 });

  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.16, 2.66), chassisMat);
  chassis.position.y = 0.28;
  group.add(chassis);

  // Front & rear chrome bumpers
  const fBumper = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.1, 0.1), chromeMat);
  fBumper.position.set(0, 0.26, 1.36);
  group.add(fBumper);
  const rBumper = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.1, 0.1), chromeMat);
  rBumper.position.set(0, 0.26, -1.36);
  group.add(rBumper);

  // Lower & Upper Decks
  const lowerDeck = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.8, 2.62), redMat);
  lowerDeck.position.y = 0.76;
  lowerDeck.castShadow = true;
  group.add(lowerDeck);

  const beltStripe = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.08, 2.64), creamStripeMat);
  beltStripe.position.y = 1.18;
  group.add(beltStripe);

  const upperDeck = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.74, 2.54), redMat);
  upperDeck.position.y = 1.56;
  upperDeck.castShadow = true;
  group.add(upperDeck);

  // Curved Routemaster-inspired Roof Cap
  const roofCap = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.1, 2.44), redMat);
  roofCap.position.y = 1.98;
  group.add(roofCap);

  // Individual Side Windows with pillars
  [-0.85, -0.28, 0.28, 0.85].forEach(wz => {
    const winLower = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.3, 0.42), glassMat);
    winLower.position.set(0, 0.9, wz);
    group.add(winLower);

    const winUpper = new THREE.Mesh(new THREE.BoxGeometry(1.23, 0.32, 0.42), glassMat);
    winUpper.position.set(0, 1.62, wz);
    group.add(winUpper);
  });

  // Front windshields & illuminated route board
  const winFrontL = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.34, 0.06), glassMat);
  winFrontL.position.set(0, 0.92, 1.31);
  group.add(winFrontL);
  const winFrontU = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.34, 0.06), glassMat);
  winFrontU.position.set(0, 1.64, 1.27);
  group.add(winFrontU);

  const routeBoard = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.12, 0.06),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 0.9 })
  );
  routeBoard.position.set(0, 1.24, 1.3);
  group.add(routeBoard);

  // Radiator grille + headlights + taillights
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.05), chromeMat);
  grille.position.set(0, 0.5, 1.32);
  group.add(grille);

  const lightMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 1.0 });
  [-0.42, 0.42].forEach(lx => {
    const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 12), lightMat);
    hl.rotation.x = Math.PI / 2;
    hl.position.set(lx, 0.48, 1.32);
    group.add(hl);
  });

  const tailMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.9 });
  [-0.44, 0.44].forEach(tx => {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.05), tailMat);
    tl.position.set(tx, 0.48, -1.32);
    group.add(tl);
  });

  return group;
}

// ==========================================
// 5. 計程車 London Black Taxi (Refined TX4 Cab)
// ==========================================
export function createTaxi(): THREE.Group {
  const group = new THREE.Group();
  group.add(createContactShadow(1.35));

  const cabGroup = new THREE.Group();
  cabGroup.scale.setScalar(0.75); // Fits cleanly inside 1x1 grid tile (<= 1.54m) without clipping neighbors
  group.add(cabGroup);

  [[-0.53, -0.64], [0.53, -0.64], [-0.53, 0.64], [0.53, 0.64]].forEach(([wx, wz]) => {
    const w = createDetailedWheel(0.18, 0.14, 0xd4d4d8);
    w.position.set(wx, 0.18, wz);
    cabGroup.add(w);
  });

  const blackMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.28, metalness: 0.45 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.18, metalness: 0.9 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.08, metalness: 0.88 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.38, 1.92), blackMat);
  body.position.y = 0.4;
  body.castShadow = true;
  cabGroup.add(body);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.44, 1.12), blackMat);
  cabin.position.set(0, 0.78, -0.14);
  cabin.castShadow = true;
  cabGroup.add(cabin);

  const winSide = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.26, 0.92), glassMat);
  winSide.position.set(0, 0.8, -0.14);
  cabGroup.add(winSide);

  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.3, 0.06), glassMat);
  windshield.position.set(0, 0.78, 0.42);
  windshield.rotation.x = -0.35;
  cabGroup.add(windshield);

  // Chrome classic radiator grille & bumpers
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.24, 0.06), chromeMat);
  grille.position.set(0, 0.42, 0.96);
  cabGroup.add(grille);

  const fBumper = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.08, 0.09), chromeMat);
  fBumper.position.set(0, 0.25, 0.98);
  cabGroup.add(fBumper);

  // Glowing Amber TAXI Sign
  const taxiSign = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 0.11, 0.14),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 1.1 })
  );
  taxiSign.position.set(0, 1.05, 0.26);
  cabGroup.add(taxiSign);

  const lightMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 1.0 });
  [-0.36, 0.36].forEach(lx => {
    const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 10), lightMat);
    hl.rotation.x = Math.PI / 2;
    hl.position.set(lx, 0.44, 0.96);
    cabGroup.add(hl);
  });

  return group;
}

// ==========================================
// 6. 外送機車 Delivery Courier Scooter
// ==========================================
export function createDeliveryScooter(): THREE.Group {
  const group = new THREE.Group();
  group.add(createContactShadow(1.2));

  const fWheel = createDetailedWheel(0.16, 0.1, 0xe2e8f0);
  fWheel.position.set(0, 0.16, 0.5);
  group.add(fWheel);
  const rWheel = createDetailedWheel(0.16, 0.1, 0xe2e8f0);
  rWheel.position.set(0, 0.16, -0.48);
  group.add(rWheel);

  const scooterMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.35, metalness: 0.2 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 0.96), scooterMat);
  body.position.y = 0.28;
  body.castShadow = true;
  group.add(body);

  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.1, 0.38), darkMat);
  seat.position.set(0, 0.43, -0.05);
  group.add(seat);

  const shield = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.48, 0.12), scooterMat);
  shield.position.set(0, 0.48, 0.42);
  shield.rotation.x = -0.18;
  group.add(shield);

  const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.52, 8), darkMat);
  handlebar.rotation.z = Math.PI / 2;
  handlebar.position.set(0, 0.74, 0.36);
  group.add(handlebar);

  const headlight = new THREE.Mesh(
    new THREE.SphereGeometry(0.065, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 1.0 })
  );
  headlight.position.set(0, 0.64, 0.49);
  group.add(headlight);

  // Insulated Express Courier Box
  const deliveryBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.38, 0.42),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.45 })
  );
  deliveryBox.position.set(0, 0.57, -0.38);
  deliveryBox.castShadow = true;
  group.add(deliveryBox);
  const lid = new THREE.Mesh(
    new THREE.BoxGeometry(0.44, 0.05, 0.44),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.45 })
  );
  lid.position.set(0, 0.77, -0.38);
  group.add(lid);

  return group;
}

// ==========================================
// 7. 單車站 Bike Station (Refined Santander Docks)
// ==========================================
export function createBikeStation(): THREE.Group {
  const group = new THREE.Group();
  group.add(createContactShadow(2.0));

  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(2.45, 0.1, 1.05),
    new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 })
  );
  platform.position.y = 0.05;
  platform.receiveShadow = true;
  group.add(platform);

  // Interactive Rental Kiosk Totem seated cleanly on top of platform (y = 0.10)
  const totem = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 1.32, 0.24),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35, metalness: 0.55 })
  );
  totem.position.set(-0.96, 0.76, 0.26);
  totem.castShadow = true;
  group.add(totem);

  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.28, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x7dd3fc, emissive: 0x38bdf8, emissiveIntensity: 0.7 })
  );
  screen.position.set(-0.96, 0.96, 0.39);
  group.add(screen);

  // 3 Detailed Santander Red Bicycles
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.85 });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.32, metalness: 0.4 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.35, metalness: 0.8 });

  [-0.3, 0.26, 0.82].forEach(bx => {
    const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.42, 10), steelMat);
    bollard.position.set(bx, 0.25, 0.28);
    group.add(bollard);

    const bikeGroup = new THREE.Group();
    const fTire = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.025, 8, 16), tireMat);
    fTire.rotation.y = Math.PI / 2;
    fTire.position.set(0, 0.16, 0.24);
    bikeGroup.add(fTire);

    const rTire = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.025, 8, 16), tireMat);
    rTire.rotation.y = Math.PI / 2;
    rTire.position.set(0, 0.16, -0.24);
    bikeGroup.add(rTire);

    const crossBar = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.46, 8), frameMat);
    crossBar.rotation.x = Math.PI / 2;
    crossBar.position.set(0, 0.32, 0);
    bikeGroup.add(crossBar);

    const seatPost = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.28, 8), steelMat);
    seatPost.position.set(0, 0.28, -0.14);
    bikeGroup.add(seatPost);

    const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.04, 0.14), tireMat);
    saddle.position.set(0, 0.44, -0.16);
    bikeGroup.add(saddle);

    const handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.26, 8), steelMat);
    handleBar.rotation.z = Math.PI / 2;
    handleBar.position.set(0, 0.44, 0.18);
    bikeGroup.add(handleBar);

    bikeGroup.position.set(bx, 0.04, -0.05);
    group.add(bikeGroup);
  });

  return group;
}

// ==========================================
// 8. 凱蒂餐廳 Kitty's Restaurant (Cozy London Bistro)
// ==========================================
export function createKittysRestaurant(): THREE.Group {
  const group = new THREE.Group();
  const shadow = createContactShadow(1.75);
  shadow.scale.set(1.25, 0.74, 1.0);
  group.add(shadow);

  const modelGroup = new THREE.Group();
  modelGroup.scale.set(0.96, 0.94, 0.62); // Constrains bistro + awning within 2x1 footprint (<= 3.24m x 1.56m)
  modelGroup.position.z = -0.14;
  group.add(modelGroup);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.78 });
  const timberMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.72 });

  const bistro = new THREE.Mesh(new THREE.BoxGeometry(2.42, 1.9, 1.84), wallMat);
  bistro.position.y = 0.95;
  bistro.castShadow = true;
  bistro.receiveShadow = true;
  modelGroup.add(bistro);

  // Decorative wood wainscot & cornice
  const wainscot = new THREE.Mesh(new THREE.BoxGeometry(2.48, 0.35, 1.9), timberMat);
  wainscot.position.y = 0.175;
  modelGroup.add(wainscot);

  const parapet = new THREE.Mesh(new THREE.BoxGeometry(2.54, 0.18, 1.96), timberMat);
  parapet.position.y = 1.96;
  modelGroup.add(parapet);

  const pitchedRoof = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.55, 0.45, 4), roofMat);
  pitchedRoof.rotation.y = Math.PI / 4;
  pitchedRoof.position.y = 2.24;
  pitchedRoof.scale.set(1.15, 1.0, 0.88);
  pitchedRoof.castShadow = true;
  modelGroup.add(pitchedRoof);

  // Sloped Red & White Striped Bistro Awning
  const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.55 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55 });
  for (let i = 0; i < 5; i++) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.09, 0.56), i % 2 === 0 ? redMat : whiteMat);
    stripe.position.set(-0.9 + i * 0.45, 1.24, 1.16);
    stripe.rotation.x = 0.25;
    stripe.castShadow = true;
    modelGroup.add(stripe);
  }

  // Timber front door + brass handle (seated cleanly above base, proud of wainscot)
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.88, 0.08), timberMat);
  door.position.set(0.62, 0.48, 0.96);
  modelGroup.add(door);
  const doorGlass = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.36, 0.09),
    new THREE.MeshStandardMaterial({ color: 0xfde68a, emissive: 0xf59e0b, emissiveIntensity: 0.5 })
  );
  doorGlass.position.set(0.62, 0.64, 0.97);
  modelGroup.add(doorGlass);

  // Warm Bistro Shop Window (raised cleanly above wainscot at y = 0.35)
  const shopWin = createFramedWindow(0.95, 0.56, 0x78350f, 0xfef08a, 0xf59e0b, 0.45);
  shopWin.position.set(-0.46, 0.78, 0.96);
  modelGroup.add(shopWin);

  // Bistro signboard
  const signboard = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.24, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.4 })
  );
  signboard.position.set(0, 1.62, 0.96);
  modelGroup.add(signboard);

  return group;
}

// ==========================================
// 9. 皇家電話亭 UK Phone Booth (K6 Domed Box)
// ==========================================
export function createUKPhoneBooth(): THREE.Group {
  const group = new THREE.Group();
  group.add(createContactShadow(1.0));

  const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.32, metalness: 0.2 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xbae6fd,
    roughness: 0.08,
    metalness: 0.85,
    emissive: 0xfef08a,
    emissiveIntensity: 0.25,
  });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25, metalness: 0.85 });

  const base = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.14, 0.94), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 }));
  base.position.y = 0.07;
  group.add(base);

  const lowerPanel = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.38, 0.84), redMat);
  lowerPanel.position.y = 0.33;
  group.add(lowerPanel);

  // 4 Corner Posts
  [[-0.37, -0.37], [0.37, -0.37], [-0.37, 0.37], [0.37, 0.37]].forEach(([px, pz]) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.48, 0.12), redMat);
    post.position.set(px, 1.06, pz);
    post.castShadow = true;
    group.add(post);
  });

  const glassBlock = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.24, 0.7), glassMat);
  glassBlock.position.y = 1.08;
  group.add(glassBlock);

  // Mullion grids around booth
  [0.78, 1.08, 1.38].forEach(gy => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.035, 0.76), redMat);
    bar.position.y = gy;
    group.add(bar);
  });

  // Classic K6 Domed Crown & Golden Crown Emblem
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.14, 0.92), redMat);
  cornice.position.y = 1.78;
  group.add(cornice);

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.46, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    redMat
  );
  dome.position.y = 1.84;
  dome.scale.set(1, 0.55, 1);
  dome.castShadow = true;
  group.add(dome);

  const crown = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.04), goldMat);
  crown.position.set(0, 1.78, 0.47);
  group.add(crown);

  return group;
}

// ==========================================
// 10. 警察局 Police Station (Victorian Lantern & Station)
// ==========================================
export function createPoliceStation(): THREE.Group {
  const group = new THREE.Group();
  group.add(createContactShadow(2.4));

  const slateMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.78 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.65 });
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.35 });

  const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.74, 0.24, 2.34), trimMat);
  plinth.position.y = 0.12;
  group.add(plinth);

  const base = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.08, 2.2), slateMat);
  base.position.y = 1.28;
  base.castShadow = true;
  group.add(base);

  const cornice = new THREE.Mesh(new THREE.BoxGeometry(2.74, 0.18, 2.34), trimMat);
  cornice.position.y = 2.38;
  group.add(cornice);

  // Police Blue Archway & Banner
  const blueBanner = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.32, 0.08), blueMat);
  blueBanner.position.set(0, 1.98, 1.13);
  group.add(blueBanner);

  const door = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.08), blueMat);
  door.position.set(0, 0.69, 1.12);
  group.add(door);

  // Traditional Glowing Blue Victorian Police Lantern Globes
  const lanternMat = new THREE.MeshStandardMaterial({
    color: 0x60a5fa,
    emissive: 0x3b82f6,
    emissiveIntensity: 1.4,
    roughness: 0.15,
  });
  [-0.52, 0.52].forEach(lx => {
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), lanternMat);
    globe.position.set(lx, 1.18, 1.24);
    group.add(globe);
  });

  [-0.78, 0.78].forEach(wx => {
    const win = createFramedWindow(0.42, 0.5, 0xcbd5e1, 0x93c5fd, 0x3b82f6, 0.25);
    win.position.set(wx, 1.48, 1.12);
    group.add(win);
  });

  // Rooftop Communications Mast & Dish
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.045, 1.15, 8),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25 })
  );
  mast.position.set(0.82, 2.98, 0.55);
  group.add(mast);

  const beacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x2563eb, emissiveIntensity: 1.6 })
  );
  beacon.position.set(0.82, 3.58, 0.55);
  group.add(beacon);

  return group;
}

// ==========================================
// 11. 城市銀行 City Bank (Neoclassical Fluted Columns)
// ==========================================
export function createBank(): THREE.Group {
  const group = new THREE.Group();
  group.add(createContactShadow(2.4));

  const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.55, metalness: 0.05 });
  const limestoneMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.72 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.22, metalness: 0.88 });

  // Grand stepped neoclassical podium
  const step1 = new THREE.Mesh(new THREE.BoxGeometry(2.85, 0.16, 2.45), limestoneMat);
  step1.position.y = 0.08;
  group.add(step1);
  const step2 = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.16, 2.25), marbleMat);
  step2.position.y = 0.24;
  group.add(step2);

  // Main bank vault hall
  const hall = new THREE.Mesh(new THREE.BoxGeometry(2.38, 1.82, 1.56), limestoneMat);
  hall.position.set(0, 1.22, -0.22);
  hall.castShadow = true;
  group.add(hall);

  // Brass vault doors
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.92, 0.08), goldMat);
  door.position.set(0, 0.78, 0.58);
  group.add(door);

  // 4 Cylindrical Fluted Columns with plinths & capitals
  [-0.92, -0.32, 0.32, 0.92].forEach(colX => {
    const colPlinth = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.24), marbleMat);
    colPlinth.position.set(colX, 0.38, 0.84);
    group.add(colPlinth);

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.11, 1.56, 12), marbleMat);
    shaft.position.set(colX, 1.22, 0.84);
    shaft.castShadow = true;
    group.add(shaft);

    const capital = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.1, 0.25), marbleMat);
    capital.position.set(colX, 2.04, 0.84);
    group.add(capital);
  });

  // Entablature & Stepped Pediment Roof + Gold Seal
  const beam = new THREE.Mesh(new THREE.BoxGeometry(2.68, 0.22, 2.22), marbleMat);
  beam.position.set(0, 2.2, 0);
  group.add(beam);

  const roofPyramid = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.65, 0.45, 4), limestoneMat);
  roofPyramid.rotation.y = Math.PI / 4;
  roofPyramid.position.set(0, 2.52, 0);
  roofPyramid.scale.set(1.15, 1.0, 0.95);
  roofPyramid.castShadow = true;
  group.add(roofPyramid);

  const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 16), goldMat);
  seal.rotation.x = Math.PI / 2;
  seal.position.set(0, 2.2, 1.13);
  group.add(seal);

  return group;
}

// ==========================================
// 12. 中央醫院 Central Hospital (Refined Clinic & Ambulance Canopy)
// ==========================================
export function createHospital(): THREE.Group {
  const group = new THREE.Group();
  group.add(createContactShadow(2.4));

  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.48 });
  const slateMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.72 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.38 });

  const base = new THREE.Mesh(new THREE.BoxGeometry(2.74, 0.22, 2.16), slateMat);
  base.position.y = 0.11;
  group.add(base);

  const main = new THREE.Mesh(new THREE.BoxGeometry(2.58, 2.12, 1.98), whiteMat);
  main.position.y = 1.28;
  main.castShadow = true;
  group.add(main);

  // Prominent Glowing Red Cross Sign (distinct depths prevent Z-fighting at center)
  const crossMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xdc2626,
    emissiveIntensity: 0.35,
    roughness: 0.3,
  });
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.2, 0.08), crossMat);
  crossH.position.set(0, 1.82, 1.02);
  group.add(crossH);
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.66, 0.086), crossMat);
  crossV.position.set(0, 1.82, 1.02);
  group.add(crossV);

  // Upper floor framed glass windows
  [-0.78, 0, 0.78].forEach(wx => {
    const win = createFramedWindow(0.46, 0.38, 0xe2e8f0, 0x38bdf8, 0x0ea5e9, 0.28);
    win.position.set(wx, 1.15, 1.01);
    group.add(win);
  });

  // Emergency Ambulance Canopy + Pillars cleanly seated between base top (0.22) and awning underside (0.62)
  const awning = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.12, 0.62), redMat);
  awning.position.set(0, 0.68, 1.26);
  awning.castShadow = true;
  group.add(awning);

  [-0.56, 0.56].forEach(px => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.4, 8), whiteMat);
    col.position.set(px, 0.42, 1.5);
    group.add(col);
  });

  // Rooftop Helipad Marker
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.05, 16), slateMat);
  pad.position.set(0, 2.36, 0);
  group.add(pad);

  return group;
}

// ==========================================
// 13. 皇家噴泉 Royal Fountain (Refined Circular Tiered Basin)
// ==========================================
export function createFountain(): THREE.Group {
  const group = new THREE.Group();
  group.add(createContactShadow(2.1));

  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.72 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.65 });
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.06,
    metalness: 0.65,
    transparent: true,
    opacity: 0.84,
  });

  // Outer carved circular stone basin
  const basinBase = new THREE.Mesh(new THREE.CylinderGeometry(1.08, 1.14, 0.24, 24), stoneMat);
  basinBase.position.y = 0.12;
  basinBase.castShadow = true;
  group.add(basinBase);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.02, 0.08, 10, 28), rimMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.26;
  group.add(rim);

  const water = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 0.98, 0.06, 24), waterMat);
  water.position.y = 0.22;
  group.add(water);

  // Carved central pedestal & upper saucer
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 0.72, 16), stoneMat);
  pillar.position.y = 0.56;
  pillar.castShadow = true;
  group.add(pillar);

  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.22, 0.18, 20), rimMat);
  bowl.position.y = 0.98;
  group.add(bowl);

  const topSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.25, 12), stoneMat);
  topSpout.position.y = 1.15;
  group.add(topSpout);

  // Animated sparkling water jet plume
  const jetGroup = new THREE.Group();
  jetGroup.position.y = 1.32;
  const jetCore = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.16, 0.42, 12), waterMat);
  jetGroup.add(jetCore);
  const sprayCrown = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 8, 16), waterMat);
  sprayCrown.rotation.x = Math.PI / 2;
  sprayCrown.position.y = 0.16;
  jetGroup.add(sprayCrown);
  jetGroup.userData = { isFountainSpray: true };
  group.add(jetGroup);

  return group;
}

// ==========================================
// 14. 復古街燈 Glow Streetlamp (Cast-Iron Swan Neck & Hex Lantern)
// ==========================================
export function createStreetlamp(): THREE.Group {
  const group = new THREE.Group();
  group.add(createContactShadow(0.7));

  const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.42, metalness: 0.78 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 0.24, 10), ironMat);
  base.position.y = 0.12;
  group.add(base);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.055, 1.56, 10), ironMat);
  pole.position.y = 1.02;
  pole.castShadow = true;
  group.add(pole);

  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.06, 10), ironMat);
  collar.position.y = 1.76;
  group.add(collar);

  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.05, 0.05), ironMat);
  arm.position.set(0.14, 1.82, 0);
  group.add(arm);

  // Hexagonal Lantern Housing & Glowing Core
  const lantern = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.09, 0.24, 6),
    new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfde047,
      emissiveIntensity: 1.35,
      roughness: 0.15,
    })
  );
  lantern.position.set(0.24, 1.66, 0);
  group.add(lantern);

  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.12, 6), ironMat);
  cap.position.set(0.24, 1.83, 0);
  group.add(cap);

  const light = new THREE.PointLight(0xfef08a, 1.5, 4.2);
  light.position.set(0.24, 1.64, 0);
  group.add(light);

  return group;
}

// ==========================================
// 15. 百年綠蔭橡樹 Oak Tree (Layered Organic Canopy)
// ==========================================
export function createOakTree(): THREE.Group {
  const group = new THREE.Group();
  group.add(createContactShadow(1.5));

  const logMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.94 });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 1.38, 10), logMat);
  trunk.position.y = 0.69;
  trunk.castShadow = true;
  group.add(trunk);

  const leafMat1 = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.85 });
  const leafMat2 = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85 });
  const leafMat3 = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.82 });

  const clusters: Array<[number, number, number, number, THREE.Material]> = [
    [0, 1.62, 0, 0.68, leafMat1],
    [-0.42, 1.44, 0.24, 0.48, leafMat2],
    [0.44, 1.46, -0.22, 0.46, leafMat2],
    [0.18, 1.48, 0.42, 0.44, leafMat3],
    [-0.22, 1.5, -0.38, 0.44, leafMat1],
    [0, 2.08, 0, 0.45, leafMat3],
  ];
  clusters.forEach(([x, y, z, r, mat]) => {
    const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), mat);
    puff.position.set(x, y, z);
    puff.castShadow = true;
    group.add(puff);
  });

  return group;
}

// ==========================================
// 16. 高山松樹 Pine Tree (Tiered Conical Boughs)
// ==========================================
export function createPineTree(): THREE.Group {
  const group = new THREE.Group();
  group.add(createContactShadow(1.3));

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, 1.15, 8),
    new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.94 })
  );
  trunk.position.y = 0.575;
  group.add(trunk);

  const spruce1 = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.86 });
  const spruce2 = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.84 });

  [
    { r: 0.78, h: 0.7, y: 1.05, m: spruce1 },
    { r: 0.62, h: 0.65, y: 1.48, m: spruce2 },
    { r: 0.45, h: 0.6, y: 1.88, m: spruce1 },
    { r: 0.28, h: 0.52, y: 2.24, m: spruce2 },
  ].forEach(tier => {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(tier.r, tier.h, 8), tier.m);
    cone.position.y = tier.y;
    cone.castShadow = true;
    group.add(cone);
  });

  return group;
}

// ==========================================
// 17. 粉櫻樹 Cherry Blossom Tree (Layered Pink Clusters)
// ==========================================
export function createCherryTree(): THREE.Group {
  const group = new THREE.Group();
  group.add(createContactShadow(1.5));

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.22, 1.32, 10),
    new THREE.MeshStandardMaterial({ color: 0x4a2e1b, roughness: 0.9 })
  );
  trunk.position.y = 0.66;
  trunk.castShadow = true;
  group.add(trunk);

  const pink1 = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.78 });
  const pink2 = new THREE.MeshStandardMaterial({ color: 0xfb7185, roughness: 0.78 });
  const pinkLight = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.75 });

  [
    [0, 1.62, 0, 0.66, pink1],
    [-0.44, 1.46, 0.22, 0.46, pink2],
    [0.42, 1.48, -0.2, 0.46, pinkLight],
    [0.18, 1.5, 0.4, 0.42, pink1],
    [-0.2, 1.5, -0.4, 0.42, pink2],
    [0, 2.08, 0, 0.44, pinkLight],
  ].forEach(([x, y, z, r, mat]) => {
    const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(r as number, 1), mat as THREE.Material);
    puff.position.set(x as number, y as number, z as number);
    puff.castShadow = true;
    group.add(puff);
  });

  return group;
}

// ==========================================
// 18. 木質長椅 Bench (Slatted Wood & Cast-Iron Frame)
// ==========================================
export function createBench(): THREE.Group {
  const group = new THREE.Group();
  group.add(createContactShadow(1.0));

  const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.76 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45, metalness: 0.82 });

  [-0.48, 0.48].forEach(lx => {
    const fLeg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.36, 0.06), ironMat);
    fLeg.position.set(lx, 0.18, 0.18);
    group.add(fLeg);
    const bLeg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.68, 0.06), ironMat);
    bLeg.position.set(lx, 0.34, -0.18);
    group.add(bLeg);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.42), ironMat);
    arm.position.set(lx, 0.5, 0);
    group.add(arm);
  });

  [-0.12, 0, 0.12].forEach(sz => {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.045, 0.1), woodMat);
    slat.position.set(0, 0.36, sz);
    slat.castShadow = true;
    group.add(slat);
  });

  [0.52, 0.66].forEach(by => {
    const backSlat = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.1, 0.045), woodMat);
    backSlat.position.set(0, by, -0.17);
    group.add(backSlat);
  });

  return group;
}

// ==========================================
// 19. 郵筒 Post Box (Cylindrical Royal Pillar Box)
// ==========================================
export function createPostBox(): THREE.Group {
  const group = new THREE.Group();
  group.add(createContactShadow(0.7));

  const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.34, metalness: 0.25 });
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.55 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25, metalness: 0.85 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.14, 16), blackMat);
  base.position.y = 0.07;
  group.add(base);

  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.82, 16), redMat);
  pillar.position.y = 0.55;
  pillar.castShadow = true;
  group.add(pillar);

  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.225, 0.225, 0.06, 16), redMat);
  rim.position.y = 0.96;
  group.add(rim);

  const domeCap = new THREE.Mesh(new THREE.SphereGeometry(0.21, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), redMat);
  domeCap.position.y = 0.98;
  domeCap.scale.set(1, 0.65, 1);
  group.add(domeCap);

  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.05), blackMat);
  slot.position.set(0, 0.8, 0.18);
  group.add(slot);

  const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.04), goldMat);
  plaque.position.set(0, 0.64, 0.18);
  group.add(plaque);

  return group;
}

// ==========================================
// 20. 街角花圃 Flower Planter (Stone Rim & Blossoms)
// ==========================================
export function createFlowerPlanter(): THREE.Group {
  const group = new THREE.Group();
  group.add(createContactShadow(1.1));

  const boxMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.78 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.72 });

  const box = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.28, 0.92), boxMat);
  box.position.y = 0.14;
  box.castShadow = true;
  group.add(box);

  const topRim = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.06, 0.98), rimMat);
  topRim.position.y = 0.3;
  group.add(topRim);

  const dirt = new THREE.Mesh(
    new THREE.BoxGeometry(0.78, 0.06, 0.78),
    new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.95 })
  );
  dirt.position.y = 0.31;
  group.add(dirt);

  const stemMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 });
  const petalColors = [0xf43f5e, 0xfacc15, 0xa855f7, 0xf97316];
  const flowerSpots: Array<[number, number, number]> = [
    [-0.22, -0.22, petalColors[0]],
    [0.22, -0.2, petalColors[1]],
    [-0.2, 0.22, petalColors[2]],
    [0.22, 0.22, petalColors[3]],
    [0, 0, petalColors[0]],
  ];

  flowerSpots.forEach(([fx, fz, col]) => {
    const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11, 0), stemMat);
    leaves.position.set(fx, 0.38, fz);
    group.add(leaves);

    const blossom = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.55 })
    );
    blossom.position.set(fx, 0.5, fz);
    group.add(blossom);
  });

  return group;
}

// ==========================================
// 20b. 英倫街角路牌 Street Sign (Dual Enameled Blades)
// ==========================================
export function createStreetSign(): THREE.Group {
  const group = new THREE.Group();
  group.add(createContactShadow(0.75));

  const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.8 });
  const boardMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
  const borderMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.18, 12), ironMat);
  base.position.y = 0.09;
  group.add(base);

  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 1.68, 10), ironMat);
  post.position.y = 0.96;
  post.castShadow = true;
  group.add(post);

  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 10), ironMat);
  finial.position.y = 1.84;
  group.add(finial);

  // Two perpendicular London enameled street blades
  const blade1Back = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.2, 0.05), borderMat);
  blade1Back.position.set(0.28, 1.64, 0);
  group.add(blade1Back);
  const blade1Front = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.14, 0.06), boardMat);
  blade1Front.position.set(0.28, 1.64, 0);
  group.add(blade1Front);

  const blade2Back = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.2, 0.84), borderMat);
  blade2Back.position.set(0, 1.42, 0.28);
  group.add(blade2Back);
  const blade2Front = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.78), boardMat);
  blade2Front.position.set(0, 1.42, 0.28);
  group.add(blade2Front);

  return group;
}

// ==========================================
// 21. 皇家散步柯基犬 Corgi (Shop Decorative Quadruped Dog)
// ==========================================
export function createCorgi(): THREE.Group {
  const group = new THREE.Group();
  group.add(createContactShadow(0.8));

  const orangeMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.72 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.72 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
  const collarMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.45 });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.34, 6, 12), orangeMat);
  body.rotation.x = Math.PI / 2;
  body.position.set(0, 0.28, 0);
  body.castShadow = true;
  group.add(body);

  const belly = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.42), whiteMat);
  belly.position.set(0, 0.22, 0.02);
  group.add(belly);

  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.025, 8, 16), collarMat);
  collar.rotation.x = Math.PI / 2.2;
  collar.position.set(0, 0.36, 0.22);
  group.add(collar);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 12), orangeMat);
  head.position.set(0, 0.49, 0.3);
  head.castShadow = true;
  group.add(head);

  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), whiteMat);
  snout.scale.set(1.0, 0.8, 1.2);
  snout.position.set(0, 0.44, 0.44);
  group.add(snout);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), darkMat);
  nose.position.set(0, 0.47, 0.54);
  group.add(nose);

  [-0.075, 0.075].forEach(ex => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 8), darkMat);
    eye.position.set(ex, 0.52, 0.45);
    group.add(eye);
  });

  [-0.1, 0.1].forEach(ex => {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 4), orangeMat);
    ear.position.set(ex, 0.66, 0.26);
    ear.rotation.z = ex > 0 ? -0.2 : 0.2;
    group.add(ear);
  });

  [[-0.1, 0.18], [0.1, 0.18], [-0.1, -0.18], [0.1, -0.18]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.18, 8), whiteMat);
    leg.position.set(lx, 0.09, lz);
    group.add(leg);
  });

  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), whiteMat);
  tail.position.set(0, 0.36, -0.32);
  group.add(tail);

  return group;
}

// ==========================================
// 22. 可愛動物島民角色 (兔子 / 狗狗 / 貓咪 / 小熊 / 老鼠)
// ==========================================
export function createAnimalNpcModel(
  species: AnimalNpcSpecies,
  charIdOrName?: string
): THREE.Group {
  const group = new THREE.Group();
  group.add(createContactShadow(0.62));

  const eyeBlackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.12, metalness: 0.1 });
  const eyeShineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const blushMat = new THREE.MeshStandardMaterial({ color: 0xfda4af, roughness: 0.85 });
  const pinkInnerMat = new THREE.MeshStandardMaterial({ color: 0xf9a8d4, roughness: 0.78 });

  // Species palettes
  const palettes: Record<
    AnimalNpcSpecies,
    { fur: number; secondary: number; outfit: number; accent: number; nose: number }
  > = {
    rabbit: { fur: 0xfff8f0, secondary: 0xfde2e4, outfit: 0x0284c7, accent: 0xf97316, nose: 0xf43f5e },
    dog: { fur: 0xe69f45, secondary: 0xfffbeb, outfit: 0x1d4ed8, accent: 0xfbbf24, nose: 0x18181b },
    cat: { fur: 0xf59e0b, secondary: 0xfef3c7, outfit: 0x059669, accent: 0xfbbf24, nose: 0xfb7185 },
    bear: { fur: 0x9a5b32, secondary: 0xfde68a, outfit: 0x7c3aed, accent: 0xf59e0b, nose: 0x1c1917 },
    mouse: { fur: 0x94a3b8, secondary: 0xf1f5f9, outfit: 0xbe123c, accent: 0x38bdf8, nose: 0xf472b6 },
  };
  const pal = palettes[species];
  const furMat = new THREE.MeshStandardMaterial({ color: pal.fur, roughness: 0.8 });
  const secondaryMat = new THREE.MeshStandardMaterial({ color: pal.secondary, roughness: 0.8 });
  const outfitMat = new THREE.MeshStandardMaterial({ color: pal.outfit, roughness: 0.6 });
  const accentMat = new THREE.MeshStandardMaterial({ color: pal.accent, roughness: 0.45, metalness: 0.2 });
  const noseMat = new THREE.MeshStandardMaterial({ color: pal.nose, roughness: 0.4 });

  // 1. Head Group
  const headGroup = new THREE.Group();
  headGroup.position.y = 0.88;
  group.add(headGroup);

  const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.23, 18, 16), furMat);
  headSphere.scale.set(1.08, 0.96, 1.0);
  headSphere.castShadow = true;
  headGroup.add(headSphere);

  // Cute chubby muzzle & nose
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), secondaryMat);
  muzzle.scale.set(1.15, 0.85, 0.9);
  muzzle.position.set(0, -0.045, 0.19);
  headGroup.add(muzzle);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 10), noseMat);
  nose.scale.set(1.2, 0.9, 0.9);
  nose.position.set(0, -0.015, 0.275);
  headGroup.add(nose);

  // Expressive glossy eyes with catchlights + rosy cheeks
  [-0.088, 0.088].forEach(ex => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.034, 10, 10), eyeBlackMat);
    eye.position.set(ex, 0.038, 0.205);
    headGroup.add(eye);

    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6), eyeShineMat);
    shine.position.set(ex + (ex > 0 ? -0.01 : 0.01), 0.052, 0.232);
    headGroup.add(shine);

    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), blushMat);
    cheek.scale.set(1.2, 0.75, 0.5);
    cheek.position.set(ex * 1.45, -0.03, 0.185);
    headGroup.add(cheek);
  });

  // Species-Specific Ears & Facial Traits
  let leftEar: THREE.Object3D | undefined;
  let rightEar: THREE.Object3D | undefined;

  if (species === 'rabbit') {
    [-0.095, 0.095].forEach((ex, idx) => {
      const earPivot = new THREE.Group();
      earPivot.position.set(ex, 0.2, 0);
      earPivot.rotation.z = idx === 0 ? 0.12 : -0.16;
      const outer = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.22, 6, 10), furMat);
      outer.position.y = 0.14;
      outer.scale.set(1.0, 1.0, 0.65);
      outer.castShadow = true;
      earPivot.add(outer);

      const inner = new THREE.Mesh(new THREE.CapsuleGeometry(0.032, 0.16, 4, 8), pinkInnerMat);
      inner.position.set(0, 0.13, 0.025);
      inner.scale.set(1.0, 1.0, 0.5);
      earPivot.add(inner);

      headGroup.add(earPivot);
      if (idx === 0) leftEar = earPivot;
      else rightEar = earPivot;
    });
  } else if (species === 'dog') {
    // Perky bi-color Corgi/Puppy ears + tiny police/explorer beret
    [-0.14, 0.14].forEach((ex, idx) => {
      const earPivot = new THREE.Group();
      earPivot.position.set(ex, 0.16, -0.01);
      earPivot.rotation.z = idx === 0 ? 0.24 : -0.24;
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.19, 8), furMat);
      ear.position.y = 0.08;
      ear.scale.set(1.0, 1.0, 0.65);
      earPivot.add(ear);

      const earIn = new THREE.Mesh(new THREE.ConeGeometry(0.044, 0.13, 6), secondaryMat);
      earIn.position.set(0, 0.06, 0.024);
      earIn.scale.set(1.0, 1.0, 0.5);
      earPivot.add(earIn);

      headGroup.add(earPivot);
      if (idx === 0) leftEar = earPivot;
      else rightEar = earPivot;
    });

    // Cute tiny constable cap
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.09, 12), outfitMat);
    cap.position.set(0, 0.22, 0.02);
    headGroup.add(cap);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.025, 0.09), eyeBlackMat);
    visor.position.set(0, 0.18, 0.1);
    headGroup.add(visor);
  } else if (species === 'cat') {
    // Pointed Cat Ears + 3D Whiskers + Courier Visor Cap
    [-0.135, 0.135].forEach((ex, idx) => {
      const earPivot = new THREE.Group();
      earPivot.position.set(ex, 0.17, 0);
      earPivot.rotation.z = idx === 0 ? 0.22 : -0.22;
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.072, 0.16, 4), furMat);
      ear.rotation.y = Math.PI / 4;
      ear.position.y = 0.06;
      earPivot.add(ear);
      const earIn = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.11, 4), pinkInnerMat);
      earIn.rotation.y = Math.PI / 4;
      earIn.position.set(0, 0.05, 0.022);
      earPivot.add(earIn);
      headGroup.add(earPivot);
      if (idx === 0) leftEar = earPivot;
      else rightEar = earPivot;
    });

    // Whiskers
    [-1, 1].forEach(side => {
      [-0.02, -0.055].forEach((wy, wi) => {
        const w = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.009, 0.009), eyeBlackMat);
        w.position.set(side * 0.17, wy, 0.18);
        w.rotation.z = side * (wi === 0 ? 0.08 : -0.1);
        headGroup.add(w);
      });
    });

    // Forehead tabby stripes
    [-0.04, 0, 0.04].forEach(sx => {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.022, 0.06, 0.03),
        new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 })
      );
      stripe.position.set(sx, 0.16, 0.17);
      headGroup.add(stripe);
    });
  } else if (species === 'bear') {
    // Round Teddy Ears + Round Reading Glasses
    [-0.16, 0.16].forEach((ex, idx) => {
      const earPivot = new THREE.Group();
      earPivot.position.set(ex, 0.18, -0.01);
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 10), furMat);
      ear.scale.set(1.0, 1.0, 0.65);
      earPivot.add(ear);
      const earIn = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 8), secondaryMat);
      earIn.position.z = 0.032;
      earIn.scale.set(1.0, 1.0, 0.5);
      earPivot.add(earIn);
      headGroup.add(earPivot);
      if (idx === 0) leftEar = earPivot;
      else rightEar = earPivot;
    });

    // Cute spectacles
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.75, roughness: 0.25 });
    [-0.088, 0.088].forEach(gx => {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.009, 6, 16), rimMat);
      rim.position.set(gx, 0.038, 0.235);
      headGroup.add(rim);
    });
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.01, 0.01), rimMat);
    bridge.position.set(0, 0.042, 0.235);
    headGroup.add(bridge);
  } else {
    // Mouse: Big Oversized Round Pink-Lined Ears + Whiskers + Mini Headset Mic
    [-0.185, 0.185].forEach((ex, idx) => {
      const earPivot = new THREE.Group();
      earPivot.position.set(ex, 0.18, -0.02);
      const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.042, 16), furMat);
      ear.rotation.x = Math.PI / 2;
      earPivot.add(ear);
      const earIn = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.088, 0.048, 14), pinkInnerMat);
      earIn.rotation.x = Math.PI / 2;
      earIn.position.z = 0.006;
      earPivot.add(earIn);
      headGroup.add(earPivot);
      if (idx === 0) leftEar = earPivot;
      else rightEar = earPivot;
    });

    // Tiny English Hotline Headset Mic on cheek (band clears 0.2484 head X-radius cleanly)
    const micBand = new THREE.Mesh(
      new THREE.TorusGeometry(0.268, 0.012, 6, 16, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6 })
    );
    micBand.position.y = 0.02;
    headGroup.add(micBand);
    const micBoom = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.015, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.5 })
    );
    micBoom.position.set(0.22, -0.05, 0.14);
    headGroup.add(micBoom);
  }

  // 2. Torso & Cute Outfit
  const torsoGroup = new THREE.Group();
  torsoGroup.position.y = 0.5;
  group.add(torsoGroup);

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.36, 14), outfitMat);
  torso.castShadow = true;
  torsoGroup.add(torso);

  // Scarf / Collar / Satchel Detail
  const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.04, 8, 16), accentMat);
  scarf.rotation.x = Math.PI / 2;
  scarf.position.y = 0.16;
  torsoGroup.add(scarf);

  const button = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), accentMat);
  button.position.set(0, 0.04, 0.175);
  torsoGroup.add(button);

  if (species === 'rabbit') {
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.24, 0.12), accentMat);
    backpack.position.set(0, 0.02, -0.19);
    torsoGroup.add(backpack);
  } else if (species === 'cat') {
    const satchel = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.13, 0.14), accentMat);
    satchel.position.set(0.2, -0.08, -0.08);
    torsoGroup.add(satchel);
  }

  // 3. Articulated Paws (Arms)
  const armGeo = new THREE.CapsuleGeometry(0.05, 0.18, 4, 8);
  const leftArm = new THREE.Mesh(armGeo, outfitMat);
  leftArm.position.set(-0.22, 0.54, 0);
  const lPaw = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), secondaryMat);
  lPaw.position.y = -0.12;
  leftArm.add(lPaw);
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, outfitMat);
  rightArm.position.set(0.22, 0.54, 0);
  const rPaw = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), secondaryMat);
  rPaw.position.y = -0.12;
  rightArm.add(rPaw);
  group.add(rightArm);

  // 4. Articulated Legs & Paws
  const legGeo = new THREE.CapsuleGeometry(0.058, 0.15, 4, 8);
  const leftLeg = new THREE.Mesh(legGeo, furMat);
  leftLeg.position.set(-0.088, 0.17, 0);
  const lFoot = new THREE.Mesh(new THREE.SphereGeometry(0.068, 8, 8), secondaryMat);
  lFoot.scale.set(1.0, 0.72, 1.3);
  lFoot.position.set(0, -0.1, 0.03);
  leftLeg.add(lFoot);
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, furMat);
  rightLeg.position.set(0.088, 0.17, 0);
  const rFoot = new THREE.Mesh(new THREE.SphereGeometry(0.068, 8, 8), secondaryMat);
  rFoot.scale.set(1.0, 0.72, 1.3);
  rFoot.position.set(0, -0.1, 0.03);
  rightLeg.add(rFoot);
  group.add(rightLeg);

  // 5. Cute Tail
  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, 0.34, -0.18);
  if (species === 'rabbit' || species === 'bear') {
    const puffTail = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 10), secondaryMat);
    puffTail.position.set(0, 0.02, -0.04);
    tailPivot.add(puffTail);
  } else if (species === 'cat' || species === 'dog') {
    const curveTail = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.2, 4, 8), furMat);
    curveTail.rotation.x = -0.75;
    curveTail.position.set(0, 0.08, -0.1);
    tailPivot.add(curveTail);
  } else {
    // Mouse slender pink tail
    const mTail = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.26, 4, 8), pinkInnerMat);
    mTail.rotation.x = -0.9;
    mTail.position.set(0, 0.04, -0.14);
    tailPivot.add(mTail);
  }
  group.add(tailPivot);

  // 6. Floating Quest Gem Marker above Head
  const bubbleGroup = new THREE.Group();
  const gem = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.15, 0),
    new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.95,
      roughness: 0.15,
      metalness: 0.25,
    })
  );
  gem.position.y = 1.46;
  bubbleGroup.add(gem);
  bubbleGroup.userData = { isBubble: true };
  group.add(bubbleGroup);

  group.userData = {
    isCitizen: true,
    isAnimalNpc: true,
    animalSpecies: species,
    charKey: charIdOrName || species,
    headGroup,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    leftEar,
    rightEar,
    tail: tailPivot,
    bubbleGroup,
  };

  return group;
}

export function createCitizenModel(charIdOrColor: string | number = 'yuki'): THREE.Group {
  const key = typeof charIdOrColor === 'string' ? charIdOrColor.toLowerCase() : '';
  if (key.includes('rabbit') || key.includes('yuki')) return createAnimalNpcModel('rabbit', 'yuki');
  if (key.includes('dog') || key.includes('toby') || key.includes('corgi')) return createAnimalNpcModel('dog', 'toby');
  if (key.includes('cat') || key.includes('leo')) return createAnimalNpcModel('cat', 'leo');
  if (key.includes('bear') || key.includes('emma')) return createAnimalNpcModel('bear', 'emma');
  if (key.includes('mouse') || key.includes('pip') || key.includes('arthur')) return createAnimalNpcModel('mouse', 'pip');
  return createAnimalNpcModel('rabbit', key || 'yuki');
}

// ==========================================
// 23. 城市小鳥 Bird (Refined Plump City Songbird / Pigeon)
// ==========================================
export function createBirdModel(): THREE.Group {
  const group = new THREE.Group();
  group.add(createContactShadow(0.35));

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.72 });
  const chestMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.75 });
  const beakMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), bodyMat);
  body.scale.set(0.9, 0.85, 1.35);
  body.position.y = 0.13;
  body.castShadow = true;
  group.add(body);

  const wingL = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), chestMat);
  wingL.scale.set(0.4, 0.7, 1.4);
  wingL.position.set(-0.08, 0.14, -0.02);
  group.add(wingL);

  const wingR = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), chestMat);
  wingR.scale.set(0.4, 0.7, 1.4);
  wingR.position.set(0.08, 0.14, -0.02);
  group.add(wingR);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.22, 0.1);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 10), bodyMat);
  headGroup.add(head);

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.06, 6), beakMat);
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, -0.005, 0.085);
  headGroup.add(beak);

  [-0.045, 0.045].forEach(ex => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), eyeMat);
    eye.position.set(ex, 0.02, 0.055);
    headGroup.add(eye);
  });
  group.add(headGroup);

  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.02, 0.12), bodyMat);
  tail.position.set(0, 0.14, -0.17);
  tail.rotation.x = 0.28;
  group.add(tail);

  group.userData = {
    isAnimal: true,
    animalType: 'bird',
    headGroup,
    wingL,
    wingR,
    tail,
  };

  return group;
}

// ==========================================
// 24. 郵政快遞貨車 Delivery Van (Royal Express Van)
// ==========================================
export function createDeliveryVan(): THREE.Group {
  const group = new THREE.Group();
  group.add(createContactShadow(2.0));

  [[-0.56, -0.72], [0.56, -0.72], [-0.56, 0.72], [0.56, 0.72]].forEach(([wx, wz]) => {
    const w = createDetailedWheel(0.2, 0.15, 0xd4d4d8);
    w.position.set(wx, 0.2, wz);
    group.add(w);
  });

  const chassis = new THREE.Mesh(
    new THREE.BoxGeometry(1.06, 0.16, 2.32),
    new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.75 })
  );
  chassis.position.y = 0.28;
  group.add(chassis);

  const vanMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.34, metalness: 0.15 });
  const cargoBox = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.9, 1.46), vanMat);
  cargoBox.position.set(0, 0.8, -0.35);
  cargoBox.castShadow = true;
  group.add(cargoBox);

  const redStripe = new THREE.Mesh(
    new THREE.BoxGeometry(1.18, 0.12, 1.38),
    new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.45 })
  );
  redStripe.position.set(0, 0.76, -0.35);
  group.add(redStripe);

  const cabBox = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.74, 0.82), vanMat);
  cabBox.position.set(0, 0.72, 0.68);
  cabBox.castShadow = true;
  group.add(cabBox);

  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.08, metalness: 0.88 });
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.32, 0.06), glassMat);
  windshield.position.set(0, 0.84, 1.1);
  windshield.rotation.x = -0.15;
  group.add(windshield);

  const sideWin = new THREE.Mesh(new THREE.BoxGeometry(1.13, 0.28, 0.52), glassMat);
  sideWin.position.set(0, 0.82, 0.64);
  group.add(sideWin);

  const lightMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 1.0 });
  [-0.38, 0.38].forEach(lx => {
    const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.05, 10), lightMat);
    hl.rotation.x = Math.PI / 2;
    hl.position.set(lx, 0.46, 1.1);
    group.add(hl);
  });

  const tailMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.9 });
  [-0.42, 0.42].forEach(tx => {
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.05), tailMat);
    tail.position.set(tx, 0.54, -1.09);
    group.add(tail);
  });

  return group;
}

// ==========================================
// 25. 都會小型轎車 City Compact Car
// ==========================================
export function createCityCompactCar(): THREE.Group {
  const group = new THREE.Group();
  group.add(createContactShadow(1.7));

  [[-0.5, -0.62], [0.5, -0.62], [-0.5, 0.62], [0.5, 0.62]].forEach(([wx, wz]) => {
    const w = createDetailedWheel(0.175, 0.13, 0xe2e8f0);
    w.position.set(wx, 0.175, wz);
    group.add(w);
  });

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.28, metalness: 0.35 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.08, metalness: 0.88 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.88 });

  const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.36, 1.82), bodyMat);
  lowerBody.position.y = 0.4;
  lowerBody.castShadow = true;
  group.add(lowerBody);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.38, 0.96), bodyMat);
  cabin.position.set(0, 0.74, -0.1);
  cabin.castShadow = true;
  group.add(cabin);

  const cabinGlass = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.24, 0.86), glassMat);
  cabinGlass.position.set(0, 0.76, -0.1);
  group.add(cabinGlass);

  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.28, 0.05), glassMat);
  windshield.position.set(0, 0.72, 0.38);
  windshield.rotation.x = -0.35;
  group.add(windshield);

  const fBumper = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.07, 0.08), chromeMat);
  fBumper.position.set(0, 0.26, 0.92);
  group.add(fBumper);

  const lightMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 0.95 });
  [-0.33, 0.33].forEach(lx => {
    const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.05, 10), lightMat);
    hl.rotation.x = Math.PI / 2;
    hl.position.set(lx, 0.42, 0.92);
    group.add(hl);
  });

  const tailMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.9 });
  [-0.33, 0.33].forEach(tx => {
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.05), tailMat);
    tail.position.set(tx, 0.44, -0.92);
    group.add(tail);
  });

  return group;
}

// ==========================================
// 26. 城市巡邏警車 Police Cruiser
// ==========================================
export function createPoliceCar(): THREE.Group {
  const group = new THREE.Group();
  group.add(createContactShadow(1.8));

  [[-0.52, -0.66], [0.52, -0.66], [-0.52, 0.66], [0.52, 0.66]].forEach(([wx, wz]) => {
    const w = createDetailedWheel(0.175, 0.14, 0xd4d4d8);
    w.position.set(wx, 0.175, wz);
    group.add(w);
  });

  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.32, metalness: 0.15 });
  const navyMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.38 });
  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.38 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.08, metalness: 0.9 });

  const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.38, 1.9), whiteMat);
  lowerBody.position.y = 0.4;
  lowerBody.castShadow = true;
  group.add(lowerBody);

  [-0.52, 0.52].forEach(sx => {
    const stripe1 = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.12, 0.42), navyMat);
    stripe1.position.set(sx, 0.4, 0.12);
    group.add(stripe1);
    const stripe2 = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.12, 0.42), yellowMat);
    stripe2.position.set(sx, 0.4, -0.32);
    group.add(stripe2);
  });

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.38, 1.0), whiteMat);
  cabin.position.set(0, 0.76, -0.05);
  group.add(cabin);

  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.24, 0.9), glassMat);
  glass.position.set(0, 0.78, -0.05);
  group.add(glass);

  const beaconGroup = new THREE.Group();
  beaconGroup.position.set(0, 1.02, -0.05);
  const blueLight = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.08, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x2563eb, emissiveIntensity: 1.6 })
  );
  blueLight.position.x = -0.15;
  beaconGroup.add(blueLight);
  const redLight = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.08, 0.12),
    new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 1.6 })
  );
  redLight.position.x = 0.15;
  beaconGroup.add(redLight);
  beaconGroup.userData = { isBeacon: true };
  group.add(beaconGroup);

  return group;
}

// ==========================================
// Model Registry Dispatcher
// ==========================================
export function createModelByType(type: string): THREE.Group {
  switch (type) {
    case 'metro_kiosk':
      return createMetroKiosk();
    case 'mayfair_hotel':
      return createMayfairHotel();
    case 'big_ben':
      return createBigBen();
    case 'red_bus':
      return createRedBus();
    case 'taxi':
      return createTaxi();
    case 'delivery_van':
      return createDeliveryVan();
    case 'compact_car':
      return createCityCompactCar();
    case 'police_car':
      return createPoliceCar();
    case 'scooter':
      return createDeliveryScooter();
    case 'bike_station':
      return createBikeStation();
    case 'kittys_restaurant':
      return createKittysRestaurant();
    case 'uk_phone_booth':
      return createUKPhoneBooth();
    case 'police_station':
      return createPoliceStation();
    case 'bank':
    case 'bank_building':
      return createBank();
    case 'hospital':
      return createHospital();
    case 'fountain':
      return createFountain();
    case 'streetlamp':
      return createStreetlamp();
    case 'tree_oak':
      return createOakTree();
    case 'tree_pine':
      return createPineTree();
    case 'cherry_tree':
      return createCherryTree();
    case 'bench':
      return createBench();
    case 'post_box':
      return createPostBox();
    case 'flower_planter':
      return createFlowerPlanter();
    case 'street_sign':
      return createStreetSign();
    case 'corgi':
      return createCorgi();
    case 'bird':
      return createBirdModel();
    default:
      return createOakTree();
  }
}
