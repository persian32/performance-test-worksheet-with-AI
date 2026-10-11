# 영어 수행평가 워크시트 생성기

**▶ Live site / 바로 열기:** https://persian32.github.io/performance-test-worksheet-with-AI/ (in Korean)

**English summary**

- **What it does:** The same worksheet and rubric generator as [performance-test-worksheet](https://github.com/persian32/performance-test-worksheet), with one addition: it creates a prompt that a teacher can paste into any AI (ChatGPT, Gemini, Claude) together with the textbook unit. The AI returns a draft in the site's format, and the teacher edits it before making the Word file.
- **Design rule:** The AI reads the textbook; the site only checks and formats. The teacher still decides every expression, grammar point, and topic.
- **Privacy:** The site itself sends nothing to a server; the teacher chooses which AI to use.
- **My role:** I found the problem in my own work and decided what the tool should and should not do. The code was written with AI coding tools (Claude Code).

---

**한국어 설명**

2022 개정 영어과(영어Ⅱ) **수행평가 학생용 워크시트 + 채점 루브릭**을 브라우저에서 바로 `.docx`로 만드는 무료 도구입니다. 교과서 단원·필수 표현·문법·주제만 채우면 됩니다. **쓰기·말하기** 두 버전, 각 2차시 구조를 지원합니다.

- **무료 / 설치 없음**
- 모든 처리가 **사용자 브라우저 안에서만** 일어납니다. 입력한 어떤 내용도 서버로 전송되지 않습니다.
- 결과물은 한글이 깨지지 않게 **맑은 고딕(Malgun Gothic)** 으로 생성되는 Word 문서(`.docx`)입니다.

---

## 무엇을 만들어 주나요

폼을 채우고 **`.docx 만들기`** 를 누르면 다음이 한 문서에 담겨 내려받아집니다.

- 수행평가 제목·성취기준·조건(분량/내용 요소)
- **필수 영어 표현 5개 · 필수 문법 5개** 체크 표(◯표 방식)
- 2차시 구조의 학생 활동지 — 브레인스토밍, 문장 프레임, 작성 칸
- 말하기 버전의 경우 1차시에 **자기·동료 평가**
- **A–E 5단계** 채점 루브릭 (조건↔채점 1:1 연동)

핵심 설계 원칙은 **입력한 필수 표현·문법이 본문 지침과 루브릭에 그대로 다시 등장**한다는 점입니다(조건과 채점 기준이 어긋나지 않음).

---

## 사용 방법

1. 사이트를 엽니다. 폼에는 **예시가 채워진 상태**로 시작합니다.
2. 위쪽에서 **버전(쓰기 / 말하기)** 을 고릅니다.
3. 기본 정보 → 성취기준 → 조건(필수 표현·문법, 개수는 자유) → 차시 구성 → 루브릭 순으로 **내 단원에 맞게 고칩니다.** (칸을 비우면 흐릿한 입력 예시가 안내로 보입니다. 처음부터 비우려면 하단 `초기화`.)
4. **`.docx 만들기`** 를 누르면 Word 파일이 내려받아집니다.

> 고급: 맨 아래 **고급(스펙 JSON)** 영역에서 문서 스펙을 직접 편집할 수 있습니다. `이 JSON으로 생성`을 체크하면 폼 대신 JSON으로 문서를 만듭니다.

### AI로 초안 받기 (선택)

폼을 처음부터 채우기 막막하면, 평소 쓰는 AI의 도움을 받을 수 있습니다. 이 사이트는 특정 AI에 묶여 있지 않아 **ChatGPT·Gemini·Claude 등 무엇이든** 됩니다. 동료에게는 아래 5단계를 그대로 전달하세요.

1. 사이트에서 **`프롬프트 만들기` → `복사`**.
2. 내가 쓰는 AI를 엽니다.
3. 프롬프트를 붙여넣고, **이어서 교과서 지문·단원 내용도 붙여넣습니다.** (PDF 첨부가 되는 AI면 첨부해도 됩니다. → **교과서는 이 사이트가 아니라 ‘내 AI’가 읽습니다.**)
4. AI가 돌려준 **JSON**을 복사합니다. (`{` 로 시작하는 글)
5. 사이트 **`06 고급`** 칸에 붙여넣고 `이 JSON으로 생성`을 켠 뒤 **`.docx 만들기`**.

프롬프트에는 영어Ⅱ 규칙(필수 표현·문법, 조건↔채점 1:1 연동, 2022 성취기준 코드, A~E 루브릭, 공동체·성장 주제)과 **빈 양식**이 들어 있어, 어떤 AI를 쓰든 사이트 규격에 맞는 결과가 나오도록 안내합니다. 교과서 내용을 넣지 않으면 AI가 “어떤 단원인지” 먼저 되물을 수 있습니다.

---

## GitHub Pages에 올리기 (무료 배포)

다른 선생님들이 쓸 수 있게 웹에 올리는 방법입니다. 서버가 필요 없는 정적 사이트라 GitHub Pages만으로 충분합니다.

### 방법 A — 웹에서 클릭만으로

1. GitHub에 로그인하고 새 저장소(repository)를 만듭니다. 예: `suhaeng-worksheet`. **Public**으로 둡니다.
2. 저장소 화면에서 **Add file → Upload files** 를 누릅니다.
3. 이 폴더 안의 **모든 파일과 `vendor` 폴더**를 통째로 끌어다 올립니다.
   - `index.html`, `styles.css`, `app.js`, `worksheet-builder.js`, `presets.js`, `README.md`
   - `vendor/docx.iife.js`
4. **Commit changes** 로 저장합니다.
5. 저장소 상단 **Settings → Pages** 로 갑니다.
6. **Build and deployment**의 **Source**를 **Deploy from a branch** 로 두고, **Branch**를 `main` / 폴더는 `/ (root)` 로 선택한 뒤 **Save**.
7. 1~2분 뒤 같은 화면에 공개 주소가 나타납니다: `https://<내아이디>.github.io/suhaeng-worksheet/`
8. 그 주소를 다른 선생님들과 공유하면 됩니다.

### 방법 B — git 명령으로

```bash
git init
git add .
git commit -m "영어 수행평가 워크시트 생성기"
git branch -M main
git remote add origin https://github.com/<내아이디>/suhaeng-worksheet.git
git push -u origin main
```

이후 **Settings → Pages**에서 위 6~7번과 동일하게 설정합니다.

> 중요: `vendor/docx.iife.js`(약 1.1MB) 파일이 반드시 함께 올라가야 합니다. 이 파일이 문서 생성 엔진입니다. 빠지면 `.docx 만들기`가 동작하지 않습니다.

---

## 폴더 구성

| 파일 | 설명 |
|---|---|
| `index.html` | 폼 화면(입력 UI) |
| `styles.css` | 디자인 |
| `app.js` | 폼 ↔ 스펙 ↔ 문서 생성 연결 |
| `worksheet-builder.js` | 워크시트/루브릭 문서를 조립하는 핵심 로직 |
| `presets.js` | 폼이 처음 열릴 때 채워지는 쓰기·말하기 예시 |
| `vendor/docx.iife.js` | Word 문서 생성 라이브러리(브라우저용, 외부 연결 없음) |

---

## 자주 묻는 점

**입력한 내용이 외부로 새나가나요?**
아니요. 인터넷 연결 없이도(파일을 처음 불러온 뒤에는) 동작할 만큼, 모든 처리가 브라우저 안에서 끝납니다. 입력값은 어디에도 저장·전송되지 않습니다.

**한글이 깨지지 않나요?**
생성되는 `.docx`는 맑은 고딕으로 지정됩니다. Word/한컴오피스에서 정상 표시됩니다.

**한글(HWP)에서도 열 수 있나요?**
네. 한컴오피스 한글에서 **파일 → 불러오기**로 내려받은 `.docx`를 열면 됩니다. 표가 틀어지지 않도록 표 너비를 고정값으로 만들어 두었습니다. 다만 Word 형식을 한글이 변환해 보여주는 것이라 표 칸 너비·여백·음영이 아주 미세하게 다르게 보일 수 있습니다. **내용이 사라지지는 않으며**, 한글에서 그대로 편집·저장할 수 있습니다.

**교과서 내용을 사이트가 자동으로 읽어 주나요?**
아니요. 이 사이트는 교사가 입력한 표현·문법·주제를 규격에 맞는 문서로 만들어 주는 도구입니다. 어떤 표현·문법·주제를 다룰지는 **교사가 직접 정해 입력**합니다. (교과서를 읽어 자동 설계하는 작업은 별도의 AI 도구 몫입니다.)

**세특(생활기록부)으로 이어 쓰고 싶어요.**
이 워크시트는 학생이 작성한 뒤 교과세특으로 자연스럽게 이어지도록 **공동체·성장** 주제를 우선해 설계되어 있습니다.

---

## 라이선스

자유롭게 사용·수정·공유할 수 있습니다. 동료 선생님들과 나눠 쓰시라고 만든 도구입니다.
