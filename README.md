# Gulpie. A front end Gulp boilerplate

## Task runners

* `gulp` starts BrowserSync and watches all files
* `gulp-build` deletes the `dist/` folder then compiles and compresses all the files

### FTP

To prevent users from saving and potentially sharing FTP credentials, they have been mapped to an environment variable. To use gulp-deploy, run the following command with your credentials in place.

`FTP_USER=username FTP_PWD=password gulp deploy`

## File structure

Add your files to the appropriate `src` subdirectories. Gulp will process and and compile them into `dist`. Scripts will be concatenated into `dist/scripts/main.js`.

HTML files created in `src/` will maintain their folder structure when copied to `dist/`.

```
gulpie/
|—— dist/
|—— src/
|   |—— images/
|   |   |—— # image files
|   |—— scripts/
|   |   |—— # Javascript files
|   |—— styles/
|   |   |—— # SCSS and/or LESS files
|—— .gitignore
|—— gulfile.js
|—— LICENSE
|—— package.json
|—— README.md
```