import { gsap } from "gsap"; 
import { ScrollTrigger } from "gsap/ScrollTrigger";


gsap.registerPlugin(ScrollTrigger);

// GSAP
const elementsToFadeIn = document.querySelectorAll(".testimonial, #section-start, #section-0, #section-1, #section-2, #section-3, #section-4, .final, .end");

elementsToFadeIn.forEach((element) => {
    gsap.fromTo(
        element,
        {
            opacity: 0,
            y: 50
        },
        {
            opacity: 1,
            duration: 2,
            y: 0,
            scrollTrigger: {
                trigger: element,
                start: "top center",
                end: "bottom bottom",
                toggleActions: "play none none reverse",
                scrub: 1
            }
        }
    );
});



const elementsToAnimate = document.querySelectorAll(".testimonial-betroffene, .testimonial-angehoerige, .testimonial-fachpersonal, .perspektive, .infopage , .text");

elementsToAnimate.forEach((element) => {
    gsap.fromTo(
        element,
        {
            opacity: 0,
            y: 50
        },
        {
            opacity: 1,
            y: 0,
            duration: 2,
            scrollTrigger: {
                trigger: element,
                start: "top 85%",
                end: "bottom bottom",
                toggleActions: "play none none reverse",
                scrub: 1
            }
        }
    );
});


const toTopButton = document.getElementById("to-top");

// Initial state: Hide the button
gsap.set(toTopButton, { opacity: 0, pointerEvents: "none" });

window.addEventListener("scroll", function () {
    if (window.scrollY > 200) { 
        // Animate in (scale and fade)
        gsap.to(toTopButton, { opacity: 1, duration: 0.5, ease: "power2.out", pointerEvents: "auto" });
    } else {
        // Animate out (scale down and fade)
        gsap.to(toTopButton, { opacity: 0, duration: 0.5, ease: "power2.in", pointerEvents: "none" });
    }
});


const scrollHint = document.getElementById("scroll");
const scrollText = document.getElementById("scrollText");

    // Split text into individual spans
    const letters = scrollText.textContent.split("").map(letter => {
        const span = document.createElement("span");
        span.textContent = letter;
        return span;
    });

    // Clear the original text and append the new spans
    scrollText.textContent = "";
    letters.forEach(span => scrollText.appendChild(span));

    let lettersAnimation;

    function animateLetters() {
        // Kill any existing animation before starting a new one
        if (lettersAnimation) gsap.killTweensOf(letters);

        // Reset all letters to full opacity
        gsap.set(letters, { opacity: 1 });

        // Create the wave effect: one letter at 0.4 opacity at a time
        lettersAnimation = gsap.to(letters, {
            opacity: 0.4,
            duration: 2,
            stagger: {
                each: 0.1,
                repeat: -1,
                yoyo: true
            },
            ease: "sine.inOut"
        });
    }

    // Start the looping animation initially
    animateLetters();

    window.addEventListener("scroll", function () {
        if (window.scrollY > 150) {
            // Stop letter animation and fade out
            gsap.killTweensOf(letters); // Stop the wave effect
            gsap.to(scrollHint, { opacity: 0, duration: 0.5, ease: "power2.out" });
        } else {
            // Resume animation when scrolling back up
            animateLetters();
            gsap.to(scrollHint, { opacity: 1, duration: 0.5, ease: "power2.in" });
        }
    });

