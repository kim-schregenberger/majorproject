import * as THREE from 'three'
import Experience from './Experience/Experience.js';
import { gsap } from "gsap"; 
import { ScrollTrigger } from "gsap/ScrollTrigger";


gsap.registerPlugin(ScrollTrigger);



const canvas = document.querySelector('canvas.webgl');
const experience = new Experience(canvas);

let particles = experience.world.particles;  // Will be updated after `resources.on('ready')`
const stages = experience.world.stage;

let currentStageNumber = null;

function hideElements(selector) {
    document.querySelectorAll(selector).forEach((el) => el.classList.add('hide'));
}

function showElements(selector) {
    document.querySelectorAll(selector).forEach((el) => el.classList.remove('hide'));
}

// Color of Stages
function getStageClass(stageNumber) {
    const stageMap = {
        1: 'one',
        2: 'two',
        3: 'three',
        4: 'four'
    };
    return `stage-${stageMap[stageNumber]}`;
}

const stageColors = {
    1: '#CCB7C4',  // Red for stage 1
    2: '#997D92',  // Green for stage 2
    3: '#776273',  // Blue for stage 3
    4: '#211d20',  // Yellow for stage 4
    initial: '#211d20'  // Initial color (white)
};

function changeSceneBackgroundColor(color) {
    experience.scene.background = new THREE.Color(color);  // Ensure THREE is imported
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
        
        // Change the canvas background color
        changeSceneBackgroundColor(stageColors[stageNumber]);
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
    destroyParticles();  // Destroy particles instead of just hiding

    if (currentStageNumber !== null) {
        hideStageSection(currentStageNumber);
    }

    stages.loadStage(stageNumber);
    showStageSection(stageNumber);

    experience.renderer.instance.compile(stages.scene, experience.camera.instance);
}

// Destroy Stage
function destroyStage() {
    console.log('Destroying current stage...');
    stages.destroy();

    if (currentStageNumber !== null) {
        hideStageSection(currentStageNumber);
    }
}


// Leave Stage and go back to Particles
document.querySelectorAll('.go-back').forEach((button) => {
    button.addEventListener('click', () => {
        destroyStage();
        showElements('.show-initial');
        showElements('section.scroll');
        
        // Reset the canvas to the initial color
        changeSceneBackgroundColor(stageColors.initial);

        // Scroll to a specific section
        const sectionId = event.target.getAttribute('data-section');
        const targetSection = document.querySelector(`#${sectionId}`);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});


// Load resources and initialize event listeners
experience.world.resources.on('ready', () => {
    console.log('Resources loaded, initializing event listeners...');
    particles = experience.world.particles;  // Ensure particles is set after resources are loaded

    document.getElementById('button-stage-1').addEventListener('click', () => loadStage(1));
    document.getElementById('button-stage-2').addEventListener('click', () => loadStage(2));
    document.getElementById('button-stage-3').addEventListener('click', () => loadStage(3));
    document.getElementById('button-stage-4').addEventListener('click', () => loadStage(4));
});



// GSAP
const testimonial = document.querySelector('section.testimonial');
const info = document.querySelector('section.info');

gsap.fromTo(
    testimonial, 
    {
        opacity: 0,
        x: -50
    },
    {
        opacity: 1,
        x: 0,
        duration: 2,
        ScrollTrigger: info
    }
)