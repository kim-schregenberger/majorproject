import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Stage {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.renderer = this.experience.renderer.instance
        this.camera = this.experience.camera.instance

        // Detect device type
        this.isMobile = this.detectMobileDevice()

        this.resources.on('ready', () => {
            this.resource = this.isMobile 
                // Mobile model
                ? this.resources.items.stagesModel
                // Desktop model
                : this.resources.items.stagesModel

            this.ready = true // Resource is loaded
            console.log(`Resource loaded in Stage (${this.isMobile ? 'Mobile' : 'Desktop'})`, this.resource)
        })

        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Stages')
        }

        this.currentStage = null  // Track the current stage model
    }

    // Device detection function
    detectMobileDevice() {
        return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(window.navigator.userAgent) || window.innerWidth < 768
    }
    

    // Loads the 3D model for a specific stage
    loadStage(stageNumber) {
        if (!this.resource || !this.resource.scene) {
            console.error('GLTF resource not loaded yet');
            return;
        }
    
        // Clone the scene to avoid modifying the original resource
        const sceneClone = this.resource.scene.clone(true);
    
        // Validate the requested model index
        const childIndex = stageNumber;
        if (!sceneClone.children[childIndex]) {
            console.error(`No model found at children index: ${childIndex}`);
            console.log('GLTF Children:', sceneClone.children);
            return;
        }
    
        // Cleanup: Remove the previous stage model
        if (this.gltfChild) {
            this.scene.remove(this.gltfChild);
            this.destroy(); // Dispose of resources
        }
    
        // Select the model for the stage
        this.gltfChild = sceneClone.children[childIndex];
    
        // **RESET TRANSFORMATIONS**: Ensure the model starts with default settings
        this.gltfChild.scale.set(1, 1, 1); 
        this.gltfChild.position.set(0, 0, 0);
    
        // **APPLY DEVICE-SPECIFIC TRANSFORMATIONS**
        if (this.isMobile) {
            this.gltfChild.scale.set(1.2, 1.2, 1.2);
            this.gltfChild.position.set(0, -2.5, 0);
        } else {
            this.gltfChild.scale.set(1.6, 1.6, 1.6);
            this.gltfChild.position.set(0, -1, -4);
        }
    
        // Add the model to the scene
        this.scene.add(this.gltfChild);
    
        console.log(`Loaded Stage ${stageNumber} with model:`, this.gltfChild);
    
        // Track the current stage model
        this.currentStage = this.gltfChild;
    }
    
    

    // Update method (called every frame)
    update() {
        if (this.gltfChild) {
            // Add animation or updates if needed
        }
    }

    // Cleanup
    destroy() {
        if (this.gltfChild) {
            this.gltfChild.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.geometry.dispose()
                    if (child.material.dispose) child.material.dispose()
                }
            })
            this.scene.remove(this.gltfChild)
        }
    }


}
