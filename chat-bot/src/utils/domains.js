// Domain personas
export const DOMAINS = [
  {
    id: 'general',
    label: 'General Assistant',
    description: 'General-purpose AI assistant',
    icon: '✦',
    starters: [
      'What can you help me with today?',
      'Explain quantum computing in simple terms.',
      'Write a short story about a robot learning to paint.',
      'What are the best productivity tips for students?',
    ],
  },
  {
    id: 'college',
    label: 'College & Academics',
    description: 'Help with college life, applications, and academic planning',
    icon: '🎓',
    starters: [
      'How do I write a strong college application essay?',
      'What should I look for when choosing a major?',
      'Help me create a semester study schedule.',
      'What extracurriculars improve my college application?',
    ],
  },
  {
    id: 'education',
    label: 'Education & Study Tutor',
    description: 'Personalized tutoring and study help',
    icon: '📚',
    starters: [
      'Explain the Pythagorean theorem with examples.',
      'Help me understand photosynthesis step by step.',
      'What are effective study techniques for exams?',
      'Quiz me on World War II key events.',
    ],
  },
  {
    id: 'healthcare',
    label: 'Healthcare Information',
    description: 'General health and wellness information',
    icon: '🏥',
    starters: [
      'What are common symptoms of vitamin D deficiency?',
      'How does sleep affect overall health?',
      'What is the difference between Type 1 and Type 2 diabetes?',
      'What are healthy lifestyle habits for heart health?',
    ],
  },
  {
    id: 'banking',
    label: 'Banking & Finance Guide',
    description: 'Financial literacy and banking concepts',
    icon: '💳',
    starters: [
      'How do I create a personal budget?',
      'What is the difference between a savings and checking account?',
      'Explain compound interest with an example.',
      'What should I know before applying for a credit card?',
    ],
  },
]

export const DEFAULT_DOMAIN = DOMAINS[0]

export function getDomainById(id) {
  return DOMAINS.find((d) => d.id === id) ?? DEFAULT_DOMAIN
}
