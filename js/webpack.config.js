const path = require('path');

module.exports = {
    entry: {
        forum: './src/main.js',
        admin: './src/admin/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: {
            name: 'guoge-littletools',
            type: 'window'
        }
    },
    resolve: {
        extensions: ['.js'],
        alias: {
            // 关键修改：将 'flarum' 指向 node_modules 中的 flarum 包
            // 这样 import app from 'flarum/admin/app' 才能找到文件
            'flarum': path.resolve(__dirname, 'node_modules/flarum')
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            }
        ]
    }
};