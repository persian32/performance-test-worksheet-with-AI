/*
 * worksheet-builder.js
 * suhaeng-worksheet 스킬의 build_worksheet.js를 브라우저에서 그대로 돌도록 옮긴 순수 빌더.
 * 입력: docx 네임스페이스(D) + spec(JSON) → D.Document 반환. 패킹(Blob/Buffer)은 호출부가 한다.
 * 브라우저: WorksheetBuilder.buildWorksheetDoc(window.docx, spec)
 * Node 검증: const {buildWorksheetDoc}=require('./worksheet-builder.js'); buildWorksheetDoc(require('docx'), spec)
 *
 * 원본 스킬과 동일한 레이아웃·폰트(맑은 고딕)·색을 유지한다. 로직을 바꾸지 말 것.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.WorksheetBuilder = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var FONT = "Malgun Gothic";
  var PAGE_W = 12240, MARGIN = 1080;
  var CONTENT_W = PAGE_W - MARGIN * 2;

  function buildWorksheetDoc(D, spec) {
    var Document = D.Document, Paragraph = D.Paragraph, TextRun = D.TextRun,
      Table = D.Table, TableRow = D.TableRow, TableCell = D.TableCell,
      AlignmentType = D.AlignmentType, BorderStyle = D.BorderStyle,
      WidthType = D.WidthType, ShadingType = D.ShadingType,
      VerticalAlign = D.VerticalAlign, PageBreak = D.PageBreak;
    var TableLayoutType = D.TableLayoutType || { FIXED: "fixed" };

    var MODE = spec.mode === "speaking" ? "speaking" : "writing";

    // ---------- helpers ----------
    function border(color, size) { return { style: BorderStyle.SINGLE, size: size || 2, color: color || "BBBBBB" }; }
    function allBorders(c, s) { return { top: border(c, s), bottom: border(c, s), left: border(c, s), right: border(c, s) }; }
    var CELL_MARGIN = { top: 70, bottom: 70, left: 110, right: 110 };
    function run(text, opts) { opts = opts || {}; return new TextRun(Object.assign({ text: text, font: FONT }, opts)); }
    function p(children, opts) {
      opts = opts || {};
      if (typeof children === "string") children = [run(children, opts.runOpts || {})];
      return new Paragraph(Object.assign({ children: children, spacing: Object.assign({ after: opts.after != null ? opts.after : 80 }, (opts.spacing || {})) }, (opts.para || {})));
    }
    function heading(text, color) {
      color = color || "1F4E79";
      return new Paragraph({ spacing: { before: 220, after: 110 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: color, space: 2 } },
        children: [run(text, { bold: true, size: 26, color: color })] });
    }
    function sectionTag(text, points) {
      var kids = [run("  " + text + "  ", { bold: true, color: "FFFFFF", size: 22 })];
      if (points != null) kids.push(run("[" + points + "점]  ", { bold: true, color: "FFE699", size: 20 }));
      return new Paragraph({ spacing: { before: 160, after: 60 }, shading: { fill: "1F4E79", type: ShadingType.CLEAR }, children: kids });
    }
    function sessionBanner(text, sub) {
      var kids = [run("  " + text + "  ", { bold: true, color: "FFFFFF", size: 28 })];
      if (sub) kids.push(run("   " + sub, { color: "DCE6F4", size: 20 }));
      return new Paragraph({ spacing: { before: 60, after: 140 }, shading: { fill: "2E5496", type: ShadingType.CLEAR }, alignment: AlignmentType.CENTER, children: kids });
    }
    function cell(content, o) {
      o = o || {};
      var kids = Array.isArray(content) ? content : [new Paragraph({ alignment: o.align, children: [run(String(content), { bold: o.bold, size: 20 })] })];
      return new TableCell({ width: { size: o.w, type: WidthType.DXA }, borders: allBorders(), margins: CELL_MARGIN,
        shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR } : undefined, verticalAlign: o.valign || VerticalAlign.CENTER, children: kids });
    }
    function writingLines(n) {
      var out = [];
      for (var i = 0; i < n; i++) out.push(new Paragraph({ spacing: { before: 0, after: 0, line: 360 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "AAAAAA", space: 6 } }, children: [run(" ")] }));
      return out;
    }
    function frameFill(text) {
      return new Paragraph({ spacing: { after: 110 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "AAAAAA", space: 6 } }, children: [run(text, { size: 22 })] });
    }
    function koLabel(text) { return new Paragraph({ spacing: { before: 20, after: 30 }, children: [run(text, { size: 18, color: "777777" })] }); }
    function engQ(text) { return new Paragraph({ spacing: { before: 40, after: 20 }, children: [run(text, { bold: true, size: 20, color: "1F4E79" })] }); }

    function boxGrid(items, linesPerBox) {
      linesPerBox = linesPerBox || 0;
      var rows = [];
      for (var i = 0; i < items.length; i += 2) {
        var mk = function (it) {
          if (!it) return [new Paragraph({ children: [run(" ")] })];
          var arr = [new Paragraph({ spacing: { after: 40 }, children: [run(it.label, { bold: true, size: 20, color: "1F4E79" })] })];
          if (it.hint) arr.push(new Paragraph({ spacing: { after: 40 }, children: [run(it.hint, { italics: true, size: 18, color: "777777" })] }));
          if (linesPerBox) arr = arr.concat(writingLines(linesPerBox));
          else { arr.push(new Paragraph({ children: [run(" ")] })); arr.push(new Paragraph({ children: [run(" ")] })); }
          return arr;
        };
        rows.push(new TableRow({ children: [cell(mk(items[i]), { w: CONTENT_W / 2, valign: VerticalAlign.TOP }), cell(mk(items[i + 1]), { w: CONTENT_W / 2, valign: VerticalAlign.TOP })] }));
      }
      return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, layout: TableLayoutType.FIXED, columnWidths: [CONTENT_W / 2, CONTENT_W / 2], rows: rows });
    }
    function fourColChecklist(title, items, levels) {
      levels = levels || ["아주 잘함", "잘함", "보통", "노력 요함"];
      var c0 = CONTENT_W - levels.length * 820;
      var hdr = [cell(title, { w: c0, fill: "E2EFDA", bold: true, align: AlignmentType.CENTER })];
      levels.forEach(function (l) { hdr.push(cell(l, { w: 820, fill: "E2EFDA", bold: true, align: AlignmentType.CENTER })); });
      var rows = [new TableRow({ tableHeader: true, children: hdr })];
      items.forEach(function (it) { var cs = [cell(it, { w: c0 })]; levels.forEach(function () { cs.push(cell("☐", { w: 820, align: AlignmentType.CENTER })); }); rows.push(new TableRow({ children: cs })); });
      return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, layout: TableLayoutType.FIXED, columnWidths: [c0].concat(levels.map(function () { return 820; })), rows: rows });
    }
    function requiredTagTable(exprs, grams) {
      var maxRows = Math.max(exprs.length, grams.length);
      var rows = [new TableRow({ tableHeader: true, children: [
        cell("필수 표현 (의사소통 기능)", { w: CONTENT_W / 2, fill: "D9E2F3", bold: true, align: AlignmentType.CENTER }),
        cell("필수 문법 (언어 형식)", { w: CONTENT_W / 2, fill: "FCE4D6", bold: true, align: AlignmentType.CENTER }),
      ] })];
      for (var i = 0; i < maxRows; i++) rows.push(new TableRow({ children: [cell("☐ " + (exprs[i] || ""), { w: CONTENT_W / 2 }), cell("☐ " + (grams[i] || ""), { w: CONTENT_W / 2 })] }));
      return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, layout: TableLayoutType.FIXED, columnWidths: [CONTENT_W / 2, CONTENT_W / 2], rows: rows });
    }
    function mindMap(topic) {
      var cw = Math.floor(CONTENT_W / 3);
      var blank = function () { return cell([new Paragraph({ children: [run(" ")] }), new Paragraph({ children: [run(" ")] })], { w: cw, valign: VerticalAlign.CENTER }); };
      var center = cell([
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60 }, children: [run("주제 / Topic", { size: 16, color: "FFFFFF" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 20, after: 60 }, children: [run(topic || "(주제)", { bold: true, size: 22, color: "FFFFFF" })] })
      ], { w: cw, fill: "2E5496", valign: VerticalAlign.CENTER });
      var rows = [
        new TableRow({ children: [blank(), blank(), blank()] }),
        new TableRow({ children: [blank(), center, blank()] }),
        new TableRow({ children: [blank(), blank(), blank()] }),
      ];
      return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, layout: TableLayoutType.FIXED, columnWidths: [cw, cw, cw], rows: rows });
    }
    function headingForm(fields) {
      var labelW = 1500;
      var rows = fields.map(function (f) { return new TableRow({ children: [cell(f, { w: labelW, fill: "F2F2F2", bold: true }), cell(" ", { w: CONTENT_W - labelW })] }); });
      return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, layout: TableLayoutType.FIXED, columnWidths: [labelW, CONTENT_W - labelW], rows: rows });
    }
    function rubricTable(r) {
      var levels = r.levels || ["A", "B", "C", "D", "E"];
      var crits = r.criteria || [];
      var lvlW = 1100, critW = crits.length ? Math.floor((CONTENT_W - lvlW) / crits.length) : (CONTENT_W - lvlW);
      // {NE}/{NG} → 실제 필수 표현·문법 개수 (0개면 숫자 생략). 조건↔채점 1:1 연동 유지.
      function fmtWeight(w) {
        if (!w) return w;
        var ne = exprs.length, ng = grams.length;
        return String(w).replace(/\{NE\}/g, ne > 0 ? (" " + ne) : "").replace(/\{NG\}/g, ng > 0 ? (" " + ng) : "");
      }
      // header row: 수준 | 평가 요소들...
      var hdr = [cell("수준", { w: lvlW, fill: "DDEBF7", bold: true, align: AlignmentType.CENTER })];
      crits.forEach(function (cr) {
        var critKids = [new Paragraph({ alignment: AlignmentType.CENTER, children: [run(cr.name, { bold: true, size: 20 })] })];
        if (cr.weight) critKids.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [run("(" + fmtWeight(cr.weight) + ")", { size: 18, color: "777777" })] }));
        hdr.push(cell(critKids, { w: critW, fill: "DDEBF7", valign: VerticalAlign.CENTER }));
      });
      var rows = [new TableRow({ tableHeader: true, children: hdr })];
      // one row per level
      levels.forEach(function (l) {
        var cells = [cell([new Paragraph({ alignment: AlignmentType.CENTER, children: [run(l, { bold: true, size: 22, color: "1F4E79" })] })], { w: lvlW, fill: "F2F7FC", valign: VerticalAlign.CENTER })];
        crits.forEach(function (cr) {
          var d = (cr.descriptors && (cr.descriptors[l] != null ? cr.descriptors[l] : cr.descriptors[levels.indexOf(l)])) || "";
          cells.push(cell([new Paragraph({ children: [run(String(d), { size: 18 })] })], { w: critW, valign: VerticalAlign.TOP }));
        });
        rows.push(new TableRow({ children: cells }));
      });
      return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, layout: TableLayoutType.FIXED, columnWidths: [lvlW].concat(crits.map(function () { return critW; })), rows: rows });
    }

    // ---------- body ----------
    var body = [];
    var exprs = (spec.conditions || {}).required_expressions || [];
    var grams = (spec.conditions || {}).required_grammar || [];
    var modeLabel = MODE === "speaking" ? "말하기" : "쓰기";

    body.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [run(spec.title || ("영어 수행평가 — " + modeLabel), { bold: true, size: 32, color: "1F4E79" })] }));
    if (spec.subtitle) body.push(p([run(spec.subtitle, { size: 22, color: "555555" })], { para: { alignment: AlignmentType.CENTER }, after: 100 }));
    body.push(new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 120 }, children: [run([spec.school || "________ 고등학교", (spec.grade || "____") + "학년", "(   )반  (   )번", "이름 (            )"].join("    "), { size: 20 })] }));

    body.push(heading("평가 안내"));
    if (spec.purpose) body.push(p([run("▨ 평가 목적: ", { bold: true }), run(spec.purpose)]));
    if (spec.standards && spec.standards.length) {
      body.push(p([run("▨ 성취 기준 (2022 개정)", { bold: true })], { after: 40 }));
      spec.standards.forEach(function (s) { body.push(p([run("• [" + s.code + "] ", { bold: true }), run(s.text || "")], { para: { indent: { left: 240 } }, after: 40 })); });
    }
    body.push(p([run("▨ 조건", { bold: true })], { spacing: { before: 120 }, after: 40 }));
    var cond = spec.conditions || {};
    if (cond.length) body.push(p([run("⑴ 분량: ", { bold: true }), run(cond.length)], { para: { indent: { left: 240 } }, after: 40 }));
    if (cond.content_elements && cond.content_elements.length) body.push(p([run("⑵ 다음 내용을 모두 포함할 것: ", { bold: true }), run(cond.content_elements.join(", "))], { para: { indent: { left: 240 } }, after: 40 }));
    body.push(p([run("⑶ 다음 표현·문법을 각 1회 이상 사용할 것" + (MODE === "writing" ? " (쓴 문장 위에 ◯표)" : " (말하기에 포함)"), { bold: true })], { para: { indent: { left: 240 } }, after: 60 }));
    body.push(requiredTagTable(exprs, grams));

    // =========================== WRITING ===========================
    if (MODE === "writing") {
      var s1 = spec.session1 || {}, s2 = spec.session2 || {};
      body.push(new Paragraph({ children: [new PageBreak()] }));
      body.push(sessionBanner("쓰기 1차시", "단계별로 구상하기 (Brainstorming & Drafting Ideas)"));
      if (s1.career_field_label) { body.push(p([run(s1.career_field_label + ": ", { bold: true, size: 20 })], { after: 20 })); body.push.apply(body, writingLines(1)); }

      var mmOn = s1.mindmap !== false;
      if (mmOn) {
        body.push(sectionTag("STEP 1.  브레인스토밍 (Mind Map)"));
        body.push(p([run((s1.mindmap_note || "주제에 대해 떠오르는 단어·키워드를 자유롭게 적어 보세요. (영어/우리말 모두 가능)"), { italics: true, size: 19, color: "555555" })], { after: 70 }));
        body.push(mindMap(s1.mindmap_topic || (spec.subtitle || spec.title || "Topic")));
      }

      if (s1.steps && s1.steps.length) {
        var base = mmOn ? 2 : 1;
        s1.steps.forEach(function (st, idx) {
          body.push(sectionTag("STEP " + (idx + base) + ".  " + st.title, st.points));
          if (st.note) body.push(p([run(st.note, { italics: true, size: 19, color: "555555" })], { after: 50 }));
          (st.prompts || []).forEach(function (pr) {
            if (pr.q) body.push(engQ(pr.q));
            if (pr.frame) body.push(frameFill(pr.frame));
            if (pr.ko) body.push(koLabel("[우리말 구상] " + pr.ko));
            if (!pr.frame && (pr.lines || pr.ko)) body.push.apply(body, writingLines(pr.lines || 2));
          });
          if (st.hint) body.push(p([run("Hint] " + st.hint, { size: 18, color: "777777" })], { before: 30, after: 40 }));
        });
      } else {
        if (s1.outline) { body.push(sectionTag("STEP 1.  아이디어 구상")); if (s1.outline_note) body.push(p([run(s1.outline_note, { italics: true, size: 20, color: "555555" })], { after: 80 })); body.push(boxGrid(s1.outline)); }
        if (s1.sentence_frames) { body.push(sectionTag("STEP 2.  문장 만들기")); s1.sentence_frames.forEach(function (fr) { if (fr.group) body.push(p([run("· " + fr.group, { bold: true, size: 20, color: "1F4E79" })], { before: 60, after: 30 })); (fr.items || []).forEach(function (it) { body.push(frameFill(it)); }); }); }
      }

      body.push(new Paragraph({ children: [new PageBreak()] }));
      body.push(sessionBanner("쓰기 2차시", "제안서 형식으로 완성하기 (Write the Final Proposal)"));
      var instrKids = [
        new Paragraph({ spacing: { after: 40 }, children: [run("✔ 작성 지침 (Instruction)", { bold: true, size: 22, color: "C0504D" })] }),
        new Paragraph({ spacing: { after: 20 }, children: [run("1차시 구상을 바탕으로 제안서를 완성하시오. 아래 필수 표현 " + exprs.length + "개·문법 " + grams.length + "개를 각 1회 이상 사용하고, 사용한 문장 위에 ◯표 하시오.", { size: 20 })] }),
      ];
      if (s2.length_note) instrKids.push(new Paragraph({ spacing: { after: 20 }, children: [run("· " + s2.length_note, { size: 19 })] }));
      instrKids.push(new Paragraph({ children: [run("표현: ", { bold: true, size: 18 }), run(exprs.join(" / "), { size: 18 })] }));
      instrKids.push(new Paragraph({ children: [run("문법: ", { bold: true, size: 18 }), run(grams.join(" / "), { size: 18 })] }));
      body.push(new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, layout: TableLayoutType.FIXED, columnWidths: [CONTENT_W], rows: [new TableRow({ children: [cell(instrKids, { w: CONTENT_W, fill: "FDECEA", valign: VerticalAlign.TOP })] })] }));

      body.push(sectionTag("Heading (제안서 머리)"));
      body.push(headingForm(s2.heading_fields || ["To", "From", "Date", "Subject"]));
      (s2.sections || [
        { label: "Problem Statement (문제 제시)", lines: 4 },
        { label: "Cause Analysis & Solution Proposal (원인·해결책)", lines: 9 },
        { label: "Expected Outcome (기대 효과)", lines: 3 },
      ]).forEach(function (sec) { body.push(sectionTag(sec.label)); body.push.apply(body, writingLines(sec.lines || 4)); });
      if (s2.self_check !== false) {
        body.push(p([run("Self Check: 필수 표현·문법을 모두 ◯표 했는가? ☐    분량을 채웠는가? ☐    제안서 형식(머리·문제·해결·효과)을 갖췄는가? ☐", { size: 19 })], { before: 100 }));
      }
    }

    // =========================== SPEAKING ===========================
    if (MODE === "speaking") {
      var sp1 = spec.session1 || {}, sp2 = spec.session2 || {};
      body.push(new Paragraph({ children: [new PageBreak()] }));
      body.push(sessionBanner("말하기 1차시", "발표 준비 · 자기평가 · 동료평가"));
      if (sp1.outline_card && sp1.outline_card.length) {
        body.push(sectionTag("STEP 1.  발표 개요 카드 (Outline Card)"));
        body.push(p([run(sp1.outline_card_note || "자신의 글에서 핵심만 뽑아 발표 카드를 키워드 위주로 채우세요.", { italics: true, size: 20, color: "555555" })], { after: 80 }));
        body.push(boxGrid(sp1.outline_card, 2));
      }
      if (sp1.key_sentences) {
        body.push(sectionTag("STEP 2.  핵심 문장 정리 (Key Sentences)"));
        body.push(p([run(sp1.key_sentences.prompt || "발표에서 꼭 말할 핵심 문장을 영어로 정리하세요. 필수 표현·문법을 포함합니다.", { italics: true, size: 20, color: "555555" })], { after: 80 }));
        var n = sp1.key_sentences.count || 4;
        for (var i2 = 1; i2 <= n; i2++) { body.push(p([run(i2 + ".", { bold: true, size: 20 })], { after: 20 })); body.push.apply(body, writingLines(1)); }
      }
      body.push(sectionTag("STEP 3.  자기 평가 (Self-Check)"));
      body.push(fourColChecklist("점검 항목", (sp1.self_eval && sp1.self_eval.length) ? sp1.self_eval : ["문제·해결책·기대효과가 잘 드러나게 구성했는가?", "필수 표현·문법을 사용했는가?", "발음·속도가 자연스러운가?"]));
      body.push(p([run("내가 보완할 점: ", { bold: true })], { before: 80 })); body.push.apply(body, writingLines(1));
      body.push(sectionTag("STEP 4.  동료 평가 (Peer Feedback)"));
      body.push(p([run("피드백 대상: (   )반 (   )번 이름 (          )", { size: 20 })], { after: 60 }));
      body.push(fourColChecklist("점검 항목", (sp1.peer_eval && sp1.peer_eval.length) ? sp1.peer_eval : ["주제에 맞는 내용을 적절한 형식으로 말했는가?", "맥락에 맞는 어휘·어법을 활용했는가?", "발음이 정확하고 유창한가?", "목소리·시선·태도가 적절한가?"], ["Excellent", "Good", "Ok", "Needs work"]));
      body.push(p([run("잘한 점 / 더 연습할 점: ", { bold: true })], { before: 80 })); body.push.apply(body, writingLines(2));
      body.push(new Paragraph({ children: [new PageBreak()] }));
      body.push(sessionBanner("말하기 2차시", "구술 평가"));
      body.push(sectionTag("STEP 5.  발표하기 (Speak)"));
      body.push(p([run(sp2.speaking_prompt || "준비한 개요 카드와 핵심 문장을 바탕으로 발표하세요.", { size: 22 })], { after: 60 }));
      if (sp2.time_limit) body.push(p([run("• 제한 시간: " + sp2.time_limit, { bold: true, size: 20 })], { after: 40 }));
      body.push(p([run("• 필수 표현·문법(위 표)을 발표에 포함할 것.", { size: 20 })], { after: 80 }));
    }

    // =========================== 루브릭 (옵션) ===========================
    if (spec.rubric && spec.rubric.criteria && spec.rubric.criteria.length) {
      body.push(new Paragraph({ children: [new PageBreak()] }));
      body.push(heading("채점 기준 (교사용)"));
      body.push(rubricTable(spec.rubric));
      if (spec.rubric.note) body.push(p([run("※ " + spec.rubric.note, { size: 18, color: "555555" })], { before: 80 }));
    }
    // =========================== 예시답안 (옵션) ===========================
    if (spec.model_answer) {
      body.push(new Paragraph({ children: [new PageBreak()] }));
      body.push(heading("예시 답안 (교사용)"));
      String(spec.model_answer).split("\n").forEach(function (line) { body.push(p([run(line, { size: 22 })], { after: 60 })); });
      if (spec.model_answer_notes && spec.model_answer_notes.length) {
        body.push(p([run("사용된 필수 표현·문법:", { bold: true })], { before: 100 }));
        spec.model_answer_notes.forEach(function (nn) { body.push(p([run("• " + nn, { size: 20 })], { para: { indent: { left: 240 } }, after: 30 })); });
      }
    }

    // ---------- document ----------
    return new Document({
      styles: { default: { document: { run: { font: FONT, size: 22 } } } },
      sections: [{ properties: { page: { size: { width: PAGE_W, height: 15840 }, margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN } } }, children: body }],
    });
  }

  return { buildWorksheetDoc: buildWorksheetDoc, FONT: FONT };
});
