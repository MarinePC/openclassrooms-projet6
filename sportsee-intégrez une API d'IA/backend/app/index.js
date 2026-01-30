// backend/app/index.js

require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 8000;

/* Vérification des variables */
console.log('\nDémarrage du serveur SportSee...');
console.log('=====================================');
console.log('Port:', PORT);
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('MISTRAL_API_KEY:', process.env.MISTRAL_API_KEY ? 'Configurée' : 'Manquante');

if (!process.env.MISTRAL_API_KEY) {
  console.warn('\n⚠️  ATTENTION: La clé API Mistral n\'est pas configurée !');
  console.warn('   Le chatbot ne fonctionnera pas sans MISTRAL_API_KEY dans .env\n');
}

/* démarrer serveur */
app.listen(PORT, () => {
  console.log(`\n✅ Serveur démarré avec succès !`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log('=====================================\n');
});

/* Gestion des erreurs */ 
process.on('uncaughtException', (err) => {
  console.error('❌ Erreur non capturée:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Promise rejetée:', err);
  process.exit(1);
});
