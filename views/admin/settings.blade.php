<div class="container">
    <h2>Guoge Little Tools 配置</h2>
    <p>在此处配置轮播图、广告栏或自定义HTML。数据将保存为JSON格式。</p>

    <div class="Form-group">
        <label>功能配置 (JSON格式)</label>
        <p class="helpText">
            每个对象代表一个功能块。
            <br><code>type</code>: 类型 ('carousel' 轮播图, 'scroll-ad' 横向广告, 'custom' 自定义HTML)
            <br><code>location</code>: 位置 ('home_top', 'discussion_top', 或 CSS选择器如 '.IndexPage')
            <br><code>groups</code>: 可见用户组ID数组 ([1]为游客, [2]为会员, [3]为管理员等)
            <br><code>content</code>: 内容 (图片URL数组 或 HTML字符串)
        </p>
        <textarea class="FormControl" name="guoge_littletools_data" rows="20" placeholder='[
  {
    "type": "carousel",
    "location": "home_top",
    "groups": [1, 2],
    "content": [
      {"image": "图片URL1", "link": "跳转链接1"},
      {"image": "图片URL2", "link": "跳转链接2"}
    ]
  },
  {
    "type": "custom",
    "location": ".DiscussionPage",
    "groups": [3],
    "content": "<div style=\"color:red\">这是仅管理员可见的公告</div>"
  }
]'></textarea>
    </div>
</div>