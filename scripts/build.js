const fs = require('fs')
const archiver = require('archiver')

const { minify } = require('html-minifier-terser')

;(async () => {
    // remove folders
    try {
        fs.rmSync('./build', { recursive: true })
        fs.rmSync('./dist', { recursive: true })
    } catch (e) {
        if (e.errno !== -4058) {
            throw e
        }
    }

    // create folders
    try {
        fs.mkdirSync('./build')
        fs.mkdirSync('./dist')
        fs.mkdirSync('./dist/assets')
        fs.mkdirSync('./dist/assets/css')
    } catch (e) {
        if (e.errno !== -4075) {
            throw e
        }
    }

    // initialize zip file
    const output = fs.createWriteStream('./build/ijjogiya-dist.zip')

    // html minify
    fs.readdirSync('./src').forEach(async file => {
        if (file.endsWith('.html')) {
            const html = fs.readFileSync(`./src/${file}`, 'utf8')

            const minified = await minify(html, {
                sortClassName: true,
                sortAttributes: true,
                collapseWhitespace: true,
                removeComments: true,
                minifyCSS: true,
                minifyJS: true
            })

            fs.writeFileSync(`./dist/${file}`, minified)
        }
    })

    // assets minify
    fs.readdirSync('./src/assets/css').forEach(async file => {
        if (file.endsWith('.css')) {
            const css = fs.readFileSync(`./src/assets/css/${file}`, 'utf8')

            const minified = await minify(css, {
                removeAttributeQuotes: true,
                collapseWhitespace: true,
                removeComments: true,
                minifyCSS: true,
                minifyJS: true
            })

            fs.writeFileSync(`./dist/assets/css/${file}`, minified)
        }
    })

    // zip dist file
    const archive = archiver('zip', {
        zlib: { level: 9 }
    })

    archive.directory('dist/', false)
    archive.pipe(output)
    await archive.finalize()

    // clean-up
    fs.rmSync('./dist', { recursive: true })
})()
