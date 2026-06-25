// 多语言支持
// 添加新语言只需复制 zh 对象并翻译即可
const locales = {
    zh: {
        // 前台
        carousel: '轮播图',
        scrollAd: '横向广告',
        customHtml: '自定义HTML',
        imagePlaceholder: '图片加载失败',
        prev: '上一张',
        next: '下一张',
        slideTo: '切换到第 {n} 张',

        // 后台
        pageTitle: 'Guoge 小工具管理',
        pageDesc: '配置轮播图、横向广告或自定义 HTML。每个功能块可独立设置位置和可见用户组。',
        groupHint: '用户组: 1=游客, 2=会员, 3=管理员, 4=版主。管理员默认可见所有内容。',
        type: '类型',
        location: '显示位置',
        groups: '可见用户组',
        guest: '游客',
        member: '会员',
        admin: '管理员',
        moderator: '版主',
        carouselType: '轮播图',
        scrollAdType: '横向广告',
        customHtmlType: '自定义 HTML',
        homeTop: '首页顶部',
        discussionTop: '帖子顶部',
        customCss: '自定义 CSS 选择器',
        cssPlaceholder: 'CSS 选择器，如 .IndexPage',
        htmlContent: 'HTML 内容',
        htmlPlaceholder: '<div style="color:red">公告内容</div>',
        imageList: '{type}图片',
        imageUrlPlaceholder: '图片 URL',
        linkPlaceholder: '跳转链接（可选）',
        addImage: '添加图片',
        addCarousel: '添加轮播图',
        addAd: '添加广告',
        addHtml: '添加自定义 HTML',
        save: '保存配置',
        saveDirty: '保存配置*',
        saved: '配置已保存',
        saveFailed: '保存失败: {msg}',
        viewJson: '查看原始 JSON',
        export: '导出配置',
        import: '导入配置',
        importSuccess: '配置已导入',
        importFailed: '导入失败：JSON 格式错误',
        delete: '删除',
        moveUp: '上移',
        moveDown: '下移',
        validationError: '请检查以下问题：',
        emptyImageUrl: '第 {n} 项图片 URL 不能为空',
        emptyHtml: 'HTML 内容不能为空',
        noGroup: '请至少选择一个用户组',
        securityWarning: '⚠️ 安全提示：自定义 HTML 将直接渲染到页面，请确保内容来源可信。避免插入不受信任的第三方代码，以防 XSS 攻击。',
        preview: '实时预览',
        previewHint: '以下为渲染效果预览（保存后在前台生效）',
    },
    en: {
        carousel: 'Carousel',
        scrollAd: 'Scroll Ad',
        customHtml: 'Custom HTML',
        imagePlaceholder: 'Image failed to load',
        prev: 'Previous',
        next: 'Next',
        slideTo: 'Go to slide {n}',

        pageTitle: 'Guoge Little Tools',
        pageDesc: 'Configure carousels, scroll ads, or custom HTML. Each block can have its own location and group permissions.',
        groupHint: 'Groups: 1=Guest, 2=Member, 3=Admin, 4=Mod. Admins always have access.',
        type: 'Type',
        location: 'Location',
        groups: 'Visible Groups',
        guest: 'Guest',
        member: 'Member',
        admin: 'Admin',
        moderator: 'Moderator',
        carouselType: 'Carousel',
        scrollAdType: 'Scroll Ad',
        customHtmlType: 'Custom HTML',
        homeTop: 'Home Top',
        discussionTop: 'Discussion Top',
        customCss: 'Custom CSS Selector',
        cssPlaceholder: 'CSS selector, e.g. .IndexPage',
        htmlContent: 'HTML Content',
        htmlPlaceholder: '<div style="color:red">Announcement</div>',
        imageList: '{type} Images',
        imageUrlPlaceholder: 'Image URL',
        linkPlaceholder: 'Link (optional)',
        addImage: 'Add Image',
        addCarousel: 'Add Carousel',
        addAd: 'Add Ad',
        addHtml: 'Add Custom HTML',
        save: 'Save',
        saveDirty: 'Save*',
        saved: 'Settings saved',
        saveFailed: 'Save failed: {msg}',
        viewJson: 'View Raw JSON',
        export: 'Export',
        import: 'Import',
        importSuccess: 'Config imported',
        importFailed: 'Import failed: invalid JSON',
        validationError: 'Please fix the following:',
        emptyImageUrl: 'Image #{n} URL cannot be empty',
        emptyHtml: 'HTML content cannot be empty',
        noGroup: 'Select at least one group',
        securityWarning: '⚠️ Security: Custom HTML is rendered directly on the page. Only use trusted content to prevent XSS attacks.',
        preview: 'Live Preview',
        previewHint: 'Preview of rendered output (takes effect after saving)',
        delete: 'Delete',
        moveUp: 'Move up',
        moveDown: 'Move down',
    },
};

// 获取当前语言
function getLocale() {
    // Flarum 的语言设置
    const lang = (app && app.data && app.data.locale) ? app.data.locale : 'zh';
    return lang.startsWith('en') ? 'en' : 'zh';
}

// 翻译函数，支持简单插值
function t(key, params = {}) {
    const locale = getLocale();
    const dict = locales[locale] || locales.zh;
    let str = dict[key] || locales.zh[key] || key;
    Object.keys(params).forEach(k => {
        str = str.replace(`{${k}}`, params[k]);
    });
    return str;
}

export { t, locales, getLocale };
