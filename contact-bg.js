/* ----------------------------------------------------
   OVREN.CO — CONTACT SECTION 3D BACKGROUND
   Features: Interactive particle vortex
   ---------------------------------------------------- */
(function () {
    'use strict';

    let container, scene, camera, renderer;
    let particleSystem;
    
    let mouseX = 0, mouseY = 0;
    let targetCamX = 0, targetCamY = 0;
    let wHalf, hHalf;

    const BRAND = {
        orange: 0xF7941D,
        orangeGlow: 0xFF782B
    };

    init();
    animate();

    function init() {
        container = document.getElementById('contact-canvas');
        if (!container) return;

        wHalf = container.clientWidth / 2;
        hHalf = container.clientHeight / 2;

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 1, 2000);
        camera.position.z = 300;
        camera.position.y = 100;
        camera.lookAt(0, 0, 0);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        buildVortex();

        window.addEventListener('resize', onWindowResize, false);
        container.addEventListener('mousemove', onDocumentMouseMove, false);
    }

    function buildVortex() {
        const particleCount = 600;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            // Cylindrical / vortex distribution
            const theta = Math.random() * Math.PI * 2;
            const y = (Math.random() - 0.5) * 400;
            const r = 50 + Math.random() * 150 + (y * 0.2); // wider at top

            positions[i * 3] = r * Math.cos(theta);
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = r * Math.sin(theta);

            sizes[i] = Math.random() * 4 + 1;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Custom shader material for glowing points
        const material = new THREE.PointsMaterial({
            size: 3,
            color: BRAND.orange,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        particleSystem = new THREE.Points(geometry, material);
        scene.add(particleSystem);
    }

    function onWindowResize() {
        if (!container) return;
        wHalf = container.clientWidth / 2;
        hHalf = container.clientHeight / 2;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

    function onDocumentMouseMove(event) {
        const rect = container.getBoundingClientRect();
        mouseX = (event.clientX - rect.left - wHalf) * 0.5;
        mouseY = (event.clientY - rect.top - hHalf) * 0.5;
    }

    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    function render() {
        targetCamX = mouseX * 0.5;
        targetCamY = mouseY * 0.5;

        camera.position.x += (targetCamX - camera.position.x) * 0.05;
        // Keep camera looking at center
        camera.lookAt(scene.position);

        // Rotate vortex
        particleSystem.rotation.y += 0.005;

        // Make particles gently drift up
        const positions = particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < positions.length / 3; i++) {
            positions[i * 3 + 1] += 0.5; // Drift up
            if (positions[i * 3 + 1] > 200) {
                positions[i * 3 + 1] = -200; // Reset to bottom
            }
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    }
})();
