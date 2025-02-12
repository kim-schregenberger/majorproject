import * as THREE from 'three'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js'
// import GUI from 'lil-gui'
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

        window.addEventListener('resize', this.handleResize.bind(this))
    }

    handleResize() {
        const newWidth = window.innerWidth;
        const currentWidth = this.previousWidth || newWidth;

        // Check if the window width has crossed 1024px threshold --> to update model size
        if ((currentWidth <= 1024 && newWidth > 1024) || (currentWidth > 1024 && newWidth <= 1024)) {
            // Reload the page if the threshold is crossed
            window.location.reload();
        }
        // Update the previous width to compare on the next resize
        this.previousWidth = newWidth;
    }

    setModel() 
    {
        // Store models
        this.gltfChildren = this.resource.scene.children.slice(0, 6)
        this.applyTransformationsToChildren();
  
        // Display the first model by default
        this.createParticles(5);
        console.log('Initial model index:', this.currentModelIndex);
    }

    isMobile() {
        return window.innerWidth <= 1024;
    }
    
    applyTransformationsToChildren() {
        const isMobile = this.isMobile();
    
        this.gltfChildren.forEach((child) => {
            if (isMobile) {
                // Mobile-specific transformations
                child.scale.set(1, 1, 1); 
                child.position.set(0, 0, 0); 
            } else {
                // Desktop-specific transformations
                child.scale.set(2, 2, 2); 
                child.position.set(0, 0, -4);
            }
    
            // Update matrix to apply transformations
            child.updateMatrix();
    
            // Bake transformations into the geometry
            if (child.geometry) {
                // Apply the transformation matrix to the geometry
                child.geometry.applyMatrix4(child.matrix);
                // Recompute bounding box
                child.geometry.computeBoundingBox();
                // Recompute bounding sphere
                child.geometry.computeBoundingSphere();
            }
        });
    }
    

    createParticles(index) 
    {
    const baseGeometry = {};
    // Select geometry by index
    baseGeometry.instance = this.gltfChildren[index].geometry;
    baseGeometry.count = baseGeometry.instance.attributes.position.count

    // reset geometry to fixed scale before assigning
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
        // Set flow field uniforms
        uFlowFieldInfluence: new THREE.Uniform(2.0),
        uFlowFieldStrength: new THREE.Uniform(1.0), 
        uFlowFieldFrequency: new THREE.Uniform(0.1),
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
            // Particles size
            uSize: new THREE.Uniform(0.055),
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
        const scrollSection = document.querySelector('.scroll');
        const sections = document.querySelectorAll('.scroll-section');
        const hideSections = document.querySelectorAll('.final, .end, .footer');
        const canvas = document.querySelector('.webgl');
    
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -25% 0px',
        };
    
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const index = Array.from(sections).indexOf(entry.target);
    
                    if (index !== this.currentModelIndex) {
                        console.log('Model changed, new index:', index); 
                        // Start transition by boosting flow field values
                        const oldGpgpu = this.gpgpu;
                        if (oldGpgpu) {
                            gsap.to(oldGpgpu.particlesVariable.material.uniforms.uFlowFieldStrength, { value: 2.0, duration: 0.5 });
                            gsap.to(oldGpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency, { value: 0.2, duration: 0.5 });
                            gsap.to(oldGpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence, { value: 2.0, duration: 0.5 });
                        }
                        
                        // Fade out the canvas before changing the model
                        gsap.to(canvas, { opacity: 0, duration: 0.5, onComplete: () => {
                        // Change model after opacity is 0
                        setTimeout(() => {
                            this.createParticles(index);
                            this.currentModelIndex = index;
                        }, -500);

                        // Fade the canvas back in after changing the model
                        gsap.to(canvas, { opacity: 1, duration: 0.5 });
                    }});
                    }
                }
            });
        }, observerOptions);
    
        sections.forEach((section) => observer.observe(section));
    
        window.addEventListener('scroll', () => {
            sections.forEach((section, index) => {
                const progress = this.getScrollProgress(section);
        
                if (index === this.currentModelIndex) {
                    console.log('Scrolling, current model index:', this.currentModelIndex); 
                    const strength = THREE.MathUtils.lerp(10, 0.0, progress);
                    this.gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength.value = strength * 0.1 + 0.01;
        
                    const frequency = THREE.MathUtils.lerp(0.25, 0.0, progress);
                    this.gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency.value = frequency;
        
                    const influence = THREE.MathUtils.lerp(3.0, 0.0, progress);
                    this.gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence.value = influence;
                }
            });
        }); 

        const hideObserver = new IntersectionObserver((entries) => {
            let shouldHide = false;
    
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // If any hide section is visible, set to true
                    shouldHide = true;
                }
            });
    
            if (shouldHide) {
                this.fadeOutCanvas();
            } else {
                this.fadeInCanvas();
            }
        }, observerOptions);
    
        // Observe all hide sections
        hideSections.forEach((section) => hideObserver.observe(section));        
    }

    fadeOutCanvas() {
        const canvas = document.querySelector('.webgl');
        if (canvas.style.opacity === "0") return; // Prevent redundant animation
        gsap.to(canvas, { opacity: 0, duration: 0.5 });
    }

    fadeInCanvas() {
        const canvas = document.querySelector('.webgl');
        if (canvas.style.opacity === "1") return; // Prevent redundant animation
        gsap.to(canvas, { opacity: 1, duration: 0.5 });
    }


    
    update() 
    {
        if (this.particlesPoints) {
            // this.particlesPoints.rotation.y += 0.001; 
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
            this.particlesPoints = null;
            console.log('Particles scene destroyed.');
        }
    }
    
    init() {
        console.log('Reinitializing particles...');
        this.setModel();
        console.log('Particles scene initialized.');
    }
    
    


}

