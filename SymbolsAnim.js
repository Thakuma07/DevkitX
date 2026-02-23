const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
const Lenis = window.Lenis;

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

const animatedIcons = document.querySelector(".animated-icons");
const iconElements = document.querySelectorAll(".animated-icon");
const textSegments = document.querySelectorAll(".text-segment");
const placeholders = document.querySelectorAll(".placeholder-icon");
const heroHeader = document.querySelector(".hero-header");
const heroSection = document.querySelector(".hero");

// FIX: Declare the timeline variable globally to be controlled by ScrollTrigger and window.onload
let iconLoopTL; 

// Convert NodeList to Array for easier manipulation
const iconElementsArray = Array.from(iconElements);

// --- 1. INITIAL SETUP: Capture all starting positions (Moved outside window.onload) ---
// This ensures the data is ready before window.onload or ScrollTrigger fire.
const iconData = iconElementsArray.map((icon) => ({
    element: icon,
    x: icon.offsetLeft 
}));

const allOriginalXPositions = iconData.map(d => d.x);

// --- 2. UTILITY FUNCTION: Fisher-Yates Shuffle ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


window.onload = function() {
    
    // --- 3. MASTER TIMELINE SETUP ---
    // The timeline instance is assigned to the globally-scoped 'iconLoopTL'
    iconLoopTL = gsap.timeline({ 
        repeat: -1,     // Loops indefinitely
        repeatDelay: 1, // Pause 1 second before restarting the entire cycle
        defaults: {
            ease: "power2.inOut"
        }
    });

    // --- 4. ANIMATION TIMING CONSTANTS ---
    const shrinkDuration = 0.2;
    const growDuration = 0.5;
    const staggerAmount = 0.1;
    const initialDelay = 0.5;
    const swapTime = `+=${initialDelay + shrinkDuration + 0.1}`; 

    
    // --- Phase 1: SHRINK (Staggered fade out) ---
    // FIX: The issue with the invisible shrinking was that the icons were initialized 
    // with opacity: 0 and y: 40 in index.html, then faded in, and THEN this loop started.
    // By the time the loop starts, they are scaled/opacitied in. The very first action
    // of this loop will be to shrink them. It should now be visible.
    iconLoopTL.to(iconElementsArray, {
        scale: 0,
        opacity: 0,
        duration: shrinkDuration,
        ease: "power2.in",
        filter: 'blur(3px)',
        stagger: staggerAmount
    }, initialDelay); 

    
    // --- Phase 2: POSITION SWAP (Instantaneous Teleport) ---
    iconLoopTL.call(() => {
        
        const shuffledTargetPositions = shuffleArray([...allOriginalXPositions]);

        iconData.forEach((data, index) => {
            const targetX = shuffledTargetPositions[index];
            const translationX = targetX - data.x;
            
            // Apply Instant Swap
            gsap.set(data.element, { x: `+=${translationX}` });
        });
        
        // Update State
        iconData.forEach((data, index) => {
            data.x = shuffledTargetPositions[index]; 
        });

    }, null, swapTime); 

    
    // --- Phase 3: GROW (Staggered fade in from new positions) ---
    iconLoopTL.to(iconElementsArray, {
        scale: 1,
        opacity: 1,
        duration: growDuration,
        ease: "power2.out",
        filter: 'blur(0px)',
        stagger: staggerAmount
    }, ">");
};

// --- REST OF THE CODE (ScrollTrigger Setup) ---
// This part is preserved from your original logic with only the ScrollTrigger callbacks updated.

const textAnimationOrder = [];
textSegments.forEach((segment, index) => {
    textAnimationOrder.push({ segment, originalIndex: index });
});

for (let i = textAnimationOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [textAnimationOrder[i], textAnimationOrder[j]] = [
        textAnimationOrder[j],
        textAnimationOrder[i],
    ];
}

const isMobile = window.innerWidth <= 1000;
const headerIconSize = isMobile ? 30 : 60;
const currentIconSize = iconElementsArray.length > 0 ? iconElementsArray[0].getBoundingClientRect().width : 60;
const exactScale = headerIconSize / currentIconSize;

ScrollTrigger.create({
    trigger: ".hero",
    start: "top top",
    end: `+=${window.innerHeight * 0.6}px`,
    pin: true,
    pinSpacing: true,
    scrub: 1,

    // FIX 2: Pause the continuous loop when the user starts scrolling down past the hero
    onLeave: () => {
        if (iconLoopTL) {
            iconLoopTL.pause();
            // Ensure icons are fully visible for the next phase
            gsap.set(iconElementsArray, { scale: 1, opacity: 1, filter: 'blur(0px)' });
        }
    },
    // FIX 3: Resume the continuous loop AND REWIND IT when the user scrolls back up
    onEnterBack: () => {
        if (iconLoopTL) {
            // This is the CRITICAL FIX: play(0) rewinds the timeline instantly and starts playing 
            // from the beginning, ensuring all icons are in their original positions/state.
            iconLoopTL.play(0); 
            
            // Also reset the individual icon x/y translations that might have been applied 
            // by the shuffling and the scroll phase
            gsap.set(animatedIcons, { x: 0, y: 0 });
            iconElementsArray.forEach(icon => {
                gsap.set(icon, { x: 0, y: 0 });
            });
            
            // Update the icon data state back to original positions for the loop's next shuffle
            iconData.forEach((data, index) => {
                data.x = allOriginalXPositions[index]; 
            });
        }
    },

    onUpdate: (self) => {
        const progress = self.progress;

        textSegments.forEach((segment) => {
            gsap.set(segment, { opacity: 0 });
        });

        if (progress <= 0.3) {
            
            // Ensure the loop is running in this phase
            if (iconLoopTL && iconLoopTL.paused()) {
                iconLoopTL.resume();
            }

            const moveProgress = progress / 0.3;
            const containerMoveY = -window.innerHeight * 0.3 * moveProgress;

            if (progress <= 0.15) {
                const headerProgress = progress / 0.15;
                const headerMoveY = -50 * headerProgress;
                const headerOpacity = 1 - headerProgress;

                gsap.set(heroHeader, {
                    transform: `translate(-50%, calc(-50% + ${headerMoveY}px))`,
                    opacity: headerOpacity,
                });
            } else {
                gsap.set(heroHeader, {
                    transform: `translate(-50%, calc(-50% + -50px))`,
                    opacity: 0,
                });
            }

            if (window.duplicateIcons) {
                window.duplicateIcons.forEach((duplicate) => {
                    if (duplicate.parentNode) {
                        duplicate.parentNode.removeChild(duplicate);
                    }
                });
                window.duplicateIcons = null;
            }

            // Let the iconLoopTL control scale and opacity here.
            gsap.set(animatedIcons, {
                x: 0,
                y: containerMoveY,
            });

            iconElementsArray.forEach((icon, index) => {
                const staggerDelay = index * 0.1;
                const iconStart = staggerDelay;
                const iconEnd = staggerDelay + 0.5;

                const iconProgress = gsap.utils.mapRange(
                    iconStart,
                    iconEnd,
                    0,
                    1,
                    moveProgress
                );

                const clampedProgress = Math.max(0, Math.min(1, iconProgress));

                const startOffset = -containerMoveY;
                const individualY = startOffset * (1 - clampedProgress);

                gsap.set(icon, {
                    x: 0,
                    y: individualY,
                });
            });

        } else if (progress <= 0.6) {
            // Phase 2: Scale up icons to placeholder size
            if (iconLoopTL) {
                iconLoopTL.pause();
            }
            
            const scaleProgress = (progress - 0.3) / 0.3;

            gsap.set(heroHeader, {
                transform: `translate(-50%, calc(-50% + -50px))`,
                opacity: 0,
            });

            if (scaleProgress >= 0.5) {
                heroSection.style.backgroundColor = "#e3e3db";
            } else {
                heroSection.style.backgroundColor = "#141414";
            }

            if (window.duplicateIcons) {
                window.duplicateIcons.forEach((duplicate) => {
                    if (duplicate.parentNode) {
                        duplicate.parentNode.removeChild(duplicate);
                    } 
                });
                window.duplicateIcons = null;
            }

            const targetCenterY = window.innerHeight / 2;
            const targetCenterX = window.innerWidth / 2;
            const containerRect = animatedIcons.getBoundingClientRect();
            const currentCenterX = containerRect.left + containerRect.width / 2;
            const currentCenterY = containerRect.top + containerRect.height / 2;

            const deltaX = (targetCenterX - currentCenterX) * scaleProgress;
            const deltaY = (targetCenterY - currentCenterY) * scaleProgress;

            const baseY = -window.innerHeight * 0.3;
            const currentScale = 1 + (exactScale - 1) * scaleProgress;

            gsap.set(animatedIcons, {
                x: deltaX,
                y: baseY + deltaY,
                scale: currentScale,
                opacity: 1,
            });

            iconElementsArray.forEach((icon) => {
                gsap.set(icon, { x: 0, y: 0 });
            });

        } else if (progress <= 0.75) {
            // Phase 3: Move and fade icons to placeholder positions
            if (iconLoopTL) {
                iconLoopTL.pause();
            }

            const moveProgress = (progress - 0.6) / 0.15;

            gsap.set(heroHeader, {
                transform: `translate(-50%, calc(-50% + -50px))`,
                opacity: 0,
            });

            heroSection.style.backgroundColor = "#e3e3db";

            const targetCenterY = window.innerHeight / 2;
            const targetCenterX = window.innerWidth / 2;
            const containerRect = animatedIcons.getBoundingClientRect();
            const currentCenterX = containerRect.left + containerRect.width / 2;
            const currentCenterY = containerRect.top + containerRect.height / 2;
            const deltaX = targetCenterX - currentCenterX;
            const deltaY = targetCenterY - currentCenterY;

            const baseY = -window.innerHeight * 0.3;

            gsap.set(animatedIcons, {
                x: deltaX,
                y: baseY + deltaY,
                scale: exactScale,
                opacity: 0, 
            });

            iconElementsArray.forEach((icon) => {
                gsap.set(icon, { x: 0, y: 0 });
            });

            if (!window.duplicateIcons) {
                window.duplicateIcons = [];

                iconElementsArray.forEach((icon) => {
                    const duplicate = icon.cloneNode(true);
                    duplicate.className = "duplicate-icon";
                    duplicate.style.position = "absolute";
                    duplicate.style.width = headerIconSize + "px";
                    duplicate.style.height = headerIconSize + "px";

                    document.body.appendChild(duplicate);
                    window.duplicateIcons.push(duplicate);
                });
            }

            if (window.duplicateIcons) {
                window.duplicateIcons.forEach((duplicate, index) => {
                    if (index < placeholders.length) {
                        const iconRect = iconElementsArray[index].getBoundingClientRect();
                        const startCenterX = iconRect.left + iconRect.width / 2;
                        const startCenterY = iconRect.top + iconRect.height / 2;
                        const startPageX = startCenterX + window.pageXOffset;
                        const startPageY = startCenterY + window.pageYOffset;

                        const targetRect = placeholders[index].getBoundingClientRect();
                        const targetCenterX = targetRect.left + targetRect.width / 2;
                        const targetCenterY = targetRect.top + targetRect.height / 2;
                        const targetPageX = targetCenterX + window.pageXOffset;
                        const targetPageY = targetCenterY + window.pageYOffset;

                        const moveX = targetPageX - startPageX;
                        const moveY = targetPageY - startPageY;

                        let currentX = 0;
                        let currentY = 0;

                        if (moveProgress <= 0.5) {
                            const verticalProgress = moveProgress / 0.5;
                            currentY = moveY * verticalProgress;
                        } else {
                            const horizontalProgress = (moveProgress - 0.5) / 0.5;
                            currentY = moveY;
                            currentX = moveX * horizontalProgress;
                        }

                        const finalPageX = startPageX + currentX;
                        const finalPageY = startPageY + currentY;

                        duplicate.style.left = finalPageX - headerIconSize / 2 + "px";
                        duplicate.style.top = finalPageY - headerIconSize / 2 + "px";
                        duplicate.style.opacity = "1";
                        duplicate.style.display = "flex";
                    }
                });
            }
        } else {
            // Phase 4: Show text
            if (iconLoopTL) {
                iconLoopTL.pause();
            }

            gsap.set(heroHeader, {
                transform: `translate(-50%, calc(-50% + -100px))`,
                opacity: 0,
            });

            heroSection.style.backgroundColor = "#e3e3db";

            gsap.set(animatedIcons, { opacity: 0 });

            if (window.duplicateIcons) {
                window.duplicateIcons.forEach((duplicate, index) => {
                    if (index < placeholders.length) {
                        const targetRect = placeholders[index].getBoundingClientRect();
                        const targetCenterX = targetRect.left + targetRect.width / 2;
                        const targetCenterY = targetRect.top + targetRect.height / 2;
                        const targetPageX = targetCenterX + window.pageXOffset;
                        const targetPageY = targetCenterY + window.pageYOffset;

                        duplicate.style.left = targetPageX - headerIconSize / 2 + "px";
                        duplicate.style.top = targetPageY - headerIconSize / 2 + "px";
                        duplicate.style.opacity = "1";
                        duplicate.style.display = "flex";
                    }
                });
            }

            textAnimationOrder.forEach((item, randomIndex) => {
                const segmentStart = 0.75 + (randomIndex * 0.03);
                const segmentEnd = segmentStart + 0.015;

                const segmentProgress = gsap.utils.mapRange(
                    segmentStart,
                    segmentEnd,
                    0,
                    1,
                    progress
                );
                const clampedProgress = Math.max(0, Math.min(1, segmentProgress));

                gsap.set(item.segment, {
                    opacity: clampedProgress,
                });
            });
        }
    }
});