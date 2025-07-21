// Sistema de autenticación para terapeutas
// Este archivo maneja el login/logout y estado de autenticación

class TherapistAuth {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.init();
  }

  async init() {
    // Verificar si ya hay una sesión activa
    this.checkExistingSession();

    // Configurar listeners de autenticación de Firebase
    if (window.firebaseManager && window.firebaseManager.initialized) {
      this.setupFirebaseAuth();
    } else {
      // Esperar a que Firebase se inicialice
      window.addEventListener("firebaseReady", () => {
        this.setupFirebaseAuth();
      });
    }
  }

  setupFirebaseAuth() {
    window.firebaseManager.onAuthStateChanged((user) => {
      this.currentUser = user;
      this.isAuthenticated = !!user;

      window.secureLogger?.debug(
        "🔐 Auth state changed:",
        user ? "Usuario autenticado" : "Usuario desconectado"
      );

      // Actualizar UI
      this.updateUI();

      // Disparar evento personalizado
      const authEvent = new CustomEvent("therapistAuthChanged", {
        detail: { user, isAuthenticated: this.isAuthenticated },
      });
      window.dispatchEvent(authEvent);
    });
  }

  checkExistingSession() {
    // Verificar si hay datos de sesión guardados usando almacenamiento seguro
    let savedUser = null;

    try {
      // Intentar primero con almacenamiento seguro
      if (window.secureStorage) {
        savedUser = window.secureStorage.getSecureItem("therapist_session");
      }

      // Si no hay datos en almacenamiento seguro, intentar localStorage tradicional
      if (!savedUser) {
        const rawData = localStorage.getItem("therapist_session");
        if (rawData) {
          // Verificar si los datos están en formato JSON tradicional
          if (rawData.startsWith("{")) {
            savedUser = JSON.parse(rawData);
          } else {
            // Si no es JSON, podría ser datos cifrados antiguos, limpiar
            window.secureLogger?.warn(
              "🔄 Limpiando datos de sesión en formato no válido"
            );
            localStorage.removeItem("therapist_session");
            return;
          }
        }
      }

      if (savedUser) {
        this.currentUser = savedUser;
        this.isAuthenticated = true;
        this.updateUI();
        window.secureLogger?.info(
          "✅ Sesión de terapeuta restaurada exitosamente"
        );
      }
    } catch (error) {
      window.secureLogger?.error("Error loading saved session:", error.message);
      // Limpiar datos corruptos
      if (window.secureStorage) {
        window.secureStorage.removeItem("therapist_session");
      }
      localStorage.removeItem("therapist_session");
    }
  }

  async signIn(email, password) {
    try {
      if (!window.firebaseManager || !window.firebaseManager.initialized) {
        throw new Error("Firebase not initialized");
      }

      const user = await window.firebaseManager.signInTherapist(
        email,
        password
      );

      // Actualizar estado de la clase
      this.currentUser = user;
      this.isAuthenticated = true;

      // Guardar sesión localmente de forma segura
      const sessionData = {
        email: user.email,
        uid: user.uid,
      };

      if (window.secureStorage) {
        window.secureStorage.setSecureItem("therapist_session", sessionData);
      } else {
        // Fallback a localStorage tradicional
        localStorage.setItem("therapist_session", JSON.stringify(sessionData));
      }

      // Actualizar UI y disparar eventos
      this.updateUI();
      this.dispatchAuthEvent(true, user);

      console.log("✅ Therapist signed in successfully:", user.email);
      return { user }; // Devolver en formato compatible
    } catch (error) {
      console.error("❌ Sign in error:", error);
      throw error;
    }
  }

  async signOut() {
    try {
      if (window.firebaseManager && window.firebaseManager.initialized) {
        await window.firebaseManager.auth.signOut();
      }

      // Limpiar sesión local de forma segura
      if (window.secureStorage) {
        window.secureStorage.removeItem("therapist_session");
      }
      localStorage.removeItem("therapist_session");

      this.currentUser = null;
      this.isAuthenticated = false;
      this.updateUI();
      this.dispatchAuthEvent(false);

      window.secureLogger?.info("✅ Therapist signed out successfully");
    } catch (error) {
      window.secureLogger?.error("❌ Sign out error:", error.message);
      throw error;
    }
  }

  updateUI() {
    // Actualizar indicador de estado de autenticación
    const authStatus = document.getElementById("auth-status");
    const loginSection = document.getElementById("login-section");
    const mainContent = document.getElementById("main-content");

    if (authStatus) {
      if (this.isAuthenticated && this.currentUser) {
        authStatus.innerHTML = `
          <div class="flex items-center space-x-2 text-green-600">
            <i class="fas fa-user-check"></i>
            <span>Conectada como: ${this.currentUser.email}</span>
            <button onclick="therapistAuth.signOut()" class="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">
              Cerrar Sesión
            </button>
          </div>
        `;
      } else {
        authStatus.innerHTML = `
          <div class="flex items-center space-x-2 text-gray-500">
            <i class="fas fa-user-times"></i>
            <span>No autenticada</span>
          </div>
        `;
      }
    }

    // Mostrar/ocultar secciones según autenticación
    if (loginSection && mainContent) {
      if (this.isAuthenticated) {
        loginSection.style.display = "none";
        mainContent.style.display = "block";
      } else {
        loginSection.style.display = "block";
        mainContent.style.display = "none";
      }
    }
  }

  // Método para verificar si el usuario actual puede realizar acciones
  canPerformActions() {
    return this.isAuthenticated && this.currentUser;
  }

  // Método para disparar eventos de cambio de autenticación
  dispatchAuthEvent(isAuthenticated, user = null) {
    const event = new CustomEvent("therapistAuthChanged", {
      detail: {
        isAuthenticated: isAuthenticated,
        user: user
          ? {
              uid: user.uid,
              email: user.email,
              name: this.getTherapistNameByEmail(user.email),
            }
          : null,
      },
    });
    document.dispatchEvent(event);
    console.log(
      "🔐 Auth state changed:",
      isAuthenticated ? `Logged in as ${user?.email}` : "Logged out"
    );
  }

  // Método auxiliar para obtener el nombre de la terapeuta por email
  getTherapistNameByEmail(email) {
    const therapists = {
      "lorena@espacioshanti.com": "Lorena Murua Bosquero",
      "betsabe@espacioshanti.com": "Betsabé Murua Bosquero",
    };
    return therapists[email] || "Terapeuta";
  }

  // Obtener información del usuario actual
  getCurrentUser() {
    return this.currentUser;
  }
}

// Crear instancia global
window.therapistAuth = new TherapistAuth();
