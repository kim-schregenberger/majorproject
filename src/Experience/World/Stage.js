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

        this.currentStage = null
    }

    detectMobileDevice() {
        const screenWidth = window.innerWidth;
        return screenWidth <= 1024;
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

    
        // Reset transformation so model starts with default settings
        this.gltfChild.scale.set(1, 1, 1); 
        this.gltfChild.position.set(0, 0, 0);
    
        // apply device specific transformations
        if (this.isMobile) 
            {
            this.gltfChild.scale.set(1.2, 1.2, 1.2);

            console.log("gltfScale",this.gltfChild.scale);

            this.gltfChild.position.set(0, -2.5, 0);
            console.log("gltfPosition",this.gltfChild.position);

            this.initialCameraPosition = { x: -15, y: 0, z: 1.5 };
            console.log("initialCameraPosition",this.initialCameraPosition);
            } 
            else 
            {
                this.gltfChild.scale.set(2.2,2.2,2.2);
                console.log("gltfScale",this.gltfChild.scale);

                this.gltfChild.position.set(-2,-2,-1.5);
                console.log("gltfPosition",this.gltfChild.position);

                this.initialCameraPosition = { x: -15, y: 0, z: 1.5 };
                console.log("initialCameraPosition",this.initialCameraPosition);
            }
                // Store the initial model state
                this.initialModelState = 
                {
                    position: this.gltfChild.position.clone(),
                    scale: this.gltfChild.scale.clone(),
                    rotation: this.gltfChild.rotation.clone(),
                };
        
    
        // Add the model to the scene
        this.scene.add(this.gltfChild);
    
        console.log(`Loaded Stage ${stageNumber} with model:`, this.gltfChild);
    
        // Track the current stage model
        this.currentStage = this.gltfChild;
        
    }

    resetStage() {
        if (!this.currentStage || !this.initialModelState || !this.initialCameraPosition) {
            console.error('No current stage or initial states to reset.');
            return;
        }

        // Reset model transformations
        this.currentStage.position.copy(this.initialModelState.position);
        this.currentStage.scale.copy(this.initialModelState.scale);
        this.currentStage.rotation.copy(this.initialModelState.rotation);

        // Reset camera position
        this.camera.position.set(-15, 0, 1.5);
        this.camera.lookAt(0, 0, 0);

        console.log('Stage and camera have been reset to their initial states.');
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
