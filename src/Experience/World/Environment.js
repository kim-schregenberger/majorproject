import * as THREE from 'three'
import Experience from '../Experience.js'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';

export default class Environment
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        RectAreaLightUniformsLib.init();
        this.setSunLight()
        this.setAreaLights() 
    }

    setSunLight()
    {
        this.sunLight = new THREE.DirectionalLight('#ffffff', 1.5)
        this.sunLight.castShadow = false
        this.sunLight.shadow.camera.far = 205
        this.sunLight.shadow.mapSize.set(1024, 1024)
        this.sunLight.shadow.normalBias = 0.05
        this.sunLight.position.set(-5.5, 10, -1.25)
        this.scene.add(this.sunLight)
    }

    setAreaLights()
    {
        const areaLight1 = new THREE.RectAreaLight(0xffffff, 300, 1, 1);
        areaLight1.position.set(-4.264, 7.5653, 4.8902);
        areaLight1.rotation.set(
            THREE.MathUtils.degToRad(-67.533), 
            THREE.MathUtils.degToRad(6.1011), 
            THREE.MathUtils.degToRad(22.753)
        );
        this.scene.add(areaLight1);
    
        const areaLight2 = new THREE.RectAreaLight(0xffffff, 200, 1, 1);
        areaLight2.position.set(0, -7.6988, 5.634);
        areaLight2.rotation.set(
            THREE.MathUtils.degToRad(52.4), 
            THREE.MathUtils.degToRad(-1.3376), 
            THREE.MathUtils.degToRad(-0.65823)
        );
        this.scene.add(areaLight2);

        const areaLight3 = new THREE.RectAreaLight(0xffffff, 1000, 1, 1);
        areaLight3.position.set(7.5071, 9.5383, 2.8329);
        areaLight3.rotation.set(
            THREE.MathUtils.degToRad(-148.57), 
            THREE.MathUtils.degToRad(103.46), 
            THREE.MathUtils.degToRad(-95.497)
        );
        this.scene.add(areaLight3);

        const areaLight4 = new THREE.RectAreaLight(0xffffff, 1000, 1, 1);
        areaLight3.position.set(1.99048, 8.85442, -1.66778);
        areaLight3.rotation.set(
            THREE.MathUtils.degToRad(-36.772), 
            THREE.MathUtils.degToRad(105.037), 
            THREE.MathUtils.degToRad(40.7041)
        );
        this.scene.add(areaLight3);
    }

}