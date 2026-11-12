import createPlayer from './player';
import chapters from './registry';

const root = document.getElementById('app');
if (!root) throw new Error('Не найден корневой элемент прототипа.');
const dispose = createPlayer(root, chapters);

if (import.meta.hot) import.meta.hot.dispose(dispose);
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) dispose();
});
