import { 
    Scene, 
    FogExp2, 
    PerspectiveCamera, 
    WebGLRenderer, 
    Curve, 
    Vector3, 
    TubeGeometry, 
    MeshBasicMaterial, 
    BackSide, 
    Mesh, 
    Clock 
} from 'three'
import Lenis from 'lenis'

new Lenis({
    autoRaf: true,
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
})

const canvas = document.querySelector('#webgl-canvas') as HTMLCanvasElement
const scene = new Scene()
scene.fog = new FogExp2(0x0a0a0a, 0.02)

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
scene.add(camera)

const renderer = new WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x080808, 1)

class CustomTunnelCurve extends Curve<Vector3> {
    constructor() {
        super()
    }

    getPoint(t: number, optionalTarget = new Vector3()) {
        t *= Math.PI * 2
        const x = Math.sin(t) * 100
        const z = Math.cos(t) * 100
        const y = Math.sin(t * 4) * 12 + Math.cos(t * 2) * 5
        return optionalTarget.set(x, y, z)
    }
}

const path = new CustomTunnelCurve()

const tubeGeometry = new TubeGeometry(path, 150, 8, 4, true)
const tubeMaterial = new MeshBasicMaterial({
    color: 0x555555,
    wireframe: true,
    side: BackSide,
    transparent: true,
    opacity: 0.6
})

const tubeMesh = new Mesh(tubeGeometry, tubeMaterial)
scene.add(tubeMesh)

const outerTubeGeometry = new TubeGeometry(path, 150, 10, 4, true)
const outerTubeMaterial = new MeshBasicMaterial({
    color: 0x333333,
    wireframe: true,
    side: BackSide,
    transparent: true,
    opacity: 0.2
})

const outerTubeMesh = new Mesh(outerTubeGeometry, outerTubeMaterial)
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

const clock = new Clock()
let previousTime = 0
let tunnelPosition = 0

const camPos = new Vector3()
const camLookAt = new Vector3()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    tunnelPosition += deltaTime * 0.015
    if (tunnelPosition > 1) {
        tunnelPosition -= 1
    }

    path.getPoint(tunnelPosition, camPos)
    path.getPoint((tunnelPosition + 0.02) % 1, camLookAt)

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
