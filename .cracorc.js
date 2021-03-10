const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const webpack = require('webpack');

module.exports = {
    webpack: {
        plugins: [
            new webpack.ContextReplacementPlugin(
                /@babel\/standalone$/,
                (data) => {
                  delete data.dependencies[0].critical;
                  delete data.dependencies[1].critical;
                  return data;
                },
              ),
            new MonacoWebpackPlugin({
                // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
                languages: ['javascript', 'css', 'html', 'typescript', 'json']
              })
            ],
    },
    
}