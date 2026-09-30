import { clamp01, sampleStory } from "./story";
import type { ExperienceEligibility } from "./quality";

type SceneController = {
  setProgress: (progress: number) => void;
  setVisible: (visible: boolean) => void;
  resize: () => void;
  dispose: () => void;
};

const ROAD_POINTS: readonly [number, number, number][] = [
  [-18, 0, 8],
  [-12, 0, 8],
  [-5, 0, 4],
  [2, 0, 0],
  [8, 0, 2],
  [13, 0, 4],
  [20, 0, 2],
];

function makeRoadGeometry(THREE: any, curve: any) {
  const samples = 180;
  const half = 1.7;
  const thickness = 0.14;
  const positions: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i < samples; i += 1) {
    const u = i / (samples - 1);
    const point = curve.getPointAt(u);
    const tangent = curve.getTangentAt(u).setY(0).normalize();
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    const leftTop = point.clone().addScaledVector(right, -half);
    const rightTop = point.clone().addScaledVector(right, half);
    const leftBottom = leftTop.clone().add(new THREE.Vector3(0, -thickness, 0));
    const rightBottom = rightTop.clone().add(new THREE.Vector3(0, -thickness, 0));
    for (const v of [leftTop, rightTop, leftBottom, rightBottom]) positions.push(v.x, v.y, v.z);
  }
  for (let i = 0; i < samples - 1; i += 1) {
    const a = i * 4, b = a + 4;
    indices.push(a, a + 1, b + 1, a, b + 1, b);
    indices.push(a + 2, b + 3, a + 3, a + 2, b + 2, b + 3);
    indices.push(a, b, b + 2, a, b + 2, a + 2);
    indices.push(a + 1, a + 3, b + 3, a + 1, b + 3, b + 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function makeCar(THREE: any) {
  const car = new THREE.Group();
  car.name = "CarRoot";

  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x153d58,
    metalness: 0.35,
    roughness: 0.32,
    clearcoat: 0.35,
    clearcoatRoughness: 0.3,
  });
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x243844,
    metalness: 0.1,
    roughness: 0.18,
  });
  const tireMaterial = new THREE.MeshStandardMaterial({ color: 0x1b2024, roughness: 0.92 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24), bodyMaterial);
  body.name = "Body";
  body.scale.set(0.89, 0.34, 1.95);
  body.position.y = 0.55;
  body.castShadow = true;
  car.add(body);

  const shoulders = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 18), bodyMaterial);
  shoulders.scale.set(0.86, 0.26, 1.25);
  shoulders.position.set(0, 0.78, -0.12);
  shoulders.castShadow = true;
  car.add(shoulders);

  const glass = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 18), glassMaterial);
  glass.name = "Glass";
  glass.scale.set(0.68, 0.3, 0.88);
  glass.position.set(0, 1.08, -0.16);
  car.add(glass);

  const wheelNames = ["Wheel_FL", "Wheel_FR", "Wheel_RL", "Wheel_RR"] as const;
  const wheelPositions: readonly [number, number, number][] = [
    [-0.87, 0.31, 1.22],
    [0.87, 0.31, 1.22],
    [-0.87, 0.31, -1.22],
    [0.87, 0.31, -1.22],
  ];
  const wheels: any[] = [];
  wheelPositions.forEach((position, index) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.22, 28), tireMaterial);
    wheel.name = wheelNames[index];
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(...position);
    wheel.castShadow = true;
    car.add(wheel);
    wheels.push(wheel);
  });

  return { car, wheels };
}

export function createScene(THREE: any, mount: HTMLElement, quality: ExperienceEligibility): SceneController {
  const scene = new THREE.Scene();
  scene.name = "SceneRoot";
  scene.background = new THREE.Color(0xe8edeb);
  scene.fog = new THREE.Fog(0xe8edeb, 22, 54);

  const renderer = new THREE.WebGLRenderer({
    antialias: quality.quality === "desktopFull",
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.maxDpr));
  renderer.shadowMap.enabled = quality.dynamicShadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = "wd-experience-canvas";
  renderer.domElement.setAttribute("aria-hidden", "true");
  mount.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 120);
  scene.add(camera);

  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(6, 10, 8);
  key.castShadow = quality.dynamicShadows;
  if (key.shadow) {
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.1;
    key.shadow.camera.far = 40;
    key.shadow.camera.left = -8;
    key.shadow.camera.right = 8;
    key.shadow.camera.top = 8;
    key.shadow.camera.bottom = -8;
  }
  scene.add(key);
  scene.add(key.target);

  const fill = new THREE.HemisphereLight(0xf6f3ed, 0x60717c, 0.8);
  scene.add(fill);

  const curve = new THREE.CatmullRomCurve3(
    ROAD_POINTS.map(point => new THREE.Vector3(...point)),
    false,
    "centripetal",
    0.5,
  );

  const roadRoot = new THREE.Group();
  roadRoot.name = "RoadRoot";
  const road = new THREE.Mesh(
    makeRoadGeometry(THREE, curve),
    new THREE.MeshStandardMaterial({ color: 0x516675, metalness: 0, roughness: 0.88 }),
  );
  road.name = "RoadSurface";
  road.receiveShadow = true;
  roadRoot.add(road);

  const markerMaterial = new THREE.MeshStandardMaterial({ color: 0xd7b98e, roughness: 0.7 });
  [0.32, 0.72].forEach((u, index) => {
    const marker = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 24), markerMaterial);
    marker.name = `Marker_0${index + 1}`;
    marker.position.copy(curve.getPointAt(u)).add(new THREE.Vector3(0, 0.03, 0));
    roadRoot.add(marker);
  });
  scene.add(roadRoot);

  const { car, wheels } = makeCar(THREE);
  scene.add(car);

  const contact = new THREE.Mesh(
    new THREE.CircleGeometry(1.35, 48),
    new THREE.MeshBasicMaterial({ color: 0x102736, transparent: true, opacity: 0.13, depthWrite: false }),
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.y = 0.012;
  car.add(contact);

  let targetProgress = 0;
  let currentProgress = 0;
  let visible = true;
  let disposed = false;
  let lastTime = performance.now();
  let loopActive = false;

  const applyProgress = (progress: number) => {
    const sample = quality.mobile
      ? { ...sampleStory(0), p: progress, u: 0.12 }
      : sampleStory(progress);

    const point = curve.getPointAt(sample.u);
    const tangent = curve.getTangentAt(sample.u).setY(0).normalize();
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    const up = new THREE.Vector3(0, 1, 0);

    car.position.copy(point);
    car.rotation.set(0, Math.atan2(tangent.x, tangent.z), 0);

    if (!quality.mobile) {
      const travelled = curve.getLength() * sample.u;
      const spin = -travelled / 0.31;
      wheels.forEach(wheel => { wheel.rotation.x = spin; wheel.rotation.z = Math.PI / 2; });
    }

    let cameraOffset = new THREE.Vector3(...sample.camera);
    if (quality.mobile) {
      const angle = THREE.MathUtils.degToRad(-8 + 16 * clamp01(progress));
      const x = cameraOffset.x * Math.cos(angle) - cameraOffset.z * Math.sin(angle);
      const z = cameraOffset.x * Math.sin(angle) + cameraOffset.z * Math.cos(angle);
      cameraOffset = new THREE.Vector3(x, cameraOffset.y, z);
    }

    camera.position.copy(point)
      .addScaledVector(right, cameraOffset.x)
      .addScaledVector(up, cameraOffset.y)
      .addScaledVector(tangent, cameraOffset.z);

    const targetOffset = new THREE.Vector3(...sample.target);
    const lookTarget = point.clone()
      .addScaledVector(right, targetOffset.x)
      .addScaledVector(up, targetOffset.y)
      .addScaledVector(tangent, targetOffset.z);
    camera.fov = sample.fov;
    camera.updateProjectionMatrix();
    camera.lookAt(lookTarget);

    key.position.copy(point).add(new THREE.Vector3(6, 10, 8));
    key.target.position.copy(point);
    key.target.updateMatrixWorld();
  };

  const resize = () => {
    if (disposed) return;
    const width = Math.max(1, mount.clientWidth);
    const height = Math.max(1, mount.clientHeight);
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.maxDpr));
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };

  const stopLoop = () => {
    if (!loopActive) return;
    renderer.setAnimationLoop(null);
    loopActive = false;
  };

  const startLoop = () => {
    if (disposed || loopActive || !visible || document.hidden) return;
    loopActive = true;
    lastTime = performance.now();
    renderer.setAnimationLoop((time: number) => {
      if (disposed || !visible || document.hidden) {
        stopLoop();
        return;
      }
      const dt = Math.min(0.05, Math.max(0.001, (time - lastTime) / 1000));
      lastTime = time;
      const alpha = 1 - Math.exp(-dt / 0.12);
      currentProgress += (targetProgress - currentProgress) * alpha;
      if (Math.abs(targetProgress - currentProgress) < 0.0005) currentProgress = targetProgress;
      applyProgress(currentProgress);
      renderer.render(scene, camera);
      if (currentProgress === targetProgress) stopLoop();
    });
  };

  const setProgress = (progress: number) => {
    targetProgress = clamp01(progress);
    startLoop();
  };

  const setVisible = (next: boolean) => {
    visible = next;
    if (visible) {
      applyProgress(currentProgress);
      renderer.render(scene, camera);
      startLoop();
    } else {
      stopLoop();
    }
  };

  applyProgress(0);
  resize();

  return {
    setProgress,
    setVisible,
    resize,
    dispose: () => {
      if (disposed) return;
      disposed = true;
      stopLoop();
      scene.traverse((object: any) => {
        object.geometry?.dispose?.();
        const material = object.material;
        if (Array.isArray(material)) material.forEach(item => item.dispose?.());
        else material?.dispose?.();
      });
      renderer.dispose();
      renderer.forceContextLoss?.();
      renderer.domElement.remove();
    },
  };
}
