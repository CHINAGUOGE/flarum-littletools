<?php

namespace Guoge\LittleTools;

use Flarum\Extend;

return [
    // 1. 传递设置数据给前台
    (new Extend\Settings())
        ->serializeToForum('guogeLittleToolsData', 'guoge_littletools_data', function ($value) {
            return json_decode($value, true) ?? [];
        }),

    // 2. 加载前台脚本
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js'),

    // 3. 加载后台脚本
    (new Extend\Frontend('admin'))
        ->js(__DIR__ . '/js/dist/admin.js'),
];
