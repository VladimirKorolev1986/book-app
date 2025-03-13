import { AbstractView } from '../../common/view.js';
import onChange from 'on-change';
import { Header } from '../../components/header/header.js';
import { Search } from '../../components/search/search.js';
import { CardList } from '../../components/card-list/card-list.js';

export class MainView extends AbstractView {
  state = {
    list: [], //список книг
    numFound: 0,
    loading: false, //флаг загрузки
    searchQuery: undefined, //строка поиска
    offset: 0, // смещение для пагинации
  };
  constructor(appState) {
    super();
    this.appState = appState;
    this.appState = onChange(this.appState, this.appStateHook.bind(this)); // отслеживаем состояние appState
    this.state = onChange(this.state, this.stateHook.bind(this)); // отслеживаем состояние state
    this.setTitle('Поиск книг'); // устанавливаем заголовок
  }

  appStateHook(path) {
    // вызывается при изменении appState
    if (path == 'favorites') {
      console.log(path);
    }
  }

  async stateHook(path) {
    if (path == 'searchQuery') {
      this.state.loading = true;
      const data = await this.loadList(
        this.state.searchQuery,
        this.state.offset
      );
      this.state.loading = false;
      console.log(data);
      this.state.numFound = data.numFound;
      this.state.list = data.docs;
    }

    if (path === 'list' || path === 'loading') {
      this.render();
    }
  }

  async loadList(q, offset) {
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${q}&offset=${offset}`
    );
    return res.json();
  }

  render() {
    const main = document.createElement('div');
    main.append(new Search(this.state).render());
    main.append(new CardList(this.appState, this.state).render());
    this.app.innerHTML = '';
    this.app.append(main);
    this.renderHeader();
  }

  renderHeader() {
    const header = new Header(this.appState).render();
    this.app.prepend(header);
  }
}
