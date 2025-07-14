// Contact form handler
class ContactForm {
  constructor() {
    this.init();
  }

  init() {
    const form = document.querySelector("#contact-form");
    if (form) {
      form.addEventListener("submit", this.handleSubmit.bind(this));
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      // Send to your backend or service like EmailJS
      await this.sendEmail(data);
      this.showSuccess();
    } catch (error) {
      this.showError();
    }
  }

  async sendEmail(data) {
    // Integration with EmailJS or your backend
    return fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  showSuccess() {
    // Show success notification
  }

  showError() {
    // Show error notification
  }
}

new ContactForm();
