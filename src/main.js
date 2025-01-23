document.addEventListener('DOMContentLoaded', () => {
    // Get the buttons and stage containers
    const readMoreButtons = document.querySelectorAll('.scroll-section .read-more');
    const goBackButtons = document.querySelectorAll('.stages .go-back');
    const stageContainers = document.querySelectorAll('.canvas.stages');

    // Add click event listeners for "Mehr zum Stadium" buttons
    readMoreButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            const stageContainer = stageContainers[index]; // Get the corresponding stage container
            if (stageContainer) {
                stageContainer.classList.remove('hidden'); // Show the stage content
            }
        });
    });

    // Add click event listeners for "Zurück" buttons
    goBackButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            const stageContainer = stageContainers[index]; // Get the corresponding stage container
            if (stageContainer) {
                stageContainer.classList.add('hidden'); // Hide the stage content
            }
        });
    });
});


const canvas = document.querySelector('canvas.webgl');
const overlay = document.querySelector('.overlay-elements');

overlay.addEventListener('mousedown', (event) => {
    // Forward the mouse event to the canvas
    const canvasRect = canvas.getBoundingClientRect();
    const simulatedEvent = new MouseEvent('mousedown', {
        clientX: event.clientX - canvasRect.left,
        clientY: event.clientY - canvasRect.top,
        bubbles: true,
    });
    canvas.dispatchEvent(simulatedEvent);
});

// Same for mousemove and mouseup
overlay.addEventListener('mousemove', (event) => {
    const canvasRect = canvas.getBoundingClientRect();
    const simulatedEvent = new MouseEvent('mousemove', {
        clientX: event.clientX - canvasRect.left,
        clientY: event.clientY - canvasRect.top,
        bubbles: true,
    });
    canvas.dispatchEvent(simulatedEvent);
});

overlay.addEventListener('mouseup', (event) => {
    const canvasRect = canvas.getBoundingClientRect();
    const simulatedEvent = new MouseEvent('mouseup', {
        clientX: event.clientX - canvasRect.left,
        clientY: event.clientY - canvasRect.top,
        bubbles: true,
    });
    canvas.dispatchEvent(simulatedEvent);
});


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

document.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, experience.camera.instance);
    const intersects = raycaster.intersectObjects(experience.world.scene.children);

    if (intersects.length > 0) {
        console.log('Clicked on:', intersects[0].object);
    }
});
