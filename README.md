# 연구학교 운영 길라잡이 웹진 배포 설명서

전남광주통합특별시교육청교육연구정보원 『한눈에 파악하는 연구학교 운영 길라잡이』를 웹에서 읽고 검색할 수 있도록 구성한 정적 웹진입니다. GitHub Pages에서 교사들이 접속할 주소를 만들고, 전체 원문 PDF와 작성용 한글 파일은 Google Drive의 파일별 공개 링크로 연결합니다.

## 1. 미리보기

압축을 풀고 프로젝트 폴더 안에서 아래 명령을 실행합니다. 브라우저에서 [로컬 미리보기](http://localhost:8000/)를 엽니다.

~~~sh
python3 -m http.server 8000 --directory docs
~~~

홈의 검색창에 `정산`을 입력해 **지원금 최종 결산 보고서**가 나오는지 확인하세요. **길라잡이 읽기**에서 목차를 누르고, **자료·서식**에서 서식 1~7 미리보기를 열어 보세요.

## 2. Google Drive 자료 연결

1. 전체 원문 PDF와 배포용 HWPX를 Drive에 올립니다. 서식별 PDF 보기도 제공하려면 함께 제공한 **서식별 PDF** 압축을 풀고 필요한 PDF를 올립니다.
2. 각 공개 대상 **파일**의 공유에서 `일반 액세스 → 링크가 있는 모든 사용자 → 뷰어`를 선택합니다. 작성용 HWPX는 뷰어의 다운로드가 허용된 상태를 확인합니다. [Google Drive 파일 공유 안내](https://support.google.com/drive/answer/7166529?hl=ko)
3. 파일마다 공유 링크를 복사합니다. [자료 목록](docs/data/files.json)에서 아래 항목의 비어 있는 문자열에 붙여넣습니다. Drive에서 복사한 주소에 `resourcekey`가 있으면 함께 저장합니다.

| 연결하려는 파일 | 수정할 항목 | 웹진에서 나타나는 곳 |
| --- | --- | --- |
| 전체 길라잡이 PDF | `guide.viewUrl` | 상단 **원문 PDF** |
| 서식별 PDF | `forms`에서 해당 `number`를 찾고 `pdf.viewUrl` | **PDF로 열기**, **PDF 내려받기** |
| 별도로 확인한 PDF 다운로드 주소 | 같은 서식의 `pdf.downloadUrl` | **PDF 내려받기** 주소 |
| 작성용 HWPX 또는 HWP | 같은 서식의 `downloads` 안에 있는 `url` | **한글 파일 내려받기** |

서식 3은 **지원금 최종 결산 보고서**입니다. 서식 4는 **학교용·지도기관용** 다운로드 항목이 각각 있습니다. 항목의 `label`은 버튼에 보이는 이름입니다.

자료 목록은 공개 웹진과 함께 배포됩니다. 일반 방문자에게 공개하기로 한 **파일별 링크**를 기록하세요. 웹진에서 원문의 미리보기 이미지는 바로 열 수 있고, 한글 파일을 연결하면 내려받기 버튼이 나타납니다. 웹 미리보기의 67~68쪽은 성명·식별번호 예시를 가렸습니다. 별도 압축의 PDF는 원문 쪽을 분리한 사본입니다.

## 3. GitHub Pages 배포

1. GitHub에서 새 저장소를 만듭니다. 이름 예시는 `research-school-webzine`입니다. **GitHub Free**에서 Pages를 사용하려면 공개 저장소를 선택합니다. 이 경우 코드와 저장소 변경 이력도 공개됩니다.
2. 압축을 푼 폴더 **안의** `docs` 폴더와 `README.md`를 저장소 최상위에 올립니다. GitHub의 **Add file → Upload files**에서 추가합니다. 빈 저장소 첫 화면에서는 **uploading an existing file**을 선택합니다. 파일을 추가한 뒤 `main` 브랜치에 커밋합니다. 저장소에서 `docs/index.html`, `docs/assets/site.js`, `docs/data/files.json` 경로가 보이는지 확인합니다.
3. 저장소의 **Settings → Pages → Build and deployment**에서 **Deploy from a branch**를 선택합니다. **Branch**에서 `main`과 `/docs`를 선택하고 **Save**를 누릅니다.
4. **Actions**에서 Pages 배포가 성공했는지 확인합니다. **Settings → Pages**에 표시된 주소를 사용합니다. 프로젝트 주소 형식은 `계정명.github.io/저장소명/`입니다.
5. 시크릿 창과 휴대폰에서 사이트를 열고 본문, 검색, PDF 미리보기, 연결한 Drive PDF와 HWPX 내려받기를 확인합니다.

[GitHub Pages 배포 설정 안내](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

### Git 명령으로 올리는 경우

빈 GitHub 저장소를 만든 뒤 프로젝트 폴더에서 실행합니다. 마지막 주소는 본인 저장소 주소로 바꿉니다.

~~~sh
git init -b main
git add README.md docs
git commit -m "연구학교 운영 길라잡이 웹진 추가"
git remote add origin https://github.com/YOUR_ACCOUNT/research-school-webzine.git
git push -u origin main
~~~

## 4. 배포 뒤 업데이트

- **새 서식 추가 또는 파일 링크 변경**은 `docs/data/files.json`을 수정해 `main`에 커밋합니다. Pages 배포가 끝나면 버튼에 반영됩니다.
- **같은 Drive 파일의 개정본**은 Drive에서 **파일 정보 → 버전 관리 → 새 버전 업로드**로 올립니다. 같은 파일 주소에서 개정본이 제공됩니다. [Drive 파일 버전 안내](https://support.google.com/drive/answer/2409045?hl=ko)
- **본문 또는 안내 수정**은 해당 HTML을 편집합니다. 검색은 웹진의 본문과 서식명에서 검색하므로 배포된 페이지의 변경 사항을 읽습니다.
- **이달의 할 일**은 서울 시간의 현재 월에 따라 바뀝니다. 월별 항목을 고치려면 `docs/assets/site.js`의 `monthlyTasks`를 수정합니다.

## 소스 안내

| 파일 | 역할 |
| --- | --- |
| `docs/index.html` | 홈, 월별 할 일, 목적별 바로가기 |
| `docs/read.html` | 원문 장별 본문과 웹 표, 목차 |
| `docs/operations.html`, `docs/writing.html` | 단계별 업무와 문서 작성 안내 |
| `docs/forms.html`, `docs/faq.html` | 부록 서식 7종과 현장 질문 23개 |
| `docs/start.html`, `docs/overview.html` | 처음 맡은 담당자와 관리자 안내 |
| `docs/class.html`, `docs/handover.html` | 공개수업 준비와 인수인계표 |
| `docs/data/files.json` | Drive 파일 링크 |
| `docs/assets/site.css`, `docs/assets/site.js` | 공통 화면, 모바일 표시와 검색 |
