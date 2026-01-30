// backend/app/userContextBuilder.js

/* profil user */
function formatUserProfile(profile) {
  if (!profile) return "";

  const parts = [];

  if (profile.firstName) {
    parts.push(`- Prénom : ${profile.firstName}`);
  }

  if (profile.age) {
    parts.push(`- Âge : ${profile.age} ans`);
  }

  if (profile.gender) {
    parts.push(`- Genre : ${profile.gender}`);
  }

  if (profile.weight) {
    parts.push(`- Poids : ${profile.weight} kg`);
  }

  if (profile.height) {
    parts.push(`- Taille : ${profile.height} cm`);
  }

  return parts.length > 0 ? `\n**Profil de l'utilisateur :**\n${parts.join("\n")}` : "";
}

/* stat globales */
function formatUserStatistics(statistics) {
  if (!statistics) return "";

  const parts = [];

  if (statistics.totalDistance != null) {
    const distance = typeof statistics.totalDistance === "number" 
      ? statistics.totalDistance 
      : Number(statistics.totalDistance);
    parts.push(`- Distance totale parcourue : ${Math.round(distance)} km`);
  }

  if (statistics.totalSessions) {
    parts.push(`- Nombre total de séances : ${statistics.totalSessions}`);
  }

  if (statistics.totalDuration) {
    const hours = Math.floor(statistics.totalDuration / 60);
    const minutes = statistics.totalDuration % 60;
    parts.push(`- Temps d'entraînement total : ${hours}h ${minutes}min`);
  }

  if (statistics.weeklyGoal) {
    parts.push(`- Objectif hebdomadaire : ${statistics.weeklyGoal} séances`);
  }

  return parts.length > 0 ? `\n**Statistiques globales :**\n${parts.join("\n")}` : "";
}

/* Estime le niveau du user */
function estimateUserLevel(recentActivities, statistics) {
  if (!recentActivities || recentActivities.length === 0) {
    return "débutant";
  }

  /* critère d'eval */ 
  const avgDistance = recentActivities.reduce((sum, a) => sum + (a.distance || 0), 0) / recentActivities.length;
  const avgDuration = recentActivities.reduce((sum, a) => sum + (a.duration || 0), 0) / recentActivities.length;
  const frequency = statistics?.totalSessions || recentActivities.length;

  /* classification */ 
  if (avgDistance >= 8 && avgDuration >= 45 && frequency >= 15) {
    return "avancé";
  } else if (avgDistance >= 5 && avgDuration >= 30 && frequency >= 8) {
    return "intermédiaire";
  } else {
    return "débutant";
  }
}

/* Formate les 10 dernières activités */
function formatRecentActivities(activities) {
  if (!activities || activities.length === 0) {
    return "\n**Activités récentes :** Aucune activité enregistrée.";
  }

  /* max 10 derniere activité + trier par date décroissante */ 
  const sortedActivities = [...activities]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  const formattedActivities = sortedActivities.map((activity, index) => {
    const date = new Date(activity.date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    });

    const distance = activity.distance ? `${activity.distance.toFixed(1)} km` : "N/A";
    const duration = activity.duration ? `${activity.duration} min` : "N/A";
    const avgHeartRate = activity.heartRate?.average 
      ? `${Math.round(activity.heartRate.average)} bpm`
      : "N/A";

    return `  ${index + 1}. ${date} : ${distance} en ${duration} (FC moy: ${avgHeartRate})`;
  });

  return `\n**10 dernières séances :**\n${formattedActivities.join("\n")}`;
}

/* analyse des tendances */
function analyzeTrends(recentActivities) {
  if (!recentActivities || recentActivities.length < 3) {
    return "";
  }

  const sortedActivities = [...recentActivities].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const recent = sortedActivities.slice(-3);
  const older = sortedActivities.slice(0, Math.min(3, sortedActivities.length - 3));

  if (older.length === 0) return "";

  const recentAvgDistance = recent.reduce((sum, a) => sum + (a.distance || 0), 0) / recent.length;
  const olderAvgDistance = older.reduce((sum, a) => sum + (a.distance || 0), 0) / older.length;

  const recentAvgHR = recent.reduce(
    (sum, a) => sum + (a.heartRate?.average || 0),
    0
  ) / recent.length;
  const olderAvgHR = older.reduce(
    (sum, a) => sum + (a.heartRate?.average || 0),
    0
  ) / older.length;

  const trends = [];

  // Tendance distance
  if (recentAvgDistance > olderAvgDistance * 1.1) {
    trends.push("progression des distances");
  } else if (recentAvgDistance < olderAvgDistance * 0.9) {
    trends.push("diminution des distances");
  }

  // Tendance fréquence cardiaque
  if (recentAvgHR > 0 && olderAvgHR > 0) {
    if (recentAvgHR < olderAvgHR * 0.95) {
      trends.push("amélioration de l'endurance (FC en baisse)");
    } else if (recentAvgHR > olderAvgHR * 1.05) {
      trends.push("intensité en hausse");
    }
  }

  return trends.length > 0
    ? `\n**Tendances récentes :** ${trends.join(", ")}`
    : "";
}

/* contexte pour le chatbot */
function buildUserContext(userData) {
  if (!userData) {
    return null;
  }

  const { profile, statistics, recentActivities } = userData;

  /* estimation du niveau */ 
  const userLevel = estimateUserLevel(recentActivities, statistics);

  const sections = [
    `\n**Niveau estimé : ${userLevel}**`,
    formatUserProfile(profile),
    formatUserStatistics(statistics),
    formatRecentActivities(recentActivities),
    analyzeTrends(recentActivities),
  ];

  const context = sections.filter(Boolean).join("\n");

  return `\n${"=".repeat(60)}\nCONTEXTE UTILISATEUR\n${"=".repeat(60)}${context}\n${"=".repeat(60)}\n`;
}

/* contole données user + limite la taille pour éviter la surcharger */
function sanitizeUserData(userData) {
  if (!userData || typeof userData !== "object") {
    return null;
  }

  const sanitized = {};

  // Profile
  if (userData.profile && typeof userData.profile === "object") {
    sanitized.profile = {
      firstName: String(userData.profile.firstName || "").slice(0, 50),
      age: Number(userData.profile.age) || null,
      gender: String(userData.profile.gender || "").slice(0, 20),
      weight: Number(userData.profile.weight) || null,
      height: Number(userData.profile.height) || null,
    };
  }

  /* stat */ 
  if (userData.statistics && typeof userData.statistics === "object") {
    sanitized.statistics = {
      totalDistance: userData.statistics.totalDistance,
      totalSessions: Number(userData.statistics.totalSessions) || 0,
      totalDuration: Number(userData.statistics.totalDuration) || 0,
      weeklyGoal: Number(userData.statistics.weeklyGoal) || null,
    };
  }

  /* actvité récente : max 10 */ 
  if (Array.isArray(userData.recentActivities)) {
    sanitized.recentActivities = userData.recentActivities
      .slice(0, 10)
      .map((activity) => ({
        date: String(activity.date || "").slice(0, 10),
        distance: Number(activity.distance) || 0,
        duration: Number(activity.duration) || 0,
        heartRate: {
          min: Number(activity.heartRate?.min) || 0,
          max: Number(activity.heartRate?.max) || 0,
          average: Number(activity.heartRate?.average) || 0,
        },
      }));
  }

  return sanitized;
}

module.exports = {
  buildUserContext,
  sanitizeUserData,
};