# 우리 반 자리 뽑기 웹앱 (Random Seat Allocation) 설계 사양서

- **작성일**: 2026-10-14
- **버전**: 1.0.0
- **상태**: 승인 대기 (Draft for Review)

---

## 1. 개요 및 목적
초·중·고 교실에서 교사가 학생들의 자리를 공정하고 흥미진진하게 무작위로 재배치할 수 있는 인터랙티브 웹 애플리케이션입니다.
학생 이름 대신 번호(1번부터 N번까지)로만 표시되며, 번호가 빠르게 돌아가는 룰렛/슬롯머신 연출과 생생한 효과음을 통해 자리 배치 과정 자체를 교실의 즐거운 이벤트로 만들어줍니다.

---

## 2. 주요 요구사항 및 기능 범위

### 2.1 필수 요구사항
1. **학생 수 및 모둠 수 설정**:
   - 학생 수: 2명 ~ 60명 (기본값: 25명)
   - 모둠 수: 1모둠 ~ 15모둠 (기본값: 5모둠)
   - 학생 수가 모둠 수보다 적을 경우 직관적인 안내와 함께 배치를 차단합니다.
2. **무작위 셔플 및 공평한 모둠 배분**:
   - 1부터 학생 수(N)까지의 정수를 Fisher-Yates 알고리즘으로 무작위 셔플합니다.
   - 학생 수가 모둠 수로 정확히 나누어떨어지지 않을 경우, 앞선 모둠부터 균등하게 1명씩 추가 배분합니다.
   - 학생 이름은 일절 사용하지 않으며, 1부터 N까지의 번호만 카드 형태로 표시합니다.
3. **기대감을 높이는 번호 롤링 애니메이션**:
   - **빠른 일괄 모드 (Instant)**: 2~2.5초간 모든 자리에서 숫자가 50ms 간격으로 빠르게 롤링되다가 일제히 확정.
   - **긴장감 순차 모드 (Sequential)**: 전체 카드가 롤링되며, 1모둠 1번부터 차례대로 0.15~0.25초 간격으로 스탬프처럼 착착 멈추고, 마지막 3~4개 자리는 살짝 뜸을 들여 긴장감 고조.
4. **다시 뽑기 (Re-shuffle)**:
   - 원클릭으로 즉시 새로운 난수 셔플을 생성하고 애니메이션을 재시작합니다.
   - 애니메이션 진행 중에는 중복 클릭을 차단(Disabled)하여 상태 꼬임을 방지합니다.

### 2.2 교실 특화 부가 기능
1. **칠판 / 교탁 인디케이터**:
   - 화면 상단에 교탁 및 칠판 위치 배너를 두어 교실 앞뒤 방향성을 한눈에 파악.
2. **브라우저 내장 사운드 신시사이저 (Web Audio API)**:
   - 외부 오디오 파일 다운로드 없이 브라우저 자체 오실레이터로 롤링 틱 사운드, 자리 확정 비프음, 최종 팡파레 멜로디 재생.
   - 언제든 켜고 끌 수 있는 음소거(Mute) 토글 버튼 제공.
3. **최종 축하 효과 (Confetti)**:
   - 모든 자리가 정해지는 순간 화면 전체에 꽃가루 폭죽 발사 (`canvas-confetti`).
4. **인쇄 및 이미지 저장**:
   - **A4 인쇄**: `@media print` 스타일을 적용하여 조작 버튼을 숨기고 깔끔한 흑백 격자표로 A4 1장에 인쇄.
   - **이미지 다운로드**: `html-to-image`를 통해 완성된 자리 배치표를 PNG 이미지 파일로 저장.
5. **전체화면 모드**:
   - 브라우저 Fullscreen API를 연동하여 교실 전자칠판/대형 TV 화면에 꽉 찬 뷰 제공.

---

## 3. 기술 스택 및 아키텍처

### 3.1 기술 스택
- **프레임워크**: React 19 (TypeScript)
- **빌드 도구**: Vite
- **스타일링**: Tailwind CSS
- **아이콘**: Lucide React
- **애니메이션 & 파티클**: Lucide, Tailwind Keyframes, `canvas-confetti`
- **효과음**: HTML5 Web Audio API (합성 오실레이터)
- **이미지 내보내기**: `html-to-image`
- **테스트 도구**: Vitest, React Testing Library

### 3.2 컴포넌트 구조
```
src/
├── components/
│   ├── HeaderControlBar.tsx   # 학생수/모둠수 입력, 모드 토글, 사운드, 전체화면, 뽑기 버튼
│   ├── BlackboardBanner.tsx   # 교탁 및 칠판 위치 표시 배너
│   ├── SeatingGrid.tsx        # 모둠별 카드 그리드 레이아웃
│   ├── GroupCard.tsx          # 개별 모둠 카드 (모둠명, 인원, 좌석 목록)
│   ├── SeatTile.tsx           # 개별 좌석 번호 타일 (롤링 슬롯, 확정 펄스 연출)
│   └── ActionToolbar.tsx      # 다시 뽑기, 인쇄, PNG 저장 버튼 바
├── hooks/
│   ├── useSeatLottery.ts      # 셔플 상태, 롤링 타이머, 순차 공개 로직 관리
│   └── useSoundEffects.ts     # Web Audio API 기반 오디오 합성 훅
├── utils/
│   ├── seatAllocation.ts      # Fisher-Yates 셔플 및 공평 분배 순수 함수
│   └── soundSynth.ts          # 오실레이터 주파수 생성 함수
├── App.tsx                    # 메인 레이아웃 및 컴포넌트 통합
└── main.tsx                   # 애플리케이션 엔트리포인트
```

---

## 4. 데이터 흐름 및 핵심 알고리즘

### 4.1 자리 배치 로직 (`seatAllocation.ts`)
```typescript
export interface Seat {
  id: string;
  studentNumber: number;
}

export interface Group {
  id: number;
  name: string;
  seats: Seat[];
}

export function allocateSeats(totalStudents: number, totalGroups: number): Group[] {
  // 1. 1부터 totalStudents까지의 배열 생성
  const numbers = Array.from({ length: totalStudents }, (_, i) => i + 1);
  
  // 2. Fisher-Yates 셔플
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  // 3. 모둠별 인원 분배 (나머지 인원은 앞 모둠부터 균등 분배)
  const baseCount = Math.floor(totalStudents / totalGroups);
  const remainder = totalStudents % totalGroups;

  const groups: Group[] = [];
  let currentIndex = 0;

  for (let g = 0; g < totalGroups; g++) {
    const count = baseCount + (g < remainder ? 1 : 0);
    const groupSeats: Seat[] = numbers.slice(currentIndex, currentIndex + count).map((num, idx) => ({
      id: `group-${g + 1}-seat-${idx + 1}`,
      studentNumber: num,
    }));
    groups.push({
      id: g + 1,
      name: `${g + 1}모둠`,
      seats: groupSeats,
    });
    currentIndex += count;
  }

  return groups;
}
```

### 4.2 애니메이션 제어 흐름
```
[사용자 '뽑기 시작' 클릭]
      ↓
[상태: 'animating'] (버튼 비활성화)
      ↓
[모든 좌석 타일: 무작위 숫자 50ms 주기로 롤링 시작] + [틱 사운드 재생]
      ↓
  ┌───────────────────────────────┴───────────────────────────────┐
  ↓ (순차 모드)                                                   ↓ (일괄 모드)
1번 좌석부터 순차적으로 확정 멈춤                                 2.5초간 전체 롤링 지속
(착! 차임벨 사운드)                                               ↓
마지막 3~4자리 간격 증대 (긴장감)                                 일제히 전체 확정 멈춤
  └───────────────────────────────┬───────────────────────────────┘
                                  ↓
                  [모든 좌석 확정 완료: 'completed']
                                  ↓
                  [축하 팡파레 사운드 + Confetti 발사]
                                  ↓
                  [다시 뽑기 / 인쇄 / 이미지 저장 버튼 활성화]
```

---

## 5. 예외 처리 및 검증 계획

### 5.1 예외 처리
- `totalStudents < totalGroups`: 에러 메시지 툴팁 노출, 시작 버튼 비활성화.
- `totalStudents > 60` 또는 `totalGroups > 15`: 입력값 클램핑 및 경고.
- 애니메이션 진행 중 새로고침/재시작 방지.

### 5.2 검증 계획
1. **단위 테스트 (Vitest)**:
   - `seatAllocation.test.ts`: 학생 수 1~60, 모둠 수 1~15에 대해 모든 번호가 1회씩만 포함되는지, 누락/중복이 없는지 검증.
   - 나머지 인원이 앞 모둠에 1명씩 올바르게 할당되는지 확인.
2. **E2E/컴포넌트 테스트**:
   - 버튼 클릭 시 애니메이션 개시 및 완료 후 '다시 뽑기' 버튼 활성화 확인.
   - 사운드 토글 상태 유지 확인.
