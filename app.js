const prompts = [
  "What makes an ordinary object become art?",
  "What changed when you encountered this work in context?",
  "What idea from today will stay with you?"
];

const sampleResponses = [
  { discipline: "Engineering & Computing", text: "The context changes how I inspect the object, but I still look for evidence that it was intentionally transformed." },
  { discipline: "Health & Life Sciences", text: "It becomes art when it changes how a person feels or notices their surroundings." },
  { discipline: "Business", text: "The institution and audience give the object a value it did not have before." }
];

const state = {
  activePrompt: 0,
  acceptingResponses: true,
  responses: [],
  draft: null
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function escapeText(value) {
  const node = document.createElement("div");
  node.textContent = value;
  return node.textContent;
}

function buildReflection(text) {
  const normalized = text.trim();
  const lower = normalized.toLowerCase();

  if (lower.includes("not art") || lower.includes("isn't art") || lower.includes("is not art")) {
    return "You are drawing a boundary between an ordinary object and an artwork. Your response suggests that presenting an existing object may not be enough to change what it fundamentally is for you. This reaction brings forward the larger question of where artistic meaning begins.";
  }
  if (lower.includes("empty") || lower.includes("absence") || lower.includes("missing")) {
    return "You noticed a tension between emptiness and presence. Rather than treating empty space as simply lacking something, your response suggests that it can make what is missing feel more tangible. You are recognizing how absence itself can carry meaning.";
  }
  return "Your response begins with a clear personal judgment and connects it to the way the work was encountered. It suggests that meaning is not located in the object alone, but also in the attention, expectations, and context brought to it. That relationship is central to what your response brings forward.";
}

function clarify(text) {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).replace(/[.!?]*$/, ".");
}

function renderStudentPrompt() {
  $("#promptTitle").textContent = prompts[state.activePrompt];
  $("#promptPosition").textContent = `Prompt ${state.activePrompt + 1} of ${prompts.length}`;
  $("#responseCount").textContent = `${state.responses.length} perspectives shared`;
  $("#responseForm button[type='submit']").disabled = !state.acceptingResponses;
}

function renderClassView() {
  const grid = $("#perspectiveGrid");
  grid.replaceChildren();
  const responses = [...sampleResponses, ...state.responses];

  responses.forEach(({ discipline, text }) => {
    const card = document.createElement("article");
    card.className = "perspective-card";
    const label = document.createElement("span");
    label.className = "version-label";
    label.textContent = discipline;
    const copy = document.createElement("p");
    copy.textContent = text;
    card.append(label, copy);
    grid.append(card);
  });
}

function renderInstructor() {
  $("#activePromptTitle").textContent = prompts[state.activePrompt];
  $("#metricResponses").textContent = state.responses.length;
  $("#metricDisciplines").textContent = new Set(state.responses.map(r => r.discipline)).size;
  $("#togglePrompt").textContent = state.acceptingResponses ? "Close responses" : "Reopen responses";

  const list = $("#promptList");
  list.replaceChildren();
  prompts.forEach((prompt, index) => {
    const button = document.createElement("button");
    button.className = `prompt-item${index === state.activePrompt ? " active" : ""}`;
    button.type = "button";
    button.innerHTML = `<span class="prompt-number">${String(index + 1).padStart(2, "0")}</span><span></span>`;
    button.lastElementChild.textContent = prompt;
    button.addEventListener("click", () => launchPrompt(index));
    list.append(button);
  });

  $("#liveSummary").textContent = state.responses.length
    ? "Students are approaching the prompt through different criteria, including intention, emotional effect, and institutional context."
    : "Patterns will appear as students share responses.";
}

function launchPrompt(index) {
  state.activePrompt = index;
  state.acceptingResponses = true;
  state.responses = [];
  resetStudentView();
  renderStudentPrompt();
  renderInstructor();
}

function resetStudentView() {
  $("#responsePanel").hidden = false;
  $("#reflectionPanel").hidden = true;
  $("#classPanel").hidden = true;
}

$$('.role-button').forEach(button => {
  button.addEventListener("click", () => {
    $$('.role-button').forEach(item => item.classList.toggle("active", item === button));
    const instructor = button.dataset.view === "instructor";
    $("#studentView").hidden = instructor;
    $("#instructorView").hidden = !instructor;
    if (instructor) renderInstructor();
  });
});

$("#responseText").addEventListener("input", event => {
  $("#charCount").textContent = `${event.target.value.length} / 500`;
});

$$('input[name="responseMode"]').forEach(input => {
  input.addEventListener("change", () => {
    if (!input.checked) return;
    $("#responseSubmit").textContent = input.value === "polished"
      ? "Polish with PRISM"
      : "Continue with my words";
  });
});

$("#responseForm").addEventListener("submit", event => {
  event.preventDefault();
  if (!state.acceptingResponses) return;
  const text = $("#responseText").value.trim();
  const discipline = $('input[name="discipline"]:checked')?.value;
  const responseMode = $('input[name="responseMode"]:checked')?.value;
  if (!text || !discipline || !responseMode) return;

  state.draft = {
    discipline,
    original: escapeText(text),
    clarified: clarify(text),
    reflection: buildReflection(text),
    responseMode
  };

  $("#privateReflection").textContent = state.draft.reflection;
  $("#originalResponse").textContent = state.draft.original;
  $("#clarifiedResponse").textContent = state.draft.clarified;
  $("#originalVersionCard").hidden = responseMode !== "original";
  $("#polishedVersionCard").hidden = responseMode !== "polished";
  $("#responsePanel").hidden = true;
  $("#reflectionPanel").hidden = false;
});

function shareResponse(version) {
  if (!state.draft) return;
  state.responses.push({
    discipline: state.draft.discipline,
    text: version === "original" ? state.draft.original : state.draft.clarified
  });
  $("#reflectionPanel").hidden = true;
  $("#classPanel").hidden = false;
  renderClassView();
  renderStudentPrompt();
  renderInstructor();
}

$("#shareOriginal").addEventListener("click", () => shareResponse("original"));
$("#shareClarified").addEventListener("click", () => shareResponse("clarified"));
$("#returnToPrompt").addEventListener("click", resetStudentView);

$("#togglePrompt").addEventListener("click", () => {
  state.acceptingResponses = !state.acceptingResponses;
  renderStudentPrompt();
  renderInstructor();
});

$("#nextPrompt").addEventListener("click", () => {
  launchPrompt(Math.min(state.activePrompt + 1, prompts.length - 1));
});

$("#newPromptButton").addEventListener("click", () => $("#promptDialog").showModal());
$("#promptForm").addEventListener("submit", event => {
  if (event.submitter?.value === "cancel") return;
  event.preventDefault();
  const value = $("#newPromptText").value.trim();
  if (!value) return;
  prompts.push(value);
  $("#newPromptText").value = "";
  $("#promptDialog").close();
  renderInstructor();
  renderStudentPrompt();
});

renderStudentPrompt();
renderClassView();
renderInstructor();
