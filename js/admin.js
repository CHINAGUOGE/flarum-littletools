import app from 'flarum/admin/app';
import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import Button from 'flarum/common/components/Button';
import Select from 'flarum/common/components/Select';

// 用户组选项
const GROUP_OPTIONS = [
    { id: 1, label: '游客' },
    { id: 2, label: '会员' },
    { id: 3, label: '管理员' },
    { id: 4, label: '版主' },
];

// 位置预设
const LOCATION_PRESETS = [
    { value: 'home_top', label: '首页顶部' },
    { value: 'discussion_top', label: '帖子顶部' },
    { value: '', label: '自定义 CSS 选择器' },
];

// 类型选项
const TYPE_OPTIONS = [
    { value: 'carousel', label: '轮播图' },
    { value: 'scroll-ad', label: '横向广告' },
    { value: 'custom', label: '自定义 HTML' },
];

// 创建空白工具块
function emptyBlock(type = 'carousel') {
    if (type === 'custom') {
        return { type, location: 'home_top', groups: [1, 2], content: '' };
    }
    return { type, location: 'home_top', groups: [1, 2], content: [{ image: '', link: '' }] };
}

// --- 单个工具块编辑器 ---
class ToolBlockEditor {
    view(vnode) {
        const { block, index, onUpdate, onRemove, onMoveUp, onMoveDown, isFirst, isLast } = vnode.attrs;
        const typeLabel = TYPE_OPTIONS.find(t => t.value === block.type)?.label || block.type;

        return m('div.ToolBlock', {
            style: 'border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: #fff;'
        }, [
            // 头部：类型标签 + 操作按钮
            m('div.ToolBlock-header', {
                style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;'
            }, [
                m('span', {
                    style: 'font-weight: bold; font-size: 14px; color: #e74c3c;'
                }, `#${index + 1} ${typeLabel}`),
                m('div', { style: 'display: flex; gap: 6px;' }, [
                    !isFirst && m(Button, {
                        className: 'Button Button--icon',
                        icon: 'fas fa-arrow-up',
                        onclick: onMoveUp,
                        title: '上移'
                    }),
                    !isLast && m(Button, {
                        className: 'Button Button--icon',
                        icon: 'fas fa-arrow-down',
                        onclick: onMoveDown,
                        title: '下移'
                    }),
                    m(Button, {
                        className: 'Button Button--icon Button--danger',
                        icon: 'fas fa-times',
                        onclick: onRemove,
                        title: '删除'
                    }),
                ]),
            ]),

            // 类型选择
            m('div.Form-group', [
                m('label', '类型'),
                m(Select, {
                    value: block.type,
                    options: TYPE_OPTIONS.map(t => ({ value: t.value, label: t.label })),
                    onchange: (val) => {
                        block.type = val;
                        if (val === 'custom' && Array.isArray(block.content)) {
                            block.content = '';
                        } else if (val !== 'custom' && typeof block.content === 'string') {
                            block.content = [{ image: '', link: '' }];
                        }
                        onUpdate();
                    }
                }),
            ]),

            // 位置选择
            m('div.Form-group', [
                m('label', '显示位置'),
                m(Select, {
                    value: LOCATION_PRESETS.some(p => p.value === block.location && p.value !== '') ? block.location : '',
                    options: LOCATION_PRESETS.map(p => ({ value: p.value, label: p.label })),
                    onchange: (val) => {
                        if (val !== '') block.location = val;
                        onUpdate();
                    }
                }),
                !LOCATION_PRESETS.some(p => p.value === block.location && p.value !== '') &&
                    m('input.FormControl', {
                        type: 'text',
                        placeholder: 'CSS 选择器，如 .IndexPage',
                        value: block.location,
                        oninput: (e) => { block.location = e.target.value; onUpdate(); },
                        style: 'margin-top: 6px;'
                    }),
            ]),

            // 用户组权限
            m('div.Form-group', [
                m('label', '可见用户组'),
                m('div', { style: 'display: flex; gap: 12px; flex-wrap: wrap;' },
                    GROUP_OPTIONS.map(g =>
                        m('label', { style: 'display: flex; align-items: center; gap: 4px; cursor: pointer;' }, [
                            m('input', {
                                type: 'checkbox',
                                checked: block.groups.includes(g.id),
                                onchange: (e) => {
                                    if (e.target.checked) {
                                        if (!block.groups.includes(g.id)) block.groups.push(g.id);
                                    } else {
                                        block.groups = block.groups.filter(id => id !== g.id);
                                    }
                                    onUpdate();
                                }
                            }),
                            g.label,
                        ])
                    )
                ),
            ]),

            // 内容编辑
            block.type === 'custom'
                ? m('div.Form-group', [
                    m('label', 'HTML 内容'),
                    m('textarea.FormControl', {
                        rows: 6,
                        value: block.content,
                        placeholder: '<div style="color:red">公告内容</div>',
                        oninput: (e) => { block.content = e.target.value; onUpdate(); }
                    }),
                ])
                : m('div.Form-group', [
                    m('label', `${block.type === 'carousel' ? '轮播' : '广告'}图片`),
                    (block.content || []).map((item, i) =>
                        m('div', {
                            style: 'display: flex; gap: 8px; margin-bottom: 8px; align-items: center;'
                        }, [
                            m('input.FormControl', {
                                type: 'text',
                                placeholder: '图片 URL',
                                value: item.image,
                                style: 'flex: 2;',
                                oninput: (e) => { item.image = e.target.value; onUpdate(); }
                            }),
                            m('input.FormControl', {
                                type: 'text',
                                placeholder: '跳转链接（可选）',
                                value: item.link,
                                style: 'flex: 2;',
                                oninput: (e) => { item.link = e.target.value; onUpdate(); }
                            }),
                            m(Button, {
                                className: 'Button Button--icon Button--danger',
                                icon: 'fas fa-times',
                                onclick: () => { block.content.splice(i, 1); onUpdate(); }
                            }),
                        ])
                    ),
                    m(Button, {
                        className: 'Button',
                        onclick: () => { block.content.push({ image: '', link: '' }); onUpdate(); }
                    }, [m('i.fas.fa-plus'), ' 添加图片']),
                ]),
        ]);
    }
}

// --- 主设置页面 ---
export default class LittleToolsPage extends ExtensionPage {
    oninit(vnode) {
        super.oninit(vnode);
        this.blocks = [];
        this.dirty = false;

        // 加载现有配置
        try {
            const raw = app.data.settings['guoge_littletools_data'];
            if (raw) {
                this.blocks = JSON.parse(raw);
            }
        } catch (e) {
            console.error('LittleTools: 配置解析失败', e);
        }
    }

    content() {
        return m('div.LittleTools-Page', [
            m('div.container', [
                m('div.ExtensionPage-form', [
                    // 说明文字
                    m('div.Form-group', [
                        m('p.helpText', [
                            '配置轮播图、横向广告或自定义 HTML。每个功能块可独立设置位置和可见用户组。',
                            m('br'),
                            '用户组: 1=游客, 2=会员, 3=管理员, 4=版主。管理员默认可见所有内容。',
                        ]),
                    ]),

                    // 工具块列表
                    this.blocks.map((block, i) =>
                        m(ToolBlockEditor, {
                            key: i,
                            block,
                            index: i,
                            isFirst: i === 0,
                            isLast: i === this.blocks.length - 1,
                            onUpdate: () => { this.dirty = true; m.redraw(); },
                            onRemove: () => { this.blocks.splice(i, 1); this.dirty = true; },
                            onMoveUp: () => {
                                if (i > 0) {
                                    [this.blocks[i - 1], this.blocks[i]] = [this.blocks[i], this.blocks[i - 1]];
                                    this.dirty = true;
                                }
                            },
                            onMoveDown: () => {
                                if (i < this.blocks.length - 1) {
                                    [this.blocks[i], this.blocks[i + 1]] = [this.blocks[i + 1], this.blocks[i]];
                                    this.dirty = true;
                                }
                            },
                        })
                    ),

                    // 添加新块按钮
                    m('div', { style: 'display: flex; gap: 8px; margin: 16px 0;' }, [
                        m(Button, {
                            className: 'Button Button--primary',
                            onclick: () => { this.blocks.push(emptyBlock('carousel')); this.dirty = true; }
                        }, [m('i.fas.fa-images'), ' 添加轮播图']),
                        m(Button, {
                            className: 'Button',
                            onclick: () => { this.blocks.push(emptyBlock('scroll-ad')); this.dirty = true; }
                        }, [m('i.fas.fa-ad'), ' 添加广告']),
                        m(Button, {
                            className: 'Button',
                            onclick: () => { this.blocks.push(emptyBlock('custom')); this.dirty = true; }
                        }, [m('i.fas.fa-code'), ' 添加自定义 HTML']),
                    ]),

                    // 保存按钮
                    m('div.Form-group', { style: 'margin-top: 20px;' }, [
                        m(Button, {
                            className: 'Button Button--primary',
                            loading: this.loading,
                            disabled: !this.dirty,
                            onclick: () => this.saveSettings()
                        }, this.dirty ? '保存配置*' : '保存配置'),
                    ]),

                    // 预览 JSON
                    m('details', { style: 'margin-top: 16px;' }, [
                        m('summary', { style: 'cursor: pointer; color: #888; font-size: 13px;' }, '查看原始 JSON'),
                        m('pre', {
                            style: 'background: #f5f5f5; padding: 12px; border-radius: 6px; font-size: 12px; overflow-x: auto; margin-top: 8px;'
                        }, JSON.stringify(this.blocks, null, 2)),
                    ]),
                ]),
            ]),
        ]);
    }

    saveSettings() {
        this.loading = true;

        app.store
            .save('settings', {
                guoge_littletools_data: JSON.stringify(this.blocks)
            })
            .then(() => {
                this.dirty = false;
                this.loading = false;
                app.alerts.show({ type: 'success' }, '配置已保存');
                m.redraw();
            })
            .catch((err) => {
                this.loading = false;
                app.alerts.show({ type: 'error' }, '保存失败: ' + err.message);
                m.redraw();
            });
    }
}
