// Intent configuration — each mode gets its own identity
export interface IntentConfig {
    id: string;
    emoji: string;
    label: string;
    tagline: string;         // shown on discover banner
    accentColor: string;     // hex color for accents
    accentBg: string;        // semi-transparent bg
    cardFocus: string;       // what to emphasise on the swipe card
    emptyMsg: string;        // empty deck message
    likeLabel: string;       // LIKE stamp label
    actionHint: string;      // hint text under action buttons
}

export const INTENT_CONFIGS: Record<string, IntentConfig> = {
    networking: {
        id: "networking",
        emoji: "💼",
        label: "Professional Networking",
        tagline: "Build your professional dev network",
        accentColor: "#60a5fa",   // blue
        accentBg: "rgba(96,165,250,0.1)",
        cardFocus: "open_to_work",
        emptyMsg: "No more developers to connect with right now.",
        likeLabel: "CONNECT",
        actionHint: "Connect with developers who level up your career",
    },
    collab: {
        id: "collab",
        emoji: "🚀",
        label: "Project Collaboration",
        tagline: "Find your next co-founder or open-source buddy",
        accentColor: "#a78bfa",   // purple
        accentBg: "rgba(167,139,250,0.1)",
        cardFocus: "repos",
        emptyMsg: "No collaborators available right now. Check back soon!",
        likeLabel: "BUILD",
        actionHint: "Swipe right to build together",
    },
    hackathon: {
        id: "hackathon",
        emoji: "🏆",
        label: "Hackathon Partner",
        tagline: "Build your dream hackathon team",
        accentColor: "#fbbf24",   // amber
        accentBg: "rgba(251,191,36,0.1)",
        cardFocus: "stack",
        emptyMsg: "No hackathon partners available right now.",
        likeLabel: "TEAM UP",
        actionHint: "Find your winning teammate",
    },
    learning: {
        id: "learning",
        emoji: "📚",
        label: "Learning Buddy",
        tagline: "Learn faster with a dev who gets it",
        accentColor: "#34d399",   // green
        accentBg: "rgba(52,211,153,0.1)",
        cardFocus: "bio",
        emptyMsg: "No learning buddies available right now.",
        likeLabel: "LEARN",
        actionHint: "Find someone to grow with",
    },
    dating: {
        id: "dating",
        emoji: "💝",
        label: "Dating Mode",
        tagline: "Find a dev who understands your late-night commits",
        accentColor: "#f472b6",   // pink
        accentBg: "rgba(244,114,182,0.1)",
        cardFocus: "bio",
        emptyMsg: "No matches available. Take a break — you deserve it 💝",
        likeLabel: "LIKE",
        actionHint: "Someone out there uses the same stack as you ❤️",
    },
    casual: {
        id: "casual",
        emoji: "🎮",
        label: "Casual Dev Connect",
        tagline: "Just vibing with fellow developers",
        accentColor: "#e8614a",   // default coral
        accentBg: "rgba(232,97,74,0.1)",
        cardFocus: "stack",
        emptyMsg: "No devs to vibe with right now. Try again later!",
        likeLabel: "VIBE",
        actionHint: "Keep it casual, keep it fun",
    },
};

export const DEFAULT_INTENT = INTENT_CONFIGS.casual;
