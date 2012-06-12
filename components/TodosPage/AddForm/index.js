﻿"use strict";

var Presenter = require("WinningJS/lib/ui/Presenter");
var template = require("./template.jade");
var AddFormViewModel = require("./ViewModel");
var makeEmitter = require("pubit").makeEmitter;

module.exports = function TodosPageAddForm(todos) {
    var that = this;

    var publish = makeEmitter(that, ["add"]);
    var presenter = new Presenter({
        template: template,
        viewModel: new AddFormViewModel(todos)
    });

    presenter.element.then(function (element) {
        var input = element.querySelector("input");
        input.focus();
    });

    that.render = presenter.process;
};
