/*
 * Script de pilotage du questionnaire de maturité à l'IA.
 *
 * Cette logique maintient l'état courant (question en cours et score
 * accumulé) et met à jour la barre de progression et les éléments DOM
 * associés après chaque réponse. Une fois toutes les questions
 * terminées, le script calcule le score final et affiche un profil
 * accompagné des risques cognitifs et des pistes d'amélioration.
 */

// Ensemble de questions. Chaque question comporte un intitulé et
// plusieurs réponses avec une valeur associée. Les valeurs élevées
// indiquent un usage plus mature de l'IA (diversifié, critique et
// créatif), tandis que les valeurs faibles reflètent une utilisation
// limitée ou non réfléchie.
const questions = [
  {
    text:
      "À quelle fréquence utilisez-vous des assistants vocaux (Siri, Alexa, Google Assistant) pour obtenir des informations ou accomplir des tâches ?",
    answers: [
      { text: "Jamais", value: 0 },
      { text: "Rarement", value: 1 },
      { text: "Parfois", value: 2 },
      { text: "Souvent", value: 3 },
      { text: "Tous les jours", value: 4 },
    ],
  },
  {
    text:
      "Lorsque vous faites une recherche en ligne, comment sélectionnez-vous les résultats ?",
    answers: [
      {
        text: "Je clique toujours sur le premier résultat sans vérifier",
        value: 0,
      },
      {
        text: "Je consulte les premiers résultats proposés",
        value: 1,
      },
      {
        text: "Je compare plusieurs sources",
        value: 3,
      },
      {
        text: "Je vérifie systématiquement la fiabilité des sources",
        value: 4,
      },
    ],
  },
  {
    text:
      "Comment réagissez-vous aux recommandations personnalisées (réseaux sociaux, streaming, commerce) ?",
    answers: [
      {
        text: "Je les suis toujours sans me poser de questions",
        value: 0,
      },
      {
        text: "Je les consulte mais je garde un esprit critique",
        value: 4,
      },
      {
        text: "Je les utilise pour découvrir mais je vérifie les sources",
        value: 3,
      },
      {
        text: "Je les ignore complètement",
        value: 2,
      },
    ],
  },
  {
    text:
      "Avez-vous déjà utilisé un chatbot ou un assistant conversationnel (ex : service client, ChatGPT, Bard) ?",
    answers: [
      { text: "Jamais", value: 0 },
      { text: "Une ou deux fois par curiosité", value: 1 },
      {
        text: "Régulièrement pour des recherches ou des tâches simples",
        value: 2,
      },
      {
        text: "Fréquemment pour générer du contenu ou apprendre",
        value: 3,
      },
      {
        text: "Quotidiennement pour m'aider à résoudre des problèmes complexes",
        value: 4,
      },
    ],
  },
  {
    text:
      "Pour apprendre ou vous former, utilisez-vous des outils d'IA (cours adaptatifs, tutoriels personnalisés) ?",
    answers: [
      { text: "Jamais", value: 0 },
      { text: "Rarement", value: 1 },
      { text: "Parfois", value: 2 },
      { text: "Souvent", value: 3 },
      { text: "Très souvent", value: 4 },
    ],
  },
  {
    text:
      "Utilisez-vous l'IA pour des activités créatives (écriture de textes, code, musique, art) ?",
    answers: [
      { text: "Jamais", value: 0 },
      { text: "Rarement", value: 1 },
      { text: "Parfois", value: 2 },
      { text: "Souvent", value: 3 },
      { text: "Très souvent", value: 4 },
    ],
  },
  {
    text:
      "Faites-vous confiance aux diagnostics ou recommandations de santé générés par des applications ou objets connectés ?",
    answers: [
      { text: "Je n'utilise pas ces services", value: 1 },
      {
        text: "Je les consulte mais avec prudence",
        value: 4,
      },
      {
        text: "Je leur fais confiance pour de petites décisions",
        value: 3,
      },
      {
        text: "Je leur fais confiance pour des décisions importantes",
        value: 0,
      },
    ],
  },
  {
    text:
      "Quand vous utilisez un outil génératif (ex : ChatGPT), modifiez-vous la réponse ou la recopiez-vous telle quelle ?",
    answers: [
      {
        text: "Je copie-colle la réponse sans modification",
        value: 0,
      },
      {
        text: "Je corrige légèrement la réponse",
        value: 2,
      },
      {
        text: "Je m'inspire et reformule avec mes propres mots",
        value: 3,
      },
      {
        text: "Je l'utilise comme point de départ pour créer quelque chose de nouveau",
        value: 4,
      },
    ],
  },
  {
    text:
      "À quelle fréquence utilisez-vous des applications de navigation (Waze, Google Maps) qui optimisent vos trajets en temps réel ?",
    answers: [
      { text: "Jamais", value: 0 },
      { text: "Rarement", value: 1 },
      { text: "Parfois", value: 2 },
      { text: "Souvent", value: 3 },
      { text: "Tous les jours", value: 4 },
    ],
  },
  {
    text:
      "Avez-vous déjà utilisé l'IA pour organiser votre vie (planification, gestion de tâches, rappels) ?",
    answers: [
      { text: "Jamais", value: 0 },
      { text: "Rarement", value: 1 },
      { text: "Parfois", value: 2 },
      { text: "Souvent", value: 3 },
      { text: "Tous les jours", value: 4 },
    ],
  },
  {
    text:
      "Comment vérifiez-vous l'exactitude des informations générées par l'IA ?",
    answers: [
      {
        text: "Je fais entièrement confiance et ne vérifie pas",
        value: 0,
      },
      {
        text: "Je vérifie uniquement si cela semble bizarre",
        value: 2,
      },
      {
        text: "Je demande à l'IA de se corriger",
        value: 1,
      },
      {
        text: "Je vérifie systématiquement plusieurs sources",
        value: 4,
      },
    ],
  },
  {
    text:
      "Pensez-vous que l'IA influence votre créativité ou votre capacité à réfléchir ?",
    answers: [
      {
        text: "Non, elle stimule ma créativité et m'aide à réfléchir",
        value: 4,
      },
      {
        text: "Je ne sais pas",
        value: 2,
      },
      {
        text: "Oui, j'ai tendance à moins réfléchir quand je l'utilise",
        value: 1,
      },
      {
        text: "Oui, je redoute de perdre mes compétences cognitives",
        value: 0,
      },
    ],
  },
];

// Les différents profils de maturité définissent la tranche de scores et
// fournissent un message personnalisé, des risques cognitifs et des
// suggestions d'amélioration. Les bornes sont inclusives pour la
// valeur inférieure et exclusives pour la valeur supérieure.
const profiles = [
  {
    range: [0, 13],
    title: "Consommateur passif",
    description:
      "Vous utilisez peu l'intelligence artificielle ou de manière très occasionnelle. Vous passez probablement à côté des possibilités offertes et vous laissez souvent guider sans esprit critique.",
    risks: [
      "Risque de manquer des opportunités d'amélioration de votre quotidien par méconnaissance des outils", 
      "Tendance à suivre les recommandations sans vérifier leur pertinence", 
      "Développement limité des compétences numériques"
    ],
    improvements: [
      "Explorez des assistants vocaux et des chatbots pour automatiser des tâches simples", 
      "Comparez les sources d'information et diversifiez vos canaux", 
      "Essayez des outils d'apprentissage personnalisés pour développer vos compétences digitales"
    ],
  },
  {
    range: [13, 25],
    title: "Explorateur prudent",
    description:
      "Vous commencez à utiliser l'IA dans certains domaines mais restez hésitant. Vous avez conscience de l'importance de vérifier les informations mais vous n'en tirez pas encore pleinement parti.",
    risks: [
      "Risque de sur- ou sous-utiliser l'IA faute de repères clairs", 
      "Possible influence des bulles de filtres et des biais algorithmiques", 
      "Tendance à se reposer sur l'IA pour des décisions sans mettre en œuvre sa propre réflexion"
    ],
    improvements: [
      "Utilisez l'IA pour explorer de nouveaux sujets tout en gardant un esprit critique", 
      "Multipliez les sources lors de vos recherches afin de limiter les biais", 
      "Essayez des outils créatifs ou de planification pour voir comment ils peuvent améliorer votre productivité"
    ],
  },
  {
    range: [25, 37],
    title: "Utilisateur équilibré",
    description:
      "Vous utilisez l'IA régulièrement dans plusieurs domaines et savez reconnaître ses limites. Vous combinez vos propres capacités avec les recommandations générées par les systèmes.",
    risks: [
      "Risque de déléguer progressivement des tâches cognitives à l'IA (effet Google)", 
      "Exposition à des recommandations homogènes qui peuvent limiter votre créativité", 
      "Possible baisse d'attention lors de la vérification des informations"
    ],
    improvements: [
      "Continuez à varier les sources et à reformuler les contenus générés par l'IA", 
      "Utilisez l'IA comme outil d'inspiration, pas comme substitut à votre pensée", 
      "Apprenez à repérer les biais dans les recommandations et les résultats de recherche"
    ],
  },
  {
    range: [37, 45],
    title: "Utilisateur avancé",
    description:
      "Vous êtes à l'aise avec différents usages de l'IA et l'intégrez de manière efficace à vos activités. Vous gardez un esprit critique et ajustez les réponses pour répondre à vos besoins.",
    risks: [
      "Risque de surcharge d'informations et de confiance excessive dans les outils", 
      "Cognitive offloading pouvant réduire la mémorisation à long terme", 
      "Biais de confirmation lorsque l'IA renforce vos opinions"
    ],
    improvements: [
      "Prenez le temps de déconnecter et de stimuler votre créativité sans IA", 
      "Partagez vos pratiques responsables avec votre entourage pour diffuser une culture numérique saine", 
      "Expérimentez des outils d'IA avancés (création artistique, code) tout en conservant votre autonomie"
    ],
  },
  {
    range: [45, 49],
    title: "Pionnier responsable",
    description:
      "Vous exploitez tout le potentiel de l'IA de manière éclairée. Vous diversifiez vos usages, vérifiez systématiquement les informations et transformez les propositions en nouvelles créations.",
    risks: [
      "Risque de dépendance et de réduction de l'effort cognitif", 
      "Possibilité de subir la fatigue mentale liée à la multiplicité des outils", 
      "Exposition aux erreurs ou hallucinations de l'IA si la vérification n'est pas constante"
    ],
    improvements: [
      "Continuez à équilibrer utilisation d'IA et réflexion personnelle", 
      "Développez des projets créatifs ou professionnels en utilisant l'IA comme alliée", 
      "Restez à l'écoute des évolutions technologiques et des bonnes pratiques pour conserver un pas d'avance"
    ],
  },
];

// Références DOM
const quizContainer = document.getElementById("quiz-container");
const progressBar = document.getElementById("progress-bar");
const questionNumber = document.getElementById("question-number");
const questionText = document.getElementById("question-text");
const answersList = document.getElementById("answers");
const resultContainer = document.getElementById("result-container");
const resultTitle = document.getElementById("result-title");
const resultDescription = document.getElementById("result-description");
const resultRisks = document.getElementById("result-risks");
const resultImprovements = document.getElementById("result-improvements");

let currentIndex = 0;
let score = 0;

// Fonction pour afficher la question actuelle
function renderQuestion() {
  const current = questions[currentIndex];
  // Met à jour le numéro de la question
  questionNumber.textContent = `Question ${currentIndex + 1} sur ${questions.length}`;
  // Met à jour le texte de la question
  questionText.textContent = current.text;
  // Efface les réponses existantes
  answersList.innerHTML = "";
  // Ajoute les réponses sous forme de boutons
  current.answers.forEach((answer) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.textContent = answer.text;
    button.addEventListener("click", () => handleAnswer(answer.value));
    li.appendChild(button);
    answersList.appendChild(li);
  });
  // Met à jour la barre de progression
  const progressPercent = (currentIndex / questions.length) * 100;
  progressBar.style.width = `${progressPercent}%`;
}

// Fonction appelée lorsqu'une réponse est sélectionnée
function handleAnswer(value) {
  // Ajoute la valeur de la réponse au score
  score += value;
  // Avance à la question suivante ou affiche les résultats
  currentIndex++;
  if (currentIndex < questions.length) {
    renderQuestion();
  } else {
    showResults();
  }
}

// Fonction pour afficher les résultats en fonction du score obtenu
function showResults() {
  // Met à jour la barre de progression à 100%
  progressBar.style.width = "100%";
  // Cache le quiz et affiche les résultats
  quizContainer.classList.add("hidden");
  resultContainer.classList.remove("hidden");
  // Recherche le profil correspondant au score
  const profile = profiles.find((p) => score >= p.range[0] && score < p.range[1]);
  if (profile) {
    resultTitle.textContent = profile.title;
    resultDescription.textContent = profile.description;
    // Peupler les risques
    resultRisks.innerHTML = "";
    profile.risks.forEach((risk) => {
      const li = document.createElement("li");
      li.textContent = risk;
      resultRisks.appendChild(li);
    });
    // Peupler les pistes d'amélioration
    resultImprovements.innerHTML = "";
    profile.improvements.forEach((tip) => {
      const li = document.createElement("li");
      li.textContent = tip;
      resultImprovements.appendChild(li);
    });
  } else {
    // Fallback en cas de score inattendu
    resultTitle.textContent = "Profil non défini";
    resultDescription.textContent =
      "Votre score ne correspond à aucun profil prédéfini. Cela peut indiquer un usage atypique de l'IA.";
  }
}

// Initialisation
renderQuestion();