import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

const ThreeScene = () => {
  const mountRef = useRef(null);
  const keys = useRef({});

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc);

    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 0);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const controls = new PointerLockControls(camera, mount);
    scene.add(controls.object);

    mount.addEventListener('click', () => {
      controls.lock();
    });

    // Light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 5);
    scene.add(light);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(50, 50);
    const floorMat = new THREE.MeshPhongMaterial({ color: 0x999999 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Room with window in front wall
    const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const wallThickness = 0.2;
    const roomSize = 10;

    const createWall = (x, y, z, w, h, d) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const wall = new THREE.Mesh(geo, wallMaterial);
      wall.position.set(x, y, z);
      scene.add(wall);
    };

    // Back, left, right, ceiling
    createWall(0, 2.5, roomSize / 2, roomSize, 5, wallThickness);
    createWall(-roomSize / 2, 2.5, 0, wallThickness, 5, roomSize);
    createWall(roomSize / 2, 2.5, 0, wallThickness, 5, roomSize);
    createWall(0, 5, 0, roomSize, wallThickness, roomSize);

    // Front wall with window opening
    const windowWidth = 3;
    const windowHeight = 1.5;
    const wallY = 2.5;
    const windowY = 3;
    const frontZ = -roomSize / 2;

    createWall(0, 1, frontZ, roomSize, 2, wallThickness); // bottom
    createWall(-((roomSize - windowWidth) / 2 + windowWidth / 2), windowY, frontZ, (roomSize - windowWidth) / 2, windowHeight, wallThickness); // left
    createWall(((roomSize - windowWidth) / 2 + windowWidth / 2), windowY, frontZ, (roomSize - windowWidth) / 2, windowHeight, wallThickness); // right
    createWall(0, 4.5, frontZ, roomSize, 1, wallThickness); // top

    

    // Controls
    const direction = new THREE.Vector3();
    const speed = 5;
    const clock = new THREE.Clock();

    let velocity = new THREE.Vector3();
    let canJump = false;
    const gravity = 9.8;
    const jumpSpeed = 5;

    const handleKeyDown = (e) => {
        keys.current[e.code] = true;
        if (e.code === 'Space' && canJump) {
          velocity.y += jumpSpeed;
          canJump = false;
        }
      };

    const handleKeyUp = (e) => {
      keys.current[e.code] = false;
    };                  

    const animate = () => {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();                     
      
        direction.set(0, 0, 0);
        if (keys.current['KeyS']) direction.z -= 1;
        if (keys.current['KeyW']) direction.z += 1;
        if (keys.current['KeyA']) direction.x -= 1;
        if (keys.current['KeyD']) direction.x += 1;
      
        direction.normalize();
      
        if (controls.isLocked) {
          // Di chuyển theo phương ngang
          controls.moveRight(direction.x * speed * delta);
          controls.moveForward(direction.z * speed * delta);
      
          // Nhảy & trọng lực
          velocity.y -= gravity * delta;
      
          const position = controls.object.position;
      
          position.y += velocity.y * delta;
      
          // Ngăn rơi xuống dưới sàn (giả sử sàn ở y = 1.6)
          if (position.y < 1.6) {
            velocity.y = 0;
            position.y = 1.6;
            canJump = true;
          }
        }
      
        renderer.render(scene, camera);
      };
      
    animate();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: '100vw', height: '100vh', overflow: 'hidden', margin: 0, padding: 0 }}
    />
  );
};

export default ThreeScene;
