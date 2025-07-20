// Navigation functionality
document.addEventListener("DOMContentLoaded", function () {
  console.log("Navigation script loaded");

  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");
  const navbar = document.querySelector("nav");

  console.log("Navigation elements found:", {
    button: !!mobileMenuButton,
    menu: !!mobileMenu,
    navbar: !!navbar,
  });

  // Toggle mobile menu
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Mobile menu button clicked");

      mobileMenu.classList.toggle("hidden");
      console.log(
        "Menu is now hidden:",
        mobileMenu.classList.contains("hidden")
      );

      // Change icon
      const icon = mobileMenuButton.querySelector("i");
      if (mobileMenu.classList.contains("hidden")) {
        icon.className = "fas fa-bars text-xl";
      } else {
        icon.className = "fas fa-times text-xl";
      }
    });

    // Close mobile menu when clicking on a link
    const mobileLinks = mobileMenu.querySelectorAll("a");
    console.log("Found mobile links:", mobileLinks.length);

    mobileLinks.forEach((link) => {
      link.addEventListener("click", function () {
        console.log("Mobile link clicked");
        mobileMenu.classList.add("hidden");
        const icon = mobileMenuButton.querySelector("i");
        icon.className = "fas fa-bars text-xl";
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener("click", function (event) {
      if (
        !mobileMenu.contains(event.target) &&
        !mobileMenuButton.contains(event.target)
      ) {
        mobileMenu.classList.add("hidden");
        const icon = mobileMenuButton.querySelector("i");
        icon.className = "fas fa-bars text-xl";
      }
    });
  } else {
    console.error("Mobile menu elements not found!");
  }

  // Smooth scrolling for anchor links
  const allLinks = document.querySelectorAll('a[href^="#"]');
  allLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        const offsetTop = targetSection.offsetTop - 70; // Account for fixed header

        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    });
  });

  // Enhanced navbar background change on scroll
  let lastScrollTop = 0;

  window.addEventListener("scroll", function () {
    const currentScroll =
      window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > 50) {
      // Add blur effect when scrolling down
      navbar.classList.add("bg-white/95", "backdrop-blur-md", "shadow-elegant");
      navbar.classList.remove("bg-white/90");
    } else {
      // Remove blur effect when at top
      navbar.classList.add("bg-white/90");
      navbar.classList.remove(
        "bg-white/95",
        "backdrop-blur-md",
        "shadow-elegant"
      );
    }

    // Hide/show nav on scroll (optional)
    if (currentScroll > lastScrollTop && currentScroll > 100) {
      // Scrolling down
      navbar.style.transform = "translateY(-100%)";
    } else {
      // Scrolling up
      navbar.style.transform = "translateY(0)";
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  });
});
