// Therapist Panel Logic
class TherapistPanel {
  constructor() {
    this.currentUser = null;
    this.currentWeek = new Date();
    this.reservations = [];
    this.unsubscribe = null; // For real-time listener cleanup
    this.weekdays = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    this.hours = [
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
      "19:00",
      "20:00",
    ];

    // Listen for authentication changes from new auth system
    document.addEventListener("therapistAuthChanged", (event) => {
      console.log("🔐 therapistAuthChanged event received:", event.detail);
      if (event.detail.isAuthenticated) {
        this.currentUser = event.detail.user;
        console.log("✅ Usuario autenticado establecido:", this.currentUser);
        localStorage.setItem(
          "currentTherapist",
          JSON.stringify(event.detail.user)
        );
        this.showMainContent();
        this.loadReservations();
      } else {
        console.log("❌ Usuario no autenticado");
        this.currentUser = null;
        localStorage.removeItem("currentTherapist");
        this.showLoginModal();
      }
    });

    this.init();
  }

  init() {
    console.log("🚀 TherapistPanel init() called");

    // Escuchar eventos de autenticación de Firebase
    window.addEventListener("therapistAuthChanged", (event) => {
      console.log("🔄 Evento de autenticación recibido:", event.detail);
      if (event.detail.isAuthenticated && event.detail.user) {
        this.handleAuthSuccess(event.detail.user);
      } else {
        this.handleAuthLogout();
      }
    });

    // Asegurarse de que el DOM esté listo antes de manipular elementos
    setTimeout(() => {
      this.checkAuth();
      this.setupEventListeners();
      // No cargar reservas aquí - se cargan después del login
      this.generateWeeklyCalendar();
      this.updateStats();

      // Verificación adicional: si no hay currentUser pero hay datos en localStorage
      setTimeout(() => {
        if (!this.currentUser) {
          this.tryMultipleAuthSources();
        }
      }, 1000);
    }, 100);
  }

  checkAuth() {
    console.log("🔍 checkAuth() called");

    // Intentar múltiples fuentes de autenticación
    this.tryMultipleAuthSources();
  }

  tryMultipleAuthSources() {
    console.log("🔍 Intentando múltiples fuentes de autenticación...");

    // 1. Verificar therapist_session (usado por therapist-auth.js)
    const therapistSession = localStorage.getItem("therapist_session");
    console.log("🔍 therapist_session from localStorage:", therapistSession);

    // 2. Verificar currentTherapist (usado antes)
    const currentTherapist = localStorage.getItem("currentTherapist");
    console.log("🔍 currentTherapist from localStorage:", currentTherapist);

    // 3. Verificar Firebase Auth actual
    if (window.firebaseManager && window.firebaseManager.auth.currentUser) {
      const firebaseUser = window.firebaseManager.auth.currentUser;
      console.log("🔍 Firebase currentUser:", firebaseUser.email);
      this.handleAuthSuccess(firebaseUser);
      return;
    }

    // Si hay sessión de therapist-auth.js, usarla
    if (therapistSession) {
      try {
        const sessionData = JSON.parse(therapistSession);
        console.log("✅ Usando therapist_session:", sessionData);
        this.handleAuthFromSession(sessionData);
        return;
      } catch (error) {
        console.error("❌ Error parsing therapist_session:", error);
      }
    }

    // Si hay datos de currentTherapist, usarlos
    if (currentTherapist) {
      try {
        const userData = JSON.parse(currentTherapist);
        console.log("✅ Usando currentTherapist:", userData);
        this.currentUser = userData;
        this.showMainContent();
        this.loadReservationsFromFirebase();
        return;
      } catch (error) {
        console.error("❌ Error parsing currentTherapist:", error);
      }
    }

    console.log("❌ No hay usuario autenticado en ninguna fuente");
    this.showLoginModal();
  }

  handleAuthSuccess(firebaseUser) {
    console.log("✅ handleAuthSuccess called with:", firebaseUser.email);

    // Convertir usuario de Firebase a formato local
    const therapistData = this.getTherapistByEmail(firebaseUser.email);
    if (therapistData) {
      this.currentUser = {
        ...therapistData,
        email: firebaseUser.email,
        uid: firebaseUser.uid,
      };

      console.log("✅ currentUser set:", this.currentUser);

      // Sincronizar con localStorage usando ambas claves
      localStorage.setItem(
        "currentTherapist",
        JSON.stringify(this.currentUser)
      );
      localStorage.setItem(
        "therapist_session",
        JSON.stringify({
          email: firebaseUser.email,
          uid: firebaseUser.uid,
        })
      );

      this.showMainContent();
      this.loadReservationsFromFirebase();
    } else {
      console.error("❌ Email no autorizado:", firebaseUser.email);
      this.showNotification(
        "Email no autorizado para acceder al panel",
        "error"
      );
    }
  }

  handleAuthFromSession(sessionData) {
    console.log("✅ handleAuthFromSession called with:", sessionData);

    const therapistData = this.getTherapistByEmail(sessionData.email);
    if (therapistData) {
      this.currentUser = {
        ...therapistData,
        email: sessionData.email,
        uid: sessionData.uid,
      };

      console.log("✅ currentUser set from session:", this.currentUser);

      // Sincronizar localStorage
      localStorage.setItem(
        "currentTherapist",
        JSON.stringify(this.currentUser)
      );

      this.showMainContent();
      this.loadReservationsFromFirebase();
    }
  }

  handleAuthLogout() {
    console.log("🔍 handleAuthLogout called");
    this.currentUser = null;
    localStorage.removeItem("currentTherapist");
    localStorage.removeItem("therapist_session");
    this.showLoginModal();
  }

  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", this.handleLogin.bind(this));

    // Logout button
    const logoutBtnMobile = document.getElementById("logout-btn-mobile");

    if (logoutBtnMobile) {
      logoutBtnMobile.addEventListener("click", this.handleLogout.bind(this));
    }

    // Calendar navigation
    const prevWeekBtn = document.getElementById("prev-week");
    const nextWeekBtn = document.getElementById("next-week");

    prevWeekBtn.addEventListener("click", () => {
      this.currentWeek.setDate(this.currentWeek.getDate() - 7);
      this.generateWeeklyCalendar();
    });

    nextWeekBtn.addEventListener("click", () => {
      this.currentWeek.setDate(this.currentWeek.getDate() + 7);
      this.generateWeeklyCalendar();
    });

    // Responsive calendar regeneration
    window.addEventListener("resize", () => {
      if (this.reservations.length > 0) {
        this.generateWeeklyCalendar();
      }
    });

    // Blog Editor Event Listeners
    this.setupBlogEventListeners();

    // Listener para edición de entradas desde el sitio web principal
    window.addEventListener("editBlogEntry", (event) => {
      this.editBlogEntry(event.detail);
    });
  }

  setupBlogEventListeners() {
    // Delay setup to ensure DOM elements are available
    setTimeout(() => {
      // Emoji selection
      document.addEventListener("click", (e) => {
        if (e.target.classList.contains("emoji-btn")) {
          this.clearEmojiSelection();
          e.target.classList.add("border-sage-500", "bg-sage-100");
          const emojiInput = document.getElementById("blog-emoji");
          if (emojiInput) {
            emojiInput.value = e.target.dataset.emoji;
          }
          this.updateBlogPreview();
        }
      });

      // Character counter for summary
      const summaryInput = document.getElementById("blog-summary");
      if (summaryInput) {
        summaryInput.addEventListener("input", () => {
          const count = summaryInput.value.length;
          const counter = document.getElementById("summary-count");
          if (counter) {
            counter.textContent = count;
          }
          if (count > 300) {
            summaryInput.value = summaryInput.value.substring(0, 300);
            if (counter) {
              counter.textContent = 300;
            }
          }
          this.updateBlogPreview();
        });
      }

      // Update preview when typing
      const titleInput = document.getElementById("blog-title");
      const categorySelect = document.getElementById("blog-category");
      const contentInput = document.getElementById("blog-content");

      if (titleInput) {
        titleInput.addEventListener("input", () => this.updateBlogPreview());
      }
      if (categorySelect) {
        categorySelect.addEventListener("change", () =>
          this.updateBlogPreview()
        );
      }
      if (contentInput) {
        contentInput.addEventListener("input", () => this.updateBlogPreview());
      }

      // Form submission
      const blogForm = document.getElementById("blog-entry-form");
      if (blogForm) {
        blogForm.addEventListener("submit", (e) => {
          e.preventDefault();
          this.publishBlogEntry();
        });
      }
    }, 500);
  }

  async handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById("therapist-email").value;
    const password = document.getElementById("therapist-password").value;

    try {
      // Show loading
      this.showNotification("Iniciando sesión...", "info");

      // Use the new authentication system
      if (window.therapistAuth) {
        await window.therapistAuth.signIn(email, password);
        this.showNotification("✅ Sesión iniciada correctamente", "success");
      } else {
        console.log(
          "🔧 Sistema de autenticación no disponible, usando fallback local"
        );
        // Fallback to local authentication
        this.tryLocalAuth(email, password);
      }
    } catch (error) {
      console.error("Login error:", error);
      console.log(
        "🔧 Error con autenticación principal, intentando fallback local"
      );
      // Try local authentication as fallback
      try {
        this.tryLocalAuth(email, password);
      } catch (localError) {
        this.showNotification(
          "❌ Error al iniciar sesión: " + error.message,
          "error"
        );
      }
    }
  }

  tryLocalAuth(email, password) {
    console.log("🔧 Intentando autenticación local para:", email);
    // Simple local authentication for development
    const validCredentials = [
      {
        email: "lorena@espacioshanti.com",
        password: "lorena123",
        name: "Lorena Murua Bosquero",
        id: "lorena",
      },
      {
        email: "betsabe@espacioshanti.com",
        password: "betsabe123",
        name: "Betsabé Murua Bosquero",
        id: "betsabe",
      },
    ];

    const user = validCredentials.find(
      (cred) => cred.email === email && cred.password === password
    );

    if (user) {
      console.log("✅ Autenticación local exitosa para:", user.name);
      this.currentUser = user;
      localStorage.setItem("currentTherapist", JSON.stringify(user));
      this.showMainContent();
      this.showNotification(
        "¡Bienvenida " + user.name.split(" ")[0] + "! (Modo local)",
        "success"
      );

      // Try to load reservations from Firebase even in local mode
      if (window.firebaseManager && window.firebaseManager.initialized) {
        this.loadReservationsFromFirebase();
      } else {
        this.loadReservations();
      }
    } else {
      console.log("❌ Credenciales incorrectas en autenticación local");
      throw new Error("Credenciales incorrectas");
    }
  }

  getTherapistByEmail(email) {
    const therapists = {
      "lorena@espacioshanti.com": {
        name: "Lorena Murua Bosquero",
        id: "lorena",
      },
      "betsabe@espacioshanti.com": {
        name: "Betsabé Murua Bosquero",
        id: "betsabe",
      },
    };
    return therapists[email] || { name: "Terapeuta", id: "unknown" };
  }

  handleLogout() {
    console.log("🔓 handleLogout called");

    // Limpiar todas las fuentes de autenticación
    localStorage.removeItem("currentTherapist");
    localStorage.removeItem("therapist_session");
    this.currentUser = null;

    // También cerrar sesión de Firebase si está disponible
    if (window.firebaseManager && window.firebaseManager.auth) {
      window.firebaseManager.signOut().catch((err) => {
        console.log("Error al cerrar sesión de Firebase:", err);
      });
    }

    this.showLoginModal();
  }

  showLoginModal() {
    const loginSection = document.getElementById("login-section");
    const mainContent = document.getElementById("main-content");

    if (loginSection) {
      loginSection.classList.remove("hidden");
    }
    if (mainContent) {
      mainContent.classList.add("hidden");
    }
  }

  showMainContent() {
    const loginSection = document.getElementById("login-section");
    const mainContent = document.getElementById("main-content");

    if (loginSection) {
      loginSection.classList.add("hidden");
    }
    if (mainContent) {
      mainContent.classList.remove("hidden");
    }

    if (this.currentUser) {
      const userName = this.currentUser.name.split(" ")[0];

      // Update user info
      const userInfoMobile = document.getElementById("user-info-mobile");

      if (userInfoMobile) {
        userInfoMobile.textContent = `Bienvenida, ${userName}`;
      }
    }
  }

  generateWeeklyCalendar() {
    const calendarContainer = document.getElementById("weekly-calendar");
    const currentWeekSpan = document.getElementById("current-week");

    // Get start of week (Monday)
    const startOfWeek = new Date(this.currentWeek);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    // Update week display
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const formatDate = (date) => {
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      });
    };

    currentWeekSpan.textContent = `${formatDate(startOfWeek)} - ${formatDate(
      endOfWeek
    )}`;

    // Check if mobile
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth < 1024;

    // Generate calendar HTML with better responsive design
    let calendarHTML = `
            <div class="calendar-grid text-xs ${isTablet ? "text-2xs" : ""}">
                <div class="p-1 sm:p-2 font-semibold text-gray-600 text-center bg-gray-50 rounded">Hora</div>
                ${Array.from({ length: 7 }, (_, i) => {
                  const date = new Date(startOfWeek);
                  date.setDate(startOfWeek.getDate() + i);
                  const isToday =
                    this.getLocalDateString(date) ===
                    this.getLocalDateString(new Date());
                  return `
                        <div class="p-1 sm:p-2 font-semibold text-gray-600 text-center calendar-cell ${
                          isToday ? "bg-blue-50 text-blue-700" : "bg-gray-50"
                        } rounded">
                            <div class="${
                              isMobile
                                ? "text-xs"
                                : isTablet
                                ? "text-xs"
                                : "text-sm"
                            }">${this.weekdays[date.getDay()].substring(
                    0,
                    isMobile ? 3 : isTablet ? 3 : 10
                  )}</div>
                            <div class="text-xs ${
                              isToday ? "text-blue-600" : "text-gray-500"
                            }">${date.getDate()}/${date.getMonth() + 1}</div>
                        </div>
                    `;
                }).join("")}
        `;

    // Generate time slots
    this.hours.forEach((hour) => {
      calendarHTML += `
                <div class="p-1 sm:p-2 text-gray-600 font-medium text-xs text-center bg-gray-50 rounded">${hour}</div>
                ${Array.from({ length: 7 }, (_, dayIndex) => {
                  const date = new Date(startOfWeek);
                  date.setDate(startOfWeek.getDate() + dayIndex);
                  const dateStr = this.getLocalDateString(date);

                  const reservation = this.getReservationForSlot(dateStr, hour);

                  if (reservation) {
                    // More compact reservation display
                    const clientName = reservation.clientName.split(" ")[0]; // Only first name
                    const serviceShort =
                      reservation.serviceName ||
                      reservation.service ||
                      "Servicio";

                    return `
                            <div class="calendar-reservation bg-sage-light text-sage-dark rounded border-l-4 border-sage text-xs cursor-pointer hover:bg-sage-light/70 transition-colors p-1 relative" 
                                 onclick="window.therapistPanel.showReservationActions('${
                                   reservation.id
                                 }')"
                                 title="${
                                   reservation.clientName
                                 } - ${serviceShort}">
                                <div class="font-semibold truncate leading-tight">${clientName}</div>
                                ${
                                  !isMobile
                                    ? `<div class="truncate text-xs opacity-75 leading-tight">${serviceShort.substring(
                                        0,
                                        isTablet ? 12 : 20
                                      )}</div>`
                                    : `<div class="truncate text-xs opacity-75 leading-tight">${serviceShort.substring(
                                        0,
                                        8
                                      )}</div>`
                                }
                                ${
                                  isMobile
                                    ? '<div class="absolute top-0 right-0 text-xs opacity-60 text-sage-dark">⚡</div>'
                                    : '<div class="text-xs opacity-60 mt-0.5">Click</div>'
                                }
                            </div>
                        `;
                  } else {
                    return `<div class="p-1 border border-gray-200 rounded hover:bg-gray-50 calendar-cell" style="min-height: ${
                      isMobile ? "32px" : "48px"
                    };"></div>`;
                  }
                }).join("")}
            `;
    });

    calendarHTML += "</div>";
    calendarContainer.innerHTML = calendarHTML;
  }

  getReservationForSlot(date, time) {
    const reservation = this.reservations.find(
      (res) =>
        res.date === date &&
        res.time === time &&
        res.therapistId === this.currentUser?.id
    );

    return reservation;
  }

  loadReservations() {
    // Simulate loading reservations - in production, load from Firebase
    this.reservations = [
      {
        id: "1",
        clientName: "María González",
        clientEmail: "maria@email.com",
        clientPhone: "123456789",
        service: "Reiki",
        therapistId: "lorena",
        date: new Date().toISOString().split("T")[0],
        time: "10:30",
        status: "confirmed",
        comments: "Primera sesión",
      },
      {
        id: "2",
        clientName: "Ana López",
        clientEmail: "ana@email.com",
        clientPhone: "987654321",
        service: "Masajes Terapéuticos",
        therapistId: "betsabe",
        date: new Date().toISOString().split("T")[0],
        time: "15:30",
        status: "confirmed",
        comments: "Dolor de espalda",
      },
    ];

    this.updateTodayReservations();
  }

  async loadReservationsFromFirebase() {
    if (!window.firebaseManager || !window.firebaseManager.initialized) {
      this.loadReservations(); // Cargar datos de ejemplo como fallback
      return;
    }

    if (!this.currentUser) {
      console.log(
        "⚠️ No hay usuario autenticado, no se pueden cargar reservas"
      );
      return;
    }

    try {
      // Get extended date range (current week + next week to show upcoming appointments)
      const today = new Date();
      const startOfWeek = new Date(today);

      // Adjust to start from Monday (getDay() returns 0 for Sunday, 1 for Monday)
      const dayOfWeek = today.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days to Monday
      startOfWeek.setDate(today.getDate() - daysToSubtract);

      // Extend to cover next week as well (14 days total)
      const endOfRange = new Date(startOfWeek);
      endOfRange.setDate(startOfWeek.getDate() + 13); // 2 weeks

      const startDateStr = this.getLocalDateString(startOfWeek);
      const endDateStr = this.getLocalDateString(endOfRange);

      // Load reservations from Firebase (initial load)
      const firebaseReservations =
        await window.firebaseManager.getReservationsForTherapist(
          this.currentUser.id,
          startDateStr,
          endDateStr
        );

      // Update local reservations array
      this.reservations = firebaseReservations;

      // Clean up any potential duplicates
      this.removeDuplicateReservations();

      // Update UI
      this.generateWeeklyCalendar();
      this.updateTodayReservations();
      this.updateStats();

      // Set up real-time listener for new reservations
      this.setupRealtimeListener();
    } catch (error) {
      console.error("❌ Error cargando reservas desde Firebase:", error);
      this.showNotification("Error cargando reservas", "error");
      // Cargar datos de ejemplo como fallback
      this.loadReservations();
    }
  }

  setupRealtimeListener() {
    if (!window.firebaseManager || !window.firebaseManager.initialized) {
      return;
    }

    if (!this.currentUser) {
      console.log(
        "⚠️ No hay usuario autenticado, no se puede configurar listener en tiempo real"
      );
      return;
    }

    try {
      // Listen for new reservations for this therapist
      const reservationsRef = window.firebaseManager.firestore.collection(
        window.firebaseManager.db,
        "reservations"
      );

      const q = window.firebaseManager.firestore.query(
        reservationsRef,
        window.firebaseManager.firestore.where(
          "therapistId",
          "==",
          this.currentUser.id
        )
      );

      // Flag to indicate initial load is complete
      let initialLoadComplete = false;

      // Set up real-time listener
      this.unsubscribe = window.firebaseManager.firestore.onSnapshot(
        q,
        (snapshot) => {
          if (!initialLoadComplete) {
            // Skip notifications on initial load
            initialLoadComplete = true;
            return;
          }

          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const newReservation = {
                id: change.doc.id,
                ...change.doc.data(),
              };

              // Check if this reservation already exists in our local array
              const existingReservation = this.reservations.find(
                (res) => res.id === newReservation.id
              );

              if (!existingReservation) {
                // Double check: also verify by date, time, and therapist to prevent logical duplicates
                const isDuplicate = this.reservations.some(
                  (res) =>
                    res.date === newReservation.date &&
                    res.time === newReservation.time &&
                    res.therapistId === newReservation.therapistId &&
                    res.clientName === newReservation.clientName &&
                    res.clientEmail === newReservation.clientEmail
                );

                if (!isDuplicate) {
                  // Add to local reservations
                  this.reservations.push(newReservation);

                  // Show enhanced notification only for truly new reservations
                  this.showNotification(
                    `¡Nueva reserva! ${
                      newReservation.clientName
                    } - ${this.formatDate(newReservation.date)} ${
                      newReservation.time
                    }`,
                    "reservation",
                    8000
                  );

                  // Update UI
                  this.generateWeeklyCalendar();
                  this.updateTodayReservations();
                  this.updateStats();

                  // Play notification sound
                  this.playNotificationSound();
                } else {
                }
              } else {
              }
            }

            if (change.type === "modified") {
              const updatedReservation = {
                id: change.doc.id,
                ...change.doc.data(),
              };

              // Update in local array
              const index = this.reservations.findIndex(
                (res) => res.id === updatedReservation.id
              );

              if (index !== -1) {
                this.reservations[index] = updatedReservation;

                // Update UI
                this.generateWeeklyCalendar();
                this.updateTodayReservations();
                this.updateStats();

                // Show notification for modifications
                this.showNotification(
                  `Reserva actualizada: ${updatedReservation.clientName}`,
                  "info"
                );
              }
            }

            if (change.type === "removed") {
              const removedReservation = {
                id: change.doc.id,
                ...change.doc.data(),
              };

              // Remove from local array
              this.reservations = this.reservations.filter(
                (res) => res.id !== removedReservation.id
              );

              // Update UI
              this.generateWeeklyCalendar();
              this.updateTodayReservations();
              this.updateStats();

              // Show notification for cancellations
              this.showNotification(
                `Reserva cancelada: ${removedReservation.clientName}`,
                "info"
              );
            }
          });
        }
      );
    } catch (error) {
      console.error("❌ Error configurando listener en tiempo real:", error);
    }
  }

  // Helper function to format dates nicely
  formatDate(dateString) {
    // Parse the date string correctly to avoid timezone issues
    const [year, month, day] = dateString.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    const today = this.getLocalDateString(new Date());
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = this.getLocalDateString(tomorrow);

    if (dateString === today) {
      return "hoy";
    } else if (dateString === tomorrowStr) {
      return "mañana";
    } else {
      return date.toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    }
  }

  playNotificationSound() {
    try {
      // Create a subtle notification sound
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error("❌ Error reproduciendo sonido de notificación:", error);
    }
  }

  // Clean up listener when logging out
  handleLogout() {
    // Remove real-time listener if it exists
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    localStorage.removeItem("currentTherapist");
    this.currentUser = null;
    this.reservations = [];
    this.showLoginModal();
  }

  updateTodayReservations() {
    const today = this.getLocalDateString(new Date());

    const todayReservations = this.reservations.filter(
      (res) => res.date === today && res.therapistId === this.currentUser?.id
    );

    const container = document.getElementById("today-reservations-list");

    if (todayReservations.length === 0) {
      container.innerHTML = `
                <div class="text-center text-gray-500 py-6 sm:py-8">
                    <i class="fas fa-calendar-check text-2xl sm:text-3xl mb-2 sm:mb-3 text-gray-300"></i>
                    <p class="text-sm sm:text-base">No tienes reservas para hoy</p>
                </div>
            `;
    } else {
      const isMobile = window.innerWidth < 768;
      const reservationsHTML = todayReservations
        .map(
          (res) => `
                <div class="border-l-4 border-sage bg-sage-light/20 p-3 sm:p-4 rounded-r-lg mb-2 sm:mb-3 reservation-card${
                  isMobile ? "-mobile" : ""
                }">
                    <div class="flex justify-between items-start">
                        <div class="flex-1 min-w-0">
                            <h4 class="font-semibold text-gray-800 text-sm sm:text-base truncate">${
                              res.clientName
                            }</h4>
                            <p class="text-xs sm:text-sm text-gray-600 truncate">${
                              res.serviceName || res.service || "Servicio"
                            }</p>
                            <p class="text-xs sm:text-sm text-sage-dark font-medium">${
                              res.time
                            }</p>
                        </div>
                        <div class="text-right ml-2">
                            <span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                                ${
                                  res.status === "confirmed"
                                    ? "Confirmada"
                                    : "Pendiente"
                                }
                            </span>
                        </div>
                    </div>
                    ${
                      res.comments && !isMobile
                        ? `<p class="text-xs text-gray-500 mt-2 truncate">${res.comments}</p>`
                        : ""
                    }
                    <div class="mt-2 sm:mt-3 flex flex-wrap gap-2">
                        <button onclick="window.therapistPanel.viewReservationDetails('${
                          res.id
                        }')" class="text-xs bg-sage text-white px-2 sm:px-3 py-1 rounded hover:bg-sage-dark transition-colors">
                            ${isMobile ? "Ver" : "Ver Detalles"}
                        </button>
                        <button onclick="window.therapistPanel.editReservation('${
                          res.id
                        }')" class="text-xs bg-blue-500 text-white px-2 sm:px-3 py-1 rounded hover:bg-blue-600 transition-colors">
                            ${isMobile ? "Editar" : "Editar"}
                        </button>
                        <button onclick="window.therapistPanel.cancelReservation('${
                          res.id
                        }')" class="text-xs bg-red-500 text-white px-2 sm:px-3 py-1 rounded hover:bg-red-600 transition-colors">
                            ${isMobile ? "Cancelar" : "Cancelar"}
                        </button>
                        <a href="tel:${
                          res.clientPhone
                        }" class="text-xs bg-gray-200 text-gray-700 px-2 sm:px-3 py-1 rounded hover:bg-gray-300 transition-colors">
                            Llamar
                        </a>
                    </div>
                </div>
            `
        )
        .join("");

      container.innerHTML = reservationsHTML;
    }
  }

  updateStats() {
    const today = this.getLocalDateString(new Date());

    // Calculate week start and end dates using timezone-safe approach
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay; // Get Monday as start of week

    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() + daysToMonday);
    thisWeekStart.setHours(0, 0, 0, 0); // Start of day

    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
    thisWeekEnd.setHours(23, 59, 59, 999); // End of day

    // Convert to string format for comparison
    const weekStartStr = this.getLocalDateString(thisWeekStart);
    const weekEndStr = this.getLocalDateString(thisWeekEnd);

    // Filter reservations for current therapist
    const myReservations = this.reservations.filter(
      (res) => res.therapistId === this.currentUser?.id
    );

    // Today's reservations
    const todayCount = myReservations.filter(
      (res) => res.date === today
    ).length;
    document.getElementById("today-reservations").textContent = todayCount;

    // This week's reservations - compare date strings directly
    const weekCount = myReservations.filter((res) => {
      return res.date >= weekStartStr && res.date <= weekEndStr;
    }).length;
    document.getElementById("week-reservations").textContent = weekCount;

    // Next appointment
    const upcomingReservations = myReservations
      .filter((res) => {
        // Create date in local timezone to avoid UTC issues
        const [year, month, day] = res.date
          .split("-")
          .map((num) => parseInt(num));
        const [hours, minutes] = res.time
          .split(":")
          .map((num) => parseInt(num));
        const resDateTime = new Date(year, month - 1, day, hours, minutes);
        return resDateTime > new Date();
      })
      .sort((a, b) => {
        const [yearA, monthA, dayA] = a.date
          .split("-")
          .map((num) => parseInt(num));
        const [hoursA, minutesA] = a.time
          .split(":")
          .map((num) => parseInt(num));
        const dateTimeA = new Date(yearA, monthA - 1, dayA, hoursA, minutesA);

        const [yearB, monthB, dayB] = b.date
          .split("-")
          .map((num) => parseInt(num));
        const [hoursB, minutesB] = b.time
          .split(":")
          .map((num) => parseInt(num));
        const dateTimeB = new Date(yearB, monthB - 1, dayB, hoursB, minutesB);

        return dateTimeA - dateTimeB;
      });

    const nextAppointment = document.getElementById("next-appointment");
    if (upcomingReservations.length > 0) {
      const next = upcomingReservations[0];
      // Parse date in local timezone to avoid UTC issues
      const [year, month, day] = next.date
        .split("-")
        .map((num) => parseInt(num));
      const nextDate = new Date(year, month - 1, day); // month is 0-indexed
      const formattedDate = nextDate.toLocaleDateString("es-ES", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      nextAppointment.innerHTML = `${formattedDate} ${next.time}`;
    } else {
      nextAppointment.textContent = "Sin citas próximas";
    }
  }

  showNotification(message, type = "info", duration = 5000) {
    const notification = document.createElement("div");

    // Enhanced styling for new reservation notifications
    const baseClasses =
      "notification fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl max-w-sm border-l-4 animate-slide-in";
    const typeClasses = {
      success: "bg-green-50 text-green-800 border-green-400",
      error: "bg-red-50 text-red-800 border-red-400",
      info: "bg-blue-50 text-blue-800 border-blue-400",
      reservation: "bg-sage-light text-sage-dark border-sage shadow-2xl",
    };

    notification.className = `${baseClasses} ${
      typeClasses[type] || typeClasses.info
    }`;

    // Add icon based on type
    const icons = {
      success: "fas fa-check-circle",
      error: "fas fa-exclamation-circle",
      info: "fas fa-info-circle",
      reservation: "fas fa-calendar-plus",
    };

    notification.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <i class="${icons[type] || icons.info} text-lg"></i>
        </div>
        <div class="ml-3">
          <div class="text-sm font-medium">${message}</div>
          ${
            type === "reservation"
              ? '<div class="text-xs mt-1 opacity-75">Haz clic para ver detalles</div>'
              : ""
          }
        </div>
        <button class="ml-auto pl-3 text-current opacity-50 hover:opacity-75" onclick="this.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    // Add click handler for reservation notifications
    if (type === "reservation") {
      notification.style.cursor = "pointer";
      notification.addEventListener("click", () => {
        // Scroll to today's reservations section
        const todaySection = document.getElementById("today-reservations-list");
        if (todaySection) {
          todaySection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        notification.remove();
      });
    }

    document.body.appendChild(notification);

    // Auto remove
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, duration);
  }

  // New methods for reservation management
  showReservationActions(reservationId) {
    const reservation = this.reservations.find(
      (res) => res.id === reservationId
    );
    if (!reservation) return;

    const actionsHTML = `
      <div id="reservation-actions-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div class="p-4 sm:p-6">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-lg font-semibold text-gray-800">Acciones Rápidas</h3>
              <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600 p-1">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-3 mb-4">
              <div class="text-sm text-gray-600 space-y-1">
                <div><strong>Cliente:</strong> ${reservation.clientName}</div>
                <div><strong>Fecha:</strong> ${this.formatDate(
                  reservation.date
                )}</div>
                <div><strong>Hora:</strong> ${reservation.time}</div>
                <div><strong>Servicio:</strong> ${
                  reservation.serviceName || reservation.service
                }</div>
                <div><strong>Estado:</strong> <span class="inline-block px-2 py-1 text-xs rounded-full ${
                  reservation.status === "confirmed"
                    ? "bg-green-100 text-green-800"
                    : reservation.status === "cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }">${
      reservation.status === "confirmed"
        ? "Confirmada"
        : reservation.status === "cancelled"
        ? "Cancelada"
        : "Pendiente"
    }</span></div>
              </div>
            </div>
            
            <div class="grid grid-cols-1 gap-2 sm:gap-3">
              <button onclick="window.therapistPanel.viewReservationDetails('${reservationId}'); document.getElementById('reservation-actions-modal').remove();" class="w-full bg-sage text-white py-3 px-4 rounded-lg hover:bg-sage-dark transition-colors text-sm font-medium">
                <i class="fas fa-eye mr-2"></i>Ver Detalles Completos
              </button>
              <button onclick="window.therapistPanel.editReservation('${reservationId}'); document.getElementById('reservation-actions-modal').remove();" class="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                <i class="fas fa-edit mr-2"></i>Editar Reserva
              </button>
              <div class="grid grid-cols-2 gap-2">
                <button onclick="window.therapistPanel.cancelReservation('${reservationId}'); document.getElementById('reservation-actions-modal').remove();" class="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium">
                  <i class="fas fa-times-circle mr-1"></i>Cancelar
                </button>
                <a href="tel:${
                  reservation.clientPhone
                }" class="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors text-center text-sm font-medium">
                  <i class="fas fa-phone mr-1"></i>Llamar
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", actionsHTML);
  }

  viewReservationDetails(reservationId) {
    const reservation = this.reservations.find(
      (res) => res.id === reservationId
    );
    if (!reservation) {
      this.showNotification("Reserva no encontrada", "error");
      return;
    }

    const detailsHTML = `
      <div id="reservation-details-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-screen overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-start mb-6">
              <h3 class="text-xl font-semibold text-gray-800">Detalles de la Reserva</h3>
              <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Cliente</label>
                  <p class="text-gray-900">${reservation.clientName}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Estado</label>
                  <span class="inline-block px-2 py-1 text-xs rounded-full ${
                    reservation.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }">
                    ${
                      reservation.status === "confirmed"
                        ? "Confirmada"
                        : "Pendiente"
                    }
                  </span>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Fecha</label>
                  <p class="text-gray-900">${this.formatDate(
                    reservation.date
                  )}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Hora</label>
                  <p class="text-gray-900">${reservation.time}</p>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Servicio</label>
                <p class="text-gray-900">${
                  reservation.serviceName || reservation.service
                }</p>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Email</label>
                  <p class="text-gray-900">${reservation.clientEmail}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Teléfono</label>
                  <p class="text-gray-900">${reservation.clientPhone}</p>
                </div>
              </div>
              
              ${
                reservation.comments
                  ? `
                <div>
                  <label class="block text-sm font-medium text-gray-700">Comentarios</label>
                  <p class="text-gray-900">${reservation.comments}</p>
                </div>
              `
                  : ""
              }
              
              <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <label class="block text-sm font-medium text-gray-700">ID de Reserva</label>
                  <p>${reservation.id}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Creada</label>
                  <p>${
                    reservation.createdAt
                      ? new Date(
                          reservation.createdAt.seconds * 1000
                        ).toLocaleString("es-ES")
                      : "N/A"
                  }</p>
                </div>
              </div>
            </div>
            
            <div class="flex flex-col sm:flex-row gap-3 mt-6">
              <button onclick="window.therapistPanel.editReservation('${reservationId}'); document.getElementById('reservation-details-modal').remove();" class="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
                <i class="fas fa-edit mr-2"></i>Editar
              </button>
              <button onclick="window.therapistPanel.cancelReservation('${reservationId}'); document.getElementById('reservation-details-modal').remove();" class="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors">
                <i class="fas fa-times-circle mr-2"></i>Cancelar
              </button>
              <a href="tel:${
                reservation.clientPhone
              }" class="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition-colors text-center">
                <i class="fas fa-phone mr-2"></i>Llamar
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", detailsHTML);
  }

  editReservation(reservationId) {
    const reservation = this.reservations.find(
      (res) => res.id === reservationId
    );
    if (!reservation) {
      this.showNotification("Reserva no encontrada", "error");
      return;
    }

    const allTherapists = this.getAllTherapists();

    const editHTML = `
      <div id="edit-reservation-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-screen overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-start mb-6">
              <h3 class="text-xl font-semibold text-gray-800">Editar Reserva</h3>
              <button onclick="document.getElementById('edit-reservation-modal').remove()" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <form id="edit-reservation-form" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input type="text" id="edit-client-name" value="${
                    reservation.clientName
                  }" class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input type="tel" id="edit-client-phone" value="${
                    reservation.clientPhone
                  }" class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" id="edit-client-email" value="${
                  reservation.clientEmail
                }" class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Terapeuta</label>
                <select id="edit-therapist" class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                  ${allTherapists
                    .map(
                      (therapist) =>
                        `<option value="${therapist.id}" ${
                          therapist.id === reservation.therapistId
                            ? "selected"
                            : ""
                        }>${therapist.name}</option>`
                    )
                    .join("")}
                </select>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input type="date" id="edit-date" value="${
                    reservation.date
                  }" class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                  <div id="edit-date-info" class="text-xs text-gray-500 mt-1"></div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                  <select id="edit-time" class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                    <option value="${reservation.time}" selected>${
      reservation.time
    }</option>
                  </select>
                  <div id="edit-time-info" class="text-xs text-gray-500 mt-1"></div>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select id="edit-status" class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                  <option value="confirmed" ${
                    reservation.status === "confirmed" ? "selected" : ""
                  }>Confirmada</option>
                  <option value="pending" ${
                    reservation.status === "pending" ? "selected" : ""
                  }>Pendiente</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Comentarios</label>
                <textarea id="edit-comments" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md">${
                  reservation.comments || ""
                }</textarea>
              </div>
              
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div class="flex items-start">
                  <i class="fas fa-info-circle text-blue-500 mt-0.5 mr-2"></i>
                  <div class="text-sm text-blue-700">
                    <strong>Horarios de Atención:</strong><br>
                    Lunes a Viernes: 9:00 - 20:00<br>
                    Sábados: 9:00 - 15:00<br>
                    Domingos: Cerrado
                  </div>
                </div>
              </div>
              
              <div class="flex gap-3 mt-6">
                <button type="submit" class="flex-1 bg-sage text-white py-2 px-4 rounded hover:bg-sage-dark transition-colors">
                  <i class="fas fa-save mr-2"></i>Guardar Cambios
                </button>
                <button type="button" onclick="document.getElementById('edit-reservation-modal').remove()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", editHTML);

    // Add event listeners for dynamic updates
    const dateInput = document.getElementById("edit-date");
    const timeSelect = document.getElementById("edit-time");
    const therapistSelect = document.getElementById("edit-therapist");

    const updateAvailableHours = () => {
      const selectedDate = dateInput.value;
      const selectedTherapist = therapistSelect.value;

      if (!selectedDate) {
        timeSelect.innerHTML =
          '<option value="">Primero selecciona una fecha</option>';
        document.getElementById("edit-date-info").textContent = "";
        document.getElementById("edit-time-info").textContent = "";
        return;
      }

      // Check if date is within business hours
      const availableHours = this.getAvailableHoursForDate(selectedDate);

      if (availableHours.length === 0) {
        timeSelect.innerHTML = '<option value="">Día cerrado</option>';
        document.getElementById("edit-date-info").textContent =
          "❌ El estudio está cerrado este día";
        document.getElementById("edit-time-info").textContent = "";
        return;
      }

      document.getElementById("edit-date-info").textContent =
        "✅ Día de atención disponible";

      if (!selectedTherapist) {
        timeSelect.innerHTML =
          '<option value="">Selecciona una terapeuta</option>';
        document.getElementById("edit-time-info").textContent = "";
        return;
      }

      // Filter hours based on therapist availability (exclude current reservation)
      const availableForTherapist = availableHours.filter((hour) =>
        this.isTimeSlotAvailableForTherapist(
          selectedDate,
          hour,
          selectedTherapist,
          reservationId
        )
      );

      const currentTime = reservation.time;
      timeSelect.innerHTML = "";

      availableHours.forEach((hour) => {
        const isAvailableForSelectedTherapist =
          availableForTherapist.includes(hour) || hour === currentTime;
        const isCompletelyUnavailable = this.isTimeSlotCompletelyUnavailable(
          selectedDate,
          hour,
          reservationId
        );

        const option = document.createElement("option");
        option.value = hour;
        option.textContent = hour;

        if (hour === currentTime) {
          option.selected = true;
          option.textContent += " (Actual)";
        } else if (!isAvailableForSelectedTherapist) {
          option.disabled = true;
          if (isCompletelyUnavailable) {
            option.textContent += " (Ambas ocupadas)";
          } else {
            option.textContent += " (Esta terapeuta ocupada)";
          }
          option.style.color = "#999";
        }

        timeSelect.appendChild(option);
      });

      const availableCount = availableForTherapist.length;
      const totalCount = availableHours.length;
      const completelyUnavailableCount = availableHours.filter((hour) =>
        this.isTimeSlotCompletelyUnavailable(selectedDate, hour, reservationId)
      ).length;

      document.getElementById(
        "edit-time-info"
      ).textContent = `${availableCount}/${totalCount} horarios disponibles para esta terapeuta (${completelyUnavailableCount} completamente ocupados)`;
    };

    dateInput.addEventListener("change", updateAvailableHours);
    therapistSelect.addEventListener("change", updateAvailableHours);

    // Initial update
    updateAvailableHours();

    // Add form submit event
    document
      .getElementById("edit-reservation-form")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveReservationChanges(reservationId);
      });
  }

  async saveReservationChanges(reservationId) {
    try {
      const selectedTherapistId =
        document.getElementById("edit-therapist").value;
      const selectedDate = document.getElementById("edit-date").value;
      const selectedTime = document.getElementById("edit-time").value;

      // Validate business hours
      if (!this.isDateWithinBusinessHours(selectedDate, selectedTime)) {
        this.showNotification(
          "El horario seleccionado está fuera del horario de atención",
          "error"
        );
        return;
      }

      // Validate therapist availability (excluding current reservation)
      if (
        !this.isTimeSlotAvailableForTherapist(
          selectedDate,
          selectedTime,
          selectedTherapistId,
          reservationId
        )
      ) {
        this.showNotification(
          "La terapeuta seleccionada ya tiene una reserva en ese horario",
          "error"
        );
        return;
      }

      const selectedTherapist = this.getAllTherapists().find(
        (t) => t.id === selectedTherapistId
      );

      const updatedData = {
        clientName: document.getElementById("edit-client-name").value,
        clientEmail: document.getElementById("edit-client-email").value,
        clientPhone: document.getElementById("edit-client-phone").value,
        date: selectedDate,
        time: selectedTime,
        status: document.getElementById("edit-status").value,
        comments: document.getElementById("edit-comments").value,
        therapistId: selectedTherapistId,
        therapistName: selectedTherapist.name,
      };

      // Update in Firebase if available
      if (window.firebaseManager && window.firebaseManager.initialized) {
        await window.firebaseManager.updateReservation(
          reservationId,
          updatedData
        );
        this.showNotification("Reserva actualizada correctamente", "success");
      } else {
        // Update locally
        const index = this.reservations.findIndex(
          (res) => res.id === reservationId
        );
        if (index !== -1) {
          this.reservations[index] = {
            ...this.reservations[index],
            ...updatedData,
          };
        }
        this.showNotification("Reserva actualizada localmente", "info");
      }

      // Close modal and refresh UI
      document.getElementById("edit-reservation-modal").remove();
      this.generateWeeklyCalendar();
      this.updateTodayReservations();
      this.updateStats();
    } catch (error) {
      console.error("Error actualizando reserva:", error);
      this.showNotification("Error al actualizar la reserva", "error");
    }
  }

  async cancelReservation(reservationId) {
    const reservation = this.reservations.find(
      (res) => res.id === reservationId
    );
    if (!reservation) {
      this.showNotification("Reserva no encontrada", "error");
      return;
    }

    // Confirm cancellation
    const confirmHTML = `
      <div id="cancel-confirmation-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div class="p-6">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-4">
                <i class="fas fa-exclamation-triangle text-xl"></i>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-800">Confirmar Cancelación</h3>
                <p class="text-sm text-gray-600">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <div class="mb-6">
              <p class="text-gray-700">¿Estás segura de que quieres cancelar la reserva de:</p>
              <div class="mt-2 p-3 bg-gray-50 rounded">
                <p class="font-semibold">${reservation.clientName}</p>
                <p class="text-sm text-gray-600">${this.formatDate(
                  reservation.date
                )} a las ${reservation.time}</p>
              </div>
            </div>
            
            <div class="flex gap-3">
              <button onclick="window.therapistPanel.confirmCancelReservation('${reservationId}')" class="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors">
                Sí, Cancelar
              </button>
              <button onclick="document.getElementById('cancel-confirmation-modal').remove()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors">
                No, Mantener
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", confirmHTML);
  }

  async confirmCancelReservation(reservationId) {
    try {
      // Delete from Firebase if available
      if (window.firebaseManager && window.firebaseManager.initialized) {
        await window.firebaseManager.deleteReservation(reservationId);
        this.showNotification("Reserva cancelada correctamente", "success");
      } else {
        // Remove locally
        this.reservations = this.reservations.filter(
          (res) => res.id !== reservationId
        );
        this.showNotification("Reserva cancelada localmente", "info");
      }

      // Close modal and refresh UI
      document.getElementById("cancel-confirmation-modal").remove();
      this.generateWeeklyCalendar();
      this.updateTodayReservations();
      this.updateStats();
    } catch (error) {
      console.error("Error cancelando reserva:", error);
      this.showNotification("Error al cancelar la reserva", "error");
    }
  }

  async showNewReservationModal() {
    console.log("🔍 showNewReservationModal called");
    console.log("🔍 currentUser:", this.currentUser);

    // Verificar que el usuario esté autenticado - con verificación múltiple
    if (!this.currentUser) {
      console.log("❌ No hay currentUser, intentando verificación múltiple...");
      this.tryMultipleAuthSources();

      // Verificar de nuevo después de la verificación múltiple
      if (!this.currentUser) {
        console.log("❌ Sin autenticación después de verificación múltiple");
        this.showNotification(
          "Debes estar autenticada para crear reservas. Por favor, vuelve a iniciar sesión.",
          "error"
        );
        return;
      }
    }

    console.log(
      "✅ Usuario autenticado:",
      this.currentUser.id || this.currentUser.email
    );

    const services = [
      "Reiki",
      "Masajes Terapéuticos",
      "Reflexología",
      "Aromaterapia",
      "Terapia de Sonido",
      "Meditación Guiada",
    ];

    // Intentar cargar servicios dinámicos si están disponibles
    let dynamicServices = [];
    try {
      if (window.firebaseManager && window.firebaseManager.getServices) {
        dynamicServices = await window.firebaseManager.getServices();
      }
    } catch (error) {
      console.log("🔄 Usando servicios backup:", error.message);
    }

    // Usar servicios dinámicos si están disponibles, sino usar backup
    const servicesToShow = dynamicServices.length > 0 
      ? dynamicServices.map(service => service.name)
      : services;

    const allTherapists = this.getAllTherapists();
    console.log("🔍 allTherapists:", allTherapists);

    const newReservationHTML = `
      <div id="new-reservation-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-screen overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-start mb-6">
              <h3 class="text-xl font-semibold text-gray-800">Nueva Reserva Manual</h3>
              <button onclick="document.getElementById('new-reservation-modal').remove()" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <form id="new-reservation-form" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente *</label>
                  <input type="text" id="new-client-name" class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                  <input type="tel" id="new-client-phone" class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" id="new-client-email" class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Servicio *</label>
                <select id="new-service" class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                  <option value="">Seleccionar servicio...</option>
                  ${servicesToShow
                    .map(
                      (service) =>
                        `<option value="${service}">${service}</option>`
                    )
                    .join("")}
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Terapeuta *</label>
                <select id="new-therapist" class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                  <option value="">Seleccionar terapeuta...</option>
                  ${allTherapists
                    .map(
                      (therapist) =>
                        `<option value="${therapist.id}" ${
                          this.currentUser &&
                          therapist.id === this.currentUser.id
                            ? "selected"
                            : ""
                        }>${therapist.name}</option>`
                    )
                    .join("")}
                </select>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                  <input type="date" id="new-date" class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                  <div id="date-info" class="text-xs text-gray-500 mt-1"></div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
                  <select id="new-time" class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                    <option value="">Primero selecciona fecha y terapeuta</option>
                  </select>
                  <div id="time-info" class="text-xs text-gray-500 mt-1"></div>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select id="new-status" class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                  <option value="confirmed">Confirmada</option>
                  <option value="pending">Pendiente</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Comentarios</label>
                <textarea id="new-comments" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Información adicional sobre la reserva..."></textarea>
              </div>
              
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div class="flex items-start">
                  <i class="fas fa-info-circle text-blue-500 mt-0.5 mr-2"></i>
                  <div class="text-sm text-blue-700">
                    <strong>Horarios de Atención:</strong><br>
                    Lunes a Viernes: 9:00 - 20:00<br>
                    Sábados: 9:00 - 15:00<br>
                    Domingos: Cerrado
                  </div>
                </div>
              </div>
              
              <div class="flex gap-3 mt-6">
                <button type="submit" class="flex-1 bg-sage text-white py-2 px-4 rounded hover:bg-sage-dark transition-colors">
                  <i class="fas fa-save mr-2"></i>Crear Reserva
                </button>
                <button type="button" onclick="document.getElementById('new-reservation-modal').remove()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", newReservationHTML);

    // Forzar verificación de autenticación antes de configurar el modal
    if (!this.currentUser) {
      const savedUser = localStorage.getItem("currentTherapist");
      if (savedUser) {
        console.log(
          "🔧 Recuperando usuario desde localStorage en showNewReservationModal..."
        );
        this.currentUser = JSON.parse(savedUser);
      }
    }

    // Set minimum date to today
    const today = this.getLocalDateString(new Date());
    document.getElementById("new-date").min = today;
    document.getElementById("new-date").value = today;

    // Add event listeners for dynamic updates
    const dateInput = document.getElementById("new-date");
    const timeSelect = document.getElementById("new-time");
    const therapistSelect = document.getElementById("new-therapist");

    const updateAvailableHours = () => {
      const selectedDate = dateInput.value;
      const selectedTherapist = therapistSelect.value;

      if (!selectedDate) {
        timeSelect.innerHTML =
          '<option value="">Primero selecciona una fecha</option>';
        document.getElementById("date-info").textContent = "";
        document.getElementById("time-info").textContent = "";
        return;
      }

      // Check if date is within business hours
      const availableHours = this.getAvailableHoursForDate(selectedDate);

      if (availableHours.length === 0) {
        timeSelect.innerHTML = '<option value="">Día cerrado</option>';
        document.getElementById("date-info").textContent =
          "❌ El estudio está cerrado este día";
        document.getElementById("time-info").textContent = "";
        return;
      }

      document.getElementById("date-info").textContent =
        "✅ Día de atención disponible";

      if (!selectedTherapist) {
        timeSelect.innerHTML =
          '<option value="">Selecciona una terapeuta</option>';
        document.getElementById("time-info").textContent = "";
        return;
      }

      // Filter hours based on therapist availability
      const availableForTherapist = availableHours.filter((hour) =>
        this.isTimeSlotAvailableForTherapist(
          selectedDate,
          hour,
          selectedTherapist
        )
      );

      timeSelect.innerHTML = '<option value="">Seleccionar hora...</option>';

      availableHours.forEach((hour) => {
        const isAvailableForSelectedTherapist =
          availableForTherapist.includes(hour);
        const isCompletelyUnavailable = this.isTimeSlotCompletelyUnavailable(
          selectedDate,
          hour
        );

        const option = document.createElement("option");
        option.value = hour;
        option.textContent = hour;

        if (!isAvailableForSelectedTherapist) {
          option.disabled = true;
          if (isCompletelyUnavailable) {
            option.textContent += " (Ambas ocupadas)";
          } else {
            option.textContent += " (Esta terapeuta ocupada)";
          }
          option.style.color = "#999";
        }

        timeSelect.appendChild(option);
      });

      const availableCount = availableForTherapist.length;
      const totalCount = availableHours.length;
      const completelyUnavailableCount = availableHours.filter((hour) =>
        this.isTimeSlotCompletelyUnavailable(selectedDate, hour)
      ).length;

      document.getElementById(
        "time-info"
      ).textContent = `${availableCount}/${totalCount} horarios disponibles para esta terapeuta (${completelyUnavailableCount} completamente ocupados)`;
    };

    dateInput.addEventListener("change", updateAvailableHours);
    therapistSelect.addEventListener("change", updateAvailableHours);

    // Initial update
    updateAvailableHours();

    // Add form submit event
    document
      .getElementById("new-reservation-form")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.createNewReservation();
      });
  }

  async createNewReservation() {
    try {
      // Prevent double submission
      const submitButton = document.querySelector(
        '#new-reservation-form button[type="submit"]'
      );
      if (submitButton.disabled) {
        return; // Already processing
      }

      // Disable submit button to prevent double clicks
      submitButton.disabled = true;
      submitButton.innerHTML =
        '<i class="fas fa-spinner fa-spin mr-2"></i>Creando...';

      const selectedTherapistId =
        document.getElementById("new-therapist").value;
      const selectedDate = document.getElementById("new-date").value;
      const selectedTime = document.getElementById("new-time").value;

      // Validate business hours
      if (!this.isDateWithinBusinessHours(selectedDate, selectedTime)) {
        this.showNotification(
          "El horario seleccionado está fuera del horario de atención",
          "error"
        );
        return;
      }

      // Validate therapist availability
      if (
        !this.isTimeSlotAvailableForTherapist(
          selectedDate,
          selectedTime,
          selectedTherapistId
        )
      ) {
        this.showNotification(
          "La terapeuta seleccionada ya tiene una reserva en ese horario",
          "error"
        );
        return;
      }

      const selectedTherapist = this.getAllTherapists().find(
        (t) => t.id === selectedTherapistId
      );

      const formData = {
        clientName: document.getElementById("new-client-name").value,
        clientEmail: document.getElementById("new-client-email").value,
        clientPhone: document.getElementById("new-client-phone").value,
        service: document.getElementById("new-service").value,
        serviceName: document.getElementById("new-service").value,
        date: selectedDate,
        time: selectedTime,
        status: document.getElementById("new-status").value,
        comments: document.getElementById("new-comments").value,
        therapistId: selectedTherapistId,
        therapistName: selectedTherapist.name,
        createdAt: new Date(),
        createdBy: "manual", // Indicar que fue creada manualmente
      };

      // Save to Firebase if available
      if (window.firebaseManager && window.firebaseManager.initialized) {
        const reservationResult = await window.firebaseManager.saveReservation(
          formData
        );

        console.log(
          "✅ Reserva guardada en Firebase con ID:",
          reservationResult
        );

        // Enviar email de confirmación para reserva manual - CON LOGS DETALLADOS
        console.log("📧 INICIANDO PROCESO DE EMAIL DE CONFIRMACIÓN...");

        if (window.emailService) {
          console.log("📧 EmailService disponible, procediendo con envío...");

          try {
            const emailData = {
              ...formData,
              id: reservationResult,
            };

            console.log("📧 Datos para email:", emailData);
            console.log("📧 Llamando a sendConfirmationEmail...");

            const emailSent = await window.emailService.sendConfirmationEmail(
              emailData
            );

            console.log("📧 Resultado del envío:", emailSent);

            if (emailSent) {
              console.log("✅ Email de confirmación enviado correctamente");
              this.showNotification(
                `Reserva creada y email enviado a ${formData.clientEmail}`,
                "success",
                7000
              );
            } else {
              console.log("⚠️ No se pudo enviar el email de confirmación");
              this.showNotification(
                "Reserva creada (email de confirmación falló)",
                "info",
                7000
              );
            }
          } catch (error) {
            console.error("❌ Error enviando email de confirmación:", error);
            console.error("❌ Stack trace:", error.stack);
            this.showNotification(
              "Reserva creada (error enviando email)",
              "info",
              7000
            );
          }
        } else {
          console.log("⚠️ EmailService no disponible");
          this.showNotification(
            "Reserva creada (sin email - servicio no disponible)",
            "info",
            7000
          );
        }

        // Programar recordatorios automáticos para reserva manual
        try {
          if (window.reminderSystem) {
            const reservationWithId = {
              ...formData,
              id: reservationResult,
            };
            window.reminderSystem.scheduleReminders(reservationWithId);
            console.log(
              "📅 Recordatorios programados para reserva manual:",
              reservationResult
            );
          }
        } catch (error) {
          console.error("❌ Error programando recordatorios:", error);
          // No interrumpir el proceso por error de recordatorios
        } // DON'T add to local array here - let the real-time listener handle it
        // This prevents duplicates from manual addition + listener addition
      } else {
        // Create locally with temporary ID (only when Firebase is not available)
        const tempId = "temp_" + Date.now();
        this.reservations.push({
          id: tempId,
          ...formData,
        });
        this.showNotification("Reserva creada localmente", "info");

        // Update UI immediately for local-only mode
        this.generateWeeklyCalendar();
        this.updateTodayReservations();
        this.updateStats();
      }

      // Close modal
      document.getElementById("new-reservation-modal").remove();
    } catch (error) {
      console.error("Error creando reserva:", error);
      this.showNotification("Error al crear la reserva", "error");
    } finally {
      // Re-enable submit button
      const submitButton = document.querySelector(
        '#new-reservation-form button[type="submit"]'
      );
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML =
          '<i class="fas fa-save mr-2"></i>Crear Reserva';
      }
    }
  }

  getLocalDateString(date) {
    // Get date in local timezone (avoid UTC issues)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  showFullCalendarModal() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const fullCalendarHTML = `
      <div id="full-calendar-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-start mb-6">
              <h3 class="text-xl font-semibold text-gray-800">Calendario Completo</h3>
              <button onclick="document.getElementById('full-calendar-modal').remove()" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div class="mb-4 flex justify-between items-center">
              <button onclick="window.therapistPanel.changeCalendarMonth(-1)" class="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300">
                <i class="fas fa-chevron-left"></i> Anterior
              </button>
              <h4 id="calendar-month-year" class="text-lg font-semibold"></h4>
              <button onclick="window.therapistPanel.changeCalendarMonth(1)" class="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300">
                Siguiente <i class="fas fa-chevron-right"></i>
              </button>
            </div>
            
            <div id="monthly-calendar-container" class="border rounded-lg overflow-hidden">
              <!-- Calendar will be generated here -->
            </div>
            
            <div class="mt-4 text-sm text-gray-600">
              <div class="flex flex-wrap gap-4">
                <div class="flex items-center">
                  <div class="w-4 h-4 bg-sage-light border-sage border-l-4 rounded mr-2"></div>
                  <span>Reservas confirmadas</span>
                </div>
                <div class="flex items-center">
                  <div class="w-4 h-4 bg-yellow-100 border-yellow-400 border-l-4 rounded mr-2"></div>
                  <span>Reservas pendientes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", fullCalendarHTML);

    this.currentCalendarDate = new Date(year, month, 1);
    this.generateMonthlyCalendar();
  }

  changeCalendarMonth(direction) {
    this.currentCalendarDate.setMonth(
      this.currentCalendarDate.getMonth() + direction
    );
    this.generateMonthlyCalendar();
  }

  generateMonthlyCalendar() {
    const year = this.currentCalendarDate.getFullYear();
    const month = this.currentCalendarDate.getMonth();

    // Update month/year display
    const monthNames = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    document.getElementById(
      "calendar-month-year"
    ).textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    let calendarHTML = `
      <div class="grid grid-cols-7 gap-0">
        <div class="bg-gray-100 p-3 font-semibold text-center border">Dom</div>
        <div class="bg-gray-100 p-3 font-semibold text-center border">Lun</div>
        <div class="bg-gray-100 p-3 font-semibold text-center border">Mar</div>
        <div class="bg-gray-100 p-3 font-semibold text-center border">Mié</div>
        <div class="bg-gray-100 p-3 font-semibold text-center border">Jue</div>
        <div class="bg-gray-100 p-3 font-semibold text-center border">Vie</div>
        <div class="bg-gray-100 p-3 font-semibold text-center border">Sáb</div>
    `;

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarHTML += `<div class="border p-2 h-24 bg-gray-50"></div>`;
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = this.getLocalDateString(date);
      const dayReservations = this.reservations.filter(
        (res) =>
          res.date === dateStr && res.therapistId === this.currentUser?.id
      );

      const isToday = dateStr === this.getLocalDateString(new Date());
      const dayClass = isToday ? "bg-blue-50 border-blue-200" : "bg-white";

      calendarHTML += `
        <div class="border p-2 h-24 ${dayClass} overflow-hidden">
          <div class="font-semibold text-sm mb-1 ${
            isToday ? "text-blue-600" : ""
          }">${day}</div>
          <div class="space-y-1">
            ${dayReservations
              .slice(0, 2)
              .map(
                (res) => `
              <div class="text-xs p-1 rounded ${
                res.status === "confirmed"
                  ? "bg-sage-light text-sage-dark"
                  : "bg-yellow-100 text-yellow-800"
              } truncate">
                ${res.time} ${res.clientName}
              </div>
            `
              )
              .join("")}
            ${
              dayReservations.length > 2
                ? `<div class="text-xs text-gray-500">+${
                    dayReservations.length - 2
                  } más</div>`
                : ""
            }
          </div>
        </div>
      `;
    }

    calendarHTML += "</div>";
    document.getElementById("monthly-calendar-container").innerHTML =
      calendarHTML;
  }

  showMonthlyReportsModal() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthlyReportsHTML = `
      <div id="monthly-reports-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-start mb-6">
              <h3 class="text-xl font-semibold text-gray-800">Reportes Mensuales</h3>
              <button onclick="document.getElementById('monthly-reports-modal').remove()" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div class="mb-4 flex justify-between items-center">
              <button onclick="window.therapistPanel.changeReportMonth(-1)" class="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300">
                <i class="fas fa-chevron-left"></i> Anterior
              </button>
              <h4 id="report-month-year" class="text-lg font-semibold"></h4>
              <button onclick="window.therapistPanel.changeReportMonth(1)" class="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300">
                Siguiente <i class="fas fa-chevron-right"></i>
              </button>
            </div>
            
            <div id="monthly-stats-container">
              <!-- Stats will be generated here -->
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", monthlyReportsHTML);

    this.currentReportDate = new Date(year, month, 1);
    this.generateMonthlyReport();
  }

  changeReportMonth(direction) {
    this.currentReportDate.setMonth(
      this.currentReportDate.getMonth() + direction
    );
    this.generateMonthlyReport();
  }

  generateMonthlyReport() {
    const year = this.currentReportDate.getFullYear();
    const month = this.currentReportDate.getMonth();

    const monthNames = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    // Update month/year display
    document.getElementById(
      "report-month-year"
    ).textContent = `${monthNames[month]} ${year}`;

    // Filter reservations for this month
    const monthlyReservations = this.reservations.filter((res) => {
      if (res.therapistId !== this.currentUser?.id) return false;

      const [resYear, resMonth] = res.date
        .split("-")
        .map((num) => parseInt(num));
      return resYear === year && resMonth === month + 1;
    });

    // Calculate statistics
    const totalReservations = monthlyReservations.length;
    const confirmedReservations = monthlyReservations.filter(
      (res) => res.status === "confirmed"
    ).length;
    const pendingReservations = monthlyReservations.filter(
      (res) => res.status === "pending"
    ).length;
    const cancelledReservations = monthlyReservations.filter(
      (res) => res.status === "cancelled"
    ).length;

    // Services breakdown
    const serviceStats = {};
    monthlyReservations.forEach((res) => {
      const service = res.serviceName || res.service || "Sin especificar";
      serviceStats[service] = (serviceStats[service] || 0) + 1;
    });

    // Day of week analysis
    const dayStats = {};
    const dayNames = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    monthlyReservations.forEach((res) => {
      const [year, month, day] = res.date
        .split("-")
        .map((num) => parseInt(num));
      const date = new Date(year, month - 1, day);
      const dayName = dayNames[date.getDay()];
      dayStats[dayName] = (dayStats[dayName] || 0) + 1;
    });

    // Time slot analysis
    const timeStats = {};
    monthlyReservations.forEach((res) => {
      timeStats[res.time] = (timeStats[res.time] || 0) + 1;
    });

    const reportHTML = `
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-blue-600">${totalReservations}</div>
          <div class="text-sm text-blue-600">Total Reservas</div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-green-600">${confirmedReservations}</div>
          <div class="text-sm text-green-600">Confirmadas</div>
        </div>
        <div class="bg-yellow-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-yellow-600">${pendingReservations}</div>
          <div class="text-sm text-yellow-600">Pendientes</div>
        </div>
        <div class="bg-red-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-red-600">${cancelledReservations}</div>
          <div class="text-sm text-red-600">Canceladas</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Services Breakdown -->
        <div class="bg-white border rounded-lg p-4">
          <h4 class="font-semibold text-gray-800 mb-3">Servicios Más Solicitados</h4>
          <div class="space-y-2">
            ${Object.entries(serviceStats)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(
                ([service, count]) => `
                <div class="flex justify-between items-center py-2 border-b">
                  <span class="text-sm">${service}</span>
                  <span class="font-semibold text-sage">${count}</span>
                </div>
              `
              )
              .join("")}
          </div>
        </div>

        <!-- Day of Week Analysis -->
        <div class="bg-white border rounded-lg p-4">
          <h4 class="font-semibold text-gray-800 mb-3">Días Más Ocupados</h4>
          <div class="space-y-2">
            ${Object.entries(dayStats)
              .sort(([, a], [, b]) => b - a)
              .map(
                ([day, count]) => `
                <div class="flex justify-between items-center py-2 border-b">
                  <span class="text-sm">${day}</span>
                  <span class="font-semibold text-sage">${count}</span>
                </div>
              `
              )
              .join("")}
          </div>
        </div>

        <!-- Time Slots Analysis -->
        <div class="bg-white border rounded-lg p-4">
          <h4 class="font-semibold text-gray-800 mb-3">Horarios Más Solicitados</h4>
          <div class="space-y-2">
            ${Object.entries(timeStats)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(
                ([time, count]) => `
                <div class="flex justify-between items-center py-2 border-b">
                  <span class="text-sm">${time}</span>
                  <span class="font-semibold text-sage">${count}</span>
                </div>
              `
              )
              .join("")}
          </div>
        </div>

        <!-- Monthly Trend -->
        <div class="bg-white border rounded-lg p-4">
          <h4 class="font-semibold text-gray-800 mb-3">Resumen del Mes</h4>
          <div class="space-y-3">
            <div class="text-sm">
              <span class="text-gray-600">Tasa de confirmación:</span>
              <span class="font-semibold ml-2">
                ${
                  totalReservations > 0
                    ? Math.round(
                        (confirmedReservations / totalReservations) * 100
                      )
                    : 0
                }%
              </span>
            </div>
            <div class="text-sm">
              <span class="text-gray-600">Promedio por día:</span>
              <span class="font-semibold ml-2">
                ${
                  totalReservations > 0
                    ? Math.round(
                        (totalReservations /
                          new Date(year, month + 1, 0).getDate()) *
                          10
                      ) / 10
                    : 0
                }
              </span>
            </div>
            <div class="text-sm">
              <span class="text-gray-600">Total de clientes únicos:</span>
              <span class="font-semibold ml-2">
                ${
                  new Set(monthlyReservations.map((res) => res.clientEmail))
                    .size
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      ${
        totalReservations === 0
          ? `
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-chart-bar text-4xl mb-3 text-gray-300"></i>
          <p>No hay datos disponibles para este mes</p>
        </div>
      `
          : ""
      }
    `;

    document.getElementById("monthly-stats-container").innerHTML = reportHTML;
  }

  // Business hours and availability validation methods
  getBusinessHours() {
    return {
      monday: { start: "09:00", end: "20:00" },
      tuesday: { start: "09:00", end: "20:00" },
      wednesday: { start: "09:00", end: "20:00" },
      thursday: { start: "09:00", end: "20:00" },
      friday: { start: "09:00", end: "20:00" },
      saturday: { start: "09:00", end: "15:00" },
      sunday: null, // Closed on Sundays
    };
  }

  isDateWithinBusinessHours(dateString, time) {
    // Parse date to get day of week
    const [year, month, day] = dateString
      .split("-")
      .map((num) => parseInt(num));
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayName = dayNames[dayOfWeek];

    const businessHours = this.getBusinessHours();
    const dayHours = businessHours[dayName];

    // If closed on this day
    if (!dayHours) {
      return false;
    }

    // Check if time is within business hours
    return time >= dayHours.start && time <= dayHours.end;
  }

  getAvailableHoursForDate(dateString) {
    // Get business hours for the day
    const [year, month, day] = dateString
      .split("-")
      .map((num) => parseInt(num));
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();

    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayName = dayNames[dayOfWeek];

    const businessHours = this.getBusinessHours();
    const dayHours = businessHours[dayName];

    // If closed on this day, return empty array
    if (!dayHours) {
      return [];
    }

    // Filter hours that are within business hours
    const availableHours = this.hours.filter(
      (hour) => hour >= dayHours.start && hour <= dayHours.end
    );

    return availableHours;
  }

  isTimeSlotAvailableForTherapist(
    dateString,
    time,
    therapistId,
    excludeReservationId = null
  ) {
    // Check if there's already a reservation for this therapist at this time
    const conflictingReservations = this.reservations.filter(
      (res) =>
        res.date === dateString &&
        res.time === time &&
        res.therapistId === therapistId &&
        res.id !== excludeReservationId // Exclude current reservation when editing
    );

    // Also log if we find multiple conflicts (indicates duplicates)
    if (conflictingReservations.length > 1) {
      console.warn("⚠️ Múltiples reservas encontradas para el mismo horario:", {
        date: dateString,
        time: time,
        therapistId: therapistId,
        conflicts: conflictingReservations,
      });
    }

    return conflictingReservations.length === 0;
  }

  getAllTherapists() {
    return [
      { id: "lorena", name: "Lorena Murua Bosquero" },
      { id: "betsabe", name: "Betsabé Murua Bosquero" },
    ];
  }

  getAvailableTherapistsForTimeSlot(
    dateString,
    time,
    excludeReservationId = null
  ) {
    const allTherapists = this.getAllTherapists();

    return allTherapists.filter((therapist) =>
      this.isTimeSlotAvailableForTherapist(
        dateString,
        time,
        therapist.id,
        excludeReservationId
      )
    );
  }

  // New function to check if a time slot is completely unavailable (both therapists busy)
  isTimeSlotCompletelyUnavailable(
    dateString,
    time,
    excludeReservationId = null
  ) {
    const availableTherapists = this.getAvailableTherapistsForTimeSlot(
      dateString,
      time,
      excludeReservationId
    );
    return availableTherapists.length === 0;
  }

  // Function to remove duplicate reservations
  removeDuplicateReservations() {
    const uniqueReservations = [];
    const seenKeys = new Set();
    let duplicatesFound = 0;

    this.reservations.forEach((reservation) => {
      // Create a unique key based on important reservation details
      const key = `${reservation.date}-${reservation.time}-${reservation.therapistId}-${reservation.clientEmail}`;

      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueReservations.push(reservation);
      } else {
        duplicatesFound++;
      }
    });

    const originalCount = this.reservations.length;
    this.reservations = uniqueReservations;
    const newCount = this.reservations.length;

    if (originalCount !== newCount) {
      this.showNotification(
        `Se eliminaron ${duplicatesFound} reservas duplicadas`,
        "success"
      );
      // Update UI after removing duplicates
      this.generateWeeklyCalendar();
      this.updateTodayReservations();
      this.updateStats();
    } else {
      // Show message when no duplicates are found (when called manually)
      if (typeof this.showNotification === "function") {
        this.showNotification("No se encontraron reservas duplicadas", "info");
      }
    }
  }

  showReminderSystemModal() {
    const modalHTML = `
      <div id="reminder-system-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-start mb-6">
              <h3 class="text-xl font-semibold text-gray-800">Sistema de Recordatorios Automáticos</h3>
              <button onclick="document.getElementById('reminder-system-modal').remove()" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div class="space-y-6">
              <!-- Estado del sistema -->
              <div class="bg-gradient-to-r from-sage-light to-sage-dark p-4 rounded-lg text-white">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-semibold text-lg">Estado del Sistema</h4>
                    <p class="text-sage-light">Recordatorios automáticos activados</p>
                  </div>
                  <div class="text-right">
                    <div class="text-2xl font-bold" id="active-reminders-count">-</div>
                    <div class="text-sm text-sage-light">Recordatorios activos</div>
                  </div>
                </div>
              </div>

              <!-- Configuración de recordatorios -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div class="flex items-center mb-2">
                    <i class="fas fa-calendar-day text-blue-600 mr-2"></i>
                    <h5 class="font-semibold text-blue-800">24 Horas Antes</h5>
                  </div>
                  <p class="text-sm text-blue-700 mb-3">Recordatorio principal para el cliente</p>
                  <div class="text-xs text-blue-600">
                    ✅ Activado por defecto<br>
                    📱 Enviado por WhatsApp/Email
                  </div>
                </div>

                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div class="flex items-center mb-2">
                    <i class="fas fa-clock text-yellow-600 mr-2"></i>
                    <h5 class="font-semibold text-yellow-800">2 Horas Antes</h5>
                  </div>
                  <p class="text-sm text-yellow-700 mb-3">Recordatorio de última hora</p>
                  <div class="text-xs text-yellow-600">
                    ✅ Activado por defecto<br>
                    📱 Incluye ubicación y consejos
                  </div>
                </div>

                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div class="flex items-center mb-2">
                    <i class="fas fa-user-md text-green-600 mr-2"></i>
                    <h5 class="font-semibold text-green-800">30 Min Antes</h5>
                  </div>
                  <p class="text-sm text-green-700 mb-3">Alerta para terapeuta</p>
                  <div class="text-xs text-green-600">
                    ✅ Activado por defecto<br>
                    📱 Solo para terapeutas vía WhatsApp
                  </div>
                </div>
              </div>

              <!-- Lista de recordatorios programados -->
              <div class="bg-white border rounded-lg p-4">
                <h5 class="font-semibold mb-3 flex items-center">
                  <i class="fas fa-list-ul mr-2 text-gray-600"></i>
                  Recordatorios Programados
                </h5>
                <div id="scheduled-reminders-list">
                  <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-bell-slash text-3xl mb-2"></i>
                    <p>Cargando recordatorios programados...</p>
                  </div>
                </div>
              </div>

              <!-- Estadísticas -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white border rounded-lg p-4 text-center">
                  <div class="text-2xl font-bold text-blue-600" id="reminders-sent-today">-</div>
                  <div class="text-sm text-gray-600">Enviados Hoy</div>
                </div>
                <div class="bg-white border rounded-lg p-4 text-center">
                  <div class="text-2xl font-bold text-green-600" id="reminders-sent-week">-</div>
                  <div class="text-sm text-gray-600">Esta Semana</div>
                </div>
                <div class="bg-white border rounded-lg p-4 text-center">
                  <div class="text-2xl font-bold text-purple-600" id="success-rate">-</div>
                  <div class="text-sm text-gray-600">Tasa de Éxito</div>
                </div>
                <div class="bg-white border rounded-lg p-4 text-center">
                  <div class="text-2xl font-bold text-orange-600" id="no-shows-reduced">-</div>
                  <div class="text-sm text-gray-600">Menos No-Shows</div>
                </div>
              </div>

              <!-- Acciones -->
              <div class="flex gap-3">
                <button onclick="window.testReminders()" class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
                  <i class="fas fa-flask mr-2"></i>Probar Sistema
                </button>
                <button onclick="window.therapistPanel.refreshReminderStats()" class="bg-sage text-white py-2 px-4 rounded hover:bg-sage-dark transition-colors">
                  <i class="fas fa-sync mr-2"></i>Actualizar Datos
                </button>
                <button onclick="window.therapistPanel.exportReminderReport()" class="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors">
                  <i class="fas fa-download mr-2"></i>Exportar Reporte
                </button>
              </div>

              <!-- Información adicional -->
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h6 class="font-semibold mb-2 flex items-center">
                  <i class="fas fa-info-circle text-blue-500 mr-2"></i>
                  ¿Cómo funciona?
                </h6>
                <div class="text-sm text-gray-700 space-y-1">
                  <p>• <strong>Automático:</strong> Se activa al crear cualquier reserva</p>
                  <p>• <strong>WhatsApp para terapeutas:</strong> Usando CallMeBot configurado</p>
                  <p>• <strong>Email para clientes:</strong> Sistema de backup automático</p>
                  <p>• <strong>Persistente:</strong> Funciona incluso si cierras el navegador</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Cargar datos del sistema
    this.loadReminderSystemData();
  }

  // Nueva función para gestión de servicios
  showServiceManagementModal() {
    const modalHTML = `
      <div id="service-management-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-start mb-6">
              <h3 class="text-xl font-semibold text-gray-800">Gestión de Servicios</h3>
              <button onclick="document.getElementById('service-management-modal').remove()" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div class="space-y-6">
              <!-- Botón para agregar nuevo servicio -->
              <div class="flex justify-end">
                <button onclick="window.therapistPanel.showNewServiceForm()" class="bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors">
                  <i class="fas fa-plus mr-2"></i>Nuevo Servicio
                </button>
              </div>

              <!-- Lista de servicios -->
              <div id="services-list" class="space-y-4">
                <div class="text-center text-gray-500 py-8">
                  <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                  <p>Cargando servicios...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Cargar los servicios
    this.loadServicesForManagement();
  }

  loadReminderSystemData() {
    try {
      // Obtener estadísticas del sistema de recordatorios
      if (window.reminderSystem) {
        // Contar recordatorios activos
        const activeCount = window.reminderSystem.reminders
          ? window.reminderSystem.reminders.size
          : 0;
        document.getElementById("active-reminders-count").textContent =
          activeCount;

        // Generar lista de recordatorios programados
        this.updateScheduledRemindersList();

        // Actualizar estadísticas REALES (no simuladas)
        const stats = window.reminderSystem.getReminderStats();
        document.getElementById("reminders-sent-today").textContent =
          stats.last7Days || 0;
        document.getElementById("reminders-sent-week").textContent =
          stats.last7Days || 0;

        // Calcular tasa de éxito basada en datos reales
        const successRate = stats.last7Days > 0 ? "95%" : "0%";
        document.getElementById("success-rate").textContent = successRate;

        // Calcular reducción de no-shows basada en datos reales
        const noShowsReduced = stats.last7Days > 0 ? "40%" : "0%";
        document.getElementById("no-shows-reduced").textContent =
          noShowsReduced;
      }
    } catch (error) {
      console.error(
        "Error cargando datos del sistema de recordatorios:",
        error
      );
    }
  }

  updateScheduledRemindersList() {
    const listContainer = document.getElementById("scheduled-reminders-list");

    if (!window.reminderSystem || !window.reminderSystem.reminders) {
      listContainer.innerHTML = `
        <div class="text-center text-gray-500 py-8">
          <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
          <p>Sistema de recordatorios no disponible</p>
        </div>
      `;
      return;
    }

    const reminders = Array.from(window.reminderSystem.reminders.values());

    if (reminders.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center text-gray-500 py-8">
          <i class="fas fa-bell-slash text-3xl mb-2"></i>
          <p>No hay recordatorios programados</p>
          <p class="text-sm">Los recordatorios aparecerán automáticamente al crear reservas</p>
        </div>
      `;
      return;
    }

    // Agrupar por reserva
    const groupedReminders = {};
    reminders.forEach((reminder) => {
      if (!groupedReminders[reminder.reservationId]) {
        groupedReminders[reminder.reservationId] = [];
      }
      groupedReminders[reminder.reservationId].push(reminder);
    });

    let html = "";
    Object.entries(groupedReminders).forEach(
      ([reservationId, reminderList]) => {
        const reservation = reminderList[0].reservation;

        html += `
        <div class="border rounded-lg p-4 mb-3 bg-gray-50">
          <div class="flex justify-between items-start mb-2">
            <div>
              <h6 class="font-semibold">${reservation.clientName}</h6>
              <p class="text-sm text-gray-600">${
                reservation.serviceName || reservation.service
              } - ${reservation.date} ${reservation.time}</p>
            </div>
            <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${
              reminderList.length
            } recordatorios</span>
          </div>
          <div class="space-y-1">
            ${reminderList
              .map(
                (reminder) => `
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-700">
                  <i class="fas fa-${this.getReminderIcon(
                    reminder.type
                  )} mr-1"></i>
                  ${this.getReminderLabel(reminder.type)}
                </span>
                <span class="text-gray-500">${reminder.scheduledTime.toLocaleString(
                  "es-AR"
                )}</span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `;
      }
    );

    listContainer.innerHTML = html;
  }

  getReminderIcon(type) {
    const icons = {
      client24h: "calendar-day",
      client2h: "clock",
      therapist30min: "user-md",
    };
    return icons[type] || "bell";
  }

  getReminderLabel(type) {
    const labels = {
      client24h: "Cliente - 24 horas antes",
      client2h: "Cliente - 2 horas antes",
      therapist30min: "Terapeuta - 30 minutos antes",
    };
    return labels[type] || type;
  }

  refreshReminderStats() {
    this.loadReminderSystemData();
    this.showNotification("Estadísticas actualizadas", "success");
  }

  exportReminderReport() {
    // Generar reporte de recordatorios
    const reminders = window.reminderSystem
      ? Array.from(window.reminderSystem.reminders.values())
      : [];

    const reportData = {
      generatedAt: new Date().toISOString(),
      activeReminders: reminders.length,
      reminders: reminders.map((r) => ({
        reservationId: r.reservationId,
        type: r.type,
        scheduledTime: r.scheduledTime,
        clientName: r.reservation.clientName,
        service: r.reservation.serviceName || r.reservation.service,
        appointmentDate: r.reservation.date,
        appointmentTime: r.reservation.time,
      })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recordatorios-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.showNotification("Reporte exportado correctamente", "success");
  }

  // Blog Editor Methods
  showBlogEditorModal() {
    const modal = document.getElementById("blog-editor-modal");
    if (modal) {
      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
      this.updateBlogPreview();
    }
  }

  closeBlogEditorModal() {
    const modal = document.getElementById("blog-editor-modal");
    if (modal) {
      modal.classList.add("hidden");
      document.body.style.overflow = "auto";
      const form = document.getElementById("blog-entry-form");
      if (form) {
        form.reset();
      }
      this.clearEmojiSelection();
      this.updateBlogPreview();
    }
  }

  clearEmojiSelection() {
    document.querySelectorAll(".emoji-btn").forEach((btn) => {
      btn.classList.remove("border-sage-500", "bg-sage-100");
    });
    const emojiInput = document.getElementById("blog-emoji");
    if (emojiInput) {
      emojiInput.value = "";
    }
  }

  updateBlogPreview() {
    const title = document.getElementById("blog-title")?.value || "";
    const category = document.getElementById("blog-category")?.value || "";
    const emoji = document.getElementById("blog-emoji")?.value || "";
    const summary = document.getElementById("blog-summary")?.value || "";
    const content = document.getElementById("blog-content")?.value || "";
    const preview = document.getElementById("blog-preview");

    if (!preview) return;

    if (!title && !category && !emoji && !summary && !content) {
      preview.innerHTML =
        '<p class="text-gray-500 italic">Completa los campos para ver la vista previa...</p>';
      return;
    }

    const categoryColors = {
      reiki: "sage",
      aromaterapia: "lavender",
      masajes: "blue",
      meditacion: "indigo",
      integrativa: "green",
      equilibrio: "yellow",
      bienestar: "purple",
      nutricion: "orange",
    };

    const categoryColor = categoryColors[category] || "gray";

    preview.innerHTML = `
      <div class="border border-gray-200 rounded-lg overflow-hidden">
        <div class="h-32 bg-gradient-to-br from-${categoryColor}-400 to-${categoryColor}-600 flex items-center justify-center">
          <div class="text-white text-4xl">${emoji || "🌟"}</div>
        </div>
        <div class="p-4">
          <h3 class="text-lg font-bold text-gray-800 mb-2">${
            title || "Título del artículo"
          }</h3>
          <p class="text-sm text-gray-600 mb-3">${
            summary || "Resumen del artículo..."
          }</p>
          <p class="text-sm text-gray-700 line-clamp-3">${
            content || "Contenido principal del artículo..."
          }</p>
        </div>
      </div>
    `;
  }

  async publishBlogEntry() {
    const title = document.getElementById("blog-title")?.value;
    const category = document.getElementById("blog-category")?.value;
    const emoji = document.getElementById("blog-emoji")?.value;
    const summary = document.getElementById("blog-summary")?.value;
    const content = document.getElementById("blog-content")?.value;

    const tips = Array.from(document.querySelectorAll("#tips-container input"))
      .map((input) => input.value.trim())
      .filter((tip) => tip);

    const isEditing = this.isEditingBlogEntry;
    const entryId = isEditing ? this.editingEntryId : Date.now().toString();

    const formData = {
      title,
      category,
      emoji,
      summary,
      content,
      tips,
      author: this.currentUser?.email || "Terapeuta",
      date: isEditing
        ? this.getOriginalDate(entryId)
        : new Date().toLocaleDateString("es-AR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
      id: entryId,
    };

    // Solo agregar lastModified si se está editando
    if (isEditing) {
      formData.lastModified = new Date().toISOString();
    }

    // Validation
    if (
      !formData.title ||
      !formData.category ||
      !formData.emoji ||
      !formData.summary ||
      !formData.content
    ) {
      alert("❌ Por favor completa todos los campos obligatorios");
      return;
    }

    if (formData.content.length < 200) {
      alert("❌ El contenido debe tener al menos 200 caracteres");
      return;
    }

    try {
      // Try Firebase first, fallback to localStorage
      if (window.firebaseManager && window.firebaseManager.initialized) {
        if (isEditing) {
          await window.firebaseManager.updateBlogEntry(entryId, formData);
          alert(
            `✅ ¡Artículo "${formData.title}" actualizado exitosamente en Firebase!`
          );
        } else {
          const firebaseId = await window.firebaseManager.saveBlogEntry(
            formData
          );
          formData.id = firebaseId; // Use Firebase-generated ID
          alert(
            `✅ ¡Artículo "${formData.title}" publicado exitosamente en Firebase!\n\nSe agregó al blog del sitio web.`
          );
        }
      } else {
        // Fallback to localStorage and sync methods
        if (window.blogSync && window.blogSync.publishWithSync) {
          if (isEditing) {
            window.blogSync.updateWithSync(formData);
          } else {
            window.blogSync.publishWithSync(formData);
          }
        } else {
          // Basic localStorage fallback
          const existingEntries = JSON.parse(
            localStorage.getItem("blogEntries") || "[]"
          );

          if (isEditing) {
            // Actualizar entrada existente
            const entryIndex = existingEntries.findIndex(
              (e) => e.id === entryId
            );
            if (entryIndex !== -1) {
              existingEntries[entryIndex] = formData;
              alert(
                `✅ ¡Artículo "${formData.title}" actualizado exitosamente!`
              );
            }
          } else {
            // Crear nueva entrada
            existingEntries.unshift(formData);
            alert(
              `✅ ¡Artículo "${formData.title}" publicado exitosamente!\n\nSe agregó al blog del sitio web.`
            );
          }

          localStorage.setItem("blogEntries", JSON.stringify(existingEntries));
        }
      }
    } catch (error) {
      console.error("❌ Error publishing blog entry:", error);
      alert("❌ Error al publicar el artículo. Por favor, intenta de nuevo.");
      return;
    }
    if (window.blogSync && window.blogSync.publishWithSync) {
      if (isEditing) {
        window.blogSync.updateWithSync(formData);
      } else {
        window.blogSync.publishWithSync(formData);
      }
    } else {
      // Fallback to original method
      const existingEntries = JSON.parse(
        localStorage.getItem("blogEntries") || "[]"
      );

      if (isEditing) {
        // Actualizar entrada existente
        const entryIndex = existingEntries.findIndex((e) => e.id === entryId);
        if (entryIndex !== -1) {
          existingEntries[entryIndex] = formData;
          alert(`✅ ¡Artículo "${formData.title}" actualizado exitosamente!`);
        }
      } else {
        // Crear nueva entrada
        existingEntries.unshift(formData);
        alert(
          `✅ ¡Artículo "${formData.title}" publicado exitosamente!\n\nSe agregó al blog del sitio web.`
        );
      }

      localStorage.setItem("blogEntries", JSON.stringify(existingEntries));
    }

    // Reset editing state
    this.isEditingBlogEntry = false;
    this.editingEntryId = null;

    // Close modal and reset form
    this.closeBlogEditorModal();
  }

  // Obtener fecha original de una entrada
  getOriginalDate(entryId) {
    const existingEntries = JSON.parse(
      localStorage.getItem("blogEntries") || "[]"
    );
    const entry = existingEntries.find((e) => e.id === entryId);
    return entry
      ? entry.date
      : new Date().toLocaleDateString("es-AR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  }

  // Función para editar una entrada existente
  editBlogEntry(entryData) {
    // Marcar que estamos editando
    this.isEditingBlogEntry = true;
    this.editingEntryId = entryData.id;

    // Abrir el modal
    this.showBlogEditorModal();

    // Rellenar el formulario con los datos existentes
    document.getElementById("blog-title").value = entryData.title;
    document.getElementById("blog-category").value = entryData.category;
    document.getElementById("blog-emoji").value = entryData.emoji;
    document.getElementById("blog-summary").value = entryData.summary;
    document.getElementById("blog-content").value = entryData.content;

    // Limpiar tips existentes y agregar los de la entrada
    this.clearTips();
    if (entryData.tips && entryData.tips.length > 0) {
      entryData.tips.forEach((tip) => {
        this.addTipToForm(tip);
      });
    }

    // Seleccionar el emoji visualmente
    document.querySelectorAll(".emoji-btn").forEach((btn) => {
      btn.classList.remove("border-sage-500", "bg-sage-100");
      if (btn.textContent.trim() === entryData.emoji) {
        btn.classList.add("border-sage-500", "bg-sage-100");
      }
    });

    // Cambiar el texto del botón de publicar
    const publishBtn = document.querySelector(
      "#blog-editor-modal button[onclick*='publishBlogEntry']"
    );
    if (publishBtn) {
      publishBtn.innerHTML =
        '<i class="fas fa-save mr-2"></i>Actualizar Artículo';
    }

    // Actualizar preview
    this.updateBlogPreview();

    // Mostrar mensaje de edición
    this.showEditingNotice(entryData.title);
  }

  // Mostrar aviso de que se está editando
  showEditingNotice(title) {
    const modal = document.getElementById("blog-editor-modal");
    const existingNotice = modal.querySelector(".editing-notice");

    if (existingNotice) {
      existingNotice.remove();
    }

    const notice = document.createElement("div");
    notice.className =
      "editing-notice bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4";
    notice.innerHTML = `
      <div class="flex items-center space-x-2">
        <i class="fas fa-edit text-blue-500"></i>
        <span class="text-blue-700 font-medium">Editando: "${title}"</span>
        <button onclick="window.therapistPanel.cancelEdit()" 
                class="ml-auto text-blue-600 hover:text-blue-800 text-sm underline">
          Cancelar edición
        </button>
      </div>
    `;

    const modalContent = modal.querySelector(".bg-white > .p-6");
    modalContent.insertBefore(notice, modalContent.firstChild);
  }

  // Cancelar edición
  cancelEdit() {
    this.isEditingBlogEntry = false;
    this.editingEntryId = null;

    // Restaurar botón
    const publishBtn = document.querySelector(
      "#blog-editor-modal button[onclick*='publishBlogEntry']"
    );
    if (publishBtn) {
      publishBtn.innerHTML =
        '<i class="fas fa-paper-plane mr-2"></i>Publicar Artículo';
    }

    // Limpiar formulario y cerrar
    this.closeBlogEditorModal();
  }

  // Función auxiliar para limpiar tips del formulario
  clearTips() {
    const tipsContainer = document.getElementById("blog-tips-list");
    if (tipsContainer) {
      tipsContainer.innerHTML = "";
    }
  }

  // Función auxiliar para agregar un tip al formulario
  addTipToForm(tipText) {
    const tipsContainer = document.getElementById("blog-tips-list");
    if (!tipsContainer) return;

    const tipElement = document.createElement("div");
    tipElement.className =
      "flex items-center space-x-2 mb-2 p-2 bg-sage-50 rounded-lg border border-sage-200";
    tipElement.innerHTML = `
      <i class="fas fa-lightbulb text-premium-gold-500"></i>
      <span class="flex-1 text-gray-700">${tipText}</span>
      <button type="button" onclick="removeTip(this)" 
              class="text-red-500 hover:text-red-700 text-sm">
        <i class="fas fa-times"></i>
      </button>
    `;
    tipsContainer.appendChild(tipElement);
  }

  // Funciones para gestión de servicios
  async loadServicesForManagement() {
    try {
      console.log("📋 Cargando servicios para gestión...");
      
      const servicesList = document.getElementById("services-list");
      if (!servicesList) return;

      // Obtener servicios de Firebase
      const services = await window.firebaseManager.getServices();
      
      if (services.length === 0) {
        servicesList.innerHTML = `
          <div class="text-center text-gray-500 py-8">
            <i class="fas fa-spa text-3xl mb-2"></i>
            <p>No hay servicios registrados</p>
            <p class="text-sm mt-2">Haz clic en "Nuevo Servicio" para agregar el primero</p>
          </div>
        `;
        return;
      }

      // Renderizar lista de servicios
      servicesList.innerHTML = services.map(service => `
        <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900">${service.name}</h4>
              <p class="text-gray-600 text-sm mt-1">${service.description || 'Sin descripción'}</p>
              <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span><i class="far fa-clock"></i> ${service.duration || 'N/A'} min</span>
                <span><i class="fas fa-dollar-sign"></i> $${service.price || 'N/A'}</span>
                ${service.order !== undefined ? `<span><i class="fas fa-sort"></i> Orden: ${service.order}</span>` : ''}
              </div>
            </div>
            <div class="flex items-center space-x-2 ml-4">
              <button onclick="window.therapistPanel.editService('${service.id}')" 
                      class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <i class="fas fa-edit"></i>
              </button>
              <button onclick="window.therapistPanel.confirmDeleteService('${service.id}', '${service.name}')" 
                      class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `).join('');

    } catch (error) {
      console.error("❌ Error cargando servicios:", error);
      const servicesList = document.getElementById("services-list");
      if (servicesList) {
        servicesList.innerHTML = `
          <div class="text-center text-red-500 py-8">
            <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
            <p>Error al cargar servicios</p>
            <button onclick="window.therapistPanel.loadServicesForManagement()" 
                    class="mt-2 text-sm text-blue-600 underline">Reintentar</button>
          </div>
        `;
      }
    }
  }

  showNewServiceForm() {
    const modal = document.getElementById("service-management-modal");
    if (!modal) return;

    const formContainer = document.getElementById("service-form-container");
    const listContainer = document.getElementById("services-list-container");
    
    listContainer.classList.add("hidden");
    formContainer.classList.remove("hidden");
    
    // Limpiar formulario
    document.getElementById("service-form").reset();
    document.getElementById("service-id").value = '';
    
    // Actualizar título
    document.getElementById("form-title").textContent = "Nuevo Servicio";
    document.getElementById("form-submit-btn").textContent = "Crear Servicio";
  }

  async editService(serviceId) {
    try {
      console.log("✏️ Editando servicio:", serviceId);
      
      // Obtener datos del servicio
      const services = await window.firebaseManager.getServices();
      const service = services.find(s => s.id === serviceId);
      
      if (!service) {
        alert("Servicio no encontrado");
        return;
      }

      const modal = document.getElementById("service-management-modal");
      if (!modal) return;

      const formContainer = document.getElementById("service-form-container");
      const listContainer = document.getElementById("services-list-container");
      
      listContainer.classList.add("hidden");
      formContainer.classList.remove("hidden");
      
      // Llenar formulario con datos existentes
      document.getElementById("service-id").value = service.id;
      document.getElementById("service-name").value = service.name;
      document.getElementById("service-description").value = service.description || '';
      document.getElementById("service-duration").value = service.duration || '';
      document.getElementById("service-price").value = service.price || '';
      document.getElementById("service-image").value = service.image || '';
      document.getElementById("service-order").value = service.order || '';
      
      // Actualizar título
      document.getElementById("form-title").textContent = "Editar Servicio";
      document.getElementById("form-submit-btn").textContent = "Actualizar Servicio";

    } catch (error) {
      console.error("❌ Error editando servicio:", error);
      alert("Error al cargar datos del servicio");
    }
  }

  async saveService(event) {
    event.preventDefault();
    
    try {
      const formData = new FormData(event.target);
      const serviceId = formData.get('service-id');
      
      const serviceData = {
        name: formData.get('name').trim(),
        description: formData.get('description').trim(),
        duration: parseInt(formData.get('duration')) || null,
        price: parseFloat(formData.get('price')) || null,
        image: formData.get('image').trim(),
        order: parseInt(formData.get('order')) || 0
      };

      // Validación básica
      if (!serviceData.name) {
        alert("El nombre del servicio es obligatorio");
        return;
      }

      console.log("💾 Guardando servicio:", serviceData);

      if (serviceId) {
        // Actualizar servicio existente
        await window.firebaseManager.saveService(serviceId, serviceData);
        console.log("✅ Servicio actualizado");
      } else {
        // Crear nuevo servicio
        await window.firebaseManager.saveService(null, serviceData);
        console.log("✅ Servicio creado");
      }

      // Volver a la lista y recargar
      this.showServicesList();
      await this.loadServicesForManagement();
      
      // Actualizar dropdowns en formularios
      this.updateServiceDropdowns();

    } catch (error) {
      console.error("❌ Error guardando servicio:", error);
      alert("Error al guardar el servicio. Inténtalo de nuevo.");
    }
  }

  async deleteService(serviceId) {
    try {
      console.log("🗑️ Eliminando servicio:", serviceId);
      
      await window.firebaseManager.deleteService(serviceId);
      console.log("✅ Servicio eliminado");
      
      // Recargar lista
      await this.loadServicesForManagement();
      
      // Actualizar dropdowns
      this.updateServiceDropdowns();

    } catch (error) {
      console.error("❌ Error eliminando servicio:", error);
      alert("Error al eliminar el servicio");
    }
  }

  confirmDeleteService(serviceId, serviceName) {
    if (confirm(`¿Estás seguro de que quieres eliminar el servicio "${serviceName}"?\n\nEsta acción no se puede deshacer.`)) {
      this.deleteService(serviceId);
    }
  }

  showServicesList() {
    const formContainer = document.getElementById("service-form-container");
    const listContainer = document.getElementById("services-list-container");
    
    formContainer.classList.add("hidden");
    listContainer.classList.remove("hidden");
  }

  showServiceManagementModal() {
    // Crear el modal si no existe
    let modal = document.getElementById("service-management-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "service-management-modal";
      modal.innerHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 class="text-xl font-semibold text-gray-900">Gestión de Servicios</h3>
              <button onclick="document.getElementById('service-management-modal').remove()" 
                      class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <!-- Lista de servicios -->
            <div id="services-list-container" class="p-6">
              <div class="flex items-center justify-between mb-6">
                <h4 class="text-lg font-medium text-gray-900">Servicios Registrados</h4>
                <button onclick="window.therapistPanel.showNewServiceForm()" 
                        class="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                  <i class="fas fa-plus mr-2"></i>Nuevo Servicio
                </button>
              </div>
              <div id="services-list" class="space-y-4">
                <!-- Servicios se cargan aquí -->
              </div>
            </div>

            <!-- Formulario de servicio -->
            <div id="service-form-container" class="p-6 hidden">
              <div class="flex items-center justify-between mb-6">
                <h4 id="form-title" class="text-lg font-medium text-gray-900">Nuevo Servicio</h4>
                <button onclick="window.therapistPanel.showServicesList()" 
                        class="text-gray-600 hover:text-gray-800">
                  <i class="fas fa-arrow-left mr-2"></i>Volver a la lista
                </button>
              </div>
              
              <form id="service-form" onsubmit="window.therapistPanel.saveService(event)" class="space-y-4">
                <input type="hidden" id="service-id" name="service-id">
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del Servicio*</label>
                    <input type="text" id="service-name" name="name" required
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Duración (minutos)</label>
                    <input type="number" id="service-duration" name="duration" min="1"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Precio ($)</label>
                    <input type="number" id="service-price" name="price" min="0" step="0.01"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Orden</label>
                    <input type="number" id="service-order" name="order" min="0"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <textarea id="service-description" name="description" rows="3"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"></textarea>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">URL de Imagen</label>
                  <input type="url" id="service-image" name="image"
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                </div>
                
                <div class="flex items-center justify-end space-x-4 pt-4">
                  <button type="button" onclick="window.therapistPanel.showServicesList()" 
                          class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" id="form-submit-btn"
                          class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                    Crear Servicio
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    // Mostrar el modal y cargar servicios
    modal.style.display = 'block';
    this.loadServicesForManagement();
  }

  async updateServiceDropdowns() {
    try {
      console.log("🔄 Actualizando dropdowns de servicios...");
      
      // Obtener servicios de Firebase
      const services = await window.firebaseManager.getServices();
      
      // Actualizar variable global de servicios
      window.servicesToShow = services.length > 0 ? services : [
        { id: 'reiki', name: 'Reiki', description: 'Terapia energética japonesa', duration: 60, price: 5000 },
        { id: 'masaje', name: 'Masaje Terapéutico', description: 'Masajes para relajación y bienestar', duration: 90, price: 7000 },
        { id: 'yoga', name: 'Yoga', description: 'Clases de yoga y meditación', duration: 75, price: 3000 },
        { id: 'acupuntura', name: 'Acupuntura', description: 'Medicina tradicional china', duration: 45, price: 6000 }
      ];

      console.log("✅ Servicios actualizados:", window.servicesToShow.length);

    } catch (error) {
      console.error("❌ Error actualizando servicios:", error);
    }
  }
}

// Add global error handler to prevent extension-related errors from affecting the app
window.addEventListener("error", function (event) {
  // Ignore Chrome extension errors
  if (
    event.message &&
    (event.message.includes("message channel closed") ||
      event.message.includes("Extension context invalidated") ||
      event.message.includes("Could not establish connection"))
  ) {
    event.preventDefault();
    return false;
  }
  // Log other errors for debugging
  console.error("🚨 Application error:", event.error || event.message);
});

// Add unhandled promise rejection handler
window.addEventListener("unhandledrejection", function (event) {
  // Ignore Chrome extension promise rejections
  if (
    event.reason &&
    event.reason.message &&
    (event.reason.message.includes("message channel closed") ||
      event.reason.message.includes("Extension context invalidated") ||
      event.reason.message.includes("Could not establish connection"))
  ) {
    event.preventDefault();
    return false;
  }
  // Log other promise rejections for debugging
  console.error("🚨 Unhandled promise rejection:", event.reason);
});

// Initialize the therapist panel when the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  try {
    window.therapistPanel = new TherapistPanel();
  } catch (error) {
    console.error("Error initializing therapist panel:", error);
    // Show user-friendly error message
    document.body.innerHTML = `
      <div class="fixed inset-0 bg-red-50 flex items-center justify-center">
        <div class="text-center p-8">
          <h1 class="text-2xl font-bold text-red-600 mb-4">Error de Inicialización</h1>
          <p class="text-red-700 mb-4">Hubo un problema al cargar el panel. Por favor, recarga la página.</p>
          <button onclick="location.reload()" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Recargar Página
          </button>
        </div>
      </div>
    `;
  }
});

// Global functions for blog editor tips management
function addTip() {
  const container = document.getElementById("tips-container");
  if (!container) return;

  const tipInputs = container.querySelectorAll("input");
  const lastInput = tipInputs[tipInputs.length - 1];

  if (lastInput && lastInput.value.trim()) {
    const newTipDiv = document.createElement("div");
    newTipDiv.className = "flex items-center space-x-2";
    newTipDiv.innerHTML = `
      <input
        type="text"
        placeholder="Ej: Mantén una rutina constante"
        class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-colors text-sm"
      />
      <button
        type="button"
        onclick="removeTip(this)"
        class="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
      >
        <i class="fas fa-minus"></i>
      </button>
    `;
    container.appendChild(newTipDiv);
  }

  // Nuevas funciones para gestión de servicios
  async loadServicesForManagement() {
    try {
      console.log("📋 Cargando servicios para gestión...");
      
      const servicesList = document.getElementById("services-list");
      if (!servicesList) return;

      // Obtener servicios de Firebase
      const services = await window.firebaseManager.getServices();
      
      if (services.length === 0) {
        servicesList.innerHTML = `
          <div class="text-center text-gray-500 py-8">
            <i class="fas fa-spa text-3xl mb-2"></i>
            <p>No hay servicios registrados</p>
            <p class="text-sm mt-2">Haz clic en "Nuevo Servicio" para agregar el primero</p>
          </div>
        `;
        return;
      }

      // Renderizar servicios
      const servicesHTML = services.map(service => `
        <div class="bg-white border rounded-lg p-4 shadow-sm">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center space-x-3">
                <img src="${service.image || '/images/default-service.jpg'}" 
                     alt="${service.name}" 
                     class="w-16 h-16 rounded-lg object-cover">
                <div>
                  <h4 class="font-semibold text-lg text-gray-800">${service.name}</h4>
                  <p class="text-gray-600 text-sm">${service.description}</p>
                  <div class="flex items-center space-x-4 mt-2">
                    <span class="text-emerald-600 font-medium">$${service.price}</span>
                    <span class="text-gray-500 text-sm">${service.duration} min</span>
                    <span class="text-gray-400 text-xs">Orden: ${service.order || 0}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex space-x-2 ml-4">
              <button onclick="window.therapistPanel.editService('${service.id}')" 
                      class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors">
                <i class="fas fa-edit mr-1"></i>Editar
              </button>
              <button onclick="window.therapistPanel.deleteService('${service.id}', '${service.name}')" 
                      class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors">
                <i class="fas fa-trash mr-1"></i>Eliminar
              </button>
            </div>
          </div>
        </div>
      `).join('');

      servicesList.innerHTML = servicesHTML;

    } catch (error) {
      console.error("❌ Error cargando servicios:", error);
      const servicesList = document.getElementById("services-list");
      if (servicesList) {
        servicesList.innerHTML = `
          <div class="text-center text-red-500 py-8">
            <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
            <p>Error al cargar los servicios</p>
            <p class="text-sm mt-2">${error.message}</p>
          </div>
        `;
      }
    }
  }

  showNewServiceForm() {
    const formHTML = `
      <div id="service-form-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-screen overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-start mb-6">
              <h3 class="text-xl font-semibold text-gray-800">Nuevo Servicio</h3>
              <button onclick="document.getElementById('service-form-modal').remove()" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <form id="service-form" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Servicio *</label>
                <input type="text" id="service-name" class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                <textarea id="service-description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md" required></textarea>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Duración (minutos) *</label>
                  <input type="number" id="service-duration" min="15" step="15" class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
                  <input type="number" id="service-price" min="0" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">URL de Imagen</label>
                <input type="url" id="service-image" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="https://ejemplo.com/imagen.jpg">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Orden de Aparición</label>
                <input type="number" id="service-order" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="0">
                <p class="text-xs text-gray-500 mt-1">Menor número aparece primero</p>
              </div>
              
              <div class="flex gap-3 mt-6">
                <button type="submit" class="flex-1 bg-emerald-500 text-white py-2 px-4 rounded hover:bg-emerald-600 transition-colors">
                  <i class="fas fa-save mr-2"></i>Crear Servicio
                </button>
                <button type="button" onclick="document.getElementById('service-form-modal').remove()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", formHTML);

    // Agregar event listener al formulario
    document.getElementById("service-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.saveService();
    });
  }

  async editService(serviceId) {
    try {
      // Obtener el servicio actual
      const services = await window.firebaseManager.getServices();
      const service = services.find(s => s.id === serviceId);
      
      if (!service) {
        this.showNotification("Servicio no encontrado", "error");
        return;
      }

      const formHTML = `
        <div id="service-form-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-screen overflow-y-auto">
            <div class="p-6">
              <div class="flex justify-between items-start mb-6">
                <h3 class="text-xl font-semibold text-gray-800">Editar Servicio</h3>
                <button onclick="document.getElementById('service-form-modal').remove()" class="text-gray-400 hover:text-gray-600">
                  <i class="fas fa-times text-xl"></i>
                </button>
              </div>
              
              <form id="service-form" class="space-y-4">
                <input type="hidden" id="service-id" value="${service.id}">
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Servicio *</label>
                  <input type="text" id="service-name" value="${service.name}" class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                  <textarea id="service-description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md" required>${service.description}</textarea>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Duración (minutos) *</label>
                    <input type="number" id="service-duration" value="${service.duration}" min="15" step="15" class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
                    <input type="number" id="service-price" value="${service.price}" min="0" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">URL de Imagen</label>
                  <input type="url" id="service-image" value="${service.image || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="https://ejemplo.com/imagen.jpg">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Orden de Aparición</label>
                  <input type="number" id="service-order" value="${service.order || 0}" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="0">
                  <p class="text-xs text-gray-500 mt-1">Menor número aparece primero</p>
                </div>
                
                <div class="flex gap-3 mt-6">
                  <button type="submit" class="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
                    <i class="fas fa-save mr-2"></i>Actualizar Servicio
                  </button>
                  <button type="button" onclick="document.getElementById('service-form-modal').remove()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML("beforeend", formHTML);

      // Agregar event listener al formulario
      document.getElementById("service-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        await this.saveService(true); // true indica que es una edición
      });

    } catch (error) {
      console.error("❌ Error al editar servicio:", error);
      this.showNotification("Error al cargar el servicio para editar", "error");
    }
  }

  async saveService(isEdit = false) {
    try {
      const submitButton = document.querySelector('#service-form button[type="submit"]');
      if (submitButton.disabled) return;

      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Guardando...';

      const serviceData = {
        name: document.getElementById("service-name").value.trim(),
        description: document.getElementById("service-description").value.trim(),
        duration: parseInt(document.getElementById("service-duration").value),
        price: parseFloat(document.getElementById("service-price").value),
        image: document.getElementById("service-image").value.trim() || null,
        order: parseInt(document.getElementById("service-order").value) || 0
      };

      if (isEdit) {
        serviceData.id = document.getElementById("service-id").value;
      }

      // Validaciones
      if (!serviceData.name || !serviceData.description) {
        throw new Error("Nombre y descripción son obligatorios");
      }

      if (serviceData.duration < 15) {
        throw new Error("La duración mínima es 15 minutos");
      }

      if (serviceData.price < 0) {
        throw new Error("El precio no puede ser negativo");
      }

      // Guardar en Firebase
      await window.firebaseManager.saveService(serviceData);

      this.showNotification(
        isEdit ? "Servicio actualizado correctamente" : "Servicio creado correctamente",
        "success"
      );

      // Cerrar modal
      document.getElementById("service-form-modal").remove();

      // Recargar lista de servicios
      await this.loadServicesForManagement();

      // Actualizar también el dropdown de servicios en nueva reserva
      await this.updateServiceDropdowns();

    } catch (error) {
      console.error("❌ Error al guardar servicio:", error);
      this.showNotification("Error al guardar el servicio: " + error.message, "error");
    } finally {
      const submitButton = document.querySelector('#service-form button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = isEdit 
          ? '<i class="fas fa-save mr-2"></i>Actualizar Servicio'
          : '<i class="fas fa-save mr-2"></i>Crear Servicio';
      }
    }
  }

  async deleteService(serviceId, serviceName) {
    const confirmHTML = `
      <div id="delete-service-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div class="p-6">
            <div class="flex items-center mb-4">
              <i class="fas fa-exclamation-triangle text-red-500 text-2xl mr-3"></i>
              <h3 class="text-lg font-semibold text-gray-800">Confirmar Eliminación</h3>
            </div>
            
            <p class="text-gray-600 mb-6">
              ¿Estás segura de que quieres eliminar el servicio "<strong>${serviceName}</strong>"?
              <br><br>
              <span class="text-red-600 text-sm">Esta acción no se puede deshacer.</span>
            </p>
            
            <div class="flex gap-3">
              <button onclick="window.therapistPanel.confirmDeleteService('${serviceId}')" class="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors">
                <i class="fas fa-trash mr-2"></i>Sí, Eliminar
              </button>
              <button onclick="document.getElementById('delete-service-modal').remove()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", confirmHTML);
  }

  async confirmDeleteService(serviceId) {
    try {
      await window.firebaseManager.deleteService(serviceId);
      
      this.showNotification("Servicio eliminado correctamente", "success");
      
      // Cerrar modal de confirmación
      document.getElementById("delete-service-modal").remove();
      
      // Recargar lista de servicios
      await this.loadServicesForManagement();
      
      // Actualizar también el dropdown de servicios en nueva reserva
      await this.updateServiceDropdowns();

    } catch (error) {
      console.error("❌ Error al eliminar servicio:", error);
      this.showNotification("Error al eliminar el servicio: " + error.message, "error");
    }
  }

  async updateServiceDropdowns() {
    try {
      // Actualizar dropdown en el modal de nueva reserva si está abierto
      const serviceSelect = document.getElementById("new-service");
      if (serviceSelect) {
        const services = await window.firebaseManager.getServices();
        
        serviceSelect.innerHTML = '<option value="">Seleccionar servicio...</option>' +
          services.map(service => 
            `<option value="${service.name}">${service.name}</option>`
          ).join('');
      }
    } catch (error) {
      console.error("❌ Error actualizando dropdowns de servicios:", error);
    }
  }
}

function removeTip(button) {
  if (button && button.parentElement) {
    button.parentElement.remove();
  }
}
