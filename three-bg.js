/* ----------------------------------------------------
   OVREN.CO — PREMIUM THREE.JS HERO BACKGROUND
   Features: glowing particles, floating rings,
   connecting constellation lines, mouse parallax
   ---------------------------------------------------- */

(function () {
    'use strict';

    let container, scene, camera, renderer, clock;
    let particleSystem, ringMeshes = [], lineMesh;
    let particleCount = 140;
    let posArray, velArray;

    // Mouse / parallax
    let mouseX = 0, mouseY = 0;
    let targetCamX = 0, targetCamY = 0;
    let wHalf = window.innerWidth / 2;
    let hHalf = window.innerHeight / 2;

    // Brand colors (hex for Three.js)
    const BRAND = {
        orange:       0xF7941D,
        orangeLight:  0xFBBF6A,
        charcoal:     0x2D3E50,
        charcoalLight:0x4E6378,
    };

    let isDark = document.body.classList.contains('theme-dark');

    init();
    animate();

    /* ----------------------------------------
       INIT
    ---------------------------------------- */
    function init() {
        container = document.getElementById('hero-canvas-container');
        if (!container) return;

        scene = new THREE.Scene();
        clock  = new THREE.Clock();

        // Camera
        camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 2000);
        camera.position.z = 600;

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        buildParticles();
        buildRings();
        buildConstellationLines();

        window.addEventListener('resize', onResize);
        document.addEventListener('mousemove', onMouse);
        window.addEventListener('themechanged', (e) => {
            isDark = e.detail.theme === 'dark';
            refreshColors();
        });
    }

    /* ----------------------------------------
       GLOW CIRCLE TEXTURE
    ---------------------------------------- */
    function glowTexture(colorHex, size = 64) {
        const c = document.createElement('canvas');
        c.width = c.height = size;
        const ctx = c.getContext('2d');
        const r = size / 2;
        const color = '#' + colorHex.toString(16).padStart(6, '0');
        const grad = ctx.createRadialGradient(r, r, 0, r, r, r);
        grad.addColorStop(0.0, color);
        grad.addColorStop(0.4, color + 'CC');
        grad.addColorStop(1.0, color + '00');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
        return new THREE.CanvasTexture(c);
    }

    /* ----------------------------------------
       PARTICLES
    ---------------------------------------- */
    function buildParticles() {
        const geo = new THREE.BufferGeometry();
        posArray = new Float32Array(particleCount * 3);
        velArray = [];

        for (let i = 0; i < particleCount; i++) {
            const spread = 600;
            posArray[i * 3]     = (Math.random() - 0.5) * spread;
            posArray[i * 3 + 1] = (Math.random() - 0.5) * spread;
            posArray[i * 3 + 2] = (Math.random() - 0.5) * 300;

            // Give every particle a random size factor
            velArray.push({
                x:    (Math.random() - 0.5) * 0.18,
                y:    (Math.random() - 0.5) * 0.15,
                z:    (Math.random() - 0.5) * 0.08,
                size: 6 + Math.random() * 10,    // used as visual variation
                phase: Math.random() * Math.PI * 2 // twinkle offset
            });
        }

        geo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        const mat = new THREE.PointsMaterial({
            color:       BRAND.orange,
            size:        7,
            map:         glowTexture(BRAND.orange),
            blending:    THREE.AdditiveBlending,
            transparent: true,
            opacity:     0.75,
            depthWrite:  false,
        });

        particleSystem = new THREE.Points(geo, mat);
        scene.add(particleSystem);
    }

    /* ----------------------------------------
       FLOATING RINGS
    ---------------------------------------- */
    function buildRings() {
        // Clear old rings
        ringMeshes.forEach(m => scene.remove(m));
        ringMeshes = [];

        const configs = [
            { r: 80,  tube: 2.5, color: BRAND.orange,       opacity: 0.55, rx: 0.4, ry: 0,    rz: 0,    px: -180, py:  80, pz: -100 },
            { r: 55,  tube: 2.0, color: BRAND.orangeLight,  opacity: 0.40, rx: 1.0, ry: 0.8,  rz: 0.4,  px:  220, py: -70, pz: -150 },
            { r: 110, tube: 3.5, color: BRAND.orange,       opacity: 0.35, rx: 0.6, ry: 1.2,  rz: 0.2,  px:   40, py:  30, pz: -200 },
            { r: 40,  tube: 1.5, color: BRAND.charcoalLight,opacity: 0.55, rx: 1.5, ry: 0.3,  rz: 1.0,  px: -280, py: -130, pz: -80  },
            { r: 65,  tube: 2.0, color: BRAND.orangeLight,  opacity: 0.30, rx: 0.2, ry: 1.7,  rz: 0.8,  px:  160, py:  170, pz: -50  },
        ];

        configs.forEach(cfg => {
            const geo = new THREE.TorusGeometry(cfg.r, cfg.tube, 16, 100);
            const mat = new THREE.MeshBasicMaterial({
                color:       cfg.color,
                transparent: true,
                opacity:     cfg.opacity,
                side:        THREE.DoubleSide,
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.rotation.set(cfg.rx, cfg.ry, cfg.rz);
            mesh.position.set(cfg.px, cfg.py, cfg.pz);
            // Store animation metadata
            mesh.userData = { rotSpeedX: (Math.random()-0.5)*0.003, rotSpeedY: (Math.random()-0.5)*0.005 };
            scene.add(mesh);
            ringMeshes.push(mesh);
        });
    }

    /* ----------------------------------------
       CONSTELLATION LINES (connecting nearby particles)
    ---------------------------------------- */
    function buildConstellationLines() {
        if (lineMesh) scene.remove(lineMesh);

        // Pick a subset of particles to connect
        const pts = [];
        const count = 30;          // number of points to connect
        const stepSize = Math.floor(particleCount / count);

        for (let i = 0; i < count; i++) {
            const idx = i * stepSize;
            pts.push(new THREE.Vector3(
                posArray[idx * 3],
                posArray[idx * 3 + 1],
                posArray[idx * 3 + 2]
            ));
        }

        // Build a line strip through those points
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({
            color:       BRAND.orange,
            transparent: true,
            opacity:     isDark ? 0.22 : 0.12,
            depthWrite:  false,
        });
        lineMesh = new THREE.LineLoop(geo, mat);
        scene.add(lineMesh);
    }

    /* ----------------------------------------
       REFRESH COLORS ON THEME CHANGE
    ---------------------------------------- */
    function refreshColors() {
        if (!particleSystem) return;
        const alpha = isDark ? 0.85 : 0.70;
        particleSystem.material.opacity = alpha;

        if (lineMesh) {
            lineMesh.material.opacity = isDark ? 0.22 : 0.12;
        }
    }

    /* ----------------------------------------
       EVENTS
    ---------------------------------------- */
    function onResize() {
        wHalf = window.innerWidth / 2;
        hHalf = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onMouse(e) {
        mouseX = e.clientX - wHalf;
        mouseY = e.clientY - hHalf;
    }

    /* ----------------------------------------
       ANIMATION LOOP
    ---------------------------------------- */
    function animate() {
        requestAnimationFrame(animate);
        const t   = clock.getElapsedTime();
        const pos = particleSystem.geometry.attributes.position.array;

        // Animate particles with subtle vertical sine wave
        for (let i = 0; i < particleCount; i++) {
            const ix = i * 3, iy = ix + 1, iz = ix + 2;
            const v  = velArray[i];

            pos[ix] += v.x;
            pos[iy] += v.y + Math.sin(t * 0.6 + v.phase) * 0.08;
            pos[iz] += v.z;

            // Boundary wrap
            if (pos[ix] >  300 || pos[ix] < -300) v.x *= -1;
            if (pos[iy] >  300 || pos[iy] < -300) v.y *= -1;
            if (pos[iz] >  150 || pos[iz] < -150) v.z *= -1;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;

        // Slow spin of the particle cloud
        particleSystem.rotation.y += 0.0005;

        // Animate rings
        ringMeshes.forEach((ring, i) => {
            ring.rotation.x += ring.userData.rotSpeedX;
            ring.rotation.y += ring.userData.rotSpeedY;
            // Gentle floating
            ring.position.y += Math.sin(t * 0.4 + i * 1.2) * 0.12;
        });

        // Slowly spin constellation lines
        if (lineMesh) {
            lineMesh.rotation.y = t * 0.03;
            lineMesh.rotation.x = Math.sin(t * 0.1) * 0.15;
        }

        // Smooth mouse parallax
        targetCamX = mouseX * 0.10;
        targetCamY = mouseY * 0.10;
        camera.position.x += (targetCamX - camera.position.x) * 0.04;
        camera.position.y += (-targetCamY - camera.position.y) * 0.04;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }
})();
