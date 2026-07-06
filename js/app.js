const LOCAL_CREATURE_DATA = {"source":{"project":"ARK Smart Breeding / ARKStatsExtractor","url":"https://github.com/cadon/ARKStatsExtractor/blob/master/ARKBreedingStats/json/values/values.json","adaptedOn":"2026-07-06","notes":"MVP subset adapted from species entries in values.json. fullStatsRaw stat indexes used: 0 health, 1 stamina, 3 oxygen, 4 food, 7 weight, 8 melee. For each stat, baseValue is fullStatsRaw[index][0] and wildIncrement is fullStatsRaw[index][1]. Breeding incubationSeconds, gestationSeconds, and maturationSeconds are mapped from incubationTime, gestationTime, and maturationTime. Base non-mission/non-gauntlet variants were selected where available; otherwise the standard species values shared by variants were used."},"creatures":[{"id":"rex","name":"Rex","tameable":true,"breedable":true,"stats":{"health":{"baseValue":1100,"wildIncrement":0.2},"stamina":{"baseValue":420,"wildIncrement":0.1},"oxygen":{"baseValue":150,"wildIncrement":0.1},"food":{"baseValue":3000,"wildIncrement":0.1},"weight":{"baseValue":500,"wildIncrement":0.02},"melee":{"baseValue":1,"wildIncrement":0.05}},"breeding":{"incubationSeconds":17998.5601,"gestationSeconds":0,"maturationSeconds":333333.333}},{"id":"argentavis","name":"Argentavis","tameable":true,"breedable":true,"stats":{"health":{"baseValue":365,"wildIncrement":0.2},"stamina":{"baseValue":400,"wildIncrement":0.05},"oxygen":{"baseValue":150,"wildIncrement":0.1},"food":{"baseValue":2000,"wildIncrement":0.1},"weight":{"baseValue":400,"wildIncrement":0.02},"melee":{"baseValue":1,"wildIncrement":0.05}},"breeding":{"incubationSeconds":10587.3883,"gestationSeconds":0,"maturationSeconds":196078.431}},{"id":"therizinosaur","name":"Therizinosaur","tameable":true,"breedable":true,"stats":{"health":{"baseValue":870,"wildIncrement":0.2},"stamina":{"baseValue":300,"wildIncrement":0.1},"oxygen":{"baseValue":150,"wildIncrement":0.1},"food":{"baseValue":3000,"wildIncrement":0.1},"weight":{"baseValue":365,"wildIncrement":0.02},"melee":{"baseValue":1,"wildIncrement":0.05}},"breeding":{"incubationSeconds":5999.52004,"gestationSeconds":0,"maturationSeconds":416666.667}},{"id":"giganotosaurus","name":"Giganotosaurus","tameable":true,"breedable":true,"stats":{"health":{"baseValue":80000,"wildIncrement":0.0005},"stamina":{"baseValue":400,"wildIncrement":0.0005},"oxygen":{"baseValue":150,"wildIncrement":0.0025},"food":{"baseValue":4000,"wildIncrement":0.0025},"weight":{"baseValue":700,"wildIncrement":0.01},"melee":{"baseValue":1,"wildIncrement":0.05}},"breeding":{"incubationSeconds":179985.601,"gestationSeconds":0,"maturationSeconds":878348.704}},{"id":"ankylosaurus","name":"Ankylosaurus","tameable":true,"breedable":true,"stats":{"health":{"baseValue":700,"wildIncrement":0.2},"stamina":{"baseValue":175,"wildIncrement":0.1},"oxygen":{"baseValue":150,"wildIncrement":0.1},"food":{"baseValue":3000,"wildIncrement":0.1},"weight":{"baseValue":250,"wildIncrement":0.02},"melee":{"baseValue":1,"wildIncrement":0.05}},"breeding":{"incubationSeconds":9472.92638,"gestationSeconds":0,"maturationSeconds":175438.596}}]};
const STAT_KEYS = ["health", "stamina", "oxygen", "food", "weight", "melee"];
const LABELS = { health: "Health", stamina: "Stamina", oxygen: "Oxygen", food: "Food", weight: "Weight", melee: "Melee" };
let creatures = [];
let selectedCreature;

const $ = (id) => document.getElementById(id);
const numberValue = (id, fallback = 0) => Number($(id)?.value) || fallback;

async function loadCreatures() {
  let data;
  try {
    const response = await fetch("data/creatures.json");
    if (!response.ok) throw new Error("Unable to load creature data");
    data = await response.json();
  } catch (error) {
    console.warn("Falling back to embedded creature data for file:// local use.", error);
    data = LOCAL_CREATURE_DATA;
  }
  creatures = data.creatures;
  const select = $("creatureSelect");
  select.innerHTML = creatures.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
  selectedCreature = creatures[0];
  buildInputs();
  bindEvents();
  calculateAll();
}

function buildInputs() {
  $("wildInputs").innerHTML = statInputs("wild", "Wild points");
  $("maleInputs").innerHTML = statInputs("male", "Points");
  $("femaleInputs").innerHTML = statInputs("female", "Points");
  $("babyInputs").innerHTML = statInputs("baby", "Baby points");
}

function statInputs(prefix, suffix) {
  return STAT_KEYS.map((stat) => `<label>${LABELS[stat]} ${suffix}<input id="${prefix}-${stat}" type="number" min="0" step="1" value="0"></label>`).join("");
}

function bindEvents() {
  document.addEventListener("input", calculateAll);
  $("creatureSelect").addEventListener("change", (event) => {
    selectedCreature = creatures.find((creature) => creature.id === event.target.value);
    calculateAll();
  });
  $("resetSettings").addEventListener("click", () => {
    $("wildMultiplier").value = 1;
    $("tamedMultiplier").value = 1;
    $("maturationMultiplier").value = 1;
    calculateAll();
  });
  document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => switchTab(tab.dataset.tab)));
}

function switchTab(tabId) {
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === tabId));
  document.querySelectorAll(".panel").forEach((panel) => panel.classList.toggle("active", panel.id === tabId));
}

function calculateAll() {
  if (!selectedCreature) return;
  $("creatureMeta").innerHTML = `<span class="badge">${selectedCreature.name}</span> Tameable: ${yesNo(selectedCreature.tameable)} · Breedable: ${yesNo(selectedCreature.breedable)}`;
  renderWildStats();
  const best = renderPlanner();
  renderMutations(best);
  renderTimers();
}

function renderWildStats() {
  const multiplier = numberValue("wildMultiplier", 1);
  const rows = STAT_KEYS.map((stat) => {
    const points = numberValue(`wild-${stat}`);
    const values = selectedCreature.stats[stat];
    const displayed = values.baseValue * (1 + points * values.wildIncrement * multiplier);
    return `<tr><td>${LABELS[stat]}</td><td>${points}</td><td>${formatStat(stat, values.baseValue)}</td><td>${(values.wildIncrement * 100).toFixed(2)}%</td><td>${formatStat(stat, displayed)}</td></tr>`;
  }).join("");
  $("wildResults").innerHTML = table(["Stat", "Wild points", "Base", "Gain / point", "Displayed wild stat"], rows);
}

function renderPlanner() {
  const inherited = {};
  let total = 0;
  const rows = STAT_KEYS.map((stat) => {
    const male = numberValue(`male-${stat}`);
    const female = numberValue(`female-${stat}`);
    const source = male === female ? "Tie" : male > female ? "Male" : "Female";
    const best = Math.max(male, female);
    inherited[stat] = best;
    total += best;
    return `<tr><td>${LABELS[stat]}</td><td>${male}</td><td>${female}</td><td>${best}</td><td>${source}</td></tr>`;
  }).join("");
  const babyLevel = 1 + total;
  const recommendation = buildRecommendation();
  $("plannerResults").innerHTML = `${table(["Stat", "Male", "Female", "Best inherited", "Source"], rows)}<h3>Estimated best baby level: ${babyLevel}</h3><p class="recommendation">${recommendation}</p>`;
  return inherited;
}

function buildRecommendation() {
  const wins = STAT_KEYS.map((stat) => ({ stat, male: numberValue(`male-${stat}`), female: numberValue(`female-${stat}`) }))
    .filter((item) => item.male !== item.female)
    .sort((a, b) => Math.abs(b.male - b.female) - Math.abs(a.male - a.female));
  if (wins.length === 0) return "Both parents are tied for tracked stats; use this pair to preserve the current line.";
  const first = wins[0];
  const second = wins.find((item) => (item.male > item.female) !== (first.male > first.female));
  if (!second) return `Use this pair if you want to stack ${first.male > first.female ? "Male" : "Female"} strengths, especially ${LABELS[first.stat].toLowerCase()}.`;
  return `Use this pair if you want to combine ${first.male > first.female ? "Male" : "Female"} ${LABELS[first.stat].toLowerCase()} with ${second.male > second.female ? "Male" : "Female"} ${LABELS[second.stat].toLowerCase()}.`;
}

function renderMutations(best) {
  const rows = STAT_KEYS.map((stat) => {
    const baby = numberValue(`baby-${stat}`);
    const expected = best[stat] + 2;
    const likely = baby === expected;
    return `<tr><td>${LABELS[stat]}</td><td>${best[stat]}</td><td>${baby}</td><td class="${likely ? "mutation" : "no-mutation"}">${likely ? "Likely mutation" : "No +2 mutation"}</td></tr>`;
  }).join("");
  $("mutationResults").innerHTML = table(["Stat", "Best parent points", "Baby points", "Result"], rows);
}

function renderTimers() {
  const multiplier = numberValue("maturationMultiplier", 1);
  const b = selectedCreature.breeding;
  const rows = [["Incubation", b.incubationSeconds], ["Gestation", b.gestationSeconds], ["Maturation", b.maturationSeconds]]
    .map(([label, seconds]) => `<tr><td>${label}</td><td>${formatDuration(seconds)}</td><td>${formatDuration(seconds / multiplier)}</td></tr>`).join("");
  $("timerResults").innerHTML = table(["Timer", "Official/base", "Adjusted"], rows);
}

function table(headers, rows) { return `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table>`; }
function yesNo(value) { return value ? "Yes" : "No"; }
function formatStat(stat, value) { return stat === "melee" ? `${(value * 100).toFixed(1)}%` : Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 }); }
function formatDuration(totalSeconds) {
  if (!totalSeconds) return "N/A";
  const minutes = Math.round(totalSeconds / 60);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  return [days && `${days}d`, hours && `${hours}h`, `${mins}m`].filter(Boolean).join(" ");
}

loadCreatures().catch((error) => { document.body.innerHTML = `<main class="shell"><section class="card"><h1>Could not load data</h1><p>${error.message}</p></section></main>`; });
