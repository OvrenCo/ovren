// Service 3D Background - Abstract Wireframe Torus
(function() {
    let container, camera, scene, renderer, mesh;

    function init() {
        container = document.getElementById('service-canvas-container');
        if (!container) return;

        scene = new THREE.Scene();
        // Match the background color to var(--card-bg) or transparent
        scene.background = null; 

        camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 1000);
        camera.position.z = 50;

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // Create an interesting geometry
        const geometry = new THREE.TorusKnotGeometry(12, 3, 100, 16);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xf7941d, // Orange brand color
            wireframe: true,
            transparent: true,
            opacity: 0.6
        });

        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        window.addEventListener('resize', onWindowResize);
        animate();
    }

    function onWindowResize() {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

    function animate() {
        requestAnimationFrame(animate);
        mesh.rotation.x += 0.005;
        mesh.rotation.y += 0.01;
        renderer.render(scene, camera);
    }

    // Wait for DOM to load
    document.addEventListener("DOMContentLoaded", init);
})();
