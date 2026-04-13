import * as THREE from 'three'
import GUI from 'lil-gui'

/**
 * Debug
 */
const gui = new GUI()

const parameters = {
    materialColor: '#ffeded'
}

gui
    .addColor(parameters, 'materialColor')
    .onChange(() => {
        material.color.set(parameters.materialColor)
        particleMaterial.color.set(parameters.materialColor)
    })

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter

/**
 * Objects
 */
const material = new THREE.MeshToonMaterial({
    color: parameters.materialColor,
    gradientMap: gradientTexture
})
const objectsDistance = 4

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    material
)

const cone = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    material
)

const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
    material
)

scene.add(torus, cone, torusKnot)

const sectionMeshes = [torus, cone, torusKnot]

torus.position.y = - objectsDistance * 0
cone.position.y = - objectsDistance * 1
torusKnot.position.y = - objectsDistance * 2

torus.position.x = 2
cone.position.x = -2
torusKnot.position.x = 2

/**
 * Particles
 */
const particleCount = 300
const positions = new Float32Array(particleCount * 3)

for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10
    positions[i * 3 + 1] = objectsDistance * 0.4 - Math.random() * objectsDistance * sectionMeshes.length
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10
}

const particleGeometry = new THREE.BufferGeometry()
particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

const particleMaterial = new THREE.PointsMaterial({
    color: '#ffeded',
    size: 0.03,
    sizeAttenuation: true
})

const particles = new THREE.Points(particleGeometry, particleMaterial)
scene.add(particles)

/**
 * Light
 */
const sun = new THREE.DirectionalLight('#ffffff', 3)
sun.position.set(1, 1, 0)
scene.add(sun)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Camera group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Scroll
 */
let scrollY = window.scrollY

window.addEventListener('scroll', () => {
    scrollY = window.scrollY
})

/**
 * Cursor
 */
const cursor = {
    x: 0,
    y: 0
}

window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let prevTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - prevTime
    prevTime = elapsedTime

    camera.position.y = - scrollY / sizes.height * objectsDistance

    const parallaxX = cursor.x
    const parallaxY = - cursor.y
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * deltaTime

    for (const mesh of sectionMeshes) {
        mesh.rotation.x = elapsedTime * 0.1
        mesh.rotation.y = elapsedTime * 0.12
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()