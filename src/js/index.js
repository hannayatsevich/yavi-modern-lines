'use strict';
import {LinesController} from './LinesController';
import {LinesModel} from './LinesModel';
import {LinesView} from './LinesView';
import '../styles/style.css';

var modernLinesModel = new LinesModel(9, 7, 4, 5);//cellsNum, numOfColors, newBallsNumber, deleteMinimum
var modernLinesView = new LinesView();
modernLinesView.bindModel(modernLinesModel);
modernLinesModel.bindView(modernLinesView);
var modernLinesController = new LinesController();
modernLinesController.bindModelAndField(modernLinesModel, document.getElementById('playfield'));