"use client";
import IntentCard from "./IntentCard";

const INTENTS = [
    { id: "networking", emoji: "💼", label: "Professional Networking", description: "Build your professional dev network" },
    { id: "collab",     emoji: "🚀", label: "Project Collaboration",   description: "Find your next co-founder or open-source partner" },
    { id: "hackathon",  emoji: "⚡", label: "Hackathon Partner",       description: "Team up and ship something in 48 hours" },
    { id: "learning",   emoji: "📚", label: "Learning Buddy",          description: "Master new tech stacks together" },
    { id: "dating",     emoji: "💝", label: "Dating Mode",             description: "Connect with developers on a deeper level" },
    { id: "casual",     emoji: "🎮", label: "Casual Dev Connect",      description: "Just hang out and talk code" },
];

interface IntentGridProps {
    selected: string | null;
    loading: boolean;
    onSelect: (id: string) => void;
}

export default function IntentGrid({ selected, loading, onSelect }: IntentGridProps) {
    return (
        <div className="intent-grid">
            {INTENTS.map((intent, i) => (
                <IntentCard
                    key={intent.id}
                    id={intent.id}
                    emoji={intent.emoji}
                    label={intent.label}
                    description={intent.description}
                    selected={selected === intent.id}
                    disabled={loading}
                    index={i}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}
