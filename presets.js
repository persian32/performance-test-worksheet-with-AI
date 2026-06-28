/* presets.js — 쓰기/말하기 기본 스펙. 스킬 examples/*.json과 동일. */
window.PRESETS = {
  writing: {
    "mode": "writing",
    "title": "영어Ⅱ 수행평가 — 진로 분야 문제 해결 제안서 쓰기",
    "subtitle": "Writing a Problem–Solution Proposal",
    "school": "○○고등학교",
    "grade": "3",
    "purpose": "진로 분야의 문제 상황에 대한 해결책을 제안서 형식으로 논리적으로 쓰는 능력을 평가한다.",
    "standards": [
      { "code": "12영Ⅱ-02-01", "text": "다양한 주제에 대한 사실적 정보를 말이나 글로 설명한다." },
      { "code": "12영Ⅱ-02-05", "text": "적절한 전략을 활용하여 논리적으로 대상을 설득한다." },
      { "code": "12영Ⅱ-02-07", "text": "글을 쓰는 과정에서 글의 내용과 형식을 점검하고 쓰기 윤리를 준수하여 고쳐 쓴다." }
    ],
    "conditions": {
      "length": "영어 250단어 이상",
      "content_elements": ["문제 상황", "원인", "해결책 2가지", "기대 효과"],
      "required_expressions": ["I suggest that S+V", "not A but B", "by ~ing", "It is important to ...", "What do you mean by ...?"],
      "required_grammar": ["관계대명사", "수동태", "조동사", "to부정사", "비교급"]
    },
    "session1": {
      "career_field_label": "My Career Field (관심 진로 분야)",
      "mindmap": true,
      "mindmap_topic": "Problem in My Career Field",
      "mindmap_note": "진로 분야의 문제와 관련해 떠오르는 단어·키워드를 자유롭게 적어 보세요. (영어/우리말 모두 가능)",
      "steps": [
        { "title": "Generating Ideas", "points": 5, "note": "각 항목을 완전한 문장이나 구(phrase)로 답해 보세요. (영어 또는 우리말)",
          "prompts": [
            { "q": "What problem in your career field will you address?", "lines": 2 },
            { "q": "What solution(s) come to mind?", "lines": 2 },
            { "q": "What outcome do you expect?", "lines": 2 }
          ] },
        { "title": "Identifying a Problem", "points": 10, "prompts": [
            { "q": "State the problem you have chosen in your career field.", "frame": "In the field of ____, one significant problem is ____.", "ko": "어떤 문제인가?" },
            { "q": "Who/What is affected by this problem?", "frame": "____ has a negative impact on ____.", "ko": "누가(무엇이) 영향을 받는가?" },
            { "q": "Why is this problem serious?", "frame": "This problem is serious because ____.", "ko": "왜 심각한가?" },
            { "q": "What will happen if this problem continues?", "frame": "If this problem continues, ____ will happen.", "ko": "변화가 없다면?" }
          ] },
        { "title": "Analyzing Causes", "points": 10, "hint": "직접적·간접적·구조적·근본적 원인 / 관련 집단의 행동 / 제도적·환경적 배경 / 반복·악순환 구조",
          "prompts": [
            { "q": "Cause ①", "frame": "One major cause of this problem is ____.", "ko": "원인 ①" },
            { "q": "Cause ②", "frame": "____ happens because ____.", "ko": "원인 ②" }
          ] },
        { "title": "Proposing Solutions", "points": 25, "prompts": [
            { "q": "Solution ❶ — What should be done to solve this problem?", "frame": "To solve this problem, ____ should ____.", "ko": "해결책 ❶ (누가/무엇을/어떻게)" },
            { "q": "How can this solution be carried out?", "frame": "This can be done by ____ing ____." },
            { "q": "What change do you expect?", "frame": "As a result, ____ will lead to ____.", "ko": "기대되는 변화 (장·단기적/개인·사회적)" },
            { "q": "Solution ❷ — What is another effective solution?", "frame": "Another effective solution is ____.", "ko": "해결책 ❷" },
            { "q": "How will it work?", "frame": "This solution works by ____ing ____." }
          ] }
      ]
    },
    "session2": {
      "length_note": "전체 분량이 영어 250단어 이상이 되도록 작성할 것.",
      "heading_fields": ["To", "From", "Date", "Subject"],
      "sections": [
        { "label": "Problem Statement (문제 제시)", "lines": 4 },
        { "label": "Cause ① + Solution ❶ (원인·해결책 1)", "lines": 5 },
        { "label": "Cause ② + Solution ❷ (원인·해결책 2)", "lines": 5 },
        { "label": "Expected Outcome (기대 효과)", "lines": 3 }
      ],
      "self_check": true
    },
    "rubric": {
      "levels": ["A", "B", "C", "D", "E"],
      "criteria": [
        { "name": "내용 및 구성", "weight": "문제·원인·해결·효과", "descriptors": { "A": "네 요소를 제안서 형식에 맞게 명확·논리적으로 구성함.", "B": "비교적 명확하게 구성함.", "C": "대략적으로 구성함.", "D": "일부만 부분적으로 구성함.", "E": "구성이 제한적임." } },
        { "name": "언어 사용", "weight": "필수 표현{NE}·문법{NG}·어법", "descriptors": { "A": "필수 표현·문법을 모두 정확히 활용하고 어법 오류가 거의 없음.", "B": "대부분 활용·오류 적음.", "C": "일부 활용·오류 다소.", "D": "활용 부족·오류 많음.", "E": "매우 제한적." } },
        { "name": "과제 완성도", "weight": "분량·고쳐쓰기", "descriptors": { "A": "분량을 충족하고 점검·고쳐쓰기가 충실함.", "B": "대체로 충족함.", "C": "일부 미흡함.", "D": "미흡함.", "E": "거의 이루어지지 않음." } }
      ],
      "note": "성취기준별 성취수준 A~E. 1차시(구상 단계별 배점)는 과정 점수로 합산 가능."
    }
  },

  speaking: {
    "mode": "speaking",
    "title": "영어Ⅱ 수행평가 — 지속가능한 미래를 위한 문제 해결 제안 말하기",
    "subtitle": "Presenting a Problem–Solution Proposal",
    "school": "○○고등학교",
    "grade": "3",
    "purpose": "지속가능성 분야의 문제점에 대한 해결책을 논리적으로 영어로 구술하는 능력을 평가한다.",
    "standards": [
      { "code": "12영Ⅱ-02-01", "text": "다양한 주제에 대한 사실적 정보를 말이나 글로 설명한다." },
      { "code": "12영Ⅱ-02-03", "text": "상대방을 배려하고 존중하는 태도로 자신의 의견이나 주장을 제시한다." },
      { "code": "12영Ⅱ-02-09", "text": "원활한 의견 교환을 위해 협력적이고 능동적으로 의사소통 활동에 참여한다." }
    ],
    "conditions": {
      "length": "70초 내외 발표",
      "content_elements": ["문제 상황", "해결책 1가지", "기대 효과"],
      "required_expressions": ["What do you mean by ...?", "Why don't you ...?", "It is important to ...", "I suggest that S+V", "not A but B"],
      "required_grammar": ["관계대명사", "수동태", "조동사", "to부정사", "비교급"]
    },
    "session1": {
      "outline_card": [
        { "label": "Problem (문제)", "hint": "핵심 키워드" },
        { "label": "Solution (해결책)", "hint": "핵심 키워드" },
        { "label": "Expected Outcome (기대 효과)", "hint": "핵심 키워드" },
        { "label": "Opening / Closing", "hint": "도입·마무리 한마디" }
      ],
      "outline_card_note": "쓰기 제안서에서 핵심만 뽑아 발표 카드를 키워드 위주로 채우세요.",
      "key_sentences": { "prompt": "발표에서 꼭 말할 핵심 문장을 영어로 정리하세요. 필수 표현·문법을 포함합니다.", "count": 4 },
      "self_eval": [],
      "peer_eval": []
    },
    "session2": {
      "speaking_prompt": "준비한 개요 카드와 핵심 문장을 바탕으로 교사 앞에서 발표하세요.",
      "time_limit": "70초"
    },
    "rubric": {
      "levels": ["A", "B", "C", "D", "E"],
      "criteria": [
        { "name": "내용·구성", "weight": "문제·해결 전달", "descriptors": { "A": "문제·해결책·기대효과를 명확하고 논리적으로 구성해 구술함.", "B": "비교적 명확하게 구술함.", "C": "대략적으로 구술함.", "D": "부분적으로만 구술함.", "E": "전달이 제한적임." } },
        { "name": "유창성·정확성", "weight": "발음·어휘·어법", "descriptors": { "A": "유창한 발음과 정확한 어휘·어법(필수 표현·문법 포함)으로 구술함.", "B": "대체로 유창하고 정확함.", "C": "의미 전달은 되나 오류가 있음.", "D": "끊김·오류가 잦음.", "E": "매우 제한적임." } },
        { "name": "비언어적 요소", "weight": "목소리·시선·태도", "descriptors": { "A": "목소리·시선·제스처가 적절하고 시간을 준수함.", "B": "대체로 적절함.", "C": "보통임.", "D": "미흡함.", "E": "준비 부족이 뚜렷함." } }
      ],
      "note": "성취기준별 성취수준 A~E. 1차시(개요카드·자기/동료평가)도 과정 점수로 반영 가능."
    }
  }
};
