// --- 1. SETUP DASAR SCENE, CAMERA, LIGHTING, & RENDERER ---
const scene = new THREE.Scene();
scene.background = new THREE.Color('#fff2f5'); 

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 4, 7); camera.lookAt(0, 0.5, 0);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg-canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const storeLight = new THREE.DirectionalLight(0xffffff, 0.8);
storeLight.position.set(4, 6, 3); scene.add(storeLight);

// --- 2. MATERIALS & MEJA ---
const tableMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
const defaultMaterial = new THREE.MeshStandardMaterial({ color: 0xffb3c1, metalness: 0.5, roughness: 0.2 });

const tableMesh = new THREE.Mesh(new THREE.BoxGeometry(6, 0.4, 3), tableMaterial);
tableMesh.position.y = -0.2; scene.add(tableMesh);

const daftarProduk = [];
let objekTerpilih = null; 

// --- 3. MEMBUAT PRODUK KOSMETIK (Grup Estetik Bulat) ---
const createMesh = (geo, mat, pos, name) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = name; mesh.position.set(...pos);
    return mesh;
};

// 1. Lipstik (Kiri)
const produkLipstick = new THREE.Group(); produkLipstick.name = "Lipstick Cream";
produkLipstick.add(
    createMesh(new THREE.CylinderGeometry(0.3, 0.3, 1, 32), defaultMaterial.clone(), [0, 0, 0], "target-lipstick"),
    createMesh(new THREE.BoxGeometry(0.05, 0.9, 0.05), new THREE.MeshStandardMaterial({color: 0x4a3b40}), [0, 0, 0.29], "target-lipstick"),
    createMesh(new THREE.CylinderGeometry(0.22, 0.22, 0.5, 32), new THREE.MeshStandardMaterial({color: 0xff4d6d, roughness: 0.4}), [0, 0.6, 0.08], "target-lipstick")
);
produkLipstick.position.set(-1.8, 0.5, 0); scene.add(produkLipstick); daftarProduk.push(produkLipstick);

// 2. Cushion / Bedak (Tengah)
const produkCushion = new THREE.Group(); produkCushion.name = "Cushion Powder";
produkCushion.add(
    createMesh(new THREE.CylinderGeometry(0.7, 0.7, 0.4, 32), defaultMaterial.clone(), [0, 0, 0], "target-cushion"),
    createMesh(new THREE.BoxGeometry(0.1, 0.3, 0.05), new THREE.MeshStandardMaterial({color: 0x4a3b40}), [0, 0, 0.69], "target-cushion"),
    createMesh(new THREE.CylinderGeometry(0.55, 0.55, 0.05, 32), new THREE.MeshStandardMaterial({color: 0xfae0e4, roughness: 0.6}), [0.05, 0.21, 0.05], "target-cushion")
);
produkCushion.position.set(0, 0.2, 0); scene.add(produkCushion); daftarProduk.push(produkCushion);

// 3. Parfum (Kanan)
const produkParfum = new THREE.Group(); produkParfum.name = "Exclusive Perfume";
produkParfum.add(
    createMesh(new THREE.BoxGeometry(0.8, 1.1, 0.5), defaultMaterial.clone(), [0, 0, 0], "target-parfum"),
    createMesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), new THREE.MeshStandardMaterial({color: 0x4a3b40}), [0, 0.7, 0], "target-parfum")
);
produkParfum.position.set(1.8, 0.55, 0); scene.add(produkParfum); daftarProduk.push(produkParfum);

// --- 4. ANIMASI LOOP ---
function animate() { requestAnimationFrame(animate); renderer.render(scene, camera); }
animate();

// --- 5. LOGIKA SELEKSI KLIK MOUSE ---
const raycaster = new THREE.Raycaster(), mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const name = intersects[0].object.name;
        if (name === "target-lipstick") objekTerpilih = produkLipstick;
        else if (name === "target-cushion") objekTerpilih = produkCushion;
        else if (name === "target-parfum") objekTerpilih = produkParfum;
        else return;

        document.getElementById('selected-product-text').innerText = objekTerpilih.name;
        daftarProduk.forEach(p => p.scale.set(1, 1, 1));
        objekTerpilih.scale.set(1.2, 1.2, 1.2); 
    }
});

// --- 6. LOGIKA INTERAKSI (HOVER & DRAG) ---
let isDragging = false;
// Membuat bidang tak terlihat (plane) di atas meja (y=0) untuk deteksi drag yang presisi
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); 
const raycasterDrag = new THREE.Raycaster();
const intersectPoint = new THREE.Vector3();

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update raycaster untuk deteksi
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    // INTERAKSI HOVER (Skala)
    if (intersects.length > 0 && intersects[0].object.name.startsWith("target-")) {
        const name = intersects[0].object.name;
        daftarProduk.forEach(p => {
            const isMatch = p.children.some(child => child.name === name);
            if (isMatch) p.scale.set(1.3, 1.3, 1.3);
        });
    } else {
        daftarProduk.forEach(p => { if (p !== objekTerpilih) p.scale.set(1, 1, 1); });
    }

    // INTERAKSI DRAG (Translasi) - HANYA BERJALAN SAAT MOUSE DITEKAN
    if (isDragging && objekTerpilih) {
        raycasterDrag.setFromCamera(mouse, camera);
        raycasterDrag.ray.intersectPlane(plane, intersectPoint);
        objekTerpilih.position.x = intersectPoint.x;
        objekTerpilih.position.z = intersectPoint.z;
    }
});

window.addEventListener('mousedown', (event) => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0 && intersects[0].object.name.startsWith("target-")) {
        isDragging = true; // Mulai drag
    }
});

window.addEventListener('mouseup', () => { isDragging = false; });

// --- 7. LOGIKA KLIK SELEKSI (Hanya untuk kunci objek & rotasi) ---
window.addEventListener('click', (event) => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        const name = intersects[0].object.name;
        if (name.startsWith("target-")) {
            // Mapping nama ke objek
            const targetName = name === "target-lipstick" ? "Lipstick Cream" : 
                               name === "target-cushion" ? "Cushion Powder" : "Exclusive Perfume";
            objekTerpilih = daftarProduk.find(p => p.name === targetName);
            document.getElementById('selected-product-text').innerText = objekTerpilih.name;
        }
    }
});

document.getElementById('btn-rotate').addEventListener('click', () => {
    if (objekTerpilih) objekTerpilih.rotation.y += 0.8;
});