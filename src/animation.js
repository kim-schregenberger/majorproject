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