const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./common');

module.exports = merge(common, {
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.(s[ac]ss|css)$/,
                use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
            },
        ],
    },
    devtool: 'eval-cheap-source-map',
    devServer: {
        compress: true,
        historyApiFallback: true,
        hot: true,
        open: true,
        port: 3000,
        clientLogLevel: 'silent'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
});
