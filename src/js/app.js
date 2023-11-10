import Control from './control';
import DOM from './dom';
import API from './api';

// находим в html div для привязки
const notes = document.getElementById('notes');

// создание класса DOM
const deskDOM = new DOM();

// привязка класса DOM
deskDOM.bindToDOM(notes);

// урл бэка
const URL = 'https://tikets.onrender.com/';

// создание класса API и привязка к бэку
const deskAPI = new API(URL);

// создание класса, отвечающего за управление
const allControll = new Control(deskDOM, deskAPI);

allControll.init();
