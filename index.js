/*jslint
    browser
*/

/*global
    atom, module, require
*/

/*property
    a, activate, addWarning, bind, column, config, default, description,
    detail, dirname, dismissable, encoding, excerpt, execFileSync, exports,
    file, get, getPath, getText, grammarScopes, join, jslint, length, line,
    lint, lintsOnChange, location, map, message, name, nodeModulesDir,
    notifications, position, project, provideLinter, readConf, relativizePath,
    scope, set, severity, slice, then, title, trimRight, type,
    useGlobalJSLinter, warnings
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
        if (atom.config.get("linter-jslinter.useGlobalJSLinter")) {
            if (atom.config.get("linter-jslinter.nodeModulesDir") === "") {
                const root = require("child_process")
                    .execFileSync("npm", ["root", "-g"], {encoding: "utf8"})
                    .trimRight();
                atom.config.set("linter-jslinter.nodeModulesDir", root);
            }
        }
    },
    provideLinter: function provideLinter() {
        "use strict";
        const useGlobal = atom.config.get("linter-jslinter.useGlobalJSLinter");
        const path = require("path");
        let globalJSlinter;
        let e1;

        if (useGlobal) {
            try {
                const root = atom.config.get("linter-jslinter.nodeModulesDir");
                globalJSlinter = require(path.join(root, "jslinter"));
            } catch (e) {
                e1 = e;
            }

            if (e1) {
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
                severity: "error",
                excerpt: warn.message.slice(0, -1),  // drop trailing "."
                location: {
                    file: pathname,
                    position: [[row, col], [row, col + len]]
                }
            };
        }

        return {
            name: "JSLint",
            grammarScopes: ["source.js", "source.js.jsx", "source.json"],
            scope: "file",
            lintsOnChange: true,
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
