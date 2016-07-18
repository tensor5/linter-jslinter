# linter-jslinter - JSLint plugin for Atom Linter

This is a [JSLint][jslint] plugin for [Linter][linter] based on the
[JSLinter][jslinter] npm package.

## Installation

```sh
apm install linter-jslinter
```

In order to use linter-jslinter you need to install the [JSLinter][jslinter] npm
package, either globally (recommended) with:

```sh
npm install -g jslinter
```

or locally in the project you want to lint:

```sh
cd yourProjectDir
npm install jslinter
```

If you choose the global installation, check the `Use global JSLinter
installation` package option.

[jslint]: http://www.jslint.com/ "The JavaScript Code Quality Tool"
[jslinter]: https://www.npmjs.com/package/jslinter "JSLint for Node.js"
[linter]: https://atom.io/packages/linter "A Base Linter with Cow Powers"
