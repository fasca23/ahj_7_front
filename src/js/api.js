export default class API {
  constructor(url) {
    this.baseURL = url;
  }

  static options(method, urlParam, body) {
    const value = {
      method,
      body: JSON.stringify(body),
      urlParam,
    };

    return value;
  }

  async createRequest(options) {
    const { method, urlParam, body } = options;

    const newUrl = `${this.baseURL}/${urlParam}`;

    const response = await fetch(newUrl, {
      method,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body,
    });

    const result = await response.json();

    if (!result) { return false; }

    return result;
  }

  // создание заявки
  async createTicket(body) {
    // опции и запрос
    const options = this.constructor.options('POST', '?method=createTicket', body);
    const response = await this.createRequest(options);

    // проверка объекта
    const { created } = response;

    return created;
  }

  // удалить заявку
  async removeTicket(ticketID) {
    // опции для запроса и запрос на сервер
    const options = this.constructor.options('DELETE', `?method=removeTicket&id=${ticketID}`);
    const response = await this.createRequest(options);
    const { removed } = response;
    return removed;
  }

  // получить заявки
  async allTickets() {
    const options = this.constructor.options('GET', '?method=allTickets');
    const response = await this.createRequest(options);
    const { tickets } = response;
    return tickets;
  }

  // описание заявки
  async descriptionTickets(ticketID) {
    const options = this.constructor.options('GET', `?method=ticketById&id=${ticketID}`);
    const response = await this.createRequest(options);
    const { description } = response;
    return description;
  }

  // статус заявки
  async сompletedTicket(ticketID) {
    const options = this.constructor.options('PUT', `?method=ticketCompleted&id=${ticketID}`);
    const response = await this.createRequest(options);
    const { status } = response;
    return status;
  }

  // изменение заявки
  async editTicket(ticketID, body) {
    const options = this.constructor.options('PUT', `?method=ticketEdit&id=${ticketID}`, body);
    const response = await this.createRequest(options);
    const { edited } = response;
    return edited;
  }
}
