// Navigation functionality
document.addEventListener("DOMContentLoaded", function () {
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");

  // Toggle mobile menu
  mobileMenuButton.addEventListener("click", function () {
    mobileMenu.classList.toggle("hidden");

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
  mobileLinks.forEach((link) => {
    link.addEventListener("click", function () {
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

  // Navbar background change on scroll
  const navbar = document.querySelector("nav");

  window.addEventListener("scroll", function () {
    if (window.scrollY > 50) {
      navbar.classList.add("bg-white/98");
      navbar.classList.remove("bg-white/95");
    } else {
      navbar.classList.add("bg-white/95");
      navbar.classList.remove("bg-white/98");
    }
  });
});
