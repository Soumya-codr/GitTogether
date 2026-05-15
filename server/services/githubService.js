const axios = require("axios");

/**
 * Exchanges GitHub OAuth code for access token
 */
async function getGitHubAccessToken(code) {
    const response = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
        },
        { headers: { Accept: "application/json" } }
    );
    return response.data.access_token;
}

/**
 * Fetches GitHub user profile
 */
async function getGitHubUser(accessToken) {
    const response = await axios.get("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
}

/**
 * Fetches user's public repos and extracts primary tech stack
 */
async function fetchReposAndStack(username, accessToken) {
    const response = await axios.get(
        `https://api.github.com/users/${username}/repos?per_page=50&sort=updated`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const repos = response.data;

    // Aggregate language counts
    const langCount = {};
    const repoData = repos
        
        .map((r) => {
            if (r.language) {
                langCount[r.language] = (langCount[r.language] || 0) + 1;
            }
            return {
                name: r.name,
                description: r.description || null,
                url: r.html_url || "",
                language: r.language || "Unknown",
                stars: r.stargazers_count,
                topics: r.topics || [],
            };
        });

    // For repos without descriptions, try to extract one from README (max 10, 3s timeout)
    const needDesc = repoData.filter(r => !r.description).slice(0, 10);
    if (needDesc.length > 0) {
        await Promise.allSettled(
            needDesc.map(async (repo) => {
                try {
                    const readmeRes = await axios.get(
                        `https://api.github.com/repos/${username}/${repo.name}/readme`,
                        {
                            headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github.raw" },
                            timeout: 3000,
                        }
                    );
                    const content = typeof readmeRes.data === "string" ? readmeRes.data : "";
                    // Find first meaningful paragraph (skip headings, images, badges, dividers)
                    const lines = content.split("\n").map(l => l.trim()).filter(l =>
                        l.length > 15 &&
                        !l.startsWith("#") &&
                        !l.startsWith("!") &&
                        !l.startsWith("[!") &&
                        !l.startsWith("```") &&
                        !l.startsWith("|") &&
                        !l.startsWith("---") &&
                        !l.match(/^\[.*\]\(.*\)$/)
                    );
                    if (lines.length > 0) {
                        let desc = lines[0]
                            .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
                            .replace(/\*\*([^*]+)\*\*/g, "$1")
                            .replace(/\*([^*]+)\*/g, "$1")
                            .replace(/`([^`]+)`/g, "$1")
                            .trim();
                        if (desc.length > 200) desc = desc.substring(0, 197) + "...";
                        if (desc.length > 15) repo.description = desc;
                    }
                } catch {
                    // Silently skip — repo may not have a README
                }
            })
        );
    }

    // Sort languages by usage, take top 5
    const primaryStack = Object.entries(langCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([lang]) => lang);

    return { repoData, primaryStack };
}

module.exports = { getGitHubAccessToken, getGitHubUser, fetchReposAndStack };
