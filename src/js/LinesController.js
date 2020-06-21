'use strict'

export function LinesController() {
	var self = this;
	var activeModel = null;
	var activeField = null;

	self.bindModelAndField = function (model, field) {
		activeModel = model;
		activeField = field;
		window.addEventListener('resize', self.resizeInit);
		window.addEventListener('hashchange', self.hashchanged);
		var startBtn = document.getElementById('startBtn');
		startBtn.addEventListener('click', self.start);
		var showHSBtn = document.getElementById('openhighscore');
		showHSBtn.addEventListener('click', self.showHighScore);
		showHSBtn.addEventListener('touchstart', self.showHighScore);
		var closeHSBtn = document.getElementById('closehighscore');
		closeHSBtn.addEventListener('click', self.closeHighScore);
		closeHSBtn.addEventListener('touchstart', self.closeHighScore);
		var undoBtn = document.getElementById('undo');
		undoBtn.addEventListener('click', self.undo);
		undoBtn.addEventListener('touchstart', self.undo);
		var showCSBtn = document.getElementById('opencustomsettings');
		showCSBtn.addEventListener('click', self.showSettings);
		showCSBtn.addEventListener('touchstart', self.showSettings);
		var getSettingsBtn = document.getElementById('getcustomsettings');
		getSettingsBtn.addEventListener('click', self.getSettings);
		getSettingsBtn.addEventListener('touchstart', self.getSettings);
		var audioBtn = document.getElementById('audiobutton');
		audioBtn.addEventListener('click', self.changeAudio);
		//слушаем клик по полю
		field.addEventListener('click', self.elemClick);
		window.addEventListener('beforeunload', self.befUnload);
		document.addEventListener('touchstart', self.tStart);
		document.addEventListener('touchend', self.tEnd);
		var gameoverBtn = document.getElementById('okgameover');
		gameoverBtn.addEventListener('click', self.closeGameOver);
		gameoverBtn.addEventListener('touchstart', self.closeGameOver);
	}
	var x;
	self.hashchanged = function (EO) {
		activeModel.hashchanged();
	};
	self.resizeInit = function () {
		activeModel.resizeInit();
	};
	self.start = function () {
		activeModel.start();
	};
	self.showHighScore = function () {
		activeModel.switchToState("HighScore");
	};
	self.closeHighScore = function () {
		activeModel.switchToState("Game");
	};
	self.undo = function () {
		activeModel.undo();
	};
	self.showSettings = function () {
		activeModel.switchToState("CustomSettings");
	};
	self.getSettings = function () {
		activeModel.switchToState("Game");
	};
	self.changeAudio = function () {
		activeModel.changeAudio();
	};
	self.elemClick = function (EO) {
		activeModel.elemClick(EO);
	};
	self.befUnload = function (EO) {
		activeModel.befUnload(EO);
	};
	self.tStart = function (EO) {
		activeModel.tStart(EO);
	};
	self.tEnd = function (EO) {
		activeModel.tEnd(EO);
	};
	self.closeGameOver = function () {
		activeModel.switchToState("Game");
	};
};