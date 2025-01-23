import * as THREE from 'three'
import Experience from '../Experience.js'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';

export default class Environment
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        
        // Debug
        // if(this.debug.active)
        // {
        //     this.debugFolder = this.debug.ui.addFolder('environment')
        // }

        RectAreaLightUniformsLib.init();
        this.setSunLight()
        this.setAreaLights() 
        // this.setEnvironmentMap()
    }

    setSunLight()
    {
        this.sunLight = new THREE.DirectionalLight('#ffffff', 1)
        this.sunLight.castShadow = true
        this.sunLight.shadow.camera.far = 105
        this.sunLight.shadow.mapSize.set(1024, 1024)
        this.sunLight.shadow.normalBias = 0.05
        this.sunLight.position.set(-3.5, 10, -1.25)
        this.scene.add(this.sunLight)

        // Debug
        // if(this.debug.active)
        // {
        //     this.debugFolder
        //         .add(this.sunLight, 'intensity')
        //         .name('sunLightIntensity')
        //         .min(0)
        //         .max(10)
        //         .step(0.001)
            
        //     this.debugFolder
        //         .add(this.sunLight.position, 'x')
        //         .name('sunLightX')
        //         .min(- 5)
        //         .max(5)
        //         .step(0.001)
            
        //     this.debugFolder
        //         .add(this.sunLight.position, 'y')
        //         .name('sunLightY')
        //         .min(- 5)
        //         .max(5)
        //         .step(0.001)
            
        //     this.debugFolder
        //         .add(this.sunLight.position, 'z')
        //         .name('sunLightZ')
        //         .min(- 5)
        //         .max(5)
        //         .step(0.001)
        // }
    }

    setAreaLights()
    {
        const areaLight1 = new THREE.RectAreaLight(0xffffff, 200, 1, 1);
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
    }
    

    setEnvironmentMap()
    {
        // this.environmentMap = {}
        // this.environmentMap.intensity = 0.4
        // this.environmentMap.texture = this.resources.items.environmentMapTexture
        // this.environmentMap.texture.colorSpace = THREE.SRGBColorSpace
        
        // this.scene.environment = this.environmentMap.texture

        // this.environmentMap.updateMaterials = () =>
        // {
        //     this.scene.traverse((child) =>
        //     {
        //         if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        //         {
        //             child.material.envMap = this.environmentMap.texture
        //             child.material.envMapIntensity = this.environmentMap.intensity
        //             child.material.needsUpdate = true
        //         }
        //     })
        // }
        // this.environmentMap.updateMaterials()

        // // Debug
        // if(this.debug.active)
        // {
        //     this.debugFolder
        //         .add(this.environmentMap, 'intensity')
        //         .name('envMapIntensity')
        //         .min(0)
        //         .max(4)
        //         .step(0.001)
        //         .onChange(this.environmentMap.updateMaterials)
        // }
    }
}