// Main application logic for Espacio Shanti
class EspacioShantiApp {
  constructor() {
    this.firebaseConfig = null;
    this.db = null;
    this.auth = null;
    this.currentUser = null;
    this.reservations = [];
    this.services = [
      {
        id: "reiki",
        name: "Reiki",
        description:
          "Terapia energética que promueve la relajación y el equilibrio.",
        duration: 60,
        price: 5000,
        image: "images/reiki.jpg",
      },
      {
        id: "meditacion",
        name: "Meditación Guiada",
        description: "Sesiones de meditación para encontrar paz interior.",
        duration: 45,
        price: 3500,
        image: "images/meditacion.jpg",
      },
      {
        id: "masajes",
        name: "Masajes Terapéuticos",
        description: "Masajes relajantes para liberar tensiones.",
        duration: 90,
        price: 7000,
        image: "images/masajes.jpg",
      },
      {
        id: "aromaterapia",
        name: "Aromaterapia",
        description: "Terapia con aceites esenciales para el bienestar.",
        duration: 75,
        price: 6000,
        image: "images/aromaterapia.jpg",
      },
    ];

    this.therapists = [
      {
        id: "lorena",
        name: "Lorena Murua Bosquero",
        specialties: ["Reiki", "Meditación Guiada"],
        bio: "Especialista en terapias energéticas con más de 10 años de experiencia.",
        image: "images/lorena.jpg",
        email: "lorena@espacioshanti.com",
      },
      {
        id: "betsabe",
        name: "Betsabé Murua Bosquero",
        specialties: ["Masajes Terapéuticos", "Aromaterapia"],
        bio: "Terapeuta holística especializada en técnicas de relajación y bienestar.",
        image: "images/betsabe.jpg",
        email: "betsabe@espacioshanti.com",
      },
    ];

    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadContent();
    this.setupRealtimeListener();
  }

  setupEventListeners() {
    // Reservation form
    console.log("🔧 Configurando event listeners...");
    const reservationForm = document.getElementById("reservation-form");
    if (reservationForm) {
      console.log("🎯 Event listener para reservation-form configurado");
      reservationForm.addEventListener(
        "submit",
        this.handleReservation.bind(this)
      );
    } else {
      console.warn(
        "⚠️ No se encontró elemento reservation-form al configurar listeners"
      );
    }

    // Service selection
    document.addEventListener("click", (e) => {
      if (e.target.closest(".service-card")) {
        const serviceId = e.target.closest(".service-card").dataset.serviceId;
        this.selectService(serviceId);
      }
    });

    // Therapist selection
    document.addEventListener("click", (e) => {
      if (e.target.closest(".therapist-card")) {
        const therapistId =
          e.target.closest(".therapist-card").dataset.therapistId;
        this.selectTherapist(therapistId);
      }
    });
  }

  async loadContent() {
    this.renderServices();
    this.renderTherapists();
    await this.renderReservationForm();
  }

  renderServices() {
    const servicesContainer = document.getElementById("services-container");
    if (!servicesContainer) return;

    const servicesHTML = this.services
      .map(
        (service) => `
            <div class="service-card bg-white rounded-xl shadow-md overflow-hidden card-hover" data-service-id="${
              service.id
            }">
                <div class="h-48 bg-gradient-to-br from-sage-light to-sage"></div>
                <div class="p-6">
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">${
                      service.name
                    }</h3>
                    <p class="text-gray-600 mb-4">${service.description}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-sage font-semibold">${
                          service.duration
                        } min</span>
                        <span class="text-gray-800 font-bold">$${service.price.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `
      )
      .join("");

    servicesContainer.innerHTML = servicesHTML;
  }

  renderTherapists() {
    const therapistsContainer = document.getElementById("therapists-container");
    if (!therapistsContainer) return;

    const therapistsHTML = this.therapists
      .map(
        (therapist) => `
            <div class="therapist-card bg-white rounded-xl shadow-md overflow-hidden card-hover" data-therapist-id="${
              therapist.id
            }">
                <div class="h-64 bg-gradient-to-br from-earth to-earth-dark"></div>
                <div class="p-6">
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">${
                      therapist.name
                    }</h3>
                    <p class="text-gray-600 mb-3">${therapist.bio}</p>
                    <div class="mb-4">
                        <h4 class="text-sm font-semibold text-gray-700 mb-2">Especialidades:</h4>
                        <div class="flex flex-wrap gap-2">
                            ${therapist.specialties
                              .map(
                                (specialty) =>
                                  `<span class="bg-sage-light text-sage-dark px-2 py-1 rounded-full text-xs">${specialty}</span>`
                              )
                              .join("")}
                        </div>
                    </div>
                </div>
            </div>
        `
      )
      .join("");

    therapistsContainer.innerHTML = therapistsHTML;
  }

  async renderReservationForm() {
    const formContainer = document.getElementById("reservation-form-container");
    if (!formContainer) return;

    const formHTML = `
            <form id="reservation-form" class="bg-white rounded-xl shadow-lg p-6">
                <h3 class="text-2xl font-semibold text-gray-800 mb-6">Reserva tu sesión</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
                        <input type="text" id="client-name" required class="form-input w-full px-3 py-2 border border-gray-300 rounded-md">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" id="client-email" required class="form-input w-full px-3 py-2 border border-gray-300 rounded-md">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                        <input type="tel" id="client-phone" required class="form-input w-full px-3 py-2 border border-gray-300 rounded-md">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Servicio</label>
                        <select id="selected-service" required class="form-input w-full px-3 py-2 border border-gray-300 rounded-md">
                            <option value="">Selecciona un servicio</option>
                            ${this.services
                              .map(
                                (service) =>
                                  `<option value="${service.id}">${
                                    service.name
                                  } - ${
                                    service.duration
                                  }min - $${service.price.toLocaleString()}</option>`
                              )
                              .join("")}
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                        <input type="date" id="selected-date" required class="form-input w-full px-3 py-2 border border-gray-300 rounded-md" value="${this.getTodayDateString()}" min="${this.getTodayDateString()}">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Hora</label>
                        <select id="selected-time" required class="form-input w-full px-3 py-2 border border-gray-300 rounded-md">
                            <option value="">Selecciona una hora</option>
                            <option value="09:00">09:00</option>
                            <option value="10:00">10:00</option>
                            <option value="11:00">11:00</option>
                            <option value="12:00">12:00</option>
                            <option value="13:00">13:00</option>
                            <option value="14:00">14:00</option>
                            <option value="15:00">15:00</option>
                            <option value="16:00">16:00</option>
                            <option value="17:00">17:00</option>
                            <option value="18:00">18:00</option>
                            <option value="19:00">19:00</option>
                            <option value="20:00">20:00</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Terapeuta</label>
                        <select id="selected-therapist" required class="form-input w-full px-3 py-2 border border-gray-300 rounded-md">
                            <option value="">Primero selecciona fecha y hora</option>
                        </select>
                        <div id="therapist-availability-info" class="text-xs text-gray-500 mt-1"></div>
                    </div>
                    
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Comentarios adicionales</label>
                        <textarea id="comments" rows="3" class="form-input w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Cuéntanos si tienes alguna preferencia o necesidad especial..."></textarea>
                    </div>
                </div>
                
                <div class="mt-6">
                    <button type="submit" class="w-full bg-sage text-white py-3 px-6 rounded-md hover:bg-sage-dark transition-colors duration-200 font-medium">
                        Confirmar Reserva
                    </button>
                </div>
            </form>
        `;

    formContainer.innerHTML = formHTML;

    // Configurar event listener después de crear el formulario
    console.log(
      "📝 Configurando event listener después de renderizar formulario..."
    );
    const reservationForm = document.getElementById("reservation-form");
    if (reservationForm) {
      console.log("✅ Formulario encontrado, configurando listener");

      // Remover listener anterior si existe (guardar la referencia)
      if (this.boundHandler) {
        reservationForm.removeEventListener("submit", this.boundHandler);
      }

      // Agregar nuevo listener
      this.boundHandler = this.handleReservation.bind(this);
      reservationForm.addEventListener("submit", this.boundHandler);

      // Debugger: también agregar listener de click al botón específico
      const submitButton = reservationForm.querySelector(
        'button[type="submit"]'
      );
      if (submitButton) {
        submitButton.addEventListener("click", (e) => {
          console.log("🔘 Click detectado en botón de envío");
          // El formulario debería manejarlo automáticamente
        });
      }

      // Inicializar calendario después de crear el formulario
      await this.initializeCalendar();
    } else {
      console.error(
        "❌ No se pudo encontrar el formulario después de renderizar"
      );
    }

    // Add event listeners for date and time changes to update therapist availability
    const dateInput = formContainer.querySelector("#selected-date");
    const timeInput = formContainer.querySelector("#selected-time");
    const therapistSelect = formContainer.querySelector("#selected-therapist");
    const therapistInfo = formContainer.querySelector(
      "#therapist-availability-info"
    );

    const updateTherapistAvailability = () => {
      const selectedDate = dateInput.value;
      const selectedTime = timeInput.value;

      console.log(
        `🔄 Actualizando disponibilidad para ${selectedDate} ${selectedTime}`
      );

      if (!selectedDate || !selectedTime) {
        therapistSelect.innerHTML =
          '<option value="">Primero selecciona fecha y hora</option>';
        therapistInfo.textContent = "";
        return;
      }

      // Check availability for each therapist
      const availableTherapists = [];
      const unavailableTherapists = [];

      this.therapists.forEach((therapist) => {
        const isAvailable = this.isTherapistAvailable(
          therapist.id,
          selectedDate,
          selectedTime
        );
        console.log(
          `👩‍⚕️ ${therapist.name} (${therapist.id}): ${
            isAvailable ? "DISPONIBLE" : "NO DISPONIBLE"
          }`
        );

        if (isAvailable) {
          availableTherapists.push(therapist);
        } else {
          unavailableTherapists.push(therapist);
        }
      });

      console.log(
        `✅ Disponibles: ${availableTherapists.map((t) => t.name).join(", ")}`
      );
      console.log(
        `❌ No disponibles: ${unavailableTherapists
          .map((t) => t.name)
          .join(", ")}`
      );

      // Update therapist select options
      let options = '<option value="">Selecciona un terapeuta</option>';

      // Add available therapists first
      availableTherapists.forEach((therapist) => {
        options += `<option value="${therapist.id}">${therapist.name} ✓ Disponible</option>`;
      });

      // Add unavailable therapists as disabled
      unavailableTherapists.forEach((therapist) => {
        options += `<option value="${therapist.id}" disabled style="color: #999;">${therapist.name} ✗ No disponible</option>`;
      });

      therapistSelect.innerHTML = options;

      // Update info text
      if (availableTherapists.length === 0) {
        therapistInfo.textContent =
          "No hay terapeutas disponibles para este horario";
        therapistInfo.className = "text-xs text-red-500 mt-1";
      } else if (availableTherapists.length === 1) {
        therapistInfo.textContent = `Solo ${availableTherapists[0].name} está disponible`;
        therapistInfo.className = "text-xs text-amber-600 mt-1";
      } else {
        therapistInfo.textContent = `${availableTherapists.length} terapeutas disponibles`;
        therapistInfo.className = "text-xs text-green-600 mt-1";
      }
    };

    dateInput.addEventListener("change", updateTherapistAvailability);
    timeInput.addEventListener("change", updateTherapistAvailability);

    // Clear info when therapist is selected/changed
    therapistSelect.addEventListener("change", () => {
      if (therapistSelect.value) {
        // If a therapist is selected, temporarily clear the info text
        therapistInfo.textContent = "";
      }
    });
  }

  async initializeCalendar() {
    // Set minimum date to today (allow same-day reservations)
    const today = this.getTodayDateString();
    const dateInput = document.getElementById("selected-date");
    if (dateInput) {
      dateInput.min = today;
      // Set default value to today
      dateInput.value = today;

      // Add event listener to filter times when date changes
      dateInput.addEventListener("change", async () => {
        await this.loadExistingReservations(); // Reload reservations when date changes
      });

      // Load existing reservations and filter times initially for today
      await this.loadExistingReservations();
    }
  }

  async filterAvailableTimes() {
    const dateInput = document.getElementById("selected-date");
    const timeSelect = document.getElementById("selected-time");

    if (!dateInput || !timeSelect) return;

    const selectedDate = dateInput.value;
    const today = this.getTodayDateString();
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();

    // Get all time options
    const timeOptions = timeSelect.querySelectorAll("option");

    timeOptions.forEach((option) => {
      if (option.value === "") return; // Skip the default option

      const timeValue = option.value;
      let isDisabled = false;
      let disabledReason = "";

      // Check if time has passed (for today only)
      if (selectedDate === today) {
        const [hour, minute] = timeValue.split(":").map(Number);
        const optionTime = hour * 60 + minute;
        const currentTimeInMinutes = currentHour * 60 + currentMinute;

        // Disable if the time has already passed (add 30 min buffer)
        if (optionTime <= currentTimeInMinutes + 30) {
          isDisabled = true;
          disabledReason = "(pasado)";
        }
      }

      // Check if time slot is completely booked (both therapists busy)
      if (!isDisabled && selectedDate) {
        const isCompletelyBooked = this.isTimeSlotCompletelyBooked(
          selectedDate,
          timeValue
        );
        if (isCompletelyBooked) {
          isDisabled = true;
          disabledReason = "(completo)";
        }
      }

      // Apply styling and text based on availability
      if (isDisabled) {
        option.disabled = true;
        option.style.color = "#ccc";
        option.textContent = `${timeValue} ${disabledReason}`;
      } else {
        option.disabled = false;
        option.style.color = "";
        option.textContent = timeValue;
      }
    });

    // If current selection is disabled, reset it
    if (
      timeSelect.selectedOptions[0] &&
      timeSelect.selectedOptions[0].disabled
    ) {
      timeSelect.value = "";
    }
  }

  selectService(serviceId) {
    const serviceSelect = document.getElementById("selected-service");
    if (serviceSelect) {
      serviceSelect.value = serviceId;
    }

    // Scroll to reservation form
    const formSection = document.getElementById("reservas");
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth" });
    }
  }

  selectTherapist(therapistId) {
    const therapistSelect = document.getElementById("selected-therapist");
    if (therapistSelect) {
      therapistSelect.value = therapistId;
    }

    // Scroll to reservation form
    const formSection = document.getElementById("reservas");
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth" });
    }
  }

  async handleReservation(e) {
    e.preventDefault();

    console.log("📝 Iniciando proceso de reserva...");

    const formData = {
      clientName: document.getElementById("client-name").value,
      clientEmail: document.getElementById("client-email").value,
      clientPhone: document.getElementById("client-phone").value,
      serviceId: document.getElementById("selected-service").value,
      therapistId: document.getElementById("selected-therapist").value,
      date: document.getElementById("selected-date").value,
      time: document.getElementById("selected-time").value,
      comments: document.getElementById("comments").value,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    console.log("📋 Datos del formulario:", formData);

    // Validar que todos los campos requeridos estén llenos
    if (
      !formData.clientName ||
      !formData.clientEmail ||
      !formData.clientPhone ||
      !formData.serviceId ||
      !formData.therapistId ||
      !formData.date ||
      !formData.time
    ) {
      console.error("❌ Faltan campos requeridos");
      this.showNotification(
        "Por favor completa todos los campos requeridos",
        "error"
      );
      return;
    }

    console.log("🔄 Verificando Firebase disponibilidad...");
    console.log("Firebase Manager disponible:", !!window.firebaseManager);
    console.log("Firebase inicializado:", window.firebaseManager?.initialized);

    try {
      // Show loading
      this.showNotification("Procesando reserva...", "info");

      console.log("🔄 Llamando a saveReservation...");
      // Here we'll integrate with Firebase
      const reservationId = await this.saveReservation(formData);
      console.log("✅ Reserva guardada con ID:", reservationId);

      // Show success message
      this.showNotification(
        "¡Reserva confirmada! Te contactaremos pronto.",
        "success"
      );

      // Reset form
      const form = document.getElementById("reservation-form");
      form.reset();

      // Clear therapist availability info
      const therapistInfo = document.querySelector(
        "#therapist-availability-info"
      );
      if (therapistInfo) {
        therapistInfo.textContent = "";
      }

      // Reset therapist select to default state
      const therapistSelect = document.getElementById("selected-therapist");
      if (therapistSelect) {
        therapistSelect.innerHTML =
          '<option value="">Primero selecciona fecha y hora</option>';
      }

      // Set date back to today
      const dateInput = document.getElementById("selected-date");
      if (dateInput) {
        dateInput.value = this.getTodayDateString();
      }
    } catch (error) {
      console.error("Error saving reservation:", error);
      this.showNotification(
        "Error al procesar la reserva. Inténtalo de nuevo.",
        "error"
      );
    }
  }

  async saveReservation(reservationData) {
    console.log(
      "💾 Función saveReservation iniciada con datos:",
      reservationData
    );

    try {
      // Check if Firebase is available
      console.log("🔍 Verificando Firebase...");
      console.log(
        "  - window.firebaseManager existe:",
        !!window.firebaseManager
      );
      console.log(
        "  - firebaseManager.initialized:",
        window.firebaseManager?.initialized
      );

      if (window.firebaseManager && window.firebaseManager.initialized) {
        console.log("🔥 Firebase disponible, guardando en Firestore...");

        const completeReservationData = {
          ...reservationData,
          serviceName:
            this.services.find((s) => s.id === reservationData.serviceId)
              ?.name || "",
          therapistName:
            this.therapists.find((t) => t.id === reservationData.therapistId)
              ?.name || "",
          duration:
            this.services.find((s) => s.id === reservationData.serviceId)
              ?.duration || 60,
          price:
            this.services.find((s) => s.id === reservationData.serviceId)
              ?.price || 0,
        };

        console.log(
          "📦 Datos completos para Firebase:",
          completeReservationData
        );

        // Save to Firebase
        const reservationId = await window.firebaseManager.saveReservation(
          completeReservationData
        );

        console.log("✅ Reserva guardada en Firebase con ID:", reservationId);

        // Enviar notificación de WhatsApp al terapeuta
        try {
          if (window.callMeBotService) {
            console.log("📱 Enviando notificación de WhatsApp...");
            const notificationSent =
              await window.callMeBotService.sendNotification(
                completeReservationData
              );
            if (notificationSent) {
              console.log("✅ Notificación de WhatsApp enviada al terapeuta");
            } else {
              console.log("⚠️ No se pudo enviar la notificación de WhatsApp");
            }
          }
        } catch (error) {
          console.error("❌ Error enviando notificación WhatsApp:", error);
          // No interrumpir el proceso de reserva por un error de notificación
        }

        return reservationId;
      } else {
        // Fallback: simulate saving locally
        console.log(
          "⚠️ Firebase no disponible, simulando guardado:",
          reservationData
        );
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve("local-" + Date.now());
          }, 1000);
        });
      }
    } catch (error) {
      console.error("❌ Error guardando reserva:", error);
      throw error;
    }
  }

  // Load existing reservations to check availability
  async loadExistingReservations() {
    try {
      // Wait for Firebase to be ready
      let retries = 0;
      while (
        (!window.firebaseManager || !window.firebaseManager.initialized) &&
        retries < 10
      ) {
        console.log(`⏳ Esperando Firebase... intento ${retries + 1}`);
        await new Promise((resolve) => setTimeout(resolve, 500));
        retries++;
      }

      if (!window.firebaseManager || !window.firebaseManager.initialized) {
        console.log("⚠️ Firebase no disponible después de esperar");
        return;
      }

      console.log(
        "📋 Cargando reservas existentes para verificar disponibilidad..."
      );

      // Get current date range (today + next 30 days)
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 30);

      const startDateStr = this.getTodayDateString();
      const endDateStr = this.getLocalDateString(futureDate);

      // Get all reservations in date range (for all therapists)
      const allReservations =
        await window.firebaseManager.getReservationsInDateRange(
          startDateStr,
          endDateStr
        );

      this.reservations = allReservations || [];
      console.log(
        `📅 Cargadas ${this.reservations.length} reservas existentes`
      );

      // Update available times after loading reservations
      this.filterAvailableTimes();

      // Set up real-time listener for future changes
      this.setupRealtimeListener();
    } catch (error) {
      console.error("Error cargando reservas existentes:", error);
      this.reservations = [];
    }
  }

  // Set up real-time listener for reservation changes
  setupRealtimeListener() {
    if (!window.firebaseManager || !window.firebaseManager.initialized) {
      console.log("⚠️ Firebase no disponible para listener en tiempo real");
      return;
    }

    // Don't set up multiple listeners
    if (this.unsubscribeReservations) {
      console.log("🔄 Listener ya existe, no se duplicará");
      return;
    }

    console.log(
      "🔄 Configurando listener en tiempo real para cambios de reservas..."
    );

    try {
      // Listen for changes in all reservations
      const reservationsRef = window.firebaseManager.firestore.collection(
        window.firebaseManager.db,
        "reservations"
      );

      // Flag to skip initial load
      let initialLoad = true;

      // Set up real-time listener
      this.unsubscribeReservations =
        window.firebaseManager.firestore.onSnapshot(
          reservationsRef,
          (snapshot) => {
            if (initialLoad) {
              console.log("� Listener iniciado - ignorando carga inicial");
              initialLoad = false;
              return;
            }

            console.log("�🔔 Cambios detectados en reservas");

            let hasChanges = false;
            snapshot.docChanges().forEach((change) => {
              hasChanges = true;
              if (change.type === "added") {
                console.log("➕ Nueva reserva agregada:", change.doc.data());
              }
              if (change.type === "modified") {
                console.log("📝 Reserva modificada:", change.doc.data());
              }
              if (change.type === "removed") {
                console.log("🗑️ Reserva eliminada:", change.doc.data());
              }
            });

            // Only reload if there were actual changes
            if (hasChanges) {
              console.log("🔄 Actualizando disponibilidad de horarios...");
              this.reloadReservationsForAvailability();
            }
          },
          (error) => {
            console.error("❌ Error en listener de reservas:", error);
          }
        );

      console.log("✅ Listener en tiempo real configurado");
    } catch (error) {
      console.error("❌ Error configurando listener:", error);
    }
  }

  // Reload reservations for availability check only (without setting up listener again)
  async reloadReservationsForAvailability() {
    try {
      console.log("🔄 Recargando reservas para actualizar disponibilidad...");

      // Get current date range (today + next 30 days)
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 30);

      const startDateStr = this.getTodayDateString();
      const endDateStr = this.getLocalDateString(futureDate);

      // Get all reservations in date range (for all therapists)
      const allReservations =
        await window.firebaseManager.getReservationsInDateRange(
          startDateStr,
          endDateStr
        );

      this.reservations = allReservations || [];
      console.log(
        `🔄 Reservas actualizadas: ${this.reservations.length} total`
      );

      // Update available times
      this.filterAvailableTimes();

      // If form is visible, update therapist availability
      const formContainer = document.getElementById(
        "reservation-form-container"
      );
      if (formContainer) {
        // Update therapist availability if date and time are selected
        const dateInput = formContainer.querySelector("#selected-date");
        const timeInput = formContainer.querySelector("#selected-time");
        const therapistSelect = formContainer.querySelector(
          "#selected-therapist"
        );

        if (dateInput && timeInput && dateInput.value && timeInput.value) {
          // Trigger therapist availability update
          const event = new Event("change");
          dateInput.dispatchEvent(event);
        } else {
          // If no date/time selected, reset therapist dropdown and info
          if (therapistSelect) {
            therapistSelect.innerHTML =
              '<option value="">Primero selecciona fecha y hora</option>';
          }
          const therapistInfo = formContainer.querySelector(
            "#therapist-availability-info"
          );
          if (therapistInfo) {
            therapistInfo.textContent = "";
          }
        }
      }
    } catch (error) {
      console.error("Error recargando reservas:", error);
    }
  }

  // Clean up listener when needed
  cleanupListeners() {
    if (this.unsubscribeReservations) {
      this.unsubscribeReservations();
      console.log("🧹 Listener de reservas desconectado");
    }
  }

  // Simple function to check if ALL therapists are busy at a specific time
  isTimeSlotCompletelyBooked(dateString, time) {
    // Both therapist IDs
    const allTherapists = ["lorena", "betsabe"];

    // Check if BOTH therapists have reservations at this time
    const busyTherapists = allTherapists.filter((therapistId) => {
      return this.reservations.some(
        (reservation) =>
          reservation.date === dateString &&
          reservation.time === time &&
          reservation.therapistId === therapistId
      );
    });

    console.log(
      `🔍 Horario completo para ${dateString} ${time}:`,
      busyTherapists.length === allTherapists.length
    );
    console.log(`👥 Terapeutas ocupadas:`, busyTherapists);

    // If both therapists are busy, the time slot is completely booked
    return busyTherapists.length === allTherapists.length;
  }
  isTherapistAvailable(therapistId, date, time) {
    const timeSlot = `${date} ${time}`;

    // Check if the specific therapist has this time slot booked
    const therapistHasBooking = this.reservations.some((reservation) => {
      const reservationTimeSlot = `${reservation.date} ${reservation.time}`;
      return (
        reservationTimeSlot === timeSlot &&
        reservation.therapistId === therapistId
      );
    });

    console.log(
      `🔍 Verificando disponibilidad para ${therapistId} en ${date} ${time}:`,
      !therapistHasBooking
    );
    console.log(
      `📋 Reservas encontradas:`,
      this.reservations.filter((r) => r.date === date && r.time === time)
    );

    return !therapistHasBooking;
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification fixed top-20 right-4 z-50 p-4 rounded-md shadow-lg max-w-sm ${
      type === "success"
        ? "bg-green-500 text-white"
        : type === "error"
        ? "bg-red-500 text-white"
        : "bg-blue-500 text-white"
    }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  getTodayDateString() {
    // Get today's date in local timezone (avoid UTC issues)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  getLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

// Clean up listeners when page unloads
window.addEventListener("beforeunload", function () {
  if (window.espacioShantiApp && window.espacioShantiApp.cleanupListeners) {
    window.espacioShantiApp.cleanupListeners();
  }
});

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  window.espacioShantiApp = new EspacioShantiApp();
});
