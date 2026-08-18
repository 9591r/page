import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import helvetikerBold from "three/examples/fonts/helvetiker_bold.typeface.json";

const BRAND_NAMES = [
  "nine",
  "github",
  "facebook",
  "instagram",
  "youtube",
  "twitch",
];

const REFERENCE_MARKS = {
  github: {
    dense: true,
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21V19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26V21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"/></svg>',
  },
  facebook: {
    dense: false,
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19,4V7H17A1,1 0 0,0 16,8V10H19V13H16V20H13V13H11V10H13V7.5C13,5.56 14.57,4 16.5,4C17.33,4 18.16,4.14 19,4Z"/></svg>',
  },
  instagram: {
    dense: false,
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0 0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0 0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0 1 18.5,6.75A1.25,1.25 0 0 1 17.25,8A1.25,1.25 0 0 1 16,6.75A1.25,1.25 0 0 1 17.25,5.5M12,7A5,5 0 0 1 17,12A5,5 0 0 1 12,17A5,5 0 0 1 7,12A5,5 0 0 1 12,7M12,9A3,3 0 0 0 9,12A3,3 0 0 0 12,15A3,3 0 0 0 15,12A3,3 0 0 0 12,9Z"/></svg>',
  },
  youtube: {
    dense: true,
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M21.582,6.057c-0.27-1.12-1.182-1.92-2.316-1.92C16.896,4,12,4,12,4s-4.896,0-7.266,0.137C3.598,4.137,2.686,4.937,2.416,6.057C2,8.196,2,12,2,12s0,3.804,0.416,5.943c0.27,1.12,1.182,1.92,2.316,1.92C7.104,20,12,20,12,20s4.896,0,7.266-0.137c1.134-0.001,2.045-0.801,2.316-1.92C22,15.804,22,12,22,12S22,8.196,21.582,6.057z M10,15.464V8.536L16,12L10,15.464z"/></svg>',
  },
  twitch: {
    dense: false,
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28H17v4.28h-1.43M7 2L3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29l-2.85 2.85h-2.86l-2.5 2.5v-2.5H7.71V3.43h11.43Z"/></svg>',
  },
};

const NINE_FONT = new FontLoader().parse(helvetikerBold);

let controller = null;
let pendingBrand = {
  name: "nine",
  color: "#54d8ff",
  side: "center",
  index: 0,
};

function neonMaterial(color, opacity) {
  const material = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  material.userData.baseOpacity = opacity;
  material.userData.neon = true;
  return material;
}

function vector(point) {
  return new THREE.Vector3(point[0], point[1], point[2] || 0);
}

function addTube(group, points, closed, radius, color) {
  const vectors = points.map(vector);
  let curve;

  if (vectors.length === 2) {
    curve = new THREE.LineCurve3(vectors[0], vectors[1]);
  } else {
    curve = new THREE.CatmullRomCurve3(
      vectors,
      Boolean(closed),
      "centripetal",
      0.5,
    );
  }

  const geometry = new THREE.TubeGeometry(
    curve,
    Math.max(16, vectors.length * 7),
    radius || 0.025,
    5,
    Boolean(closed),
  );
  const material = neonMaterial(color, 0.88);
  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);

  const glowMaterial = neonMaterial(color, 0.12);
  const glow = new THREE.Mesh(geometry, glowMaterial);
  glow.scale.setScalar(1.1);
  group.add(glow);
}

function addNode(group, position, size, color) {
  const geometry = new THREE.IcosahedronGeometry(size || 0.045, 1);
  const material = neonMaterial(color, 0.95);
  const node = new THREE.Mesh(geometry, material);
  node.position.copy(vector(position));
  group.add(node);
}

function circlePoints(radius, centerX, centerY, count) {
  const points = [];
  const total = count || 32;
  for (let index = 0; index < total; index += 1) {
    const angle = (index / total) * Math.PI * 2;
    points.push([
      centerX + Math.cos(angle) * radius,
      centerY + Math.sin(angle) * radius,
      0,
    ]);
  }
  return points;
}

function roundedRectanglePoints(width, height, radius, segments) {
  const points = [];
  const corners = [
    [width / 2 - radius, height / 2 - radius, 0],
    [-width / 2 + radius, height / 2 - radius, Math.PI / 2],
    [-width / 2 + radius, -height / 2 + radius, Math.PI],
    [width / 2 - radius, -height / 2 + radius, Math.PI * 1.5],
  ];
  const segmentCount = segments || 5;

  corners.forEach(function (corner) {
    for (let index = 0; index <= segmentCount; index += 1) {
      const angle = corner[2] + (index / segmentCount) * (Math.PI / 2);
      points.push([
        corner[0] + Math.cos(angle) * radius,
        corner[1] + Math.sin(angle) * radius,
        0,
      ]);
    }
  });

  return points;
}

function createNineMark(color) {
  const group = new THREE.Group();
  const ring = circlePoints(0.77, -0.08, 0.43, 34);
  addTube(group, ring, true, 0.027, color);
  addTube(
    group,
    [
      [0.62, 0.52, 0],
      [0.63, 0.05, 0.03],
      [0.52, -0.55, 0],
      [0.16, -1.2, -0.02],
      [-0.33, -1.48, 0],
    ],
    false,
    0.032,
    color,
  );

  [
    [ring[2], ring[19]],
    [ring[6], ring[23]],
    [ring[10], ring[28]],
    [ring[14], ring[32]],
    [
      [0.6, 0.07, 0],
      [0.15, -1.18, 0],
    ],
  ].forEach(function (line) {
    addTube(group, line, false, 0.011, color);
  });

  [ring[2], ring[6], ring[10], ring[14], ring[19], ring[23], ring[28]].forEach(
    function (point) {
      addNode(group, point, 0.038, color);
    },
  );
  addNode(group, [-0.33, -1.48, 0], 0.05, color);
  return group;
}

function createGithubMark(color) {
  const group = new THREE.Group();
  const outline = [
    [-0.94, 0.17],
    [-0.92, 0.64],
    [-0.64, 1.02],
    [-0.27, 0.84],
    [0.25, 0.84],
    [0.65, 1.03],
    [0.93, 0.58],
    [0.94, 0.08],
    [0.73, -0.43],
    [0.34, -0.68],
    [0.18, -1.12],
    [-0.18, -1.12],
    [-0.34, -0.68],
    [-0.74, -0.42],
  ];
  addTube(group, outline, true, 0.034, color);
  addTube(
    group,
    [
      [-0.32, -0.68],
      [-0.73, -0.72],
      [-0.96, -0.54],
      [-1.12, -0.72],
    ],
    false,
    0.026,
    color,
  );
  addNode(group, [-0.34, 0.08], 0.065, color);
  addNode(group, [0.34, 0.08], 0.065, color);
  addTube(group, [[-0.3, -0.28], [0.3, -0.28]], false, 0.02, color);
  return group;
}

function createFacebookMark(color) {
  const group = new THREE.Group();
  addTube(
    group,
    [
      [0.35, 1.25],
      [-0.08, 1.24],
      [-0.4, 0.98],
      [-0.43, 0.55],
      [-0.43, -1.25],
    ],
    false,
    0.082,
    color,
  );
  addTube(group, [[-0.85, 0.38], [0.52, 0.38]], false, 0.082, color);
  addTube(group, [[-0.4, 0.78], [0.45, 0.78]], false, 0.04, color);
  return group;
}

function createInstagramMark(color) {
  const group = new THREE.Group();
  addTube(
    group,
    roundedRectanglePoints(2.1, 2.1, 0.45, 6),
    true,
    0.036,
    color,
  );
  addTube(group, circlePoints(0.52, 0, 0, 30), true, 0.035, color);
  addNode(group, [0.68, 0.68, 0], 0.095, color);
  return group;
}

function createYoutubeMark(color) {
  const group = new THREE.Group();
  addTube(
    group,
    roundedRectanglePoints(2.45, 1.65, 0.42, 6),
    true,
    0.038,
    color,
  );
  addTube(
    group,
    [
      [-0.28, 0.48],
      [0.58, 0],
      [-0.28, -0.48],
    ],
    true,
    0.036,
    color,
  );
  return group;
}

function createTwitchMark(color) {
  const group = new THREE.Group();
  addTube(
    group,
    [
      [-1.03, 1.06],
      [1.03, 1.06],
      [1.03, -0.48],
      [0.42, -1.08],
      [-0.16, -1.08],
      [-0.58, -1.42],
      [-0.58, -1.08],
      [-1.03, -1.08],
    ],
    true,
    0.038,
    color,
  );
  addTube(group, [[-0.31, 0.5], [-0.31, -0.38]], false, 0.07, color);
  addTube(group, [[0.37, 0.5], [0.37, -0.38]], false, 0.07, color);
  return group;
}

function createFallbackMark(name, color) {
  if (name === "nine") {
    return createNineMark(color);
  }
  if (name === "github") {
    return createGithubMark(color);
  }
  if (name === "facebook") {
    return createFacebookMark(color);
  }
  if (name === "instagram") {
    return createInstagramMark(color);
  }
  if (name === "youtube") {
    return createYoutubeMark(color);
  }
  return createTwitchMark(color);
}

function createReferenceSvgMark(svgText, color, dense) {
  const loader = new SVGLoader();
  const data = loader.parse(svgText);
  const group = new THREE.Group();

  data.paths.forEach(function (path) {
    SVGLoader.createShapes(path).forEach(function (shape) {
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 2.5,
        bevelEnabled: true,
        bevelThickness: 0.8,
        bevelSize: 0.4,
        bevelSegments: dense ? 5 : 1,
        curveSegments: dense ? 16 : 2,
      });
      geometry.center();

      const coreMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: dense ? 0.05 : 0.2,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      coreMaterial.userData.baseOpacity = coreMaterial.opacity;
      coreMaterial.userData.neon = true;

      const wireframeMaterial = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: dense ? 0.35 : 0.7,
        blending: THREE.AdditiveBlending,
      });
      wireframeMaterial.userData.baseOpacity = wireframeMaterial.opacity;
      wireframeMaterial.userData.neon = true;

      const pointsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        // The reference camera sits roughly 200 units away. This integrated
        // scene uses a much closer camera, so compensate to keep nodes small.
        size: 0.02,
        transparent: true,
        opacity: dense ? 0.25 : 0.4,
        blending: THREE.AdditiveBlending,
      });
      pointsMaterial.userData.baseOpacity = pointsMaterial.opacity;

      group.add(
        new THREE.Mesh(geometry, coreMaterial),
        new THREE.LineSegments(
          new THREE.WireframeGeometry(geometry),
          wireframeMaterial,
        ),
        new THREE.Points(geometry, pointsMaterial),
      );
    });
  });

  const bounds = new THREE.Box3().setFromObject(group);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const scale = 2.45 / Math.max(size.x, size.y);

  group.position.set(-center.x, -center.y, -center.z);
  const wrapper = new THREE.Group();
  wrapper.rotation.x = Math.PI;
  wrapper.scale.setScalar(scale);
  wrapper.add(group);
  return wrapper;
}

function createReferenceNineMark(font, color) {
  const geometry = new TextGeometry("9", {
    font: font,
    size: 50,
    depth: 5,
    curveSegments: 2,
    bevelEnabled: true,
    bevelThickness: 3,
    bevelSize: 1.5,
    bevelOffset: 0,
    bevelSegments: 2,
  });
  geometry.center();

  const group = new THREE.Group();
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0x112244,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
  });
  coreMaterial.userData.baseOpacity = 0.2;

  const wireframeMaterial = new THREE.LineBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
  });
  wireframeMaterial.userData.baseOpacity = 0.15;

  const pointsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.08,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
  });
  pointsMaterial.userData.baseOpacity = 0.5;

  group.add(
    new THREE.Mesh(geometry, coreMaterial),
    new THREE.LineSegments(
      new THREE.WireframeGeometry(geometry),
      wireframeMaterial,
    ),
    new THREE.Points(geometry, pointsMaterial),
  );

  const size = new THREE.Box3().setFromObject(group).getSize(new THREE.Vector3());
  const scale = 2.45 / Math.max(size.x, size.y);
  const wrapper = new THREE.Group();
  wrapper.scale.setScalar(scale);
  wrapper.add(group);
  return wrapper;
}

function updateFaviconFromModel() {
  const favicon = document.querySelector("#site-favicon");
  if (!favicon) {
    return;
  }

  const size = 128;
  const canvas = document.createElement("canvas");
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(1);
  renderer.setSize(size, size, false);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0.05, 0.08, 5.5);

  const mark = createReferenceNineMark(NINE_FONT, new THREE.Color("#54d8ff"));
  mark.rotation.set(0.08, -0.32, -0.04);
  scene.add(mark);
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);

  favicon.href = renderer.domElement.toDataURL("image/png");
  favicon.type = "image/png";

  scene.traverse(function (child) {
    if (child.geometry) {
      child.geometry.dispose();
    }
    if (child.material) {
      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];
      materials.forEach(function (material) {
        material.dispose();
      });
    }
  });
  renderer.dispose();
}

function setGroupVisibility(group, visibility) {
  group.userData.visibility = visibility;
  group.visible = visibility > 0.002;
  group.traverse(function (child) {
    if (!child.material) {
      return;
    }

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];
    materials.forEach(function (material) {
      const baseOpacity = material.userData.baseOpacity;
      if (typeof baseOpacity === "number") {
        material.opacity = baseOpacity * visibility;
      }
    });
  });
}

function tintObject(object, color) {
  object.traverse(function (child) {
    if (!child.material) {
      return;
    }

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];
    materials.forEach(function (material) {
      if (material.userData.neon && material.color) {
        material.color.copy(color);
      }
    });
  });
}

function createParticleField() {
  const count = window.innerWidth < 700 ? 360 : 800;
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = (Math.random() - 0.5) * 24;
    positions[index * 3 + 1] = (Math.random() - 0.5) * 14;
    positions[index * 3 + 2] = (Math.random() - 0.5) * 9 - 1.5;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0x44aaff,
    size: 0.04,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  material.userData.baseOpacity = 0.3;
  return new THREE.Points(geometry, material);
}

function targetLayout(state) {
  const mobile = window.innerWidth <= 900;
  if (state.side === "center") {
    return {
      x: 0,
      y: mobile ? 0.22 : 0,
      scale: mobile ? 0.78 : 1,
    };
  }

  if (mobile) {
    return {
      x: state.side === "right" ? 0.5 : -0.5,
      y: 1.18,
      scale: 0.7,
    };
  }

  return {
    x: state.side === "right" ? 2.65 : -2.65,
    y: 0,
    scale: 1.03,
  };
}

function makeController(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  document.body.classList.add("webgl-ready");

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x060e1a, 0.0015);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 8.1);

  const root = new THREE.Group();
  const markHolder = new THREE.Group();
  const accent = new THREE.Color(pendingBrand.color);
  const targetAccent = accent.clone();
  const particles = createParticleField();
  const brandContainers = {};

  root.add(markHolder);
  scene.add(particles, root);

  BRAND_NAMES.forEach(function (name) {
    const container = new THREE.Group();
    const mark =
      name === "nine"
        ? createReferenceNineMark(NINE_FONT, accent)
        : createReferenceSvgMark(
            REFERENCE_MARKS[name].svg,
            accent,
            REFERENCE_MARKS[name].dense,
          );
    container.add(mark);
    container.userData.visibility = name === "nine" ? 1 : 0;
    setGroupVisibility(container, container.userData.visibility);
    markHolder.add(container);
    brandContainers[name] = container;
  });

  let activeState = pendingBrand;
  let displayedBrand = "nine";
  let transitionPhase =
    activeState.name === displayedBrand ? "idle" : "out";
  let pendingBrandName =
    transitionPhase === "out" ? activeState.name : null;
  let desiredLayout = targetLayout(activeState);
  let rotationPhase = 0;
  let lastTime = performance.now();
  let pointerX = 0;
  let pointerY = 0;
  let destroyed = false;

  function setActive(state) {
    if (state.name !== activeState.name) {
      pendingBrandName = state.name;
      transitionPhase = state.name === displayedBrand ? "in" : "out";
    }
    activeState = state;
    targetAccent.set(state.color);
    desiredLayout = targetLayout(state);
  }

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
    desiredLayout = targetLayout(activeState);
  }

  function onPointerMove(event) {
    pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
    pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
  }

  function render(time) {
    if (destroyed) {
      return;
    }

    const delta = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    accent.lerp(targetAccent, 0.055);

    root.position.x = THREE.MathUtils.lerp(root.position.x, desiredLayout.x, 0.055);
    root.position.y = THREE.MathUtils.lerp(root.position.y, desiredLayout.y, 0.055);
    const currentScale = THREE.MathUtils.lerp(
      root.scale.x,
      desiredLayout.scale,
      0.055,
    );
    root.scale.setScalar(currentScale);

    const direction = activeState.side === "right" ? -1 : 1;
    rotationPhase += delta * 0.78 * direction;
    root.rotation.y = Math.sin(rotationPhase) * 0.32;
    root.rotation.x = Math.cos(rotationPhase * 0.7) * 0.055;
    markHolder.rotation.z = Math.sin(time * 0.00022) * 0.025;

    particles.rotation.y += delta * 0.012;
    particles.position.x = THREE.MathUtils.lerp(
      particles.position.x,
      pointerX * 0.14,
      0.025,
    );
    particles.position.y = THREE.MathUtils.lerp(
      particles.position.y,
      -pointerY * 0.1,
      0.025,
    );
    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      pointerX * 0.08,
      0.025,
    );
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      -pointerY * 0.055,
      0.025,
    );
    camera.lookAt(0, 0, 0);

    BRAND_NAMES.forEach(function (name) {
      const container = brandContainers[name];
      const destination =
        transitionPhase === "out"
          ? 0
          : name === displayedBrand
            ? 1
            : 0;
      const visibility = THREE.MathUtils.lerp(
        container.userData.visibility,
        destination,
        destination > 0 ? 0.08 : 0.12,
      );
      setGroupVisibility(container, visibility);
      tintObject(container, accent);
    });

    if (
      transitionPhase === "out" &&
      brandContainers[displayedBrand].userData.visibility <= 0.01
    ) {
      displayedBrand = pendingBrandName;
      pendingBrandName = null;
      transitionPhase = "in";
    } else if (
      transitionPhase === "in" &&
      brandContainers[displayedBrand].userData.visibility >= 0.99
    ) {
      transitionPhase = "idle";
    }

    renderer.render(scene, camera);
    window.requestAnimationFrame(render);
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.requestAnimationFrame(render);

  return {
    setActive: setActive,
    destroy: function () {
      destroyed = true;
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      renderer.dispose();
    },
  };
}

export async function initNeonScene() {
  const canvas = document.querySelector("#neon-scene");
  if (!canvas) {
    throw new Error("Neon scene canvas was not found.");
  }

  try {
    updateFaviconFromModel();
  } catch (error) {
    console.warn("The Three.js favicon could not be generated.", error);
  }
  controller = makeController(canvas);
  controller.setActive(pendingBrand);
}

export function setActiveBrand(state) {
  pendingBrand = state;
  if (controller) {
    controller.setActive(state);
  }
}
