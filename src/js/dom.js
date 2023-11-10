export default class DOM {
  constructor() {
    this.container = null;
    this.headers = {
      create: 'Добавить заявку',
      edit: 'Изменить заявку',
      remove: 'Удалить заявку',
    };

    this.ticketsAddListeners = [];
    this.formCancelListeners = [];
    this.formOkListeners = [];
    this.ticketsClickListeners = [];
  }

  // если входной div-контейнер НЕ html-элемент - ошибка (проверка в app.js)
  bindToDOM(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('Контейнер не является HTML-элементом');
    }
    this.container = container;
  }

  // если не был передан div-контейнер - ошибка
  checkBinding() {
    if (this.container === null) {
      throw new Error('Не был передан div-контейнер');
    }
  }

  // добавляем шапку с кнопкой 'Добавить заявку'
  drawUI() {
    this.checkBinding();

    this.container.innerHTML = `
      <div class="helpdesk-container">
        <div class="btn-add-ticket-container">
          <button class="btn btn-add-ticket">Добавить заявку</button>
        </div>
        <ul class="tickets-list"></ul>
      </div>
    `;

    // вставка формы на страницу
    this.popupForm();

    // элементы: кнопка добавить заявку и блок списка заявок
    this.ticketAdd = this.container.querySelector('.btn-add-ticket');
    this.ticketsList = this.container.querySelector('.tickets-list');

    // подписываемся на клик 'Добавить заявку'
    this.ticketAdd.addEventListener('click', (e) => this.onTicketsAdd(e));
    this.ticketsList.addEventListener('click', (e) => this.onTicketsClick(e));
  }

  // форма для добавления, изменения и удаления заявки
  popupForm() {
    this.modalContainerForm = document.createElement('div');
    this.modalContainerForm.innerHTML = `
      <form class="ticket-form">
        <div class="ticket-form-header"></div>
        <div class="form-text">Вы уверены, что хотите удалить заявку? Это действие необратимо.</div>
        <div class="ticket-form-label-container">
          <div class="ticket-form-label" data-id="container-name">
            <label class="ticket-form-label-text" for="ticket-name">Название</label>
            <input class="ticket-form-label-field" type="text" maxlength=30 name="ticket-name" id="ticket-name">
          </div>
          <div class="ticket-form-label" data-id="container-description"> 
            <label class="ticket-form-label-text" for="ticket-description">Описание</label>
            <textarea class="ticket-form-label-field" name="ticket-description" maxlength=60  id="ticket-description"></textarea >
          </div>
          </div>
        <div class="ticket-form-button-container"> 
          <button data-id="form-cancel" class="btn btn-form">Отмена</button>
          <button data-id="form-ok" class="btn btn-form" type="button">Ok</button>
        </div>
      </form>
    `;
    // классы формы создаем
    this.modalContainerForm.classList.add('ticket-form-container');
    this.modalContainerForm.classList.add('disable');
    // заголовок
    this.formHeader = this.modalContainerForm.querySelector('.ticket-form-header');
    // описание формы
    this.formDescription = this.modalContainerForm.querySelector('.form-text');
    // контейнер с лейблами
    this.formLabelContainer = this.modalContainerForm.querySelector('.ticket-form-label-container');
    // инпут с именем и описанием
    this.ticketName = this.modalContainerForm.querySelector('#ticket-name');
    this.ticketDescription = this.modalContainerForm.querySelector('#ticket-description');
    // кнопка отмена и ок
    this.formCancel = this.modalContainerForm.querySelector('[data-id=form-cancel]');
    this.formOk = this.modalContainerForm.querySelector('[data-id=form-ok]');
    // собития на кнопку отмена и ок
    this.formCancel.addEventListener('click', (event) => this.onFormCancel(event));
    this.formOk.addEventListener('click', (event) => this.onFormOk(event));
    // вставка формы в DOM
    this.container.appendChild(this.modalContainerForm);
  }

  // открытие/закрытие и изменение значений формы
  ticketFormChange(active, name, description, called = '', ticketID = false, formType = 'open') {
    if (active) {
      this.modalContainerForm.classList.remove('disable');
    } else { this.modalContainerForm.classList.add('disable'); }

    // изменяем заголовок
    this.formHeader.textContent = this.headers[called] || '';

    // если форма для создания или изменения
    if (formType === 'open') {
      this.formLabelContainer.classList.remove('disable');
      this.formDescription.classList.add('disable');

      this.ticketName.value = name;
      this.ticketDescription.value = description;
    }

    if (formType === 'delete') {
      this.formLabelContainer.classList.add('disable');
      this.formDescription.classList.remove('disable');
    }

    this.modalContainerForm.dataset.called = called;
    this.modalContainerForm.dataset.id = ticketID;
  }

  addFormCancelListeners(callback) { this.formCancelListeners.push(callback); }

  // кнопка отмена на форме
  onFormCancel(e) {
    e.preventDefault();
    this.formCancelListeners.forEach((o) => o.call(null, ''));
  }

  addFormOkListeners(callback) { this.formOkListeners.push(callback); }

  // кнопка ок на форме
  onFormOk(e) {
    e.preventDefault();
    const name = this.ticketName.value;
    const description = this.ticketDescription.value;
    const { called, id } = this.modalContainerForm.dataset;
    const value = {
      name,
      description,
      called,
      id,
    };

    this.formOkListeners.forEach((o) => o.call(null, value));
  }

  addTicketsAddListeners(callback) { this.ticketsAddListeners.push(callback); }

  // кнопка добавить заявку, открывает форму
  onTicketsAdd(e) {
    e.preventDefault();
    this.ticketsAddListeners.forEach((o) => o.call(null, ''));
  }

  addTicketsClickListeners(callback) { this.ticketsClickListeners.push(callback); }

  // общий клик по блоку с заявками
  onTicketsClick(e) {
    e.preventDefault();

    const { target } = e;
    const ticket = target.closest('.ticket');

    if (!ticket) { return; }

    const ticketID = ticket.dataset.id;
    const dataID = target.dataset.id;

    this.ticketsClickListeners.forEach((o) => o.call(null, { dataID, ticketID }));
  }

  // HTML заявки
  static ticketHtml(id, name, status, createdTime) {
    let ticketCompleted = '&#x2714;';

    if (!status) { ticketCompleted = ''; }

    const ticket = document.createElement('li');
    ticket.classList.add('ticket');
    ticket.dataset.id = id;

    ticket.innerHTML = `
      <span class="ticket-completed" data-id="completed">${ticketCompleted}</span>
      <span class="ticket-text">
        <p class="ticket-text-name">${name}</p>
      </span>
      <span class="ticket-date">${createdTime}</span>
      <span class="ticket-edit" data-id="edit">&#x270E;</span>
      <span class="ticket-remove" data-id="remove">&#x2716;</span>
    `;

    return ticket;
  }

  // создание и добавление заявки в дом
  ticketCreateAndAdd(ticket) {
    const {
      id,
      name,
      status,
      created,
    } = ticket;
    const createdTime = this.constructor.dateToConvert(created);
    const ticketHtml = this.constructor.ticketHtml(id, name, status, createdTime);
    this.ticketsList.appendChild(ticketHtml);
  }

  // отрисовка всех заявок
  ticketRender(tickets) {
    this.ticketsList.innerHTML = '';
    for (let i = 0; i < tickets.length; i += 1) {
      this.ticketCreateAndAdd(tickets[i]);
    }
  }

  // получить значения заявки
  ticketGetValue(id) {
    const ticket = this.ticketsList.querySelector(`[data-id="${id}"]`);
    if (!ticket) { return false; }
    return ticket.querySelector('.ticket-text-name').textContent;
  }

  // изменение состояния заявки
  ticketCompleted(id, status) {
    const ticket = this.ticketsList.querySelector(`[data-id="${id}"]`);
    if (!ticket) { return; }
    const completed = ticket.querySelector('.ticket-completed');
    if (status) {
      completed.innerHTML = '&#x2714;';
    }
    if (!status) {
      completed.innerHTML = '';
    }
  }

  // удалить заявку
  tickedRemove(id) {
    const ticket = this.ticketsList.querySelector(`[data-id="${id}"]`);
    if (!ticket) { return; }
    this.ticketsList.removeChild(ticket);
  }

  // изменить заявку
  tickedEdit(id) {
    const ticket = this.ticketsList.querySelector(`[data-id="${id}"]`);
    if (!ticket) { return; }
    const nameEl = ticket.querySelector('.ticket-text-name');
    nameEl.textContent = this.ticketName.value;
  }

  // если описание есть, то оно удаляется
  checkAndRemoveDescription(id) {
    // находим блок с заявкой
    const ticket = this.ticketsList.querySelector(`[data-id="${id}"]`);
    if (!ticket) { return false; }
    // поиск описания
    const descriptionText = ticket.querySelector('.ticket-text-description');
    if (descriptionText) {
      descriptionText.remove();
      return true;
    }
    return false;
  }

  // открыть или скрыть описание
  createDescription(id, text) {
    // находим блок с заявкой
    const ticket = this.ticketsList.querySelector(`[data-id="${id}"]`);
    if (!ticket) { return false; }
    // находим блок с контейнером
    const containerText = ticket.querySelector('.ticket-text');
    if (!containerText) { return false; }
    // создаём описание
    const paragraph = document.createElement('p');
    // задаём класс и значение описанию
    paragraph.classList.add('ticket-text-description');
    paragraph.textContent = text;
    // вставляем параграф с описанием
    containerText.appendChild(paragraph);
    return true;
  }

  // Оформляем загрузку
  loading(value) {
    if (value) {
      this.loadingDiv = document.createElement('div');
      this.loadingDiv.textContent = 'Загрузка...';
      this.loadingDiv.classList.add('loading');
      this.ticketsList.appendChild(this.loadingDiv);
    }
    if (!value) {
      this.loadingDiv.remove();
    }
  }

  // готовим дату
  static dateToConvert(dateValue) {
    const dateTimezone = new Date(dateValue);
    const date = dateTimezone.toLocaleDateString();
    const time = dateTimezone.toLocaleTimeString();

    return `${date} <br> ${time}`;
  }
}
