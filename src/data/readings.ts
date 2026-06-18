// Premium, non-judgmental recovery reflections, meditations, and prompts
// Dynamically keyed by day of the month so they feel fresh and authentic each day.

export interface RhondaReadings {
  aaReflection: string;
  lettingGo: string;
  morningConnection: string;
  thoughtOfDay: string;
  gratitudePrompt: string;
}

export interface SusanReadings {
  oaReading: string;
  meditation: string;
  thought: string;
  gratitudePrompt: string;
  foodFeelings: string;
}

// Support multiple rotating days of reflections
const rhondaLibrary: Record<number | string, RhondaReadings> = {
  1: {
    aaReflection: "AA Reflection: 'Self-acceptance is the key to all progress.' Today, we look at the face in the mirror with kindness. Release the demand for immediate perfection; recovery is a gentle path of progress, not spotless perfection.",
    lettingGo: "Language of Letting Go: 'Anxiety is a busy signal.' When we try to control outcomes, we drop our peace of mind. Today, we step back, breathe, and place our loved ones and schedules in the hands of a Higher Power.",
    morningConnection: "Morning Connection: 'Be still and know.' Awakening today, I align myself with grace. I don't have to carry the future. I only have to walk through the next twenty-four hours in love.",
    thoughtOfDay: "Recovery Thought of the Day: You are exactly where you are supposed to be. Be gentle with Rhonda today. Vyvanse is a tool, but your real power is your loving contact with your Higher Power.",
    gratitudePrompt: "Gratitude Prompt: Name 3 small sensory details you appreciate right now (the warmth of tea, the breeze, the soft morning light)."
  },
  2: {
    aaReflection: "AA Reflection: 'Humility means seeing things as they really are.' We accept both our limitations and our strengths. We ask for help not because we are weak, but because we want to remain strong.",
    lettingGo: "Language of Letting Go: 'Trusting yourself.' Your gut feelings are valid. You are gaining the wisdom to trust your timing, your boundaries, and your voice.",
    morningConnection: "Morning Connection: 'Begin with hope.' Every morning we are given a new, pristine slate. The mistakes of yesterday dissolve into the grace of the sunrise.",
    thoughtOfDay: "Recovery Thought of the Day: Take a deep breath before answering the phone today. Give yourself five seconds of grace before any commitment.",
    gratitudePrompt: "Gratitude Prompt: What is one thing about Rhonda's strong spirit that you are proud of today?"
  },
  default: {
    aaReflection: "AA Reflection: 'Easy Does It.' We cannot force growth, nor can we rush healing. We trust the process of daily surrender, one step, one hour, one breath at a time.",
    lettingGo: "Language of Letting Go: 'Detaching with Love.' We allow the people in our lives to walk their own paths, explore their own struggles, and find their own answers. Our peace is not contingent on their choices.",
    morningConnection: "Morning Connection: 'Surrender the reins.' Placing my hand over my heart, I offer up my worries, my control, and my strivings. I step into a posture of receiving grace.",
    thoughtOfDay: "Recovery Thought of the Day: You are fully supported, friend. Your sponsor, your meetings, and Bliss are all here to walk beside you.",
    gratitudePrompt: "Gratitude Prompt: What is a simple pleasure you enjoyed yesterday that brought a smile to your face?"
  }
};

const susanLibrary: Record<number | string, SusanReadings> = {
  1: {
    oaReading: "Overeaters Anonymous: 'Abstinence is the greatest gift we give ourselves.' We eat to live, nourish, and comfort our temples in balance—not to numb or hide from the beautiful spectrum of feelings.",
    meditation: "Daily Meditation: Picture your feelings as clouds passing across a vast, clear blue sky. You are not the storm; you are the sky. Let the sensations pass through you without holding them tight.",
    thought: "Daily Recovery Thought: Susan, Wegovy supports your body, but your community and your heart support your spirit. You deserve to feel light, free, and content in your skin.",
    gratitudePrompt: "Gratitude Prompt: Focus on your physical body. Name 3 things your hands or feet allowed you to experience and enjoy yesterday.",
    foodFeelings: "Food & Feelings Reflection: When hunger cues feel quiet, connect with your heart. Are you seeking nourishment, or is there a soft emotion asking to be heard? Journal it with absolute love."
  },
  2: {
    oaReading: "Overeaters Anonymous: 'Seeking sanity from food.' When we slip into compulsive patterns, we ask ourselves: 'What am I really hungry for?' Often, it is connection, rest, or self-kindness.",
    meditation: "Daily Meditation: Place your hands on your diaphragm. Breathe in for a count of 4, hold for 4, exhale for 4, and let the quietness settle deep inside your core.",
    thought: "Daily Recovery Thought: Portion sizes don't define your value. Susan, you are nourishing yourself with delicious, balanced meals because your body is worthy of care.",
    gratitudePrompt: "Gratitude Prompt: What is one meal this week that felt peaceful, satisfying, and fully aligned with your plan?",
    foodFeelings: "Food & Feelings Reflection: Notice any feelings of guilt or anxiety today about your habits. Take a breath and let it dissolve; you are a learner, and learning is perfect progress."
  },
  default: {
    oaReading: "Overeaters Anonymous: 'One day at a time.' We don't worry about abstaining forever. Just for today, we follow our food plan with ease, joy, and peace.",
    meditation: "Daily Meditation: Anchor yourself in the present. Listen to the furthest sound you can hear, then the closest, then the steady rhythm of your own breathing.",
    thought: "Daily Recovery Thought: Rest is productive. Susan, cooking for you and Rhonda is an act of love, but make sure to nourish your own spirit first.",
    gratitudePrompt: "Gratitude Prompt: Name one friend or recovery companion whose voice brought you calm this week.",
    foodFeelings: "Food & Feelings Reflection: Are there any specific triggers today? Let Bliss know so we can adjust our portions and meal planning to be super safe."
  }
};

export function getRhondaReadings(day: number): RhondaReadings {
  return rhondaLibrary[day] || rhondaLibrary.default;
}

export function getSusanReadings(day: number): SusanReadings {
  return susanLibrary[day] || susanLibrary.default;
}
