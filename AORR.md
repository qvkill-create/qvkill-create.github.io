# AORR 상태 머신

## 1. Target과 완료 기준

- Target: 정적이고 프로페셔널한 웹사이트를 완성하고, 데스크톱·태블릿·모바일 반응형을 지원하며, `Games` 메뉴에서 키보드·터치 지렁이 게임을 실행할 수 있고, GitHub Pages로 정상 배포된 상태를 만든다.
- 완료 기준:
  - 홈/프로필/게임 진입 경로가 모두 동작한다.
  - 레이아웃과 색상, 배치가 인스타그램 개인 프로필 페이지를 참고한 일관된 시각 체계를 가진다. 세부 모사 여부가 불명확하면 `[사람 확인 필요]`로 남긴다.
  - 반응형이 데스크톱·태블릿·모바일에서 깨지지 않는다.
  - 지렁이 게임이 키보드와 터치 입력으로 조작된다.
  - 랜덤하고 활발하게 움직이는 적이 5초마다 폭발하고, 폭발 후 다시 랜덤 생성되어 랜덤 이동한다.
  - 전체 검증이 Claude에서 통과하고, GitHub Pages에서 공개 URL로 확인된다.

## 2. Act: Codex가 수행할 최소 수정

- 한 번의 Retry에서는 실패 원인 1개에만 집중하고, 그 원인과 직접 관련된 파일만 최소 수정한다.
- HTML 실패면 구조, 링크, 섹션 순서, 시맨틱 태그만 수정한다.
- CSS 실패면 레이아웃, 반응형, 타이포그래피, 색상 변수, 간격만 수정한다.
- JavaScript 실패면 런타임 오류, 메뉴 전환, 입력 처리, 상태 관리만 수정한다.
- Game 실패면 지렁이 이동, 충돌, 터치·키보드 입력, 적 생성·폭발 규칙만 수정한다.
- Content 실패면 문구, 라벨, 메뉴명, 프로필 설명만 수정한다.
- Test 실패면 테스트가 기대하는 진입점, 스크립트, 명령, 경로만 수정한다.
- Environment 실패면 로컬 실행 환경, 의존성, CLI, 경로, 토큰 확인만 수정한다.
- GitHub 실패면 원격, 브랜치, 권한, Pages 설정과 직결된 항목만 수정한다.
- Deployment 실패면 Pages 공개, 빌드 산출물, 경로, 404, 캐시 문제만 수정한다.

## 3. Observe: Claude가 실행할 테스트와 수집할 결과

- Claude는 각 루프마다 동일한 검증 묶음을 재실행한다.
- 기본 검증:
  - 저장소 구조와 변경 파일 확인
  - 앱 진입 경로와 `Games` 메뉴 확인
  - 반응형 확인: 데스크톱·태블릿·모바일 폭에서 레이아웃 붕괴 여부 확인
  - 지렁이 게임 입력 확인: 키보드와 터치 조작
  - 적 동작 확인: 랜덤 이동, 5초 주기 폭발, 폭발 후 재생성
  - 정적 자산 및 링크 확인
- 가능한 경우 프로젝트의 기존 빌드/테스트 명령을 우선 사용하고, 없으면 브라우저 기반 수동 검증 결과를 기록한다.
- Claude CLI 사용 불가 시에는 Observe를 `CODEX_FALLBACK`으로 기록하고, Codex가 동일한 검증 항목을 직접 수행한다.
- 수집 결과는 `PASS` / `FAIL`과 실패 원인 분류, 재현 경로, 영향 파일로 남긴다.

## 4. Reason: 실패 원인 분류

- `HTML`: 구조 누락, 잘못된 시맨틱, 링크/섹션 깨짐
- `CSS`: 반응형 붕괴, 배치 틀어짐, 타이포그래피/색상 문제
- `JAVASCRIPT`: 런타임 오류, 메뉴 전환 실패, 이벤트 처리 오류
- `GAME`: 지렁이 조작/충돌/상태 전이 오류, 적 폭발·재생성 규칙 오류
- `CONTENT`: 프로필 문구, 메뉴명, 설명, `[사람 확인 필요]` 처리 문제
- `TEST`: 검증 명령, 스크립트, 기대 결과 불일치
- `ENVIRONMENT`: Claude CLI, Node, 브라우저, 경로, 토큰, 의존성 문제
- `GITHUB`: 원격 저장소, 권한, 브랜치, push, Pages 설정 문제
- `DEPLOYMENT`: GitHub Pages 공개 실패, 경로, 빌드 산출물, 캐시 문제
- `UNKNOWN`: 위 분류로 아직 좁혀지지 않은 상태

## 5. Repeat: Codex 최소 수정 → Claude 동일 테스트 재실행

- `RETRYING` 상태에서는 오직 직전 실패 원인 1개만 수정한다.
- 수정 후 Claude는 동일한 검증 묶음을 다시 실행한다.
- 결과가 다시 실패하면 같은 분류인지 먼저 확인하고, 같으면 같은 원인으로 한 번 더 최소 수정한다.
- 다른 분류가 드러나면 새 원인으로 전환하고, 새 원인에 맞는 최소 수정만 수행한다.
- 모든 검증이 통과해야만 `PASSED`로 이동한다.

## 6. Stop과 HITL 조건

- `PASSED`: Claude 전체 검증이 통과했고, 배포 전 준비가 끝난 상태
- `DEPLOY_APPROVAL_REQUIRED`: GitHub Pages 배포 직전의 승인 대기 상태
- `DEPLOYED`: GitHub Pages 공개 URL이 정상 동작하는 상태
- `BLOCKED`: 저장소 구조, 실행 환경, 권한 문제로 더 이상 자동 진행이 불가능한 상태
- `HITL_REQUIRED`: 사람 확인이 필요한 디자인, 문구, 규칙, 배포 판단이 남은 상태
- 즉시 HITL가 필요한 경우:
  - Instagram 프로필 레이아웃의 정확한 세부 매핑이 불명확할 때
  - 게임 규칙 해석이 여러 가지로 갈릴 때
  - GitHub Pages 설정이나 원격 권한이 확인되지 않을 때
  - Claude CLI를 사용할 수 없고 `CODEX_FALLBACK` 검증도 더 이상 진행할 수 없을 때
- 자동 루프 중지 조건:
  - `PASSED` 도달
  - `DEPLOYED` 도달
  - 동일 원인으로 반복 실패해 추가 최소 수정이 의미 없을 때

## 7. 개발 루프 표

| 루프 | 입력 | Codex Act | Claude Verify | 통과 기준 | 다음 상태 |
|---|---|---|---|---|---|
| 1 | `STEP1_ANALYSIS.md` + 저장소 구조 | 최소 HTML 골격과 `Games` 진입 경로만 정리 | 진입 경로, 구조, 링크, 초기 렌더 확인 | 주요 섹션이 보이고 `Games` 메뉴가 열림 | `VERIFYING` |
| 2 | 1차 검증 실패 보고 | CSS 반응형과 프로필 배치만 수정 | 데스크톱·태블릿·모바일 폭 점검 | 레이아웃 붕괴 없음 | `VERIFYING` |
| 3 | 게임 입력/상태 실패 보고 | 지렁이 게임의 키보드·터치 입력만 수정 | 입력 응답, 이동, 충돌 확인 | 게임 조작이 끊기지 않음 | `VERIFYING` |
| 4 | 적 AI/폭발 실패 보고 | 랜덤 이동 적, 5초 폭발, 재생성 규칙만 수정 | 적 생성/폭발/재등장 확인 | 규칙이 반복적으로 안정 동작 | `VERIFYING` |
| 5 | 내용/문구 불일치 보고 | 프로필 텍스트와 메뉴 라벨만 수정 | 콘텐츠와 `[사람 확인 필요]` 표시 확인 | 불명확한 문구가 남지 않음 | `VERIFYING` |
| 6 | 전체 기능 통합 실패 보고 | 원인 1개만 최소 재수정 | 동일 전체 검증 재실행 | 모든 검증이 `PASS` | `PASSED` |
| 7 | 배포 승인 대기 | GitHub Pages 배포 직전만 준비 | 배포 전 최종 확인 | 승인 가능 상태 | `DEPLOY_APPROVAL_REQUIRED` |
| 8 | 배포 후 검증 | Pages 공개 경로, 캐시, 정적 경로만 점검 | 공개 URL 실접속 확인 | GitHub Pages에서 정상 노출 | `DEPLOYED` |


## 12. Self-Correcting TDD Loop

### Goal

- Worker: Codex performs code analysis and the minimum required fix.
- Verifier: Claude Code CLI runs the tests before and after each fix.
- Codex does not rerun tests that Claude already ran for the same retry.

### Verified CLI facts

- `claude` command: available at `C:\Users\JinA HaeChoon\.local\bin\claude.exe`
- Login status: authenticated
- Execution status: `claude doctor` passes
- Sonnet availability: `claude --model sonnet` resolves to `claude-sonnet-5`
- Actual model to record: `claude-sonnet-5`
- Fallback mode: `CODEX_FALLBACK` is only used if Claude CLI becomes unavailable

### Loop order

1. Claude runs the pre-change test set.
2. Claude reports failing items, root cause, related files, and fingerprint.
3. Codex changes only the minimum code needed for one cause.
4. Claude reruns the same tests.
5. If failures remain, Claude reports the new result and fingerprint.
6. Codex makes the next minimal change and asks Claude to re-verify.
7. The loop ends only when Claude's full verification passes.

### Verification scope

- File existence and relative paths
- HTML structure and internal links
- Responsive CSS behavior
- JavaScript runtime errors
- Snake game input and gameplay
- Local HTTP response
- Viewports: `375px`, `768px`, `1440px`
- GitHub Pages compatibility

### Failure record

Each retry must record:

- Executor and model
- Command
- Exit code
- Core error
- Related file and line
- Fingerprint
- Final status

### Retry rules

- Maximum of 3 retries per error
- Stop if the same fingerprint appears twice
- One retry may touch only one cause and the smallest possible file set
- Do not delete tests or weaken assertions

### Fallback rule

- If Claude CLI cannot be used, switch to `CODEX_FALLBACK`
- Record the fallback reason and whether it was used
- In fallback mode, Codex performs both the fix and the verification

## 13. Current Run Order

- Step 7: implement the full profile + game shell, then deploy once.
- Step 8: capture the requested change items in `CHANGE_REQUEST.md` without editing code.
- Step 9: apply the change items in dependency order, update logs and memory, then deploy again.
