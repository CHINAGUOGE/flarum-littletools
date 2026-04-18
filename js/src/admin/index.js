import app from 'flarum/admin/app';
import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import Button from 'flarum/common/components/Button';
import Stream from 'flarum/common/utils/Stream';

export default class LittleToolsPage extends ExtensionPage {
    oninit(vnode) {
        super.oninit(vnode);
        
        // 初始化表单数据
        // 我们从 app.forum.attribute 获取 PHP 传递过来的数据
        this.data = Stream(app.forum.attribute('guogeLittleToolsData') || {});
        this.loading = false;
    }

    content() {
        return (
            <div className="LittleTools-Page">
                <div className="container">
                    <div className="Page-header">
                        <h2>Guoge 小工具管理</h2>
                    </div>

                    <div className="ExtensionPage-form">
                        <div className="Form-group">
                            <label>当前配置数据 (JSON)</label>
                            <p className="helpText">这里显示并允许你编辑后台保存的配置。</p>
                            <textarea 
                                className="FormControl" 
                                rows="10"
                                value={JSON.stringify(this.data(), null, 2)}
                                oninput={(e) => {
                                    try {
                                        const json = JSON.parse(e.target.value);
                                        this.data(json);
                                    } catch (err) {
                                        // 简单的错误处理，实际开发中可显示错误提示
                                    }
                                }}
                            />
                        </div>

                        <div className="Form-group">
                            <Button 
                                className="Button Button--primary" 
                                loading={this.loading}
                                onclick={() => this.saveSettings()}
                            >
                                保存配置
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 保存逻辑
    saveSettings() {
        this.loading = true;
        
        // 将数据保存回 Flarum 的设置表
        // 注意：这里保存的是 JSON 字符串，对应 PHP 中的 'guoge_littletools_data'
        app.store
            .save('settings', {
                guoge_littletools_data: JSON.stringify(this.data())
            })
            .then(() => {
                alert('保存成功！');
                this.loading = false;
            })
            .catch((err) => {
                alert('保存失败：' + err.message);
                this.loading = false;
            });
    }
}