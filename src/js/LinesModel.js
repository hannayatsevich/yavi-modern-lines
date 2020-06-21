'use strict'

export function LinesModel(cellsNum, numOfColors, newBallsNumber, deleteMinimum) {
	var self = this;
	var activeView = null;

	self.cellsNum = cellsNum;
	self.numOfColors = numOfColors;//количество цветов, с которыми будем работать
	self.newBallsNumber = newBallsNumber;
	self.deleteMinimum = deleteMinimum;
	self.totalCellsNum = cellsNum * cellsNum;
	//self.ballColors = ['#81BF63', '#F29B30', '#BF0426', '#4AA2D9', '#FAE71B', '#023859', '#96D9C6', '#038C4C', '#1F818C', '#F5A28B'];
	self.ballColors = ['#81BF63', '#F29B30', '#BF0426', '#1F818C', '#FAE71B', '#023859', '#4AA2D9', '#038C4C', '#c154c1', '#d36d51'];
	self.gameBallColors = [];//цвета, с которыми будем работать в конкретной игре
	self.ballMatrix = [];//массив с информацией, есть ли шар в клетке
	self.ballColorMatrix = [];//массив с информацией, какого цвета шар в клетке
	self.currentScore = 0;
	var lastStepScore;

	var saveModel = { "ballMatrix": 0, "ballColorMatrix": 0, "numOfColors": 0, "deleteMinimum": 0, "cellsNum": 0, "currentScore": 0, "gameBallColors": 0 };
	self.ballChosen;//последний выбранный шар
	self.newBallsArray = [];
	self.newBallsRadiusArray = [];
	self.deleteBallsArray = [];
	self.deleteBallsRadiusArray = [];

	var ballJumpTimer = 0;//таймер движения шара при клике
	var ballAppearanceTimer = 0;
	var ballDeleteTimer = 0;
	var ballMoveTimer = 0;
	var resizeTimeout;

	var pathMatrix = [];//массив точек маршрута от текущей точки в выбранную
	var ballChosen;//последний выбранный шар
	var ballChosenCY;//cy последнего выбранного шара
	var ballChosenBorderUp;//верхняя граница движения шара для анимации при клике
	var ballChosenBorderDown;//нижняя граница движения шара для анимации при клике
	var ballSpeed;//скорость движения шара вверх-вниз при клике
	var ballPath;
	var ballMovingCX;
	var ballMovingCY;
	var rSpeed = 1;//шаг расширения радиуса шара при появлении
	var lastBallsAppeared;
	var lastBallChosen = { "ball": 0, "previd": [], "newid": [] };

	var lastBallsDeleted;
	var saveModel = { "ballMatrix": 0, "ballColorMatrix": 0, "numOfColors": 0, "deleteMinimum": 0, "cellsNum": 0, "currentScore": 0, "gameBallColors": 0 };
	var locStorageName = "MODERN_LINES";
	var ajaxHandlerScript = "https://fe.it-academy.by/AjaxStringStorage2.php";
	var stringName = 'YATSEVICH_MODERN_LINES_RECORDS_TABLE';
	self.recordsTableArray;

	var ballR;
	var cellW;
	var ballMovingSpeed;
	var playerName = "";

	var startSwipe;
	var endSwipe;

	//кроссбраузерный таймер
	var RAF = window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		// ни один не доступен, будем работать просто по таймеру
		function (callback) { window.setTimeout(callback, 1000 / 60); };
	var cRAF = window.cancelAnimationFrame ||
		window.webkitCancelAnimationFrame ||
		window.mozCancelAnimationFrame ||
		window.oCancelAnimationFrame ||
		window.msCancelAnimationFrame ||
		// ни один не доступен, будем работать просто по таймеру
		function (callback) { window.clearTimeout(callback); };

	//загружаем таблицу рекордов на страницу
	self.refreshRecordsTable = function () {
		$.ajax({
			url: ajaxHandlerScript,
			type: 'POST', dataType: 'json',
			data: { f: 'READ', n: stringName },
			cache: false,
			success: readReady,
			error: errorHandler
		}
		);
	}
	function readReady(callresult) {
		if (callresult.error != undefined)
			console.log(callresult.error);
		else {
			if (callresult.result != "") {
				try {
					self.recordsTableArray = JSON.parse(callresult.result);
				}
				catch (error) {
					console.log('Произошла ошибка');
					console.log('Name ' + error.name);
					console.log('Message ' + error.message);
				};
				if (!Array.isArray(self.recordsTableArray))
					self.recordsTableArray = [];
			};
		};
	};
	function errorHandler(jqXHR, statusStr, errorStr) {
		console.log(statusStr + ' ' + errorStr);
	};
	self.refreshRecordsTable();
	//ф-я обновляем таблицу рекордов в модели
	self.updateRecordsTableServer = function () {
		var updatePassword;
		updatePassword = Math.random();
		$.ajax({
			url: ajaxHandlerScript, type: 'POST', cache: false, dataType: 'json',
			data: { f: 'LOCKGET', n: stringName, p: updatePassword },
			success: lockGetReady,
			error: errorHandler,
		}
		);
		function lockGetReady(callresult) {
			if (callresult.error != undefined)
				console.log(callresult.error);
			else {
				if (callresult.result != "") { // либо строка пустая, либо в строке - JSON-представление массива 
					try {
						self.recordsTableArray = JSON.parse(callresult.result);
					}
					catch (error) {
						console.log('Произошла ошибка');
						console.log('Name ' + error.name);
						console.log('Message ' + error.message);
					};
					if (!Array.isArray(self.recordsTableArray))
						self.recordsTableArray = [];
				};

				if (playerName) {
					var newplayer = [self.currentScore, playerName];
					for (var i = 0; i < self.recordsTableArray.length; i++) {
						if (self.currentScore < self.recordsTableArray[self.recordsTableArray.length - 1][0]) {
							self.recordsTableArray.push(newplayer);
							break;
						};
						if (self.currentScore >= self.recordsTableArray[i][0]) {
							self.recordsTableArray.splice(i, 0, newplayer);
							break;
						};
					};
				};

				$.ajax({
					url: ajaxHandlerScript,
					type: 'POST', dataType: 'json',
					data: { f: 'UPDATE', n: stringName, v: JSON.stringify(self.recordsTableArray), p: updatePassword },
					cache: false,
					success: updateReady,
					error: errorHandler
				}
				);
			};
		};
	};
	function updateReady(callresult) {
		if (callresult.error != undefined)
			alert(callresult.error);
	};
	//ф-я обновляем таблицу рекордов на экране
	self.updateRecordsTableDOM = function () {
		setTimeout(activeView.updateRecordsTableDOM, 1000);
	};
	//ф-я проверяем localstorage
	self.checkLocStorage = function () {
		var mark;
		var storageCheck = window.localStorage.getItem(locStorageName);
		if (storageCheck) {
			try {
				var saveModel = JSON.parse(storageCheck);
				var check = true;
				if (saveModel.ballMatrix.length === 0 || saveModel.ballColorMatrix.length === 0 || saveModel.numOfColors.length === 0 || saveModel.gameBallColors.length === 0 || saveModel.deleteMinimum === 0 || saveModel.cellsNum === 0 || saveModel.numOfColors === 0) {
					check = false
				};
				if (check) {
					self.ballMatrix = saveModel.ballMatrix
					self.ballColorMatrix = saveModel.ballColorMatrix;
					self.numOfColors = saveModel.numOfColors;
					activeView.setSettingsValues('colorsnumber', self.numOfColors);
					self.cellsNum = saveModel.cellsNum;
					activeView.setSettingsValues('cellsnumber', self.cellsNum);
					self.deleteMinimum = saveModel.deleteMinimum;
					activeView.setSettingsValues('cellsnumminimumremovalber', self.deleteMinimum);
					self.gameBallColors = saveModel.gameBallColors;
					self.currentScore = saveModel.currentScore;
					mark = true;
				};
			}
			catch (error) {
				console.log('Произошла ошибка');
				console.log('Name ' + error.name);
				console.log('Message ' + error.message);
			};
		};
		if (mark) {
			//если есть данные в localstorage, то восстанавливаем их
			self.resizeInit();
			activeView.updateCurrentScore(self.currentScore);
		}
		else {
			//иначе инициируем первоначальное поле
			self.createPlayField();
		};
		saveModel = { "ballMatrix": 0, "ballColorMatrix": 0, "numOfColors": 0, "deleteMinimum": 0, "cellsNum": 0, "currentScore": 0, "gameBallColors": 0 };
	}
	//связать со View - запустить проверку locstorage и нарисовать чистое поле или прошлую игру
	self.bindView = function (view) {
		activeView = view;
		self.updateRecordsTableDOM();
		self.checkLocStorage();
		self.hashchanged();
	};
	self.hashchanged = function () {
		var URLHash = window.location.hash;
		var stateStr = URLHash.substr(1);
		if (stateStr === "") {
			stateStr = "Game";
			self.switchToState(stateStr);
		};
		if (stateStr === "Game") {
			self.getSettings();
			self.closeHighScore();
			activeView.closeGameOver();
		};
		if (stateStr === "HighScore") {
			self.showHighScore();
			self.getSettings();
			activeView.closeGameOver();
		};
		if (stateStr === "CustomSettings") {
			self.showSettings();
			self.closeHighScore();
			activeView.closeGameOver();
		};
		if (stateStr === "Gameover") {
			activeView.showGameOver();
			self.getSettings();
			self.closeHighScore();
		};
	};
	self.switchToState = function (newState) {
		location.hash = newState;
	};
	self.createPlayField = function () {
		if (activeView) {
			activeView.createPlayField();
		};
	};
	self.resizeInit = function () {
		if (activeView)
			if (!resizeTimeout) {
				resizeTimeout = setTimeout(function () {
					resizeTimeout = null;
					activeView.resizeField();
				}, 60);
			};
	};
	//начать игру
	self.start = function () {
		if (activeView) {
			self.generateGameColors();
			self.clearArrForNewGame();
			self.currentScore = 0;
			activeView.updateCurrentScore(self.currentScore);
			activeView.start();
			//помещаем на поле первые шары
			self.createAndPlaceNextBalls();
		};
	};
	//определяем цвета, с которыми будем работать в этой игре
	self.generateGameColors = function () {
		var colorNum = 0;
		var check = {};
		self.gameBallColors = []
		while (self.gameBallColors.length < numOfColors) {
			var randomColor = Math.floor(Math.random() * (self.ballColors.length));
			var colorName = self.ballColors[randomColor];
			if (!(colorName in check)) {
				check[colorName] = true;
				self.gameBallColors[colorNum] = colorName;
				colorNum++;
			};
		};
	};
	//ф-я очищаем сохраненные значения - заполняем матрицу шаров значениями false и матрицу цветов значениями '' ?????? все значения предыдущей игры
	self.clearArrForNewGame = function () {
		for (var i = 0; i < self.cellsNum; i++) {
			self.ballMatrix[i] = [];
			self.ballColorMatrix[i] = [];
			for (var j = 0; j < self.cellsNum; j++) {
				self.ballMatrix[i][j] = false;
				self.ballColorMatrix[i][j] = '';
			};
		};
		self.ballChosen = 0;
	};
	//ф-я совмещаем три след ф-ии - цвет + место + размещение
	self.createAndPlaceNextBalls = function () {
		var newBalls = nextBallsColor(self.newBallsNumber);
		var newBallsPosition = nextBallsPlace(self.newBallsNumber);
		placeBalls(self.newBallsNumber, newBalls, newBallsPosition);
	};
	//ф-я генерируем нужное количество цветов из доступных
	function nextBallsColor(number) {
		var colorsHash = [];
		for (var i = 1; i <= number; i++) {
			var randomColor = Math.floor(Math.random() * (self.gameBallColors.length));
			var colorName = self.gameBallColors[randomColor];
			colorsHash[i] = colorName;
		};
		return colorsHash;
	};
	//ф-я генерируем нужное количество мест для расположения шаров
	function nextBallsPlace(number) {
		var positionsHash = [];
		var check = {};
		var count = 1;
		while (count <= number) {
			var randomPosition = Math.floor(Math.random() * (self.totalCellsNum));
			var row = Math.trunc(randomPosition / self.cellsNum);
			var column = randomPosition - row * self.cellsNum;
			if (!(randomPosition in check) && !self.ballMatrix[row][column]) {
				check[randomPosition] = true;
				positionsHash[count] = { 'row': row, 'column': column };
				count++;
			};
		};
		return positionsHash;
	};
	//ф-я размещаем новые шары на поле с анимацией
	function placeBalls(number, color, position) {
		self.newBallsArray = [];
		self.newBallsRadiusArray = [];
		for (var i = 1; i <= number; i++) {
			var id = '' + position[i].row + '-' + position[i].column;
			self.ballMatrix[position[i].row][position[i].column] = true;
			self.ballColorMatrix[position[i].row][position[i].column] = color[i];
			activeView.createBallAnim(color[i], activeView.centerPointsArray[position[i].row][position[i].column][0], activeView.centerPointsArray[position[i].row][position[i].column][1], ballR, id)
		};
		self.animateAppearance();
	};
	//ф-я анимация появления шаров
	self.animateAppearance = function () {
		cRAF(ballAppearanceTimer);
		ballAppearanceTimer = 0;
		if (self.newBallsRadiusArray[0] <= ballR) {
			for (var i = 0; i < self.newBallsArray.length; i++) {
				if (self.newBallsRadiusArray[i] <= ballR) {
					var newRadius = self.newBallsRadiusArray[i] + rSpeed;
					self.newBallsRadiusArray[i] = newRadius;
					activeView.updateBallRadius(self.newBallsArray[i], newRadius);
				};
			};
			ballAppearanceTimer = RAF(self.animateAppearance);
		}
		else {
			lastBallsAppeared = [];
			for (var i = 0; i < self.newBallsArray.length; i++) {
				lastBallsAppeared[i] = self.newBallsArray[i];
			};
			checkAppearanceForDelete();
		};
	};
	//ф-я анимация удаления шаров
	function animateDelete() {
		cRAF(ballDeleteTimer);
		ballDeleteTimer = 0;
		if (self.deleteBallsRadiusArray[0] >= 0 + rSpeed) {
			for (var i = 0; i < self.deleteBallsArray.length; i++) {
				if (self.deleteBallsRadiusArray[i] >= 0 + rSpeed) {
					var newRadius = self.deleteBallsRadiusArray[i] - rSpeed;
					self.deleteBallsRadiusArray[i] = newRadius;
					activeView.updateBallRadius(self.deleteBallsArray[i], newRadius);
				};
			};
			ballDeleteTimer = RAF(animateDelete);
		}
		else {
			lastBallsDeleted = [];
			for (var i = 0; i < self.deleteBallsArray.length; i++) {
				lastBallsDeleted[i] = self.deleteBallsArray[i];
			};
			lastStepScore = self.deleteBallsArray.length;
			self.currentScore += lastStepScore;
			activeView.updateCurrentScore(self.currentScore);
			for (var i = 0; i < self.deleteBallsArray.length; i++) {
				var idRow = getRowByElemID(self.deleteBallsArray[i].id);
				var idColumn = getColumnByElemID(self.deleteBallsArray[i].id);
				self.ballMatrix[idRow][idColumn] = false;
				self.ballColorMatrix[idRow][idColumn] = "";
				activeView.removeElem(self.deleteBallsArray[i]);
			};
			self.deleteBallsArray = [];
			self.deleteBallsRadiusArray = [];
			setTimeout(checkAppearanceForDelete, 300);
		};
	};
	self.elemClick = function (EO) {
		EO = EO || window.event;
		var element = EO.target || EO.srcElement;
		var elementID = element.id;
		//если нажали на шар, то он начинает двигаться
		if (elementID) {
			if (ballChosen) {
				stopJumpingBall();
			};
			ballSpeed = -1;
			ballChosen = element;
			ballChosenCY = activeView.getCY(ballChosen);
			ballChosenBorderUp = ballChosenCY - cellW * 0.11;
			ballChosenBorderDown = ballChosenCY + cellW * 0.11;
			ballClick();
			activeView.clickBallSound();
			activeView.vibro();
		}
		else {
			if (ballChosen) {
				var emptyCells = checkEmptyCells();
				if (emptyCells < self.newBallsNumber) {
					self.switchToState("Gameover");
				}
				else {
					var ballChosenRow = getRowByElemID(ballChosen.id);
					var ballChosenColumn = getColumnByElemID(ballChosen.id);
					var cellChosenRow = Math.round(element.getAttribute('y') / cellW);
					var cellChosenColumn = Math.round(element.getAttribute('x') / cellW);
					ballPath = getPathForMove(ballChosenRow, ballChosenColumn, cellChosenRow, cellChosenColumn);
					if (ballPath.length > 0) {
						cRAF(ballJumpTimer);
						ballJumpTimer = 0;
						stopJumpingBall();
						ballMovingCX = activeView.getCX(ballChosen);
						ballMovingCY = activeView.getCY(ballChosen);
						animateMove();
					};
				};
			};
		};
	};
	//ф-я остановки прыгающего шара в центр и зануления переменной выбранного мяча
	function stopJumpingBall() {
		var ballChosenRow = getRowByElemID(ballChosen.id);
		var ballChosenColumn = getColumnByElemID(ballChosen.id);
		activeView.setCY(ballChosen, activeView.centerPointsArray[ballChosenRow][ballChosenColumn][1]);
	};
	//ф-я получить номер строки из Id
	function getRowByElemID(idString) {
		var idRow = parseInt(idString.split('-')[0]);
		return idRow;
	};
	//ф-я получить номер столбца из Id
	function getColumnByElemID(idString) {
		var idColumn = parseInt(idString.split('-')[1]);
		return idColumn;
	};
	//ф-я анимация движения шара при клике
	function ballClick() {
		ballChosenCY += ballSpeed;
		if (ballChosenCY < ballChosenBorderUp) {
			ballSpeed = 1;
			ballChosenCY = ballChosenBorderUp;
		};
		if (ballChosenCY > ballChosenBorderDown) {
			ballSpeed = -1;
			ballChosenCY = ballChosenBorderDown;
		};
		activeView.setCY(ballChosen, ballChosenCY);
		cRAF(ballJumpTimer);
		ballJumpTimer = 0;
		ballJumpTimer = RAF(ballClick);
	};
	//проверить, есть ли пустые клетки	
	function checkEmptyCells() {
		var count = 0;
		for (var i = 0; i < self.cellsNum; i++) {
			for (var j = 0; j < self.cellsNum; j++) {
				if (self.ballMatrix[i][j] === false) {
					count++;
				};
			};
		};
		return count;
	};
	//ф-я получаем путь из начальной точкив конечную
	function getPathForMove(startX, startY, finishX, finishY) {
		var path = [];
		//строим строим карту возможных путей из стартовой точки
		buildPathMatrix(startX, startY);
		if (pathMatrix[finishX][finishY] != -1) {
			var currPosition = [finishX, finishY];
			path.push([finishX, finishY]);
			var stepsNum = pathMatrix[finishX][finishY];
			while (stepsNum > 0) {
				stepsNum--;
				if (currPosition[0] > 0 && pathMatrix[currPosition[0] - 1][currPosition[1]] === stepsNum) {
					path.push([currPosition[0] - 1, currPosition[1]]);
					currPosition[0] -= 1
				}
				else if (currPosition[1] > 0 && pathMatrix[currPosition[0]][currPosition[1] - 1] === stepsNum) {
					path.push([currPosition[0], currPosition[1] - 1]);
					currPosition[1] -= 1
				}
				else if (currPosition[0] + 1 < pathMatrix.length && pathMatrix[currPosition[0] + 1][currPosition[1]] === stepsNum) {
					path.push([currPosition[0] + 1, currPosition[1]]);
					currPosition[0] += 1
				}
				else if (currPosition[1] + 1 < pathMatrix.length && pathMatrix[currPosition[0]][currPosition[1] + 1] === stepsNum) {
					path.push([currPosition[0], currPosition[1] + 1]);
					currPosition[1] += 1
				};
			};
		};
		return path;
	};
	//ф-я строим карту возможных путей
	//x - номер строки, y - номер столбца
	function buildPathMatrix(startX, startY) {
		var stepNum = 0;
		for (var i = 0; i < self.cellsNum; i++) {
			pathMatrix[i] = [];
			for (var j = 0; j < self.cellsNum; j++) {
				pathMatrix[i][j] = -1;
			};
		};
		pathMatrix[startX][startY] = stepNum;
		do {
			var exists = false;
			for (var x = 0; x < pathMatrix.length; x++) {
				for (var y = 0; y < pathMatrix[x].length; y++) {
					if (pathMatrix[x][y] === stepNum) {
						exists = true;
						if (x > 0 && self.ballMatrix[x - 1][y] === false && pathMatrix[x - 1][y] === -1) {
							pathMatrix[x - 1][y] = stepNum + 1;
						}
						if (x + 1 < pathMatrix.length && self.ballMatrix[x + 1][y] === false && pathMatrix[x + 1][y] === -1) {
							pathMatrix[x + 1][y] = stepNum + 1;
						}
						if (y > 0 && self.ballMatrix[x][y - 1] === false && pathMatrix[x][y - 1] === -1) {
							pathMatrix[x][y - 1] = stepNum + 1;
						}
						if (y + 1 < pathMatrix.length && self.ballMatrix[x][y + 1] === false && pathMatrix[x][y + 1] === -1) {
							pathMatrix[x][y + 1] = stepNum + 1;
						}
					}
				}
			}
			stepNum++;
		}
		while (exists)
	}
	//ф-я анимация движения выбранного шара
	function animateMove() {
		cRAF(ballMoveTimer);
		ballMoveTimer = 0;
		if (ballPath.length > 0) {
			var ballPathElem = ballPath.length - 1;
			var ballChosenRow = getRowByElemID(ballChosen.id);
			var ballChosenColumn = getColumnByElemID(ballChosen.id);
			var coordXStep = activeView.centerPointsArray[ballPath[ballPathElem][0]][ballPath[ballPathElem][1]][0];
			var coordYStep = activeView.centerPointsArray[ballPath[ballPathElem][0]][ballPath[ballPathElem][1]][1];
			if (coordYStep > ballMovingCY) {
				ballMovingCY += ballMovingSpeed;
				if (coordYStep < ballMovingCY) {
					ballMovingCY = coordYStep;
				}
			}
			else if (coordYStep < ballMovingCY) {
				ballMovingCY -= ballMovingSpeed;
				if (coordYStep > ballMovingCY) {
					ballMovingCY = coordYStep;
				}
			}
			if (coordXStep > ballMovingCX) {
				ballMovingCX += ballMovingSpeed;
				if (coordXStep < ballMovingCX) {
					ballMovingCX = coordXStep;
				}
			}
			else if (coordXStep < ballMovingCX) {
				ballMovingCX -= ballMovingSpeed;
				if (coordXStep > ballMovingCX) {
					ballMovingCX = coordXStep;
				}
			}
			activeView.setCX(ballChosen, ballMovingCX);
			activeView.setCY(ballChosen, ballMovingCY);
			if (coordXStep === ballMovingCX && coordYStep === ballMovingCY) {
				if (ballPath.length === 1) {

					lastBallChosen.ball = 0;
					lastBallChosen.previd = [];
					lastBallChosen.newid = [];
					lastBallsAppeared = 0;
					lastBallsDeleted = 0;

					var ballChosenRow = getRowByElemID(ballChosen.id);
					var ballChosenColumn = getColumnByElemID(ballChosen.id);
					var ballChosenColor = self.ballColorMatrix[ballChosenRow][ballChosenColumn];

					lastBallChosen.ball = ballChosen;
					lastBallChosen.previd = [ballChosenRow, ballChosenColumn];

					self.ballMatrix[ballChosenRow][ballChosenColumn] = false;
					self.ballColorMatrix[ballChosenRow][ballChosenColumn] = '';

					ballChosen.id = '' + ballPath[ballPathElem][0] + '-' + ballPath[ballPathElem][1];

					ballChosenRow = getRowByElemID(ballChosen.id);
					ballChosenColumn = getColumnByElemID(ballChosen.id);
					self.ballMatrix[ballChosenRow][ballChosenColumn] = true;
					self.ballColorMatrix[ballChosenRow][ballChosenColumn] = ballChosenColor;

					lastBallChosen.newid = [ballChosenRow, ballChosenColumn];

					ballChosen = 0;
					ballPath.pop();
					checkForDelete();
				}
				else {
					ballPath.pop()
					ballMoveTimer = RAF(animateMove);
				}
			}
			else {
				ballMoveTimer = RAF(animateMove);
			}
		}
	}
	//// отменить шаг
	self.undoStep = function () {
		if (lastBallsDeleted != 0) {
			for (var i = 0; i < lastBallsDeleted.length; i++) {
				lastBallsDeleted[i].setAttribute('r', activeView.ballR);
				var ballRow = getRowByElemID(lastBallsDeleted[i].id);
				var ballColumn = getColumnByElemID(lastBallsDeleted[i].id);
				self.ballColorMatrix[ballRow][ballColumn] = lastBallsDeleted[i].getAttribute('fill');
				self.ballMatrix[ballRow][ballColumn] = true;
				activeView.appendElem(lastBallsDeleted[i]);
			};
			self.currentScore -= lastStepScore;
			lastBallsDeleted = 0
		}
		if (lastBallsAppeared != 0) {
			for (var i = 0; i < lastBallsAppeared.length; i++) {
				var ballRow = getRowByElemID(lastBallsAppeared[i].id);
				var ballColumn = getColumnByElemID(lastBallsAppeared[i].id);
				self.ballColorMatrix[ballRow][ballColumn] = '';
				self.ballMatrix[ballRow][ballColumn] = false;
				activeView.setR(lastBallsAppeared[i], 0)
				activeView.removeElem(lastBallsAppeared[i]);
			}
			lastBallsAppeared = 0
		}
		if (lastBallChosen.ball != 0) {
			lastBallChosen.ball.id = '' + lastBallChosen.previd[0] + '-' + lastBallChosen.previd[1];

			self.ballColorMatrix[lastBallChosen.previd[0]][lastBallChosen.previd[1]] = lastBallChosen.ball.getAttribute('fill');
			self.ballMatrix[lastBallChosen.previd[0]][lastBallChosen.previd[1]] = true;
			activeView.setCY(lastBallChosen.ball, activeView.centerPointsArray[lastBallChosen.previd[0]][lastBallChosen.previd[1]][1]);
			activeView.setCX(lastBallChosen.ball, activeView.centerPointsArray[lastBallChosen.previd[0]][lastBallChosen.previd[1]][0]);

			self.ballColorMatrix[lastBallChosen.newid[0]][lastBallChosen.newid[1]] = '';
			self.ballMatrix[lastBallChosen.newid[0]][lastBallChosen.newid[1]] = false;
			lastBallChosen = { "ball": 0, "previd": [], "newid": [] };
		}
	}
	//проверить ряд на удаление
	function checkForDelete() {
		var row = checkRowForDelete();
		var column;
		var diag;
		if (!row) {
			column = checkColumnForDelete();
		}
		if (!row && !column) {
			diag = checkDiagonalForDelete();
		}
		if (row) {
			animateDelete();
		}
		else if (column) {
			animateDelete();
		}
		else if (diag) {
			animateDelete();
		}
		else {
			self.createAndPlaceNextBalls();
		}
	}
	//проверить ряд на удаление
	function checkAppearanceForDelete() {
		var row = checkRowForDelete();
		var column;
		var diag;
		if (!row) {
			column = checkColumnForDelete();
		}
		if (!row && !column) {
			diag = checkDiagonalForDelete();
		}
		if (row) {
			animateDelete();
		}
		else if (column) {
			animateDelete();
		}
		else if (diag) {
			animateDelete();
		}
		else {
			var emptyCells = checkEmptyCells();
			if (emptyCells < newBallsNumber) {
				self.switchToState("Gameover");
			}
		}
	}

	//запомнить ряд шаров одного цвета
	//ф-я проверить строку
	function checkRowForDelete() {
		var idForDelete = [];
		//var color = '';
		for (var i = 0; i < self.ballMatrix.length; i++) {
			var count = 0;
			for (var j = 0; j < self.ballMatrix[i].length; j++) {
				var id = '';
				if (self.ballMatrix[i][j] && self.ballColorMatrix[i][j]) {
					if (j > 0 && self.ballColorMatrix[i][j] === self.ballColorMatrix[i][j - 1]) {//i строка, j - столбец
						id = '' + i + '-' + j;
						idForDelete.push(id);
						count++;
					}
					else {
						if (count >= self.deleteMinimum) {
							break;
						}
						else {
							idForDelete = [];
							count = 0;
							id = '' + i + '-' + j;
							idForDelete.push(id);
							count++;
						}
					}
				}
				else {
					if (count >= self.deleteMinimum) {
						break;
					}
				}
			}
			if (count >= self.deleteMinimum) {
				break;
			}
			else {
				idForDelete = [];
			}
		}
		if (idForDelete.length >= self.deleteMinimum) {
			self.deleteBallsArray = [];
			self.deleteBallsRadiusArray = [];
			for (var i = 0; i < idForDelete.length; i++) {
				var element = document.getElementById(idForDelete[i]);
				self.deleteBallsArray.push(element);
				self.deleteBallsRadiusArray.push(ballR);
			}
			return true;
		}
		else {
			return false;
		}
	}
	//проверить столбец 
	function checkColumnForDelete() {
		var idForDelete = [];
		for (var i = 0; i < self.ballMatrix.length; i++) {
			var count = 0;
			for (var j = 0; j < self.ballMatrix[i].length; j++) {
				var id = '';
				if (self.ballColorMatrix[j][i]) {
					if (j > 0 && self.ballColorMatrix[j][i] === self.ballColorMatrix[j - 1][i]) {//i столбец, j - строка
						id = '' + j + '-' + i;
						idForDelete.push(id);
						count++;
					}
					else {
						if (count >= self.deleteMinimum) {
							break;
						}
						else {
							idForDelete = [];
							count = 0;
							id = '' + j + '-' + i;
							idForDelete.push(id);
							count++;
						}
					}
				}
				else {
					if (count >= self.deleteMinimum) {
						break;
					}
				}
			}
			if (count >= self.deleteMinimum) {
				break;
			}
			else {
				idForDelete = [];
			}
		}
		if (idForDelete.length >= self.deleteMinimum) {
			self.deleteBallsArray = [];
			self.deleteBallsRadiusArray = [];
			for (var i = 0; i < idForDelete.length; i++) {
				var element = document.getElementById(idForDelete[i]);
				self.deleteBallsArray.push(element);
				self.deleteBallsRadiusArray.push(activeView.ballR);
			}
			return true;
		}
		else {
			return false;
		}
	}
	//проверить диагональ 
	function checkDiagonalForDelete() {
		var idForDelete = [];
		//сверху вниз
		for (var i = 0; i < self.cellsNum; i++) {
			var count = 0;
			for (var j = 0; j < self.cellsNum; j++) {
				var rowNum = j;
				var columnNum = (i + j * (self.cellsNum - 1)) % self.cellsNum;
				var id = '';
				if (self.ballColorMatrix[rowNum][columnNum]) {
					if (rowNum - 1 >= 0 && columnNum + 1 < self.cellsNum && self.ballColorMatrix[rowNum][columnNum] === self.ballColorMatrix[rowNum - 1][columnNum + 1]) {
						id = '' + rowNum + '-' + columnNum;
						idForDelete.push(id);
						count++;
					}
					else {
						if (count >= self.deleteMinimum) {
							break;
						}
						else {
							idForDelete = [];
							count = 0;
							id = '' + rowNum + '-' + columnNum;
							idForDelete.push(id);
							count++;
						}
					}
				}
				else {
					if (count >= self.deleteMinimum) {
						break;
					}
				}
			}
			if (count >= self.deleteMinimum) {
				break;
			}
			else {
				idForDelete = [];
			}
		}
		//снизу вверх
		if (idForDelete.length < self.deleteMinimum) {
			for (var i = 0; i < self.cellsNum; i++) {
				var count = 0;
				for (var j = self.cellsNum - 1; j >= 0; j--) {
					var rowNum = j;
					var columnNum = (self.cellsNum * (self.cellsNum - 1) - 1 + i - (self.cellsNum - j) * (self.cellsNum - 1)) % self.cellsNum;
					var id = '';
					if (self.ballColorMatrix[rowNum][columnNum]) {
						if (rowNum + 1 < self.cellsNum && columnNum - 1 >= 0 && self.ballColorMatrix[rowNum][columnNum] === self.ballColorMatrix[rowNum + 1][columnNum - 1]) {
							id = '' + rowNum + '-' + columnNum;
							idForDelete.push(id);
							count++;
						}
						else {
							if (count >= self.deleteMinimum) {
								break;
							}
							else {
								idForDelete = [];
								count = 0;
								id = '' + rowNum + '-' + columnNum;
								idForDelete.push(id);
								count++;
							}
						}
					}
					else {
						if (count >= self.deleteMinimum) {
							break;
						}
					}
				}
				if (count >= self.deleteMinimum) {
					break;
				}
				else {
					idForDelete = [];
				}
			}
		}
		//справа налево
		if (idForDelete.length < self.deleteMinimum) {
			for (var i = 0; i < self.cellsNum; i++) {
				var count = 0;
				for (var j = 0; j < self.cellsNum; j++) {
					var rowNum = j;
					var columnNum = (i + j * (self.cellsNum + 1)) % self.cellsNum;

					var id = '';
					if (self.ballColorMatrix[rowNum][columnNum]) {
						if (rowNum - 1 >= 0 && columnNum - 1 >= 0 && self.ballColorMatrix[rowNum][columnNum] === self.ballColorMatrix[rowNum - 1][columnNum - 1]) {
							id = '' + rowNum + '-' + columnNum;
							idForDelete.push(id);
							count++;
						}
						else {
							if (count >= self.deleteMinimum) {
								break;
							}
							else {
								idForDelete = [];
								count = 0;
								id = '' + rowNum + '-' + columnNum;
								idForDelete.push(id);
								count++;
							}
						}
					}
					else {
						if (count >= self.deleteMinimum) {
							break;
						}
					}
				}
				if (count >= self.deleteMinimum) {
					break;
				}
				else {
					idForDelete = [];
				}
			}
		}
		//слева направо
		if (idForDelete.length < self.deleteMinimum) {
			for (var i = 0; i < self.cellsNum; i++) {
				var count = 0;
				for (var j = self.cellsNum - 1; j >= 0; j--) {
					var rowNum = j;
					var columnNum = (self.cellsNum * (self.cellsNum - 1) + 1 + i - (self.cellsNum - j) * (self.cellsNum + 1)) % self.cellsNum;

					var id = '';
					if (self.ballColorMatrix[rowNum][columnNum]) {
						if (rowNum + 1 < self.cellsNum && columnNum + 1 < self.cellsNum && self.ballColorMatrix[rowNum][columnNum] === self.ballColorMatrix[rowNum + 1][columnNum + 1]) {
							id = '' + rowNum + '-' + columnNum;
							idForDelete.push(id);
							count++;
						}
						else {
							if (count >= self.deleteMinimum) {
								break;
							}
							else {
								idForDelete = [];
								count = 0;
								id = '' + rowNum + '-' + columnNum;
								idForDelete.push(id);
								count++;
							}
						}
					}
					else {
						if (count >= self.deleteMinimum) {
							break;
						}
					}
				}
				if (count >= self.deleteMinimum) {
					break;
				}
				else {
					idForDelete = [];
				}
			}
		}
		if (idForDelete.length >= self.deleteMinimum) {
			for (var i = 0; i < idForDelete.length; i++) {
				var element = document.getElementById(idForDelete[i]);
				self.deleteBallsArray.push(element);
				self.deleteBallsRadiusArray.push(ballR);
			}
			return true;
		}
		else {
			return false;
		}
	}
	self.updateModel = function () {
		playerName = activeView.playerName;
		cellW = activeView.cellW;
		ballR = activeView.ballR;
		ballMovingSpeed = activeView.ballMovingSpeed;
	}
	self.showHighScore = function () {
		if (activeView) {
			activeView.showHighScore();
		}
	}
	self.closeHighScore = function () {
		if (activeView) {
			activeView.closeHighScore();
		}
	}
	self.undo = function () {
		if (activeView) {
			activeView.undo();
		}
	}
	self.showSettings = function () {
		if (activeView) {
			activeView.showCustomSettings();
		}
	}
	self.getSettings = function () {
		var lastCellsNum = self.cellsNum;
		var lastNumOfColors = self.numOfColors;
		var lastDeleteMinimum = self.deleteMinimum;
		if (activeView) {
			self.cellsNum = activeView.getSettingsValues('cellsnumber');
			self.numOfColors = activeView.getSettingsValues('colorsnumber');
			self.deleteMinimum = activeView.getSettingsValues('minimumremoval');
			self.totalCellsNum = self.cellsNum * self.cellsNum;
			if (self.cellsNum != lastCellsNum || self.numOfColors != lastNumOfColors || self.deleteMinimum != lastDeleteMinimum) {
				activeView.deleteAllBalls()
				self.clearArrForNewGame();
				activeView.updateCurrentScore(self.currentScore);
				self.createPlayField();
			}
			activeView.closeCustomSettings();
		}
	}
	self.changeAudio = function () {
		activeView.changeAudio();
	}
	self.befUnload = function (EO) {
		EO = EO || window.event;
		saveModel.ballMatrix = self.ballMatrix;
		saveModel.ballColorMatrix = self.ballColorMatrix;
		saveModel.numOfColors = self.numOfColors;
		saveModel.cellsNum = self.cellsNum;
		saveModel.deleteMinimum = self.deleteMinimum;
		saveModel.currentScore = self.currentScore;
		saveModel.gameBallColors = self.gameBallColors;
		var save = JSON.stringify(saveModel);
		window.localStorage.setItem(locStorageName, save);
		//после сохранения модели обнуляем ее
		saveModel = { "ballMatrix": 0, "ballColorMatrix": 0, "numOfColors": 0, "deleteMinimum": 0, "cellsNum": 0, "currentScore": 0, "gameBallColors": 0 };
	}
	self.tStart = function (EO) {
		EO = EO || window.event;
		startSwipe = EO.changedTouches[0];
	}
	self.tEnd = function (EO) {
		EO = EO || window.event;
		endSwipe = EO.changedTouches[0];
		var xAbs = Math.abs(startSwipe.pageX - endSwipe.pageX);
		var yAbs = Math.abs(startSwipe.pageY - endSwipe.pageY);
		if (xAbs > 20 || yAbs > 20) {
			if (xAbs > yAbs) {
				if (endSwipe.pageX < startSwipe.pageX) {//свайп влево
					self.showHighScore();
				}
				else {//свайп вправо
					self.showSettings();
				}
			}
			else {
				if (endSwipe.pageY < startSwipe.pageY) {//свайп вверх
					//self.start();
				}
				else {//свайп вниз			
				}
			}
		}
	}
	self.closeGameOver = function () {
		activeView.closeGameOver();
	}
}