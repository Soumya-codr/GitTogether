interface UserWithRepos {
    primaryStack: string[] | any;
    intentMode?: string | null;
    repositories?: { language?: string | null; stars: number }[];
}

export function calculateCompatibility(userA: UserWithRepos, userB: UserWithRepos): number {
    let score = 0;

    const stackA = new Set<string>(Array.isArray(userA.primaryStack) ? userA.primaryStack : []);
    const stackB = new Set<string>(Array.isArray(userB.primaryStack) ? userB.primaryStack : []);
    const intersection = [...stackA].filter((l) => stackB.has(l));
    const union = new Set([...stackA, ...stackB]);
    const jaccardStack = union.size > 0 ? intersection.length / union.size : 0;
    score += jaccardStack * 40;

    const reposA = userA.repositories || [];
    const reposB = userB.repositories || [];
    const langSetA = new Set(reposA.map((r) => r.language).filter(Boolean));
    const langSetB = new Set(reposB.map((r) => r.language).filter(Boolean));
    const langInter = [...langSetA].filter((l) => langSetB.has(l));
    const langUnion = new Set([...langSetA, ...langSetB]);
    const jaccardLang = langUnion.size > 0 ? langInter.length / langUnion.size : 0;
    score += jaccardLang * 20;

    const starsA = reposA.reduce((s, r) => s + r.stars, 0);
    const starsB = reposB.reduce((s, r) => s + r.stars, 0);
    if (starsA > 0 || starsB > 0) {
        const max = Math.max(starsA, starsB);
        const min = Math.min(starsA, starsB);
        score += (min / max) * 20;
    }

    if (userA.intentMode && userB.intentMode && userA.intentMode === userB.intentMode) {
        score += 20;
    }

    return Math.min(Math.round(score), 100);
}
