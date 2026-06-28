/* app.js — 폼 ↔ 스펙 ↔ .docx 생성 */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  var val = function (id) { var e = $(id); return e ? e.value.trim() : ""; };
  var setVal = function (id, v) { var e = $(id); if (e) e.value = (v == null ? "" : v); };
  var checked = function (id) { var e = $(id); return e ? e.checked : false; };
  var lines = function (t) { return (t || "").split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean); };
  var splitList = function (t) { return (t || "").split(/[,，、]/).map(function (s) { return s.trim(); }).filter(Boolean); };

  var mode = "writing";
  var state = clone(window.PRESETS.writing); // 작업용 전체 스펙(steps·rubric 등 구조 보존)

  // ---------------- 동적 목록 렌더 ----------------
  function rowDel(onClick) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "del"; b.title = "삭제"; b.textContent = "×";
    b.addEventListener("click", onClick);
    return b;
  }

  function renderStandards(arr) {
    var box = $("standardsList"); box.innerHTML = "";
    (arr && arr.length ? arr : [{ code: "", text: "" }]).forEach(function (s) {
      var row = document.createElement("div"); row.className = "row";
      var code = document.createElement("input");
      code.type = "text"; code.className = "code-in"; code.placeholder = "12영Ⅱ-02-01"; code.value = s.code || "";
      var text = document.createElement("input");
      text.type = "text"; text.className = "text-in"; text.placeholder = "성취기준 문장"; text.value = s.text || "";
      [code, text].forEach(function (i) { i.addEventListener("input", live); });
      row.appendChild(code); row.appendChild(text);
      row.appendChild(rowDel(function () { row.remove(); live(); }));
      box.appendChild(row);
    });
  }
  function readStandards() {
    return [].slice.call($("standardsList").querySelectorAll(".row")).map(function (r) {
      return { code: r.querySelector(".code-in").value.trim(), text: r.querySelector(".text-in").value.trim() };
    }).filter(function (s) { return s.code || s.text; });
  }

  function renderCondList(kind, arr) {
    var box = $(kind + "List"); box.innerHTML = "";
    var items = (arr && arr.length) ? arr.slice() : ["", "", "", "", ""];
    while (items.length < 5) items.push("");
    items.forEach(function (v, i) { box.appendChild(condRow(kind, i + 1, v)); });
    updateCount(kind);
  }
  function condRow(kind, n, v) {
    var row = document.createElement("div"); row.className = "row";
    var num = document.createElement("span"); num.className = "num"; num.textContent = n;
    var inp = document.createElement("input");
    inp.type = "text"; inp.className = "text-in";
    inp.placeholder = kind === "expr" ? "예: I suggest that S+V — 제안하기" : "예: 가정법 과거 / to부정사의 부사적 용법";
    inp.value = v || "";
    inp.addEventListener("input", function () { updateCount(kind); live(); });
    row.appendChild(num); row.appendChild(inp);
    row.appendChild(rowDel(function () { row.remove(); renumber(kind); updateCount(kind); live(); }));
    return row;
  }
  function renumber(kind) {
    [].slice.call($(kind + "List").querySelectorAll(".row")).forEach(function (r, i) { r.querySelector(".num").textContent = i + 1; });
  }
  function readCondList(kind) {
    return [].slice.call($(kind + "List").querySelectorAll(".text-in")).map(function (i) { return i.value.trim(); }).filter(Boolean);
  }
  function updateCount(kind) {
    var filled = readCondList(kind).length;
    var el = $(kind + "Count"); el.textContent = filled + "개";
    el.classList.remove("full");
  }

  // ---------------- 섹션 텍스트 직렬화(쓰기 2차시) ----------------
  function serializeSections(arr) {
    return (arr || []).map(function (s) { return (s.label || "") + " | " + (s.lines || 4); }).join("\n");
  }
  function parseSections(t) {
    return lines(t).map(function (ln) {
      var i = ln.lastIndexOf("|");
      if (i < 0) return { label: ln, lines: 4 };
      var label = ln.slice(0, i).trim();
      var n = parseInt(ln.slice(i + 1).trim(), 10);
      return { label: label, lines: isNaN(n) ? 4 : n };
    }).filter(function (s) { return s.label; });
  }

  // ---------------- 폼 채우기 (state → 화면) ----------------
  function fillForm() {
    setVal("title", state.title); setVal("subtitle", state.subtitle);
    setVal("school", state.school); setVal("grade", state.grade);
    setVal("purpose", state.purpose);
    renderStandards(state.standards);
    var c = state.conditions || {};
    setVal("length", c.length);
    setVal("contentElements", (c.content_elements || []).join(", "));
    renderCondList("expr", c.required_expressions);
    renderCondList("gram", c.required_grammar);

    if (mode === "writing") {
      var s1 = state.session1 || {}, s2 = state.session2 || {};
      $("mindmapOn").checked = s1.mindmap !== false;
      setVal("mindmapTopic", s1.mindmap_topic);
      setVal("lengthNote", s2.length_note);
      setVal("writingSections", serializeSections(s2.sections));
    } else {
      var sp1 = state.session1 || {}, sp2 = state.session2 || {};
      setVal("keyCount", (sp1.key_sentences && sp1.key_sentences.count) || 4);
      setVal("timeLimit", sp2.time_limit);
      setVal("selfEval", (sp1.self_eval || []).join("\n"));
      setVal("peerEval", (sp1.peer_eval || []).join("\n"));
    }
    $("rubricOn").checked = !!state.rubric;
    renderRubric();
    $("modelOn").checked = !!state.model_answer;
    $("modelWrap").hidden = !state.model_answer;
    setVal("modelAnswer", state.model_answer || "");
    setVal("modelNotes", (state.model_answer_notes || []).join("\n"));
    applyModeUI();
  }

  // ---------------- 스펙 조립 (화면 → 스펙) ----------------
  function collectSpec() {
    var s = clone(state);          // steps·outline_card·rubric 서술어 등 구조 유지
    s.mode = mode;
    s.title = val("title"); s.subtitle = val("subtitle");
    s.school = val("school"); s.grade = val("grade"); s.purpose = val("purpose");
    s.standards = readStandards();
    s.conditions = s.conditions || {};
    s.conditions.length = val("length");
    s.conditions.content_elements = splitList(val("contentElements"));
    s.conditions.required_expressions = readCondList("expr");
    s.conditions.required_grammar = readCondList("gram");

    if (mode === "writing") {
      s.session1 = s.session1 || {};
      s.session1.mindmap = checked("mindmapOn");
      s.session1.mindmap_topic = val("mindmapTopic");
      s.session2 = s.session2 || {};
      s.session2.length_note = val("lengthNote");
      var secs = parseSections(val("writingSections"));
      if (secs.length) s.session2.sections = secs;
    } else {
      s.session1 = s.session1 || {};
      s.session1.key_sentences = s.session1.key_sentences || {};
      var kc = parseInt(val("keyCount"), 10); s.session1.key_sentences.count = isNaN(kc) ? 4 : kc;
      s.session1.self_eval = lines(val("selfEval"));
      s.session1.peer_eval = lines(val("peerEval"));
      s.session2 = s.session2 || {};
      s.session2.time_limit = val("timeLimit");
    }

    if (!checked("rubricOn")) delete s.rubric;
    if (checked("modelOn")) { s.model_answer = val("modelAnswer"); s.model_answer_notes = lines(val("modelNotes")); }
    else { delete s.model_answer; delete s.model_answer_notes; }
    return s;
  }

  // ---------------- 루브릭 미리보기 ----------------
  function renderRubric() {
    var box = $("rubricPreview");
    var r = state.rubric;
    if (!r || !checked("rubricOn")) { box.innerHTML = ""; box.style.display = checked("rubricOn") ? "" : "none"; return; }
    box.style.display = "";
    var levels = r.levels || ["A", "B", "C", "D", "E"];
    var crits = r.criteria || [];
    var ne = readCondList("expr").length, ng = readCondList("gram").length;
    var fmtW = function (w) {
      return String(w).replace(/\{NE\}/g, ne > 0 ? (" " + ne) : "").replace(/\{NG\}/g, ng > 0 ? (" " + ng) : "");
    };
    var html = '<table class="rub"><thead><tr><th>수준</th>' +
      crits.map(function (cr) { return "<th>" + esc(cr.name) + (cr.weight ? "<small>(" + esc(fmtW(cr.weight)) + ")</small>" : "") + "</th>"; }).join("") + "</tr></thead><tbody>";
    levels.forEach(function (l) {
      html += '<tr><td class="crit">' + esc(l) + "</td>";
      crits.forEach(function (cr) {
        var d = (cr.descriptors && (cr.descriptors[l] != null ? cr.descriptors[l] : cr.descriptors[levels.indexOf(l)])) || "";
        html += '<td class="lv">' + esc(String(d)) + "</td>";
      });
      html += "</tr>";
    });
    html += "</tbody></table>";
    box.innerHTML = html;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }

  // ---------------- 생성될 구성 미리보기 ----------------
  function renderOutline(spec) {
    var ol = $("outline"); ol.innerHTML = "";
    var add = function (html) { var li = document.createElement("li"); li.innerHTML = html; ol.appendChild(li); };
    add("<b>평가 안내</b> — 목적·성취기준 " + (spec.standards || []).length + "개·조건(표현 " + (spec.conditions.required_expressions || []).length + "·문법 " + (spec.conditions.required_grammar || []).length + ")");
    if (spec.mode === "writing") {
      var s1 = spec.session1 || {}, s2 = spec.session2 || {};
      var step = 0;
      var parts = [];
      if (s1.mindmap !== false) { step++; parts.push("STEP " + step + " 마인드맵"); }
      (s1.steps || []).forEach(function (st) { step++; parts.push("STEP " + step + " " + st.title + (st.points != null ? " (" + st.points + "점)" : "")); });
      add("<b>쓰기 1차시</b> — " + (parts.join(" · ") || "단계별 구상"));
      add("<b>쓰기 2차시</b> — 작성 지침 + 제안서 머리 + 본문 " + ((s2.sections || []).length || 4) + "섹션");
    } else {
      var sp1 = spec.session1 || {};
      add("<b>말하기 1차시</b> — 개요 카드 · 핵심 문장 " + ((sp1.key_sentences && sp1.key_sentences.count) || 4) + "칸 · 자기평가 · 동료평가");
      add("<b>말하기 2차시</b> — 구술 (" + ((spec.session2 || {}).time_limit || "시간 미정") + ")");
    }
    if (spec.rubric) add("<b>채점 기준(교사용)</b> — 성취수준 " + (spec.rubric.levels || ["A", "B", "C", "D", "E"]).join("·"));
    if (spec.model_answer) add("<b>예시 답안(교사용)</b>");
  }

  // ---------------- live 갱신 ----------------
  var liveTimer = null;
  function live() {
    clearTimeout(liveTimer);
    liveTimer = setTimeout(function () {
      var spec = collectSpec();
      renderOutline(spec);
      renderRubric();
      if (!checked("useJson")) {
        $("specJson").value = JSON.stringify(spec, null, 2);
        $("jsonStatus").textContent = ""; $("jsonStatus").className = "json-status";
      }
    }, 120);
  }

  // ---------------- 모드 UI ----------------
  function applyModeUI() {
    $("writingSession").hidden = mode !== "writing";
    $("speakingSession").hidden = mode === "speaking" ? false : true;
    [].slice.call($("modeSeg").querySelectorAll(".seg-btn")).forEach(function (b) {
      var on = b.dataset.mode === mode;
      b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    $("modeHint").textContent = mode === "writing"
      ? "단계별 구상 → 제안서 작성 (자기·동료평가 없음)"
      : "개요 카드 · 핵심 문장 · 자기/동료평가 → 구술";
  }

  function switchMode(next) {
    if (next === mode) return;
    // 두 버전은 한 세트: 표현·문법·학교·학년은 그대로 이어 쓴다
    var carry = {
      exprs: readCondList("expr"), grams: readCondList("gram"),
      school: val("school"), grade: val("grade")
    };
    mode = next;
    state = clone(window.PRESETS[mode]);
    if (carry.exprs.length) state.conditions.required_expressions = carry.exprs;
    if (carry.grams.length) state.conditions.required_grammar = carry.grams;
    if (carry.school) state.school = carry.school;
    if (carry.grade) state.grade = carry.grade;
    $("useJson").checked = false;
    fillForm(); live();
  }

  // ---------------- 다운로드 ----------------
  function sanitize(name) {
    return (name || "").replace(/[\/\\:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  }
  function setStatus(msg, kind) { var e = $("status"); e.textContent = msg || ""; e.className = "status" + (kind ? " " + kind : ""); }

  function getSpecForGenerate() {
    if (checked("useJson")) {
      var raw = $("specJson").value;
      var parsed = JSON.parse(raw); // 실패 시 throw → 호출부에서 처리
      return parsed;
    }
    return collectSpec();
  }

  // ---------------- AI용 프롬프트 ----------------
  function schemaFor(mode) {
    var common = {
      mode: mode,
      title: "<<워크시트 제목 — 교과서 단원에 맞게>>",
      subtitle: "<<영문 부제 (선택)>>",
      school: "<<학교명 (선택)>>",
      grade: "<<학년 (예: 2)>>",
      purpose: "<<평가 목적 한 문장 — 교과서 단원 내용에 근거하여>>",
      standards: [{ code: "12영Ⅱ-XX-XX", text: "<<선택한 2022 성취기준 문장>>" }],
      conditions: {
        length: "<<분량/시간 조건>>",
        content_elements: ["<<반드시 포함할 내용 요소 1>>", "<<요소 2>>"],
        required_expressions: ["<<교과서·지문에 근거한 필수 영어 표현 — 보통 5개, 개수 자유>>"],
        required_grammar: ["<<교과서·지문에 근거한 필수 문법 항목 — 보통 5개, 개수 자유>>"]
      },
      rubric: {
        levels: ["A", "B", "C", "D", "E"],
        criteria: [{
          name: "<<평가 요소 이름>>",
          weight: "<<핵심/배점 메모 (예: 필수 표현·문법·어법)>>",
          descriptors: { A: "<<A수준 서술>>", B: "<<B수준>>", C: "<<C수준>>", D: "<<D수준>>", E: "<<E수준>>" }
        }]
      }
    };
    if (mode === "speaking") {
      common.session1 = {
        outline_card: [{ label: "<<개요 항목 (예: Problem (문제))>>", hint: "<<작성 힌트>>" }],
        outline_card_note: "<<개요 카드 안내 (선택)>>",
        key_sentences: { prompt: "<<핵심 문장 작성 안내>>", count: 4 },
        self_eval: ["<<자기평가 점검 항목>>"],
        peer_eval: ["<<동료평가 점검 항목>>"]
      };
      common.session2 = { speaking_prompt: "<<발표 지시문>>", time_limit: "<<발표 시간 (예: 70초)>>" };
    } else {
      common.session1 = {
        career_field_label: "<<1차시 도입 라벨 (선택)>>",
        mindmap: true,
        mindmap_topic: "<<마인드맵 주제 (영문)>>",
        mindmap_note: "<<마인드맵 안내 (선택)>>",
        steps: [{
          title: "<<단계 제목 (영문, 예: Generating Ideas)>>",
          points: 5,
          note: "<<학생 안내문 (선택)>>",
          prompts: [{ q: "<<학생에게 던지는 영어 질문>>", lines: 2 }]
        }]
      };
      common.session2 = {
        length_note: "<<2차시 분량 안내>>",
        sections: [{ label: "<<작성 구획 이름 (예: Problem Statement (문제 제시))>>", lines: 4 }]
      };
    }
    return common;
  }

  function buildAIPrompt() {
    var s = collectSpec();
    var isW = s.mode !== "speaking";
    var modeKo = isW ? "쓰기(제안서)" : "말하기(발표)";
    var skel = JSON.stringify(schemaFor(s.mode), null, 2);
    var L = [];
    L.push("당신은 2022 개정 영어과 교육과정에 정통한 대한민국 고등학교 영어 교사입니다.");
    L.push("아래 [교과서 자료]를 읽고, 그 내용에 맞는 '영어Ⅱ " + modeKo + " 수행평가' 학생 워크시트를 새로 설계하세요.");
    L.push("");
    L.push("==================================================");
    L.push("⚠ 먼저 이 칸을 반드시 채우세요 — [교과서 자료]");
    L.push("==================================================");
    L.push("교과서/출판사·단원: <<여기에 적으세요 (예: 천재(이재영) Lesson 5)>>");
    L.push("단원 주제 / 핵심 어휘·표현: <<여기에 적으세요>>");
    L.push("교과서 지문(아래 \"\"\" 사이에 붙여넣기):");
    L.push('"""');
    L.push("<<교과서 지문이나 단원 내용을 여기에 붙여넣으세요>>");
    L.push('"""');
    L.push("");
    L.push("※ 위 [교과서 자료]가 비어 있으면 JSON을 만들지 말고, 어떤 단원·지문인지 먼저 물어보세요. 임의로 지어내지 마세요.");
    L.push("");
    if (s.title || s.subtitle || s.grade || s.purpose || (s.conditions && s.conditions.length)) {
      L.push("[교사가 사이트에 입력해 둔 참고값] (있으면 반영, 비면 무시)");
      if (s.title) L.push("- 제목: " + s.title);
      if (s.subtitle) L.push("- 영문 부제: " + s.subtitle);
      if (s.grade) L.push("- 학년: " + s.grade);
      if (s.school) L.push("- 학교: " + s.school);
      if (s.purpose) L.push("- 평가 목적: " + s.purpose);
      if (s.conditions && s.conditions.length) L.push("- 분량: " + s.conditions.length);
      if (s.conditions && (s.conditions.content_elements || []).length) L.push("- 포함할 내용 요소: " + s.conditions.content_elements.join(", "));
      L.push("");
    }
    L.push("[설계 규칙]");
    L.push("1) required_expressions(필수 영어 표현)와 required_grammar(필수 문법)는 위 교과서 지문에 실제로 나오는 것에서 고르세요. 개수는 자유지만 보통 각 5개를 권장합니다.");
    L.push("2) 조건↔채점 1:1 연동: 고른 표현·문법이 본문 지침과 루브릭(descriptors)에 그대로 반영되어야 합니다.");
    L.push("3) standards[].code는 2022 개정 코드 형식 [12영Ⅱ-XX-XX]을 사용하세요.");
    L.push("4) rubric은 A~E 5단계로 작성하세요.");
    L.push("5) 주제는 공동체·성장(공동체 문제 해결, 성장 경험 등)을 우선하세요. (생활기록부 세특 연계)");
    L.push("6) 고등학생 수준의 자연스러운 영어를 쓰고, 지문에 없는 사실을 지어내지 마세요.");
    if (isW) L.push("7) 쓰기 버전에는 자기·동료 평가를 넣지 않습니다.");
    else L.push("7) 말하기 버전은 1차시에 self_eval·peer_eval을 포함합니다.");
    L.push("");
    L.push("[출력 형식 — 매우 중요]");
    L.push("- 아래는 '빈 양식(스키마)'입니다. << >> 안의 안내문을 전부 교과서 자료에 맞는 실제 내용으로 바꾸세요.");
    L.push("- << >> 표시가 하나라도 그대로 남아 있으면 안 됩니다. 양식의 안내문을 그대로 베껴 출력하지 마세요.");
    L.push("- 배열(standards, steps, sections, criteria, outline_card 등)은 필요한 만큼 항목을 늘리세요. (예: 평가 요소 3개, 단계 3~4개)");
    L.push('- "mode" 값은 반드시 "' + s.mode + '" 로 두세요.');
    L.push("- 설명·인사말·마크다운(```)·주석 없이 'JSON만' 출력하세요. 첫 글자는 { 여야 합니다.");
    L.push("- 이 JSON은 워크시트 생성기의 '고급 — 스펙 JSON' 칸에 그대로 붙여넣어 사용됩니다.");
    L.push("");
    L.push("[채워야 할 빈 양식]");
    L.push(skel);
    return L.join("\n");
  }
  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t);
    return new Promise(function (res, rej) {
      try {
        var ta = $("promptBox"); ta.removeAttribute("readonly"); ta.focus(); ta.select();
        var ok = document.execCommand("copy");
        ta.setAttribute("readonly", "readonly");
        ok ? res() : rej(new Error("execCommand"));
      } catch (e) { rej(e); }
    });
  }

  function generate() {
    var btn = $("generate");
    if (!window.docx || !window.WorksheetBuilder) { setStatus("문서 엔진을 불러오지 못했습니다. 새로고침 해주세요.", "err"); return; }
    var spec;
    try { spec = getSpecForGenerate(); }
    catch (e) { setStatus("JSON 형식 오류: " + e.message, "err"); return; }

    if (!(spec.conditions && (spec.conditions.required_expressions || []).length) && !(spec.conditions && (spec.conditions.required_grammar || []).length)) {
      setStatus("필수 표현이나 문법을 1개 이상 입력해 주세요.", "err"); return;
    }

    btn.disabled = true; setStatus("문서를 만드는 중…");
    try {
      var doc = window.WorksheetBuilder.buildWorksheetDoc(window.docx, spec);
      window.docx.Packer.toBlob(doc).then(function (blob) {
        var modeLabel = spec.mode === "speaking" ? "말하기" : "쓰기";
        var fname = sanitize(spec.title) || ("영어수행평가_" + modeLabel);
        triggerDownload(blob, fname + ".docx");
        setStatus("완성: " + fname + ".docx 내려받음", "ok");
        btn.disabled = false;
      }).catch(function (e) {
        setStatus("생성 실패: " + e.message, "err"); btn.disabled = false;
      });
    } catch (e) {
      setStatus("생성 실패: " + e.message, "err"); btn.disabled = false;
    }
  }

  function triggerDownload(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
  }

  // ---------------- 초기화 ----------------
  function resetForm() {
    var blank = clone(window.PRESETS[mode]);
    blank.title = ""; blank.subtitle = ""; blank.purpose = "";
    blank.standards = [{ code: "", text: "" }, { code: "", text: "" }, { code: "", text: "" }];
    blank.conditions.required_expressions = ["", "", "", "", ""];
    blank.conditions.required_grammar = ["", "", "", "", ""];
    blank.conditions.content_elements = [];
    delete blank.model_answer; delete blank.model_answer_notes;
    state = blank; $("useJson").checked = false; fillForm(); live();
    setStatus("비웠습니다. 차시 구성·루브릭 골격은 유지됩니다.", "");
  }

  // ---------------- 이벤트 ----------------
  function wire() {
    $("modeSeg").addEventListener("click", function (e) {
      var b = e.target.closest(".seg-btn"); if (b) switchMode(b.dataset.mode);
    });
    ["title", "subtitle", "school", "grade", "purpose", "length", "contentElements",
      "mindmapTopic", "lengthNote", "writingSections", "keyCount", "timeLimit",
      "selfEval", "peerEval", "modelAnswer", "modelNotes"].forEach(function (id) {
        var e = $(id); if (e) e.addEventListener("input", live);
      });
    $("mindmapOn").addEventListener("change", live);
    $("rubricOn").addEventListener("change", function () { renderRubric(); live(); });
    $("modelOn").addEventListener("change", function () { $("modelWrap").hidden = !this.checked; live(); });
    $("addStandard").addEventListener("click", function () {
      var box = $("standardsList"); var row = document.createElement("div"); row.className = "row";
      var code = document.createElement("input"); code.type = "text"; code.className = "code-in"; code.placeholder = "12영Ⅱ-02-01";
      var text = document.createElement("input"); text.type = "text"; text.className = "text-in"; text.placeholder = "성취기준 문장";
      [code, text].forEach(function (i) { i.addEventListener("input", live); });
      row.appendChild(code); row.appendChild(text);
      row.appendChild(rowDel(function () { row.remove(); live(); }));
      box.appendChild(row); code.focus();
    });
    document.querySelectorAll("[data-add]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var kind = btn.dataset.add; var box = $(kind + "List");
        var row = condRow(kind, box.querySelectorAll(".row").length + 1, "");
        box.appendChild(row); row.querySelector("input").focus(); updateCount(kind);
      });
    });
    $("useJson").addEventListener("change", function () {
      if (this.checked) { $("specJson").value = JSON.stringify(collectSpec(), null, 2); $("jsonStatus").textContent = "이제 위 JSON으로 생성합니다. 폼 입력은 무시됩니다."; $("jsonStatus").className = "json-status ok"; }
      else { live(); }
    });
    $("specJson").addEventListener("input", function () {
      if (!checked("useJson")) return;
      try { JSON.parse(this.value); $("jsonStatus").textContent = "JSON 정상"; $("jsonStatus").className = "json-status ok"; }
      catch (e) { $("jsonStatus").textContent = "JSON 오류: " + e.message; $("jsonStatus").className = "json-status err"; }
    });
    $("refreshJson").addEventListener("click", function () {
      $("specJson").value = JSON.stringify(collectSpec(), null, 2);
      $("jsonStatus").textContent = "폼 내용으로 다시 채웠습니다."; $("jsonStatus").className = "json-status ok";
    });
    $("makePrompt").addEventListener("click", function () {
      try {
        $("promptBox").value = buildAIPrompt();
        $("promptStatus").textContent = "프롬프트를 만들었습니다. ‘복사’를 누르세요."; $("promptStatus").className = "json-status ok";
      } catch (e) {
        $("promptStatus").textContent = "오류: " + e.message; $("promptStatus").className = "json-status err";
      }
    });
    $("copyPrompt").addEventListener("click", function () {
      var t = $("promptBox").value;
      if (!t) { $("promptStatus").textContent = "먼저 ‘프롬프트 만들기’를 누르세요."; $("promptStatus").className = "json-status err"; return; }
      copyText(t).then(function () {
        $("promptStatus").textContent = "복사됨! 쓰는 AI에 붙여넣으세요."; $("promptStatus").className = "json-status ok";
      }).catch(function () {
        $("promptStatus").textContent = "복사 실패 — 칸을 직접 선택해 복사하세요."; $("promptStatus").className = "json-status err";
      });
    });
    $("generate").addEventListener("click", generate);
    $("resetForm").addEventListener("click", resetForm);
  }

  // ---------------- start ----------------
  wire();
  fillForm();
  live();
})();
