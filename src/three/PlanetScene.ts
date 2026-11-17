import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createModelByType, createCitizenModel } from './proceduralModels';
import {
  createRoadTexture,
  createDashedGridTexture,
  createGrassTexture,
  createCobblestoneTexture,
  createRedBrickTexture,
  createStonePlazaTexture,
  createTerracottaTexture,
  createWoodDeckTexture,
} from './proceduralTextures';

export interface PlacedBuilding {
  instanceId: string;
  blueprintId: string;
  modelType: string;
  gridX: number;
  gridZ: number;
  rotationY: number;
  footprintW: number;
  footprintD: number;
  centerX: number;
  centerZ: number;
  occupiedCells: { gx: number; gz: number }[];
  group: THREE.Group;
}

export type CitizenBehaviorState =
  | 'walking'
  | 'window_shopping'
  | 'checking_phone'
  | 'waiting_crosswalk'
  | 'enjoying_cafe'
  | 'waiting_bus'
  | 'sightseeing_hotel'
  | 'reading_book'
  | 'admiring_flower'
  | 'chatting'
  | 'sniffing'
  | 'pecking'
  | 'idle';

export type CitizenAnimalType = 'rabbit' | 'dog' | 'cat' | 'bear' | 'mouse' | 'bird';

export type TilePavingType = 'grass' | 'cobblestone' | 'red_brick' | 'stone_plaza' | 'terracotta' | 'wood_deck';

export interface SavedIslandBuilding {
  blueprintId: string;
  modelType: string;
  gridX: number;
  gridZ: number;
  rotationY: number;
  footprintW: number;
  footprintD: number;
}

export interface SavedIslandPavedTile {
  gx: number;
  gz: number;
  type: TilePavingType;
}

export interface IslandMapSnapshot {
  buildings: SavedIslandBuilding[];
  pavedTiles: SavedIslandPavedTile[];
}

export interface RoamingGridContext {
  gridRadius: number;
  tileSize: number;
  isTileWalkable: (gx: number, gz: number) => boolean;
  isPointWalkable: (x: number, z: number, radius: number) => boolean;
  placedBuildings: Iterable<PlacedBuilding>;
  pavedTiles: Map<string, { type: TilePavingType; mesh: THREE.Mesh }>;
}

export interface WalkingCitizenConfig {
  group: THREE.Group;
  targetPos: THREE.Vector3;
  speed: number;
  type: CitizenAnimalType;
  collisionRadius?: number;
  speciesLabel?: string;
  assignedIncidentId?: string;
  name?: string;
  dialogue?: string;
}

export class WalkingCitizen {
  public group: THREE.Group;
  public targetPos: THREE.Vector3;
  public speed: number;
  public baseSpeed: number;
  public walkCycle: number;
  public collisionRadius: number;
  public state: CitizenBehaviorState = 'walking';
  public stateTimer = 0;
  public type: CitizenAnimalType;
  public speciesLabel?: string;
  public assignedIncidentId?: string;
  public name?: string;
  public stuckTimer = 0;
  public lastDistToTarget = 999;
  public dialogue?: string;
  public interactingBuilding?: string;

  // Multi-waypoint roaming & environment interaction state
  public waypoints: THREE.Vector3[] = [];
  public waypointIndex = 0;
  public pendingInteractionBuilding: PlacedBuilding | null = null;
  public interactionTargetPos: THREE.Vector3 | null = null;
  private wanderSeed: number;

  constructor(cfg: WalkingCitizenConfig) {
    this.group = cfg.group;
    this.targetPos = cfg.targetPos.clone();
    this.speed = cfg.speed;
    this.baseSpeed = cfg.speed;
    this.walkCycle = Math.random() * Math.PI * 2;
    this.collisionRadius = cfg.collisionRadius ?? (cfg.type === 'bird' ? 0.22 : 0.38);
    this.type = cfg.type;
    this.speciesLabel = cfg.speciesLabel;
    this.assignedIncidentId = cfg.assignedIncidentId;
    this.name = cfg.name;
    this.dialogue = cfg.dialogue;
    this.wanderSeed = Math.random() * 100;
  }

  /**
   * Computes a multi-waypoint random roaming path across walkable island paths,
   * paved plazas, and building entrances inside the citizen's quadrant using BFS.
   */
  public planRandomRoamingPath(ctx: RoamingGridContext): void {
    this.interactionTargetPos = null;
    this.interactingBuilding = undefined;
    this.pendingInteractionBuilding = null;
    this.stuckTimer = 0;
    this.lastDistToTarget = 999;

    const pos = this.group.position;
    const signX = pos.x >= 0 ? 1 : -1;
    const signZ = pos.z >= 0 ? 1 : -1;
    const minGx = signX > 0 ? 1 : -ctx.gridRadius;
    const maxGx = signX > 0 ? ctx.gridRadius : -1;
    const minGz = signZ > 0 ? 1 : -ctx.gridRadius;
    const maxGz = signZ > 0 ? ctx.gridRadius : -1;

    const clampGx = (gx: number) => Math.max(minGx, Math.min(maxGx, gx));
    const clampGz = (gz: number) => Math.max(minGz, Math.min(maxGz, gz));

    let startGx = clampGx(Math.round(pos.x / ctx.tileSize));
    let startGz = clampGz(Math.round(pos.z / ctx.tileSize));

    // If start cell is occupied by a building, snap start search to closest walkable neighbor in quadrant
    if (!ctx.isTileWalkable(startGx, startGz)) {
      let bestDist = Infinity;
      for (let gx = minGx; gx <= maxGx; gx++) {
        for (let gz = minGz; gz <= maxGz; gz++) {
          if (ctx.isTileWalkable(gx, gz)) {
            const d = Math.hypot(gx * ctx.tileSize - pos.x, gz * ctx.tileSize - pos.z);
            if (d < bestDist) {
              bestDist = d;
              startGx = gx;
              startGz = gz;
            }
          }
        }
      }
    }

    // BFS across all reachable walkable tiles in this quadrant
    const startKey = `${startGx}_${startGz}`;
    const parentMap = new Map<string, string | null>();
    const cellCoordMap = new Map<string, { gx: number; gz: number }>();
    const queue: { gx: number; gz: number }[] = [{ gx: startGx, gz: startGz }];
    parentMap.set(startKey, null);
    cellCoordMap.set(startKey, { gx: startGx, gz: startGz });

    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];

    let head = 0;
    while (head < queue.length) {
      const cur = queue[head++];
      const curKey = `${cur.gx}_${cur.gz}`;
      // Randomize neighbor order slightly so equivalent-length paths look varied and organic
      const offset = Math.floor(Math.random() * 4);
      for (let i = 0; i < 4; i++) {
        const [dx, dz] = dirs[(i + offset) % 4];
        const nx = cur.gx + dx;
        const nz = cur.gz + dz;
        if (nx < minGx || nx > maxGx || nz < minGz || nz > maxGz) continue;
        if (!ctx.isTileWalkable(nx, nz)) continue;
        const nKey = `${nx}_${nz}`;
        if (!parentMap.has(nKey)) {
          parentMap.set(nKey, curKey);
          cellCoordMap.set(nKey, { gx: nx, gz: nz });
          queue.push({ gx: nx, gz: nz });
        }
      }
    }

    // Build candidate goals:
    // 1) Reachable walkable tiles adjacent to buildings in this quadrant
    const buildingGoals: { gx: number; gz: number; building: PlacedBuilding }[] = [];
    for (const b of ctx.placedBuildings) {
      if (Math.sign(b.centerX || 1) !== signX || Math.sign(b.centerZ || 1) !== signZ) continue;
      for (const cell of b.occupiedCells) {
        for (const [dx, dz] of dirs) {
          const ngx = cell.gx + dx;
          const ngz = cell.gz + dz;
          const key = `${ngx}_${ngz}`;
          if (parentMap.has(key) && Math.hypot(ngx * ctx.tileSize - pos.x, ngz * ctx.tileSize - pos.z) > 1.4) {
            buildingGoals.push({ gx: ngx, gz: ngz, building: b });
          }
        }
      }
    }

    // 2) Reachable paved plaza tiles & sidewalk promenade tiles
    const promenadeGoals: { gx: number; gz: number }[] = [];
    const allReachable: { gx: number; gz: number }[] = [];
    for (const { gx, gz } of cellCoordMap.values()) {
      const distMeters = Math.hypot(gx * ctx.tileSize - pos.x, gz * ctx.tileSize - pos.z);
      if (distMeters < 1.5) continue;
      allReachable.push({ gx, gz });
      const isPaved = ctx.pavedTiles.has(`${gx}_${gz}`);
      const isSidewalk = Math.abs(gx) === 1 || Math.abs(gz) === 1;
      if (isPaved || isSidewalk) {
        promenadeGoals.push({ gx, gz });
      }
    }

    let chosenKey: string | null = null;
    if (this.type !== 'bird' && buildingGoals.length > 0 && Math.random() < 0.65) {
      const pick = buildingGoals[Math.floor(Math.random() * buildingGoals.length)];
      chosenKey = `${pick.gx}_${pick.gz}`;
      this.pendingInteractionBuilding = pick.building;
    } else if (promenadeGoals.length > 0 && Math.random() < 0.55) {
      const pick = promenadeGoals[Math.floor(Math.random() * promenadeGoals.length)];
      chosenKey = `${pick.gx}_${pick.gz}`;
    } else if (allReachable.length > 0) {
      const pick = allReachable[Math.floor(Math.random() * allReachable.length)];
      chosenKey = `${pick.gx}_${pick.gz}`;
    }

    if (chosenKey) {
      // Reconstruct grid path from start to chosen goal
      const rawCells: { gx: number; gz: number }[] = [];
      let trace: string | null = chosenKey;
      while (trace) {
        const coord = cellCoordMap.get(trace);
        if (coord) rawCells.push(coord);
        trace = parentMap.get(trace) ?? null;
      }
      rawCells.reverse();

      const nextWaypoints: THREE.Vector3[] = [];
      const startIdx = rawCells.length > 1 ? 1 : 0;
      for (let i = startIdx; i < rawCells.length; i++) {
        const cell = rawCells[i];
        const isLast = i === rawCells.length - 1;
        let wx = cell.gx * ctx.tileSize;
        let wz = cell.gz * ctx.tileSize;

        if (isLast && this.pendingInteractionBuilding) {
          // Step slightly closer toward the landmark edge without clipping into its AABB
          const dxB = this.pendingInteractionBuilding.centerX - wx;
          const dzB = this.pendingInteractionBuilding.centerZ - wz;
          const lenB = Math.hypot(dxB, dzB);
          if (lenB > 0.01) {
            const candX = wx + (dxB / lenB) * 0.28;
            const candZ = wz + (dzB / lenB) * 0.28;
            if (ctx.isPointWalkable(candX, candZ, this.collisionRadius)) {
              wx = candX;
              wz = candZ;
            }
          }
        } else {
          // Gentle organic offset so paths look natural along sidewalks
          const jx = (Math.random() - 0.5) * 0.42;
          const jz = (Math.random() - 0.5) * 0.42;
          const candX = Math.abs(wx + jx) >= 1.5 ? wx + jx : wx;
          const candZ = Math.abs(wz + jz) >= 1.5 ? wz + jz : wz;
          if (ctx.isPointWalkable(candX, candZ, this.collisionRadius)) {
            wx = candX;
            wz = candZ;
          }
        }

        // Keep strictly outside road curb
        if (Math.abs(wx) < 1.52) wx = signX * 1.58;
        if (Math.abs(wz) < 1.52) wz = signZ * 1.58;

        nextWaypoints.push(new THREE.Vector3(wx, 0, wz));
      }

      if (nextWaypoints.length > 0) {
        this.waypoints = nextWaypoints;
        this.waypointIndex = 0;
        this.targetPos.copy(nextWaypoints[0]);
        return;
      }
    }

    // Fallback: pick any open local walkable point inside quadrant
    const minRoadOffset = 1.62;
    const maxBound = (ctx.gridRadius - 0.45) * ctx.tileSize;
    for (let attempt = 0; attempt < 25; attempt++) {
      const rx = signX * (minRoadOffset + Math.random() * (maxBound - minRoadOffset));
      const rz = signZ * (minRoadOffset + Math.random() * (maxBound - minRoadOffset));
      if (ctx.isPointWalkable(rx, rz, this.collisionRadius)) {
        const pt = new THREE.Vector3(rx, 0, rz);
        this.waypoints = [pt];
        this.waypointIndex = 0;
        this.targetPos.copy(pt);
        return;
      }
    }

    const safePt = new THREE.Vector3(signX * 3.6, 0, signZ * 3.6);
    this.waypoints = [safePt];
    this.waypointIndex = 0;
    this.targetPos.copy(safePt);
  }

  /**
   * Advances to the next waypoint on the path, or triggers a contextual environment interaction
   * when arriving at a building, plaza, tree, or roadside crosswalk.
   */
  public onArriveAtWaypoint(ctx: RoamingGridContext): void {
    if (this.waypointIndex < this.waypoints.length - 1) {
      this.waypointIndex++;
      this.targetPos.copy(this.waypoints[this.waypointIndex]);
      this.stuckTimer = 0;
      this.lastDistToTarget = 999;
      return;
    }

    // Reached final roaming destination -> trigger environment interaction animation!
    if (this.type === 'bird') {
      if (Math.random() < 0.72) {
        this.state = 'pecking';
        this.stateTimer = 1.8 + Math.random() * 1.8;
      } else {
        this.planRandomRoamingPath(ctx);
      }
      return;
    }

    // Check target building or any nearby building within reach
    let nearBuilding = this.pendingInteractionBuilding;
    if (!nearBuilding) {
      for (const b of ctx.placedBuildings) {
        const dToB = Math.hypot(this.group.position.x - b.centerX, this.group.position.z - b.centerZ);
        const reachThreshold = Math.max(b.footprintW, b.footprintD) * 0.9 + 1.25;
        if (dToB < reachThreshold) {
          nearBuilding = b;
          break;
        }
      }
    }

    if (nearBuilding) {
      this.interactionTargetPos = new THREE.Vector3(nearBuilding.centerX, 0, nearBuilding.centerZ);
      this.interactingBuilding = nearBuilding.blueprintId;

      const mt = nearBuilding.modelType;
      const bp = nearBuilding.blueprintId;
      if (mt.includes('coffee') || bp.includes('cafe') || mt.includes('restaurant')) {
        this.state = 'enjoying_cafe';
        this.stateTimer = 2.8 + Math.random() * 1.2;
        this.dialogue = 'The food and coffee smell amazing! Let us practice ordering politely!';
      } else if (mt.includes('hotel') || bp.includes('hotel') || mt.includes('big_ben')) {
        this.state = 'sightseeing_hotel';
        this.stateTimer = 2.8 + Math.random() * 1.2;
        this.dialogue = 'Look how tall that landmark is! Could you tell me how to get there?';
      } else if (mt.includes('bus') || bp.includes('bus') || mt.includes('metro') || mt.includes('bike')) {
        this.state = 'waiting_bus';
        this.stateTimer = 2.8 + Math.random() * 1.2;
        this.dialogue = 'Checking the transit sign! Should we take the metro, ride a bike, or take a bus?';
      } else if (mt.includes('bench') || mt.includes('phone') || mt.includes('post_box')) {
        this.state = 'reading_book';
        this.stateTimer = 2.6 + Math.random() * 1.2;
        this.dialogue = 'Taking a quick break to review my London travel phrases!';
      } else if (mt.includes('fountain') || mt.includes('flower') || mt.includes('tree')) {
        this.state = 'admiring_flower';
        this.stateTimer = 2.8 + Math.random() * 1.2;
        this.dialogue = 'What a refreshing view on TerraLingo Island!';
      } else {
        this.state = 'window_shopping';
        this.stateTimer = 2.4 + Math.random() * 1.1;
        this.dialogue = 'Exploring the shops and buildings along TerraLingo Avenue!';
      }
      return;
    }

    // Near main avenue curb: stop and look both ways like a safety-conscious pedestrian!
    if ((Math.abs(this.group.position.x) < 2.25 || Math.abs(this.group.position.z) < 2.25) && Math.random() < 0.48) {
      this.state = 'waiting_crosswalk';
      this.stateTimer = 2.2 + Math.random() * 1.0;
      const faceRoadX = Math.abs(this.group.position.x) <= Math.abs(this.group.position.z);
      this.interactionTargetPos = faceRoadX
        ? new THREE.Vector3(0, 0, this.group.position.z)
        : new THREE.Vector3(this.group.position.x, 0, 0);
      this.dialogue = 'Looking left and right by the avenue before continuing my walk!';
      return;
    }

    // Open plaza / lawn interactions (sniffing around, checking map on phone, or continuing roam)
    const roll = Math.random();
    if (roll < 0.28) {
      this.state = 'sniffing';
      this.stateTimer = 2.0 + Math.random() * 1.0;
      this.dialogue = 'Sniffing the fresh breeze across the TerraLingo park!';
    } else if (roll < 0.56) {
      this.state = 'checking_phone';
      this.stateTimer = 2.0 + Math.random() * 1.2;
      this.dialogue = 'Checking my map for directions to Station Road!';
    } else {
      this.state = 'walking';
      this.planRandomRoamingPath(ctx);
    }
  }

  /**
   * Procedural limbs, ears, tail, head & body action animations for walking and environment interaction.
   */
  public updateActionAnimation(dt: number, now: number, idx: number, isActuallyMoving: boolean): void {
    const t = now * 0.001 + this.wanderSeed;
    const u = this.group.userData;

    if (isActuallyMoving) {
      this.walkCycle += dt * (this.type === 'bird' ? 8.5 : 6.8);
    }
    const swing = isActuallyMoving ? Math.sin(this.walkCycle) * 0.48 : 0;

    // Smoothly orient character toward the building / curb they are interacting with
    if (!isActuallyMoving && this.state !== 'chatting' && this.interactionTargetPos) {
      const dx = this.interactionTargetPos.x - this.group.position.x;
      const dz = this.interactionTargetPos.z - this.group.position.z;
      if (dx * dx + dz * dz > 0.02) {
        const aimYaw = Math.atan2(dx, dz);
        let diff = (aimYaw - this.group.rotation.y) % (Math.PI * 2);
        if (diff > Math.PI) diff -= Math.PI * 2;
        if (diff < -Math.PI) diff += Math.PI * 2;
        this.group.rotation.y += diff * Math.min(1, 6.5 * dt);
      }
    }

    if (u.isAnimal && u.animalType === 'bird') {
      if (u.headGroup) {
        if (this.state === 'pecking') {
          const peck = Math.sin(now * 0.016 + idx);
          u.headGroup.rotation.x = peck > 0.05 ? 0.58 : -0.08;
          u.headGroup.rotation.y = Math.sin(t * 1.7) * 0.2;
        } else {
          u.headGroup.rotation.x = isActuallyMoving ? Math.sin(this.walkCycle * 2.2) * 0.22 : Math.sin(t * 2.0) * 0.08;
          u.headGroup.rotation.y = Math.sin(t * 1.4) * 0.25;
        }
      }
      if (u.wingL && u.wingR) {
        const flap = isActuallyMoving
          ? Math.abs(Math.sin(this.walkCycle * 1.5)) * 0.38
          : this.state === 'chatting'
          ? Math.abs(Math.sin(now * 0.014)) * 0.55
          : 0.05;
        u.wingL.rotation.z = flap;
        u.wingR.rotation.z = -flap;
      }
      if (u.tail) {
        u.tail.rotation.x = 0.28 + Math.sin(now * 0.01 + idx) * 0.14;
      }
      this.group.position.y = isActuallyMoving
        ? Math.abs(Math.sin(this.walkCycle * 2.6)) * 0.065
        : this.state === 'pecking'
        ? Math.abs(Math.sin(now * 0.016)) * 0.015
        : 0;
      return;
    }

    // Cute Animal Villagers (Rabbit, Dog, Cat, Bear, Mouse)
    let hopY = 0;
    if (isActuallyMoving) {
      hopY = Math.abs(Math.sin(this.walkCycle)) * 0.05;
    } else if (this.state === 'enjoying_cafe' || this.state === 'chatting') {
      hopY = Math.abs(Math.sin(now * 0.008 + idx)) * 0.045;
    } else if (this.state === 'admiring_flower' || this.state === 'sniffing') {
      hopY = Math.abs(Math.sin(now * 0.006 + idx)) * 0.025;
    }
    this.group.position.y = hopY;

    if (u.leftLeg && u.rightLeg) {
      if (this.state === 'waiting_bus') {
        // Impatient cute foot tap while checking bus/metro schedule
        u.leftLeg.rotation.x = Math.max(0, Math.sin(now * 0.012)) * 0.22;
        u.rightLeg.rotation.x = 0;
      } else {
        u.leftLeg.rotation.x = swing;
        u.rightLeg.rotation.x = -swing;
      }
    }

    if (u.tail) {
      const wagSpeed = this.state === 'enjoying_cafe' || this.state === 'admiring_flower' || this.state === 'chatting' ? 0.013 : 0.007;
      u.tail.rotation.y = Math.sin(now * wagSpeed + idx) * 0.45;
    }

    if (u.leftEar && u.rightEar) {
      const earSpeed = this.state === 'sniffing' || this.state === 'waiting_crosswalk' ? 0.012 : 0.006;
      const earBob = Math.sin(now * earSpeed + idx * 2) * (this.state === 'chatting' ? 0.14 : 0.09);
      u.leftEar.rotation.x = earBob;
      u.rightEar.rotation.x = -earBob;
    }

    if (u.headGroup) {
      if (this.state === 'sightseeing_hotel') {
        // Tilt head upward admiring tall architecture
        u.headGroup.rotation.x = -0.3;
        u.headGroup.rotation.y = Math.sin(now * 0.0028) * 0.34;
        u.headGroup.rotation.z = Math.sin(now * 0.0022) * 0.06;
      } else if (this.state === 'admiring_flower' || this.state === 'sniffing') {
        // Lean forward slightly sniffing flowers or park grass
        u.headGroup.rotation.x = 0.26 + Math.sin(now * 0.013) * 0.12;
        u.headGroup.rotation.y = Math.sin(now * 0.0038) * 0.26;
        u.headGroup.rotation.z = 0;
      } else if (this.state === 'waiting_crosswalk') {
        // Look carefully left and right along road
        u.headGroup.rotation.x = 0.04;
        u.headGroup.rotation.y = Math.sin(now * 0.0042 + idx) * 0.65;
        u.headGroup.rotation.z = 0;
      } else if (this.state === 'reading_book' || this.state === 'checking_phone') {
        u.headGroup.rotation.x = 0.22 + Math.sin(now * 0.005) * 0.05;
        u.headGroup.rotation.y = Math.sin(now * 0.002) * 0.08;
        u.headGroup.rotation.z = 0;
      } else if (this.state === 'enjoying_cafe') {
        u.headGroup.rotation.x = Math.sin(now * 0.009) * 0.14;
        u.headGroup.rotation.y = Math.sin(now * 0.003) * 0.15;
        u.headGroup.rotation.z = Math.sin(now * 0.005) * 0.09;
      } else if (this.state === 'chatting') {
        u.headGroup.rotation.x = Math.sin(now * 0.006) * 0.06;
        u.headGroup.rotation.z = Math.sin(now * 0.004) * 0.09;
        u.headGroup.rotation.y = Math.sin(now * 0.003) * 0.14;
      } else if (this.state === 'window_shopping' || this.state === 'waiting_bus') {
        u.headGroup.rotation.x = -0.05;
        u.headGroup.rotation.y = Math.sin(now * 0.0034 + idx) * 0.34;
        u.headGroup.rotation.z = 0;
      } else {
        u.headGroup.rotation.x = isActuallyMoving ? Math.sin(this.walkCycle * 2) * 0.04 : 0;
        u.headGroup.rotation.y = isActuallyMoving ? Math.sin(t * 0.9) * 0.08 : 0;
        u.headGroup.rotation.z = 0;
      }
    }

    if (u.leftArm && u.rightArm) {
      if (this.state === 'checking_phone') {
        u.rightArm.rotation.x = -1.15;
        u.rightArm.rotation.z = -0.28;
        u.leftArm.rotation.x = 0.1;
        u.leftArm.rotation.z = 0;
      } else if (this.state === 'chatting') {
        u.rightArm.rotation.x = -2.1 + Math.sin(now * 0.011) * 0.38;
        u.rightArm.rotation.z = -0.35;
        u.leftArm.rotation.x = 0.12;
        u.leftArm.rotation.z = 0;
      } else if (this.state === 'sightseeing_hotel') {
        // Pointing up excitedly at landmark
        u.rightArm.rotation.x = -1.8 + Math.sin(now * 0.007) * 0.18;
        u.rightArm.rotation.z = -0.2;
        u.leftArm.rotation.x = 0.15;
        u.leftArm.rotation.z = 0;
      } else if (this.state === 'enjoying_cafe') {
        // Cheerful alternating eating/sipping gesture
        u.rightArm.rotation.x = -1.2 + Math.sin(now * 0.011) * 0.25;
        u.rightArm.rotation.z = -0.22;
        u.leftArm.rotation.x = -0.45;
        u.leftArm.rotation.z = 0.12;
      } else if (this.state === 'waiting_bus') {
        u.rightArm.rotation.x = -1.1;
        u.rightArm.rotation.z = -0.18;
        u.leftArm.rotation.x = -0.2;
        u.leftArm.rotation.z = 0;
      } else if (this.state === 'reading_book') {
        u.rightArm.rotation.x = -0.95;
        u.leftArm.rotation.x = -0.95;
        u.rightArm.rotation.z = -0.15;
        u.leftArm.rotation.z = 0.15;
      } else if (this.state === 'admiring_flower' || this.state === 'sniffing') {
        u.leftArm.rotation.x = -0.35 + Math.sin(now * 0.008) * 0.1;
        u.rightArm.rotation.x = -0.35 - Math.sin(now * 0.008) * 0.1;
        u.leftArm.rotation.z = 0.18;
        u.rightArm.rotation.z = -0.18;
      } else if (this.state === 'waiting_crosswalk' || this.state === 'window_shopping') {
        u.leftArm.rotation.x = 0.12;
        u.rightArm.rotation.x = -0.15;
        u.leftArm.rotation.z = 0.06;
        u.rightArm.rotation.z = -0.06;
      } else {
        u.leftArm.rotation.x = -swing;
        u.rightArm.rotation.x = swing;
        u.leftArm.rotation.z = 0;
        u.rightArm.rotation.z = 0;
      }
    }

    if (u.bubbleGroup) {
      u.bubbleGroup.position.y = 0.08 * Math.sin(now * 0.005 + idx);
      u.bubbleGroup.rotation.y = now * 0.0018;
    }
  }
}

export type TimeOfDayMode = 'day' | 'sunset' | 'night' | 'auto';

interface MovingVehicle {
  group: THREE.Group;
  type: 'bus' | 'taxi' | 'scooter' | 'van' | 'car' | 'police';
  axis: 'x' | 'z';
  minCoord: number;
  maxCoord: number;
  fixedCoord: number;
  direction: number;
  speed: number;
  baseSpeed: number;
  currentSpeed: number;
  isBraking: boolean;
  length: number;
  width: number;
}

export class PlanetScene {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private isSoftwareGl = false;

  private islandGroup = new THREE.Group();
  private pavedTilesGroup = new THREE.Group();
  private buildingsGroup = new THREE.Group();
  private gridMarkersGroup = new THREE.Group();
  private editGridGroup = new THREE.Group();
  private cloudsGroup = new THREE.Group();
  private citizensGroup = new THREE.Group();
  private vehiclesGroup = new THREE.Group();

  private keyLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;

  private frameId = 0;
  private isDestroyed = false;

  // Damped Camera Orbit Controls
  private isDragging = false;
  private prevPointerX = 0;
  private prevPointerY = 0;
  private targetAzimuth = Math.PI / 4;
  private currentAzimuth = Math.PI / 4;
  private targetPolar = Math.PI / 3.4;
  private currentPolar = Math.PI / 3.4;
  private targetDistance = 24;
  private currentDistance = 24;
  private targetFov = 45;
  private currentFov = 45;
  private isBirdsEyeView = false;
  private savedPerspBeforeBirdsEye: {
    azimuth: number;
    polar: number;
    distance: number;
    lookAtX: number;
    lookAtY: number;
    lookAtZ: number;
  } | null = null;

  // Placement Grid (Expanded Minecraft Chunk: 13x13 grid)
  private gridRadius = 6; // -6 to +6 (13x13 grid = 169 tiles)
  private tileSize = 1.8;
  private hoverMarker!: THREE.Group;
  private hoverMarkerMesh!: THREE.Mesh;
  private hoverMarkerMat!: THREE.MeshStandardMaterial;
  private hoverMarkerLines!: THREE.LineSegments;
  private hoverMarkerWireMat!: THREE.LineBasicMaterial;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  // Placed Buildings & Paved Tiles State (keyed by instanceId + cell lookup map)
  private placedBuildings: Map<string, PlacedBuilding> = new Map();
  private cellToInstanceId: Map<string, string> = new Map();
  private pavedTiles: Map<string, { type: TilePavingType; mesh: THREE.Mesh }> = new Map();
  private pavingMaterials: Map<string, THREE.MeshStandardMaterial> = new Map();
  public isPavingMode = false;
  public activePavingType: TilePavingType = 'cobblestone';
  private isEditMode = false;
  private activePreviewW = 1;
  private activePreviewD = 1;
  private activePreviewRotation = 0;
  private currentHoverSpanX = 1;
  private currentHoverSpanZ = 1;
  private editGridMaterials: {
    free: THREE.MeshBasicMaterial;
    occupied: THREE.MeshBasicMaterial;
    road: THREE.MeshBasicMaterial;
  } | null = null;

  public onTileClick?: (gridX: number, gridZ: number, existing?: PlacedBuilding) => void;
  public onCitizenClick?: (citizen: WalkingCitizen) => void;

  // Citizen Long Press & Drag Placement State
  private draggingCitizen: WalkingCitizen | null = null;
  private draggingCitizenOrigPos = new THREE.Vector3();
  private pointerDownCitizen: WalkingCitizen | null = null;
  private pointerDownPos = { x: 0, y: 0 };
  private longPressTimeout: number | null = null;
  private isLongPressActive = false;
  private dragGroundIndicator!: THREE.Mesh;
  public onCitizenLongPressStart?: (citizen: WalkingCitizen) => void;
  public onCitizenDrop?: (citizen: WalkingCitizen, targetGx: number, targetGz: number, isValid: boolean) => void;

  // Citizens and Traffic
  private citizens: WalkingCitizen[] = [];
  private vehicles: MovingVehicle[] = [];

  // 3D Voxel Traffic Light Controller & Signal Posts
  private trafficLightPosts: {
    group: THREE.Group;
    redLight: THREE.Mesh;
    amberLight: THREE.Mesh;
    greenLight: THREE.Mesh;
    pedLight: THREE.Mesh;
    facingAxis: 'x' | 'z';
  }[] = [];
  private trafficTimer = 0;
  private currentGreenAxis: 'x' | 'z' = 'x';
  private trafficPhase: 'green' | 'amber' = 'green';

  // Scratch objects & Camera Focus State (Zero GC in render loop)
  private _lookAt = new THREE.Vector3(0, 1.2, 0);
  private targetLookAt = new THREE.Vector3(0, 1.2, 0);
  private focusedCitizen: WalkingCitizen | null = null;
  private savedOverviewCamera: { azimuth: number; polar: number; distance: number } | null = null;
  private _tmpDir = new THREE.Vector3();

  // Time of Day, Dynamic Atmosphere & Belisha Beacons
  private timeMode: TimeOfDayMode = 'day';
  private autoTimeProgress = 0;
  private belishaGlobes: THREE.Mesh[] = [];
  private belishaLightMat!: THREE.MeshStandardMaterial;
  private starrySkyGroup = new THREE.Group();
  private currentIslandTier = 1;
  private islandMaps: Map<number, IslandMapSnapshot> = new Map();
  private isRestoringIsland = false;
  private islandAnimatedObjects: {
    mesh: THREE.Object3D;
    baseAngle: number;
    radius: number;
    baseY: number;
    speed: number;
    bobSpeed: number;
  }[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.container.appendChild(this.canvas);

    this.init();
  }

  private init() {
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0fdf4);
    this.scene.fog = new THREE.Fog(0xf0fdf4, 26, 68);

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Key Light
    this.keyLight = new THREE.DirectionalLight(0xfffaed, 2.4);
    this.keyLight.position.set(18, 28, 18);
    if (!this.isSoftwareGl) {
      this.keyLight.castShadow = true;
      this.keyLight.shadow.mapSize.width = 1024;
      this.keyLight.shadow.mapSize.height = 1024;
      this.keyLight.shadow.camera.near = 0.5;
      this.keyLight.shadow.camera.far = 70;
      const d = 16;
      this.keyLight.shadow.camera.left = -d;
      this.keyLight.shadow.camera.right = d;
      this.keyLight.shadow.camera.top = d;
      this.keyLight.shadow.camera.bottom = -d;
      this.keyLight.shadow.bias = -0.0005;
      this.keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(this.keyLight);

    // Fill Light
    this.hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x166534, 1.2);
    this.scene.add(this.hemiLight);

    // Camera (far=260 supports top-down orthographic dolly zoom cleanly)
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 260);
    this.updateCameraPosition();

    // Groups
    this.scene.add(this.islandGroup);
    this.scene.add(this.pavedTilesGroup);
    this.scene.add(this.buildingsGroup);
    this.scene.add(this.gridMarkersGroup);
    this.editGridGroup.visible = false;
    this.scene.add(this.editGridGroup);
    this.scene.add(this.cloudsGroup);
    this.scene.add(this.citizensGroup);
    this.scene.add(this.vehiclesGroup);

    // Night sky stars points
    const starsGeo = new THREE.BufferGeometry();
    const starCoords: number[] = [];
    for (let s = 0; s < 240; s++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.42;
      const rad = 42 + Math.random() * 12;
      starCoords.push(
        rad * Math.sin(phi) * Math.cos(theta),
        rad * Math.cos(phi),
        rad * Math.sin(phi) * Math.sin(theta)
      );
    }
    starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.75, transparent: true, opacity: 0.85 });
    const stars = new THREE.Points(starsGeo, starsMat);
    this.starrySkyGroup.add(stars);
    this.starrySkyGroup.visible = false;
    this.scene.add(this.starrySkyGroup);

    this.buildIslandTerrain(1);

    // Setup Voxel Hover Placement Block Indicator (supports 1x1, 2x1, 1x2, 2x2 footprints)
    const markerBoxGeo = new THREE.BoxGeometry(this.tileSize * 0.96, 0.18, this.tileSize * 0.96);
    this.hoverMarkerMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.65,
      roughness: 0.2,
      emissive: 0x10b981,
      emissiveIntensity: 0.45,
    });
    this.hoverMarkerMesh = new THREE.Mesh(markerBoxGeo, this.hoverMarkerMat);
    this.hoverMarkerMesh.position.y = 0.09;

    const wireGeo = new THREE.EdgesGeometry(markerBoxGeo);
    this.hoverMarkerWireMat = new THREE.LineBasicMaterial({ color: 0x34d399, linewidth: 2 });
    this.hoverMarkerLines = new THREE.LineSegments(wireGeo, this.hoverMarkerWireMat);
    this.hoverMarkerLines.position.y = 0.09;

    this.hoverMarker = new THREE.Group();
    this.hoverMarker.add(this.hoverMarkerMesh);
    this.hoverMarker.add(this.hoverMarkerLines);
    this.hoverMarker.visible = false;
    this.scene.add(this.hoverMarker);

    this.buildProceduralClouds();

    // Spawn Animated Walking Citizens
    this.spawnWalkingCitizens();

    // Initial Traffic
    this.updateTrafficCount(0);

    this.bindEvents();
    this.startLoop();
  }

  public getEffectiveFootprint(w = 1, d = 1, rotationY = 0): { spanX: number; spanZ: number } {
    const quarterTurns = Math.abs(Math.round(rotationY / (Math.PI / 2))) % 2;
    return quarterTurns === 1 ? { spanX: d, spanZ: w } : { spanX: w, spanZ: d };
  }

  public getOccupiedCells(
    anchorGx: number,
    anchorGz: number,
    w = 1,
    d = 1,
    rotationY = 0
  ): { cells: { gx: number; gz: number }[]; centerGx: number; centerGz: number; spanX: number; spanZ: number } {
    const { spanX, spanZ } = this.getEffectiveFootprint(w, d, rotationY);
    const cells: { gx: number; gz: number }[] = [];
    for (let ix = 0; ix < spanX; ix++) {
      for (let iz = 0; iz < spanZ; iz++) {
        cells.push({ gx: anchorGx + ix, gz: anchorGz + iz });
      }
    }
    const centerGx = anchorGx + (spanX - 1) / 2;
    const centerGz = anchorGz + (spanZ - 1) / 2;
    return { cells, centerGx, centerGz, spanX, spanZ };
  }

  public setActivePlacementFootprint(w = 1, d = 1, rotationY = 0) {
    this.activePreviewW = Math.max(1, w);
    this.activePreviewD = Math.max(1, d);
    this.activePreviewRotation = rotationY;
    const { spanX, spanZ } = this.getEffectiveFootprint(this.activePreviewW, this.activePreviewD, rotationY);
    this.ensureHoverMarkerGeometry(spanX, spanZ);
  }

  private ensureHoverMarkerGeometry(spanX: number, spanZ: number) {
    if (this.currentHoverSpanX === spanX && this.currentHoverSpanZ === spanZ) return;
    this.currentHoverSpanX = spanX;
    this.currentHoverSpanZ = spanZ;

    const width = spanX * this.tileSize - 0.08;
    const depth = spanZ * this.tileSize - 0.08;
    const nextBoxGeo = new THREE.BoxGeometry(width, 0.18, depth);
    const nextWireGeo = new THREE.EdgesGeometry(nextBoxGeo);

    this.hoverMarkerMesh.geometry.dispose();
    this.hoverMarkerMesh.geometry = nextBoxGeo;
    this.hoverMarkerLines.geometry.dispose();
    this.hoverMarkerLines.geometry = nextWireGeo;
  }

  // Check if a point (x, z) with radius r intersects any solid building module or obstacle
  public getClosestObstacleIntersection(x: number, z: number, radius: number): { hit: boolean; pushX: number; pushZ: number } {
    let pushX = 0;
    let pushZ = 0;
    let hit = false;

    for (const b of this.placedBuildings.values()) {
      const { spanX, spanZ } = this.getEffectiveFootprint(b.footprintW, b.footprintD, b.rotationY);
      const halfW = spanX * this.tileSize * 0.47;
      const halfD = spanZ * this.tileSize * 0.47;
      const minX = b.centerX - halfW;
      const maxX = b.centerX + halfW;
      const minZ = b.centerZ - halfD;
      const maxZ = b.centerZ + halfD;

      // Find closest point on AABB to (x, z)
      const cx = Math.max(minX, Math.min(x, maxX));
      const cz = Math.max(minZ, Math.min(z, maxZ));
      const dx = x - cx;
      const dz = z - cz;
      const distSq = dx * dx + dz * dz;

      if (distSq < radius * radius) {
        hit = true;
        const dist = Math.sqrt(distSq);
        if (dist > 0.0001) {
          const overlap = radius - dist;
          pushX += (dx / dist) * overlap;
          pushZ += (dz / dist) * overlap;
        } else {
          // If completely inside the box, push to the nearest edge with margin
          const distToLeft = Math.abs(x - minX);
          const distToRight = Math.abs(maxX - x);
          const distToTop = Math.abs(z - minZ);
          const distToBottom = Math.abs(maxZ - z);
          const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

          if (minDist === distToLeft) pushX -= (radius + distToLeft + 0.05);
          else if (minDist === distToRight) pushX += (radius + distToRight + 0.05);
          else if (minDist === distToTop) pushZ -= (radius + distToTop + 0.05);
          else pushZ += (radius + distToBottom + 0.05);
        }
      }
    }

    // Traffic light poles at the 4 crossroad corners (±1.16, ±1.16)
    const signOffsets = [
      [1.16, 1.16],
      [-1.16, 1.16],
      [1.16, -1.16],
      [-1.16, -1.16],
    ];
    for (const [sx, sz] of signOffsets) {
      const dx = x - sx;
      const dz = z - sz;
      const dSq = dx * dx + dz * dz;
      const minD = radius + 0.22;
      if (dSq < minD * minD) {
        hit = true;
        const d = Math.sqrt(dSq);
        if (d > 0.0001) {
          const overlap = minD - d;
          pushX += (dx / d) * overlap;
          pushZ += (dz / d) * overlap;
        }
      }
    }

    return { hit, pushX, pushZ };
  }

  // Crosswalk positions across avenues in Crossy Road style (every ~1.8 - 2.0 meters along avenues)
  public static readonly CROSSWALK_OFFSETS = [-7.2, -5.4, -3.6, -1.92, 1.92, 3.6, 5.4, 7.2];

  public isNearCrosswalkZ(z: number, threshold = 0.95): boolean {
    return PlanetScene.CROSSWALK_OFFSETS.some(off => Math.abs(z - off) < threshold);
  }

  public isNearCrosswalkX(x: number, threshold = 0.95): boolean {
    return PlanetScene.CROSSWALK_OFFSETS.some(off => Math.abs(x - off) < threshold);
  }

  // Check if a point is free of building obstacles, strictly outside road lanes, and within the island chunk
  public isPointWalkable(x: number, z: number, radius = 0.38): boolean {
    const islandBound = this.gridRadius * this.tileSize - 0.2;
    if (Math.abs(x) > islandBound || Math.abs(z) > islandBound) return false;

    // Pedestrians strictly NOT allowed on road areas (含有馬路貼圖的區塊: |x| < 1.32 || |z| < 1.32)
    if (Math.abs(x) < 1.32 || Math.abs(z) < 1.32) return false;

    for (const b of this.placedBuildings.values()) {
      const { spanX, spanZ } = this.getEffectiveFootprint(b.footprintW, b.footprintD, b.rotationY);
      const halfW = spanX * this.tileSize * 0.47;
      const halfD = spanZ * this.tileSize * 0.47;
      if (
        x >= b.centerX - halfW - radius &&
        x <= b.centerX + halfW + radius &&
        z >= b.centerZ - halfD - radius &&
        z <= b.centerZ + halfD + radius
      ) {
        return false;
      }
    }

    // Corner traffic signal posts
    if (Math.hypot(Math.abs(x) - 1.16, Math.abs(z) - 1.16) < radius + 0.24) return false;

    return true;
  }

  public getRoamingContext(): RoamingGridContext {
    return {
      gridRadius: this.gridRadius,
      tileSize: this.tileSize,
      isTileWalkable: (gx: number, gz: number) =>
        Math.abs(gx) <= this.gridRadius &&
        Math.abs(gz) <= this.gridRadius &&
        gx !== 0 &&
        gz !== 0 &&
        !this.cellToInstanceId.has(`${gx}_${gz}`),
      isPointWalkable: (x: number, z: number, radius: number) => this.isPointWalkable(x, z, radius),
      placedBuildings: this.placedBuildings.values(),
      pavedTiles: this.pavedTiles,
    };
  }

  // Generate a random destination allowing citizens to roam within their quadrant (strictly never crossing or entering roads)
  public getNextRandomDestination(currentPos: THREE.Vector3, type: CitizenAnimalType): THREE.Vector3 {
    const maxBound = (this.gridRadius - 0.45) * this.tileSize; // ~9.99m
    const minRoadOffset = 1.6;

    const signX = currentPos.x >= 0 ? 1 : -1;
    const signZ = currentPos.z >= 0 ? 1 : -1;

    for (let attempt = 0; attempt < 35; attempt++) {
      // Pick random destination within current quadrant, strictly outside road boundaries
      const randX = signX * (minRoadOffset + Math.random() * (maxBound - minRoadOffset));
      const randZ = signZ * (minRoadOffset + Math.random() * (maxBound - minRoadOffset));

      if (this.isPointWalkable(randX, randZ, type === 'bird' ? 0.25 : 0.38)) {
        if (currentPos.distanceTo(this._tmpDir.set(randX, 0, randZ)) > 1.8) {
          return new THREE.Vector3(randX, 0, randZ);
        }
      }
    }

    // Default safe fallback in current quadrant
    return new THREE.Vector3(
      signX * (minRoadOffset + 2.5),
      0,
      signZ * (minRoadOffset + 2.5)
    );
  }

  // Spawn 5 adorable animal villagers (each mapped 1-to-1 to a Unit 5 mini-game) + 2 plaza birds
  private spawnWalkingCitizens() {
    this.citizens = [];
    while (this.citizensGroup.children.length > 0) {
      this.citizensGroup.remove(this.citizensGroup.children[0]);
    }

    const animalConfigs: Array<{
      name: string;
      species: Exclude<CitizenAnimalType, 'bird'>;
      speciesLabel: string;
      assignedIncidentId: string;
      start: THREE.Vector3;
      speed: number;
    }> = [
      {
        name: 'Yuki',
        species: 'rabbit',
        speciesLabel: '小兔導航員',
        assignedIncidentId: 'inc_nav_hotel',
        start: new THREE.Vector3(-6.8, 0, -6.2),
        speed: 1.28,
      },
      {
        name: 'Toby',
        species: 'dog',
        speciesLabel: '小狗禮貌官',
        assignedIncidentId: 'inc_npc_police',
        start: new THREE.Vector3(6.6, 0, -6.0),
        speed: 1.22,
      },
      {
        name: 'Leo',
        species: 'cat',
        speciesLabel: '貓咪快遞員',
        assignedIncidentId: 'inc_courier_dispatch',
        start: new THREE.Vector3(-6.2, 0, 6.6),
        speed: 1.32,
      },
      {
        name: 'Emma',
        species: 'bear',
        speciesLabel: '小熊旅遊家',
        assignedIncidentId: 'inc_handbook_check',
        start: new THREE.Vector3(6.8, 0, 6.4),
        speed: 1.16,
      },
      {
        name: 'Pip',
        species: 'mouse',
        speciesLabel: '小老鼠學伴',
        assignedIncidentId: 'inc_counselor_hotline',
        start: new THREE.Vector3(-3.6, 0, -7.8),
        speed: 1.24,
      },
    ];

    const roamCtx = this.getRoamingContext();

    animalConfigs.forEach(cfg => {
      const group = createCitizenModel(cfg.species);
      group.position.copy(cfg.start);
      this.citizensGroup.add(group);
      const citizen = new WalkingCitizen({
        group,
        targetPos: cfg.start,
        speed: cfg.speed,
        type: cfg.species,
        collisionRadius: 0.38,
        speciesLabel: cfg.speciesLabel,
        assignedIncidentId: cfg.assignedIncidentId,
        name: cfg.name,
      });
      citizen.planRandomRoamingPath(roamCtx);
      this.citizens.push(citizen);
    });

    // Decorative plaza songbirds
    const bird1 = createModelByType('bird');
    const bird1Start = new THREE.Vector3(-3.8, 0, 7.6);
    bird1.position.copy(bird1Start);
    this.citizensGroup.add(bird1);
    const birdCitizen1 = new WalkingCitizen({
      group: bird1,
      targetPos: bird1Start,
      speed: 0.65,
      type: 'bird',
      collisionRadius: 0.22,
      speciesLabel: '廣場小飛鳥',
      name: 'Pippin',
    });
    birdCitizen1.planRandomRoamingPath(roamCtx);
    this.citizens.push(birdCitizen1);

    const bird2 = createModelByType('bird');
    const bird2Start = new THREE.Vector3(7.4, 0, -3.4);
    bird2.position.copy(bird2Start);
    this.citizensGroup.add(bird2);
    const birdCitizen2 = new WalkingCitizen({
      group: bird2,
      targetPos: bird2Start,
      speed: 0.6,
      type: 'bird',
      collisionRadius: 0.22,
      speciesLabel: '廣場小飛鳥',
      name: 'Chirpy',
    });
    birdCitizen2.planRandomRoamingPath(roamCtx);
    this.citizens.push(birdCitizen2);
  }

  // Dynamic Traffic with multiple diverse vehicles across dual lanes (centered at ±0.46 within 1.76m road)
  public updateTrafficCount(correctCount: number) {
    while (this.vehiclesGroup.children.length > 0) {
      this.vehiclesGroup.remove(this.vehiclesGroup.children[0]);
    }
    this.vehicles = [];

    const roadBound = 12.2;
    const laneOffset = 0.46;

    // 1. Lane 1 (Eastbound on Station Road, fixedCoord: +0.46, direction: +1)
    const taxi1 = createModelByType('taxi');
    taxi1.scale.set(0.84, 0.84, 0.84);
    taxi1.position.set(-8.5, 0, laneOffset);
    this.vehiclesGroup.add(taxi1);
    this.vehicles.push({
      group: taxi1,
      type: 'taxi',
      axis: 'x',
      minCoord: -roadBound,
      maxCoord: roadBound,
      fixedCoord: laneOffset,
      direction: 1,
      speed: 2.8,
      baseSpeed: 2.8,
      currentSpeed: 2.8,
      isBraking: false,
      length: 1.4,
      width: 0.68,
    });

    const van = createModelByType('delivery_van');
    van.scale.set(0.6, 0.6, 0.6);
    van.position.set(-2.5, 0, laneOffset);
    this.vehiclesGroup.add(van);
    this.vehicles.push({
      group: van,
      type: 'van',
      axis: 'x',
      minCoord: -roadBound,
      maxCoord: roadBound,
      fixedCoord: laneOffset,
      direction: 1,
      speed: 2.5,
      baseSpeed: 2.5,
      currentSpeed: 2.5,
      isBraking: false,
      length: 1.75,
      width: 0.72,
    });

    // 2. Lane 2 (Westbound on Station Road, fixedCoord: -0.46, direction: -1)
    const bus = createModelByType('red_bus');
    bus.scale.set(0.58, 0.58, 0.58);
    bus.position.set(8.5, 0, -laneOffset);
    this.vehiclesGroup.add(bus);
    this.vehicles.push({
      group: bus,
      type: 'bus',
      axis: 'x',
      minCoord: -roadBound,
      maxCoord: roadBound,
      fixedCoord: -laneOffset,
      direction: -1,
      speed: 2.2,
      baseSpeed: 2.2,
      currentSpeed: 2.2,
      isBraking: false,
      length: 2.2,
      width: 0.74,
    });

    const car = createModelByType('compact_car');
    car.scale.set(0.62, 0.62, 0.62);
    car.position.set(2.8, 0, -laneOffset);
    this.vehiclesGroup.add(car);
    this.vehicles.push({
      group: car,
      type: 'car',
      axis: 'x',
      minCoord: -roadBound,
      maxCoord: roadBound,
      fixedCoord: -laneOffset,
      direction: -1,
      speed: 2.9,
      baseSpeed: 2.9,
      currentSpeed: 2.9,
      isBraking: false,
      length: 1.3,
      width: 0.68,
    });

    // 3. Lane 3 (Southbound on Berkeley Street, fixedCoord: +0.46, direction: +1)
    const police = createModelByType('police_car');
    police.scale.set(0.62, 0.62, 0.62);
    police.position.set(laneOffset, 0, -7.5);
    this.vehiclesGroup.add(police);
    this.vehicles.push({
      group: police,
      type: 'police',
      axis: 'z',
      minCoord: -roadBound,
      maxCoord: roadBound,
      fixedCoord: laneOffset,
      direction: 1,
      speed: 3.1,
      baseSpeed: 3.1,
      currentSpeed: 3.1,
      isBraking: false,
      length: 1.45,
      width: 0.68,
    });

    if (correctCount >= 1) {
      const scooter = createModelByType('scooter');
      scooter.scale.set(0.62, 0.62, 0.62);
      scooter.position.set(laneOffset, 0, -2.0);
      this.vehiclesGroup.add(scooter);
      this.vehicles.push({
        group: scooter,
        type: 'scooter',
        axis: 'z',
        minCoord: -roadBound,
        maxCoord: roadBound,
        fixedCoord: laneOffset,
        direction: 1,
        speed: 3.3,
        baseSpeed: 3.3,
        currentSpeed: 3.3,
        isBraking: false,
        length: 0.9,
        width: 0.5,
      });
    }

    // 4. Lane 4 (Northbound on Berkeley Street, fixedCoord: -0.46, direction: -1)
    const taxi2 = createModelByType('taxi');
    taxi2.scale.set(0.84, 0.84, 0.84);
    taxi2.position.set(-laneOffset, 0, 7.5);
    this.vehiclesGroup.add(taxi2);
    this.vehicles.push({
      group: taxi2,
      type: 'taxi',
      axis: 'z',
      minCoord: -roadBound,
      maxCoord: roadBound,
      fixedCoord: -laneOffset,
      direction: -1,
      speed: 2.8,
      baseSpeed: 2.8,
      currentSpeed: 2.8,
      isBraking: false,
      length: 1.4,
      width: 0.68,
    });
  }

  // Build Floating Island Terrain across 5 Distinct Unlockable Island Themes
  public buildIslandTerrain(tier: number) {
    this.currentIslandTier = Math.max(1, Math.min(5, tier));
    this.islandAnimatedObjects = [];
    while (this.islandGroup.children.length > 0) {
      const child = this.islandGroup.children[0];
      this.islandGroup.remove(child);
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
    }

    // Playable grid covers [-11.7m, +11.7m]; outer rim (>= 11.9m) houses island theme borders without clipping
    const chunkWidth = 25.4 + (this.currentIslandTier - 1) * 0.55;
    const halfChunk = chunkWidth / 2;

    // Island Palette per Tier (1: Emerald, 2: Sakura, 3: Suncoast, 4: Frost Crystal, 5: Starlight Royal)
    const tierColors = [
      { grass: 0x84cc16, dirt: 0x78350f, stone: 0x52525b, curb: 0xd4d4d8 },
      { grass: 0x4ade80, dirt: 0x7c4a2d, stone: 0x64748b, curb: 0xfce7f3 },
      { grass: 0x65a30d, dirt: 0xb45309, stone: 0x78716c, curb: 0xfef3c7 },
      { grass: 0x34d399, dirt: 0x334155, stone: 0x1e3a8a, curb: 0xe0f2fe },
      { grass: 0x10b981, dirt: 0x4c1d95, stone: 0x312e81, curb: 0xfde68a },
    ][this.currentIslandTier - 1];

    // 1. Primary Grass Block Slab
    const grassGeo = new THREE.BoxGeometry(chunkWidth, 0.8, chunkWidth);
    const grassTex = createGrassTexture();
    const grassMat = new THREE.MeshStandardMaterial({
      color: tierColors.grass,
      map: grassTex,
      roughness: 0.85,
      metalness: 0.05,
    });
    const grassMesh = new THREE.Mesh(grassGeo, grassMat);
    grassMesh.position.y = -0.4;
    grassMesh.receiveShadow = true;
    this.islandGroup.add(grassMesh);

    // Outer stepped cliff corner blocks (offset vertically to prevent coplanar Z-fighting with grass top)
    const terraceGeo = new THREE.BoxGeometry(1.8, 0.6, 1.8);
    const terraceMat = new THREE.MeshStandardMaterial({ color: tierColors.stone, roughness: 0.88 });
    const cornerOffsets = [
      [-halfChunk + 0.9, -halfChunk + 0.9],
      [halfChunk - 0.9, -halfChunk + 0.9],
      [-halfChunk + 0.9, halfChunk - 0.9],
      [halfChunk - 0.9, halfChunk - 0.9],
    ];
    cornerOffsets.forEach(([cx, cz]) => {
      const tMesh = new THREE.Mesh(terraceGeo, terraceMat);
      tMesh.position.set(cx, -0.36, cz);
      tMesh.receiveShadow = true;
      this.islandGroup.add(tMesh);
    });

    // 2. Sub-surface Strata Layers
    const dirtMesh = new THREE.Mesh(
      new THREE.BoxGeometry(chunkWidth - 0.8, 1.4, chunkWidth - 0.8),
      new THREE.MeshStandardMaterial({ color: tierColors.dirt, roughness: 0.95 })
    );
    dirtMesh.position.y = -1.5;
    dirtMesh.receiveShadow = true;
    this.islandGroup.add(dirtMesh);

    const stoneMesh = new THREE.Mesh(
      new THREE.BoxGeometry(chunkWidth - 2.8, 1.8, chunkWidth - 2.8),
      new THREE.MeshStandardMaterial({ color: tierColors.stone, roughness: 0.92 })
    );
    stoneMesh.position.y = -3.1;
    stoneMesh.receiveShadow = true;
    this.islandGroup.add(stoneMesh);

    const deepslateMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9 });
    const bedrockMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.95 });

    const keelTier1 = new THREE.Mesh(new THREE.BoxGeometry(chunkWidth - 6.2, 2.0, chunkWidth - 6.2), deepslateMat);
    keelTier1.position.y = -5.0;
    this.islandGroup.add(keelTier1);

    const keelTier2 = new THREE.Mesh(new THREE.BoxGeometry(chunkWidth - 10.4, 2.2, chunkWidth - 10.4), deepslateMat);
    keelTier2.position.y = -7.1;
    this.islandGroup.add(keelTier2);

    const keelTier3 = new THREE.Mesh(new THREE.BoxGeometry(chunkWidth - 15.2, 2.4, chunkWidth - 15.2), bedrockMat);
    keelTier3.position.y = -9.4;
    this.islandGroup.add(keelTier3);

    const keelAnchor = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.2, 4.2), bedrockMat);
    keelAnchor.position.y = -11.7;
    this.islandGroup.add(keelAnchor);

    // 3. Embedded Glowing Ore Blocks in Cliff Faces
    const oreGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
    const diamondOreMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.9,
      roughness: 0.2,
    });
    const goldOreMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.8,
      roughness: 0.3,
    });
    const redstoneOreMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 0.95,
      roughness: 0.2,
    });

    const orePositions: [number, number, number, THREE.Material][] = [
      [halfChunk - 1.8, -2.8, -3.5, diamondOreMat],
      [-halfChunk + 1.8, -3.4, 4.2, goldOreMat],
      [2.5, -5.2, halfChunk - 3.8, redstoneOreMat],
      [-3.2, -6.6, -halfChunk + 4.2, diamondOreMat],
      [halfChunk - 4.5, -7.5, 1.2, goldOreMat],
    ];
    orePositions.forEach(([ox, oy, oz, oMat]) => {
      const ore = new THREE.Mesh(oreGeo, oMat);
      ore.position.set(ox, oy, oz);
      this.islandGroup.add(ore);
    });

    // 4. Island-Specific Outer Perimeter Decorations (strictly outside ±11.9m playable grid -> zero building overlap)
    const rimPos = halfChunk - 0.42;
    if (this.currentIslandTier === 2) {
      // Tier 2: Sakura Blossom Isle (perimeter pink blossom shrubs & gently orbiting sakura petals)
      const sakuraMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.72 });
      const sakuraLightMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.7 });
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.9 });
      for (let i = -2; i <= 2; i++) {
        if (i === 0) continue;
        const offset = i * 4.5;
        const spots: [number, number][] = [
          [offset, rimPos],
          [offset, -rimPos],
          [rimPos, offset],
          [-rimPos, offset],
        ];
        spots.forEach(([sx, sz], idx) => {
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.65, 8), trunkMat);
          trunk.position.set(sx, 0.32, sz);
          this.islandGroup.add(trunk);
          const puff = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.42, 1),
            idx % 2 === 0 ? sakuraMat : sakuraLightMat
          );
          puff.position.set(sx, 0.82, sz);
          this.islandGroup.add(puff);
        });
      }
      // Orbiting pink cherry petals along island rim
      const petalGeo = new THREE.BoxGeometry(0.18, 0.04, 0.14);
      for (let p = 0; p < 14; p++) {
        const angle = (p * Math.PI * 2) / 14;
        const radius = halfChunk + 0.9 + (p % 3) * 0.6;
        const petal = new THREE.Mesh(petalGeo, p % 2 === 0 ? sakuraMat : sakuraLightMat);
        petal.position.set(Math.cos(angle) * radius, 1.2 + (p % 4) * 0.4, Math.sin(angle) * radius);
        this.islandGroup.add(petal);
        this.islandAnimatedObjects.push({
          mesh: petal,
          baseAngle: angle,
          radius,
          baseY: 1.2 + (p % 4) * 0.4,
          speed: 0.14,
          bobSpeed: 1.8 + (p % 3) * 0.4,
        });
      }
    } else if (this.currentIslandTier === 3) {
      // Tier 3: Golden Suncoast Isle (golden sand border, shallow lagoon water skirt, corner coastal palms)
      const sandMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.9 });
      const lagoonMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        roughness: 0.12,
        metalness: 0.35,
        transparent: true,
        opacity: 0.76,
      });
      const sandRim = new THREE.Mesh(new THREE.BoxGeometry(chunkWidth + 1.0, 0.36, chunkWidth + 1.0), sandMat);
      sandRim.position.y = -0.22;
      sandRim.receiveShadow = true;
      this.islandGroup.add(sandRim);

      const waterLagoon = new THREE.Mesh(new THREE.BoxGeometry(chunkWidth + 2.8, 0.22, chunkWidth + 2.8), lagoonMat);
      waterLagoon.position.y = -0.32;
      this.islandGroup.add(waterLagoon);

      const palmWoodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.85 });
      const palmLeafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.72 });
      const palmPos: [number, number][] = [
        [-rimPos, -rimPos],
        [rimPos, -rimPos],
        [-rimPos, rimPos],
        [rimPos, rimPos],
      ];
      palmPos.forEach(([px, pz]) => {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 1.5, 8), palmWoodMat);
        trunk.position.set(px, 0.75, pz);
        this.islandGroup.add(trunk);
        for (let f = 0; f < 4; f++) {
          const frond = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.24), palmLeafMat);
          frond.position.set(px, 1.5, pz);
          frond.rotation.y = (f * Math.PI) / 2 + Math.PI / 4;
          frond.rotation.z = 0.22;
          this.islandGroup.add(frond);
        }
      });
    } else if (this.currentIslandTier === 4) {
      // Tier 4: Frost Crystal Isle (snow border frame, corner ice crystal spires, underside icicles)
      const snowMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55 });
      const iceMat = new THREE.MeshStandardMaterial({
        color: 0x7dd3fc,
        emissive: 0x0284c7,
        emissiveIntensity: 0.5,
        roughness: 0.12,
        metalness: 0.35,
        transparent: true,
        opacity: 0.86,
      });
      const borderT = 0.65;
      const borderSegments: [number, number, number, number][] = [
        [0, halfChunk - borderT / 2, chunkWidth, borderT],
        [0, -halfChunk + borderT / 2, chunkWidth, borderT],
        [halfChunk - borderT / 2, 0, borderT, chunkWidth - borderT * 2],
        [-halfChunk + borderT / 2, 0, borderT, chunkWidth - borderT * 2],
      ];
      borderSegments.forEach(([bx, bz, bw, bd]) => {
        const snowEdge = new THREE.Mesh(new THREE.BoxGeometry(bw, 0.1, bd), snowMat);
        snowEdge.position.set(bx, 0.04, bz);
        this.islandGroup.add(snowEdge);
      });

      const spirePos: [number, number][] = [
        [-rimPos, -rimPos],
        [rimPos, -rimPos],
        [-rimPos, rimPos],
        [rimPos, rimPos],
      ];
      spirePos.forEach(([sx, sz]) => {
        const spire = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.85, 6), iceMat);
        spire.position.set(sx, 0.92, sz);
        this.islandGroup.add(spire);
        const subSpire = new THREE.Mesh(new THREE.ConeGeometry(0.24, 1.1, 6), iceMat);
        subSpire.position.set(sx * 0.94, 0.55, sz * 0.94);
        this.islandGroup.add(subSpire);
      });
    } else if (this.currentIslandTier === 5) {
      // Tier 5: Royal Starlight Metropolis (gilded marble trim, corner starlight obelisks, orbiting crystal ring)
      const goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.22, metalness: 0.85 });
      const starGemMat = new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        emissive: 0x9333ea,
        emissiveIntensity: 1.25,
        roughness: 0.15,
        metalness: 0.4,
      });
      const borderT = 0.55;
      const borderSegments: [number, number, number, number][] = [
        [0, halfChunk - borderT / 2, chunkWidth, borderT],
        [0, -halfChunk + borderT / 2, chunkWidth, borderT],
        [halfChunk - borderT / 2, 0, borderT, chunkWidth - borderT * 2],
        [-halfChunk + borderT / 2, 0, borderT, chunkWidth - borderT * 2],
      ];
      borderSegments.forEach(([bx, bz, bw, bd]) => {
        const goldEdge = new THREE.Mesh(new THREE.BoxGeometry(bw, 0.11, bd), goldTrimMat);
        goldEdge.position.set(bx, 0.045, bz);
        this.islandGroup.add(goldEdge);
      });

      const obeliskPos: [number, number][] = [
        [-rimPos, -rimPos],
        [rimPos, -rimPos],
        [-rimPos, rimPos],
        [rimPos, rimPos],
      ];
      obeliskPos.forEach(([ox, oz]) => {
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.35, 0.7), goldTrimMat);
        plinth.position.set(ox, 0.68, oz);
        this.islandGroup.add(plinth);
        const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 0), starGemMat);
        star.position.set(ox, 1.9, oz);
        this.islandGroup.add(star);
      });

      for (let g = 0; g < 8; g++) {
        const angle = (g * Math.PI * 2) / 8;
        const radius = halfChunk + 1.5;
        const gem = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.32, 0),
          g % 2 === 0 ? starGemMat : goldTrimMat
        );
        gem.position.set(Math.cos(angle) * radius, 0.9, Math.sin(angle) * radius);
        this.islandGroup.add(gem);
        this.islandAnimatedObjects.push({
          mesh: gem,
          baseAngle: angle,
          radius,
          baseY: 0.9,
          speed: 0.22,
          bobSpeed: 2.2,
        });
      }
    }

    // 5. Central Crossroad Asphalt Avenues (1.76m road width keeps tile ±1 clear; parallel dashed lane marks)
    const roadWidth = 1.76;
    const roadTexH = createRoadTexture();
    roadTexH.repeat.set(1, chunkWidth / 5.2);
    roadTexH.needsUpdate = true;

    const roadMatH = new THREE.MeshStandardMaterial({
      map: roadTexH,
      roughness: 0.65,
      metalness: 0.1,
      polygonOffset: true,
      polygonOffsetFactor: -1.2,
      polygonOffsetUnits: -1.2,
    });

    const roadTexV = createRoadTexture();
    roadTexV.repeat.set(1, chunkWidth / 5.2);
    roadTexV.needsUpdate = true;

    const roadMatV = new THREE.MeshStandardMaterial({
      map: roadTexV,
      roughness: 0.65,
      metalness: 0.1,
      polygonOffset: true,
      polygonOffsetFactor: -1.4,
      polygonOffsetUnits: -1.4,
    });

    const roadH = new THREE.Mesh(new THREE.BoxGeometry(roadWidth, 0.04, chunkWidth + 0.04), roadMatH);
    roadH.rotation.y = Math.PI / 2;
    roadH.position.set(0, 0.02, 0);
    roadH.receiveShadow = true;
    this.islandGroup.add(roadH);

    const roadV = new THREE.Mesh(new THREE.BoxGeometry(roadWidth, 0.05, chunkWidth + 0.04), roadMatV);
    roadV.position.set(0, 0.025, 0);
    roadV.receiveShadow = true;
    this.islandGroup.add(roadV);

    // Clean black asphalt square at the crossroad intersection center (0, 0)
    const intersectionMat = new THREE.MeshStandardMaterial({
      color: 0x121316,
      roughness: 0.65,
      metalness: 0.1,
      polygonOffset: true,
      polygonOffsetFactor: -1.6,
      polygonOffsetUnits: -1.6,
    });
    const intersectionBox = new THREE.Mesh(new THREE.BoxGeometry(roadWidth - 0.02, 0.052, roadWidth - 0.02), intersectionMat);
    intersectionBox.position.set(0, 0.026, 0);
    intersectionBox.receiveShadow = true;
    this.islandGroup.add(intersectionBox);

    // Sidewalk Curbs split cleanly into 4 quadrant arms so they NEVER clip across the central intersection
    const curbMat = new THREE.MeshStandardMaterial({ color: tierColors.curb, roughness: 0.6 });
    const curbCenterOffset = roadWidth / 2 + 0.07; // 0.95m (inner edge 0.88m, outer edge 1.02m — clears tile ±1 at 0.90m+ cleanly)
    const armStart = curbCenterOffset + 0.07; // 1.02m
    const armLen = halfChunk - armStart;
    const armMid = armStart + armLen / 2;

    [-curbCenterOffset, curbCenterOffset].forEach(zPos => {
      [-armMid, armMid].forEach(xMid => {
        const curbArmH = new THREE.Mesh(new THREE.BoxGeometry(armLen, 0.06, 0.14), curbMat);
        curbArmH.position.set(xMid, 0.03, zPos);
        this.islandGroup.add(curbArmH);
      });
    });

    [-curbCenterOffset, curbCenterOffset].forEach(xPos => {
      [-armMid, armMid].forEach(zMid => {
        const curbArmV = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, armLen), curbMat);
        curbArmV.position.set(xPos, 0.03, zMid);
        this.islandGroup.add(curbArmV);
      });
    });

    // Belisha light material reference preserved for smooth tick pulse
    this.belishaLightMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 2.2,
      roughness: 0.15,
    });
    this.belishaGlobes = [];

    // 6. Citizen Placement Ground Indicator
    const indicatorGeo = new THREE.RingGeometry(0.35, 0.78, 32);
    indicatorGeo.rotateX(-Math.PI / 2);
    const indicatorMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.85,
      roughness: 0.2,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    });
    this.dragGroundIndicator = new THREE.Mesh(indicatorGeo, indicatorMat);
    this.dragGroundIndicator.position.y = 0.04;
    this.dragGroundIndicator.visible = false;
    this.islandGroup.add(this.dragGroundIndicator);

    // 7. Voxel 3D Traffic Light Posts at 4 Crossroad Corners (outside curbs at ±1.16m)
    this.trafficLightPosts = [];
    const tlCornerOffsets = [
      { tx: 1.16, tz: 1.16, rotY: 0, facingAxis: 'x' as const },
      { tx: -1.16, tz: 1.16, rotY: Math.PI / 2, facingAxis: 'z' as const },
      { tx: -1.16, tz: -1.16, rotY: Math.PI, facingAxis: 'x' as const },
      { tx: 1.16, tz: -1.16, rotY: -Math.PI / 2, facingAxis: 'z' as const },
    ];

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.7, metalness: 0.5 });
    const headMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.8 });

    tlCornerOffsets.forEach(({ tx, tz, rotY, facingAxis }) => {
      const tlGroup = new THREE.Group();
      tlGroup.position.set(tx, 0, tz);
      tlGroup.rotation.y = rotY;

      const pole = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.85, 0.1), poleMat);
      pole.position.y = 0.925;
      pole.castShadow = true;
      tlGroup.add(pole);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.6, 0.18), headMat);
      head.position.set(0, 1.7, 0);
      tlGroup.add(head);

      const redLight = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.12, 0.06),
        new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1.6 })
      );
      redLight.position.set(0, 1.88, 0.08);
      tlGroup.add(redLight);

      const amberLight = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.12, 0.06),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.15 })
      );
      amberLight.position.set(0, 1.7, 0.08);
      tlGroup.add(amberLight);

      const greenLight = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.12, 0.06),
        new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.15 })
      );
      greenLight.position.set(0, 1.52, 0.08);
      tlGroup.add(greenLight);

      const pedBox = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.28, 0.14), headMat);
      pedBox.position.set(0.12, 1.15, 0);
      tlGroup.add(pedBox);

      const pedLight = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.08, 0.04),
        new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 1.2 })
      );
      pedLight.position.set(0.12, 1.1, 0.06);
      tlGroup.add(pedLight);

      tlGroup.userData = { isTrafficLight: true, redLight, amberLight, greenLight, pedLight };
      this.islandGroup.add(tlGroup);
      this.trafficLightPosts.push({ group: tlGroup, redLight, amberLight, greenLight, pedLight, facingAxis });
    });

    // Crystal Core underneath at Tier >= 3 (upgraded golden-violet nexus at Tier 5)
    if (this.currentIslandTier >= 3) {
      const isTier5 = this.currentIslandTier === 5;
      const coreColor = isTier5 ? 0xc084fc : 0x38bdf8;
      const coreEmissive = isTier5 ? 0x9333ea : 0x0284c7;
      const coreGroup = new THREE.Group();
      const coreMat = new THREE.MeshStandardMaterial({
        color: coreColor,
        emissive: coreEmissive,
        emissiveIntensity: 0.9,
        roughness: 0.1,
        metalness: 0.8,
      });
      const core = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), coreMat);
      coreGroup.add(core);

      [-0.9, 0.9].forEach(dx => {
        const sub = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), coreMat);
        sub.position.set(dx, 0.4, 0);
        coreGroup.add(sub);
      });

      coreGroup.position.y = -13.5;
      coreGroup.userData = { isCore: true };
      this.islandGroup.add(coreGroup);

      const coreLight = new THREE.PointLight(coreColor, 2.5, 12);
      coreLight.position.y = -13.5;
      this.islandGroup.add(coreLight);
    }

    this.buildGridMarkers();
  }

  // Build Square Minecraft Grid Markers & Edit-Mode Dashed Grid Overlay (all 13x13 = 169 tiles)
  private buildGridMarkers() {
    while (this.gridMarkersGroup.children.length > 0) {
      const child = this.gridMarkersGroup.children[0];
      this.gridMarkersGroup.remove(child);
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
    }

    while (this.editGridGroup.children.length > 0) {
      const child = this.editGridGroup.children[0];
      this.editGridGroup.remove(child);
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
    }

    if (!this.editGridMaterials) {
      this.editGridMaterials = {
        free: new THREE.MeshBasicMaterial({
          map: createDashedGridTexture('#34d399', 'rgba(16, 185, 129, 0.12)'),
          transparent: true,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -3,
          polygonOffsetUnits: -3,
        }),
        occupied: new THREE.MeshBasicMaterial({
          map: createDashedGridTexture('#fbbf24', 'rgba(245, 158, 11, 0.12)'),
          transparent: true,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -3,
          polygonOffsetUnits: -3,
        }),
        road: new THREE.MeshBasicMaterial({
          map: createDashedGridTexture('#f87171', 'rgba(239, 68, 68, 0.10)'),
          transparent: true,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -3,
          polygonOffsetUnits: -3,
        }),
      };
    }

    const tileGeo = new THREE.PlaneGeometry(this.tileSize * 0.94, this.tileSize * 0.94);
    const tileMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.05,
      depthWrite: false,
    });

    const dashedGeo = new THREE.PlaneGeometry(this.tileSize * 0.96, this.tileSize * 0.96);

    for (let gx = -this.gridRadius; gx <= this.gridRadius; gx++) {
      for (let gz = -this.gridRadius; gz <= this.gridRadius; gz++) {
        const tile = new THREE.Mesh(tileGeo, tileMat);
        tile.rotation.x = -Math.PI / 2;
        tile.position.set(gx * this.tileSize, 0.015, gz * this.tileSize);
        tile.userData = { gridX: gx, gridZ: gz };
        this.gridMarkersGroup.add(tile);

        const isRoad = gx === 0 || gz === 0;
        const isOccupied = this.cellToInstanceId.has(`${gx}_${gz}`);
        const dashMat = isRoad
          ? this.editGridMaterials.road
          : isOccupied
          ? this.editGridMaterials.occupied
          : this.editGridMaterials.free;
        const dashTile = new THREE.Mesh(dashedGeo, dashMat);
        dashTile.rotation.x = -Math.PI / 2;
        dashTile.position.set(gx * this.tileSize, 0.036, gz * this.tileSize);
        dashTile.userData = { gridX: gx, gridZ: gz };
        this.editGridGroup.add(dashTile);
      }
    }
  }

  public setEditMode(enabled: boolean) {
    this.isEditMode = enabled;
    this.refreshEditGridOverlay();
  }

  private refreshEditGridOverlay() {
    const shouldShow = this.isEditMode || this.isPavingMode || this.draggingCitizen !== null;
    this.editGridGroup.visible = shouldShow;
    if (!shouldShow || !this.editGridMaterials) return;

    for (const child of this.editGridGroup.children) {
      const mesh = child as THREE.Mesh;
      const gx = mesh.userData.gridX as number;
      const gz = mesh.userData.gridZ as number;
      const isRoad = gx === 0 || gz === 0;
      const isOccupied = this.cellToInstanceId.has(`${gx}_${gz}`);
      mesh.material = isRoad
        ? this.editGridMaterials.road
        : isOccupied
        ? this.editGridMaterials.occupied
        : this.editGridMaterials.free;
    }
  }

  private buildProceduralClouds() {
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.05,
      transparent: true,
      opacity: 0.85,
    });

    for (let i = 0; i < 6; i++) {
      const cloud = new THREE.Group();
      const numPuffs = 4 + Math.floor(Math.random() * 3);
      for (let p = 0; p < numPuffs; p++) {
        // Voxel cloud cubic puffs!
        const puff = new THREE.Mesh(new THREE.BoxGeometry(1.2 + Math.random() * 0.6, 0.8, 1.2 + Math.random() * 0.6), cloudMat);
        puff.position.set((p - numPuffs / 2) * 0.8, Math.random() * 0.3, Math.random() * 0.5);
        cloud.add(puff);
      }
      const angle = (i * Math.PI * 2) / 6;
      const dist = 16 + Math.random() * 5;
      cloud.position.set(Math.cos(angle) * dist, -2.0 + Math.random() * 3.5, Math.sin(angle) * dist);
      cloud.userData = { orbitAngle: angle, orbitDist: dist, speed: 0.0012 + Math.random() * 0.001 };
      this.cloudsGroup.add(cloud);
    }
  }

  // Collision Detection and Placement Validity Checker (Supports multi-tile footprints & strictly protects road lanes)
  public canPlaceAt(
    gx: number,
    gz: number,
    footprintW = 1,
    footprintD = 1,
    rotationY = 0
  ): { canPlace: boolean; reason?: 'occupied' | 'crossroad' | 'road_reserved' | 'out_of_bounds'; existingBuilding?: PlacedBuilding } {
    const { cells } = this.getOccupiedCells(gx, gz, footprintW, footprintD, rotationY);
    for (const cell of cells) {
      if (Math.abs(cell.gx) > this.gridRadius || Math.abs(cell.gz) > this.gridRadius) {
        return { canPlace: false, reason: 'out_of_bounds' };
      }
      if (cell.gx === 0 || cell.gz === 0) {
        return { canPlace: false, reason: 'road_reserved' };
      }
      const existing = this.getBuildingAt(cell.gx, cell.gz);
      if (existing) {
        return { canPlace: false, reason: 'occupied', existingBuilding: existing };
      }
    }
    return { canPlace: true };
  }

  // ==========================================
  // Tile Paving Management (鋪設磁磚功能)
  // ==========================================
  public setPavingMode(enabled: boolean, tileType: TilePavingType = 'cobblestone') {
    this.isPavingMode = enabled;
    this.activePavingType = tileType;
    this.refreshEditGridOverlay();
  }

  public paveTile(gx: number, gz: number, tileType: TilePavingType): boolean {
    if (Math.abs(gx) > this.gridRadius || Math.abs(gz) > this.gridRadius) return false;
    // Roads must remain vehicular asphalt!
    if (gx === 0 || gz === 0) return false;

    const key = `${gx}_${gz}`;
    const existing = this.pavedTiles.get(key);
    if (existing) {
      this.pavedTilesGroup.remove(existing.mesh);
      if (existing.mesh.geometry) existing.mesh.geometry.dispose();
      this.pavedTiles.delete(key);
    }

    // 'grass' restores the natural island lawn
    if (tileType === 'grass') {
      return true;
    }

    let mat = this.pavingMaterials.get(tileType);
    if (!mat) {
      let tex: THREE.CanvasTexture | null = null;
      let col = 0xffffff;
      let rough = 0.8;
      switch (tileType) {
        case 'cobblestone':
          tex = createCobblestoneTexture();
          col = 0xf1f5f9;
          rough = 0.85;
          break;
        case 'red_brick':
          tex = createRedBrickTexture();
          col = 0xffffff;
          rough = 0.9;
          break;
        case 'stone_plaza':
          tex = createStonePlazaTexture();
          col = 0xf8fafc;
          rough = 0.45;
          break;
        case 'terracotta':
          tex = createTerracottaTexture();
          col = 0xffedd5;
          rough = 0.75;
          break;
        case 'wood_deck':
          tex = createWoodDeckTexture();
          col = 0xffffff;
          rough = 0.7;
          break;
        default:
          tex = createCobblestoneTexture();
      }
      mat = new THREE.MeshStandardMaterial({
        map: tex,
        color: col,
        roughness: rough,
        polygonOffset: true,
        polygonOffsetFactor: -1.4,
        polygonOffsetUnits: -1.4,
      });
      this.pavingMaterials.set(tileType, mat);
    }

    const tileGeo = new THREE.PlaneGeometry(this.tileSize * 0.98, this.tileSize * 0.98);
    const tileMesh = new THREE.Mesh(tileGeo, mat);
    tileMesh.rotation.x = -Math.PI / 2;
    tileMesh.position.set(gx * this.tileSize, 0.024, gz * this.tileSize);
    tileMesh.receiveShadow = true;
    this.pavedTilesGroup.add(tileMesh);
    this.pavedTiles.set(key, { type: tileType, mesh: tileMesh });
    if (!this.isRestoringIsland) {
      this.saveCurrentIslandMap();
    }
    return true;
  }

  public getPavedTile(gx: number, gz: number): TilePavingType | undefined {
    return this.pavedTiles.get(`${gx}_${gz}`)?.type;
  }

  public clearPavedTile(gx: number, gz: number): boolean {
    const key = `${gx}_${gz}`;
    const existing = this.pavedTiles.get(key);
    if (existing) {
      this.pavedTilesGroup.remove(existing.mesh);
      if (existing.mesh.geometry) existing.mesh.geometry.dispose();
      this.pavedTiles.delete(key);
      if (!this.isRestoringIsland) {
        this.saveCurrentIslandMap();
      }
      return true;
    }
    return false;
  }

  // Save current island's placed buildings & paved tiles into its independent snapshot
  private saveCurrentIslandMap(): void {
    const buildings: SavedIslandBuilding[] = Array.from(this.placedBuildings.values()).map(b => ({
      blueprintId: b.blueprintId,
      modelType: b.modelType,
      gridX: b.gridX,
      gridZ: b.gridZ,
      rotationY: b.rotationY,
      footprintW: b.footprintW,
      footprintD: b.footprintD,
    }));
    const pavedTiles: SavedIslandPavedTile[] = [];
    this.pavedTiles.forEach((val, key) => {
      const [gxStr, gzStr] = key.split('_');
      pavedTiles.push({
        gx: Number(gxStr),
        gz: Number(gzStr),
        type: val.type,
      });
    });
    this.islandMaps.set(this.currentIslandTier, { buildings, pavedTiles });
  }

  // Switch between the 5 islands, preserving each island's independent buildings & paved tiles
  public switchIsland(targetTier: number): number {
    const nextTier = Math.max(1, Math.min(5, targetTier));
    this.saveCurrentIslandMap();
    if (nextTier === this.currentIslandTier) {
      return nextTier;
    }

    // Clear active island buildings from 3D scene
    while (this.buildingsGroup.children.length > 0) {
      this.buildingsGroup.remove(this.buildingsGroup.children[0]);
    }
    this.placedBuildings.clear();
    this.cellToInstanceId.clear();

    // Clear active island paved tiles from 3D scene
    while (this.pavedTilesGroup.children.length > 0) {
      const child = this.pavedTilesGroup.children[0] as THREE.Mesh;
      this.pavedTilesGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
    }
    this.pavedTiles.clear();

    // Rebuild terrain & outer theme for the target island
    this.currentIslandTier = nextTier;
    this.buildIslandTerrain(nextTier);

    // Restore independent map snapshot for the target island
    const snapshot = this.islandMaps.get(nextTier);
    if (snapshot) {
      this.isRestoringIsland = true;
      for (const pt of snapshot.pavedTiles) {
        this.paveTile(pt.gx, pt.gz, pt.type);
      }
      for (const b of snapshot.buildings) {
        this.placeBuilding(b.blueprintId, b.modelType, b.gridX, b.gridZ, b.rotationY, b.footprintW, b.footprintD);
      }
      this.isRestoringIsland = false;
    }

    // Re-orient & re-plan citizen paths cleanly for the newly loaded island layout
    const roamCtx = this.getRoamingContext();
    const islandBound = this.gridRadius * this.tileSize - 0.35;
    this.citizens.forEach(c => {
      const obs = this.getClosestObstacleIntersection(c.group.position.x, c.group.position.z, c.collisionRadius + 0.08);
      if (obs.hit) {
        c.group.position.x += obs.pushX;
        c.group.position.z += obs.pushZ;
      }
      c.group.position.x = Math.max(-islandBound, Math.min(islandBound, c.group.position.x));
      c.group.position.z = Math.max(-islandBound, Math.min(islandBound, c.group.position.z));
      if (Math.abs(c.group.position.x) < 1.38) c.group.position.x = c.group.position.x >= 0 ? 1.52 : -1.52;
      if (Math.abs(c.group.position.z) < 1.38) c.group.position.z = c.group.position.z >= 0 ? 1.52 : -1.52;

      if (c.state !== 'chatting') {
        c.state = 'walking';
        c.stateTimer = 0;
        c.planRandomRoamingPath(roamCtx);
      }
    });

    this.refreshEditGridOverlay();
    return nextTier;
  }

  public getIslandBuildingCounts(): Record<number, number> {
    this.saveCurrentIslandMap();
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (let t = 1; t <= 5; t++) {
      counts[t] = this.islandMaps.get(t)?.buildings.length ?? 0;
    }
    return counts;
  }

  public placeBuilding(
    blueprintId: string,
    modelType: string,
    gridX: number,
    gridZ: number,
    rotationY = 0,
    footprintW = 1,
    footprintD = 1
  ): PlacedBuilding {
    const { cells, centerGx, centerGz, spanX, spanZ } = this.getOccupiedCells(gridX, gridZ, footprintW, footprintD, rotationY);

    // Clear any existing overlapping buildings before placing
    for (const c of cells) {
      if (this.cellToInstanceId.has(`${c.gx}_${c.gz}`)) {
        this.removeBuilding(c.gx, c.gz);
      }
    }

    const centerX = centerGx * this.tileSize;
    const centerZ = centerGz * this.tileSize;

    const group = createModelByType(modelType);
    group.position.set(centerX, 0, centerZ);
    group.rotation.y = rotationY;

    this.buildingsGroup.add(group);

    // Gently displace any citizen currently overlapping the new multi-tile AABB
    const halfW = spanX * this.tileSize * 0.5 + 0.3;
    const halfD = spanZ * this.tileSize * 0.5 + 0.3;
    this.citizens.forEach(c => {
      const dx = c.group.position.x - centerX;
      const dz = c.group.position.z - centerZ;
      if (Math.abs(dx) < halfW && Math.abs(dz) < halfD) {
        if (Math.abs(dx) > Math.abs(dz)) {
          c.group.position.x = centerX + (dx >= 0 ? halfW : -halfW);
        } else {
          c.group.position.z = centerZ + (dz >= 0 ? halfD : -halfD);
        }
      }
    });

    const instanceId = `bld_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const placed: PlacedBuilding = {
      instanceId,
      blueprintId,
      modelType,
      gridX,
      gridZ,
      rotationY,
      footprintW,
      footprintD,
      centerX,
      centerZ,
      occupiedCells: cells,
      group,
    };
    this.placedBuildings.set(instanceId, placed);
    for (const c of cells) {
      this.cellToInstanceId.set(`${c.gx}_${c.gz}`, instanceId);
    }
    this.refreshEditGridOverlay();
    if (!this.isRestoringIsland) {
      this.saveCurrentIslandMap();
    }
    return placed;
  }

  public removeBuilding(gridX: number, gridZ: number): boolean {
    const instId = this.cellToInstanceId.get(`${gridX}_${gridZ}`);
    if (!instId) return false;
    const item = this.placedBuildings.get(instId);
    if (item) {
      this.buildingsGroup.remove(item.group);
      this.placedBuildings.delete(instId);
      for (const c of item.occupiedCells) {
        this.cellToInstanceId.delete(`${c.gx}_${c.gz}`);
      }
      this.refreshEditGridOverlay();
      if (!this.isRestoringIsland) {
        this.saveCurrentIslandMap();
      }
      return true;
    }
    return false;
  }

  public getBuildingAt(gridX: number, gridZ: number): PlacedBuilding | undefined {
    const instId = this.cellToInstanceId.get(`${gridX}_${gridZ}`);
    return instId ? this.placedBuildings.get(instId) : undefined;
  }

  // Relocate / Move existing placed building
  public pickUpBuilding(gridX: number, gridZ: number): PlacedBuilding | null {
    const instId = this.cellToInstanceId.get(`${gridX}_${gridZ}`);
    if (!instId) return null;
    const item = this.placedBuildings.get(instId);
    if (!item) return null;
    this.buildingsGroup.remove(item.group);
    this.placedBuildings.delete(instId);
    for (const c of item.occupiedCells) {
      this.cellToInstanceId.delete(`${c.gx}_${c.gz}`);
    }
    this.refreshEditGridOverlay();
    if (!this.isRestoringIsland) {
      this.saveCurrentIslandMap();
    }
    return item;
  }

  public cancelMove(building: PlacedBuilding): void {
    this.placeBuilding(
      building.blueprintId,
      building.modelType,
      building.gridX,
      building.gridZ,
      building.rotationY,
      building.footprintW,
      building.footprintD
    );
  }

  public completeMove(building: PlacedBuilding, newGx: number, newGz: number, rotationY = 0): PlacedBuilding {
    return this.placeBuilding(
      building.blueprintId,
      building.modelType,
      newGx,
      newGz,
      rotationY,
      building.footprintW,
      building.footprintD
    );
  }

  public setTimeOfDay(mode: TimeOfDayMode) {
    this.timeMode = mode;
    this.applyTimeOfDayLighting(mode);
  }

  public getTimeOfDay(): TimeOfDayMode {
    return this.timeMode;
  }

  public cycleTimeOfDay(): TimeOfDayMode {
    const modes: TimeOfDayMode[] = ['day', 'sunset', 'night', 'auto'];
    const nextIdx = (modes.indexOf(this.timeMode) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    this.setTimeOfDay(nextMode);
    return nextMode;
  }

  public setEveningTheme(evening: boolean) {
    this.setTimeOfDay(evening ? 'night' : 'day');
  }

  public applyTimeOfDayLighting(mode: TimeOfDayMode) {
    if (mode === 'day') {
      this.scene.background = new THREE.Color(0xf0fdf4);
      this.scene.fog = new THREE.Fog(0xf0fdf4, 26, 68);
      this.keyLight.color.setHex(0xfffaed);
      this.keyLight.intensity = 2.4;
      this.keyLight.position.set(18, 28, 18);
      this.hemiLight.color.setHex(0xe0f2fe);
      this.hemiLight.groundColor.setHex(0x166534);
      this.hemiLight.intensity = 1.2;
      this.starrySkyGroup.visible = false;
    } else if (mode === 'sunset') {
      this.scene.background = new THREE.Color(0xfb7185);
      this.scene.fog = new THREE.Fog(0xfb7185, 22, 60);
      this.keyLight.color.setHex(0xf97316);
      this.keyLight.intensity = 1.9;
      this.keyLight.position.set(28, 12, 10);
      this.hemiLight.color.setHex(0xfde047);
      this.hemiLight.groundColor.setHex(0x4c0519);
      this.hemiLight.intensity = 0.9;
      this.starrySkyGroup.visible = false;
    } else if (mode === 'night') {
      this.scene.background = new THREE.Color(0x090d16);
      this.scene.fog = new THREE.Fog(0x090d16, 20, 58);
      this.keyLight.color.setHex(0x93c5fd);
      this.keyLight.intensity = 0.75;
      this.keyLight.position.set(-16, 24, -14);
      this.hemiLight.color.setHex(0x1e293b);
      this.hemiLight.groundColor.setHex(0x020617);
      this.hemiLight.intensity = 0.45;
      this.starrySkyGroup.visible = true;
    }
  }

  private updateCameraPosition() {
    const x = this._lookAt.x + this.currentDistance * Math.sin(this.currentPolar) * Math.sin(this.currentAzimuth);
    const y = this._lookAt.y + this.currentDistance * Math.cos(this.currentPolar);
    const z = this._lookAt.z + this.currentDistance * Math.sin(this.currentPolar) * Math.cos(this.currentAzimuth);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this._lookAt);
  }

  private computeNpcFocusLookAt(fcPos: THREE.Vector3, azimuth: number): { x: number; y: number; z: number } {
    const viewW = this.container?.clientWidth || window.innerWidth;
    if (viewW >= 640) {
      // Shift lookAt toward camera's right vector so the NPC sits cleanly in the unobstructed left viewport area
      const rightX = Math.cos(azimuth);
      const rightZ = -Math.sin(azimuth);
      return {
        x: fcPos.x + rightX * 1.12,
        y: 0.72,
        z: fcPos.z + rightZ * 1.12,
      };
    }
    // On narrow portrait screens, shift lookAt down slightly so NPC appears in the upper clear area above the compact card
    return {
      x: fcPos.x,
      y: 0.2,
      z: fcPos.z,
    };
  }

  public focusOnCitizen(citizen: WalkingCitizen) {
    if (this.isBirdsEyeView) {
      this.isBirdsEyeView = false;
      this.targetFov = 45;
      this.savedPerspBeforeBirdsEye = null;
    }

    if (!this.focusedCitizen) {
      this.savedOverviewCamera = {
        azimuth: this.targetAzimuth,
        polar: this.targetPolar,
        distance: this.targetDistance,
      };
    } else if (this.focusedCitizen !== citizen) {
      this.focusedCitizen.state = 'walking';
      this.focusedCitizen.stateTimer = 0;
    }

    this.focusedCitizen = citizen;
    citizen.state = 'chatting';
    citizen.stateTimer = 999;

    const aimAz = citizen.group.rotation.y + 0.3;
    const look = this.computeNpcFocusLookAt(citizen.group.position, aimAz);
    this.targetLookAt.set(look.x, look.y, look.z);
    this.targetDistance = 5.4;
    this.targetPolar = Math.PI / 2.6;
    this.targetAzimuth = aimAz;
    this.targetFov = 45;
  }

  public clearCitizenFocus() {
    if (this.focusedCitizen) {
      this.focusedCitizen.state = 'walking';
      this.focusedCitizen.stateTimer = 0;
      this.focusedCitizen = null;
    }
    this.targetLookAt.set(0, 1.2, 0);
    if (this.savedOverviewCamera) {
      this.targetAzimuth = this.savedOverviewCamera.azimuth;
      this.targetPolar = this.savedOverviewCamera.polar;
      this.targetDistance = this.savedOverviewCamera.distance;
      this.savedOverviewCamera = null;
    }
  }

  public setBirdsEyeView(enabled: boolean): boolean {
    if (enabled === this.isBirdsEyeView) return this.isBirdsEyeView;
    this.clearCitizenFocus();
    this.isBirdsEyeView = enabled;

    if (enabled) {
      this.savedPerspBeforeBirdsEye = {
        azimuth: this.targetAzimuth,
        polar: this.targetPolar,
        distance: this.targetDistance,
        lookAtX: this.targetLookAt.x,
        lookAtY: this.targetLookAt.y,
        lookAtZ: this.targetLookAt.z,
      };
      // Smooth top-down orthographic-equivalent projection (narrow FOV + vertical distance)
      this.targetAzimuth = 0;
      this.targetPolar = 0.035;
      this.targetFov = 10.5;
      this.targetDistance = 138;
      this.targetLookAt.set(0, 0, 0);
    } else {
      this.targetFov = 45;
      if (this.savedPerspBeforeBirdsEye) {
        const s = this.savedPerspBeforeBirdsEye;
        this.targetAzimuth = s.azimuth;
        this.targetPolar = s.polar;
        this.targetDistance = s.distance;
        this.targetLookAt.set(s.lookAtX, s.lookAtY, s.lookAtZ);
        this.savedPerspBeforeBirdsEye = null;
      } else {
        this.targetAzimuth = Math.PI / 4;
        this.targetPolar = Math.PI / 3.4;
        this.targetDistance = 24;
        this.targetLookAt.set(0, 1.2, 0);
      }
    }
    return this.isBirdsEyeView;
  }

  public toggleBirdsEyeView(): boolean {
    return this.setBirdsEyeView(!this.isBirdsEyeView);
  }

  public getIsBirdsEyeView(): boolean {
    return this.isBirdsEyeView;
  }

  public resetCamera() {
    this.clearCitizenFocus();
    this.isBirdsEyeView = false;
    this.savedPerspBeforeBirdsEye = null;
    this.targetFov = 45;
    this.targetAzimuth = Math.PI / 4;
    this.targetPolar = Math.PI / 3.4;
    this.targetDistance = 24;
    this.targetLookAt.set(0, 1.2, 0);
  }

  private bindEvents() {
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      this.prevPointerX = clientX;
      this.prevPointerY = clientY;

      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const citizenHits = this.raycaster.intersectObjects(this.citizensGroup.children, true);

      if (citizenHits.length > 0) {
        let clickedCitizen: WalkingCitizen | undefined;
        for (let obj: THREE.Object3D | null = citizenHits[0].object; obj; obj = obj.parent) {
          const found = this.citizens.find(c => c.group === obj);
          if (found) {
            clickedCitizen = found;
            break;
          }
        }

        if (clickedCitizen) {
          this.pointerDownCitizen = clickedCitizen;
          this.pointerDownPos = { x: clientX, y: clientY };
          this.isLongPressActive = false;
          this.isDragging = false;

          if (this.longPressTimeout) clearTimeout(this.longPressTimeout);
          this.longPressTimeout = window.setTimeout(() => {
            if (this.pointerDownCitizen) {
              this.isLongPressActive = true;
              this.draggingCitizen = this.pointerDownCitizen;
              this.draggingCitizenOrigPos.copy(this.pointerDownCitizen.group.position);
              this.draggingCitizen.state = 'idle';
              this.draggingCitizen.group.position.y = 1.35;
              this.dragGroundIndicator.visible = true;
              this.refreshEditGridOverlay();
              this.onCitizenLongPressStart?.(this.draggingCitizen);
            }
          }, 360);
          return;
        }
      }

      this.isDragging = true;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      this.updateHoverRaycast();

      // If user moved significantly before long-press fires, cancel long-press and allow camera orbit
      if (this.pointerDownCitizen && !this.isLongPressActive) {
        if (Math.hypot(clientX - this.pointerDownPos.x, clientY - this.pointerDownPos.y) > 10) {
          if (this.longPressTimeout) {
            clearTimeout(this.longPressTimeout);
            this.longPressTimeout = null;
          }
          this.pointerDownCitizen = null;
          this.isDragging = true;
        }
      }

      // If dragging an NPC, update hovering position & ground target placement indicator
      if (this.isLongPressActive && this.draggingCitizen) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const hitPoint = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(groundPlane, hitPoint);

        if (hitPoint) {
          const gx = Math.round(hitPoint.x / this.tileSize);
          const gz = Math.round(hitPoint.z / this.tileSize);
          const isRoad = gx === 0 || gz === 0 || Math.abs(hitPoint.x) < 1.32 || Math.abs(hitPoint.z) < 1.32;
          const isOccupied = this.cellToInstanceId.has(`${gx}_${gz}`);
          const isOutOfBounds = Math.abs(gx) > this.gridRadius || Math.abs(gz) > this.gridRadius;
          const isValid = !isRoad && !isOccupied && !isOutOfBounds;

          this.draggingCitizen.group.position.set(hitPoint.x, 1.35, hitPoint.z);

          this.dragGroundIndicator.position.set(gx * this.tileSize, 0.04, gz * this.tileSize);
          this.dragGroundIndicator.visible = true;
          const indMat = this.dragGroundIndicator.material as THREE.MeshStandardMaterial;
          indMat.color.setHex(isValid ? 0x10b981 : 0xef4444);
          indMat.emissive.setHex(isValid ? 0x059669 : 0xdc2626);
        }
        return;
      }

      if (!this.isDragging) return;

      const deltaX = clientX - this.prevPointerX;
      const deltaY = clientY - this.prevPointerY;
      this.prevPointerX = clientX;
      this.prevPointerY = clientY;

      this.targetAzimuth -= deltaX * 0.007;
      const minPolar = this.isBirdsEyeView ? 0.02 : 0.2;
      const maxPolar = this.isBirdsEyeView ? 0.35 : Math.PI / 2.1;
      this.targetPolar = Math.max(minPolar, Math.min(maxPolar, this.targetPolar - deltaY * 0.007));
    };

    const onPointerUp = (e: MouseEvent | TouchEvent) => {
      if (this.longPressTimeout) {
        clearTimeout(this.longPressTimeout);
        this.longPressTimeout = null;
      }

      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      // 1. If currently dragging an NPC, drop onto designated block
      if (this.isLongPressActive && this.draggingCitizen) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const hitPoint = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(groundPlane, hitPoint);

        let targetGx = 0;
        let targetGz = 0;
        let isValid = false;
        if (hitPoint) {
          targetGx = Math.round(hitPoint.x / this.tileSize);
          targetGz = Math.round(hitPoint.z / this.tileSize);
          const isRoad = targetGx === 0 || targetGz === 0 || Math.abs(hitPoint.x) < 1.32 || Math.abs(hitPoint.z) < 1.32;
          const isOccupied = this.cellToInstanceId.has(`${targetGx}_${targetGz}`);
          const isOutOfBounds = Math.abs(targetGx) > this.gridRadius || Math.abs(targetGz) > this.gridRadius;
          isValid = !isRoad && !isOccupied && !isOutOfBounds;
        }

        if (isValid) {
          const placeX = targetGx * this.tileSize;
          const placeZ = targetGz * this.tileSize;
          this.draggingCitizen.group.position.set(placeX, 0, placeZ);
          this.draggingCitizen.state = 'walking';
          this.draggingCitizen.planRandomRoamingPath(this.getRoamingContext());
          this.onCitizenDrop?.(this.draggingCitizen, targetGx, targetGz, true);
        } else {
          this.draggingCitizen.group.position.copy(this.draggingCitizenOrigPos);
          this.draggingCitizen.state = 'walking';
          this.draggingCitizen.planRandomRoamingPath(this.getRoamingContext());
          const origGx = Math.round(this.draggingCitizenOrigPos.x / this.tileSize);
          const origGz = Math.round(this.draggingCitizenOrigPos.z / this.tileSize);
          this.onCitizenDrop?.(this.draggingCitizen, origGx, origGz, false);
        }

        this.draggingCitizen = null;
        this.isLongPressActive = false;
        this.dragGroundIndicator.visible = false;
        this.pointerDownCitizen = null;
        this.isDragging = false;
        this.refreshEditGridOverlay();
        return;
      }

      // 2. Short tap / click on NPC (< 360ms): Opens Quest Log modal!
      if (this.pointerDownCitizen) {
        const clicked = this.pointerDownCitizen;
        this.pointerDownCitizen = null;
        this.isDragging = false;
        this.onCitizenClick?.(clicked);
        return;
      }

      if (!this.isDragging) return;
      this.isDragging = false;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      // Check grid tile click
      const intersects = this.raycaster.intersectObjects(this.gridMarkersGroup.children, false);
      if (intersects.length > 0) {
        const hitTile = intersects[0].object;
        const gx = hitTile.userData.gridX;
        const gz = hitTile.userData.gridZ;
        const existing = this.getBuildingAt(gx, gz);
        if (this.onTileClick) {
          this.onTileClick(gx, gz, existing);
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (this.isBirdsEyeView) {
        this.targetDistance = Math.max(75, Math.min(195, this.targetDistance + e.deltaY * 0.065));
      } else {
        this.targetDistance = Math.max(4.0, Math.min(46, this.targetDistance + e.deltaY * 0.015));
      }
    };

    const onResize = () => {
      if (!this.container || !this.renderer || !this.camera) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };

    this.canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    this.canvas.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    this.canvas.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', onResize);
  }

  // Real-time hover raycast with multi-tile footprint preview (Red = collision / blocked; Emerald = clear; Sky = Paving)
  private updateHoverRaycast() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.gridMarkersGroup.children, false);
    if (intersects.length > 0) {
      const tile = intersects[0].object;
      const gx = tile.userData.gridX as number;
      const gz = tile.userData.gridZ as number;
      this.hoverMarker.visible = true;

      if (this.isPavingMode) {
        this.ensureHoverMarkerGeometry(1, 1);
        this.hoverMarker.position.x = tile.position.x;
        this.hoverMarker.position.z = tile.position.z;

        if (gx === 0 || gz === 0) {
          this.hoverMarkerMat.color.setHex(0xef4444);
          this.hoverMarkerMat.emissive.setHex(0xef4444);
          this.hoverMarkerWireMat.color.setHex(0xf87171);
        } else {
          this.hoverMarkerMat.color.setHex(0x0ea5e9);
          this.hoverMarkerMat.emissive.setHex(0x0284c7);
          this.hoverMarkerWireMat.color.setHex(0x38bdf8);
        }
        return;
      }

      const { centerGx, centerGz, spanX, spanZ } = this.getOccupiedCells(
        gx,
        gz,
        this.activePreviewW,
        this.activePreviewD,
        this.activePreviewRotation
      );
      this.ensureHoverMarkerGeometry(spanX, spanZ);
      this.hoverMarker.position.x = centerGx * this.tileSize;
      this.hoverMarker.position.z = centerGz * this.tileSize;

      // Real-time multi-tile collision check for building placement / relocation
      const check = this.canPlaceAt(
        gx,
        gz,
        this.activePreviewW,
        this.activePreviewD,
        this.activePreviewRotation
      );
      if (!check.canPlace) {
        this.hoverMarkerMat.color.setHex(0xef4444);
        this.hoverMarkerMat.emissive.setHex(0xef4444);
        this.hoverMarkerWireMat.color.setHex(0xf87171);
      } else {
        this.hoverMarkerMat.color.setHex(0x10b981);
        this.hoverMarkerMat.emissive.setHex(0x10b981);
        this.hoverMarkerWireMat.color.setHex(0x34d399);
      }
    } else {
      this.hoverMarker.visible = false;
    }
  }

  private startLoop() {
    let lastTime = performance.now();

    const tick = () => {
      if (this.isDestroyed) return;

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Exponential Damping Camera, FOV & LookAt Focus
      const dampSpeed = 1 - Math.exp(-8 * dt);
      if (this.focusedCitizen) {
        const fcPos = this.focusedCitizen.group.position;
        const look = this.computeNpcFocusLookAt(fcPos, this.currentAzimuth);
        this.targetLookAt.set(look.x, look.y, look.z);
        this.focusedCitizen.state = 'chatting';
        this.focusedCitizen.stateTimer = 5;
        // Turn focused animal smoothly toward camera
        const targetFace = this.currentAzimuth;
        let faceDiff = (targetFace - this.focusedCitizen.group.rotation.y) % (Math.PI * 2);
        if (faceDiff > Math.PI) faceDiff -= Math.PI * 2;
        if (faceDiff < -Math.PI) faceDiff += Math.PI * 2;
        this.focusedCitizen.group.rotation.y += faceDiff * Math.min(1, 7.0 * dt);
      }
      this._lookAt.lerp(this.targetLookAt, dampSpeed);
      this.currentAzimuth += (this.targetAzimuth - this.currentAzimuth) * dampSpeed;
      this.currentPolar += (this.targetPolar - this.currentPolar) * dampSpeed;
      this.currentDistance += (this.targetDistance - this.currentDistance) * dampSpeed;
      this.currentFov += (this.targetFov - this.currentFov) * dampSpeed;
      if (Math.abs(this.camera.fov - this.currentFov) > 0.01) {
        this.camera.fov = this.currentFov;
        this.camera.updateProjectionMatrix();
      }
      this.updateCameraPosition();

      // Gentle Island Spin when not dragging, focusing on an NPC, or in Bird's-Eye View
      if (!this.isDragging && !this.focusedCitizen && !this.isBirdsEyeView) {
        this.targetAzimuth += dt * 0.03;
      }

      // Animate Clouds
      this.cloudsGroup.children.forEach(cloud => {
        const u = cloud.userData;
        if (u.orbitAngle !== undefined) {
          u.orbitAngle += u.speed;
          cloud.position.x = Math.cos(u.orbitAngle) * u.orbitDist;
          cloud.position.z = Math.sin(u.orbitAngle) * u.orbitDist;
        }
      });

      // Update Real-time 3D Traffic Light Controller (Pedestrian Safety & Flow Cycle)
      this.trafficTimer += dt;
      const cycleTime = 16.0; // 16s cycle
      const cycleSec = this.trafficTimer % cycleTime;
      // 0 - 6s: X-road (Station Rd) Green, Z-road (Berkeley St) Red
      // 6 - 8s: X-road Amber, Z-road Red
      // 8 - 14s: Z-road Green, X-road Red
      // 14 - 16s: Z-road Amber, X-road Red
      if (cycleSec < 6.0) {
        this.currentGreenAxis = 'x';
        this.trafficPhase = 'green';
      } else if (cycleSec < 8.0) {
        this.currentGreenAxis = 'x';
        this.trafficPhase = 'amber';
      } else if (cycleSec < 14.0) {
        this.currentGreenAxis = 'z';
        this.trafficPhase = 'green';
      } else {
        this.currentGreenAxis = 'z';
        this.trafficPhase = 'amber';
      }

      this.trafficLightPosts.forEach(tl => {
        const isAxisActive = this.currentGreenAxis === tl.facingAxis;
        const isAmber = isAxisActive && this.trafficPhase === 'amber';
        const isGreen = isAxisActive && this.trafficPhase === 'green';
        const isRed = !isAxisActive;

        const redMat = tl.redLight.material as THREE.MeshStandardMaterial;
        const amberMat = tl.amberLight.material as THREE.MeshStandardMaterial;
        const greenMat = tl.greenLight.material as THREE.MeshStandardMaterial;
        const pedMat = tl.pedLight.material as THREE.MeshStandardMaterial;

        redMat.emissiveIntensity = isRed ? 1.6 : 0.12;
        amberMat.emissiveIntensity = isAmber ? 1.8 : 0.12;
        greenMat.emissiveIntensity = isGreen ? 1.6 : 0.12;

        // Pedestrian walk signal across this street: pedestrians can cross when cars have RED
        const canPedCross = isRed;
        pedMat.color.setHex(canPedCross ? 0x10b981 : 0xef4444);
        pedMat.emissive.setHex(canPedCross ? 0x10b981 : 0xef4444);
        pedMat.emissiveIntensity = 1.4;
      });

      // 1. Vehicle Intersection Management & Obstacle/Vehicle Collision Avoidance
      this.vehicles.forEach(v => {
        let targetSpeed = v.baseSpeed;
        const currentCoord = v.group.position[v.axis];
        const isHeadingCenter = currentCoord * v.direction < 0; // heading toward crossroad center (0,0)
        const distToCenter = Math.abs(currentCoord);

        // A. Traffic Light Stop Check (Stop at red light before the zebra crosswalk)
        const isGreenForMe = this.currentGreenAxis === v.axis && this.trafficPhase === 'green';
        const approachingStopLine = isHeadingCenter && distToCenter >= 1.25 && distToCenter <= 2.6;
        if (approachingStopLine && !isGreenForMe) {
          targetSpeed = 0; // Halt safely before crosswalk stop line
        }

        // B. Crossroad Intersection Collision Avoidance (Avoid perpendicular crashes at x=0, z=0)
        const approachingIntersection = isHeadingCenter && distToCenter >= 1.35 && distToCenter <= 3.6;
        if (approachingIntersection && isGreenForMe) {
          const perpendicularAxis = v.axis === 'x' ? 'z' : 'x';
          for (const perpV of this.vehicles) {
            if (perpV.axis === perpendicularAxis) {
              const perpDist = Math.abs(perpV.group.position[perpV.axis]);
              const perpInIntersection = perpDist < 1.65;
              if (perpInIntersection) {
                targetSpeed = 0; // Yield to vehicle already inside center box
                break;
              }
            }
          }
        }

        // C. Same-Lane Vehicle Following Distance (Prevent rear-end collisions)
        for (const otherV of this.vehicles) {
          if (otherV !== v && otherV.axis === v.axis && Math.abs(otherV.fixedCoord - v.fixedCoord) < 0.2) {
            if (otherV.direction === v.direction) {
              const aheadDist = (otherV.group.position[v.axis] - currentCoord) * v.direction;
              if (aheadDist > 0 && aheadDist < 3.4) {
                if (aheadDist < 1.85) {
                  targetSpeed = 0; // Safe stop
                } else {
                  targetSpeed = Math.min(targetSpeed, otherV.currentSpeed * 0.7);
                }
              }
            }
          }
        }

        // D. Vehicle vs Pedestrian / Animal on Roadway Collision Avoidance
        for (const c of this.citizens) {
          const cAxisPos = c.group.position[v.axis];
          const cCrossPos = c.group.position[v.axis === 'x' ? 'z' : 'x'];
          const aheadDist = (cAxisPos - currentCoord) * v.direction;
          const crossDist = Math.abs(cCrossPos - v.fixedCoord);

          // If pedestrian is directly crossing ahead in vehicle's travel lane
          if (aheadDist > 0.15 && aheadDist < (v.type === 'bus' ? 2.6 : 1.9) && crossDist < 0.65) {
            targetSpeed = 0; // Brake safely for pedestrian!
            break;
          }
        }

        // Smooth Braking & Acceleration physics
        v.isBraking = targetSpeed < v.currentSpeed - 0.1;
        const rate = targetSpeed === 0 ? 10.0 : 3.8;
        v.currentSpeed += (targetSpeed - v.currentSpeed) * Math.min(1, rate * dt);
        if (v.currentSpeed < 0.05 && targetSpeed === 0) v.currentSpeed = 0;

        // Apply vehicle movement with realistic single-direction lane circulation
        const deltaMove = v.currentSpeed * v.direction * dt;
        if (v.axis === 'x') {
          v.group.position.x += deltaMove;
          v.group.position.z = v.fixedCoord;
          v.group.rotation.y = v.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
          if (v.direction > 0 && v.group.position.x > v.maxCoord) {
            v.group.position.x = v.minCoord;
          } else if (v.direction < 0 && v.group.position.x < v.minCoord) {
            v.group.position.x = v.maxCoord;
          }
        } else {
          v.group.position.z += deltaMove;
          v.group.position.x = v.fixedCoord;
          v.group.rotation.y = v.direction > 0 ? 0 : Math.PI;
          if (v.direction > 0 && v.group.position.z > v.maxCoord) {
            v.group.position.z = v.minCoord;
          } else if (v.direction < 0 && v.group.position.z < v.minCoord) {
            v.group.position.z = v.maxCoord;
          }
        }

        // Animate rolling wheels and emergency flashers
        v.group.traverse(child => {
          if (child.userData?.isWheel) {
            child.rotation.x += v.currentSpeed * v.direction * dt * 4.5;
          }
          if (child.userData?.isBeacon) {
            child.rotation.y += dt * 8.5;
          }
        });
      });

      // 2. Animate Walking Citizens with BFS Walkway Roaming & Environment Interaction Animations
      const roamCtx = this.getRoamingContext();
      this.citizens.forEach((c, cIdx) => {
        if (c === this.draggingCitizen) return;

        // State Machine Handling
        if (c.state !== 'walking') {
          c.stateTimer -= dt;
          if (c.stateTimer <= 0) {
            // Finished environment/social pause! Plan next random roaming path along walkways
            c.state = 'walking';
            c.planRandomRoamingPath(roamCtx);
          }
        }

        // Pedestrians strictly stay within sidewalks/plazas and never step onto roads
        let isWaitingForTraffic = false;

        if (Math.abs(c.group.position.z) <= 1.45 || Math.abs(c.group.position.x) <= 1.45) {
          for (const v of this.vehicles) {
            const distToVeh = c.group.position.distanceTo(v.group.position);
            if (distToVeh < 2.3 && v.currentSpeed > 0.3) {
              isWaitingForTraffic = true;
              break;
            }
          }
        }

        if (c.state === 'walking' && !isWaitingForTraffic) {
          const toTarget = this._tmpDir.copy(c.targetPos).sub(c.group.position);
          toTarget.y = 0;
          const distToTarget = toTarget.length();

          if (distToTarget < 0.42) {
            c.onArriveAtWaypoint(roamCtx);
          } else {
            // Stuck detection: if an obstacle blocks progress, auto-replan a fresh BFS path
            if (Math.abs(c.lastDistToTarget - distToTarget) < 0.025) {
              c.stuckTimer += dt;
              if (c.stuckTimer > 1.0) {
                c.planRandomRoamingPath(roamCtx);
                c.stuckTimer = 0;
              }
            } else {
              c.stuckTimer = Math.max(0, c.stuckTimer - dt);
            }
            c.lastDistToTarget = distToTarget;

            // Movement step with continuous anti-penetration sub-stepping
            const moveDir = toTarget.clone().normalize();

            // Predictive tangential steering around buildings
            const lookDist = 1.05;
            const lookX = c.group.position.x + moveDir.x * lookDist;
            const lookZ = c.group.position.z + moveDir.z * lookDist;
            const lookObs = this.getClosestObstacleIntersection(lookX, lookZ, c.collisionRadius + 0.16);
            if (lookObs.hit) {
              const perp = new THREE.Vector3(lookObs.pushX, 0, lookObs.pushZ).normalize();
              moveDir.addScaledVector(perp, 2.0).normalize();
            }

            // Sub-step movement for 100% penetration prevention against all modules
            const subSteps = 2;
            const stepDt = dt / subSteps;
            for (let s = 0; s < subSteps; s++) {
              c.group.position.addScaledVector(moveDir, c.speed * stepDt);

              // Strict zero-penetration collision resolution
              const obs = this.getClosestObstacleIntersection(c.group.position.x, c.group.position.z, c.collisionRadius);
              if (obs.hit) {
                c.group.position.x += obs.pushX * 0.85;
                c.group.position.z += obs.pushZ * 0.85;

                // Deflect movement velocity along wall tangent (smooth wall sliding)
                const norm = new THREE.Vector2(obs.pushX, obs.pushZ);
                if (norm.lengthSq() > 0.0001) {
                  norm.normalize();
                  const dot = moveDir.x * norm.x + moveDir.z * norm.y;
                  if (dot < 0) {
                    moveDir.x -= dot * norm.x;
                    moveDir.z -= dot * norm.y;
                    if (moveDir.lengthSq() > 0.0001) moveDir.normalize();
                  }
                }
              }
            }

            // Smooth face direction with shortest-angle lerp
            const targetYaw = Math.atan2(moveDir.x, moveDir.z);
            let diff = (targetYaw - c.group.rotation.y) % (Math.PI * 2);
            if (diff > Math.PI) diff -= Math.PI * 2;
            if (diff < -Math.PI) diff += Math.PI * 2;
            c.group.rotation.y += diff * Math.min(1, 9.0 * dt);
          }
        }

        // Hard collision resolution against all building modules
        const finalObs = this.getClosestObstacleIntersection(c.group.position.x, c.group.position.z, c.collisionRadius);
        if (finalObs.hit) {
          c.group.position.x += finalObs.pushX * 0.85;
          c.group.position.z += finalObs.pushZ * 0.85;
        }

        // Inter-character separation (pedestrians & animals never merge, soft repulsion)
        for (let j = cIdx + 1; j < this.citizens.length; j++) {
          const otherC = this.citizens[j];
          if (otherC === this.draggingCitizen) continue;
          const dx = c.group.position.x - otherC.group.position.x;
          const dz = c.group.position.z - otherC.group.position.z;
          const d = Math.hypot(dx, dz);
          if (c.type !== 'bird' && otherC.type !== 'bird' && d < 1.35 && c.state === 'walking' && otherC.state === 'walking') {
            if (Math.random() < 0.04) {
              c.state = 'chatting';
              c.stateTimer = 2.4;
              c.interactionTargetPos = otherC.group.position.clone();
              c.dialogue = `Good day, ${otherC.name || 'friend'}! Nice seeing you on the avenue!`;
              otherC.state = 'chatting';
              otherC.stateTimer = 2.4;
              otherC.interactionTargetPos = c.group.position.clone();
              otherC.dialogue = `Hi ${c.name || 'neighbor'}! Enjoying the TerraLingo weather!`;
            }
          }

          const minDist = c.collisionRadius + otherC.collisionRadius;
          if (d < minDist && d > 0.0001) {
            const push = (minDist - d) * 0.35;
            const nx = dx / d;
            const nz = dz / d;
            c.group.position.x += nx * push;
            c.group.position.z += nz * push;
            otherC.group.position.x -= nx * push;
            otherC.group.position.z -= nz * push;
          }
        }

        // Island Boundary Clamping
        const islandBound = this.gridRadius * this.tileSize + 0.25;
        c.group.position.x = Math.max(-islandBound, Math.min(islandBound, c.group.position.x));
        c.group.position.z = Math.max(-islandBound, Math.min(islandBound, c.group.position.z));

        // Pedestrian Road Safety: strictly prevent pedestrians from entering road areas (|x| < 1.32 || |z| < 1.32)
        if (Math.abs(c.group.position.x) < 1.32) {
          c.group.position.x = c.group.position.x >= 0 ? 1.38 : -1.38;
        }
        if (Math.abs(c.group.position.z) < 1.32) {
          c.group.position.z = c.group.position.z >= 0 ? 1.38 : -1.38;
        }

        // Procedural Movement & Environment Interaction Animations
        const isActuallyMoving = c.state === 'walking' && !isWaitingForTraffic;
        c.updateActionAnimation(dt, now, cIdx, isActuallyMoving);
      });

      // Animate Fountain Sprays
      this.buildingsGroup.traverse(obj => {
        if (obj.userData?.isFountainSpray) {
          obj.rotation.y += dt * 2.5;
          obj.scale.y = 1.0 + Math.sin(now * 0.006) * 0.2;
        }
      });

      // Animate Island Orbiting Petals / Starlight Gems (zero-GC trig updates)
      const tSec = now * 0.001;
      for (let i = 0; i < this.islandAnimatedObjects.length; i++) {
        const item = this.islandAnimatedObjects[i];
        const ang = item.baseAngle + tSec * item.speed;
        item.mesh.position.x = Math.cos(ang) * item.radius;
        item.mesh.position.z = Math.sin(ang) * item.radius;
        item.mesh.position.y = item.baseY + Math.sin(tSec * item.bobSpeed + item.baseAngle) * 0.24;
        item.mesh.rotation.y += dt * 1.4;
      }

      // Animate Belisha Beacons Flashing (UK Highway Code ~750ms pulse, amber globe glow)
      const isAmberLit = Math.sin(now * 0.0055) > -0.15;
      if (this.belishaLightMat) {
        this.belishaLightMat.emissiveIntensity = isAmberLit ? 2.5 : 0.35;
      }

      // Auto Time-of-Day Transition (隨時間平滑自動日夜輪播)
      if (this.timeMode === 'auto') {
        this.autoTimeProgress = (this.autoTimeProgress + dt * 0.018) % 1.0;
        const p = this.autoTimeProgress;
        let activeCycleMode: TimeOfDayMode = 'day';
        if (p > 0.42 && p <= 0.6) activeCycleMode = 'sunset';
        else if (p > 0.6 && p <= 0.92) activeCycleMode = 'night';
        else if (p > 0.92) activeCycleMode = 'sunset';
        this.applyTimeOfDayLighting(activeCycleMode);
      }

      this.renderer.render(this.scene, this.camera);
      this.frameId = requestAnimationFrame(tick);
    };

    tick();
  }

  public dispose() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.frameId);
    this.renderer.dispose();
  }
}
