export default class Control {
  constructor(deskDOM, deskAPI) {
    this.helpDeskDOM = deskDOM;
    this.helpDeskAPI = deskAPI;
  }

  async init() {
    this.helpDeskDOM.drawUI();
    await this.loadAndRenderTickets();

    this.helpDeskDOM.addTicketsAddListeners(this.onTicketsAdd.bind(this));
    this.helpDeskDOM.addFormCancelListeners(this.onFormCancel.bind(this));
    this.helpDeskDOM.addFormOkListeners(this.onFormOk.bind(this));
    this.helpDeskDOM.addTicketsClickListeners(this.onTicketsClick.bind(this));
  }

  // запрос и отрисовка заявок
  async loadAndRenderTickets() {
    // запрос заявок
    this.helpDeskDOM.loading(true);
    const tickets = await this.helpDeskAPI.allTickets();

    // проверяем наличие заявок - если есть отключаем показ загрузки
    if (tickets) {
      this.helpDeskDOM.loading(false);
      this.helpDeskDOM.ticketRender(tickets);
    }
  }

  // клик по кнопке открыть форму
  onTicketsAdd() {
    this.helpDeskDOM.ticketFormChange(true, '', '', 'create', false);
  }

  // закрыть форму
  onFormCancel() {
    this.helpDeskDOM.ticketFormChange(false, '', '', 'close', false);
  }

  // кнопка ОК на форме
  async onFormOk(value) {
    const {
      name,
      description,
      called,
      id,
    } = value;

    // если форма открыта для изменения
    if (called === 'edit') {
      // запрос изменения заявки на сервере
      const edited = await this.helpDeskAPI.editTicket(id, { name, description });
      // изменение заявки в DOM
      if (edited) { this.helpDeskDOM.tickedEdit(id); }
    }

    if (called === 'create') {
      // запрос создания заявки
      const created = await this.helpDeskAPI.createTicket({ name, description, status: false });
      // если заявка есть -- в DOM
      if (created) { this.helpDeskDOM.ticketCreateAndAdd(created); }
    }

    // если форма открыта для удаления
    if (called === 'delete') {
      const removed = await this.helpDeskAPI.removeTicket(id);
      if (removed) { this.helpDeskDOM.tickedRemove(id); }
    }

    // закрываем форму и очищаем её
    this.helpDeskDOM.ticketFormChange(false, '', '', 'close', false);
  }

  // клик по заявке
  async onTicketsClick({ dataID, ticketID }) {
    // клик по любому месту заявке, кроме кнопок
    if (!(dataID === 'completed' || dataID === 'edit' || dataID === 'remove')) {
      // проверка описания, если есть, то удаляется из DOM
      const checkAndRemoveDescription = this.helpDeskDOM.checkAndRemoveDescription(ticketID);

      // если описания нету, то добавляем
      if (!checkAndRemoveDescription) {
        // запрос описания с сервера
        const description = await this.helpDeskAPI.descriptionTickets(ticketID);

        // если описание есть, добавление описания в DOM
        if (description) { this.helpDeskDOM.createDescription(ticketID, description); }
      }
    }

    // клик по статусу
    if (dataID === 'completed') {
      // проверка описания, если есть, то удаляется из DOM
      const status = await this.helpDeskAPI.сompletedTicket(ticketID);
      this.helpDeskDOM.ticketCompleted(ticketID, status);
    }

    // клик по кнопке изменить
    if (dataID === 'edit') {
      // имя заявки из DOM
      const name = this.helpDeskDOM.ticketGetValue(ticketID);
      if (!name) { return; }

      // описание заявки из bakend
      const description = await this.helpDeskAPI.descriptionTickets(ticketID);

      // присвоение значений в форму
      this.helpDeskDOM.ticketFormChange(true, name, description, 'edit', ticketID);
    }

    // клик по кнопке удалить
    if (dataID === 'remove') {
      // вызов формы с уведомлением
      this.helpDeskDOM.ticketFormChange(true, '', '', 'delete', ticketID, 'delete');
    }
  }
}
