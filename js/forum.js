import app from 'flarum/common/app';

// --- CSS 样式 ---
const style = document.createElement('style');
style.textContent = `
    /* 轮播图样式 */
    .guoge-carousel {
        width: 100%;
        height: 250px;
        overflow: hidden;
        border-radius: 8px;
        margin-bottom: 20px;
        position: relative;
    }
    .guoge-carousel-track {
        display: flex;
        transition: transform 0.5s ease;
        height: 100%;
    }
    .guoge-slide {
        flex: 0 0 100%;
        background-size: cover;
        background-position: center;
        height: 100%;
        transition: opacity 0.3s;
        display: block;
    }
    .guoge-slide:hover {
        opacity: 0.85;
    }
    .guoge-carousel-dots {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 8px;
        z-index: 2;
    }
    .guoge-carousel-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(255,255,255,0.5);
        cursor: pointer;
        transition: background 0.3s;
        border: none;
        padding: 0;
    }
    .guoge-carousel-dot.active {
        background: #fff;
    }
    .guoge-carousel-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(0,0,0,0.3);
        color: #fff;
        border: none;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 16px;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
    }
    .guoge-carousel-arrow:hover {
        background: rgba(0,0,0,0.6);
    }
    .guoge-carousel-arrow.prev {
        left: 10px;
    }
    .guoge-carousel-arrow.next {
        right: 10px;
    }

    /* 横向广告样式 */
    .guoge-scroll-ad {
        display: flex;
        overflow-x: auto;
        gap: 15px;
        padding: 10px 0;
        scrollbar-width: none;
    }
    .guoge-scroll-ad::-webkit-scrollbar {
        display: none;
    }
    .guoge-ad-item {
        flex-shrink: 0;
    }
    .guoge-ad-item img {
        height: 80px;
        border-radius: 5px;
        display: block;
        transition: transform 0.2s;
    }
    .guoge-ad-item img:hover {
        transform: scale(1.05);
    }

    /* 自定义HTML容器 */
    .guoge-custom-html {
        margin: 15px 0;
    }
`;
document.head.appendChild(style);

// --- 权限检查函数 ---
function hasPermission(requiredGroups) {
    const user = app.session.user;
    if (!user) {
        // 游客：仅当 groups 包含 1 时允许
        return requiredGroups.includes(1);
    }
    const myGroups = user.groups().map(g => parseInt(g.id()));
    return requiredGroups.some(group => myGroups.includes(parseInt(group))) || user.isAdmin();
}

// --- 轮播图组件（带自动播放和指示器） ---
class CarouselComponent {
    oninit(vnode) {
        vnode.state.current = 0;
        vnode.state.slides = vnode.attrs.content || [];
        vnode.state.timer = null;
    }

    oncreate(vnode) {
        this.startAutoPlay(vnode);
    }

    onbeforeremove(vnode) {
        this.stopAutoPlay(vnode);
    }

    startAutoPlay(vnode) {
        this.stopAutoPlay(vnode);
        if (vnode.state.slides.length <= 1) return;
        vnode.state.timer = setInterval(() => {
            vnode.state.current = (vnode.state.current + 1) % vnode.state.slides.length;
            m.redraw();
        }, 4000);
    }

    stopAutoPlay(vnode) {
        if (vnode.state.timer) {
            clearInterval(vnode.state.timer);
            vnode.state.timer = null;
        }
    }

    goTo(vnode, index) {
        vnode.state.current = index;
        this.startAutoPlay(vnode);
    }

    view(vnode) {
        const { current, slides } = vnode.state;
        if (!slides.length) return null;

        return m('div.guoge-carousel', {
            onmouseenter: () => this.stopAutoPlay(vnode),
            onmouseleave: () => this.startAutoPlay(vnode)
        }, [
            // 轨道
            m('div.guoge-carousel-track', {
                style: `transform: translateX(-${current * 100}%)`
            }, slides.map(slide =>
                m('a.guoge-slide', {
                    href: slide.link || '#',
                    style: `background-image: url('${slide.image}')`
                })
            )),
            // 左右箭头
            slides.length > 1 && m('button.guoge-carousel-arrow.prev', {
                onclick: () => this.goTo(vnode, (current - 1 + slides.length) % slides.length)
            }, '❮'),
            slides.length > 1 && m('button.guoge-carousel-arrow.next', {
                onclick: () => this.goTo(vnode, (current + 1) % slides.length)
            }, '❯'),
            // 指示器圆点
            slides.length > 1 && m('div.guoge-carousel-dots',
                slides.map((_, i) =>
                    m('button.guoge-carousel-dot', {
                        className: i === current ? 'active' : '',
                        onclick: () => this.goTo(vnode, i)
                    })
                )
            )
        ]);
    }
}

// --- 横向滑动广告组件 ---
class ScrollAdComponent {
    view(vnode) {
        const items = vnode.attrs.content || [];
        return m('div.guoge-scroll-ad',
            items.map(item =>
                m('a.guoge-ad-item', { href: item.link || '#' },
                    m('img', { src: item.image, alt: item.alt || '' })
                )
            )
        );
    }
}

// --- 自定义HTML组件 ---
class CustomHtmlComponent {
    view(vnode) {
        return m('div.guoge-custom-html', m.trust(vnode.attrs.content));
    }
}

// --- 主程序入口 ---
app.initializers.add('guoge-littletools', () => {
    const tools = app.data.guogeLittleToolsData || [];

    tools.forEach(tool => {
        // 1. 权限检查
        if (!hasPermission(tool.groups || [])) {
            return;
        }

        // 2. 确定插入位置
        let targetSelector = tool.location;
        if (tool.location === 'home_top') targetSelector = '.IndexPage > .container';
        if (tool.location === 'discussion_top') targetSelector = '.DiscussionPage .DiscussionHero';

        const targetElement = document.querySelector(targetSelector);
        if (!targetElement) return;

        // 3. 创建挂载点
        const mountPoint = document.createElement('div');
        mountPoint.className = `guoge-block guoge-block-${tool.type}`;
        targetElement.prepend(mountPoint);

        // 4. 根据类型渲染
        const componentMap = {
            'carousel': CarouselComponent,
            'scroll-ad': ScrollAdComponent,
            'custom': CustomHtmlComponent,
        };

        const Component = componentMap[tool.type];
        if (Component) {
            m.mount(mountPoint, { view: () => m(Component, { content: tool.content }) });
        }
    });
});
