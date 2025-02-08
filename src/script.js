import Experience from './Experience/Experience.js';
import { gsap } from "gsap"; 


const canvas = document.querySelector('canvas.webgl');
const experience = new Experience(canvas);
// Store global
window.experience = experience;

let particles = experience.world.particles;
const stages = experience.world.stage;

let currentStageNumber = null;


function hideElements(selector) {
    document.querySelectorAll(selector).forEach((el) => el.classList.add('hide'));
}

function showElements(selector) {
    document.querySelectorAll(selector).forEach((el) => el.classList.remove('hide'));
}

// Background of Stages
// Get class
function getStageClass(stageNumber) {
    const stageMap = {
        1: 'one',
        2: 'two',
        3: 'three',
        4: 'four'
    };
    return `stage-${stageMap[stageNumber]}`;
}
// Change position of bg-image
function changeStageBackgroundPosition(stageNumber) {
    const stagePositions = {
        1: 'right 100%',
        2: 'right 0%',  
        3: 'left 30%',   
        4: 'center 60%',    
    };

    const bgImage = document.querySelector('.bg-container img');
    if (bgImage) {
        bgImage.style.objectPosition = stagePositions[stageNumber] || 'center center';
        console.log(`Background position updated for stage ${stageNumber}: ${stagePositions[stageNumber]}`);
    }
}

// Show Stage
function showStageSection(stageNumber) {
    document.querySelectorAll('.canvas.stages').forEach((stage) => stage.classList.remove('visible'));

    const stageClass = `.canvas.stages.${getStageClass(stageNumber)}`;
    const stageElement = document.querySelector(stageClass);
    if (stageElement) {
        stageElement.classList.add('visible');
        currentStageNumber = stageNumber;
        console.log(`Stage section for stage ${stageNumber} shown.`);

        // Change background position for this stage
        changeStageBackgroundPosition(stageNumber);
    } else {
        console.error(`Stage section for stage ${stageNumber} not found.`);
    }
}

// Hide Stage
function hideStageSection(stageNumber) {
    const stageClass = `.canvas.stages.${getStageClass(stageNumber)}`;
    const stageElement = document.querySelector(stageClass);
    if (stageElement) {
        stageElement.classList.remove('visible');
        console.log(`Stage section for stage ${stageNumber} hidden.`);
        currentStageNumber = null;
    }
}

// Destroy Particles
function destroyParticles() {
    console.log('Destroying particles...');
    particles.destroy(); 
}

// Load Stage
function loadStage(stageNumber) {
    hideElements('.show-initial');
    hideElements('section.scroll');
    destroyParticles();

    if (currentStageNumber !== null) {
        hideStageSection(currentStageNumber);
    }

    stages.loadStage(stageNumber);
    showStageSection(stageNumber);

    // Initial camera position
    const wholeModelLi = document.querySelector('.whole-model');
    if (wholeModelLi && stages.initialCameraPosition) {
        const { x, y, z } = stages.initialCameraPosition;
        wholeModelLi.setAttribute('data-camera-position', `${x},${y},${z}`);
    }

    experience.renderer.instance.compile(stages.scene, experience.camera.instance);
}

// Destroy Stage
function destroyStage() {
    console.log('Destroying current stage...');
    stages.destroy();

    if (currentStageNumber !== null) {
        hideStageSection(currentStageNumber);
    }
    // Reset to initial bg-position
    document.querySelector('.bg-container img').style.objectPosition = 'right 79%';
}

// Change class so pointer events are allowed --> to move model
document.querySelectorAll('.explore').forEach((button) => 
    {
        button.addEventListener('click', () =>
        {
            document.querySelectorAll('.explore').forEach((el) => el.classList.add('active'));
            document.querySelectorAll('.grain').forEach((el) => el.classList.add('active'));
            document.querySelectorAll('.stages-section').forEach((el) => {
                el.classList.add('active'); 
    
                gsap.fromTo(el, 
                    { opacity: 0 },
                    { opacity: 1, duration: 5, ease: "power3.out" }
                );
            });
        })
    })


// Leave Stage and go back to Particles
const backToParticles = document.querySelectorAll(".go-back, img.go-back-cross");

backToParticles.forEach((element) => {
    element.addEventListener('click', () => {
        resetCameraPosition()
        stages.resetStage();
        destroyStage();
        showElements('.show-initial');
        showElements('section.scroll');

        document.querySelectorAll('.stages-section ul li').forEach((el) => el.classList.remove('active'));
        document.querySelectorAll('.overview').forEach((el) => el.classList.add('active'));
        document.querySelectorAll('.grain').forEach((el) => el.classList.remove('active'));
        document.querySelectorAll('.stages-section').forEach((el) => el.classList.remove('active'));
        document.querySelectorAll('.explore').forEach((el) => el.classList.remove('active'));

        // Scroll to specific section
        const sectionId = event.target.getAttribute('data-section');
        const targetSection = document.querySelector(`#${sectionId}`);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Reset scroll position of tabs when leaving
        document.querySelectorAll(".horizontal-tabs").forEach(tab => {
            tab.scrollLeft = 0;
        });
    });
});


// Load resources and initialize event
experience.world.resources.on('ready', () => {
    console.log('Resources loaded, initializing event listeners...');
    particles = experience.world.particles; 

    document.getElementById('button-stage-1').addEventListener('click', () => loadStage(1));
    document.getElementById('button-stage-2').addEventListener('click', () => loadStage(2));
    document.getElementById('button-stage-3').addEventListener('click', () => loadStage(3));
    document.getElementById('button-stage-4').addEventListener('click', () => loadStage(4));
});



// Stages Camera
document.querySelectorAll('.stages-section ul li').forEach((item) => {
    item.addEventListener('click', (event) => {
        const cameraPosition = event.target.getAttribute('data-camera-position');
        
        if (item.classList.contains('whole-model')) {
            resetCameraPosition();
        } else if (cameraPosition) {
            const [x, y, z] = cameraPosition.split(',').map(Number);
            moveCameraToPosition(x, y, z);
        }
    });
});

// Move Camera
function moveCameraToPosition(x, y, z) {
    const duration = 1.5;
    gsap.to(experience.camera.instance.position, {
        x: x,
        y: y,
        z: z,
        duration: duration,
        ease: "power3.inOut",
        onUpdate: () => {
            experience.camera.controls.update();
        },
        onComplete: () => {
            console.log(`Camera moved to position: (${x}, ${y}, ${z})`);
        }
    });
}

// Reset Camera
function resetCameraPosition() {
    gsap.to(experience.camera.instance.position, {
        x: -15,
        y: 0,
        z: 1.5,
        duration: 1.5,
        ease: "power3.inOut",
        onUpdate: () => {
            experience.camera.controls.update(); // Ensure controls are updated during the transition
        },
        onComplete: () => {
            console.log("Camera reset to initial position.");
        }
    });
}


// Stages Li-Elements
document.querySelectorAll('.stages-section ul li').forEach((item) => {
    item.addEventListener('click', (event) => {
        // Remove active
        document.querySelectorAll('.stages-section ul li').forEach((el) => el.classList.remove('active'));

        // Add active to clicked item
        event.target.classList.add('active');
    });
});

// Change Text for clicked li
document.addEventListener("DOMContentLoaded", function() {
    const listItems = document.querySelectorAll(".canvas.stages ul li");

    listItems.forEach(item => {
        item.addEventListener("click", function() {
            const stage = this.closest(".canvas.stages");

            const description = stage.querySelector("#stage-description");

            stage.querySelectorAll("ul li").forEach(el => el.classList.remove("active"));

            this.classList.add("active");
            description.textContent = this.dataset.text;
        });
    });
});


// Loading screen
const loadingScreen = document.getElementById('loading-screen');
const loadingContent = document.getElementById('loading-content');
const enterButton = document.getElementById('enter-button');

const hasLoadedBefore = sessionStorage.getItem('hasLoadedBefore');

if (hasLoadedBefore) {
    loadingContent.style.display = 'none'
    experience.world.resources.on('ready', () => {
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500); // Match the transition duration

    });
    
    // initializeExperience();
} else {
    // Show loading screen only on first load
    enterButton.disabled = true;

    experience.world.resources.on('ready', () => {
        console.log('Resources loaded, enabling Enter button...');
        
        // Enable the button once resources are ready
        enterButton.disabled = false;
        enterButton.classList.add('enabled');
        enterButton.textContent = 'Erkunden';
    });

    enterButton.addEventListener('click', () => {
        if (!enterButton.disabled) {
            console.log('User clicked Enter, starting experience...');
            
            // Fade out loading screen
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500); // Match the transition duration

            // Mark experience as loaded in session storage
            sessionStorage.setItem('hasLoadedBefore', 'true');

            // Initialize the experience
            initializeExperience();
        }
    });
}








// Initialize the experience
function initializeExperience() {
    particles = experience.world.particles;
    document.getElementById('button-stage-1').addEventListener('click', () => loadStage(1));
    document.getElementById('button-stage-2').addEventListener('click', () => loadStage(2));
    document.getElementById('button-stage-3').addEventListener('click', () => loadStage(3));
    document.getElementById('button-stage-4').addEventListener('click', () => loadStage(4));
}


// Zoom Arrows
gsap.to("#arrow-tr", { 
    x: 3, y: -3, 
    opacity: 0.7, 
    duration: 1, 
    ease: "power1.inOut", 
    repeat: -1, 
    yoyo: true 
});

gsap.to("#arrow-bl", { 
    x: -3, y: 3, 
    opacity: 0.7, 
    duration: 1, 
    ease: "power1.inOut", 
    repeat: -1, 
    yoyo: true 
});
