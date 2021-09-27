import * as THREE from 'three'
import gsap from 'gsap'
import * as dat from 'dat.gui'
import Stats from 'stats-js'

import frag from './shaders/frag.glsl'
import vert from './shaders/vert.glsl'

import oc from 'three-orbit-controls'

const store = {
    dom: {
        webgl: document.querySelector('.webgl')
    },
    bounds: {
        ww: window.innerWidth,
        wh: window.innerHeight
    }
}

// const OrbitControls = oc(THREE)

class MovingLights {
    constructor() {

        this.scene
        this.camera
        this.renderer
        this.composer
        this.geometry
        this.mesh
        this.material
        this.glitch
        this.stats
        this.gui
        this.uniforms

        this.velocity = 0.02
        this.intensity = 0.55

        this.mousePosition = true
        this.wildGlitch = false

        this.color = [0, 91, 184]
        this.offset = { x: 3, y: 3 }
        this.mouse = { x: 0, y: 0 }
        
        this.container = store.dom.webgl

        this.controls

        this.init()
    }

    init() {
        this.createScene()
    }

    createScene() {
        this.scene = new THREE.Scene()

        this.camera = new THREE.PerspectiveCamera(50, store.bounds.ww / store.bounds.wh, 0.5, 1000)
        this.camera.position.set(0, 0, 1)

        this.scene.add(this.camera)

        this.renderer = new THREE.WebGLRenderer({
            antialias: true, 
            preserveDrawingBuffer: true 
        })
        this.renderer.setSize(store.bounds.ww, store.bounds.wh)
        this.renderer.setPixelRatio(gsap.utils.clamp(1, 1.5, window.devicePixelRatio))
        this.renderer.setClearColor(0x000000)
        this.renderer.clear()
        this.container.appendChild(this.renderer.domElement)

        window.addEventListener('resize', this.resize, false)

        // this.controls = new OrbitControls(this.camera, this.renderer.domElement)

        this.stats = new Stats()
        this.stats.domElement.style.position = 'absolute'
        this.stats.domElement.style.left = '300px'
        this.stats.domElement.style.top = '0px'
        document.body.appendChild(this.stats.domElement)

        this.gui = new dat.GUI({ autoPlace: false })
        document.querySelector('.gui-wrap').appendChild(this.gui.domElement)
        this.gui.domElement.id = 'gui';
        this.gui.close()

        const general = this.gui.addFolder('picker')
        general.open()
        general
          .add(this, 'velocity')
          .min(0.01).max(0.2).step(0.01)
          .name('velocity')
        general
          .add(this, 'intensity')
          .min(0.1).max(1.5).step(0.01)
          .name( 'Intensity' )
          .onChange((value) => this.uniforms.intensity.value = value)
        general
          .addColor(this, 'color')
          .name('Color')
          .onChange((value) => this.uniforms.color.value = new THREE.Vector3(...this.rgb(value)))
    
        this.createMesh()
        this.run()
    }

    createMesh() {
        this.uniforms = {
            time: { value: 0 },
            resolution: { value: new THREE.Vector2(store.bounds.ww, store.bounds.wh) },
            intensity: { value: this.intensity },
            color: { value: new THREE.Vector3(...this.rgb(this.color)) },
        }
          
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            fragmentShader: frag,
            vertexShader: vert,
        })
    
        this.geometry = new THREE.PlaneGeometry(store.bounds.ww, store.bounds.wh, 1)
        this.mesh = new THREE.Mesh(this.geometry, this.material)
    
        this.scene.add(this.mesh)
    }

    run = () => {
        this.uniforms.time.value += this.velocity
    
        //this.stats.update()
        
        this.render()
    }

    render() {
        gsap.ticker.add(this.run)

        this.renderer.render(this.scene, this.camera)
    }

    resize() {
        const width = store.bounds.ww
        const height = store.bounds.wh

        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()
        
        this.uniforms.resolution.value.x = width
        this.uniforms.resolution.value.y = height
        
        this.composer.setSize(width, height)
        this.renderer.setSize(width, height)
    }

    rgb(arr) {
        return arr.map((value) => value / 255)
    }

    random(min, max) {
        return (Math.random() * (max - min + 1) ) << 0
    }

    easeOutQuad(t) {
        return t * (2 -t)
    }
}

let lights = new MovingLights()