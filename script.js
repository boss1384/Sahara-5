// ===========================
// SAHARA FLASH SCRIPT.JS
// ===========================

const API_KEY = "da01d7158a60be461c607c6d31470b4e";
const BASE_URL = "https://v3.football.api-sports.io";

// ===========================
// API CALL
// ===========================

async function apiCall(endpoint, params = {}) {

    const url = new URL(BASE_URL + endpoint);

    Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
    });

    try {

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "x-apisports-key": API_KEY
            }
        });

        if (!response.ok) {
            console.log("API ERROR");
            return null;
        }

        const data = await response.json();

        return data.response;

    } catch (error) {

        console.log(error);

        return null;
    }
}

// ===========================
// SHOW SECTION
// ===========================

function showSection(section) {

    document.querySelectorAll(".section").forEach(sec => {
        sec.classList.remove("active");
    });

    document.getElementById(section + "-section")
        .classList.add("active");

    if (section === "live") {
        loadLiveMatches();
    }

    if (section === "fixtures") {
        loadFixtures();
    }

    if (section === "standings") {
        loadLeagues();
    }
}

// ===========================
// LOAD LIVE MATCHES
// ===========================

async function loadLiveMatches() {

    const container =
        document.getElementById("live-matches");

    container.innerHTML = `
        <p style="text-align:center;">
            Loading live matches...
        </p>
    `;

    const fixtures = await apiCall("/fixtures", {
        live: "all"
    });

    container.innerHTML = "";

    if (!fixtures || fixtures.length === 0) {

        container.innerHTML = `
            <p style="text-align:center;">
                No live matches now
            </p>
        `;

        return;
    }

    fixtures.forEach(fixture => {

        const card =
            createMatchCard(fixture, true);

        container.appendChild(card);

    });
}

// ===========================
// LOAD FIXTURES
// ===========================

async function loadFixtures() {

    const container =
        document.getElementById("fixtures");

    container.innerHTML = `
        <p style="text-align:center;">
            Loading fixtures...
        </p>
    `;

    const fixtures = await apiCall("/fixtures", {
        next: 20
    });

    container.innerHTML = "";

    if (!fixtures) return;

    fixtures.forEach(fixture => {

        const card =
            createMatchCard(fixture);

        container.appendChild(card);

    });
}

// ===========================
// CREATE MATCH CARD
// ===========================

function createMatchCard(fixture, isLive = false) {

    const card = document.createElement("div");

    card.className = "match-card";

    card.onclick = () => openMatchDetail(fixture);

    const statusHTML = isLive

        ? `<span class="live-badge">
            LIVE ${fixture.fixture.status.elapsed || 0}'
           </span>`

        : `<span>
            ${new Date(fixture.fixture.date)
                .toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                })}
           </span>`;

    card.innerHTML = `

        <div class="match-header">

            <div>
                ${fixture.league.name}
            </div>

            <div>
                ${statusHTML}
            </div>

        </div>

        <div class="teams">

            <div class="team">

                <img
                    src="${fixture.teams.home.logo}"
                    class="team-logo"
                >

                <div class="team-name">
                    ${fixture.teams.home.name}
                </div>

            </div>

            <div class="score">

                ${fixture.goals.home !== null
                    ? fixture.goals.home
                    : "-"}

                :

                ${fixture.goals.away !== null
                    ? fixture.goals.away
                    : "-"}

            </div>

            <div class="team">

                <img
                    src="${fixture.teams.away.logo}"
                    class="team-logo"
                >

                <div class="team-name">
                    ${fixture.teams.away.name}
                </div>

            </div>

        </div>
    `;

    return card;
}

// ===========================
// OPEN MATCH DETAIL
// ===========================

async function openMatchDetail(fixture) {

    const modal =
        document.getElementById("team-modal");

    modal.style.display = "block";

    document.getElementById(
        "modal-team-header"
    ).innerHTML = `

        <h2 style="text-align:center;padding:20px;">

            ${fixture.teams.home.name}

            <img
                src="${fixture.teams.home.logo}"
                width="40"
            >

            VS

            <img
                src="${fixture.teams.away.logo}"
                width="40"
            >

            ${fixture.teams.away.name}

        </h2>

    `;

    // DEMO VIDEO

    document.getElementById("live-video").src =
        "https://www.youtube.com/embed/dQw4w9WgXcQ";

    const fixtureId = fixture.fixture.id;

    loadLineups(fixtureId);
    loadStats(fixtureId);
    loadEvents(fixtureId);
    loadOdds(fixtureId);
    loadPreview(fixture);
}

// ===========================
// LINEUPS
// ===========================

async function loadLineups(fixtureId) {

    const data = await apiCall(
        "/fixtures/lineups",
        {
            fixture: fixtureId
        }
    );

    const container =
        document.getElementById("lineup-content");

    if (!data || data.length === 0) {

        container.innerHTML =
            "<p>Lineups not available.</p>";

        return;
    }

    let html = '<div class="lineups">';

    data.forEach(teamLineup => {

        html += `

            <div class="lineup-team">

                <h3>
                    ${teamLineup.team.name}
                    (${teamLineup.formation})
                </h3>

                <ul style="list-style:none;">

                    ${teamLineup.startXI.map(player => `

                        <li style="padding:5px 0;">

                            ${player.player.number}
                            -
                            ${player.player.name}

                        </li>

                    `).join("")}

                </ul>

            </div>

        `;
    });

    html += "</div>";

    container.innerHTML = html;
}

// ===========================
// STATS
// ===========================

async function loadStats(fixtureId) {

    const data = await apiCall(
        "/fixtures/statistics",
        {
            fixture: fixtureId
        }
    );

    const container =
        document.getElementById("stats-content");

    if (!data || data.length < 2) {

        container.innerHTML =
            "<p>No statistics available.</p>";

        return;
    }

    const home = data[0];
    const away = data[1];

    let html = "";

    home.statistics.forEach((stat, index) => {

        html += `

            <div class="stat-category">

                <div class="stat-item">

                    <span>${stat.type}</span>

                    <span>

                        ${stat.value || 0}

                        -

                        ${away.statistics[index]?.value || 0}

                    </span>

                </div>

            </div>

        `;
    });

    container.innerHTML = html;
}

// ===========================
// EVENTS
// ===========================

async function loadEvents(fixtureId) {

    const events = await apiCall(
        "/fixtures/events",
        {
            fixture: fixtureId
        }
    );

    let html = `
        <h3 style="margin-bottom:20px;">
            Match Events
        </h3>

        <ul style="list-style:none;">
    `;

    if (events && events.length > 0) {

        events.forEach(ev => {

            html += `

                <li style="
                    padding:12px;
                    margin-bottom:10px;
                    background:#334155;
                    border-radius:10px;
                ">

                    <strong>
                        ${ev.time.elapsed}'
                    </strong>

                    -

                    ${ev.team.name}

                    -

                    ${ev.type}

                    (${ev.detail || ""})

                    ${ev.player
                        ? "- " + ev.player.name
                        : ""}

                </li>

            `;
        });

    } else {

        html += `
            <li>No events available.</li>
        `;
    }

    html += "</ul>";

    document.getElementById(
        "events-content"
    ).innerHTML = html;
}

// ===========================
// ODDS
// ===========================

async function loadOdds(fixtureId) {

    const odds = await apiCall(
        "/odds",
        {
            fixture: fixtureId
        }
    );

    let html = `
        <h3 style="margin-bottom:20px;">
            Betting Odds
        </h3>
    `;

    if (odds && odds.length > 0) {

        odds.forEach(book => {

            html += `

                <div style="
                    background:#334155;
                    padding:15px;
                    border-radius:10px;
                    margin-bottom:10px;
                ">

                    <strong>

                        ${book.bookmakers?.[0]?.name || "Bookmaker"}

                    </strong>

                </div>

            `;
        });

    } else {

        html += `
            <p>Odds unavailable.</p>
        `;
    }

    document.getElementById(
        "odds-content"
    ).innerHTML = html;
}

// ===========================
// PREVIEW
// ===========================

function loadPreview(fixture) {

    document.getElementById(
        "preview-content"
    ).innerHTML = `

        <h3 style="margin-bottom:20px;">
            Match Preview
        </h3>

        <p>

            <strong>
                ${fixture.teams.home.name}
            </strong>

            VS

            <strong>
                ${fixture.teams.away.name}
            </strong>

        </p>

        <br>

        <p>
            Competition:
            ${fixture.league.name}
        </p>

        <p>
            Venue:
            ${fixture.fixture.venue?.name || "Unknown"}
        </p>

        <p>
            Match Date:
            ${new Date(fixture.fixture.date)
                .toLocaleString()}
        </p>

    `;
}

// ===========================
// LOAD LEAGUES
// ===========================

async function loadLeagues() {

    const leagues = await apiCall("/leagues");

    const select =
        document.getElementById("league-select");

    select.innerHTML =
        '<option value="">Select League</option>';

    if (!leagues) return;

    leagues.slice(0, 20).forEach(l => {

        const opt =
            document.createElement("option");

        opt.value = l.league.id;

        opt.textContent =
            `${l.league.name} (${l.country.name})`;

        select.appendChild(opt);

    });
}

// ===========================
// LOAD STANDINGS
// ===========================

async function loadStandings() {

    const leagueId =
        document.getElementById("league-select")
        .value;

    if (!leagueId) return;

    const standings = await apiCall(
        "/standings",
        {
            league: leagueId,
            season: "2025"
        }
    );

    const tbody =
        document.getElementById("standings-body");

    tbody.innerHTML = "";

    if (!standings || !standings[0]) return;

    standings[0].league.standings[0]
    .forEach(team => {

        const tr = document.createElement("tr");

        tr.innerHTML = `

            <td>${team.rank}</td>

            <td>

                <img
                    src="${team.team.logo}"
                    width="24"
                    style="
                        vertical-align:middle;
                        margin-right:8px;
                    "
                >

                ${team.team.name}

            </td>

            <td>${team.all.played}</td>
            <td>${team.all.win}</td>
            <td>${team.all.draw}</td>
            <td>${team.all.lose}</td>
            <td>${team.all.goals.for}</td>
            <td>${team.all.goals.against}</td>
            <td>${team.goalsDiff}</td>

            <td>
                <strong>${team.points}</strong>
            </td>

        `;

        tbody.appendChild(tr);

    });
}

// ===========================
// TAB SWITCH
// ===========================

function switchTab(index) {

    document.querySelectorAll(".tab-content")
    .forEach(tab => {
        tab.classList.remove("active");
    });

    document.querySelectorAll(".tab-btn")
    .forEach(btn => {
        btn.classList.remove("active");
    });

    const tabs = [
        "tab-video",
        "tab-lineup",
        "tab-stats",
        "tab-events",
        "tab-odds",
        "tab-preview"
    ];

    document.getElementById(tabs[index])
        .classList.add("active");

    document.querySelectorAll(".tab-btn")[index]
        .classList.add("active");
}

// ===========================
// CLOSE MODAL
// ===========================

function closeModal() {

    document.getElementById("team-modal")
        .style.display = "none";

    document.getElementById("live-video")
        .src = "";
}

// ===========================
// SEARCH
// ===========================

function searchTeams() {

    const term =
        document.getElementById("searchInput")
        .value
        .toLowerCase();

    const cards =
        document.querySelectorAll(".match-card");

    cards.forEach(card => {

        const text =
            card.innerText.toLowerCase();

        if (text.includes(term)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

// ===========================
// CLOSE MODAL OUTSIDE CLICK
// ===========================

window.onclick = function(event) {

    const modal =
        document.getElementById("team-modal");

    if (event.target === modal) {
        closeModal();
    }
};

// ===========================
// INIT APP
// ===========================

window.onload = () => {

    loadLiveMatches();

    setInterval(() => {

        if (
            document.getElementById("live-section")
            .classList.contains("active")
        ) {

            loadLiveMatches();
        }

    }, 30000);
};
