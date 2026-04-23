import * as THREE from 'three'
import Lenis from 'lenis'

new Lenis({
    autoRaf: true,
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
})

const canvas = document.querySelector('#webgl-canvas') as HTMLCanvasElement
const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2(0x0a0a0a, 0.02)

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
scene.add(camera)

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x080808, 1)

class CustomTunnelCurve extends THREE.Curve<THREE.Vector3> {
    constructor() {
        super()
    }

    getPoint(t: number, optionalTarget = new THREE.Vector3()) {
        t *= Math.PI * 2
        const x = Math.sin(t) * 100
        const z = Math.cos(t) * 100
        const y = Math.sin(t * 4) * 12 + Math.cos(t * 2) * 5
        return optionalTarget.set(x, y, z)
    }
}

const path = new CustomTunnelCurve()

const tubeGeometry = new THREE.TubeGeometry(path, 250, 8, 6, true)
const tubeMaterial = new THREE.MeshBasicMaterial({
    color: 0x555555,
    wireframe: true,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.6
})

const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial)
scene.add(tubeMesh)

const outerTubeGeometry = new THREE.TubeGeometry(path, 250, 10, 6, true)
const outerTubeMaterial = new THREE.MeshBasicMaterial({
    color: 0x333333,
    wireframe: true,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.2
})

const outerTubeMesh = new THREE.Mesh(outerTubeGeometry, outerTubeMaterial)
outerTubeMesh.rotation.z = Math.PI / 6
scene.add(outerTubeMesh)

const cursor = { x: 0, y: 0 }
let currentCursorX = 0
let currentCursorY = 0

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

window.addEventListener('mousemove', (event) => {
    cursor.x = (event.clientX / sizes.width) - 0.5
    cursor.y = (event.clientY / sizes.height) - 0.5
})

window.addEventListener('touchmove', (event) => {
    if (event.touches.length > 0) {
        cursor.x = (event.touches[0].clientX / sizes.width) - 0.5
        cursor.y = (event.touches[0].clientY / sizes.height) - 0.5
    }
})

const clock = new THREE.Clock()
let previousTime = 0
let tunnelPosition = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    tunnelPosition += deltaTime * 0.015
    if (tunnelPosition > 1) {
        tunnelPosition -= 1
    }

    const camPos = path.getPoint(tunnelPosition)
    const camLookAt = path.getPoint((tunnelPosition + 0.02) % 1)

    camera.position.copy(camPos)
    camera.lookAt(camLookAt)

    currentCursorX += (cursor.x - currentCursorX) * Math.min(deltaTime * 5, 1)
    currentCursorY += (cursor.y - currentCursorY) * Math.min(deltaTime * 5, 1)

    camera.rotateY(-currentCursorX * 1.5)
    camera.rotateX(-currentCursorY * 1.5)
    camera.rotateZ(-currentCursorX * 0.5)

    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()
