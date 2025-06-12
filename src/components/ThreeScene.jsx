import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

const ThreeScene = () => {
  const mountRef = useRef(null);
  const keys = useRef({});
  let velocityY = 0;
  const GRAVITY = -9.8;
  const JUMP_FORCE = 5;
  let isOnGround = true;
  let door, doorOpen = false;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // === Scene Setup ===
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfd1e5);

    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const controls = new PointerLockControls(camera, mount);
    scene.add(controls.object);
    mount.addEventListener('click', () => controls.lock());

    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    light.position.set(0, 20, 0);
    scene.add(light);

    // === Environment ===
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 50),
      new THREE.MeshPhongMaterial({ color: 0x999999 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // === Room Construction ===
    const wallMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const roomSize = 10, wallThickness = 0.2, wallHeight = 3;

    const makeWall = (x, y, z, w, h, d) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
      wall.position.set(x, y, z);
      scene.add(wall);
    };

    // Walls
    makeWall(0, wallHeight / 2, -roomSize / 2, roomSize, wallHeight, wallThickness); // front
    makeWall(0, wallHeight / 2, roomSize / 2, roomSize, wallHeight, wallThickness); // back
    makeWall(roomSize / 2, wallHeight / 2, 0, wallThickness, wallHeight, roomSize); // right
    makeWall(0, roomSize, 0, roomSize, wallThickness, roomSize); // ceiling
    makeWall(-roomSize / 2, 1, -1, wallThickness, 3.9, 8); // left segment

    // === Door ===
    const doorMat = new THREE.MeshPhongMaterial({ color: 0x654321 });
    door = new THREE.Mesh(new THREE.BoxGeometry(1, 2.2, 0.1), doorMat);
    door.position.set(-roomSize / 2 + 0.4, 1.1, 4.25);
    scene.add(door);

    const toggleDoor = () => {
      if (!door) return;
      door.rotation.y = doorOpen ? 0 : Math.PI / 2;
      door.position.z = doorOpen ? 2.25 : 2.75;
      doorOpen = !doorOpen;
    };

    // === Decorations & Furniture Functions ===
    const makeAquariumWallUnit = (x, y, z) => {
      const group = new THREE.Group();

      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 1.5, 0.5),
        new THREE.MeshPhongMaterial({ color: 0x1E90FF, transparent: true, opacity: 0.5 })
      );
      glass.position.set(0, 0.75, 0);
      group.add(glass);

      for (let i = 0; i < 6; i++) {
        const plant = new THREE.Mesh(
          new THREE.ConeGeometry(0.05, 0.3 + Math.random() * 0.2, 8),
          new THREE.MeshPhongMaterial({ color: 0x228B22 })
        );
        plant.position.set(-1.1 + i * 0.4, 0.1, -0.1 + (Math.random() - 0.5) * 0.2);
        group.add(plant);
      }

      for (let i = 0; i < 5; i++) {
        const fish = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 12, 12),
          new THREE.MeshPhongMaterial({ color: new THREE.Color(`hsl(${Math.random() * 360}, 100%, 50%)`) })
        );
        fish.position.set(-1 + i * 0.4, 0.6 + Math.random() * 0.3, 0.1);
        group.add(fish);
      }

      const cabinetMat = new THREE.MeshPhongMaterial({ color: 0x666666 });
      const shelfMat = new THREE.MeshPhongMaterial({ color: 0x555555 });

      const base = new THREE.Mesh(new THREE.BoxGeometry(3, 0.6, 0.6), cabinetMat);
      base.position.set(0, -0.3, 0);
      group.add(base);

      const leftCab = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2, 0.6), cabinetMat);
      leftCab.position.set(-1.45, 0.75, 0);
      group.add(leftCab);

      const rightCab = leftCab.clone();
      rightCab.position.x = 1.45;
      group.add(rightCab);

      const topCab = new THREE.Mesh(new THREE.BoxGeometry(3, 0.4, 0.6), cabinetMat);
      topCab.position.set(0, 1.75, 0);
      group.add(topCab);

      const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.4), shelfMat);
      shelf.position.set(0, 1.4, 0.3);
      group.add(shelf);

      const book1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.05), new THREE.MeshPhongMaterial({ color: 0x8844ff }));
      book1.position.set(-0.6, 1.5, 0.35);
      group.add(book1);

      const book2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.25, 0.05), new THREE.MeshPhongMaterial({ color: 0x33cc66 }));
      book2.position.set(-0.45, 1.5, 0.35);
      group.add(book2);

      const figurine = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), new THREE.MeshPhongMaterial({ color: 0xffaa00 }));
      figurine.position.set(0.5, 1.45, 0.35);
      group.add(figurine);

      group.position.set(x, y, z);
      scene.add(group);
    };
    // Add the aquarium wall unit
    makeAquariumWallUnit(2.5, 0.3, -4);

    // === Bed ===
    function makeBed() {
      const bed = new THREE.Mesh(
        new THREE.BoxGeometry(4, 0.4, 2),
        new THREE.MeshPhongMaterial({ color: 0x4682B4 })
      );
      bed.position.set(-2, 0.2, -3.25);
      scene.add(bed);
    }
    makeBed();

    // === Window ===     
    function makeWindows() {
      const leftWindowMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 1.5, 4),
        new THREE.MeshBasicMaterial({ color: 0x87CEEB, transparent: true, opacity: 0.5 })
      );
      leftWindowMesh.position.set(-5, 1.75, 0.5);
      scene.add(leftWindowMesh);
      
      const rightWindowMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 1.5, 2),
        new THREE.MeshBasicMaterial({ color: 0x87CEEB, transparent: true, opacity: 0.5 })
      );
      rightWindowMesh.position.set(-5, 1.75, -3);
      scene.add(rightWindowMesh);
    }
    makeWindows(); 
    
    // === Gaming Desk ===
    function makeGamingDesktop() {
      // === Gaming Desk ===
      const desk = new THREE.Mesh(
          new THREE.BoxGeometry(1, 0.1, 3),
          new THREE.MeshPhongMaterial({ color: 0x8B4513 })
      );
      desk.position.set(-3.5, 1, -0.5);
      scene.add(desk);
  
      // Monitor
      const monitor = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 0.6, -1.25),
          new THREE.MeshPhongMaterial({ color: 0x000000 })
      );
      monitor.position.set(desk.position.x - 0.25, desk.position.y + 0.5, desk.position.z + 0.025);
      scene.add(monitor);
  
      // Keyboard
      const keyboard = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.1, 0.7),
          new THREE.MeshPhongMaterial({ color: 0x333333 })
      );
      keyboard.position.set(desk.position.x + 0.15, desk.position.y + 0.15, desk.position.z);
      scene.add(keyboard);
  
      // Case PC
      const casePC = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.8, 0.3),
          new THREE.MeshPhongMaterial({ color: 0x111111 })
      );
      casePC.position.set(desk.position.x + 0.2, 0.4, desk.position.z + 0.7);
      scene.add(casePC);
  
      function createGamingChair(x, y, z) {
        const chairGroup = new THREE.Group();
      
        const chairMat = new THREE.MeshPhongMaterial({ color: 0x1c1c1c });
        const accentMat = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const wheelMat = new THREE.MeshPhongMaterial({ color: 0x000000 });
      
        // Seat
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 0.6), chairMat);
        seat.position.set(0, 0.15, 0);
        chairGroup.add(seat);
      
        // Backrest (contoured with stacked boxes)
        for (let i = 0; i < 3; i++) {
          const back = new THREE.Mesh(
            new THREE.BoxGeometry(0.55 - i * 0.05, 0.25, 0.1),
            chairMat
          );
          back.position.set(0, 0.4 + i * 0.27, -0.28);
          chairGroup.add(back);
        }
      
        // Headrest
        const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.1), accentMat);
        headrest.position.set(0, 1.2, -0.29);
        headrest.rotation.x = -0.2;
        chairGroup.add(headrest);
      
        // Neck cushion
        const neck = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.1), accentMat);
        neck.position.set(0, 1.05, -0.285);
        chairGroup.add(neck);
      
        // Lumbar cushion
        const lumbar = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.1), accentMat);
        lumbar.position.set(0, 0.75, -0.275);
        chairGroup.add(lumbar);
      
        // Armrests
        const armrestGeo = new THREE.BoxGeometry(0.1, 0.05, 0.4);
        const leftArmrest = new THREE.Mesh(armrestGeo, chairMat);
        leftArmrest.position.set(-0.35, 0.275, 0);
        chairGroup.add(leftArmrest);
      
        const rightArmrest = new THREE.Mesh(armrestGeo, chairMat);
        rightArmrest.position.set(0.35, 0.275, 0);
        chairGroup.add(rightArmrest);
      
        // Central cylinder post
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 0.5, 16),
          chairMat
        );
        stem.position.set(0, -0.1, 0);
        chairGroup.add(stem);
      
        // Wheel legs (cross shape)
        const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.05), chairMat);
        leg1.position.set(0, -0.3, 0);
        chairGroup.add(leg1);
      
        const leg2 = leg1.clone();
        leg2.rotation.y = Math.PI / 2;
        chairGroup.add(leg2);
      
        // Wheels (cylinders)
        const wheelGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 12);
        const wheelOffsets = [
          [0.3, 0.3], [-0.3, 0.3], [0.3, -0.3], [-0.3, -0.3]
        ];
        wheelOffsets.forEach(([dx, dz]) => {
          const wheel = new THREE.Mesh(wheelGeo, wheelMat);
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(dx, -0.325, dz);
          chairGroup.add(wheel);
        });
      
        chairGroup.position.set(x, y, z);
        scene.add(chairGroup);
      }
      createGamingChair(desk.position.x + 1.5, 0.4, desk.position.z - 0.5);
  
      function createVaseWithFlower(x, y, z) {
        const group = new THREE.Group();
      
        // Vật liệu
        const vaseMaterial = new THREE.MeshPhongMaterial({ color: 0x8a7f8d });      // màu bình hoa
        const stemMaterial = new THREE.MeshPhongMaterial({ color: 0x2e8b57 });     // thân cây
        const petalMaterial = new THREE.MeshPhongMaterial({ color: 0xff69b4 });    // hoa
      
        // Bình hoa nhỏ hơn
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.1, 16), vaseMaterial);
        base.position.y = 0.05;
        group.add(base);
      
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.08, 16), vaseMaterial);
        neck.position.y = 0.14;
        group.add(neck);
      
        // Thân cây
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.15, 8), stemMaterial);
        stem.position.y = 0.25;
        group.add(stem);
      
        // Hoa nhỏ
        const flower = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 12), petalMaterial);
        flower.position.y = 0.33;
        group.add(flower);
      
        // Đặt bình hoa
        group.position.set(x, y, z);
        scene.add(group);
      }
      createVaseWithFlower(desk.position.x + 0.25, desk.position.y + 0.15, desk.position.z - 0.5);
  }
  makeGamingDesktop();
  

  // === Keyboard Controls ===
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyE') toggleDoor();
    keys.current[e.code] = true;
  });
  window.addEventListener('keyup', (e) => keys.current[e.code] = false);

  // === Animate Loop ===
  const clock = new THREE.Clock();
  const direction = new THREE.Vector3();
  const speed = 5;

  const animate = () => {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    direction.set(0, 0, 0);
    if (keys.current['KeyW']) direction.z += 1;
    if (keys.current['KeyS']) direction.z -= 1;
    if (keys.current['KeyA']) direction.x -= 1;
    if (keys.current['KeyD']) direction.x += 1;
    direction.normalize();

    if (controls.isLocked) {
      controls.moveRight(direction.x * speed * delta);
      controls.moveForward(direction.z * speed * delta);

      if (isOnGround && keys.current['Space']) {
        velocityY = JUMP_FORCE;
        isOnGround = false;
      }

      velocityY += GRAVITY * delta;
      controls.object.position.y += velocityY * delta;

      if (controls.object.position.y < 1.6) {
        velocityY = 0;
        controls.object.position.y = 1.6;
        isOnGround = true;
      }
    }

    renderer.render(scene, camera);
  };

  animate();

  // === Resize Handler ===
  window.addEventListener('resize', () => {
    camera.aspect = mount.clientWidth / mount.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(mount.clientWidth, mount.clientHeight);
  });

  return () => {
    mount.removeChild(renderer.domElement);
  };
}, []);

return <div ref={mountRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />;
};

export default ThreeScene;
