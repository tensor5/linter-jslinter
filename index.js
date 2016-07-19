/*jslint
    browser, es6
*/

/*global
    __dirname, atom, module, require
*/

/*property
    a, activate, addWarning, bind, column, config, default, description,
    detail, dirname, dismissable, encoding, execFileSync, exports, filePath,
    get, getPath, getText, grammarScopes, join, jslint, length, line, lint,
    lintOnFly, map, message, name, nodeModulesDir, notifications, project,
    provideLinter, range, readConf, relativizePath, scope, set, slice, text,
    then, title, trimRight, type, useGlobalJSLinter, warnings
*/

module.exports = {
    config: {
        useGlobalJSLinter: {
            title: "Use global JSLinter installation",
            description:
                    "Make sure the installation directory is set correctly.",
            type: "boolean",
            default: false
        },
        nodeModulesDir: {
            title: "JSLinter installation directory",
            description: "If empty, it will be initialized with the output of "
                    + "`npm root -g`.",
            type: "string",
            default: ""
        }
    },
    activate: function activate() {
        "use strict";
        if (atom.config.get("linter-jslinter.nodeModulesDir") === "") {
            const root = require("child_process")
                .execFileSync("npm", ["root", "-g"], {encoding: "utf8"})
                .trimRight();
            atom.config.set("linter-jslinter.nodeModulesDir", root);
        }
    },
    provideLinter: function provideLinter() {
        "use strict";
        const useGlobal = atom.config.get("linter-jslinter.useGlobalJSLinter");
        const path = require("path");
        let globalJSlinter;

        if (useGlobal) {
            try {
                const root = atom.config.get("linter-jslinter.nodeModulesDir");
                globalJSlinter = require(path.join(root, "jslinter"));
            } catch (e1) {
                try {
                    globalJSlinter = require("jslinter");
                } catch (e2) {
                    atom.notifications
                        .addWarning("Unable to load JSLinter", {
                            detail: e1.message + "\n" + e2.message,
                            dismissable: true
                        });
                }
            }
        }

        function outputWarning(pathname, warn) {
            const row = warn.line;
            const col = warn.column;
            const len = warn.a
                ? warn.a.length
                : 1;

            return {
                type: "Error",
                text: warn.message.slice(0, -1),  // drop trailing "."
                filePath: pathname,
                range: [[row, col], [row, col + len]]
            };
        }

        return {
            name: "JSLint",
            grammarScopes: ["source.js", "source.json"],
            scope: "file",
            lintOnFly: true,
            lint: function lint(textEditor) {
                const [projectDir] = atom.project
                    .relativizePath(textEditor.getPath());
                const jslinter = globalJSlinter || require(path.join(
                    projectDir,
                    "node_modules/jslinter"
                ));
                return jslinter
                    .readConf(
                        projectDir,
                        path.dirname(textEditor.getPath()),
                        {}
                    )
                    .then((conf) => jslinter.jslint(textEditor.getText(), conf)
                        .warnings
                        .map(outputWarning
                            .bind(undefined, textEditor.getPath())));
            }
        };
    }
};
