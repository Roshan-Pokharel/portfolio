// Wait for the DOM to be fully loaded before running scripts
document.addEventListener("DOMContentLoaded", () => {
  // --- NEW: Click-to-Create Trailing Dots Effect ---
  let dots = []; // Use 'let' as this array will be filtered
  const easing = 0.05;
  const maxTrailLength = 20; // Used for scaling dots
  const mousePos = { x: -100, y: -100 };

  let dustbin = null; // Element
  let dustbinRect = null; // Bounding box

  // 1. Get Dustbin (and cache its rect)
  dustbin = document.getElementById("dustbin");
  if (dustbin) {
    dustbinRect = dustbin.getBoundingClientRect();
    // Update on resize
    window.addEventListener("resize", () => {
      if (dustbin) {
        // Check if it still exists
        dustbinRect = dustbin.getBoundingClientRect();
      }
    });
  }

  // 2. Listen for mouse movement
  window.addEventListener("mousemove", (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
  });

  // 3. Listen for clicks to create dots
  document.body.addEventListener("click", (e) => {
    // Check if the click was on an interactive element
    if (
      e.target.closest(
        "a, button, [onclick], .nav-mobile-toggle, .demo-modal-close-btn, #dustbin"
      )
    ) {
      return; // Don't create a dot
    }
    createDot(e.clientX, e.clientY);
  });

  // 4. CreateDot function
  function createDot(x, y) {
    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    document.body.appendChild(dot);

    const i = dots.length; // Index this new dot will have

    // Each new dot gets smaller and fainter
    const size = Math.max(3, 10 - i * 0.5); // Min size 3px
    const opacity = Math.max(0.1, 1 - i / maxTrailLength); // Min opacity 0.1

    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.opacity = opacity;

    dots.push({
      el: dot,
      pos: { x: x, y: y }, // Start at click position
      size: size,
    });
  }

  // 5. Start the animation loop
  function animateDots() {
    let prevPos = mousePos; // The first dot (index 0) follows the mouse

    dots = dots.filter((dot, i) => {
      const currentPos = dot.pos;

      // Apply easing
      currentPos.x += (prevPos.x - currentPos.x) * easing;
      currentPos.y += (prevPos.y - currentPos.y) * easing;

      // Check for dustbin collision
      let isDestroyed = false;
      if (dustbinRect) {
        const isOverDustbin =
          currentPos.x > dustbinRect.left &&
          currentPos.x < dustbinRect.right &&
          currentPos.y > dustbinRect.top &&
          currentPos.y < dustbinRect.bottom;

        if (isOverDustbin) {
          document.body.removeChild(dot.el); // Remove from DOM
          isDestroyed = true;
        }
      }

      if (isDestroyed) {
        return false; // Filter out this dot
      }

      // --- Update visual style based on new index ---
      // This ensures dots "grow" as dots in front of them are deleted
      const newSize = Math.max(3, 10 - i * 0.5);
      const newOpacity = Math.max(0.1, 1 - i / maxTrailLength);

      if (dot.size !== newSize) {
        // Only update DOM if needed
        dot.size = newSize; // Update for transform calculation
        dot.el.style.width = `${newSize}px`;
        dot.el.style.height = `${newSize}px`;
      }
      // Opacity changes every frame for the whole trail, so just set it
      dot.el.style.opacity = newOpacity;
      // --- End style update ---

      // Apply the new position
      dot.el.style.transform = `translate3d(${currentPos.x - dot.size / 2}px, ${
        currentPos.y - dot.size / 2
      }px, 0)`;

      // The *next* dot will follow *this* dot's filtered position
      prevPos = currentPos;

      return true; // Keep this dot
    });

    requestAnimationFrame(animateDots);
  }

  // Kick off the animation
  animateDots();
  // --- END: Trailing Dots Effect ---

  // --- MODIFIED Copy to Clipboard Functionality ---
  const copyButton = document.getElementById("copy-btn");
  const feedbackDiv = document.getElementById("copy-feedback");

  // Check for the new button and feedback div
  if (copyButton && feedbackDiv) {
    const originalButtonText = copyButton.textContent; // Store original text

    copyButton.addEventListener("click", () => {
      // Get the email text from the button's data attribute
      const emailText = copyButton.getAttribute("data-email");

      if (!emailText) {
        console.error("No data-email attribute found on copy button.");
        return;
      }

      // Use a temporary textarea to copy the text
      const textarea = document.createElement("textarea");
      textarea.value = emailText;
      textarea.style.position = "absolute"; // Hide the element
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);

      textarea.select();

      try {
        // Use execCommand for broader compatibility (including iFrames)
        document.execCommand("copy");

        // Show success feedback
        feedbackDiv.style.opacity = "1";
        copyButton.textContent = "Copied!";

        // Reset after 2 seconds
        setTimeout(() => {
          feedbackDiv.style.opacity = "0";
          copyButton.textContent = originalButtonText; // Reset to original text
        }, 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
        feedbackDiv.textContent = "Failed to copy!";
        feedbackDiv.style.opacity = "1";
      }

      // Clean up the temporary element
      document.body.removeChild(textarea);
    });
  }
  // --- END MODIFIED Copy to Clipboard Functionality ---

  // --- Demo Modal Functionality ---
  const allProjectLinks = document.querySelectorAll(".project-links a");

  allProjectLinks.forEach((link) => {
    // Check if it's a "Live Demo" link
    if (link.textContent.trim().toLowerCase() === "live demo") {
      link.addEventListener("click", function (e) {
        // 1. Prevent default behavior (opening new tab/page)
        e.preventDefault();

        const demoUrl = this.getAttribute("href");
        if (!demoUrl) return; // Safety check

        // 2. Create Modal Elements
        const modalOverlay = document.createElement("div");
        modalOverlay.className = "demo-modal-overlay";

        const modalContent = document.createElement("div");
        modalContent.className = "demo-modal-content";

        const modalCloseBtn = document.createElement("button");
        modalCloseBtn.className = "demo-modal-close-btn";
        modalCloseBtn.innerHTML = "&times;"; // 'x' character
        modalCloseBtn.setAttribute("aria-label", "Close demo");

        const modalIframe = document.createElement("iframe");
        modalIframe.className = "demo-modal-iframe";
        modalIframe.src = demoUrl;
        modalIframe.title = "Project Demo";
        modalIframe.setAttribute("frameborder", "0");
        modalIframe.setAttribute("allowfullscreen", "true");

        // 3. Assemble the modal
        modalContent.appendChild(modalCloseBtn);
        modalContent.appendChild(modalIframe);
        modalOverlay.appendChild(modalContent);

        // 4. Append to body
        document.body.appendChild(modalOverlay);

        // 5. Show the modal
        modalOverlay.style.display = "flex";
        document.body.classList.add("modal-open"); // Prevent body scroll

        // 6. Add Closing Listeners
        function closeModal() {
          modalOverlay.remove();
          document.body.classList.remove("modal-open");
        }

        modalCloseBtn.addEventListener("click", closeModal);

        modalOverlay.addEventListener("click", (e) => {
          // Close only if the overlay itself (the background) is clicked
          if (e.target === modalOverlay) {
            closeModal();
          }
        });
      });
    }
  });
  // --- END Demo Modal Functionality ---

  // --- Smooth Scrolling for Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      // Check if it's just a placeholder or a link to a section
      if (href.length > 1) {
        // Prevent default anchor click behavior
        e.preventDefault();

        // Get the target element
        const targetElement = document.querySelector(href);

        if (targetElement) {
          // Scroll to the target element
          targetElement.scrollIntoView({
            behavior: "smooth",
          });
        }
      }
    });
  });

  // --- Mobile Menu Toggle ---
  const menuToggle = document.querySelector(".nav-mobile-toggle");
  const mobileMenu = document.querySelector(".nav-mobile-menu");
  const iconMenu = document.querySelector(".icon-menu");
  const iconClose = document.querySelector(".icon-close");

  if (menuToggle && mobileMenu && iconMenu && iconClose) {
    menuToggle.addEventListener("click", () => {
      // Check if menu is open or closed
      const isMenuOpen = mobileMenu.style.display === "flex";

      if (isMenuOpen) {
        mobileMenu.style.display = "none";
        iconMenu.style.display = "block";
        iconClose.style.display = "none";
      } else {
        mobileMenu.style.display = "flex";
        iconMenu.style.display = "none";
        iconClose.style.display = "block";
      }
    });

    // Close mobile menu when a link is clicked
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.style.display = "none";
        iconMenu.style.display = "block";
        iconClose.style.display = "none";
      });
    });
  }
});
