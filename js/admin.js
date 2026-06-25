import app from 'flarum/admin/app';
import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import Button from 'flarum/common/components/Button';
import Select from 'flarum/common/components/Select';
import { t } from './src/locale';

// --- 常量 ---
const GROUP_OPTIONS = [
    { id: 1, label: t('guest') },
    { id: 2, label: t('member') },
    { id: 3, label: t('admin') },
    { id: 4, label: t('moderator') },
];

const LOCATION_PRESETS = [
    { value: 'home_top', label: t('homeTop') },
    { value: 'discussion_top', label: t('discussionTop') },
    { value: '', label: t('customCss') },
];

const TYPE_OPTIONS = [
    { value: 'carousel', label: t('carouselType') },
    { value: 'scroll-ad', label: t('scrollAdType') },
    { value: 'custom', label: t('customHtmlType') },
];

function emptyBlock(type = 'carousel') {
    if (type === 'custom') {
        return { type, location: 'home_top', groups: [1, 2], content: '' };
    }
    return { type, location: 'home_top', groups: [1, 2], content: [{ image: '', link: '' }] };
}

// --- 表单校验 ---
function validate(blocks) {
    const errors = [];
    blocks.forEach((block, bi) => {
        if (block.type === 'custom') {
            if (!block.content || !block.content.trim()) {
                errors.push(t('emptyHtml'));
            }
        } else {
            (block.content || []).forEach((item, ii) => {
                if (!item.image || !item.image.trim()) {
                    errors.push(t('emptyImageUrl', { n: ii + 1 }));
                }
            });
        }
        if (!block.groups || block.groups.length === 0) {
            errors.push(t('noGroup'));
        }
    });
    return errors;
}

// --- 工具块预览组件 ---
class ToolBlockPreview {
    view(vnode) {
        const { block } = vnode.attrs;
        if (block.type === 'carousel') {
            const slides = (block.content || []).filter(s => s.image);
            if (!slides.length) return m('div', { style: 'color:#999;font-size:13px;' }, '暂无图片');
            return m('div', { style: 'display:flex;gap:8px;overflow-x:auto;padding:8px 0;' },
                slides.map(s =>
                    m('div', { style: 'flex-shrink:0;' },
                        m('img', {
                            src: s.image, alt: '',
                            style: 'height:80px;border-radius:4px;object-fit:cover;',
                            onerror: (e) => { e.target.style.display = 'none'; }
                        })
                    )
                )
            );
        }
        if (block.type === 'scroll-ad') {
            const items = (block.content || []).filter(s => s.image);
            if (!items.length) return m('div', { style: 'color:#999;font-size:13px;' }, '暂无图片');
            return m('div', { style: 'display:flex;gap:8px;overflow-x:auto;padding:8px 0;' },
                items.map(s =>
                    m('img', {
                        src: s.image, alt: '',
                        style: 'height:50px;border-radius:4px;flex-shrink:0;',
                        onerror: (e) => { e.target.style.display = 'none'; }
                    })
                )
            );
        }
        if (block.type === 'custom') {
            return m('div', {
                style: 'border:1px dashed #ddd;border-radius:4px;padding:12px;max-height:150px;overflow:auto;background:#fafafa;',
            }, block.content ? m.trust(block.content) : m('span', { style: 'color:#999;' }, '暂无内容'));
        }
        return null;
    }
}

// --- 工具块编辑器 ---
class ToolBlockEditor {
    view(vnode) {
        const { block, index, onUpdate, onRemove, onMoveUp, onMoveDown, isFirst, isLast, showPreview } = vnode.attrs;
        const typeLabel = TYPE_OPTIONS.find(t => t.value === block.type)?.label || block.type;

        return m('div.ToolBlock', {
            style: 'border:1px solid #ddd;border-radius:8px;padding:16px;margin-bottom:12px;background:#fff;'
        }, [
            // 头部
            m('div', { style: 'display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;' }, [
                m('span', { style: 'font-weight:bold;font-size:14px;color:#e74c3c;' }, `#${index + 1} ${typeLabel}`),
                m('div', { style: 'display:flex;gap:6px;' }, [
                    !isFirst && m(Button, { className: 'Button Button--icon', icon: 'fas fa-arrow-up', onclick: onMoveUp, title: t('moveUp') }),
                    !isLast && m(Button, { className: 'Button Button--icon', icon: 'fas fa-arrow-down', onclick: onMoveDown, title: t('moveDown') }),
                    m(Button, { className: 'Button Button--icon Button--danger', icon: 'fas fa-times', onclick: onRemove, title: t('delete') }),
                ]),
            ]),

            // 类型
            m('div.Form-group', [
                m('label', t('type')),
                m(Select, {
                    value: block.type,
                    options: TYPE_OPTIONS.map(t => ({ value: t.value, label: t.label })),
                    onchange: (val) => {
                        block.type = val;
                        if (val === 'custom' && Array.isArray(block.content)) block.content = '';
                        else if (val !== 'custom' && typeof block.content === 'string') block.content = [{ image: '', link: '' }];
                        onUpdate();
                    }
                }),
            ]),

            // 位置
            m('div.Form-group', [
                m('label', t('location')),
                m(Select, {
                    value: LOCATION_PRESETS.some(p => p.value === block.location && p.value !== '') ? block.location : '',
                    options: LOCATION_PRESETS.map(p => ({ value: p.value, label: p.label })),
                    onchange: (val) => { if (val !== '') block.location = val; onUpdate(); }
                }),
                !LOCATION_PRESETS.some(p => p.value === block.location && p.value !== '') &&
                    m('input.FormControl', {
                        type: 'text', placeholder: t('cssPlaceholder'),
                        value: block.location,
                        oninput: (e) => { block.location = e.target.value; onUpdate(); },
                        style: 'margin-top:6px;'
                    }),
            ]),

            // 用户组
            m('div.Form-group', [
                m('label', t('groups')),
                m('div', { style: 'display:flex;gap:12px;flex-wrap:wrap;' },
                    GROUP_OPTIONS.map(g =>
                        m('label', { style: 'display:flex;align-items:center;gap:4px;cursor:pointer;' }, [
                            m('input', {
                                type: 'checkbox',
                                checked: block.groups.includes(g.id),
                                onchange: (e) => {
                                    if (e.target.checked) { if (!block.groups.includes(g.id)) block.groups.push(g.id); }
                                    else { block.groups = block.groups.filter(id => id !== g.id); }
                                    onUpdate();
                                }
                            }),
                            g.label,
                        ])
                    )
                ),
            ]),

            // 内容
            block.type === 'custom'
                ? [
                    // 安全警告
                    m('div', {
                        style: 'background:#fff3cd;border:1px solid #ffc107;border-radius:4px;padding:8px 12px;margin-bottom:8px;font-size:13px;color:#856404;'
                    }, t('securityWarning')),
                    m('div.Form-group', [
                        m('label', t('htmlContent')),
                        m('textarea.FormControl', {
                            rows: 6, value: block.content,
                            placeholder: t('htmlPlaceholder'),
                            oninput: (e) => { block.content = e.target.value; onUpdate(); }
                        }),
                    ]),
                ]
                : m('div.Form-group', [
                    m('label', t('imageList', { type: block.type === 'carousel' ? t('carouselType') : t('scrollAdType') })),
                    (block.content || []).map((item, i) =>
                        m('div', { style: 'display:flex;gap:8px;margin-bottom:8px;align-items:center;' }, [
                            m('input.FormControl', {
                                type: 'text', placeholder: t('imageUrlPlaceholder'),
                                value: item.image, style: 'flex:2;',
                                oninput: (e) => { item.image = e.target.value; onUpdate(); }
                            }),
                            m('input.FormControl', {
                                type: 'text', placeholder: t('linkPlaceholder'),
                                value: item.link, style: 'flex:2;',
                                oninput: (e) => { item.link = e.target.value; onUpdate(); }
                            }),
                            m(Button, {
                                className: 'Button Button--icon Button--danger', icon: 'fas fa-times',
                                onclick: () => { block.content.splice(i, 1); onUpdate(); }
                            }),
                        ])
                    ),
                    m(Button, {
                        className: 'Button',
                        onclick: () => { block.content.push({ image: '', link: '' }); onUpdate(); }
                    }, [m('i.fas.fa-plus'), ` ${t('addImage')}`]),
                ]),

            // 预览
            showPreview && m('div', {
                style: 'margin-top:12px;padding-top:12px;border-top:1px solid #eee;'
            }, [
                m('div', { style: 'font-size:12px;color:#888;margin-bottom:6px;' }, t('preview')),
                m(ToolBlockPreview, { block }),
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
        this.errors = [];
        this.showPreview = false;

        try {
            const raw = app.data.settings['guoge_littletools_data'];
            if (raw) this.blocks = JSON.parse(raw);
        } catch (e) {
            console.error('LittleTools: 配置解析失败', e);
        }
    }

    content() {
        return m('div.LittleTools-Page', [
            m('div.container', [
                m('div.ExtensionPage-form', [
                    // 说明
                    m('div.Form-group', [
                        m('p.helpText', [t('pageDesc'), m('br'), t('groupHint')]),
                    ]),

                    // 校验错误提示
                    this.errors.length > 0 && m('div', {
                        style: 'background:#f8d7da;border:1px solid #f5c6cb;border-radius:4px;padding:10px 14px;margin-bottom:12px;color:#721c24;'
                    }, [
                        m('strong', t('validationError')),
                        m('ul', { style: 'margin:4px 0 0 16px;' },
                            this.errors.map(err => m('li', { style: 'font-size:13px;' }, err))
                        ),
                    ]),

                    // 工具块列表
                    this.blocks.map((block, i) =>
                        m(ToolBlockEditor, {
                            key: i, block, index: i,
                            isFirst: i === 0, isLast: i === this.blocks.length - 1,
                            showPreview: this.showPreview,
                            onUpdate: () => { this.dirty = true; this.errors = []; m.redraw(); },
                            onRemove: () => { this.blocks.splice(i, 1); this.dirty = true; this.errors = []; },
                            onMoveUp: () => {
                                if (i > 0) { [this.blocks[i - 1], this.blocks[i]] = [this.blocks[i], this.blocks[i - 1]]; this.dirty = true; }
                            },
                            onMoveDown: () => {
                                if (i < this.blocks.length - 1) { [this.blocks[i], this.blocks[i + 1]] = [this.blocks[i + 1], this.blocks[i]]; this.dirty = true; }
                            },
                        })
                    ),

                    // 添加按钮
                    m('div', { style: 'display:flex;gap:8px;margin:16px 0;flex-wrap:wrap;' }, [
                        m(Button, {
                            className: 'Button Button--primary',
                            onclick: () => { this.blocks.push(emptyBlock('carousel')); this.dirty = true; }
                        }, [m('i.fas.fa-images'), ` ${t('addCarousel')}`]),
                        m(Button, {
                            className: 'Button',
                            onclick: () => { this.blocks.push(emptyBlock('scroll-ad')); this.dirty = true; }
                        }, [m('i.fas.fa-ad'), ` ${t('addAd')}`]),
                        m(Button, {
                            className: 'Button',
                            onclick: () => { this.blocks.push(emptyBlock('custom')); this.dirty = true; }
                        }, [m('i.fas.fa-code'), ` ${t('addHtml')}`]),
                    ]),

                    // 操作栏
                    m('div', { style: 'display:flex;gap:8px;align-items:center;margin-top:20px;flex-wrap:wrap;' }, [
                        // 保存
                        m(Button, {
                            className: 'Button Button--primary',
                            loading: this.loading,
                            onclick: () => this.saveSettings()
                        }, this.dirty ? t('saveDirty') : t('save')),

                        // 预览开关
                        m(Button, {
                            className: 'Button',
                            onclick: () => { this.showPreview = !this.showPreview; }
                        }, this.showPreview ? `✓ ${t('preview')}` : t('preview')),

                        // 导出
                        m(Button, {
                            className: 'Button',
                            onclick: () => this.exportConfig()
                        }, [m('i.fas.fa-download'), ` ${t('export')}`]),

                        // 导入
                        m(Button, {
                            className: 'Button',
                            onclick: () => this.importConfig()
                        }, [m('i.fas.fa-upload'), ` ${t('import')}`]),
                    ]),

                    // JSON 预览
                    m('details', { style: 'margin-top:16px;' }, [
                        m('summary', { style: 'cursor:pointer;color:#888;font-size:13px;' }, t('viewJson')),
                        m('pre', {
                            style: 'background:#f5f5f5;padding:12px;border-radius:6px;font-size:12px;overflow-x:auto;margin-top:8px;'
                        }, JSON.stringify(this.blocks, null, 2)),
                    ]),
                ]),
            ]),
        ]);
    }

    saveSettings() {
        // 校验
        const errors = validate(this.blocks);
        if (errors.length > 0) {
            this.errors = errors;
            m.redraw();
            return;
        }
        this.errors = [];
        this.loading = true;

        app.store
            .save('settings', {
                guoge_littletools_data: JSON.stringify(this.blocks)
            })
            .then(() => {
                this.dirty = false;
                this.loading = false;
                app.alerts.show({ type: 'success' }, t('saved'));
                m.redraw();
            })
            .catch((err) => {
                this.loading = false;
                app.alerts.show({ type: 'error' }, t('saveFailed', { msg: err.message }));
                m.redraw();
            });
    }

    exportConfig() {
        const json = JSON.stringify(this.blocks, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'guoge-littletools-config.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    importConfig() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    if (!Array.isArray(data)) throw new Error('Not an array');
                    this.blocks = data;
                    this.dirty = true;
                    this.errors = [];
                    app.alerts.show({ type: 'success' }, t('importSuccess'));
                    m.redraw();
                } catch (err) {
                    app.alerts.show({ type: 'error' }, t('importFailed'));
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }
}
