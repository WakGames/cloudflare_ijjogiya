const fs = require('fs')
const archiver = require('archiver')

const { minify } = require('html-minifier-terser')
const { minify: jsMinify } = require("terser");

// create folders
try {
    fs.mkdirSync('./build')
    fs.mkdirSync('./dist')
    fs.mkdirSync('./dist/assets')
    fs.mkdirSync('./dist/assets/css')
    fs.mkdirSync('./dist/assets/img')
    fs.mkdirSync('./dist/assets/js')
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

fs.readdirSync('./src/assets/js').forEach(async file => {
    if (file.endsWith('.js')) {
        const js = fs.readFileSync(`./src/assets/js/${file}`, 'utf8')

        const minified = await jsMinify(js, {
            sourceMap: true
        })

        fs.writeFileSync(`./dist/assets/js/${file}`, minified.code)
        fs.writeFileSync(`./dist/assets/js/${file}.map`, minified.map)
    }
})

// copy images
fs.readdirSync('./src/assets/img').forEach(file => {
    fs.copyFileSync(`./src/assets/img/${file}`, `./dist/assets/img/${file}`)
})

// zip dist file
const archive = archiver('zip', {
    zlib: { level: 9 }
})

archive.directory('dist/', false)
archive.pipe(output)
archive.finalize()