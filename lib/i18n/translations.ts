export type Locale = 'en' | 'zh' | 'ja' | 'ko' | 'es';

export const supportedLocales: Locale[] = ['en', 'zh', 'ja', 'ko', 'es'];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  es: 'Español'
};

export const translations: Record<string, Partial<Record<Locale, string>>> = {
  'common.language': {
    en: 'Language',
    zh: '语言',
    ja: '言語',
    ko: '언어',
    es: 'Idioma'
  },
  'nav.home': {
    en: 'Home',
    zh: '首页',
    ja: 'ホーム',
    ko: '홈',
    es: 'Inicio'
  },
  'nav.blog': {
    en: 'Blog',
    zh: '博客',
    ja: 'ブログ',
    ko: '블로그',
    es: 'Blog'
  },
  'nav.photography': {
    en: 'Photography',
    zh: '摄影',
    ja: '写真',
    ko: '사진',
    es: 'Fotografía'
  },
  'nav.about': {
    en: 'About',
    zh: '关于',
    ja: '概要',
    ko: '소개',
    es: 'Acerca de'
  },
  'nav.podcast': {
    en: 'Podcast',
    zh: '播客',
    ja: 'ポッドキャスト',
    ko: '팟캐스트',
    es: 'Podcast'
  },
  'nav.friends': {
    en: 'Friends',
    zh: '友链',
    ja: 'ともだちリンク',
    ko: '친구 링크',
    es: 'Enlaces'
  },
  'nav.datasets': {
    en: 'Datasets',
    zh: '数据集',
    ja: 'データセット',
    ko: '데이터셋',
    es: 'Conjuntos'
  },
  'blog.readMore': {
    en: 'Read More',
    zh: '阅读更多',
    ja: '続きを読む',
    ko: '더 읽기',
    es: 'Leer más'
  },
  'common.dateFormat': {
    en: 'MMMM d, yyyy',
    zh: 'yyyy年MM月dd日',
    ja: 'yyyy年MM月dd日',
    ko: 'yyyy년 MM월 dd일',
    es: 'd de MMMM, yyyy'
  },
  'blog.posts': {
    en: 'Posts',
    zh: '文章',
    ja: '投稿',
    ko: '게시물',
    es: 'Artículos'
  },
  'common.sortBy': {
    en: 'Sort by',
    zh: '排序方式',
    ja: '並び替え',
    ko: '정렬 기준',
    es: 'Ordenar por'
  },
  'common.sortByDate': {
    en: 'By Date',
    zh: '按日期',
    ja: '日付順',
    ko: '날짜순',
    es: 'Por fecha'
  },
  'common.sortByTitle': {
    en: 'By Title',
    zh: '按标题',
    ja: 'タイトル順',
    ko: '제목순',
    es: 'Por título'
  },
  'common.sortBySlug': {
    en: 'By Slug',
    zh: '按别名',
    ja: 'スラッグ順',
    ko: '슬러그순',
    es: 'Por slug'
  },
  'profile.at': {
    en: 'at',
    zh: '在',
    ja: 'の',
    ko: '의',
    es: 'en'
  },
  'profile.emailMe': {
    en: 'Email me',
    zh: '给我发邮件',
    ja: 'メールする',
    ko: '이메일 보내기',
    es: 'Envíame un correo'
  },
  'profile.followMe': {
    en: 'Follow me',
    zh: '关注我',
    ja: 'フォローする',
    ko: '팔로우하기',
    es: 'Sígueme'
  },
  "common.posts": {
    en: "{{count}} posts",
    zh: "{{count}} 篇",
    ja: "{{count}} 件",
    ko: "{{count}}개",
    es: "{{count}} publicaciones",
  },
  "common.close": {
    en: "Close",
    zh: "关闭",
    ja: "閉じる",
    ko: "닫기",
    es: "Cerrar",
  },
  "common.cancel": {
    en: "Cancel",
    zh: "取消",
    ja: "キャンセル",
    ko: "취소",
    es: "Cancelar",
  },
  "common.save": {
    en: "Save",
    zh: "保存",
    ja: "保存",
    ko: "저장",
    es: "Guardar",
  },
  "common.error": {
    en: "Error",
    zh: "出错了",
    ja: "エラー",
    ko: "오류",
    es: "Error",
  },
  "common.done": {
    en: "Done",
    zh: "完成",
    ja: "完了",
    ko: "완료",
    es: "Listo",
  },
  "blog.writing": {
    en: "Writing",
    zh: "写作",
    ja: "執筆",
    ko: "글쓰기",
    es: "Escritura",
  },
  "blog.allWriting": {
    en: "All writing",
    zh: "全部文章",
    ja: "すべての記事",
    ko: "전체 글",
    es: "Todos los textos",
  },
  "blog.tagline": {
    en: "Essays on remote work, systems, and the long way around hard problems.",
    zh: "关于远程工作、系统，以及绕远路解决问题的文章。",
    ja: "リモートワーク、システム、そして遠回りして難しい問題を解く話。",
    ko: "원격 근무와 시스템, 어려운 문제를 멀리 돌아 해결한 기록.",
    es: "Ensayos sobre trabajo remoto, sistemas y el camino largo hacia los problemas difíciles.",
  },
  "blog.category": {
    en: "Category",
    zh: "分类",
    ja: "カテゴリ",
    ko: "카테고리",
    es: "Categoría",
  },
  "blog.onThisPage": {
    en: "On this page",
    zh: "本页内容",
    ja: "このページ",
    ko: "이 페이지",
    es: "En esta página",
  },
  "blog.empty": {
    en: "No posts yet.",
    zh: "还没有文章。",
    ja: "まだ記事がありません。",
    ko: "아직 글이 없습니다.",
    es: "Todavía no hay artículos.",
  },
  "blog.postsHeading": {
    en: "Posts",
    zh: "文章",
    ja: "記事",
    ko: "글",
    es: "Publicaciones",
  },
  "article.share": {
    en: "Share",
    zh: "分享",
    ja: "共有",
    ko: "공유",
    es: "Compartir",
  },
  "article.sharePost": {
    en: "Share this post",
    zh: "分享这篇文章",
    ja: "この記事を共有",
    ko: "이 글 공유하기",
    es: "Compartir esta entrada",
  },
  "article.shareTwitter": {
    en: "Share on Twitter",
    zh: "分享到 Twitter",
    ja: "Twitter で共有",
    ko: "Twitter에 공유",
    es: "Compartir en Twitter",
  },
  "article.shareFacebook": {
    en: "Share on Facebook",
    zh: "分享到 Facebook",
    ja: "Facebook で共有",
    ko: "Facebook에 공유",
    es: "Compartir en Facebook",
  },
  "article.shareLinkedIn": {
    en: "Share on LinkedIn",
    zh: "分享到 LinkedIn",
    ja: "LinkedIn で共有",
    ko: "LinkedIn에 공유",
    es: "Compartir en LinkedIn",
  },
  "article.shareWeChat": {
    en: "Share to WeChat",
    zh: "分享到微信",
    ja: "WeChat で共有",
    ko: "WeChat에 공유",
    es: "Compartir en WeChat",
  },
  "article.copyLink": {
    en: "Copy link",
    zh: "复制链接",
    ja: "リンクをコピー",
    ko: "링크 복사",
    es: "Copiar enlace",
  },
  "article.copied": {
    en: "Link copied to clipboard!",
    zh: "链接已复制到剪贴板",
    ja: "リンクをコピーしました",
    ko: "링크를 복사했습니다",
    es: "¡Enlace copiado!",
  },
  "article.qrTitle": {
    en: "QR code for WeChat",
    zh: "微信分享二维码",
    ja: "WeChat 共有用 QR コード",
    ko: "WeChat 공유 QR 코드",
    es: "Código QR para WeChat",
  },
  "article.qrHint": {
    en: "Scan this code with WeChat to share",
    zh: "用微信扫码分享",
    ja: "WeChat でスキャンして共有",
    ko: "WeChat으로 스캔해 공유하세요",
    es: "Escanea este código con WeChat para compartir",
  },
  "article.toc": {
    en: "Table of contents",
    zh: "目录",
    ja: "目次",
    ko: "목차",
    es: "Índice",
  },
  "home.profile": {
    en: "Profile",
    zh: "个人主页",
    ja: "プロフィール",
    ko: "프로필",
    es: "Perfil",
  },
  "home.readWriting": {
    en: "Read the writing →",
    zh: "读文章 →",
    ja: "記事を読む →",
    ko: "글 읽기 →",
    es: "Leer los textos →",
  },
  "home.proofOfWork": {
    en: "Proof of work",
    zh: "作品证明",
    ja: "実績",
    ko: "작업 증거",
    es: "Prueba de trabajo",
  },
  "home.byTheme": {
    en: "By theme",
    zh: "按主题",
    ja: "テーマ別",
    ko: "주제별",
    es: "Por tema",
  },
  "home.frames": {
    en: "Frames",
    zh: "取景",
    ja: "フレーム",
    ko: "프레임",
    es: "Encuadres",
  },
  "home.photography": {
    en: "Photography",
    zh: "摄影",
    ja: "写真",
    ko: "사진",
    es: "Fotografía",
  },
  "home.now": {
    en: "Now",
    zh: "近况",
    ja: "現在",
    ko: "지금",
    es: "Ahora",
  },
  "home.rightNow": {
    en: "Right now",
    zh: "最近在做",
    ja: "いま取り組んでいること",
    ko: "요즘 하는 일",
    es: "Ahora mismo",
  },
  "home.resume": {
    en: "Résumé",
    zh: "简历",
    ja: "履歴書",
    ko: "이력서",
    es: "Currículum",
  },
  "home.hireMe": {
    en: "Hire me",
    zh: "联系我",
    ja: "採用・依頼",
    ko: "채용·의뢰",
    es: "Contrátame",
  },
  "home.projects": {
    en: "Projects",
    zh: "项目",
    ja: "プロジェクト",
    ko: "프로젝트",
    es: "Proyectos",
  },
  "home.thingsIMaintain": {
    en: "Things I maintain",
    zh: "我在维护的东西",
    ja: "メンテナンスしているもの",
    ko: "제가 관리하는 것들",
    es: "Lo que mantengo",
  },
  "home.latest": {
    en: "Latest",
    zh: "最新",
    ja: "最新",
    ko: "최신",
    es: "Recientes",
  },
  "home.startWithDesignDoc": {
    en: "start with the design doc →",
    zh: "从设计文档开始 →",
    ja: "設計ドキュメントから →",
    ko: "설계 문서부터 →",
    es: "Empieza por el documento de diseño →",
  },
  "home.allWritingArrow": {
    en: "all writing →",
    zh: "全部文章 →",
    ja: "すべての記事 →",
    ko: "전체 글 →",
    es: "Todos los textos →",
  },
  "home.browseAll": {
    en: "browse all {{count}} posts →",
    zh: "浏览全部 {{count}} 篇 →",
    ja: "全 {{count}} 件を見る →",
    ko: "전체 {{count}}개 보기 →",
    es: "Ver las {{count}} publicaciones →",
  },
  "home.openGallery": {
    en: "open the gallery →",
    zh: "打开相册 →",
    ja: "ギャラリーを開く →",
    ko: "갤러리 열기 →",
    es: "Abrir la galería →",
  },
  "home.fullPicture": {
    en: "the full picture →",
    zh: "完整履历 →",
    ja: "全体像を見る →",
    ko: "전체 보기 →",
    es: "El cuadro completo →",
  },
  "home.photographyBlurb": {
    en: "The other half of how I look at things — places, light and the shapes in between. Originals live in R2, previews are generated at the edge.",
    zh: "我看世界的另一半方式——地点、光线，以及它们之间的形状。原图存在 R2，预览在边缘生成。",
    ja: "ものの見方のもう半分——場所、光、その間のかたち。原画は R2、プレビューはエッジで生成。",
    ko: "세상을 보는 나머지 절반 — 장소와 빛, 그 사이의 형태. 원본은 R2, 미리보기는 엣지에서 생성.",
    es: "La otra mitad de cómo miro las cosas: lugares, luz y las formas intermedias. Los originales viven en R2 y las vistas previas se generan en el edge.",
  },
  "about.story": {
    en: "Story",
    zh: "经历",
    ja: "ストーリー",
    ko: "이야기",
    es: "Historia",
  },
  "about.howIGotHere": {
    en: "How I got here",
    zh: "我是怎么走到这里的",
    ja: "ここに至るまで",
    ko: "여기까지 온 길",
    es: "Cómo llegué aquí",
  },
  "about.whatIAmDoing": {
    en: "What I am doing",
    zh: "现在在做什么",
    ja: "いまやっていること",
    ko: "지금 하는 일",
    es: "Qué estoy haciendo",
  },
  "about.selectedWork": {
    en: "Selected work",
    zh: "精选作品",
    ja: "主な仕事",
    ko: "주요 작업",
    es: "Trabajo seleccionado",
  },
  "about.writingProjects": {
    en: "Writing & projects",
    zh: "文章与项目",
    ja: "記事とプロジェクト",
    ko: "글과 프로젝트",
    es: "Textos y proyectos",
  },
  "about.open": {
    en: "Open →",
    zh: "打开 →",
    ja: "開く →",
    ko: "열기 →",
    es: "Abrir →",
  },
  "about.moreInCategory": {
    en: "more in this category →",
    zh: "这个分类的更多文章 →",
    ja: "このカテゴリの記事 →",
    ko: "이 카테고리 더 보기 →",
    es: "Más de esta categoría →",
  },
  "about.stepStart": {
    en: "01 / Start",
    zh: "01 / 起点",
    ja: "01 / 出発点",
    ko: "01 / 시작",
    es: "01 / Inicio",
  },
  "about.stepTurn": {
    en: "02 / Turn",
    zh: "02 / 转折",
    ja: "02 / 転機",
    ko: "02 / 전환",
    es: "02 / Giro",
  },
  "about.stepNow": {
    en: "03 / Now",
    zh: "03 / 现在",
    ja: "03 / 現在",
    ko: "03 / 현재",
    es: "03 / Ahora",
  },
  "profile.tagline": {
    en: "Independent engineer building GraphRAG systems in TypeScript",
    zh: "独立工程师，用 TypeScript 构建 GraphRAG 系统",
    ja: "TypeScript で GraphRAG を構築する独立エンジニア",
    ko: "TypeScript로 GraphRAG을 만드는 독립 엔지니어",
    es: "Ingeniero independiente que construye sistemas GraphRAG en TypeScript",
  },
  "profile.role": {
    en: "Independent engineer · GraphRAG, TypeScript, retrieval infrastructure",
    zh: "独立工程师 · GraphRAG、TypeScript、检索基础设施",
    ja: "独立エンジニア · GraphRAG / TypeScript / 検索基盤",
    ko: "독립 엔지니어 · GraphRAG, TypeScript, 검색 인프라",
    es: "Ingeniero independiente · GraphRAG, TypeScript, infraestructura de recuperación",
  },
  "profile.statusLabel": {
    en: "Building graphrag-ts",
    zh: "正在写 graphrag-ts",
    ja: "graphrag-ts を開発中",
    ko: "graphrag-ts 개발 중",
    es: "Construyendo graphrag-ts",
  },
  "profile.statusDetail": {
    en: "open-source GraphRAG in TypeScript + Postgres/pgvector",
    zh: "开源 GraphRAG：TypeScript + Postgres/pgvector",
    ja: "オープンソース GraphRAG：TypeScript + Postgres/pgvector",
    ko: "오픈소스 GraphRAG: TypeScript + Postgres/pgvector",
    es: "GraphRAG open source en TypeScript + Postgres/pgvector",
  },
  "profile.aboutStart": {
    en: "I spent six years building the invisible kind of software: a low-code platform and large-screen visualization systems at JD.com, then micro-frontends, a Salesforce rules engine and an AST-diff based E2E test selector at Compass. The pattern across all of it is the same — take a big opaque system and make it legible enough that other people can reason about it, and change it without fear.",
    zh: "前六年我一直在写那种“看不见”的软件：在京东做低代码平台和大屏可视化，在 Compass 做微前端、Salesforce 规则引擎和基于 AST diff 的 E2E 用例选择。这些事背后是同一个模式——把一个庞大而不透明的系统，变得足够可读，让别人能推演它、也能不害怕地改它。",
    ja: "最初の6年は「見えない」ソフトウェアを作っていました。京東（JD.com）でローコード基盤と大画面ビジュアライゼーション、Compass でマイクロフロントエンド、Salesforce ルールエンジン、AST diff による E2E テスト選択。根底にあるのは同じ形です——巨大で不透明なシステムを、他人が推論でき、恐れずに変更できるほど読みやすくすること。",
    ko: "처음 6년은 눈에 보이지 않는 소프트웨어를 만들었습니다. 징둥(JD.com)에서 로우코드 플랫폼과 대형 화면 시각화, Compass에서 마이크로 프런트엔드, Salesforce 규칙 엔진, AST diff 기반 E2E 테스트 선택. 바탕에 있는 패턴은 같습니다 — 거대하고 불투명한 시스템을 남이 이해하고 두려움 없이 바꿀 수 있을 만큼 읽히게 만드는 일.",
    es: "Pasé seis años construyendo el tipo invisible de software: una plataforma low-code y visualizaciones de gran formato en JD.com, luego micro-frontends, un motor de reglas de Salesforce y un selector de tests E2E basado en AST-diff en Compass. El patrón es siempre el mismo: tomar un sistema grande y opaco y hacerlo lo bastante legible para que otros puedan razonarlo y cambiarlo sin miedo.",
  },
  "profile.aboutTurn": {
    en: "In 2022 I went fully remote. Four years and two companies later I have a harder, less comfortable lesson: remote work replaces trust with process, and process starts measuring the wrong thing. I built a rules engine and a trading platform from zero, and twice lost merge rights — not over broken code, but because nobody in the room could see the work. I know now that I need a team in the same timezone and, honestly, in the same room.",
    zh: "2022 年我开始全远程。四年、两家公司之后，我得到一个更难堪的结论：远程用流程替代了信任，而流程最终在度量错误的东西。我从零写过一个规则引擎和一个交易平台，两次被收走合并权限——不是因为代码坏了，而是因为房间里没人看得见这份工作。我现在知道自己需要同一时区、说实话最好是同一个房间的团队。",
    ja: "2022 年に完全リモートへ。4年・2社を経て得たのは、より居心地の悪い教訓です。リモートは信頼をプロセスで置き換え、プロセスはやがて間違ったものを測り始める。ルールエンジンと取引プラットフォームをゼロから作り、二度マージ権を失いました。コードが壊れたからではなく、部屋の誰もその仕事を見ていなかったからです。同じタイムゾーン、できれば同じ部屋にいるチームが必要だと、いまは分かっています。",
    ko: "2022년에 완전 원격으로 전환했습니다. 4년, 두 회사를 거치며 얻은 더 불편한 교훈은 이것입니다. 원격 근무는 신뢰를 프로세스로 대체하고, 프로세스는 결국 잘못된 것을 측정합니다. 규칙 엔진과 거래 플랫폼을 처음부터 만들었고, 두 번 머지 권한을 잃었습니다. 코드가 망가져서가 아니라 방 안의 누구도 그 일을 보지 못했기 때문입니다. 이제는 같은 시간대, 솔직히 같은 방에 있는 팀이 필요하다는 걸 압니다.",
    es: "En 2022 pasé a remoto total. Cuatro años y dos empresas después tengo una lección más incómoda: el trabajo remoto sustituye la confianza por proceso, y el proceso acaba midiendo lo que no importa. Construí un motor de reglas y una plataforma de trading desde cero y perdí permisos de merge dos veces: no por código roto, sino porque nadie en la sala veía el trabajo. Ahora sé que necesito un equipo en mi zona horaria y, honestamente, en la misma sala.",
  },
  "profile.aboutNow": {
    en: "So now I work on the part of AI infrastructure I can verify line by line: graphrag-ts, an open-source GraphRAG implementation in TypeScript on Postgres/pgvector — incremental indexing, Leiden communities, hybrid retrieval with evidence grounding, MCP server included. I write the internals down as long posts because that layer is under-documented. I am open to agent-engineering and frontend roles, and to a small number of consulting engagements on retrieval and knowledge-graph systems.",
    zh: "所以现在我做的，是 AI 基础设施里我能逐行验证的那一层：graphrag-ts，一个用 TypeScript + Postgres/pgvector 的开源 GraphRAG 实现——增量索引、Leiden 社区、带证据溯源的混合检索，还带 MCP server。我把内部实现写成长文，因为这一层几乎没有文档。我接受 agent 工程与前端方向的职位，也接少量检索与知识图谱系统的咨询。",
    ja: "だから今は、AI インフラのうち一行ずつ検証できる層を作っています。graphrag-ts——TypeScript + Postgres/pgvector によるオープンソース GraphRAG 実装で、増分インデックス、Leiden コミュニティ、根拠付きハイブリッド検索、MCP サーバー込み。内部実装を長文で書くのは、この層のドキュメントがほとんど無いからです。エージェントエンジニアリングとフロントエンドの職務、検索・知識グラフの少人数コンサルを受け付けています。",
    ko: "그래서 지금은 AI 인프라에서 한 줄씩 검증할 수 있는 층을 만듭니다. graphrag-ts — TypeScript + Postgres/pgvector 기반 오픈소스 GraphRAG 구현으로, 증분 인덱싱, Leiden 커뮤니티, 근거 추적이 붙은 하이브리드 검색, MCP 서버까지 포함합니다. 내부 구현을 긴 글로 쓰는 이유는 이 층의 문서가 거의 없기 때문입니다. 에이전트 엔지니어링과 프런트엔드 직무, 그리고 검색·지식 그래프 시스템 자문(소수)을 받고 있습니다.",
    es: "Así que ahora trabajo en la parte de la infraestructura de IA que puedo verificar línea a línea: graphrag-ts, una implementación open source de GraphRAG en TypeScript sobre Postgres/pgvector, con indexado incremental, comunidades de Leiden, recuperación híbrida con evidencia y servidor MCP. Escribo las tripas en posts largos porque esa capa está poco documentada. Estoy abierto a roles de agent engineering y frontend, y a un número pequeño de consultorías sobre recuperación y grafos de conocimiento.",
  },
  "profile.fullStoryLabel": {
    en: "The long version",
    zh: "完整版本",
    ja: "長いバージョン",
    ko: "긴 버전",
    es: "La versión larga",
  },
  "profile.fullStoryNote": {
    en: "Four years remote, two companies, two lost merge buttons — the annotated version of the three paragraphs above.",
    zh: "四年远程、两家公司、两次被收走合并按钮——上面三段话的详尽版。",
    ja: "4年のリモート、2社、失ったマージ権2回——上の3段落の詳しい版。",
    ko: "4년 원격, 두 회사, 두 번 잃은 머지 버튼 — 위 세 문단의 자세한 버전.",
    es: "Cuatro años en remoto, dos empresas y dos botones de merge perdidos: la versión anotada de los tres párrafos anteriores.",
  },
  "profile.now1": {
    en: "Shipping graphrag-ts: incremental build, Leiden community detection, hybrid retrieval with evidence grounding, MCP server.",
    zh: "推进 graphrag-ts：增量构建、Leiden 社区检测、带证据溯源的混合检索、MCP server。",
    ja: "graphrag-ts を進行中：増分ビルド、Leiden コミュニティ検出、根拠付きハイブリッド検索、MCP サーバー。",
    ko: "graphrag-ts 진행 중: 증분 빌드, Leiden 커뮤니티 탐지, 근거 추적 하이브리드 검색, MCP 서버.",
    es: "Avanzando graphrag-ts: construcción incremental, detección de comunidades Leiden, recuperación híbrida con evidencia y servidor MCP.",
  },
  "profile.now2": {
    en: "Writing one long post per subsystem instead of tutorials.",
    zh: "每个子系统写一篇长文，而不是写教程。",
    ja: "チュートリアルではなく、サブシステムごとに長文を1本。",
    ko: "튜토리얼 대신 서브시스템마다 긴 글 하나.",
    es: "Un post largo por subsistema en lugar de tutoriales.",
  },
  "profile.now3": {
    en: "Open to agent-engineering / frontend roles and a small number of retrieval consulting engagements.",
    zh: "接受 agent 工程 / 前端职位，以及少量检索方向咨询。",
    ja: "エージェントエンジニアリング / フロントエンド職、および検索分野の少人数コンサルを受け付けています。",
    ko: "에이전트 엔지니어링 / 프런트엔드 직무와 소수의 검색 자문을 받고 있습니다.",
    es: "Abierto a roles de agent engineering / frontend y a un número pequeño de consultorías de recuperación.",
  },
  "profile.seriesLabel": {
    en: "GraphRAG internals",
    zh: "GraphRAG 内幕",
    ja: "GraphRAG の内部",
    ko: "GraphRAG 내부",
    es: "GraphRAG por dentro",
  },
  "profile.seriesBlurb": {
    en: "How graphrag-ts is actually built — design, retrieval, global map-reduce, incremental updates.",
    zh: "graphrag-ts 到底是怎么写的——设计、检索、全局 map-reduce、增量更新。",
    ja: "graphrag-ts が実際どう作られているか——設計、検索、グローバル map-reduce、増分更新。",
    ko: "graphrag-ts가 실제로 어떻게 만들어지는가 — 설계, 검색, 전역 map-reduce, 증분 갱신.",
    es: "Cómo está construido graphrag-ts: diseño, recuperación, map-reduce global y actualizaciones incrementales.",
  },
  "profile.groupGraphragBlurb": {
    en: "Indexing pipeline, community detection, retrieval, global map-reduce, incremental builds.",
    zh: "索引流水线、社区检测、检索、全局 map-reduce、增量构建。",
    ja: "インデックスパイプライン、コミュニティ検出、検索、グローバル map-reduce、増分ビルド。",
    ko: "인덱싱 파이프라인, 커뮤니티 탐지, 검색, 전역 map-reduce, 증분 빌드.",
    es: "Pipeline de indexado, detección de comunidades, recuperación, map-reduce global y builds incrementales.",
  },
  "profile.groupEngineeringLabel": {
    en: "Engineering practice",
    zh: "工程实践",
    ja: "エンジニアリング実践",
    ko: "엔지니어링 실무",
    es: "Práctica de ingeniería",
  },
  "profile.groupEngineeringBlurb": {
    en: "The frontend infrastructure work underneath: micro-frontends, E2E selection, rendering engines, grouped lists.",
    zh: "底下那层前端基础设施：微前端、E2E 用例选择、渲染引擎、分组列表。",
    ja: "その下にあるフロントエンド基盤：マイクロフロントエンド、E2E 選択、レンダリングエンジン、グループリスト。",
    ko: "그 아래에 있는 프런트엔드 인프라: 마이크로 프런트엔드, E2E 선택, 렌더링 엔진, 그룹 목록.",
    es: "La infraestructura frontend de fondo: micro-frontends, selección de E2E, motores de render y listas agrupadas.",
  },
  "profile.groupNotesLabel": {
    en: "Career & notes",
    zh: "职业与随笔",
    ja: "キャリアと記録",
    ko: "커리어와 기록",
    es: "Carrera y notas",
  },
  "profile.groupNotesBlurb": {
    en: "One long retrospective, one resume, and the occasional experiment that did not fit anywhere else.",
    zh: "一篇长复盘、一份简历，以及一些哪里都塞不下的实验。",
    ja: "長い振り返り1本、履歴書1本、そしてどこにも収まらない実験。",
    ko: "긴 회고 하나, 이력서 하나, 그리고 어디에도 맞지 않는 실험들.",
    es: "Una retrospectiva larga, un currículum y algún experimento que no encajaba en otro sitio.",
  },
  "profile.projectGraphragRole": {
    en: "Author & maintainer",
    zh: "作者 & 维护者",
    ja: "作者・メンテナ",
    ko: "작성자 및 관리자",
    es: "Autor y mantenedor",
  },
  "profile.projectGraphragBlurb": {
    en: "GraphRAG from scratch: indexing pipeline, incremental builds, global map-reduce, hybrid retrieval with evidence grounding.",
    zh: "从零实现的 GraphRAG：索引流水线、增量构建、全局 map-reduce、带证据溯源的混合检索。",
    ja: "ゼロから作る GraphRAG：インデックスパイプライン、増分ビルド、グローバル map-reduce、根拠付きハイブリッド検索。",
    ko: "처음부터 만든 GraphRAG: 인덱싱 파이프라인, 증분 빌드, 전역 map-reduce, 근거 추적 하이브리드 검색.",
    es: "GraphRAG desde cero: pipeline de indexado, builds incrementales, map-reduce global y recuperación híbrida con evidencia.",
  },
  "profile.projectBlogRole": {
    en: "Author",
    zh: "作者",
    ja: "作者",
    ko: "작성자",
    es: "Autor",
  },
  "profile.projectBlogBlurb": {
    en: "This site — long-form notes on retrieval, frontend infrastructure, and one career retrospective.",
    zh: "这个站点——关于检索、前端基础设施的长文，以及一篇职业复盘。",
    ja: "このサイト——検索とフロントエンド基盤の長文、そしてキャリアの振り返り。",
    ko: "이 사이트 — 검색과 프런트엔드 인프라에 대한 긴 글, 그리고 커리어 회고.",
    es: "Este sitio: notas largas sobre recuperación, infraestructura frontend y una retrospectiva de carrera.",
  },
  "profile.socialGithub": {
    en: "GitHub",
    zh: "GitHub",
    ja: "GitHub",
    ko: "GitHub",
    es: "GitHub",
  },
  "profile.socialEmail": {
    en: "Email",
    zh: "邮件",
    ja: "メール",
    ko: "이메일",
    es: "Correo",
  },
  "profile.socialBlog": {
    en: "Blog",
    zh: "博客",
    ja: "ブログ",
    ko: "블로그",
    es: "Blog",
  },
  "photography.kicker": {
    en: "Photography",
    zh: "摄影",
    ja: "写真",
    ko: "사진",
    es: "Fotografía",
  },
  "watermark.kicker": { en: "Photo verification", zh: "照片验证", ja: "写真の検証", ko: "사진 확인", es: "Verificación de fotos" },
  "watermark.title": { en: "Find a photo", zh: "查找照片", ja: "写真を探す", ko: "사진 찾기", es: "Encontrar una foto" },
  "watermark.description": { en: "Choose an image to scan its invisible preview watermark.", zh: "选择图片，扫描预览图中的隐形水印。", ja: "画像を選び、プレビューの不可視ウォーターマークをスキャンします。", ko: "이미지를 선택해 미리보기의 보이지 않는 워터마크를 검색하세요.", es: "Elige una imagen para buscar la marca de agua invisible de la vista previa." },
  "watermark.choose": { en: "Choose image", zh: "选择图片", ja: "画像を選択", ko: "이미지 선택", es: "Elegir imagen" },
  "watermark.scanning": { en: "Scanning…", zh: "正在扫描…", ja: "スキャン中…", ko: "검색 중…", es: "Escaneando…" },
  "watermark.none": { en: "No watermark found.", zh: "未找到水印。", ja: "ウォーターマークが見つかりません。", ko: "워터마크를 찾을 수 없습니다.", es: "No se encontró ninguna marca de agua." },
  "watermark.found": { en: "Watermark found", zh: "找到水印", ja: "ウォーターマークが見つかりました", ko: "워터마크를 찾았습니다", es: "Marca de agua encontrada" },
  "watermark.failed": { en: "Could not read this image.", zh: "无法读取此图片。", ja: "この画像を読み込めませんでした。", ko: "이미지를 읽을 수 없습니다.", es: "No se pudo leer esta imagen." },
  "watermark.openGallery": { en: "Open in gallery →", zh: "在相册中查看 →", ja: "ギャラリーで開く →", ko: "갤러리에서 보기 →", es: "Abrir en la galería →" },
  "photography.title": {
    en: "Frames",
    zh: "取景",
    ja: "フレーム",
    ko: "프레임",
    es: "Encuadres",
  },
  "photography.tagline": {
    en: "Places and light I keep coming back to. Originals are one click away.",
    zh: "反复回去拍的地点和光线。原图一键可得。",
    ja: "何度も戻ってしまう場所と光。原画はワンクリックで。",
    ko: "자꾸 돌아가게 되는 장소와 빛. 원본은 클릭 한 번이면 됩니다.",
    es: "Lugares y luz a los que siempre vuelvo. Los originales están a un clic.",
  },
  "photography.gallery": {
    en: "Gallery",
    zh: "相册",
    ja: "ギャラリー",
    ko: "갤러리",
    es: "Galería",
  },
  "photography.all": {
    en: "All",
    zh: "全部",
    ja: "すべて",
    ko: "전체",
    es: "Todo",
  },
  "photography.allPlaces": {
    en: "All places",
    zh: "所有地点",
    ja: "すべての場所",
    ko: "모든 장소",
    es: "Todos los lugares",
  },
  "photography.byPlace": {
    en: "Filter by place",
    zh: "按地点筛选",
    ja: "場所で絞り込む",
    ko: "장소별 필터",
    es: "Filtrar por lugar",
  },
  "photography.empty": {
    en: "Empty gallery",
    zh: "相册还是空的",
    ja: "ギャラリーは空です",
    ko: "갤러리가 비어 있습니다",
    es: "Galería vacía",
  },
  "photography.emptyLead": {
    en: "Nothing published yet. Upload one from",
    zh: "还没有发布任何照片。可以从",
    ja: "まだ公開されていません。こちらからアップロードできます：",
    ko: "아직 공개된 사진이 없습니다. 다음에서 업로드하세요:",
    es: "Nada publicado todavía. Sube una desde",
  },
  "photography.uploadLink": {
    en: "the upload page",
    zh: "上传页",
    ja: "アップロードページ",
    ko: "업로드 페이지",
    es: "la página de subida",
  },
  "photography.uploadKicker": {
    en: "Upload a frame",
    zh: "上传照片",
    ja: "フレームをアップロード",
    ko: "프레임 업로드",
    es: "Subir un encuadre",
  },
  "photography.uploadTagline": {
    en: "The original goes to R2, the metadata to D1, previews are generated in the browser.",
    zh: "原图进 R2，元数据进 D1，预览在浏览器里生成。",
    ja: "原画は R2、メタデータは D1、プレビューはブラウザで生成。",
    ko: "원본은 R2, 메타데이터는 D1, 미리보기는 브라우저에서 생성합니다.",
    es: "El original va a R2, los metadatos a D1 y las vistas previas se generan en el navegador.",
  },
  "photoForm.title": {
    en: "Title",
    zh: "标题",
    ja: "タイトル",
    ko: "제목",
    es: "Título",
  },
  "photoForm.location": {
    en: "Location",
    zh: "地点",
    ja: "場所",
    ko: "장소",
    es: "Ubicación",
  },
  "photoForm.locationPlaceholder": {
    en: "City, region, country",
    zh: "城市，地区，国家",
    ja: "都市、地域、国",
    ko: "도시, 지역, 국가",
    es: "Ciudad, región, país",
  },
  "photoForm.metadataDetected": {
    en: "Photo metadata detected",
    zh: "已读取照片元数据",
    ja: "写真のメタデータを読み取りました",
    ko: "사진 메타데이터를 읽었습니다",
    es: "Se detectaron metadatos de la foto",
  },
  "photoForm.metadataNone": {
    en: "No photo metadata found; you can fill the fields manually.",
    zh: "未找到照片元数据；你可以手动填写。",
    ja: "写真のメタデータが見つかりません。手動で入力できます。",
    ko: "사진 메타데이터가 없습니다. 직접 입력할 수 있습니다.",
    es: "No se encontraron metadatos; puedes completar los campos manualmente.",
  },
  "photoForm.resolvingPlace": {
    en: "Resolving place…",
    zh: "正在查询地点…",
    ja: "場所を検索中…",
    ko: "장소를 찾는 중…",
    es: "Buscando el lugar…",
  },
  "photoForm.placeUnavailable": {
    en: "Place name unavailable; coordinates are still included.",
    zh: "暂时无法获取地点名称；坐标仍会保留。",
    ja: "場所の名前を取得できません。座標は保持されています。",
    ko: "장소 이름을 가져올 수 없습니다. 좌표는 계속 포함됩니다.",
    es: "No se pudo obtener el lugar; se conservarán las coordenadas.",
  },
  "photoForm.pickFirst": {
    en: "Pick an image first.",
    zh: "请先选择一张图片。",
    ja: "先に画像を選択してください。",
    ko: "먼저 이미지를 선택하세요.",
    es: "Primero elige una imagen.",
  },
  "photoForm.uploaded": {
    en: "Uploaded — it is live in the gallery now.",
    zh: "上传成功，照片已显示在相册中。",
    ja: "アップロードしました。ギャラリーに公開されています。",
    ko: "업로드했습니다. 갤러리에서 볼 수 있습니다.",
    es: "Subida completada; ya está en la galería.",
  },
  "photoForm.exifSummary": {
    en: "Camera details",
    zh: "相机信息",
    ja: "カメラ情報",
    ko: "카메라 정보",
    es: "Datos de cámara",
  },
  "lightbox.camera": {
    en: "Camera",
    zh: "相机",
    ja: "カメラ",
    ko: "카메라",
    es: "Cámara",
  },
  "lightbox.exposure": {
    en: "Exposure",
    zh: "曝光",
    ja: "露出",
    ko: "노출",
    es: "Exposición",
  },
  "lightbox.place": {
    en: "Place",
    zh: "地点",
    ja: "場所",
    ko: "장소",
    es: "Lugar",
  },
  "photoForm.titlePlaceholder": {
    en: "Morning fog, Hangzhou",
    zh: "晨雾，杭州",
    ja: "朝霧、杭州",
    ko: "아침 안개, 항저우",
    es: "Niebla matinal, Hangzhou",
  },
  "photoForm.collection": {
    en: "Collection",
    zh: "相册分组",
    ja: "コレクション",
    ko: "컬렉션",
    es: "Colección",
  },
  "photoForm.collectionPlaceholder": {
    en: "travel",
    zh: "旅行",
    ja: "旅行",
    ko: "여행",
    es: "viajes",
  },
  "photoForm.takenOn": {
    en: "Taken on",
    zh: "拍摄日期",
    ja: "撮影日",
    ko: "촬영일",
    es: "Fecha de la foto",
  },
  "photoForm.tags": {
    en: "Tags (comma separated)",
    zh: "标签（逗号分隔）",
    ja: "タグ（カンマ区切り）",
    ko: "태그 (쉼표 구분)",
    es: "Etiquetas (separadas por comas)",
  },
  "photoForm.sortOrder": {
    en: "Sort order",
    zh: "排序值",
    ja: "並び順",
    ko: "정렬 순서",
    es: "Orden",
  },
  "photoForm.description": {
    en: "Description",
    zh: "描述",
    ja: "説明",
    ko: "설명",
    es: "Descripción",
  },
  "photoForm.descriptionPlaceholder": {
    en: "Where it was, what it felt like.",
    zh: "在哪里，感觉如何。",
    ja: "どこで、どんな感じだったか。",
    ko: "어디서, 어떤 느낌이었는지.",
    es: "Dónde fue, qué se sintió.",
  },
  "photoForm.preview": {
    en: "Selected photo preview",
    zh: "所选照片预览",
    ja: "選択した写真のプレビュー",
    ko: "선택한 사진 미리보기",
    es: "Vista previa de la foto seleccionada",
  },
  "photoForm.submit": {
    en: "Upload",
    zh: "上传",
    ja: "アップロード",
    ko: "업로드",
    es: "Subir",
  },
  "photoForm.chooseFile": {
    en: "Choose a photo",
    zh: "选择照片",
    ja: "写真を選ぶ",
    ko: "사진 선택",
    es: "Elegir foto",
  },
  "lightbox.previous": {
    en: "Previous photo",
    zh: "上一张",
    ja: "前の写真",
    ko: "이전 사진",
    es: "Foto anterior",
  },
  "lightbox.next": {
    en: "Next photo",
    zh: "下一张",
    ja: "次の写真",
    ko: "다음 사진",
    es: "Foto siguiente",
  },
  "lightbox.download": {
    en: "Download original",
    zh: "下载原图",
    ja: "原画をダウンロード",
    ko: "원본 다운로드",
    es: "Descargar original",
  },
  "lightbox.page": {
    en: "View as page",
    zh: "以页面形式查看",
    ja: "ページで見る",
    ko: "페이지로 보기",
    es: "Ver como página",
  },
  "lightbox.close": {
    en: "Close",
    zh: "关闭",
    ja: "閉じる",
    ko: "닫기",
    es: "Cerrar",
  },
  "podcast.title": {
    en: "Podcast",
    zh: "播客",
    ja: "ポッドキャスト",
    ko: "팟캐스트",
    es: "Podcast",
  },
  "podcast.upload": {
    en: "Upload",
    zh: "上传一集",
    ja: "アップロード",
    ko: "업로드",
    es: "Subir",
  },
  "podcast.emptyTitle": {
    en: "Empty feed",
    zh: "还没有节目",
    ja: "エピソードなし",
    ko: "에피소드 없음",
    es: "Feed vacío",
  },
  "podcast.emptyBody": {
    en: "No episodes have been published yet.",
    zh: "还没有发布任何一期。",
    ja: "まだ公開されたエピソードはありません。",
    ko: "아직 공개된 에피소드가 없습니다.",
    es: "Todavía no se ha publicado ningún episodio.",
  },
  "podcast.audioUnsupported": {
    en: "Audio playback is not supported by this browser.",
    zh: "这个浏览器不支持音频播放。",
    ja: "このブラウザは音声再生に対応していません。",
    ko: "이 브라우저는 오디오 재생을 지원하지 않습니다.",
    es: "Este navegador no admite la reproducción de audio.",
  },
  "podcast.editEpisode": {
    en: "Edit episode",
    zh: "编辑节目",
    ja: "エピソードを編集",
    ko: "에피소드 편집",
    es: "Editar episodio",
  },
  "podcast.edit": {
    en: "Edit",
    zh: "编辑",
    ja: "編集",
    ko: "편집",
    es: "Editar",
  },
  "podcast.deleteEpisode": {
    en: "Delete episode",
    zh: "删除节目",
    ja: "エピソードを削除",
    ko: "에피소드 삭제",
    es: "Eliminar episodio",
  },
  "podcast.delete": {
    en: "Delete",
    zh: "删除",
    ja: "削除",
    ko: "삭제",
    es: "Eliminar",
  },
  "podcast.deleteConfirm": {
    en: "Delete this episode?",
    zh: "确定删除这一期？",
    ja: "このエピソードを削除しますか？",
    ko: "이 에피소드를 삭제할까요?",
    es: "¿Eliminar este episodio?",
  },
  "podcastForm.kicker": {
    en: "Podcast upload",
    zh: "播客上传",
    ja: "ポッドキャストのアップロード",
    ko: "팟캐스트 업로드",
    es: "Subida de podcast",
  },
  "podcastForm.unlockHint": {
    en: "Paste the upload key to unlock the episode form.",
    zh: "粘贴上传密钥以解锁节目表单。",
    ja: "アップロードキーを入力するとフォームが使えます。",
    ko: "업로드 키를 입력하면 에피소드 폼이 열립니다.",
    es: "Pega la clave de subida para desbloquear el formulario.",
  },
  "podcastForm.uploadKey": {
    en: "Upload key",
    zh: "上传密钥",
    ja: "アップロードキー",
    ko: "업로드 키",
    es: "Clave de subida",
  },
  "podcastForm.authenticate": {
    en: "Authenticate",
    zh: "验证",
    ja: "認証",
    ko: "인증",
    es: "Autenticar",
  },
  "podcastForm.submit": {
    en: "Upload episode",
    zh: "上传这一期",
    ja: "エピソードをアップロード",
    ko: "에피소드 업로드",
    es: "Subir episodio",
  },
  "podcastForm.tagline": {
    en: "Audio lands in R2, metadata lands in the episode feed.",
    zh: "音频进 R2，元数据进节目列表。",
    ja: "音声は R2、メタデータはエピソード一覧へ。",
    ko: "오디오는 R2, 메타데이터는 에피소드 피드로.",
    es: "El audio va a R2 y los metadatos al feed de episodios.",
  },
  "podcastForm.title": {
    en: "Title",
    zh: "标题",
    ja: "タイトル",
    ko: "제목",
    es: "Título",
  },
  "podcastForm.description": {
    en: "Description",
    zh: "描述",
    ja: "説明",
    ko: "설명",
    es: "Descripción",
  },
  "podcastForm.duration": {
    en: "Duration",
    zh: "时长（秒）",
    ja: "再生時間（秒）",
    ko: "길이(초)",
    es: "Duración (s)",
  },
  "podcastForm.author": {
    en: "Author",
    zh: "作者",
    ja: "著者",
    ko: "작성자",
    es: "Autor",
  },
  "podcastForm.episodeNumber": {
    en: "Episode number",
    zh: "集数",
    ja: "エピソード番号",
    ko: "에피소드 번호",
    es: "Número de episodio",
  },
  "podcastForm.season": {
    en: "Season",
    zh: "季",
    ja: "シーズン",
    ko: "시즌",
    es: "Temporada",
  },
  "podcastForm.keywords": {
    en: "Keywords",
    zh: "关键词",
    ja: "キーワード",
    ko: "키워드",
    es: "Palabras clave",
  },
  "podcastForm.keywordsHint": {
    en: "Separate keywords with commas",
    zh: "关键词用逗号分隔",
    ja: "キーワードはカンマ区切り",
    ko: "키워드는 쉼표로 구분",
    es: "Separa las palabras clave con comas",
  },
  "podcastForm.chooseAudio": {
    en: "Choose audio file",
    zh: "选择音频文件",
    ja: "音声ファイルを選ぶ",
    ko: "오디오 파일 선택",
    es: "Elegir archivo de audio",
  },
  "podcastForm.chooseCover": {
    en: "Choose cover image",
    zh: "选择封面图",
    ja: "カバー画像を選ぶ",
    ko: "커버 이미지 선택",
    es: "Elegir imagen de portada",
  },
  "podcastForm.videoKey": {
    en: "Video key in R2",
    zh: "R2 中的视频 key",
    ja: "R2 の動画キー",
    ko: "R2 동영상 키",
    es: "Clave del vídeo en R2",
  },
  "podcastForm.videoKeyHint": {
    en: "Optional. An object that already exists in the PODCASTS bucket.",
    zh: "可选。已在 PODCASTS 桶中存在的对象。",
    ja: "任意。PODCASTS バケットに既にあるオブジェクト。",
    ko: "선택 사항. PODCASTS 버킷에 이미 있는 객체.",
    es: "Opcional. Un objeto que ya existe en el bucket PODCASTS.",
  },
  "podcastForm.explicit": {
    en: "Explicit content",
    zh: "含成人内容",
    ja: "露骨なコンテンツ",
    ko: "성인 콘텐츠 포함",
    es: "Contenido explícito",
  },
  "podcastForm.replaceAudio": {
    en: "Replace audio",
    zh: "替换音频",
    ja: "音声を差し替え",
    ko: "오디오 교체",
    es: "Reemplazar audio",
  },
  "podcastForm.replaceCover": {
    en: "Replace cover",
    zh: "替换封面",
    ja: "カバーを差し替え",
    ko: "커버 교체",
    es: "Reemplazar portada",
  },
  "mermaid.failed": {
    en: "Mermaid diagram failed to render. Showing source code below.",
    zh: "Mermaid 图渲染失败，下面显示源码。",
    ja: "Mermaid 図の描画に失敗しました。以下にソースを表示します。",
    ko: "Mermaid 다이어그램 렌더링에 실패했습니다. 아래에 소스를 표시합니다.",
    es: "No se pudo renderizar el diagrama Mermaid. Se muestra el código abajo.",
  },
  "math.latexLabel": {
    en: "LaTeX Math",
    zh: "LaTeX 公式",
    ja: "LaTeX 数式",
    ko: "LaTeX 수식",
    es: "Matemáticas LaTeX",
  },
  "math.copyLatex": {
    en: "Copy LaTeX code",
    zh: "复制 LaTeX 代码",
    ja: "LaTeX コードをコピー",
    ko: "LaTeX 코드 복사",
    es: "Copiar código LaTeX",
  },
  "notFound.title": {
    en: "Page not found",
    zh: "页面不存在",
    ja: "ページが見つかりません",
    ko: "페이지를 찾을 수 없습니다",
    es: "Página no encontrada",
  },
  "notFound.body": {
    en: "The page you're looking for doesn't exist or has been moved.",
    zh: "你要找的页面不存在或已被移动。",
    ja: "お探しのページは存在しないか、移動しました。",
    ko: "찾으시는 페이지가 없거나 이동되었습니다.",
    es: "La página que buscas no existe o se ha movido.",
  },
  "notFound.backHome": {
    en: "Back home",
    zh: "回到首页",
    ja: "ホームへ戻る",
    ko: "홈으로",
    es: "Volver al inicio",
  },
  "friends.kicker": {
    en: "Friends",
    zh: "友链",
    ja: "リンク",
    ko: "링크",
    es: "Enlaces",
  },
  "friends.title": {
    en: "Links",
    zh: "友情链接",
    ja: "リンク集",
    ko: "링크 모음",
    es: "Enlaces",
  },
  "friends.subtitle": {
    en: "Independent blogs worth re-reading, plus the references I keep returning to while building.",
    zh: "收藏值得常读的独立博客，也整理工程实践中反复查阅的技术参考。",
    ja: "何度も読み返したい独立ブログと、開発中に何度も参照する資料。",
    ko: "자주 다시 읽는 독립 블로그와, 개발 중 계속 찾게 되는 참고 자료.",
    es: "Blogs independientes que merece la pena releer y las referencias a las que vuelvo al construir.",
  },
  "friends.introLead": {
    en: "This is where I keep the technical writers I read, and the retrieval references I check while building GraphRAG and RAG in TypeScript. Inclusion is based on original content, reachability and technical value — every site is read first, and peers are listed apart from official references. To exchange links, send the name, URL and one-line blurb to",
    zh: "这里汇集了我阅读的技术作者，以及用 TypeScript 实践 GraphRAG 与 RAG 时查阅的 retrieval 资料。收录以原创内容、站点可访问和技术参考价值为标准，逐一人工筛选，并将同好博客与官方资源分组展示。想交换友链，请将站点名称、链接和一句简介发送至",
    ja: "ここには、私が読んでいる技術ブログと、TypeScript で GraphRAG / RAG を実装する際に参照する検索資料を置いています。掲載基準はオリジナルコンテンツ、サイトの到達性、技術的価値で、すべて一度は読んでから載せ、同好のブログと公式リファレンスは分けています。リンク交換は、サイト名・URL・一行紹介を",
    ko: "제가 읽는 기술 블로거와 TypeScript로 GraphRAG·RAG를 만들며 참고하는 검색 자료를 모아 둡니다. 수록 기준은 원본 콘텐츠, 접속 가능성, 기술적 가치이며 모두 직접 읽고 나서 넣고, 동료 블로그와 공식 자료는 나눠서 보여줍니다. 링크 교환은 사이트 이름·URL·한 줄 소개를",
    es: "Aquí guardo a los autores técnicos que leo y las referencias de recuperación que consulto al construir GraphRAG y RAG en TypeScript. Incluyo por contenido original, accesibilidad y valor técnico: leo cada sitio antes de listarlo y separo los blogs de las referencias oficiales. Para intercambiar enlaces, envía el nombre, la URL y una línea de descripción a",
  },
  "friends.introTail": {
    en: "or leave a comment in the thread:",
    zh: "，或在收集帖留言：",
    ja: "、またはスレッドにコメントしてください：",
    ko: "으로 보내시거나 스레드에 댓글을 남겨 주세요:",
    es: "o deja un comentario en el hilo:",
},
  "friends.v2ex": {
    en: "V2EX thread",
    zh: "V2EX 收集帖",
    ja: "V2EX スレッド",
    ko: "V2EX 스레드",
    es: "Hilo de V2EX",
  },
  "friends.collected": {
    en: "{{count}} sites collected",
    zh: "已收录 {{count}} 个站点",
    ja: "{{count}} サイト収録",
    ko: "{{count}}개 사이트 수록",
    es: "{{count}} sitios recopilados",
  },
  "friends.sectionFriends": {
    en: "Peer blogs",
    zh: "同好博客",
    ja: "同好ブログ",
    ko: "동료 블로그",
    es: "Blogs amigos",
  },
  "friends.sectionFriendsDesc": {
    en: "Independent blogs and technical authors I keep, newest first, so I can keep following their original work.",
    zh: "这些是我收藏的独立博客与技术作者，按收藏时间由新到旧展示，方便继续追踪他们的原创文章与工程实践。",
    ja: "私が集めている独立ブログと技術者で、新しい順に並べています。継続して読みたいからです。",
    ko: "제가 모은 독립 블로그와 기술 작성자입니다. 최신순으로 두어 계속 따라 읽습니다.",
    es: "Blogs independientes y autores técnicos que guardo, del más reciente al más antiguo.",
  },
  "friends.sectionResources": {
    en: "References",
    zh: "参考资源",
    ja: "リファレンス",
    ko: "참고 자료",
    es: "Referencias",
  },
  "friends.sectionResourcesDesc": {
    en: "Authoritative references I use for GraphRAG / RAG / pgvector work. Collected as material, not as link exchanges.",
    zh: "这些是做 GraphRAG / RAG / Postgres 向量检索时常用的权威参考，作为资料收藏，并非友链交换。",
    ja: "GraphRAG / RAG / pgvector の作業で使う権威ある資料。リンク交換ではなく資料として収録。",
    ko: "GraphRAG / RAG / pgvector 작업에 쓰는 권위 있는 자료. 링크 교환이 아니라 자료로 수록.",
    es: "Referencias autorizadas para GraphRAG / RAG / pgvector. Recopiladas como material, no como intercambio.",
  },
  "friends.collectingKicker": {
    en: "Collecting links",
    zh: "收集中",
    ja: "収集中",
    ko: "수집 중",
    es: "Recopilando",
  },
  "friends.collectingTitle": {
    en: "Meeting new people",
    zh: "正在认识新的朋友",
    ja: "新しい人と出会っているところ",
    ko: "새로운 사람을 만나는 중",
    es: "Conociendo gente nueva",
  },
  "friends.collectingBody": {
    en: "Links are being collected in the V2EX thread and added as they are confirmed. Come and introduce your blog.",
    zh: "目前正在 V2EX 帖子里收集友链，确认后会陆续收录。欢迎来帖子里介绍你的博客。",
    ja: "V2EX スレッドでリンクを集めており、確認できたものから追加します。ぜひブログを紹介してください。",
    ko: "V2EX 스레드에서 링크를 모으고 있으며 확인되는 대로 추가합니다. 블로그를 소개해 주세요.",
    es: "Estoy recopilando enlaces en el hilo de V2EX y los añado según se confirman. Pasa a presentar tu blog.",
  },
  "friends.applyKicker": {
    en: "Exchange links",
    zh: "申请友链",
    ja: "リンク交換",
    ko: "링크 교환",
    es: "Intercambiar enlaces",
  },
  "friends.applyTitle": {
    en: "Apply for a link",
    zh: "申请友链",
    ja: "リンクを申し込む",
    ko: "링크 신청",
    es: "Solicitar un enlace",
  },
  "friends.applyReq1": {
    en: "An actively updated original blog",
    zh: "持续更新的原创博客",
    ja: "継続的に更新されているオリジナルブログ",
    ko: "꾸준히 업데이트되는 원본 블로그",
    es: "Un blog original con actualizaciones",
  },
  "friends.applyReq2": {
    en: "The site loads",
    zh: "站点可访问",
    ja: "サイトにアクセスできる",
    ko: "사이트가 열린다",
    es: "El sitio carga",
  },
  "friends.applyReq3": {
    en: "Reciprocal link: please also link to Ashes Space from your site",
    zh: "双向链接：也请在你的站点添加 Ashes Space 的链接",
    ja: "相互リンク：あなたのサイトにも Ashes Space へのリンクをお願いします",
    ko: "상호 링크: 사이트에 Ashes Space 링크도 걸어 주세요",
    es: "Enlace recíproco: añade también un enlace a Ashes Space",
  },
  "friends.applyFooter": {
    en: "Send the site name, URL and one-line blurb by email or in the thread.",
    zh: "请附上站点名称、链接与一句简介，发邮件或在收集帖留言。",
    ja: "サイト名・URL・一行紹介をメールかスレッドでお送りください。",
    ko: "사이트 이름, URL, 한 줄 소개를 메일이나 스레드로 보내 주세요.",
    es: "Envía el nombre, la URL y una línea de descripción por correo o en el hilo.",
  },
  "callout.fullVersion": {
    en: "Full version",
    zh: "完整版本",
    ja: "長いバージョン",
    ko: "긴 버전",
    es: "Versión completa",
  },
  "callout.aboutPage": {
    en: "About page",
    zh: "关于页",
    ja: "概要ページ",
    ko: "소개 페이지",
    es: "Página About",
  },
  "callout.keepGoing": {
    en: "Keep going",
    zh: "继续读",
    ja: "続きを読む",
    ko: "계속 읽기",
    es: "Seguir leyendo",
  },
  "callout.wantToKnow": {
    en: "Want to know what I am working on now?",
    zh: "想看我最近在做什么？",
    ja: "いま何をしているか知りたいですか？",
    ko: "요즘 뭘 하는지 궁금하신가요?",
    es: "¿Quieres saber en qué estoy trabajando ahora?",
  },
  "callout.about": {
    en: "About",
    zh: "关于",
    ja: "概要",
    ko: "소개",
    es: "Acerca de",
  },
  "callout.photography": {
    en: "Photography",
    zh: "摄影",
    ja: "写真",
    ko: "사진",
    es: "Fotografía",
  },
  "callout.allWriting": {
    en: "All writing",
    zh: "全部文章",
    ja: "すべての記事",
    ko: "전체 글",
    es: "Todos los textos",
  },
  "common.copyCode": {
    en: "Copy code",
    zh: "复制代码",
    ja: "コードをコピー",
    ko: "코드 복사",
    es: "Copiar código",
  },
  "common.copied": {
    en: "Copied!",
    zh: "已复制",
    ja: "コピーしました",
    ko: "복사됨",
    es: "¡Copiado!",
  },
  "common.viewCode": {
    en: "View code",
    zh: "查看代码",
    ja: "コードを見る",
    ko: "코드 보기",
    es: "Ver código",
  },
  "common.viewDiagram": {
    en: "View diagram",
    zh: "查看图表",
    ja: "図を見る",
    ko: "다이어그램 보기",
    es: "Ver diagrama",
  },
  "math.copyLatexShort": {
    en: "Copy LaTeX",
    zh: "复制 LaTeX",
    ja: "LaTeX をコピー",
    ko: "LaTeX 복사",
    es: "Copiar LaTeX",
  },
  "lightbox.untitled": {
    en: "Untitled",
    zh: "未命名",
    ja: "無題",
    ko: "제목 없음",
    es: "Sin título",
  },
  "callout.fullStoryLead": {
    en: "This is the full version of the story. If you want the short one first, read the ",
    zh: "这是完整版本。如果想先看短的，去看",
    ja: "これは完全版です。先に短い版を読みたい場合は",
    ko: "이 글은 전체 버전입니다. 먼저 짧은 버전을 보고 싶다면",
    es: "Esta es la versión completa. Si prefieres empezar por la corta, lee la ",
  },
  "about.contact": {
    en: "Contact",
    zh: "联系",
    ja: "連絡先",
    ko: "연락",
    es: "Contacto",
  },
  "about.sayHi": {
    en: "Say hi",
    zh: "打个招呼",
    ja: "声をかけてください",
    ko: "인사하기",
    es: "Saluda",
  },
  "photography.uploadCta": {
    en: "Upload a photo →",
    zh: "上传照片 →",
    ja: "写真をアップロード →",
    ko: "사진 업로드 →",
    es: "Subir una foto →",
  },
  "photography.loading": {
    en: "Loading frames…",
    zh: "正在载入照片…",
    ja: "写真を読み込み中…",
    ko: "사진 불러오는 중…",
    es: "Cargando encuadres…",
  },
  "photography.adminKicker": {
    en: "Photography · admin",
    zh: "摄影 · 管理",
    ja: "写真 · 管理",
    ko: "사진 · 관리",
    es: "Fotografía · admin",
  },
  "photography.backToGallery": {
    en: "← Back to the gallery",
    zh: "← 返回相册",
    ja: "← ギャラリーに戻る",
    ko: "← 갤러리로",
    es: "← Volver a la galería",
  },
  "photography.openTitle": {
    en: "Open {{title}}",
    zh: "打开 {{title}}",
    ja: "{{title}} を開く",
    ko: "{{title}} 열기",
    es: "Abrir {{title}}",
  },
  "photography.untitled": {
    en: "Untitled",
    zh: "未命名",
    ja: "無題",
    ko: "제목 없음",
    es: "Sin título",
  },
  "photoForm.uploadAll": {
    en: "Upload all ({{count}})",
    zh: "上传全部（{{count}}）",
    ja: "すべてアップロード（{{count}}）",
    ko: "모두 업로드 ({{count}})",
    es: "Subir todo ({{count}})",
  },
  "photoForm.uploadSummary": {
    en: "Batch finished: {{done}} uploaded, {{failed}} failed, {{skipped}} skipped.",
    zh: "批次完成：成功 {{done}} 张，失败 {{failed}} 张，跳过 {{skipped}} 张。",
    ja: "バッチ完了：{{done}} 枚成功、{{failed}} 枚失敗、{{skipped}} 枚スキップ。",
    ko: "배치 완료: {{done}}개 성공, {{failed}}개 실패, {{skipped}}개 건너뜀.",
    es: "Lote finalizado: {{done}} subidas, {{failed}} fallidas y {{skipped}} omitidas.",
  },
  "photoForm.tooMany": {
    en: "You can pick up to 30 images at a time. The remaining images were ignored.",
    zh: "每次最多选择 30 张图片，超出的图片已忽略。",
    ja: "一度に選択できる画像は最大30枚です。超過分は無視されました。",
    ko: "한 번에 최대 30장까지 선택할 수 있습니다. 초과한 이미지는 제외되었습니다.",
    es: "Puedes elegir hasta 30 imágenes a la vez. Se ignoraron las demás.",
  },
  "photoForm.remove": {
    en: "Remove image",
    zh: "移除此图片",
    ja: "画像を削除",
    ko: "이미지 제거",
    es: "Quitar imagen",
  },
  "photoForm.queueEmpty": {
    en: "Choose images to see their details here.",
    zh: "选择图片后，详细信息会显示在这里。",
    ja: "画像を選ぶと詳細がここに表示されます。",
    ko: "이미지를 선택하면 세부 정보가 여기에 표시됩니다.",
    es: "Elige imágenes para ver aquí sus detalles.",
  },
  "photoForm.statusReading": {
    en: "Reading metadata",
    zh: "正在读取元数据",
    ja: "メタデータを読み取り中",
    ko: "메타데이터 읽는 중",
    es: "Leyendo metadatos",
  },
  "photoForm.statusResolving": {
    en: "Resolving place",
    zh: "正在解析地点",
    ja: "場所を解決中",
    ko: "장소 확인 중",
    es: "Buscando el lugar",
  },
  "photoForm.statusReady": {
    en: "Ready",
    zh: "已就绪",
    ja: "準備完了",
    ko: "준비 완료",
    es: "Lista",
  },
  "photoForm.statusUploading": {
    en: "Uploading",
    zh: "上传中",
    ja: "アップロード中",
    ko: "업로드 중",
    es: "Subiendo",
  },
  "photoForm.statusRetrying": {
    en: "Retrying ({{attempt}}/{{max}})",
    zh: "正在重试（{{attempt}}/{{max}}）",
    ja: "再試行中（{{attempt}}/{{max}}）",
    ko: "재시도 중 ({{attempt}}/{{max}})",
    es: "Reintentando ({{attempt}}/{{max}})",
  },
  "photoForm.retryFailed": {
    en: "Retry failed ({{count}})",
    zh: "重试失败项（{{count}}）",
    ja: "失敗分を再試行（{{count}}）",
    ko: "실패 항목 재시도 ({{count}})",
    es: "Reintentar fallidas ({{count}})",
  },
  "photoForm.stop": {
    en: "Stop",
    zh: "停止",
    ja: "停止",
    ko: "중지",
    es: "Detener",
  },
  "photoForm.clearFinished": {
    en: "Clear finished",
    zh: "清除已完成项",
    ja: "完了分をクリア",
    ko: "완료 항목 지우기",
    es: "Quitar completadas",
  },
  "photoForm.stopped": {
    en: "Batch stopped. Unfinished images are ready to resume.",
    zh: "批次已停止，未完成的图片已准备好继续上传。",
    ja: "バッチを停止しました。未完了の画像は再開できます。",
    ko: "배치가 중지되었습니다. 완료되지 않은 이미지는 다시 시작할 수 있습니다.",
    es: "Lote detenido. Las imágenes pendientes están listas para reanudarse.",
  },
  "photoForm.queueRestored": {
    en: "Restored {{count}} image(s) from the saved upload queue. Press Upload to continue.",
    zh: "已从已保存的上传队列恢复 {{count}} 张图片。点击上传以继续。",
    ja: "保存済みのアップロードキューから {{count}} 枚を復元しました。続けるにはアップロードを押してください。",
    ko: "저장된 업로드 대기열에서 이미지 {{count}}개를 복원했습니다. 계속하려면 업로드를 누르세요.",
    es: "Se restauraron {{count}} imágenes de la cola guardada. Pulsa Subir para continuar.",
  },
  "photoForm.retry": {
    en: "Retry",
    zh: "重试",
    ja: "再試行",
    ko: "재시도",
    es: "Reintentar",
  },
  "photoForm.restoreFailed": {
    en: "The saved upload queue could not be restored.",
    zh: "无法恢复已保存的上传队列。",
    ja: "保存済みのアップロードキューを復元できませんでした。",
    ko: "저장된 업로드 대기열을 복원하지 못했습니다.",
    es: "No se pudo restaurar la cola de subida guardada.",
  },
  "photoForm.statusDone": {
    en: "Done",
    zh: "完成",
    ja: "完了",
    ko: "완료",
    es: "Completada",
  },
  "photoForm.statusError": {
    en: "Error",
    zh: "出错",
    ja: "エラー",
    ko: "오류",
    es: "Error",
  },
  "photoForm.untitledCollection": {
    en: "undated",
    zh: "未注明日期",
    ja: "日付なし",
    ko: "날짜 없음",
    es: "sin fecha",
  },
  "photoForm.chooseFiles": {
    en: "Choose images",
    zh: "选择图片",
    ja: "画像を選択",
    ko: "이미지 선택",
    es: "Elegir imágenes",
  },
  "photoForm.file": {
    en: "Image file *",
    zh: "图片文件 *",
    ja: "画像ファイル *",
    ko: "이미지 파일 *",
    es: "Archivo de imagen *",
  },
  "photoForm.uploading": {
    en: "Uploading…",
    zh: "上传中…",
    ja: "アップロード中…",
    ko: "업로드 중…",
    es: "Subiendo…",
  },
  "photoForm.uploadFailed": {
    en: "Upload failed",
    zh: "上传失败",
    ja: "アップロードに失敗しました",
    ko: "업로드 실패",
    es: "Error al subir",
  },
  "podcast.episodesTagline": {
    en: "Episodes from Ashes Space — audio, video and show notes, straight from the feed.",
    zh: "Ashes Space 的节目——音频、视频和节目笔记，直接来自订阅源。",
    ja: "Ashes Space のエピソード——音声、動画、ショーノートをフィードから。",
    ko: "Ashes Space의 에피소드 — 오디오, 영상, 쇼 노트를 피드에서 바로.",
    es: "Episodios de Ashes Space: audio, vídeo y notas, directo del feed.",
  },
  "podcast.loading": {
    en: "Loading episodes…",
    zh: "正在载入节目…",
    ja: "エピソードを読み込み中…",
    ko: "에피소드 불러오는 중…",
    es: "Cargando episodios…",
  },
  "podcast.adminKicker": {
    en: "Podcast · admin",
    zh: "播客 · 管理",
    ja: "ポッドキャスト · 管理",
    ko: "팟캐스트 · 관리",
    es: "Podcast · admin",
  },
  "podcast.backToEpisodes": {
    en: "← Back to episodes",
    zh: "← 返回节目列表",
    ja: "← エピソード一覧へ",
    ko: "← 에피소드 목록으로",
    es: "← Volver a los episodios",
  },
  "podcast.invalidKey": {
    en: "Invalid upload key",
    zh: "上传密钥无效",
    ja: "アップロードキーが無効です",
    ko: "업로드 키가 올바르지 않습니다",
    es: "Clave de subida no válida",
  },
  "podcast.uploadFailed": {
    en: "Upload failed",
    zh: "上传失败",
    ja: "アップロードに失敗しました",
    ko: "업로드 실패",
    es: "Error al subir",
  },
  "podcast.uploadedOk": {
    en: "Episode uploaded successfully.",
    zh: "节目上传成功。",
    ja: "エピソードをアップロードしました。",
    ko: "에피소드를 업로드했습니다.",
    es: "Episodio subido correctamente.",
  },
  "podcast.updateFailed": {
    en: "Could not update this episode",
    zh: "这一期更新失败",
    ja: "このエピソードを更新できませんでした",
    ko: "이 에피소드를 수정할 수 없습니다",
    es: "No se pudo actualizar este episodio",
  },
  "podcastForm.uploading": {
    en: "Uploading…",
    zh: "上传中…",
    ja: "アップロード中…",
    ko: "업로드 중…",
    es: "Subiendo…",
  },
  "podcastForm.saving": {
    en: "Saving…",
    zh: "保存中…",
    ja: "保存中…",
    ko: "저장 중…",
    es: "Guardando…",
  },
  "friends.collectingCta": {
    en: "Go to the V2EX thread →",
    zh: "前往 V2EX 收集帖 →",
    ja: "V2EX スレッドへ →",
    ko: "V2EX 스레드로 →",
    es: "Ir al hilo de V2EX →",
  },
  "friends.openInNewTab": {
    en: "Open {{name}} in a new tab",
    zh: "在新窗口打开 {{name}}",
    ja: "{{name}} を新しいタブで開く",
    ko: "새 탭에서 {{name}} 열기",
    es: "Abrir {{name}} en una pestaña nueva",
  },
  "admin.signedIn": {
    en: "Signed in with Cloudflare Access",
    zh: "已通过 Cloudflare Access 登录",
    ja: "Cloudflare Access でサインイン済み",
    ko: "Cloudflare Access로 로그인됨",
    es: "Sesión iniciada con Cloudflare Access",
  },
  "admin.accessRequired": {
    en: "Cloudflare Access protects this page. Reload to sign in.",
    zh: "这个页面由 Cloudflare Access 保护，刷新页面完成登录。",
    ja: "このページは Cloudflare Access で保護されています。再読み込みしてサインインしてください。",
    ko: "이 페이지는 Cloudflare Access로 보호됩니다. 새로고침해서 로그인하세요.",
    es: "Cloudflare Access protege esta página. Recarga para iniciar sesión.",
  },
  "admin.sessionExpired": {
    en: "Your Cloudflare Access session may have expired. Reload to check your sign-in.",
    zh: "你的 Cloudflare Access 会话可能已过期。请重新加载并检查登录状态。",
    ja: "Cloudflare Access のセッションが期限切れの可能性があります。再読み込みしてログイン状態を確認してください。",
    ko: "Cloudflare Access 세션이 만료되었을 수 있습니다. 새로고침하여 로그인 상태를 확인하세요.",
    es: "Es posible que tu sesión de Cloudflare Access haya caducado. Recarga para comprobar el inicio de sesión.",
  },
  "admin.reauthenticate": {
    en: "Sign in again",
    zh: "重新登录",
    ja: "再度ログイン",
    ko: "다시 로그인",
    es: "Iniciar sesión de nuevo",
  },
  'datasets.kicker': {
    en: 'Datasets',
    zh: '数据集',
    ja: 'データセット',
    ko: '데이터셋',
    es: 'Conjuntos de datos'
  },
  'datasets.title': {
    en: 'Data with judgments, not just documents',
    zh: '给的是判断，不只是文档',
    ja: '判断を含むデータ。文書だけではない',
    ko: '문서가 아니라 판단이 담긴 데이터',
    es: 'Datos con dictámenes, no solo documentos'
  },
  'datasets.lead': {
    en: 'Retrieval returns passages. These datasets return {{strong}}: a paper is retracted or it is not, a claim rests on retracted work or it does not, and every answer names the source row it came from. Start with the free DOI lookup below — it runs against the live snapshot and needs no key, no account and no model.',
    zh: '检索返回的是段落。这几个数据集返回的是{{strong}}：一篇论文被撤稿或者没有，一个结论建立在被撤稿的工作上或者没有，而且每个答案都指明它来自哪一条源数据。先从下面的免费 DOI 查询开始——它跑在实时快照上，不需要密钥、不需要账号，也不经过模型。',
    ja: '検索はパッセージを返します。これらのデータセットが返すのは{{strong}}です。論文が撤回されているか否か、ある主張が撤回された研究に依拠しているか否か、そしてすべての回答が、どのソース行に由来するかを明示します。まずは下の無料 DOI 検索から始めてください。ライブスナップショットに対して実行され、キーもアカウントもモデルも不要です。',
    ko: '검색은 단락을 돌려줍니다. 이 데이터셋은 {{strong}}을 돌려줍니다. 논문은 철회되었거나 아니고, 어떤 주장은 철회된 연구에 기대고 있거나 아니며, 모든 답은 자신이 어느 원본 행에서 나왔는지를 밝힙니다. 아래의 무료 DOI 조회부터 시작하십시오. 실시간 스냅샷을 대상으로 실행되며 키도, 계정도, 모델도 필요하지 않습니다.',
    es: 'La recuperación devuelve pasajes. Estos conjuntos de datos devuelven {{strong}}: un artículo está retractado o no lo está, una afirmación se apoya en trabajo retractado o no, y cada respuesta nombra la fila de origen de la que proviene. Se empieza por la consulta de DOI gratuita que aparece abajo: se ejecuta contra la instantánea en vivo y no necesita clave, ni cuenta, ni modelo.'
  },
  'datasets.ctaHowItWorks': {
    en: 'How the integrity graph works',
    zh: '完整性图谱是怎么构建的',
    ja: '整合性グラフの仕組み',
    ko: '무결성 그래프의 동작 방식',
    es: 'Cómo funciona el grafo de integridad'
  },
  'datasets.ctaBenchmark': {
    en: 'Measured benchmark',
    zh: '实测基准',
    ja: '実測ベンチマーク',
    ko: '실측 벤치마크',
    es: 'Evaluación medida'
  },
  'datasets.threeDatasets': {
    en: 'The three datasets',
    zh: '三个数据集',
    ja: '3 つのデータセット',
    ko: '세 가지 데이터셋',
    es: 'Los tres conjuntos de datos'
  },
  'datasets.card.graph.kind': {
    en: 'Graph dataset',
    zh: '图谱数据集',
    ja: 'グラフデータセット',
    ko: '그래프 데이터셋',
    es: 'Conjunto de datos en grafo'
  },
  'datasets.card.graph.title': {
    en: 'Citation + retraction integrity graph',
    zh: '引用 + 撤稿完整性图谱',
    ja: '引用 + 撤回の整合性グラフ',
    ko: '인용 + 철회 무결성 그래프',
    es: 'Grafo de integridad de citas y retractaciones'
  },
  'datasets.card.graph.body': {
    en: 'Three tables with stable IDs: papers, citations, and one row per (paper, source) retraction assertion with a source tier. Enough to rebuild the citation neighbourhood of a retracted paper offline, or to audit how a judgment was reached.',
    zh: '三张表，ID 稳定：论文、引用，以及每一条（论文, 来源）撤稿断言的单独一行，并标注来源层级。足够离线重建一篇撤稿论文的引用邻域，也足够审计一个判断是怎么得出的。',
    ja: '安定した ID を持つ 3 つのテーブル: 論文、引用、そして (論文, ソース) ごとの撤回アサーション 1 行（ソース階層付き）。撤回済み論文の引用近傍をオフラインで再構築するにも、ある判断がどう導かれたかを監査するにも足ります。',
    ko: '안정적인 ID를 가진 세 개의 테이블: 논문, 인용, 그리고 출처 등급을 포함한 (논문, 출처)별 철회 단정 한 행입니다. 철회된 논문의 인용 이웃을 오프라인에서 재구성하거나, 어떤 판단이 어떻게 도출되었는지 감사하기에 충분합니다.',
    es: 'Tres tablas con identificadores estables: artículos, citas y una fila por cada aserción de retractación (artículo, fuente) con su nivel de fuente. Basta para reconstruir sin conexión el vecindario de citas de un artículo retractado, o para auditar cómo se llegó a un dictamen.'
  },
  'datasets.card.graph.price': {
    en: 'Free to download',
    zh: '免费下载',
    ja: '無料ダウンロード',
    ko: '무료 다운로드',
    es: 'Descarga gratuita'
  },
  'datasets.card.graph.sources': {
    en: 'OpenAlex works and references, Crossref update-to relations, Retraction Watch (reason and nature free text excluded).',
    zh: 'OpenAlex 的 works 与 references、Crossref 的 update-to 关系、Retraction Watch（已排除原因与性质的自由文本）。',
    ja: 'OpenAlex のワークと参照、Crossref の update-to リレーション、Retraction Watch（理由と性質のフリーテキストは除外）。',
    ko: 'OpenAlex 작업과 참조, Crossref update-to 관계, Retraction Watch(사유와 성격의 자유 서술은 제외).',
    es: 'Trabajos y referencias de OpenAlex, relaciones update-to de Crossref, Retraction Watch (se excluye el texto libre de motivo y naturaleza).'
  },
  'datasets.card.graph.count0': {
    en: 'Papers (nodes)',
    zh: '论文（节点）',
    ja: '論文（ノード）',
    ko: '논문 (노드)',
    es: 'Artículos (nodos)'
  },
  'datasets.card.graph.count1': {
    en: 'Citation edges',
    zh: '引用边',
    ja: '引用エッジ',
    ko: '인용 간선',
    es: 'Aristas de cita'
  },
  'datasets.card.graph.count2': {
    en: 'Retraction status rows',
    zh: '撤稿状态行',
    ja: '撤回ステータス行',
    ko: '철회 상태 행',
    es: 'Filas de estado de retractación'
  },
  'datasets.card.graph.count3': {
    en: 'Snapshot',
    zh: '快照',
    ja: 'スナップショット',
    ko: '스냅샷',
    es: 'Instantánea'
  },
  'datasets.card.propagation.kind': {
    en: 'Judgment API',
    zh: '判断 API',
    ja: '判断 API',
    ko: '판단 API',
    es: 'API de dictamen'
  },
  'datasets.card.propagation.title': {
    en: 'Retraction propagation judgment',
    zh: '撤稿传播判断',
    ja: '撤回の伝播判断',
    ko: '철회 전파 판단',
    es: 'Dictamen de propagación de retractaciones'
  },
  'datasets.card.propagation.license': {
    en: 'CC0-1.0 data, hosted judgment',
    zh: '数据 CC0-1.0，判断托管',
    ja: 'CC0-1.0 のデータ、ホスト型の判断',
    ko: 'CC0-1.0 데이터, 호스팅 판단',
    es: 'Datos CC0-1.0, dictamen alojado'
  },
  'datasets.card.propagation.price': {
    en: '$0.02 per call',
    zh: '每次调用 $0.02',
    ja: '1 回 $0.02',
    ko: '호출당 $0.02',
    es: '$0.02 por llamada'
  },
  'datasets.card.propagation.body': {
    en: 'Give it a DOI, get back whether its claims rest on retracted work: verdict (CLEAR / CONTESTED / …), confidence with its basis, reference coverage, retracted roots with depth and per-source agreement, conflict flags, and evidence-path length. No model in the loop, so two calls with the same snapshot agree.',
    zh: '给它一个 DOI，返回它的论断是否建立在被撤稿的工作之上：结论（CLEAR / CONTESTED / …）、置信度及其依据、参考文献覆盖率、撤稿根节点的深度与各来源的一致情况、冲突标记，以及证据路径长度。流程里没有模型，所以同一快照下两次调用结果一致。',
    ja: 'DOI を渡すと、その主張が撤回された研究に依拠しているかどうかが返ります: 判定（CLEAR / CONTESTED / …）、根拠付きの信頼度、参照カバレッジ、深さとソース別の一致を伴う撤回の起点、競合フラグ、証拠パスの長さ。ループ内にモデルはないため、同じスナップショットに対する 2 回の呼び出しは一致します。',
    ko: 'DOI를 주면 그 주장이 철회된 연구에 기대고 있는지를 돌려받습니다. 판정(CLEAR / CONTESTED / …), 근거와 함께 제시되는 신뢰도, 참조 커버리지, 깊이와 출처별 합의를 포함한 철회 뿌리, 충돌 플래그, 증거 경로 길이입니다. 모델이 개입하지 않으므로 같은 스냅샷에 대한 두 호출은 서로 일치합니다.',
    es: 'Se le da un DOI y devuelve si sus afirmaciones se apoyan en trabajo retractado: veredicto (CLEAR / CONTESTED / …), confianza con su base, cobertura de referencias, raíces retractadas con profundidad y acuerdo por fuente, marcas de conflicto y longitud de la ruta de evidencia. No interviene ningún modelo, así que dos llamadas con la misma instantánea coinciden.'
  },
  'datasets.card.propagation.sources': {
    en: 'Same snapshot as the graph dataset.',
    zh: '与图谱数据集同一快照。',
    ja: 'グラフデータセットと同じスナップショット。',
    ko: '그래프 데이터셋과 동일한 스냅샷.',
    es: 'La misma instantánea que el conjunto de datos en grafo.'
  },
  'datasets.card.propagation.count0': {
    en: 'Output',
    zh: '输出',
    ja: '出力',
    ko: '출력',
    es: 'Salida'
  },
  'datasets.card.propagation.count1': {
    en: 'Per call',
    zh: '单次调用',
    ja: '1 回あたり',
    ko: '호출당',
    es: 'Por llamada'
  },
  'datasets.card.propagation.count2': {
    en: 'Evidence',
    zh: '证据',
    ja: '証拠',
    ko: '증거',
    es: 'Evidencia'
  },
  'datasets.card.web3.kind': {
    en: 'Synthetic corpus',
    zh: '合成语料',
    ja: '合成コーパス',
    ko: '합성 코퍼스',
    es: 'Corpus sintético'
  },
  'datasets.card.web3.title': {
    en: 'Synthetic smart-contract security relations',
    zh: '合成智能合约安全关系语料',
    ja: '合成スマートコントラクトのセキュリティ関係',
    ko: '합성 스마트 컨트랙트 보안 관계',
    es: 'Relaciones sintéticas de seguridad de contratos inteligentes'
  },
  'datasets.card.web3.price': {
    en: '$0.02 local / $0.10 global query',
    zh: '本地查询 $0.02 / 全局查询 $0.10',
    ja: 'ローカル $0.02 / グローバルクエリ $0.10',
    ko: '로컬 질의 $0.02 / 전역 질의 $0.10',
    es: '$0.02 consulta local / $0.10 consulta global'
  },
  'datasets.card.web3.hrefLabel': {
    en: 'Source',
    zh: '源码',
    ja: 'ソース',
    ko: '출처',
    es: 'Fuente'
  },
  'datasets.card.web3.body': {
    en: 'A worked example of what a curated “data with judgments” delivery looks like: source-grounded JSONL, a PostgreSQL load script, and a Markdown corpus you can index with the GraphRAG MCP server. Use it to evaluate the pipeline without touching your own documents.',
    zh: '一份可照着做的样例，展示“带判断的数据交付”长什么样：有源可溯的 JSONL、一个 PostgreSQL 导入脚本，以及可以用 GraphRAG MCP server 建立索引的 Markdown 语料。用它评估整条流水线，不必动你自己的文档。',
    ja: 'キュレーションされた「判断を含むデータ」の納品がどうなるかの実例です: ソースに紐づいた JSONL、PostgreSQL のロードスクリプト、GraphRAG MCP サーバーでインデックスできる Markdown コーパス。自分の文書に触れずにパイプラインを評価できます。',
    ko: '선별된 “판단이 담긴 데이터” 제공이 어떤 모습인지 보여 주는 실제 예시입니다. 출처에 근거한 JSONL, PostgreSQL 적재 스크립트, 그리고 GraphRAG MCP 서버로 인덱싱할 수 있는 Markdown 코퍼스입니다. 자체 문서를 건드리지 않고 파이프라인을 평가하는 데 사용하십시오.',
    es: 'Un ejemplo resuelto de cómo se ve una entrega curada de «datos con dictámenes»: JSONL anclado en fuentes, un script de carga para PostgreSQL y un corpus en Markdown que se puede indexar con el servidor MCP de GraphRAG. Sirve para evaluar la canalización sin tocar los documentos propios.'
  },
  'datasets.card.web3.sources': {
    en: 'Original fictional audit corpus shipped with graphrag-ts. Every contract, dependency and incident is invented.',
    zh: '随 graphrag-ts 发布的原创虚构审计语料。每一个合约、依赖和事故都是编造的。',
    ja: 'graphrag-ts に同梱されたオリジナルの架空監査コーパス。契約、依存関係、インシデントはすべて架空です。',
    ko: 'graphrag-ts와 함께 배포되는 원본 가상 감사 코퍼스입니다. 모든 컨트랙트, 의존성, 사고는 지어낸 것입니다.',
    es: 'Corpus de auditoría ficticio original distribuido con graphrag-ts. Cada contrato, dependencia e incidente es inventado.'
  },
  'datasets.card.web3.count0': {
    en: 'Entities',
    zh: '实体',
    ja: 'エンティティ',
    ko: '엔터티',
    es: 'Entidades'
  },
  'datasets.card.web3.count1': {
    en: 'Relations',
    zh: '关系',
    ja: '関係',
    ko: '관계',
    es: 'Relaciones'
  },
  'datasets.card.web3.count2': {
    en: 'Source excerpts',
    zh: '源文摘录',
    ja: 'ソース抜粋',
    ko: '출처 발췌',
    es: 'Extractos de origen'
  },
  'datasets.card.web3.count3': {
    en: 'Evaluation questions',
    zh: '评测问题',
    ja: '評価質問',
    ko: '평가 질문',
    es: 'Preguntas de evaluación'
  },
  'datasets.sourcesLabel': {
    en: 'Sources:',
    zh: '来源：',
    ja: 'ソース:',
    ko: '출처:',
    es: 'Fuentes:'
  },
  'datasets.conclusionsTitle': {
    en: 'What you can and cannot conclude',
    zh: '能得出什么结论，不能得出什么结论',
    ja: '結論として言えること、言えないこと',
    ko: '무엇을 결론지을 수 있고 무엇은 아닌지',
    es: 'Qué se puede y qué no se puede concluir'
  },
  'datasets.conclusions1': {
    en: '{{strong}} When a DOI is outside the snapshot, the response says so ({{code}}) instead of guessing “clean”.',
    zh: '{{strong}} 当一个 DOI 不在快照内，响应会直接说明（{{code}}），而不是猜一个“干净”。',
    ja: '{{strong}} DOI がスナップショット外にある場合、レスポンスは「クリーン」と推測せず、その旨を返します（{{code}}）。',
    ko: '{{strong}} DOI가 스냅샷 밖에 있으면 응답은 “깨끗함”을 추측하지 않고 그 사실을 밝힙니다({{code}}).',
    es: '{{strong}} Cuando un DOI queda fuera de la instantánea, la respuesta lo dice ({{code}}) en lugar de suponer «limpio».'
  },
  'datasets.conclusions2': {
    en: '{{strong}} A paper can be in the graph with no source asserting either way. The dataset page shows both cases side by side.',
    zh: '{{strong}} 一篇论文可以在图谱里，但没有任何来源表态。数据集页面把这两种情况并排展示。',
    ja: '{{strong}} グラフ内にありながら、どちらの主張もするソースがない論文もあり得ます。データセットページでは両方のケースを並べて示しています。',
    ko: '{{strong}} 어떤 논문은 어느 쪽으로도 단정하는 출처 없이 그래프에 존재할 수 있습니다. 데이터셋 페이지는 두 경우를 나란히 보여 줍니다.',
    es: '{{strong}} Un artículo puede estar en el grafo sin que ninguna fuente afirme nada en un sentido ni en otro. La página del conjunto de datos muestra ambos casos en paralelo.'
  },
  'datasets.conclusions3': {
    en: '{{strong}} It is 12 retracted seeds with up to 60 citing works each plus their reference lists — not the whole scholarly record.',
    zh: '{{strong}} 它是 12 篇撤稿种子论文、每篇最多 60 篇引用工作及其参考文献列表，不是整个学术记录。',
    ja: '{{strong}} 撤回済みのシード 12 件と、それぞれ最大 60 件の引用元、およびその参照リストです。学術記録全体ではありません。',
    ko: '{{strong}} 철회된 시드 12편과 각각 최대 60편의 인용 작업, 그리고 그 참조 목록입니다. 전체 학술 기록이 아닙니다.',
    es: '{{strong}} Son 12 semillas retractadas con hasta 60 trabajos citantes cada una, más sus listas de referencias; no es todo el registro académico.'
  },
  'datasets.conclusions4': {
    en: '{{strong}} Tier A means a registry that records retractions directly (Crossref {{code}}, Retraction Watch); tier C means an index-derived flag (OpenAlex). A judgment that mixes them shows the mixture.',
    zh: '{{strong}} A 级指直接记录撤稿的注册库（Crossref {{code}}、Retraction Watch）；C 级指由索引推导出的标记（OpenAlex）。混合了不同层级的判断会把这种混合显示出来。',
    ja: '{{strong}} 階層 A は撤回を直接記録するレジストリ（Crossref {{code}}、Retraction Watch）を意味し、階層 C はインデックス由来のフラグ（OpenAlex）を意味します。両者が混在する判断では、その混在がそのまま示されます。',
    ko: '{{strong}} 등급 A는 철회를 직접 기록하는 레지스트리(Crossref {{code}}, Retraction Watch)를 뜻하고, 등급 C는 색인에서 파생된 플래그(OpenAlex)를 뜻합니다. 둘을 섞은 판단은 그 혼합을 그대로 보여 줍니다.',
    es: '{{strong}} El nivel A significa un registro que anota retractaciones directamente (Crossref {{code}}, Retraction Watch); el nivel C significa una marca derivada de un índice (OpenAlex). Un dictamen que los mezcla muestra la mezcla.'
  },
  'datasets.conclusions5': {
    en: '{{strong}} Retraction Watch reason and nature free text are deliberately excluded, so a judgment never turns a retraction into an accusation of misconduct by paraphrase.',
    zh: '{{strong}} Retraction Watch 的原因与性质自由文本被刻意排除，所以判断不会把一次撤稿转述成学术不端的指控。',
    ja: '{{strong}} Retraction Watch の理由と性質のフリーテキストは意図的に除外しているため、判断が言い換えによって撤回を不正行為の指摘に変えることはありません。',
    ko: '{{strong}} Retraction Watch의 사유와 성격 자유 서술은 의도적으로 제외되므로, 어떤 판단도 철회를 바꿔 말해 연구 부정행위 고발로 만들지 않습니다.',
    es: '{{strong}} El texto libre de motivo y naturaleza de Retraction Watch se excluye a propósito, de modo que un dictamen nunca convierte una retractación en una acusación de mala conducta por paráfrasis.'
  },
  'datasets.endpointsTitle': {
    en: 'Endpoints',
    zh: '接口',
    ja: 'エンドポイント',
    ko: '엔드포인트',
    es: 'Puntos de acceso'
  },
  'datasets.endpointFree': {
    en: 'Free, no auth, CORS open. Paper-level status from every covering source.',
    zh: '免费，无需鉴权，CORS 开放。返回每个覆盖该论文的来源给出的论文级状态。',
    ja: '無料、認証なし、CORS 開放。対象論文をカバーするすべてのソースからの論文レベルのステータス。',
    ko: '무료, 인증 없음, CORS 개방. 논문을 다루는 모든 출처의 논문 수준 상태.',
    es: 'Gratuito, sin autenticación, CORS abierto. Estado a nivel de artículo según todas las fuentes que lo cubren.'
  },
  'datasets.endpointCatalogue': {
    en: 'Machine-readable catalogue: IDs, licenses, pricing, tags.',
    zh: '机器可读的目录：ID、许可证、定价、标签。',
    ja: '機械可読なカタログ: ID、ライセンス、価格、タグ。',
    ko: '기계 판독 가능한 카탈로그: ID, 라이선스, 가격, 태그.',
    es: 'Catálogo legible por máquina: identificadores, licencias, precios, etiquetas.'
  },
  'datasets.endpointPaid': {
    en: 'Paid per call through the x402 flow ($0.02 propagation, $0.10 evidence audit); the challenge arrives in the {{code}} header.',
    zh: '按调用付费，走 x402 流程（传播 $0.02，证据审计 $0.10）；付款挑战通过 {{code}} 响应头下发。',
    ja: 'x402 フローによる呼び出しごとの課金（伝播 $0.02、証拠監査 $0.10）。チャレンジは {{code}} ヘッダーで届きます。',
    ko: 'x402 흐름으로 호출당 과금(전파 $0.02, 증거 감사 $0.10)되며, 챌린지는 {{code}} 헤더로 도착합니다.',
    es: 'Se paga por llamada mediante el flujo x402 ($0.02 propagación, $0.10 auditoría de evidencia); el desafío llega en la cabecera {{code}}.'
  },
  'datasets.endpointMcp': {
    en: 'MCP server (Streamable HTTP). {{strong}} {{code1}} answers with no credential, so a client can call it the moment it connects. {{code2}} ($0.02) and {{code3}} ($0.10) are paid calls and return {{code4}} to an anonymous session; indexing and the corpus-query tools need a credential.',
    zh: 'MCP server（Streamable HTTP）。{{strong}} {{code1}} 无需凭证即可回答，客户端一连上就能调用。{{code2}}（$0.02）和 {{code3}}（$0.10）是付费调用，匿名会话会收到 {{code4}}；建立索引和语料查询类工具需要凭证。',
    ja: 'MCP サーバー（Streamable HTTP）。{{strong}} {{code1}} は認証情報なしで応答するため、クライアントは接続直後に呼び出せます。{{code2}}（$0.02）と {{code3}}（$0.10）は有料呼び出しで、匿名セッションに {{code4}} を返します。インデックス作成とコーパスクエリのツールには認証情報が必要です。',
    ko: 'MCP 서버(Streamable HTTP). {{strong}} {{code1}}은 자격 증명 없이 응답하므로 클라이언트는 연결하는 즉시 호출할 수 있습니다. {{code2}}($0.02)와 {{code3}}($0.10)는 유료 호출이며 익명 세션에 {{code4}}를 반환합니다. 인덱싱과 코퍼스 질의 도구에는 자격 증명이 필요합니다.',
    es: 'Servidor MCP (Streamable HTTP). {{strong}} {{code1}} responde sin credencial, así que un cliente puede llamarlo en el momento en que se conecta. {{code2}} ($0.02) y {{code3}} ($0.10) son llamadas de pago y devuelven {{code4}} a una sesión anónima; la indexación y las herramientas de consulta del corpus necesitan una credencial.'
  },
  'datasets.mcpTitle': {
    en: 'Connect an MCP client',
    zh: '接入 MCP 客户端',
    ja: 'MCP クライアントの接続',
    ko: 'MCP 클라이언트 연결',
    es: 'Conectar un cliente MCP'
  },
  'datasets.mcpLead': {
    en: 'Points at the same snapshot the pages above use. No key for the free status tool; the server answers {{code1}} and {{code2}} anonymously so a client can discover it first and decide about the paid calls later.',
    zh: '指向与上面几页相同的快照。免费的查询工具不需要密钥；server 会匿名响应 {{code1}} 和 {{code2}}，客户端可以先发现能力，之后再决定是否用付费调用。',
    ja: '上記のページが使うのと同じスナップショットを指します。無料ステータスツールにキーは不要で、サーバーは {{code1}} と {{code2}} に匿名で応答するため、クライアントはまず検出し、有料呼び出しについては後で判断できます。',
    ko: '위 페이지들과 동일한 스냅샷을 가리킵니다. 무료 상태 도구에는 키가 필요 없습니다. 서버가 {{code1}}과 {{code2}}에 익명으로 응답하므로, 클라이언트가 먼저 서버를 탐색한 뒤 유료 호출 여부를 나중에 결정할 수 있습니다.',
    es: 'Apunta a la misma instantánea que usan las páginas anteriores. No se necesita clave para la herramienta de estado gratuita; el servidor responde {{code1}} y {{code2}} de forma anónima para que un cliente pueda descubrirlo primero y decidir después sobre las llamadas de pago.'
  },
  'datasets.mcpStep1': {
    en: 'Call {{code1}} with {{code2}} — the same shape the browser lookup returns. Free, no key.',
    zh: '调用 {{code1}}，传入 {{code2}}——返回结构与浏览器查询一致。免费，无需密钥。',
    ja: '{{code1}} を {{code2}} で呼び出します。ブラウザの検索が返すのと同じ形です。無料、キー不要。',
    ko: '{{code2}}로 {{code1}}을 호출합니다. 브라우저 조회가 반환하는 것과 같은 형태이며, 무료이고 키가 필요 없습니다.',
    es: 'Llame a {{code1}} con {{code2}}; la misma forma que devuelve la consulta del navegador. Gratis, sin clave.'
  },
  'datasets.mcpStep2': {
    en: '{{code1}} and {{code2}} answer {{code3}} without a credential. Pay per call through {{code4}} (x402 on Base) or bring a credential.',
    zh: '{{code1}} 和 {{code2}} 在没有凭证时返回 {{code3}}。通过 {{code4}}（Base 上的 x402）按调用付费，或者自带凭证。',
    ja: '{{code1}} と {{code2}} は認証情報なしで {{code3}} に応答します。{{code4}}（Base 上の x402）で呼び出しごとに支払うか、認証情報を持ち込んでください。',
    ko: '{{code1}}과 {{code2}}는 자격 증명 없이 {{code3}}로 응답합니다. {{code4}}(Base의 x402)를 통해 호출당 결제하거나 자격 증명을 제시하십시오.',
    es: '{{code1}} y {{code2}} responden {{code3}} sin credencial. Pague por llamada mediante {{code4}} (x402 en Base) o use una credencial.'
  },
  'datasets.mcpStep3': {
    en: 'Sessions expire; re-{{code1}} rather than reusing a stale {{code2}}.',
    zh: '会话会过期；重新 {{code1}}，不要复用已经失效的 {{code2}}。',
    ja: 'セッションは失効します。古い {{code2}} を使い回さず、{{code1}} をやり直してください。',
    ko: '세션은 만료됩니다. 오래된 {{code2}}를 재사용하지 말고 {{code1}}을 다시 수행하십시오.',
    es: 'Las sesiones caducan; vuelva a hacer {{code1}} en lugar de reutilizar un {{code2}} obsoleto.'
  },
  'datasets.mcpStep4': {
    en: 'The wire format for the paid calls, including the 402 challenge and the EIP-3009 authorization, is documented in {{link}}.',
    zh: '付费调用的传输格式，包括 402 挑战和 EIP-3009 授权，写在 {{link}} 里。',
    ja: '有料呼び出しのワイヤーフォーマット（402 チャレンジと EIP-3009 認可を含む）は {{link}} に記載されています。',
    ko: '402 챌린지와 EIP-3009 인가를 포함한 유료 호출의 와이어 포맷은 {{link}}에 문서화되어 있습니다.',
    es: 'El formato de transmisión de las llamadas de pago, incluido el desafío 402 y la autorización EIP-3009, se documenta en {{link}}.'
  },
  'benchmark.back': {
    en: '← Datasets',
    zh: '← 数据集',
    ja: '← データセット',
    ko: '← 데이터셋',
    es: '← Conjuntos de datos'
  },
  'benchmark.kicker': {
    en: 'Measured {{date}}',
    zh: '实测于 {{date}}',
    ja: '{{date}} 実測',
    ko: '{{date}} 실측',
    es: 'Medido el {{date}}'
  },
  'benchmark.title': {
    en: 'Twenty DOIs, three sources, one API call each',
    zh: '20 个 DOI，三个来源，各一次 API 调用',
    ja: 'DOI 20 件、3 つのソース、各 1 回の API 呼び出し',
    ko: 'DOI 20개, 출처 3곳, 각 1회의 API 호출',
    es: 'Veinte DOI, tres fuentes, una llamada a la API cada uno'
  },
  'benchmark.lead': {
    en: 'A benchmark of the free retraction-status lookup, not of a language model. Every figure below comes from sequential HTTP GETs against the live endpoint, recorded on {{date}}. The point is not a big number — it is that the answer is cheap, deterministic, and states where it has no evidence.',
    zh: '这是对免费撤稿状态查询的基准测试，不是对语言模型的。下面每一个数字都来自对线上接口的串行 HTTP GET，记录于 {{date}}。重点不是一个漂亮的数字，而是答案便宜、确定，并且在没有证据时明确说明没有证据。',
    ja: '無料の撤回ステータス検索のベンチマークであり、言語モデルのベンチマークではありません。以下の数値はすべて、{{date}} に記録した、ライブエンドポイントへの逐次 HTTP GET によるものです。狙いは大きな数字ではなく、回答が安価で決定的であり、証拠がない箇所を明示することにあります。',
    ko: '언어 모델이 아니라 무료 철회 상태 조회에 대한 벤치마크입니다. 아래의 모든 수치는 {{date}}에 기록된, 실시간 엔드포인트에 대한 순차적 HTTP GET에서 나왔습니다. 요점은 큰 숫자가 아니라, 답이 저렴하고 결정적이며 증거가 없는 곳을 명시한다는 점입니다.',
    es: 'Una evaluación de la consulta gratuita de estado de retractación, no de un modelo de lenguaje. Cada cifra de abajo proviene de solicitudes HTTP GET secuenciales contra el punto de acceso en vivo, registradas el {{date}}. El punto no es una cifra grande, sino que la respuesta es barata, determinista e indica dónde no tiene evidencia.'
  },
  'benchmark.statHttp': {
    en: 'HTTP 200',
    zh: 'HTTP 200',
    ja: 'HTTP 200',
    ko: 'HTTP 200',
    es: 'HTTP 200'
  },
  'benchmark.statHttpNote': {
    en: 'no auth, no key, no retries',
    zh: '无需鉴权、无需密钥、无重试',
    ja: '認証なし、キーなし、リトライなし',
    ko: '인증 없음, 키 없음, 재시도 없음',
    es: 'sin autenticación, sin clave, sin reintentos'
  },
  'benchmark.statMedian': {
    en: 'Median latency',
    zh: '延迟中位数',
    ja: '中央値レイテンシ',
    ko: '중앙값 지연',
    es: 'Latencia mediana'
  },
  'benchmark.statMedianNote': {
    en: 'mean {{mean}} ms, max {{max}} ms',
    zh: '平均 {{mean}} ms，最大 {{max}} ms',
    ja: '平均 {{mean}} ms、最大 {{max}} ms',
    ko: '평균 {{mean}} ms, 최대 {{max}} ms',
    es: 'media {{mean}} ms, máxima {{max}} ms'
  },
  'benchmark.statRetracted': {
    en: 'Retracted',
    zh: '已撤稿',
    ja: '撤回済み',
    ko: '철회됨',
    es: 'Retractados'
  },
  'benchmark.statRetractedNote': {
    en: 'three sources agreeing on each',
    zh: '每一篇都有三个来源一致',
    ja: '各件で 3 ソースが一致',
    ko: '각 건에 대해 세 출처가 일치',
    es: 'tres fuentes coinciden en cada uno'
  },
  'benchmark.statAbstentions': {
    en: 'Abstentions',
    zh: '弃权',
    ja: '回答保留',
    ko: '판단 보류',
    es: 'Abstenciones'
  },
  'benchmark.statAbstentionNote': {
    en: 'stated reason, not a guess',
    zh: '给了理由，不是猜测',
    ja: '理由を明示、推測ではない',
    ko: '추측이 아닌 명시된 사유',
    es: 'motivo declarado, no una suposición'
  },
  'benchmark.methodTitle': {
    en: 'Method',
    zh: '方法',
    ja: '手法',
    ko: '방법',
    es: 'Método'
  },
  'benchmark.method1': {
    en: '{{strong}} 16 retracted DOIs were drawn from the published {{code}} table (every DOI with a recorded retraction date), so the retracted set is not hand-picked from famous cases.',
    zh: '{{strong}} 16 个撤稿 DOI 取自已发布的 {{code}} 表（所有带撤稿日期的 DOI），所以撤稿样本不是从知名案例里手工挑的。',
    ja: '{{strong}} 撤回済み DOI 16 件は公開されている {{code}} テーブル（撤回日が記録された全 DOI）から抽出したため、撤回済みセットは有名事例からの手選びではありません。',
    ko: '{{strong}} 철회된 DOI 16개는 공개된 {{code}} 테이블에서 추출했습니다(철회 날짜가 기록된 모든 DOI). 따라서 철회 집합은 유명 사례에서 임의로 고른 것이 아닙니다.',
    es: '{{strong}} Se tomaron 16 DOI retractados de la tabla publicada {{code}} (todos los DOI con fecha de retractación registrada), de modo que el conjunto de retractados no se eligió a mano entre casos famosos.'
  },
  'benchmark.method2': {
    en: '{{strong}} Three DOIs expected {{em}} to be retracted, plus one deliberately invalid DOI to exercise the abstention path.',
    zh: '{{strong}} 三个预计{{em}}被撤稿的 DOI，再加一个故意无效的 DOI，用来走一遍弃权路径。',
    ja: '{{strong}} 撤回済みと{{em}}される 3 件の DOI に加え、回答保留の経路を試すための意図的に無効な DOI 1 件。',
    ko: '{{strong}} 철회될 것으로 {{em}} 예상되는 DOI 3개와, 판단 보류 경로를 시험하기 위해 의도적으로 잘못 만든 DOI 1개.',
    es: '{{strong}} Tres DOI {{em}} retractados según lo previsto, más un DOI deliberadamente inválido para ejercitar la ruta de abstención.'
  },
  'benchmark.method3': {
    en: '{{strong}}, sequential, 350 ms apart, with a browser-style User-Agent, no retries counted as separate samples. Latency is wall-clock from request to parsed body, measured from a container reaching Cloudflare over the public internet.',
    zh: '{{strong}}，串行，间隔 350 ms，使用浏览器风格的 User-Agent，重试不计入独立样本。延迟是从发出请求到解析完响应体的墙钟时间，从一个经公网访问 Cloudflare 的容器上测得。',
    ja: '{{strong}}、逐次、350 ms 間隔、ブラウザ相当の User-Agent を使用し、リトライは別サンプルとして数えていません。レイテンシはリクエストから本文のパースまでの実時間で、コンテナから公衆インターネット経由で Cloudflare に到達して計測しています。',
    ko: '{{strong}}, 순차 실행, 350 ms 간격, 브라우저 형태의 User-Agent 사용, 재시도는 별도 샘플로 계산하지 않음. 지연은 요청부터 파싱된 본문까지의 실제 경과 시간이며, 공용 인터넷을 통해 Cloudflare에 도달하는 컨테이너에서 측정했습니다.',
    es: '{{strong}}, secuenciales, con 350 ms de separación y un User-Agent de navegador, sin contar los reintentos como muestras separadas. La latencia es de reloj de pared, desde la solicitud hasta el cuerpo ya analizado, medida desde un contenedor que llega a Cloudflare por internet pública.'
  },
  'benchmark.method4': {
    en: '{{strong}} is mechanical: an abstention reason wins; otherwise any source asserting retraction gives “retracted”, all sources denying it give “not retracted”, and an empty status array gives “no rows”.',
    zh: '{{strong}} 是机械规则：有弃权原因就以弃权为准；否则任一来源断言撤稿即判“已撤稿”，所有来源都否认则判“未撤稿”，状态数组为空则判“无记录”。',
    ja: '{{strong}} は機械的です。回答保留の理由があればそれが優先され、なければ撤回を主張するソースが 1 つでもあれば「撤回済み」、全ソースが否定すれば「未撤回」、ステータス配列が空なら「行なし」となります。',
    ko: '{{strong}}은 기계적입니다. 판단 보류 사유가 있으면 그것이 우선합니다. 그렇지 않으면 철회를 단정하는 출처가 하나라도 있을 때 “철회됨”, 모든 출처가 부인할 때 “철회되지 않음”, 상태 배열이 비어 있을 때 “행 없음”입니다.',
    es: '{{strong}} es mecánica: prevalece un motivo de abstención; en caso contrario, cualquier fuente que afirme la retractación da «retractado», todas las fuentes que la niegan dan «no retractado», y un arreglo de estado vacío da «sin filas».'
  },
  'benchmark.samplesTitle': {
    en: 'Every sample',
    zh: '全部样本',
    ja: '全サンプル',
    ko: '모든 샘플',
    es: 'Todas las muestras'
  },
  'benchmark.colYear': {
    en: 'Year',
    zh: '年份',
    ja: '年',
    ko: '연도',
    es: 'Año'
  },
  'benchmark.colVerdict': {
    en: 'Verdict',
    zh: '结论',
    ja: '判定',
    ko: '판정',
    es: 'Veredicto'
  },
  'benchmark.colTiers': {
    en: 'Tiers',
    zh: '层级',
    ja: '階層',
    ko: '등급',
    es: 'Niveles'
  },
  'benchmark.colDate': {
    en: 'Retraction date',
    zh: '撤稿日期',
    ja: '撤回日',
    ko: '철회 날짜',
    es: 'Fecha de retractación'
  },
  'benchmark.colTitle': {
    en: 'Title',
    zh: '标题',
    ja: 'タイトル',
    ko: '제목',
    es: 'Título'
  },
  'benchmark.verdictRetracted': {
    en: 'retracted',
    zh: '已撤稿',
    ja: '撤回済み',
    ko: '철회됨',
    es: 'retractado'
  },
  'benchmark.verdictNotRetracted': {
    en: 'not retracted',
    zh: '未撤稿',
    ja: '未撤回',
    ko: '철회되지 않음',
    es: 'no retractado'
  },
  'benchmark.verdictNoRows': {
    en: 'no rows',
    zh: '无记录',
    ja: '行なし',
    ko: '행 없음',
    es: 'sin filas'
  },
  'benchmark.verdictAbstained': {
    en: 'abstained',
    zh: '弃权',
    ja: '回答保留',
    ko: '판단 보류',
    es: 'se abstuvo'
  },
  'benchmark.limitsTitle': {
    en: 'Limits, stated plainly',
    zh: '局限，直说',
    ja: '制約を率直に',
    ko: '한계, 명확히 밝힘',
    es: 'Límites, dichos sin rodeos'
  },
  'benchmark.limit1': {
    en: '{{strong}} This measures one endpoint from one machine at one hour. It does not estimate throughput under load and it is not a comparison with other services.',
    zh: '{{strong}} 这测的是一个接口、一台机器、一个小时。它不估算负载下的吞吐，也不是与其他服务的对比。',
    ja: '{{strong}} これは 1 台のマシンから 1 時間にあるエンドポイントを測ったものです。負荷時のスループットを推定するものではなく、他サービスとの比較でもありません。',
    ko: '{{strong}} 한 시간대에 한 머신에서 한 엔드포인트를 측정한 것입니다. 부하 상태의 처리량을 추정하지 않으며 다른 서비스와의 비교도 아닙니다.',
    es: '{{strong}} Esto mide un punto de acceso desde una máquina y a una hora determinadas. No estima el rendimiento bajo carga y no es una comparación con otros servicios.'
  },
  'benchmark.limit2': {
    en: '{{strong}} The paper is in the graph, but no source asserts anything about its retraction status. Read that as “no evidence”, never as “clean”; the derivation returns a distinct verdict for exactly this reason.',
    zh: '{{strong}} 论文在图谱里，但没有任何来源对它的撤稿状态表态。要读成“没有证据”，而不是“干净”；推导之所以返回一个单独的结论，正是为了这个。',
    ja: '{{strong}} 論文はグラフ内にありますが、その撤回ステータスについて何も主張しないソースしかありません。これは「証拠なし」と読むべきで、決して「クリーン」ではありません。導出がまさにこの理由で別個の判定を返すのは、そのためです。',
    ko: '{{strong}} 논문은 그래프에 있지만 철회 상태에 대해 단정하는 출처가 없습니다. 이를 “증거 없음”으로 읽어야 하며 “깨끗함”으로 읽어서는 안 됩니다. 도출 로직이 별도의 판정을 반환하는 이유가 바로 이것입니다.',
    es: '{{strong}} El artículo está en el grafo, pero ninguna fuente afirma nada sobre su estado de retractación. Debe leerse como «sin evidencia», nunca como «limpio»; precisamente por eso la derivación devuelve un veredicto distinto.'
  },
  'benchmark.limit3': {
    en: '{{strong}} Reason text is excluded from the dataset on purpose.',
    zh: '{{strong}} 数据集刻意排除了撤稿原因的原文。',
    ja: '{{strong}} 理由テキストは意図的にデータセットから除外しています。',
    ko: '{{strong}} 사유 텍스트는 의도적으로 데이터셋에서 제외되었습니다.',
    es: '{{strong}} El texto del motivo se excluye del conjunto de datos a propósito.'
  },
  'benchmark.limit4': {
    en: '{{strong}} — the {{max}} ms sample was the first request after idle. A warm median of ~1.4 s matches the {{code}} header, so the engine itself answers in single-digit milliseconds.',
    zh: '{{strong}}——那个 {{max}} ms 的样本是空闲后的第一次请求。热态中位数约 1.4 s，与 {{code}} 响应头一致，也就是说引擎本身的回答在个位数毫秒级。',
    ja: '{{strong}} — {{max}} ms のサンプルはアイドル後の最初のリクエストでした。ウォーム時の中央値は約 1.4 s で {{code}} ヘッダーと一致するため、エンジン自体は 1 桁ミリ秒で応答しています。',
    ko: '{{strong}} — {{max}} ms 샘플은 유휴 후 첫 요청이었습니다. 워밍 상태의 중앙값 약 1.4 s는 {{code}} 헤더와 일치하므로, 엔진 자체는 한 자릿수 밀리초로 응답합니다.',
    es: '{{strong}}: la muestra de {{max}} ms fue la primera solicitud tras un periodo de inactividad. Una mediana en caliente de ~1.4 s coincide con la cabecera {{code}}, así que el motor responde en milisegundos de un dígito.'
  },
  'benchmark.limit5': {
    en: '{{strong}} Propagation and evidence audit cost $0.02 and $0.10 per call and are not exercised by this benchmark.',
    zh: '{{strong}} 传播与证据审计每次调用分别为 $0.02 和 $0.10，本基准没有测这两条。',
    ja: '{{strong}} 伝播と証拠監査は 1 回 $0.02 と $0.10 で、このベンチマークでは実行していません。',
    ko: '{{strong}} 전파와 증거 감사는 호출당 $0.02와 $0.10이 들며 이 벤치마크에서는 실행하지 않았습니다.',
    es: '{{strong}} La propagación y la auditoría de evidencia cuestan $0.02 y $0.10 por llamada y esta evaluación no las ejercita.'
  },
  'benchmark.runTitle': {
    en: 'Run it yourself',
    zh: '自己跑一遍',
    ja: '自分で試す',
    ko: '직접 실행하기',
    es: 'Ejecútelo usted mismo'
  },
  'benchmark.runLead': {
    en: 'The interactive lookup on the datasets page hits the same endpoint with no key, so you can spot-check any DOI in this table — including the controls that return no rows.',
    zh: '数据集页面上的交互式查询打的是同一个接口，不需要密钥，所以这张表里的任何 DOI 你都可以抽查——包括那几个返回无记录的对照组。',
    ja: 'データセットページの対話型検索は同じエンドポイントにキーなしでアクセスするため、この表の任意の DOI をスポットチェックできます。行を返さないコントロールも含みます。',
    ko: '데이터셋 페이지의 대화형 조회는 키 없이 동일한 엔드포인트를 호출하므로, 이 표의 어떤 DOI든 즉석에서 확인할 수 있습니다. 행을 반환하지 않는 대조군도 포함됩니다.',
    es: 'La consulta interactiva de la página de conjuntos de datos llama al mismo punto de acceso sin clave, así que se puede verificar cualquier DOI de esta tabla, incluidos los controles que devuelven sin filas.'
  },
  'benchmark.runCta': {
    en: 'Try a DOI',
    zh: '试一个 DOI',
    ja: 'DOI を試す',
    ko: 'DOI 시험해 보기',
    es: 'Probar un DOI'
  },
  'benchmark.runHowBuilt': {
    en: 'How the graph is built',
    zh: '图谱是怎么构建的',
    ja: 'グラフの構築方法',
    ko: '그래프 구축 방식',
    es: 'Cómo se construye el grafo'
  },
  'integrity.back': {
    en: '← All datasets',
    zh: '← 所有数据集',
    ja: '← すべてのデータセット',
    ko: '← 전체 데이터셋',
    es: '← Todos los conjuntos de datos'
  },
  'integrity.kicker': {
    en: 'Dataset walkthrough',
    zh: '数据集详解',
    ja: 'データセット解説',
    ko: '데이터셋 둘러보기',
    es: 'Recorrido por el conjunto de datos'
  },
  'integrity.title': {
    en: 'A retraction graph you can audit line by line',
    zh: '一张能逐行审计的撤稿图谱',
    ja: '行単位で監査できる撤回グラフ',
    ko: '한 줄씩 감사할 수 있는 철회 그래프',
    es: 'Un grafo de retractaciones que se puede auditar línea por línea'
  },
  'integrity.lead': {
    en: 'Retraction is not a boolean that arrives from one authority. Crossref records an update relation, Retraction Watch records a notice, OpenAlex carries an index flag — and they disagree. This dataset keeps every assertion as its own row, with the source that made it, so a downstream judgment can show its work instead of asserting a conclusion. Published under CC0-1.0, snapshot {{code}}.',
    zh: '撤稿不是一个由某个权威机构下发的布尔值。Crossref 记录更新关系，Retraction Watch 记录通告，OpenAlex 带一个索引标记——而它们彼此并不一致。这个数据集把每一条断言都保留为单独的一行，并记下是哪个来源做出的，这样下游的判断可以展示推理过程，而不是直接断言一个结论。以 CC0-1.0 发布，快照 {{code}}。',
    ja: '撤回は単一の権威から届く真偽値ではありません。Crossref は更新リレーションを記録し、Retraction Watch は告知を記録し、OpenAlex はインデックス由来のフラグを持ち、それらはしばしば食い違います。このデータセットはすべてのアサーションを、それを発したソースとともに独立した行として保持するため、下流の判断は結論を断言する代わりに根拠を示せます。CC0-1.0 で公開、スナップショット {{code}}。',
    ko: '철회는 한 기관에서 내려오는 불리언 값이 아닙니다. Crossref는 업데이트 관계를 기록하고, Retraction Watch는 공지를 기록하며, OpenAlex는 색인 플래그를 전달합니다. 그리고 이들은 서로 어긋납니다. 이 데이터셋은 모든 단정을 그것을 제시한 출처와 함께 각각의 행으로 보관하므로, 하위 판단은 결론만 단정하지 않고 근거 과정을 보여 줄 수 있습니다. CC0-1.0으로 공개, 스냅샷 {{code}}.',
    es: 'Una retractación no es un booleano que llega de una sola autoridad. Crossref registra una relación de actualización, Retraction Watch registra un aviso, OpenAlex lleva una marca de índice, y no coinciden. Este conjunto de datos guarda cada aserción como su propia fila, con la fuente que la hizo, para que un dictamen posterior pueda mostrar su trabajo en lugar de afirmar una conclusión. Publicado bajo CC0-1.0, instantánea {{code}}.'
  },
  'integrity.pillPapers': {
    en: '{{n}} papers',
    zh: '{{n}} 篇论文',
    ja: '{{n}} 件の論文',
    ko: '논문 {{n}}편',
    es: '{{n}} artículos'
  },
  'integrity.pillEdges': {
    en: '{{n}} citation edges',
    zh: '{{n}} 条引用边',
    ja: '{{n}} 本の引用エッジ',
    ko: '인용 간선 {{n}}개',
    es: '{{n}} aristas de cita'
  },
  'integrity.pillStatusRows': {
    en: '{{n}} status rows',
    zh: '{{n}} 条状态行',
    ja: '{{n}} 行のステータス',
    ko: '상태 행 {{n}}개',
    es: '{{n}} filas de estado'
  },
  'integrity.pillTiers': {
    en: '3 source tiers',
    zh: '3 个来源层级',
    ja: '3 つのソース階層',
    ko: '출처 등급 3단계',
    es: '3 niveles de fuente'
  },
  'integrity.schemaTitle': {
    en: 'Schema',
    zh: '表结构',
    ja: 'スキーマ',
    ko: '스키마',
    es: 'Esquema'
  },
  'integrity.colTable': {
    en: 'Table',
    zh: '表',
    ja: 'テーブル',
    ko: '테이블',
    es: 'Tabla'
  },
  'integrity.colRows': {
    en: 'Rows',
    zh: '行数',
    ja: '行数',
    ko: '행',
    es: 'Filas'
  },
  'integrity.colFields': {
    en: 'Fields',
    zh: '字段',
    ja: 'フィールド',
    ko: '필드',
    es: 'Campos'
  },
  'integrity.colWhy': {
    en: 'Why it is shaped this way',
    zh: '为什么这样设计',
    ja: 'この形にした理由',
    ko: '이런 구조를 택한 이유',
    es: 'Por qué tiene esta forma'
  },
  'integrity.notePapers': {
    en: 'One row per work. paper_id is the OpenAlex ID and stays stable across snapshots, which is what makes incremental builds possible.',
    zh: '一个 work 一行。paper_id 就是 OpenAlex ID，跨快照保持稳定，这正是增量构建可行的原因。',
    ja: '1 ワーク 1 行。paper_id は OpenAlex の ID で、スナップショット間で安定しているため、増分ビルドが可能になります。',
    ko: '작업당 한 행. paper_id는 OpenAlex ID이며 스냅샷 간에 안정적으로 유지되므로 증분 빌드가 가능합니다.',
    es: 'Una fila por trabajo. paper_id es el identificador de OpenAlex y se mantiene estable entre instantáneas, que es lo que hace posibles las construcciones incrementales.'
  },
  'integrity.noteCites': {
    en: 'Directed edges: citing_id cites cited_id. cited_doi is null when the reference has no DOI, so do not join on DOI alone.',
    zh: '有向边：citing_id 引用 cited_id。参考文献没有 DOI 时 cited_doi 为 null，所以不要只用 DOI 做 join。',
    ja: '有向エッジ: citing_id が cited_id を引用します。参照に DOI がない場合 cited_doi は null なので、DOI だけで結合しないでください。',
    ko: '방향 간선: citing_id가 cited_id를 인용합니다. 참조에 DOI가 없으면 cited_doi는 null이므로 DOI만으로 조인해서는 안 됩니다.',
    es: 'Aristas dirigidas: citing_id cita a cited_id. cited_doi es nulo cuando la referencia no tiene DOI, así que no conviene unir solo por DOI.'
  },
  'integrity.noteStatus': {
    en: 'One row per (paper, source) assertion. A paper can have three rows that disagree; the judgment layer reports the disagreement instead of picking a winner silently.',
    zh: '每一条（论文, 来源）断言一行。一篇论文可能有三行互相矛盾；判断层会报告这种矛盾，而不是悄悄挑一个赢家。',
    ja: '(論文, ソース) のアサーションごとに 1 行。1 つの論文に食い違う 3 行が存在し得ます。判断レイヤーは勝者を黙って選ぶのではなく、その不一致を報告します。',
    ko: '(논문, 출처) 단정당 한 행. 한 논문이 서로 어긋나는 세 개의 행을 가질 수 있으며, 판단 계층은 조용히 하나를 고르지 않고 그 불일치를 보고합니다.',
    es: 'Una fila por aserción (artículo, fuente). Un artículo puede tener tres filas que no coinciden; la capa de dictamen informa la discrepancia en lugar de elegir un ganador en silencio.'
  },
  'integrity.tiersNote': {
    en: 'Source tiers: {{a}} = a registry that records retractions directly (Crossref {{code}}, Retraction Watch); {{c}} = index-derived flag (OpenAlex). Retraction Watch reason and nature free text is excluded from the release, so no row can be misread as a misconduct finding.',
    zh: '来源层级：{{a}} = 直接记录撤稿的注册库（Crossref {{code}}、Retraction Watch）；{{c}} = 索引推导出的标记（OpenAlex）。Retraction Watch 的原因与性质自由文本不随发布提供，所以没有哪一行会被读成学术不端的认定。',
    ja: 'ソース階層: {{a}} = 撤回を直接記録するレジストリ（Crossref {{code}}、Retraction Watch）、{{c}} = インデックス由来のフラグ（OpenAlex）。Retraction Watch の理由と性質のフリーテキストはリリースから除外しているため、どの行も不正行為の認定と誤読されることはありません。',
    ko: '출처 등급: {{a}} = 철회를 직접 기록하는 레지스트리(Crossref {{code}}, Retraction Watch); {{c}} = 색인 파생 플래그(OpenAlex). Retraction Watch의 사유와 성격 자유 서술은 배포본에서 제외되므로, 어떤 행도 연구 부정행위 판정으로 오독될 수 없습니다.',
    es: 'Niveles de fuente: {{a}} = un registro que anota retractaciones directamente (Crossref {{code}}, Retraction Watch); {{c}} = marca derivada de un índice (OpenAlex). El texto libre de motivo y naturaleza de Retraction Watch se excluye de la publicación, así que ninguna fila puede malinterpretarse como una conclusión de mala conducta.'
  },
  'integrity.graphTitle': {
    en: 'The graph, rendered',
    zh: '渲染出来的图谱',
    ja: 'グラフの描画',
    ko: '렌더링된 그래프',
    es: 'El grafo, representado'
  },
  'integrity.graphLead': {
    en: '{{seeds}} retracted papers, {{citers}} distinct works that cite at least one of them, {{edges}} edges. {{multi}} papers cite two or more retracted works — the yellow nodes — which is exactly the population where “is my claim downstream of a retraction?” stops being a lookup and becomes a graph question.',
    zh: '{{seeds}} 篇撤稿论文，{{citers}} 篇至少引用其中一篇的不同工作，{{edges}} 条边。有 {{multi}} 篇论文引用了两篇或更多撤稿工作——也就是那些黄色节点——正是这批人让“我的结论是不是处在某次撤稿的下游”从一个查询变成图谱问题。',
    ja: '{{seeds}} 件の撤回済み論文、そのいずれかを引用する {{citers}} 件の異なるワーク、{{edges}} 本のエッジ。{{multi}} 件の論文は 2 件以上の撤回済みワークを引用しており（黄色のノード）、まさにこの集団で「自分の主張は撤回の下流にあるか」という問いは単純な照会ではなくグラフの問題になります。',
    ko: '{{seeds}}편의 철회 논문, 그중 최소 하나를 인용하는 {{citers}}개의 서로 다른 작업, {{edges}}개의 간선. {{multi}}편의 논문은 둘 이상의 철회된 작업을 인용하며(노란색 노드), 바로 이 집단에서 “내 주장이 철회의 하류에 있는가?”라는 질문이 단순 조회를 넘어 그래프 문제가 됩니다.',
    es: '{{seeds}} artículos retractados, {{citers}} trabajos distintos que citan al menos uno de ellos, {{edges}} aristas. {{multi}} artículos citan dos o más trabajos retractados —los nodos amarillos—, que es exactamente la población en la que «¿mi afirmación está aguas abajo de una retractación?» deja de ser una consulta y pasa a ser una pregunta de grafo.'
  },
  'integrity.graphCaption': {
    en: 'Rendered client-side from a 115 KB nodes/edges payload built from the published JSONL, no external chart library. Hover a node for its title; click a seed to isolate the works that cite it.',
    zh: '在客户端用发布的 JSONL 生成的 115 KB 节点/边数据渲染，没有引入外部图表库。悬停节点看标题；点击种子论文可以只显示引用它的工作。',
    ja: '公開 JSONL から構築した 115 KB のノード/エッジのペイロードを、外部チャートライブラリなしでクライアント側で描画しています。ノードにカーソルを合わせるとタイトルが表示され、シードをクリックするとそれを引用するワークだけが分離されます。',
    ko: '공개된 JSONL로 만든 115 KB 노드/간선 페이로드에서 클라이언트 측으로 렌더링하며, 외부 차트 라이브러리를 쓰지 않습니다. 노드에 마우스를 올리면 제목이 표시되고, 시드를 클릭하면 그것을 인용하는 작업만 분리됩니다.',
    es: 'Representado en el cliente a partir de una carga de nodos y aristas de 115 KB construida con el JSONL publicado, sin biblioteca de gráficos externa. Pase el cursor sobre un nodo para ver su título; haga clic en una semilla para aislar los trabajos que la citan.'
  },
  'integrity.seedsTitle': {
    en: 'The twelve seeds',
    zh: '十二篇种子论文',
    ja: '12 件のシード',
    ko: '열두 개의 시드',
    es: 'Las doce semillas'
  },
  'integrity.colPaper': {
    en: 'Retracted paper',
    zh: '撤稿论文',
    ja: '撤回済み論文',
    ko: '철회된 논문',
    es: 'Artículo retractado'
  },
  'integrity.colRecorded': {
    en: 'Recorded retraction',
    zh: '记录的撤稿',
    ja: '記録された撤回',
    ko: '기록된 철회',
    es: 'Retractación registrada'
  },
  'integrity.colCiters': {
    en: 'Citing works',
    zh: '引用工作数',
    ja: '引用元ワーク',
    ko: '인용 작업',
    es: 'Trabajos citantes'
  },
  'integrity.noDate': {
    en: 'in record, no date',
    zh: '有记录，无日期',
    ja: '記録あり、日付なし',
    ko: '기록에 있음, 날짜 없음',
    es: 'en el registro, sin fecha'
  },
  'integrity.checkTitle': {
    en: 'Check a DOI yourself',
    zh: '自己查一个 DOI',
    ja: 'DOI を自分で確認する',
    ko: '직접 DOI 확인하기',
    es: 'Verifique un DOI usted mismo'
  },
  'integrity.liveTitle': {
    en: 'What the live lookup returned for {{n}} DOIs',
    zh: '线上查询对 {{n}} 个 DOI 返回了什么',
    ja: '{{n}} 件の DOI に対するライブ検索の結果',
    ko: '{{n}}개 DOI에 대한 실시간 조회 결과',
    es: 'Lo que devolvió la consulta en vivo para {{n}} DOI'
  },
  'integrity.liveLead': {
    en: 'Queried {{date}}. Median round trip {{p50}} ms, slowest {{max}} ms. Retracted cases below; the edge cases that matter are underneath.',
    zh: '查询于 {{date}}。往返中位数 {{p50}} ms，最慢 {{max}} ms。下面是已撤稿的案例；真正要紧的边界案例在更下面。',
    ja: '{{date}} に照会。往復の中央値 {{p50}} ms、最遅 {{max}} ms。以下は撤回済みのケースで、重要なエッジケースはその下にあります。',
    ko: '{{date}}에 질의했습니다. 중앙 왕복 시간 {{p50}} ms, 최대 {{max}} ms. 아래는 철회 사례이며, 중요한 경계 사례는 그 밑에 있습니다.',
    es: 'Consultado el {{date}}. Ida y vuelta mediana de {{p50}} ms, la más lenta de {{max}} ms. Abajo aparecen los casos retractados; los casos límite que importan están más abajo.'
  },
  'integrity.colSources': {
    en: 'Sources',
    zh: '来源',
    ja: 'ソース',
    ko: '출처',
    es: 'Fuentes'
  },
  'integrity.misreadTitle': {
    en: 'The three answers people misread',
    zh: '三个最容易读错的返回',
    ja: '誤読されやすい 3 つの回答',
    ko: '사람들이 잘못 읽는 세 가지 답',
    es: 'Las tres respuestas que la gente malinterpreta'
  },
  'integrity.noTitle': {
    en: 'no title',
    zh: '无标题',
    ja: 'タイトルなし',
    ko: '제목 없음',
    es: 'sin título'
  },
  'integrity.fullBenchmark': {
    en: 'Full benchmark, method and limitations →',
    zh: '完整基准、方法与局限 →',
    ja: 'ベンチマーク全文・手法・制約 →',
    ko: '전체 벤치마크, 방법 및 한계 →',
    es: 'Evaluación completa, método y limitaciones →'
  },
  'integrity.getDataTitle': {
    en: 'Get the data',
    zh: '获取数据',
    ja: 'データの入手',
    ko: '데이터 받기',
    es: 'Obtener los datos'
  },
  'integrity.getData1': {
    en: '{{link}} — three {{code}} files plus a manifest with row counts and SHA-256 per file.',
    zh: '{{link}}——三个 {{code}} 文件，加一份包含每个文件行数和 SHA-256 的清单。',
    ja: '{{link}} — 3 つの {{code}} ファイルと、ファイルごとの行数と SHA-256 を記載したマニフェスト。',
    ko: '{{link}} — {{code}} 파일 세 개와 파일별 행 수 및 SHA-256을 담은 매니페스트.',
    es: '{{link}}: tres archivos {{code}} más un manifiesto con recuentos de filas y SHA-256 por archivo.'
  },
  'integrity.getData2': {
    en: '{{link}} — the engine that builds the snapshot and answers from it.',
    zh: '{{link}}——构建快照并基于它作答的引擎。',
    ja: '{{link}} — スナップショットを構築し、そこから回答するエンジン。',
    ko: '{{link}} — 스냅샷을 만들고 그 스냅샷으로 답하는 엔진.',
    es: '{{link}}: el motor que construye la instantánea y responde a partir de ella.'
  },
  'integrity.getData3': {
    en: 'Hosted judgment: {{code}} ($0.02 propagation, $0.10 evidence audit via x402).',
    zh: '托管判断：{{code}}（传播 $0.02，证据审计 $0.10，走 x402）。',
    ja: 'ホスト型の判断: {{code}}（伝播 $0.02、x402 経由の証拠監査 $0.10）。',
    ko: '호스팅 판단: {{code}}(x402를 통한 전파 $0.02, 증거 감사 $0.10).',
    es: 'Dictamen alojado: {{code}} ($0.02 propagación, $0.10 auditoría de evidencia vía x402).'
  },
  'judge.kicker': {
    en: 'Free · no key · no account',
    zh: '免费 · 无需密钥 · 无需账号',
    ja: '無料 · キー不要 · アカウント不要',
    ko: '무료 · 키 불필요 · 계정 불필요',
    es: 'Gratis · sin clave · sin cuenta'
  },
  'judge.title': {
    en: 'Check any DOI for retraction',
    zh: '查任意 DOI 的撤稿状态',
    ja: '任意の DOI の撤回を確認',
    ko: '모든 DOI의 철회 여부 확인',
    es: 'Consulte cualquier DOI por retractación'
  },
  'judge.lead': {
    en: 'One HTTP GET against the live snapshot. The response lists every source that covers the paper, its source tier (A = registry-grade, C = index-derived) and the retraction date when a source records one. Nothing is generated by a model, so the same DOI returns the same answer.',
    zh: '对实时快照发一次 HTTP GET。响应列出覆盖该论文的每一个来源、它的来源层级（A = 注册库级，C = 索引推导）以及来源记录的撤稿日期。没有任何内容由模型生成，所以同一个 DOI 总是同一个答案。',
    ja: 'ライブスナップショットへの HTTP GET 1 回。レスポンスには、その論文をカバーするすべてのソース、ソース階層（A = レジストリ相当、C = インデックス由来）、ソースが記録している場合は撤回日が並びます。モデルによる生成は一切ないため、同じ DOI には同じ回答が返ります。',
    ko: '실시간 스냅샷에 대한 HTTP GET 한 번. 응답은 논문을 다루는 모든 출처, 그 출처 등급(A = 레지스트리 수준, C = 색인 파생), 그리고 출처가 기록한 경우의 철회 날짜를 나열합니다. 모델이 생성하는 것은 없으므로 같은 DOI는 같은 답을 반환합니다.',
    es: 'Una sola solicitud HTTP GET contra la instantánea en vivo. La respuesta enumera cada fuente que cubre el artículo, su nivel de fuente (A = grado de registro, C = derivado de índice) y la fecha de retractación cuando alguna fuente la registra. Ningún modelo genera nada, así que el mismo DOI devuelve la misma respuesta.'
  },
  'judge.inputLabel': {
    en: 'DOI',
    zh: 'DOI',
    ja: 'DOI',
    ko: 'DOI',
    es: 'DOI'
  },
  'judge.check': {
    en: 'Check status',
    zh: '查询状态',
    ja: 'ステータスを確認',
    ko: '상태 확인',
    es: 'Consultar estado'
  },
  'judge.checking': {
    en: 'Checking…',
    zh: '查询中…',
    ja: '確認中…',
    ko: '확인 중…',
    es: 'Consultando…'
  },
  'judge.example1': {
    en: 'Wakefield 1998 (retracted)',
    zh: 'Wakefield 1998（已撤稿）',
    ja: 'ウェイクフィールド 1998（撤回済み）',
    ko: '웨이크필드 1998 (철회됨)',
    es: 'Wakefield 1998 (retractado)'
  },
  'judge.example2': {
    en: 'Nature 2015 (not retracted)',
    zh: 'Nature 2015（未撤稿）',
    ja: 'ネイチャー 2015（未撤回）',
    ko: '네이처 2015 (철회되지 않음)',
    es: 'Nature 2015 (no retractado)'
  },
  'judge.example3': {
    en: 'Unknown DOI (abstains)',
    zh: '未知 DOI（弃权）',
    ja: '未知の DOI（回答保留）',
    ko: '알 수 없는 DOI (판단 보류)',
    es: 'DOI desconocido (se abstiene)'
  },
  'judge.errorTitle': {
    en: 'Could not answer.',
    zh: '无法作答。',
    ja: '回答できませんでした。',
    ko: '답을 얻지 못했습니다.',
    es: 'No se pudo responder.'
  },
  'judge.emptyDoi': {
    en: '(empty)',
    zh: '（空）',
    ja: '（空）',
    ko: '(비어 있음)',
    es: '(vacío)'
  },
  'judge.invalidDoi': {
    en: 'That does not look like a DOI. Expected something like 10.1056/NEJMoa2034577.',
    zh: '这看起来不是一个 DOI。格式应该类似 10.1056/NEJMoa2034577。',
    ja: 'DOI には見えません。10.1056/NEJMoa2034577 のような形式を想定しています。',
    ko: 'DOI 형태로 보이지 않습니다. 10.1056/NEJMoa2034577 같은 형식을 기대합니다.',
    es: 'Eso no parece un DOI. Se esperaba algo como 10.1056/NEJMoa2034577.'
  },
  'judge.httpError': {
    en: 'The endpoint answered HTTP {{status}}. It is a free read-only route; a 429 means you are being rate limited, so wait a minute.',
    zh: '接口返回 HTTP {{status}}。这是一个免费的只读路由；429 表示被限流，等一分钟再试。',
    ja: 'エンドポイントは HTTP {{status}} を返しました。無料の読み取り専用ルートです。429 はレート制限を意味するので、1 分待ってください。',
    ko: '엔드포인트가 HTTP {{status}}로 응답했습니다. 무료 읽기 전용 경로이며, 429는 속도 제한을 뜻하므로 1분 정도 기다리십시오.',
    es: 'El punto de acceso respondió HTTP {{status}}. Es una ruta gratuita de solo lectura; un 429 significa que se está aplicando un límite de tasa, así que espere un minuto.'
  },
  'judge.timeout': {
    en: 'The request took longer than 20 seconds. Slow days happen; retry once before assuming the service is down.',
    zh: '请求超过 20 秒。偶尔就是会慢，先重试一次，再判断服务是不是挂了。',
    ja: 'リクエストが 20 秒以上かかりました。遅い日はあります。サービス停止と決めつける前に、一度だけリトライしてください。',
    ko: '요청이 20 seconds 넘게 걸렸습니다. 느린 날도 있으니 서비스 중단으로 단정하기 전에 한 번 재시도하십시오.',
    es: 'La solicitud tardó más de 20 segundos. Hay días lentos; reintente una vez antes de suponer que el servicio está caído.'
  },
  'judge.network': {
    en: 'The browser could not reach pay.ashesborn.cloud. Check connectivity or an extension blocking cross-origin requests.',
    zh: '浏览器没能连上 pay.ashesborn.cloud。检查网络，或者是否有扩展拦截了跨域请求。',
    ja: 'ブラウザが pay.ashesborn.cloud に到達できませんでした。接続性、またはクロスオリジンリクエストを遮断する拡張機能を確認してください。',
    ko: '브라우저가 pay.ashesborn.cloud에 도달하지 못했습니다. 연결 상태나 교차 출처 요청을 차단하는 확장 프로그램을 확인하십시오.',
    es: 'El navegador no pudo llegar a pay.ashesborn.cloud. Verifique la conectividad o alguna extensión que bloquee solicitudes de origen cruzado.'
  },
  'judge.colSource': {
    en: 'Source',
    zh: '来源',
    ja: 'ソース',
    ko: '출처',
    es: 'Fuente'
  },
  'judge.colTier': {
    en: 'Tier',
    zh: '层级',
    ja: '階層',
    ko: '등급',
    es: 'Nivel'
  },
  'judge.colSays': {
    en: 'Says',
    zh: '说法',
    ja: '主張',
    ko: '기록 내용',
    es: 'Indica'
  },
  'judge.colRetractionDate': {
    en: 'Retraction date',
    zh: '撤稿日期',
    ja: '撤回日',
    ko: '철회 날짜',
    es: 'Fecha de retractación'
  },
  'judge.rawResponse': {
    en: 'Raw response',
    zh: '原始响应',
    ja: '生のレスポンス',
    ko: '원시 응답',
    es: 'Respuesta sin procesar'
  },
  'judge.metaSourceOne': {
    en: '{{n}} source',
    zh: '{{n}} 个来源',
    ja: '{{n}} ソース',
    ko: '출처 {{n}}곳',
    es: '{{n}} fuente'
  },
  'judge.metaSourceMany': {
    en: '{{n}} sources',
    zh: '{{n}} 个来源',
    ja: '{{n}} ソース',
    ko: '출처 {{n}}곳',
    es: '{{n}} fuentes'
  },
  'judge.metaTier': {
    en: 'tier {{tiers}}',
    zh: '层级 {{tiers}}',
    ja: '階層 {{tiers}}',
    ko: '등급 {{tiers}}',
    es: 'nivel {{tiers}}'
  },
  'judge.verdictRetracted': {
    en: 'Retracted',
    zh: '已撤稿',
    ja: '撤回済み',
    ko: '철회됨',
    es: 'Retractado'
  },
  'judge.verdictNotRetracted': {
    en: 'Not retracted',
    zh: '未撤稿',
    ja: '未撤回',
    ko: '철회되지 않음',
    es: 'No retractado'
  },
  'judge.verdictNoRows': {
    en: 'No status rows',
    zh: '无状态记录',
    ja: 'ステータス行なし',
    ko: '상태 행 없음',
    es: 'Sin filas de estado'
  },
  'judge.verdictAbstained': {
    en: 'Abstained',
    zh: '弃权',
    ja: '回答保留',
    ko: '판단 보류',
    es: 'Se abstuvo'
  },
  'judge.saysRetracted': {
    en: 'retracted',
    zh: '已撤稿',
    ja: '撤回済み',
    ko: '철회됨',
    es: 'retractado'
  },
  'judge.saysNotRetracted': {
    en: 'not retracted',
    zh: '未撤稿',
    ja: '未撤回',
    ko: '철회되지 않음',
    es: 'no retractado'
  },
  'judge.readingNotInSnapshot': {
    en: 'This DOI is not in the current snapshot, so the service declines to judge it. It says nothing about whether the paper is retracted.',
    zh: '这个 DOI 不在当前快照里，所以服务拒绝下判断。这并不说明该论文是否被撤稿。',
    ja: 'この DOI は現在のスナップショットに含まれないため、サービスは判断を行いません。これは論文が撤回されたかどうかについて何も述べるものではありません。',
    ko: '이 DOI는 현재 스냅샷에 없으므로 서비스가 판단을 보류합니다. 논문의 철회 여부에 대해서는 아무것도 말하지 않습니다.',
    es: 'Este DOI no está en la instantánea actual, así que el servicio se abstiene de dictaminarlo. No dice nada sobre si el artículo está retractado.'
  },
  'judge.readingAbstainedGeneric': {
    en: 'The service declined to judge this paper and gave a reason.',
    zh: '服务拒绝为这篇论文下判断，并给出了原因。',
    ja: 'サービスはこの論文の判断を行わず、理由を示しました。',
    ko: '서비스가 이 논문의 판단을 보류하고 사유를 제시했습니다.',
    es: 'El servicio se abstuvo de dictaminar este artículo y dio un motivo.'
  },
  'judge.readingNoRows': {
    en: 'The paper is in the snapshot, but no source has a retraction record for it. Treat this as “no evidence either way”, not as “clean”.',
    zh: '论文在快照里，但没有任何来源有它的撤稿记录。这应当读成“两方面都没有证据”，而不是“干净”。',
    ja: '論文はスナップショットに含まれていますが、撤回記録を持つソースはありません。これは「どちらとも言える証拠がない」と扱うべきで、「クリーン」ではありません。',
    ko: '논문은 스냅샷에 있지만 어느 출처도 철회 기록을 갖고 있지 않습니다. 이를 “깨끗함”이 아니라 “어느 쪽으로도 증거 없음”으로 다루십시오.',
    es: 'El artículo está en la instantánea, pero ninguna fuente tiene un registro de retractación para él. Debe tratarse como «sin evidencia en ningún sentido», no como «limpio».'
  },
  'judge.readingRetracted': {
    en: '{{confirmed}} of {{total}} sources say this paper is retracted.',
    zh: '{{total}} 个来源中有 {{confirmed}} 个表示这篇论文已被撤稿。',
    ja: '{{total}} ソース中 {{confirmed}} ソースが、この論文は撤回済みと述べています。',
    ko: '출처 {{total}}곳 중 {{confirmed}}곳이 이 논문이 철회되었다고 밝힙니다.',
    es: '{{confirmed}} de {{total}} fuentes indican que este artículo está retractado.'
  },
  'judge.readingRetractedDated': {
    en: '{{confirmed}} of {{total}} sources say this paper is retracted; the earliest recorded retraction date is {{date}}.',
    zh: '{{total}} 个来源中有 {{confirmed}} 个表示这篇论文已被撤稿；最早记录的撤稿日期是 {{date}}。',
    ja: '{{total}} ソース中 {{confirmed}} ソースが、この論文は撤回済みと述べています。記録された最も早い撤回日は {{date}} です。',
    ko: '출처 {{total}}곳 중 {{confirmed}}곳이 이 논문이 철회되었다고 밝힙니다. 기록된 가장 이른 철회 날짜는 {{date}}입니다.',
    es: '{{confirmed}} de {{total}} fuentes indican que este artículo está retractado; la fecha de retractación registrada más antigua es {{date}}.'
  },
  'judge.readingAllClear': {
    en: 'All {{total}} sources that cover this paper report it as not retracted.',
    zh: '覆盖这篇论文的全部 {{total}} 个来源都报告它未被撤稿。',
    ja: 'この論文をカバーする {{total}} ソースすべてが、未撤回と報告しています。',
    ko: '이 논문을 다루는 {{total}}개 출처 모두 철회되지 않았다고 보고합니다.',
    es: 'Las {{total}} fuentes que cubren este artículo lo reportan como no retractado.'
  },
  'datasets.leadSlot': {
    en: 'decisions you can check',
    zh: '可以核查的判断',
    ja: '検証できる判断',
    ko: '확인할 수 있는 판단',
    es: 'decisiones que se pueden verificar'
  },
  'datasets.conclusions1Slot': {
    en: 'An abstention is an answer.',
    zh: '弃权本身就是一个答案。',
    ja: '棄権もまた一つの答えです。',
    ko: '판단 유보도 하나의 답입니다.',
    es: 'Una abstención es una respuesta.'
  },
  'datasets.conclusions2Slot': {
    en: '“No status rows” is not “not retracted”.',
    zh: '“没有状态行”不等于“未被撤稿”。',
    ja: '「ステータス行がない」は「撤回されていない」ではありません。',
    ko: '“상태 행 없음”은 “철회되지 않음”이 아닙니다.',
    es: '“Sin filas de estado” no es “no retractado”.'
  },
  'datasets.conclusions3Slot': {
    en: 'The public graph is a neighbourhood sample.',
    zh: '公开图谱是一个邻域样本。',
    ja: '公開グラフは近傍サンプルです。',
    ko: '공개 그래프는 인접 영역 표본입니다.',
    es: 'El grafo público es una muestra de vecindario.'
  },
  'datasets.conclusions4Slot': {
    en: 'Source tiering is explicit.',
    zh: '来源分层是显式标注的。',
    ja: '情報源の階層化は明示されています。',
    ko: '출처 등급은 명시되어 있습니다.',
    es: 'La estratificación de fuentes es explícita.'
  },
  'datasets.conclusions5Slot': {
    en: 'No reason text.',
    zh: '不含原因原文。',
    ja: '理由文は含みません。',
    ko: '사유 원문은 없습니다.',
    es: 'Sin texto del motivo.'
  },
  'datasets.endpointMcpSlot': {
    en: 'Anonymous read tier:',
    zh: '匿名读取层：',
    ja: '匿名読み取り層：',
    ko: '익명 읽기 계층:',
    es: 'Nivel de lectura anónima:'
  },
  'datasets.mcpStep4Link': {
    en: 'x402 integration over HTTP and MCP',
    zh: 'x402 接入实践：在 HTTP 与 MCP 上为一次确定性判定付费',
    ja: 'HTTP と MCP での x402 連携',
    ko: 'HTTP와 MCP 기반 x402 연동',
    es: 'Integración de x402 sobre HTTP y MCP'
  },
  'benchmark.method1Slot': {
    en: 'Corpus of questions.',
    zh: '问题集。',
    ja: '質問コーパス。',
    ko: '질문 코퍼스.',
    es: 'Corpus de preguntas.'
  },
  'benchmark.method2Slot': {
    en: 'Controls.',
    zh: '对照组。',
    ja: '対照群。',
    ko: '대조군.',
    es: 'Controles.'
  },
  'benchmark.method2Em': {
    en: 'not',
    zh: '不',
    ja: 'ない',
    ko: '아님',
    es: 'no'
  },
  'benchmark.method3Slot': {
    en: 'One GET each',
    zh: '每个 DOI 一次 GET',
    ja: '各 DOI に 1 回の GET',
    ko: '각각 GET 한 번',
    es: 'Un GET por cada uno'
  },
  'benchmark.method4Slot': {
    en: 'Verdict derivation',
    zh: '结论推导',
    ja: '判定の導出',
    ko: '판정 도출',
    es: 'Derivación del veredicto'
  },
  'benchmark.limit1Slot': {
    en: 'n = {{n}}, one snapshot, one egress.',
    zh: 'n = {{n}}，一个快照，一个出口。',
    ja: 'n = {{n}}、1 つのスナップショット、1 つの出口。',
    ko: 'n = {{n}}, 하나의 스냅샷, 하나의 이그레스.',
    es: 'n = {{n}}, una instantánea, una salida.'
  },
  'benchmark.limit2Slot': {
    en: 'Two controls returned no status rows.',
    zh: '两个对照组返回了无状态记录。',
    ja: '2 つの対照群はステータス行を返しませんでした。',
    ko: '대조군 두 개가 상태 행을 반환하지 않았습니다.',
    es: 'Dos controles no devolvieron filas de estado.'
  },
  'benchmark.limit3Slot': {
    en: '“Retracted” here is a status, not a misconduct finding.',
    zh: '这里的“已撤稿”是一种状态，不是学术不端的认定。',
    ja: 'ここでの「撤回済み」はステータスであり、不正行為の認定ではありません。',
    ko: '여기서 “철회됨”은 상태일 뿐, 연구 부정행위 판정이 아닙니다.',
    es: '“Retractado” es aquí un estado, no una conclusión de mala conducta.'
  },
  'benchmark.limit4Slot': {
    en: 'Latency is dominated by cold container wake-ups',
    zh: '延迟主要来自容器冷启动',
    ja: 'レイテンシの大半はコンテナのコールド起動によるもの',
    ko: '지연 시간은 대부분 컨테이너 콜드 스타트에서 발생합니다',
    es: 'La latencia está dominada por los arranques en frío del contenedor'
  },
  'benchmark.limit5Slot': {
    en: 'The paid judgment is a different product.',
    zh: '付费判断是另一个产品。',
    ja: '有償の判定は別製品です。',
    ko: '유료 판정은 별개의 제품입니다.',
    es: 'El dictamen de pago es otro producto.'
  },
  'datasets.card.propagation.value0': {
    en: 'verdict + confidence',
    zh: '结论 + 置信度',
    ja: '判定 + 信頼度',
    ko: '판정 + 신뢰도',
    es: 'veredicto + confianza'
  },
  'datasets.card.propagation.value1': {
    en: 'deterministic, 0 LLM tokens',
    zh: '确定性，0 个 LLM token',
    ja: '決定的、LLM トークン 0',
    ko: '결정적, LLM 토큰 0',
    es: 'determinista, 0 tokens LLM'
  },
  'datasets.card.propagation.value2': {
    en: 'retracted roots, depth, agreement',
    zh: '撤稿根节点、深度、一致性',
    ja: '撤回された根、深さ、一致度',
    ko: '철회된 루트, 깊이, 일치도',
    es: 'raíces retractadas, profundidad, coincidencia'
  },
};

export function getTranslation(key: string, locale: Locale = 'en'): string {
  if (!translations[key]) {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }
  
  return translations[key][locale] || translations[key].en || key;
}
