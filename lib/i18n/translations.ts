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
  'nav.about': {
    en: 'About',
    zh: '关于',
    ja: '概要',
    ko: '소개',
    es: 'Acerca de'
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
  }
};

export function getTranslation(key: string, locale: Locale = 'en'): string {
  if (!translations[key]) {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }
  
  return translations[key][locale] || translations[key].en || key;
}
