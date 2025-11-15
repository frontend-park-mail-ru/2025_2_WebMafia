import { support } from '../../components/tech_support/supporPage.js';
import { apiServise } from '../../data.js';
import { router } from '../../routing.js';
import { initScrollbar } from '../../scrollbar.js';

export class EditProblem {
  async render() {
    try {
      // 1. Сначала получаем все данные по тикетам
      const data = await apiServise.getUserTickets();
      const iframeContent = document.getElementById('iframeSupport');

      // 2. Назначаем ОДИН обработчик onload. Используем стрелочную функцию '() =>'
      // чтобы сохранить правильный 'this' (контекст класса EditProblem)
      iframeContent.onload = () => {
        try {
          const iframeDoc = iframeContent.contentWindow.document;

          // 3. Получаем ID из data-атрибута кнопки внутри iframe
          const button = iframeDoc.getElementById('supportCards'); // Предполагается, что кнопка уже есть в iframe
          if (!button) {
            console.error('Кнопка с ID "supportCards" не найдена в iframe.');
            return;
          }
          const neededId = button.dataset.trackId;

          // 4. Находим нужный тикет с помощью более удобного метода .find()
          // Приводим оба значения к строке для надежного сравнения
          const foundTicket = data.tickets.find(ticket => String(ticket.id) === String(neededId));

          // 5. Проверяем, был ли тикет найден
          if (!foundTicket) {
            console.error('Тикет с ID', neededId, 'не найден.');
            // Можно показать сообщение об ошибке пользователю
            return;
          }

          // 6. Готовим данные для шаблона на основе ОДНОГО найденного тикета
          let pageData = {
            isAuthenticated: true,
            title: foundTicket.title,
            description: foundTicket.description, // Используем description, как вы просили
            // Если нужно передать и другие поля, добавьте их сюда
            // id: foundTicket.id, 
          };

          // 7. Рендерим новый шаблон (форму редактирования) с найденными данными
          const contentTemplateProblem = Handlebars.templates['create_problem.hbs'];
          // Заменяем содержимое iframe на новую форму редактирования
          iframeDoc.body.innerHTML = contentTemplateProblem(pageData);

          // 8. После рендера нового контента, добавляем слушатели событий на его элементы
          this.addEventListenersAfterRender(iframeDoc, foundTicket.id);
          initScrollbar(); // Если скроллбар относится к iframe

        } catch (e) {
          console.error('Ошибка при работе с содержимым iframe:', e);
        }
      };


    } catch (error) {
      console.error('Failed to load user data:', error);
      localStorage.removeItem('isAuthenticated');
      router.navigate('/');
    }

    // Метод render может возвращать пустую строку или базовый HTML, 
    // который будет заменен после загрузки iframe
    return ''; 
  }

  addEventListeners() {
    const iframeContent = document.getElementById('iframeSupport');
    iframeContent.onload = function () {
      try {
        const iframeDoc = iframeContent.contentWindow.document;
        const editSubmitBtn = iframeDoc.getElementById('edit-submit-btn');
        const backSupportBtn = iframeDoc.getElementById('backSupportBtn');
        const title = iframeDoc.getElementById('support-subject');
        const description = iframeDoc.getElementById('support-description');
        editSubmitBtn.addEventListener('click', () => {
          const titleVal = title.value;
          const descriptionVal = description.value;
          const response = apiServise.PullProblem(titleVal, descriptionVal);
        });
        backSupportBtn.addEventListener('click', async function () {
          document.getElementById('iframeSupport').srcdoc = await support.render();
        });
      } catch (e) {
        console.error('Ошибка доступа к iframe:', e);
      }
    };
  }
}

export const editProblem = new EditProblem();
