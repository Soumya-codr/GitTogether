"use client";
import { INTENT_CONFIGS } from "@/lib/intentConfig";
import IntentCard from "./IntentCard";

interface IntentGridProps {
    selected: string | null;
    loading: boolean;
    onSelect: (id: string) => void;
}

export default function IntentGrid({ selected, loading, onSelect }: IntentGridProps) {
    const intents = Object.keys(INTENT_CONFIGS);

    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            width: "100%",
            maxWidth: 580,
            margin: "0 auto",
        }}>
            {intents.map((id, i) => (
                <IntentCard
                    key={id}
                    id={id}
                    selected={selected === id}
                    disabled={loading}
                    index={i}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}
