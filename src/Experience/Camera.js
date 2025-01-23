import * as THREE from 'three'
import Experience from './Experience.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class Camera
{
    constructor()
    {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas

        this.setInstance()
        this.setControls()
    }

    setInstance()
    {
        this.instance = new THREE.PerspectiveCamera(50, this.sizes.width / this.sizes.height, 0.1, 100)
        this.instance.position.set(-15, 0, 1.5)
        this.scene.add(this.instance)

        // DEBUG
        // console.log('Camera position:', this.instance.position);
        // this.instance.position.set(0, 0, 10);
        // this.instance.lookAt(0, 0, 0);
        // 


    }

    setControls()
    {
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.enableDamping = true
        // this.controls.enabled = false
        this.controls.minDistance = 0;
        this.controls.maxDistance = 2000;
    }

    resize()
    {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update()
    {
        this.controls.update()
    }
}