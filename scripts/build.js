const fs = require('fs')
const archiver = require('archiver')

const { minify: minifyJS } = require('terser')
const { minify } = require('html-minifier-terser')

;(async () => {
    // remove folders
    try {
        fs.rmSync('./build', { recursive: true })
        fs.rmSync('./dist', { recursive: true })
    } catch (e) {} // that's okay

    // create folders
    fs.mkdirSync('./build')
    fs.mkdirSync('./dist')
    fs.mkdirSync('./dist/testing')
    fs.mkdirSync('./dist/assets')
    fs.mkdirSync('./dist/assets/img')
    fs.mkdirSync('./dist/assets/css')
    fs.mkdirSync('./dist/assets/js')
    fs.mkdirSync('./dist/assets/js/lib')

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

            console.info(`✅ Builded ${file}`)
        } else if (file != 'assets' && fs.statSync(`./src/${file}`).isDirectory()) {
            fs.readdirSync(`./src/${file}`).forEach(async deepfile => {
                if (deepfile.endsWith('.html')) {
                    const html = fs.readFileSync(`./src/${file}/${deepfile}`, 'utf8')
        
                    const minified = await minify(html, {
                        sortClassName: true,
                        sortAttributes: true,
                        collapseWhitespace: true,
                        removeComments: true,
                        minifyCSS: true,
                        minifyJS: true
                    })
        
                    fs.writeFileSync(`./dist/${file}/${deepfile}`, minified)

                    console.info(`✅ Builded ${file}/${deepfile}`)
                } else {
                    console.info(`⏩ Skipping ${file}/${deepfile}`)
                }
            })
        } else if (file != 'assets') {
            console.info(`⏩ Skipping ${file}`)
        }
    })

    // assets minify
    fs.readdirSync('./src/assets/img').forEach(async file => {
        fs.copyFileSync(`./src/assets/img/${file}`, `./dist/assets/img/${file}`)
        console.info(`✅ Builded assets/img/${file}`)
    })

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

            console.info(`✅ Builded assets/css/${file}`)
        } else {
            console.info(`⏩ Skipping assets/css/${file}`)
        }
    })

    fs.readdirSync('./src/assets/js').forEach(async file => {
        if (file.endsWith('.js')) {
            const js = fs.readFileSync(`./src/assets/js/${file}`, 'utf8')

            const minified = await minifyJS(js, {
                module: true,
                sourceMap: true
            })

            fs.writeFileSync(`./dist/assets/js/${file}`, minified.code)
            fs.writeFileSync(`./dist/assets/js/${file}.map`, minified.map)

            console.info(`✅ Builded assets/js/${file}`)
        } else if (fs.statSync(`./src/assets/js/${file}`).isDirectory()) {
            fs.readdirSync(`./src/assets/js/${file}`).forEach(async deepfile => {
                if (deepfile.endsWith('.js')) {
                    const js = fs.readFileSync(`./src/assets/js/${file}/${deepfile}`, 'utf8')

                    const minified = await minifyJS(js, {
                        module: true,
                        sourceMap: true
                    })
        
                    fs.writeFileSync(`./dist/assets/js/${file}/${deepfile}`, minified.code)
                    fs.writeFileSync(`./dist/assets/js/${file}/${deepfile}.map`, minified.map)

                    console.info(`✅ Builded assets/js/${file}/${deepfile}`)
                } else {
                    console.info(`⏩ Skipping assets/js/${file}/${deepfile}`)
                }
            })
        } else {
            console.info(`⏩ Skipping assets/js/${file}`)
        }
    })

    // zip dist file
    const archive = archiver('zip', {
        zlib: { level: 9 }
    })

    archive.directory('dist/', false)
    archive.pipe(output)
    await archive.finalize()

    console.info(`✅ Successfully built!`)

    // clean-up
    fs.rmSync('./dist', { recursive: true })
})()
