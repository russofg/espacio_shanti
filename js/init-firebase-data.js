// Script para inicializar datos en Firebase
// Ejecuta este código en la consola del navegador en http://localhost:8000

async function initializeFirebaseData() {
  if (!window.firebaseManager || !window.firebaseManager.initialized) {
    console.error("❌ Firebase no está inicializado");
    return;
  }

  try {
    // Datos de servicios
    const services = [
      {
        id: "reiki",
        name: "Reiki",
        description:
          "Terapia energética que promueve la relajación y el equilibrio.",
        duration: 60,
        price: 5000,
        image: "",
        isActive: true,
        category: "energetica",
      },
      {
        id: "meditacion",
        name: "Meditación Guiada",
        description: "Sesiones de meditación para encontrar paz interior.",
        duration: 45,
        price: 3500,
        image: "",
        isActive: true,
        category: "mental",
      },
      {
        id: "masajes",
        name: "Masajes Terapéuticos",
        description: "Masajes relajantes para liberar tensiones.",
        duration: 90,
        price: 7000,
        image: "",
        isActive: true,
        category: "corporal",
      },
      {
        id: "aromaterapia",
        name: "Aromaterapia",
        description: "Terapia con aceites esenciales para el bienestar.",
        duration: 75,
        price: 6000,
        image: "",
        isActive: true,
        category: "holistico",
      },
    ];

    // Datos de terapeutas
    const therapists = [
      {
        id: "lorena",
        name: "Lorena Murua Bosquero",
        email: "lorena@espacioshanti.com",
        specialties: ["Reiki", "Meditación Guiada"],
        bio: "Especialista en terapias energéticas con más de 10 años de experiencia.",
        image: "",
        isActive: true,
      },
      {
        id: "betsabe",
        name: "Betsabé Murua Bosquero",
        email: "betsabe@espacioshanti.com",
        specialties: ["Masajes Terapéuticos", "Aromaterapia"],
        bio: "Terapeuta holística especializada en técnicas de relajación y bienestar.",
        image: "",
        isActive: true,
      },
    ];

    // Importar Firestore functions
    const { collection, doc, setDoc } = await import(
      "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
    );

    // Crear servicios
    for (const service of services) {
      const docRef = doc(window.firebaseManager.db, "services", service.id);
      await setDoc(docRef, service);
    }

    // Crear terapeutas
    for (const therapist of therapists) {
      const docRef = doc(window.firebaseManager.db, "therapists", therapist.id);
      await setDoc(docRef, therapist);
    }
  } catch (error) {
    console.error("❌ Error inicializando datos:", error);
  }
}

// Función para limpiar datos (usar con cuidado)
// async function clearFirebaseData() {
//   if (
//     !confirm(
//       "⚠️ ¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer."
//     )
//   ) {
//     return;
//   }

//   try {
//     const { collection, getDocs, deleteDoc } = await import(
//       "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
//     );

//     // Limpiar servicios
//     const servicesSnapshot = await getDocs(
//       collection(window.firebaseManager.db, "services")
//     );
//     for (const docSnap of servicesSnapshot.docs) {
//       await deleteDoc(docSnap.ref);
//     }

//     // Limpiar terapeutas
//     const therapistsSnapshot = await getDocs(
//       collection(window.firebaseManager.db, "therapists")
//     );
//     for (const docSnap of therapistsSnapshot.docs) {
//       await deleteDoc(docSnap.ref);
//     }

//     // Limpiar reservas
//     const reservationsSnapshot = await getDocs(
//       collection(window.firebaseManager.db, "reservations")
//     );
//     for (const docSnap of reservationsSnapshot.docs) {
//       await deleteDoc(docSnap.ref);
//     }

//     console.log("🧹 Datos eliminados exitosamente");
//   } catch (error) {
//     console.error("❌ Error eliminando datos:", error);
//   }
// }

// Función para verificar conexión
// function checkFirebaseConnection() {
//   if (window.firebaseManager && window.firebaseManager.initialized) {
//     console.log("✅ Firebase está conectado y funcionando");
//     console.log("📊 Config:", window.firebaseManager.app.options);
//   } else {
//     console.log("❌ Firebase no está conectado");
//   }
// }

// Exportar funciones para uso en consola
window.initializeFirebaseData = initializeFirebaseData;
// window.clearFirebaseData = clearFirebaseData;
// window.checkFirebaseConnection = checkFirebaseConnection;
