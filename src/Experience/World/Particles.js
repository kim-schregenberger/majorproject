import * as THREE from 'three'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js'
import GUI from 'lil-gui'
import gsap from 'gsap'

import particlesVertexShader from '../../../static/shaders/particles/vertex.glsl'
import particlesFragmentShader from '../../../static/shaders/particles/fragment.glsl'
import gpgpuParticlesShader from '../../../static/shaders/gpgpu/particles.glsl'

import Experience from '../Experience.js'

export default class Particles {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.renderer = this.experience.renderer.instance
        this.camera = this.experience.camera.instance

        // Track the active model
        this.currentModelIndex = 0
        // Store geometries for later use
        this.gltfChildren = []

        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('particles')
        }

        // Load the GLTF and initialize everything
        this.resource = this.resources.items.particlesModel

        this.setModel()
        this.setScrollObserver()
    }

    setModel() 
    {
        // Store models
        this.gltfChildren = this.resource.scene.children.slice(0, 6)
        this.applyTransformationsToChildren();
  
        // Display the first model by default
        this.createParticles(5);
    }

    isMobile() {
        return window.innerWidth <= 768; // Treat screens 768px or smaller as mobile
    }
    
    applyTransformationsToChildren() {
        const isMobile = this.isMobile(); // Detect device type
    
        this.gltfChildren.forEach((child) => {
            if (isMobile) {
                // Mobile-specific transformations
                child.scale.set(1, 1, 1); // Reset scale
                child.position.set(0, 0, 0); // Default position
            } else {
                // Desktop-specific transformations
                child.scale.set(2, 2, 2); // Scale uniformly
                child.position.set(0, 0, -4); // Position further back
            }
    
            // Update matrix to apply transformations
            child.updateMatrix();
    
            // Bake transformations into the geometry
            if (child.geometry) {
                child.geometry.applyMatrix4(child.matrix); // Apply the transformation matrix to the geometry
                child.geometry.computeBoundingBox(); // Recompute bounding box (optional)
                child.geometry.computeBoundingSphere(); // Recompute bounding sphere (optional)
            }
        });
    }
    

    createParticles(index) 
    {
    const baseGeometry = {};
    baseGeometry.instance = this.gltfChildren[index].geometry; // Select geometry by index
    baseGeometry.count = baseGeometry.instance.attributes.position.count

    // Ensure the geometry is reset to a fixed scale before assigning it
    baseGeometry.instance.scale(1, 1, 1)

    const gpgpu = {};
    gpgpu.size = Math.ceil(Math.sqrt(baseGeometry.count))
    gpgpu.computation = new GPUComputationRenderer(gpgpu.size, gpgpu.size, this.renderer)

    const baseParticlesTexture = gpgpu.computation.createTexture()

    for (let i = 0; i < baseGeometry.count; i++) 
    {
        const i3 = i * 3
        const i4 = i * 4
        baseParticlesTexture.image.data[i4 + 0] = baseGeometry.instance.attributes.position.array[i3 + 0]
        baseParticlesTexture.image.data[i4 + 1] = baseGeometry.instance.attributes.position.array[i3 + 1]
        baseParticlesTexture.image.data[i4 + 2] = baseGeometry.instance.attributes.position.array[i3 + 2]
        baseParticlesTexture.image.data[i4 + 3] = Math.random();
    }

    gpgpu.particlesVariable = gpgpu.computation.addVariable(
        'uParticles',
        gpgpuParticlesShader,
        baseParticlesTexture
    );

    gpgpu.computation.setVariableDependencies(gpgpu.particlesVariable, [gpgpu.particlesVariable])

    gpgpu.particlesVariable.material.uniforms = {
        uTime: new THREE.Uniform(0),
        uDeltaTime: new THREE.Uniform(0),
        uBase: new THREE.Uniform(baseParticlesTexture),
        // Set flow field uniforms to active states by default
        uFlowFieldInfluence: new THREE.Uniform(2.0), // Max influence at start
        uFlowFieldStrength: new THREE.Uniform(1.0),  // Max strength at start
        uFlowFieldFrequency: new THREE.Uniform(0.1), // Reasonable starting frequency
    };

    gpgpu.computation.init();

    const particles = {};
    const particlesUvArray = new Float32Array(baseGeometry.count * 2)
    const sizesArray = new Float32Array(baseGeometry.count)

    for (let y = 0; y < gpgpu.size; y++) {
        for (let x = 0; x < gpgpu.size; x++) {
            const i = y * gpgpu.size + x;
            const i2 = i * 2;

            const uvX = (x + 0.5) / gpgpu.size
            const uvY = (y + 0.5) / gpgpu.size

            particlesUvArray[i2 + 0] = uvX
            particlesUvArray[i2 + 1] = uvY

            sizesArray[i] = Math.random()
        }
    }

    particles.geometry = new THREE.BufferGeometry();
    particles.geometry.setDrawRange(0, baseGeometry.count);
    particles.geometry.setAttribute('aParticlesUv', new THREE.BufferAttribute(particlesUvArray, 2))
    particles.geometry.setAttribute('aColor', baseGeometry.instance.attributes.color || new THREE.BufferAttribute(new Float32Array(baseGeometry.count * 3), 3))
    particles.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizesArray, 1))

    particles.material = new THREE.ShaderMaterial(
    {
        vertexShader: particlesVertexShader,
        fragmentShader: particlesFragmentShader,
        uniforms: {
            uSize: new THREE.Uniform(0.065),
            uResolution: new THREE.Uniform(
                new THREE.Vector2(
                    this.experience.sizes.width * this.experience.sizes.pixelRatio,
                    this.experience.sizes.height * this.experience.sizes.pixelRatio
                )
            ),
            uParticlesTexture: new THREE.Uniform(),
            uOpacity: new THREE.Uniform(1.0),
        },
    });

    if (this.particlesPoints) 
    {
        // Remove old points
        this.scene.remove(this.particlesPoints);
    }

    particles.points = new THREE.Points(particles.geometry, particles.material)
    this.scene.add(particles.points)
    this.particlesPoints = particles.points
    this.gpgpu = gpgpu;

    this.experience.time.on('tick', () => {
        const elapsedTime = this.time.elapsed
        const deltaTime = this.time.delta

        gpgpu.particlesVariable.material.uniforms.uTime.value = elapsedTime * 0.001
        gpgpu.particlesVariable.material.uniforms.uDeltaTime.value = deltaTime * 0.001
        gpgpu.computation.compute();

        particles.material.uniforms.uParticlesTexture.value =
            gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture
    })

    if (this.debug.active) 
    {
        const flowFieldFolder = this.debugFolder.addFolder('Flow Field');
        flowFieldFolder.add(gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence, 'value', 0, 2).name('Influence');
        flowFieldFolder.add(gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength, 'value', 0, 10).name('Strength');
        flowFieldFolder.add(gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency, 'value', 0, 0.5).name('Frequency');
    }
}


    smoothStep(edge0, edge1, x) {
        const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1)
        // Smoother interpolation
        return t * t * (3 - 2 * t); 
    }
    
    getScrollProgress(section) {
        // const rect = section.getBoundingClientRect(); 
        // const viewportHeight = window.innerHeight;
        // const progress = (rect.top - viewportHeight / 2) / rect.height; 
       
        const rect = section.getBoundingClientRect()
        const viewportHeight = window.innerHeight;
        const middleOfSection = rect.top + rect.height / 2
        const progress = (middleOfSection - viewportHeight / 2) / (rect.height / 2)
    
        // One-third of the section
        const plateauRange = 0.33
        const lowerBound = 0.5 - plateauRange / 2
        const upperBound = 0.5 + plateauRange / 2
    
        // Apply smooth plateau for middle range
        const plateauProgress = this.smoothStep(lowerBound, upperBound, Math.abs(progress - 0.5));
    
        return THREE.MathUtils.clamp(1 - plateauProgress, 0, 1);
    }
    
    

    setScrollObserver() {
        const sections = document.querySelectorAll('.scroll-section');
    
        const observerOptions = {
            root: null, // The viewport
            rootMargin: '0px 0px -25% 0px', // Adjusts to trigger when the section reaches the middle of the viewport
        };
    
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const index = Array.from(sections).indexOf(entry.target);
    
                    if (index !== this.currentModelIndex) {
                        // Start transition by briefly boosting flow field values
                        const oldGpgpu = this.gpgpu;
                        if (oldGpgpu) {
                            gsap.to(oldGpgpu.particlesVariable.material.uniforms.uFlowFieldStrength, { value: 2.0, duration: 0.5 });
                            gsap.to(oldGpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency, { value: 0.2, duration: 0.5 });
                            gsap.to(oldGpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence, { value: 2.0, duration: 0.5 });
                        }
    
                        // Create new particles after transition
                        setTimeout(() => {
                            this.createParticles(index); // Update model
                            this.currentModelIndex = index;
                        }, -1000); // Ensure smooth transition timing
                    }
                }
            });
        }, observerOptions);
    
    
        
        sections.forEach((section) => observer.observe(section));
    
        window.addEventListener('scroll', () => {
            sections.forEach((section, index) => {
                const progress = this.getScrollProgress(section); // Get the scroll progress
        
                if (index === this.currentModelIndex) {
                    const strength = THREE.MathUtils.lerp(10, 0.0, progress);
                    this.gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength.value = strength * 0.1 + 0.01;
        
                    const frequency = THREE.MathUtils.lerp(0.25, 0.0, progress);
                    this.gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency.value = frequency;
        
                    const influence = THREE.MathUtils.lerp(3.0, 0.0, progress);
                    this.gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence.value = influence;
        
                    // Remove opacity control
                }
            });
        }); 
    }

    update() 
    {
        if (this.particlesPoints) {
            // Optional: Add subtle animations like pulsating or drifting particles
            // this.particlesPoints.rotation.y += 0.001;  // Example: slow rotation
        }
    }

    destroy() {
        if (this.particlesPoints) {
            this.particlesPoints.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    if (child.geometry) {
                        child.geometry.dispose();
                    }
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach((material) => {
                                if (material) material.dispose();  // Check for null
                            });
                        } else {
                            if (child.material) child.material.dispose();
                        }
                    }
                }
            });
            this.scene.remove(this.particlesPoints);
            this.particlesPoints = null;  // Clear reference
            console.log('Particles scene destroyed.');
        }
    }
    
    init() {
        console.log('Reinitializing particles...');
        this.setModel();  // This function creates the particles scene
        console.log('Particles scene initialized.');
    }
    
    


}

