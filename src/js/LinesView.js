'use strict'

export function LinesView() {
	var self = this;
	var activeModel = null;

	var clickAudio;
	var clickAudio2;
	var loadImg;
	var loadImg2;

	var svgW;
	self.cellW;
	self.ballR;
	var groupID = 'innerGroup';
	var cellID = 'cell';
	var ballID = 'ball';
	self.ballMovingSpeed;
	self.centerPointsArray = [];//save center points coordinate of cells
	self.playerName;

	var recordsTableArray;//из Model подгружается по надобности
	var cellsNum;
	var totalCellsNum;
	var ballMatrix;
	var ballColorMatrix;
	var gameBallColors;
	var currentScore;
	var newBallsArray = [];
	var newBallsRadiusArray = [];

	//находим поле, с которым работаем
	var svgElem = document.getElementById('playfield');
	var nameSpace = 'http://www.w3.org/2000/svg';
	var linkNS = 'http://www.w3.org/1999/xlink';
	svgElem.setAttribute('xmlns', nameSpace);
	svgElem.setAttribute('xmlns:xlink', linkNS);

	//подгружаем img/audio
	function loadMultimedia() {
		clickAudio = new Audio("sounds/bensound-theelevatorbossanova.mp3");
		clickAudio2 = new Audio("sounds/ice-block-drop-02.mp3");
		loadImg = new Image("img/BUTTON-sound-on.png");
		loadImg2 = new Image("img/BUTTON-sound-off.png");
	}
	loadMultimedia()

	self.bindModel = function (model) {
		activeModel = model;
	}
	self.updateRecordsTableDOM = function () {
		recordsTableArray = activeModel.recordsTableArray;
		var updInnerHtml = '';
		for (var i = 0; i < 10; i++) {
			updInnerHtml += recordsTableArray[i][0] + ' ' + recordsTableArray[i][1] + '<br>'
		}
		var elem = document.getElementById('insertupdatedrecords');
		elem.innerHTML = updInnerHtml;
		var elem2 = document.getElementById('inserthighscore');
		elem2.innerHTML = recordsTableArray[0][0];
	}
	//сработает при изменении размеров экрана
	self.resizeField = function () {
		cellsNum = activeModel.cellsNum;
		totalCellsNum = activeModel.totalCellsNum;
		ballMatrix = activeModel.ballMatrix
		ballColorMatrix = activeModel.ballColorMatrix;
		self.createPlayField();
		self.deleteAllBalls();
		self.placeSavedBalls();
	}
	//ф-я рисуем поле
	self.createPlayField = function () {
		getActualData();
		//cellsNum = getSettingsValues('cellsnumber');
		//numOfColors = getSettingsValues('colorsnumber');
		//deleteMinimum = getSettingsValues('minimumremoval');

		//cell pattern (symbol)
		//заменить старый паттерн на новый
		var cellElem = document.getElementById(cellID);
		var cellElemNew = document.createElementNS(nameSpace, 'symbol');
		if (cellElem) {
			svgElem.replaceChild(cellElemNew, cellElem);
		}
		else {
			svgElem.appendChild(cellElemNew);
		}
		cellElemNew.setAttribute('id', cellID);
		var rectElem = document.createElementNS(nameSpace, 'rect');
		rectElem.setAttribute('x', 0);
		rectElem.setAttribute('y', 0);
		rectElem.setAttribute('width', self.cellW);
		rectElem.setAttribute('height', self.cellW);
		rectElem.setAttribute('fill', '#BFB2A3');
		cellElemNew.appendChild(rectElem);
		var rectElem2 = document.createElementNS(nameSpace, 'rect');
		rectElem2.setAttribute('x', self.cellW * 0.05);
		rectElem2.setAttribute('y', self.cellW * 0.05);
		rectElem2.setAttribute('width', self.cellW * 0.9);
		rectElem2.setAttribute('height', self.cellW * 0.9);
		rectElem2.setAttribute('fill', '#D9D0C1');
		cellElemNew.appendChild(rectElem2);
		//playfield creation (group)
		//заменить старую группу клеток на новую
		var groupElem = document.getElementById(groupID);
		var groupElemNew = document.createElementNS(nameSpace, 'g');
		if (groupElem) {
			svgElem.replaceChild(groupElemNew, groupElem);
		}
		else {
			svgElem.appendChild(groupElemNew);
		}
		groupElemNew.setAttribute('id', groupID);
		var bgElem = document.createElementNS(nameSpace, 'rect');
		bgElem.setAttribute('x', 0);
		bgElem.setAttribute('y', 0);
		bgElem.setAttribute('width', svgW);
		bgElem.setAttribute('height', svgW);
		bgElem.setAttribute('fill', '#D9D0C1');
		groupElemNew.appendChild(bgElem);
		//размещаем клетки и запоминаем центры
		var coorX = 0;
		var coorY = 0;
		self.centerPointsArray = [];
		var centerPointX;
		var centerPointY;
		for (var i = 0; i < cellsNum; i++) {
			self.centerPointsArray[i] = [];
			for (var j = 0; j < cellsNum; j++) {
				coorY = self.cellW * i;
				coorX = self.cellW * j;
				groupElemNew.insertAdjacentHTML('beforeend', '<use xlink:href="#cell" x=' + coorX + ' y=' + coorY + ' />');
				self.centerPointsArray[i][j] = [];
				centerPointX = coorX + self.cellW / 2;
				centerPointY = coorY + self.cellW / 2;
				self.centerPointsArray[i][j][0] = centerPointX;
				self.centerPointsArray[i][j][1] = centerPointY;
			}
		}
	}
	//ф-я получить актуальные размеры поля и пересчитать значения нужных переменных
	function getActualData() {
		cellsNum = activeModel.cellsNum;
		svgW = svgElem.getBoundingClientRect().width;
		self.cellW = svgW / cellsNum;
		self.ballR = self.cellW * 0.35;
		self.ballMovingSpeed = svgW * 0.02;
		self.updateModel();
	}
	//ф-я удаляем все шары с поля
	self.deleteAllBalls = function () {
		var allBalls = document.getElementsByClassName('ball');//коллекция динамическая, поэтому проверяем нулевой элемент, чтобы удалить все
		while (allBalls[0]) {
			allBalls[0].parentNode.removeChild(allBalls[0]);
		}
	}
	//ф-я размещаем шары в cохраненное положение
	self.placeSavedBalls = function () {
		if (ballMatrix.length !== 0) {
			for (var i = 0; i < cellsNum; i++) {
				for (var j = 0; j < cellsNum; j++) {
					if (ballMatrix[i][j]) {
						var id = '' + i + '-' + j;
						createBall(ballColorMatrix[i][j], self.centerPointsArray[i][j][0], self.centerPointsArray[i][j][1], self.ballR, id);
					}
				}
			}
		}
	}
	//ф-я создаем и размещаем шары  - для использования без анимации
	function createBall(color, cx, cy, r, id) {
		var circleElem = document.createElementNS(nameSpace, 'circle');
		circleElem.setAttribute('cx', cx);
		circleElem.setAttribute('cy', cy);
		circleElem.setAttribute('r', r);
		circleElem.setAttribute('fill', color);
		circleElem.setAttribute('class', 'ball');
		circleElem.setAttribute('id', id);//номер строки + номер столбца
		svgElem.appendChild(circleElem);
	}
	//по кнопке старт начинаем игру
	self.start = function () {
		gameBallColors = activeModel.gameBallColors;
		ballMatrix = activeModel.ballMatrix
		ballColorMatrix = activeModel.ballColorMatrix;
		currentScore = activeModel.currentScore;
		cellsNum = activeModel.cellsNum;
		totalCellsNum = activeModel.totalCellsNum;
		//clickSoundInit();
		startGame();
	}
	//ф-я инициируем звуки
	function clickSoundInit() {
		clickAudio.play(); // запускаем звук
		clickAudio.pause(); // и сразу останавливаем
		clickAudio2.play(); // запускаем звук
		clickAudio2.pause();// и сразу останавливаем
	}
	//ф-я начинаем игру
	function startGame() {
		//удаляем все шары c поля, так как игра начинается заново
		self.deleteAllBalls();
		//убираем поле gameover, если игрок не хочет запоминать результаты только что сыгранной игры
		var block = document.getElementById('gameovershow');
		if (block) {
			block.setAttribute('id', 'gameover');
		}
	}
	//ф-я обновить текущий счет
	self.updateCurrentScore = function (currentScore) {
		var scoreElem = document.getElementById('insertscore');
		scoreElem.textContent = currentScore;
	}
	//ф-я создаем и размещаем шары - для использования с анимацией
	self.createBallAnim = function (color, cx, cy, r, id) {
		var circleElem = document.createElementNS(nameSpace, 'circle');
		circleElem.setAttribute('cx', cx);
		circleElem.setAttribute('cy', cy);
		circleElem.setAttribute('fill', color);
		circleElem.setAttribute('class', 'ball');
		circleElem.setAttribute('id', id);//номер строки + номер столбца
		svgElem.appendChild(circleElem);
		activeModel.newBallsArray.push(circleElem);
		activeModel.newBallsRadiusArray.push(0);////
		newBallsArray = activeModel.newBallsArray;
		newBallsRadiusArray = activeModel.newBallsRadiusArray;
	}
	//ф-я appendChild
	self.appendElem = function (elem) {
		svgElem.appendChild(elem)
	}
	//ф-я removeChild
	self.removeElem = function (elem) {
		elem.parentNode.removeChild(elem)
	}
	//ф-я установить cy для шара
	self.setCY = function (elem, cy) {
		elem.setAttribute('cy', cy);
	}
	//ф-я установить cx для шара
	self.setCX = function (elem, cx) {
		elem.setAttribute('cx', cx);
	}
	//ф-я получить cy шара
	self.getCY = function (elem) {
		var elemCY = parseInt(elem.getAttribute('cy'));
		return elemCY;
	}
	//ф-я получить cx шара
	self.getCX = function (elem) {
		var elemCX = parseInt(elem.getAttribute('cx'));
		return elemCX;
	}
	//ф-я получить r шара
	self.setR = function (elem, r) {
		elem.setAttribute('r', r);
	}
	//ф-я установить r шара
	self.updateBallRadius = function (element, r) {
		element.setAttribute('r', r);
	}
	//ф-я вызов звука при нажатии на шар
	self.clickBallSound = function () {
		clickAudio2.currentTime = 0;
		clickAudio2.play(); // запускаем звук
	}
	//ф-я вибрация при касании шара
	self.vibro = function () {
		if (navigator.vibrate) { // есть поддержка Vibration API
			window.navigator.vibrate(50); // вибрация 100мс
		}
	}
	self.updateModel = function () {
		if (activeModel) {
			activeModel.updateModel();
		}
	}
	//ф-я сообщение об окончании игры
	self.showGameOver = function () {
		var elemScore = document.getElementById('insertgameoverscore');
		elemScore.textContent = 'YOUR SCORE ' + activeModel.currentScore;
		var block = document.getElementById('gameover');
		block.setAttribute('id', 'gameovershow');
	}
	//закрыть окно gameover 		
	self.closeGameOver = function () {
		var block = document.getElementById('gameovershow');
		if (block) {
			block.setAttribute('id', 'gameover');
			self.playerName = escapeHTML(document.getElementById('playername').value);
			self.updateModel();
			activeModel.updateRecordsTableServer();
			//по таймеру, так как не успевает записаться сразу
			setTimeout(activeModel.updateRecordsTableDOM, 500);
			//закомментировать нижние 4, если нужно, чтобы после go не очищалось поле	
			self.deleteAllBalls();
			activeModel.clearArrForNewGame();
			self.updateCurrentScore(0);
			self.createPlayField();
		}
	}

	//ф-я проверки введенного текста
	function escapeHTML(text) {
		if (!text) {
			return text;
		}
		text = text.toString()
			.split("&").join("&amp;")
			.split("<").join("&lt;")
			.split(">").join("&gt;")
			.split('"').join("&quot;")
			.split("'").join("&#039;");
		return text;
	}
	self.showHighScore = function () {
		//закрыть любое другое окно при нажатии кнопки
		var check = document.getElementById('customsettingsshow');
		if (check) {
			activeModel.getSettings();
		}
		var block = document.getElementById('highscore');
		if (block) {
			block.setAttribute('id', 'highscoreshow');
		}
	}
	self.closeHighScore = function () {
		var block = document.getElementById('highscoreshow');
		if (block) {
			block.setAttribute('id', 'highscore');
		}
	}
	self.undo = function () {
		//закрыть любое другое окно при нажатии кнопки
		var check1 = document.getElementById('customsettingsshow');
		if (check1) {
			self.closeCustomSettings();
		}
		var check2 = document.getElementById('highscoreshow');
		if (check2) {
			self.closeHighScore();
		}
		activeModel.undoStep();
	}
	self.showCustomSettings = function () {
		//закрыть любое другое окно при нажатии кнопки
		var check = document.getElementById('highscoreshow');
		if (check) {
			self.closeHighScore();
		}
		var block = document.getElementById('customsettings');
		if (block) {
			block.setAttribute('id', 'customsettingsshow');
		}
	}
	self.getSettingsValues = function (elemName) {
		var value;
		var elemArray = document.getElementsByName(elemName);
		for (var i = 0; i < elemArray.length; i++) {
			if (elemArray[i].checked)
				value = elemArray[i].value;
		}
		return value;
	}
	self.setSettingsValues = function (elemName, num) {
		var elemArray = document.getElementsByName(elemName);
		for (var i = 0; i < elemArray.length; i++) {
			if (elemArray[i].value == num)
				elemArray[i].checked = true;
		}
	}
	self.closeCustomSettings = function () {
		var block = document.getElementById('customsettingsshow');
		if (block) {
			block.setAttribute('id', 'customsettings');
		}
	}
	self.changeAudio = function () {
		var imgElem = document.getElementById('audioimg');
		var imgElemSrc = imgElem.src;
		console.log(imgElemSrc)
		if (imgElemSrc == "https://yavi-modern-lines.web.app/img/BUTTON-sound-off.png" 
				|| imgElemSrc == "http://localhost:8080/img/BUTTON-sound-off.png"
				|| imgElemSrc == "img/BUTTON-sound-off.png") {
			imgElem.src = "img/BUTTON-sound-on.png";
			clickAudio.currentTime = 0;
			clickAudio.play();
		}
		else {
			imgElem.src = "img/BUTTON-sound-off.png";
			clickAudio.pause();
		}
	}
}