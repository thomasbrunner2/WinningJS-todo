﻿"use strict";

var path = require("path");
var jade = require("jade");
var stylus = require("stylus");

var doBrowserify = require("./build/browserify");

module.exports = function (grunt) {
    // TODO: factor out this grunt task into a separate project?
    // Modularize? Basically all this code should not be in our grunt.js.

    // TODO: jQuery is making our build process take way too long (probably because it's scanning the jQuery source
    // code for `require`s). Unacceptable; this is JavaScript not C++.

    function urlize(path) {
        return "/" + path.replace(/\\/g, "/");
    }

    function buildStylus(source, dest) {
        var files = grunt.file.expandFiles(source);
        var newFileUrls = [];
        files.forEach(function (fileName) {
            var str = grunt.file.read(fileName);
            var newFileName = fileName.match(/(.*).styl/)[1] + ".css";
            var newFilePath = path.join(dest, newFileName);
            stylus.render(str, { filename: newFileName }, function (err, css) {
                if (err) {
                    grunt.warn(err.message);
                } else {
                    grunt.file.write(newFilePath, css);
                    grunt.log.writeln("File \"" + newFilePath + "\" created.");

                    newFileUrls.push(urlize(newFilePath));
                }
            });
        });

        return newFileUrls;
    }

    function writeIndex(src, dest, jadeLocals) {
        var jadeFile = grunt.file.read(src);
        var templateFunction = jade.compile(jadeFile, { filename: src, compileDebug: false, pretty: true });
        var indexHtml = templateFunction(jadeLocals);
        grunt.file.write(dest, indexHtml);
        grunt.log.writeln("File \"" + dest + "\" created");
    }

    grunt.registerTask("buildIndex", "Browserify modules, compile Stylus, and build an index.html.", function () {
        var browserifyConfig = grunt.config("buildIndex.browserify");
        var scripts = doBrowserify(grunt, __dirname, browserifyConfig);

        var stylusConfig = grunt.config("buildIndex.stylus");
        var styles = buildStylus(stylusConfig.src, stylusConfig.dest);

        var indexConfig = grunt.config("buildIndex");
        indexConfig.src = indexConfig.src ? path.normalize(indexConfig.src) : "index.jade";
        indexConfig.dest = indexConfig.dest ? path.normalize(indexConfig.dest) : "index.html";

        writeIndex(indexConfig.src, indexConfig.dest, {
            scripts: scripts,
            styles: styles,
            entryModule: browserifyConfig.entry
        });
    });

    grunt.initConfig({
        lint: {
            all: ["lib/**/*.js"]
        },
        buildIndex: {
            dest: "out/index.html",
            browserify: {
                entry: "lib/start",
                dest: "out/browserified",
                aliases: {
                    "jquery": "jquery-browserify"
                }
            },
            stylus: {
                src: ["**/*.styl"],
                dest: "out/css"
            }
        }
    });

    grunt.registerTask("default", "buildIndex");
};
