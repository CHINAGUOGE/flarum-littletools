// 导入全局的 flarum 对象
import flarum from 'flarum';

// 从全局对象中解构出我们需要的部分
const app = flarum.app;
const Component = flarum.Component;
// 如果需要使用 extend，可以这样：const extend = flarum.extend;

// 动态注入 CSS
const style = document.createElement('style');
style.textContent = `
    /* 轮播图样式 */
    .guoge-carousel { width: 100%; height: 250px; overflow: hidden; border-radius: 8px; margin-bottom: 20px; position: relative; }
    .guoge-carousel-track { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; height: 100%; }
    .guoge-carousel-track::-webkit-scrollbar { display: none; }
    .guoge-slide { flex: 0 0 100%; scroll-snap-align: start; background-size: cover; background-position: center; height: 100%; transition: opacity 0.3s; }
    .guoge-slide:hover { opacity: 0.8; }

    /* 横向广告样式 */
    .guoge-scroll-ad { display: flex; overflow-x: auto; gap: 15px; padding: 10px 0; scrollbar-width: none; }
    .guoge-scroll-ad::-webkit-scrollbar { display: none; }
    .guoge-ad-item { flex-shrink: 0; }
    .guoge-ad-item img { height: 80px; border-radius: 5px; display: block; transition: transform 0.2s; }
    .guoge-ad-item img:hover { transform: scale(1.05); }

    /* 自定义HTML容器 */
    .guoge-custom-html { margin: 15px 0; }
`;
document.head.appendChild(style);


// --- 权限检查函数 ---
function hasPermission(requiredGroups) {
    const user = app.session.user;
    // 如果没有用户（游客），只允许包含组ID '1' 的内容显示
    if (!user) {
        return requiredGroups.includes(1);
    }
    // 获取当前用户的所有组ID
    const myGroups = user.groups().map(g => parseInt(g.id()));
    // 检查是否有交集
    const hasAccess = requiredGroups.some(group => myGroups.includes(parseInt(group)));
    // 管理员通常拥有所有权限
    return hasAccess || user.isAdmin();
}

// --- 组件：轮播图 ---
class CarouselComponent extends Component {
    view(vnode) {
        const slides = vnode.attrs.content;
        return m('div.guoge-carousel', [
            m('div.guoge-carousel-track', slides.map(slide =>
                m('a.guoge-slide', { href: slide.link || '#', style: `background-image: url('${slide.image}')` })
            ))
        ]);
    }
}

// --- 组件：横向滑动广告 ---
class ScrollAdComponent extends Component {
    view(vnode) {
        const items = vnode.attrs.content;
        return m('div.guoge-scroll-ad',
            items.map(item =>
                m('a.guoge-ad-item', { href: item.link || '#' }, m('img', { src: item.image }))
            )
        );
    }
}

// --- 组件：自定义HTML ---
class CustomHtmlComponent extends Component {
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
        // 预设别名处理
        if (tool.location === 'home_top') targetSelector = '.IndexPage > .container';
        if (tool.location === 'discussion_top') targetSelector = '.DiscussionPage .DiscussionHero';

        const targetElement = document.querySelector(targetSelector);

        if (targetElement) {
            const mountPoint = document.createElement('div');
            mountPoint.className = `guoge-block guoge-block-${tool.type}`;
            // 插入到目标元素的最前面
            targetElement.prepend(mountPoint);

            // 3. 根据类型渲染不同组件
            if (tool.type === 'carousel') {
                m.mount(mountPoint, m(CarouselComponent, { content: tool.content }));
            } else if (tool.type === 'scroll-ad') {
                m.mount(mountPoint, m(ScrollAdComponent, { content: tool.content }));
            } else if (tool.type === 'custom') {
                m.mount(mountPoint, m(CustomHtmlComponent, { content: tool.content }));
            }
        }
    });
});
