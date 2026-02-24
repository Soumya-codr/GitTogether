/**
 * Calculates compatibility score between two users (0–100)
 *
 * Breakdown:
 *  - Tech stack overlap:      40%
 *  - Repo domain similarity:  20%
 *  - Activity similarity:     20%
 *  - Intent alignment:        20%
 */
function calculateCompatibility(userA, userB) {
    let score = 0;

    // 1. Tech stack overlap (40 pts)
    const stackA = new Set(userA.primaryStack || []);
    const stackB = new Set(userB.primaryStack || []);
    const intersection = [...stackA].filter((lang) => stackB.has(lang));
    const union = new Set([...stackA, ...stackB]);
    const jaccardStack = union.size > 0 ? intersection.length / union.size : 0;
    score += jaccardStack * 40;

    // 2. Repo domain similarity via language distribution (20 pts)
    const reposA = userA.repositories || [];
    const reposB = userB.repositories || [];
    const langSetA = new Set(reposA.map((r) => r.language).filter(Boolean));
    const langSetB = new Set(reposB.map((r) => r.language).filter(Boolean));
    const langInter = [...langSetA].filter((l) => langSetB.has(l));
    const langUnion = new Set([...langSetA, ...langSetB]);
    const jaccardLang = langUnion.size > 0 ? langInter.length / langUnion.size : 0;
    score += jaccardLang * 20;

    // 3. Activity similarity — compare star/fork counts (20 pts)
    const starsA = reposA.reduce((s, r) => s + r.stars, 0);
    const starsB = reposB.reduce((s, r) => s + r.stars, 0);
    if (starsA > 0 || starsB > 0) {
        const max = Math.max(starsA, starsB);
        const min = Math.min(starsA, starsB);
        score += (min / max) * 20;
    }

    // 4. Intent alignment (20 pts) — same intent = full points
    if (userA.intentMode === userB.intentMode) {
        score += 20;
    }

    return Math.min(Math.round(score), 100);
}

module.exports = { calculateCompatibility };
