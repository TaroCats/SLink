import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 语言包
const resources = {
  en: {
    translation: {
      "app_title": "SLink",
      "shorten_btn": "Shorten",
      "enter_url": "Paste your long URL here...",
      "custom_code": "Custom short code (optional)",
      "short_link_ready": "Your short link is ready!",
      "copy": "Copy",
      "copied": "Copied!",
      "admin_login": "Admin Login",
      "username": "Username",
      "password": "Password",
      "login": "Login",
      "dashboard": "Dashboard",
      "links": "Links",
      "domains": "Domains",
      "logout": "Logout",
      "total_links": "Total Links",
      "total_visits": "Total Visits",
      "total_clicks": "Total Clicks",
      "original_url": "Original URL",
      "short_code": "Short Code",
      "clicks": "Clicks",
      "created_at": "Created At",
      "actions": "Actions",
      "theme_light": "Light Mode",
      "theme_dark": "Dark Mode",
      "theme_system": "System Theme",
      "use_tcn": "Use t.cn secondary shortening",
      "lang_en": "English",
      "lang_zh": "中文",
      "lang_ja": "日本語"
    }
  },
  zh: {
    translation: {
      "app_title": "SLink 短链接",
      "shorten_btn": "生成短链接",
      "enter_url": "在此粘贴您的长链接...",
      "custom_code": "自定义短码 (可选)",
      "short_link_ready": "您的短链接已生成！",
      "copy": "复制",
      "copied": "已复制！",
      "admin_login": "管理员登录",
      "username": "用户名",
      "password": "密码",
      "login": "登录",
      "dashboard": "控制台",
      "links": "链接管理",
      "domains": "域名配置",
      "logout": "退出登录",
      "total_links": "总链接数",
      "total_visits": "总访问量",
      "total_clicks": "总点击量",
      "original_url": "原始链接",
      "short_code": "短码",
      "clicks": "点击量",
      "created_at": "创建时间",
      "actions": "操作",
      "theme_light": "浅色模式",
      "theme_dark": "深色模式",
      "theme_system": "跟随系统",
      "use_tcn": "使用 t.cn 二次短网址",
      "lang_en": "English",
      "lang_zh": "中文",
      "lang_ja": "日本語"
    }
  },
  ja: {
    translation: {
      "app_title": "SLink ショートリンク",
      "shorten_btn": "短縮する",
      "enter_url": "長いURLをここに貼り付けてください...",
      "custom_code": "カスタムコード (任意)",
      "short_link_ready": "ショートリンクが準備できました！",
      "copy": "コピー",
      "copied": "コピーしました！",
      "admin_login": "管理者ログイン",
      "username": "ユーザー名",
      "password": "パスワード",
      "login": "ログイン",
      "dashboard": "ダッシュボード",
      "links": "リンク管理",
      "domains": "ドメイン設定",
      "logout": "ログアウト",
      "total_links": "総リンク数",
      "total_visits": "総訪問数",
      "total_clicks": "総クリック数",
      "original_url": "元のURL",
      "short_code": "ショートコード",
      "clicks": "クリック数",
      "created_at": "作成日時",
      "actions": "アクション",
      "theme_light": "ライトモード",
      "theme_dark": "ダークモード",
      "theme_system": "システム設定",
      "use_tcn": "t.cn でさらに短縮",
      "lang_en": "English",
      "lang_zh": "中文",
      "lang_ja": "日本語"
    }
  }
};

const savedLang = localStorage.getItem('slink-lang') || 'zh';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
