import app from 'flarum/common/app';
import { t } from './src/locale';

// --- CSS 样式 ---
const style = document.createElement('style');
style.textContent = `
    /* 轮播图 */
    .guoge-carousel {
        width: 100%; height: 250px; overflow: hidden;
        border-radius: 8px; margin-bottom: 20px; position: relative;
    }
    .guoge-carousel-track {
        display: flex; transition: transform 0.5s ease; height: 100%;
        will-change: transform;
    }
    .guoge-slide {
        flex: 0 0 100%; background-size: cover; background-position: center;
        height: 100%; display: block; position: relative;
    }
    .guoge-slide:hover { opacity: 0.9; }
    .guoge-slide-fallback {
        display: flex; align-items: center; justify-content: center;
        background: #f0f0f0; color: #999; font-size: 14px;
        width: 100%; height: 100%;
    }
    .guoge-carousel-dots {
        position: absolute; bottom: 10px; left: 50%;
        transform: translateX(-50%); display: flex; gap: 8px; z-index: 2;
    }
    .guoge-carousel-dot {
        width: 10px; height: 10px; border-radius: 50%;
        background: rgba(255,255,255,0.5); cursor: pointer;
        transition: background 0.3s; border: none; padding: 0;
    }
    .guoge-carousel-dot.active { background: #fff; }
    .guoge-carousel-arrow {
        position: absolute; top: 50%; transform: translateY(-50%);
        background: rgba(0,0,0,0.3); color: #fff; border: none;
        width: 36px; height: 36px; border-radius: 50%; cursor: pointer;
        font-size: 16px; z-index: 2; display: flex;
        align-items: center; justify-content: center;
        transition: background 0.2s; opacity: 0;
    }
    .guoge-carousel:hover .guoge-carousel-arrow { opacity: 1; }
    .guoge-carousel-arrow:hover { background: rgba(0,0,0,0.6); }
    .guoge-carousel-arrow.prev { left: 10px; }
    .guoge-carousel-arrow.next { right: 10px; }

    /* 横向广告 */
    .guoge-scroll-ad {
        display: flex; overflow: hidden; gap: 15px;
        padding: 10px 0; position: relative;
    }
    .guoge-scroll-ad-track {
        display: flex; gap: 15px; animation: guoge-scroll-auto 20s linear infinite;
        will-change: transform;
    }
    .guoge-scroll-ad:hover .guoge-scroll-ad-track { animation-play-state: paused; }
    .guoge-ad-item { flex-shrink: 0; }
    .guoge-ad-item img {
        height: 80px; border-radius: 5px; display: block;
        transition: transform 0.2s;
    }
    .guoge-ad-item img:hover { transform: scale(1.05); }
    .guoge-ad-fallback {
        height: 80px; width: 120px; background: #f0f0f0;
        border-radius: 5px; display: flex; align-items: center;
        justify-content: center; color: #999; font-size: 12px;
    }
    @keyframes guoge-scroll-auto {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
    }

    /* 自定义HTML */
    .guoge-custom-html { margin: 15px 0; }
`;
document.head.appendChild(style);

// --- 图片加载失败兜底 ---
function onImgError(e) {
    const el = e.target;
    el.style.display = 'none';
    const fallback = document.createElement('div');
    fallback.className = 'guoge-slide-fallback';
    fallback.textContent = t('imagePlaceholder');
    el.parentNode.insertBefore(fallback, el);
}

function onAdImgError(e) {
    const el = e.target;
    el.style.display = 'none';
    const fallback = document.createElement('div');
    fallback.className = 'guoge-ad-fallback';
    fallback.textContent = t('imagePlaceholder');
    el.parentNode.insertBefore(fallback, el);
}

// --- 权限检查 ---
function hasPermission(requiredGroups) {
    const user = app.session.user;
    if (!user) return requiredGroups.includes(1);
    const myGroups = user.groups().map(g => parseInt(g.id()));
    return requiredGroups.some(group => myGroups.includes(parseInt(group))) || user.isAdmin();
}

// --- 轮播图组件 ---
class CarouselComponent {
    oninit(vnode) {
        vnode.state.current = 0;
        vnode.state.slides = vnode.attrs.content || [];
        vnode.state.timer = null;
        vnode.state.touchStartX = 0;
        vnode.state.touchStartY = 0;
        vnode.state.touchDeltaX = 0;
        vnode.state.isSwiping = false;
    }

    oncreate(vnode) {
        this.startAutoPlay(vnode);
        this.bindTouch(vnode);
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

    bindTouch(vnode) {
        const el = vnode.dom;
        if (!el) return;

        el.addEventListener('touchstart', (e) => {
            vnode.state.touchStartX = e.touches[0].clientX;
            vnode.state.touchStartY = e.touches[0].clientY;
            vnode.state.touchDeltaX = 0;
            vnode.state.isSwiping = false;
            this.stopAutoPlay(vnode);
        }, { passive: true });

        el.addEventListener('touchmove', (e) => {
            const dx = e.touches[0].clientX - vnode.state.touchStartX;
            const dy = e.touches[0].clientY - vnode.state.touchStartY;
            // 水平滑动距离大于垂直时才认定为滑动
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
                vnode.state.isSwiping = true;
                vnode.state.touchDeltaX = dx;
            }
        }, { passive: true });

        el.addEventListener('touchend', () => {
            const threshold = 50;
            if (vnode.state.isSwiping) {
                if (vnode.state.touchDeltaX < -threshold) {
                    // 左滑 → 下一张
                    vnode.state.current = (vnode.state.current + 1) % vnode.state.slides.length;
                } else if (vnode.state.touchDeltaX > threshold) {
                    // 右滑 → 上一张
                    vnode.state.current = (vnode.state.current - 1 + vnode.state.slides.length) % vnode.state.slides.length;
                }
            }
            vnode.state.touchDeltaX = 0;
            vnode.state.isSwiping = false;
            this.startAutoPlay(vnode);
            m.redraw();
        }, { passive: true });
    }

    view(vnode) {
        const { current, slides } = vnode.state;
        if (!slides.length) return null;

        return m('div.guoge-carousel', {
            role: 'region',
            'aria-roledescription': t('carousel'),
            'aria-label': t('carousel'),
            onmouseenter: () => this.stopAutoPlay(vnode),
            onmouseleave: () => this.startAutoPlay(vnode)
        }, [
            m('div.guoge-carousel-track', {
                style: `transform: translateX(-${current * 100}%)`
            }, slides.map((slide, i) =>
                m('a.guoge-slide', {
                    href: slide.link || '#',
                    style: `background-image: url('${slide.image}')`,
                    role: 'tabpanel',
                    'aria-label': `${t('slideTo', { n: i + 1 })}`,
                    'aria-hidden': i !== current ? 'true' : 'false',
                })
            )),
            slides.length > 1 && m('button.guoge-carousel-arrow.prev', {
                onclick: () => this.goTo(vnode, (current - 1 + slides.length) % slides.length),
                'aria-label': t('prev'),
            }, '❮'),
            slides.length > 1 && m('button.guoge-carousel-arrow.next', {
                onclick: () => this.goTo(vnode, (current + 1) % slides.length),
                'aria-label': t('next'),
            }, '❯'),
            slides.length > 1 && m('div.guoge-carousel-dots', { role: 'tablist' },
                slides.map((_, i) =>
                    m('button.guoge-carousel-dot', {
                        className: i === current ? 'active' : '',
                        onclick: () => this.goTo(vnode, i),
                        role: 'tab',
                        'aria-selected': i === current ? 'true' : 'false',
                        'aria-label': `${t('slideTo', { n: i + 1 })}`,
                    })
                )
            )
        ]);
    }
}

// --- 横向广告组件（自动滚动） ---
class ScrollAdComponent {
    oncreate(vnode) {
        // 检查内容宽度，决定是否需要克隆实现无缝滚动
        const track = vnode.dom.querySelector('.guoge-scroll-ad-track');
        if (track && track.scrollWidth > vnode.dom.clientWidth) {
            // 克隆子元素实现无缝循环
            const items = track.innerHTML;
            track.innerHTML = items + items;
        }
    }

    view(vnode) {
        const items = vnode.attrs.content || [];
        if (!items.length) return null;

        return m('div.guoge-scroll-ad', {
            role: 'region',
            'aria-label': t('scrollAd'),
        }, [
            m('div.guoge-scroll-ad-track',
                items.map(item =>
                    m('a.guoge-ad-item', { href: item.link || '#' },
                        m('img', {
                            src: item.image,
                            alt: item.alt || '',
                            loading: 'lazy',
                            onerror: onAdImgError,
                        })
                    )
                )
            )
        ]);
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
        if (!hasPermission(tool.groups || [])) return;

        let targetSelector = tool.location;
        if (tool.location === 'home_top') targetSelector = '.IndexPage > .container';
        if (tool.location === 'discussion_top') targetSelector = '.DiscussionPage .DiscussionHero';

        const targetElement = document.querySelector(targetSelector);
        if (!targetElement) return;

        const mountPoint = document.createElement('div');
        mountPoint.className = `guoge-block guoge-block-${tool.type}`;
        targetElement.prepend(mountPoint);

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
