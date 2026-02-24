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
        .filter((r) => !r.fork)
        .map((r) => {
            if (r.language) {
                langCount[r.language] = (langCount[r.language] || 0) + 1;
            }
            return {
                repoName: r.name,
                language: r.language || "Unknown",
                stars: r.stargazers_count,
                forks: r.forks_count,
                topics: r.topics || [],
            };
        });

    // Sort languages by usage, take top 5
    const primaryStack = Object.entries(langCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([lang]) => lang);

    return { repoData, primaryStack };
}

module.exports = { getGitHubAccessToken, getGitHubUser, fetchReposAndStack };
