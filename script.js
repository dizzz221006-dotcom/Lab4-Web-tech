// Массив для хранения сохраненных регистраций
const registrations = [];

// 1. ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ (Theme switcher)
const themeBtn = document.querySelector('#theme-btn');
themeBtn.addEventListener('click', function() {
    document.body.classList.toggle('dark-theme');
    if (document.body.classList.contains('dark-theme')) {
        themeBtn.textContent = 'Светлая тема';
    } else {
        themeBtn.textContent = 'Темная тема';
    }
});

// 2. ВЫБОР МЕРОПРИЯТИЯ (Event selection)
const eventCards = document.querySelectorAll('.event-card');
const selectedEventInput = document.querySelector('#selected-event-input');
let chosenEventTitle = '';

eventCards.forEach(card => {
    const selectBtn = card.querySelector('.select-btn');
    selectBtn.addEventListener('click', function() {
        // Убираем подсветку со всех карточек
        eventCards.forEach(c => c.classList.remove('selected-event'));
        // Добавляем класс выбранной карточке
        card.classList.add('selected-event');
        // Запоминаем название и выводим в поле формы
        chosenEventTitle = card.getAttribute('data-title');
        selectedEventInput.value = chosenEventTitle;

        // Очищаем ошибку выбора, если она была
        document.querySelector('#event-error').textContent = '';
    });
});

// 3. ЖИВАЯ ОБРАТНАЯ СВЯЗЬ (Live feedback - счетчик символов)
const fullNameInput = document.querySelector('#full-name');
const charCounter = document.querySelector('.char-counter');
fullNameInput.addEventListener('input', function() {
    const length = fullNameInput.value.length;
    charCounter.textContent = `Введено символов: ${length}`;
});

// 4. ФУНКЦИЯ ВАЛИДАЦИИ (Validation function)
function validateForm(name, email, group, event, agreement) {
    let isValid = true;

    // Проверка имени (минимум 3 символа)
    const nameError = document.querySelector('#name-error');
    if (name.trim().length < 3) {
        nameError.textContent = 'Имя должно содержать не менее 3 символов.';
        fullNameInput.classList.add('input-error');
        isValid = false;
    } else {
        nameError.textContent = '';
        fullNameInput.classList.remove('input-error');
    }

    // Проверка Email
    const emailInput = document.querySelector('#email');
    const emailError = document.querySelector('#email-error');
    if (!email.includes('@') || !email.includes('.')) {
        emailError.textContent = 'Введите корректный email адрес.';
        emailInput.classList.add('input-error');
        isValid = false;
    } else {
        emailError.textContent = '';
        emailInput.classList.remove('input-error');
    }

    // Проверка группы
    const groupInput = document.querySelector('#student-group');
    const groupError = document.querySelector('#group-error');
    if (group.trim() === '') {
        groupError.textContent = 'Укажите учебную группу.';
        groupInput.classList.add('input-error');
        isValid = false;
    } else {
        groupError.textContent = '';
        groupInput.classList.remove('input-error');
    }

    // Проверка выбранного мероприятия
    const eventError = document.querySelector('#event-error');
    if (!event) {
        eventError.textContent = 'Пожалуйста, выберите мероприятие вверху страницы.';
        isValid = false;
    } else {
        eventError.textContent = '';
    }

    // Проверка чекбокса согласия
    const agreementError = document.querySelector('#agreement-error');
    if (!agreement) {
        agreementError.textContent = 'Необходимо согласиться с правилами.';
        isValid = false;
    } else {
        agreementError.textContent = '';
    }

    return isValid;
}

// Отслеживание изменения чекбокса (событие change)
const agreementCheckbox = document.querySelector('#agreement');
agreementCheckbox.addEventListener('change', function() {
    if (agreementCheckbox.checked) {
        document.querySelector('#agreement-error').textContent = '';
    }
});

// 5. ОБРАБОТКА ОТПРАВКИ ФОРМЫ (Form submission)
const form = document.querySelector('#registration-form');
form.addEventListener('submit', function(event) {
    // Отменяем стандартную перезагрузку страницы
    event.preventDefault();

    const nameValue = fullNameInput.value;
    const emailValue = document.querySelector('#email').value;
    const groupValue = document.querySelector('#student-group').value;
    const agreementChecked = agreementCheckbox.checked;

    // Запускаем валидацию
    if (validateForm(nameValue, emailValue, groupValue, chosenEventTitle, agreementChecked)) {
        // Создаем объект регистрации
        const newRegistration = {
            name: nameValue,
            email: emailValue,
            group: groupValue,
            event: chosenEventTitle
        };

        // Сохраняем в массив и рендерим
        registrations.push(newRegistration);
        renderRegistrations();

        // Сбрасываем форму
        form.reset();
        charCounter.textContent = 'Введено символов: 0';
        selectedEventInput.value = '';
        chosenEventTitle = '';
        eventCards.forEach(c => c.classList.remove('selected-event'));
    }
});

// Функция для отображения успешных регистраций через createElement
function renderRegistrations() {
    const resultsContainer = document.querySelector('#results-container');
    resultsContainer.innerHTML = ''; // Очищаем контейнер перед выводом

    registrations.forEach(reg => {
        const item = document.createElement('div');
        item.classList.add('result-item');

        const title = document.createElement('h4');
        title.textContent = `Мероприятие: ${reg.event}`;

        const desc = document.createElement('p');
        desc.textContent = `Участник: ${reg.name} | Email: ${reg.email} | Группа: ${reg.group}`;

        item.appendChild(title);
        item.appendChild(desc);
        resultsContainer.appendChild(item);
    });
}

// 6. РАБОТА С REST API (Загрузка гостей через fetch)
const loadGuestsBtn = document.querySelector('#load-guests-btn');
const guestsContainer = document.querySelector('#guests-container');
const apiStatus = document.querySelector('#api-status');

loadGuestsBtn.addEventListener('click', async function() {
    try {
        // Индикатор загрузки
        apiStatus.textContent = 'Загрузка гостей...';
        guestsContainer.innerHTML = '';

        // Отправка запроса (GET)
        const response = await fetch('https://jsonplaceholder.typicode.com/users');

        if (!response.ok) {
            throw new Error('Ошибка сервера при загрузке данных');
        }

        const guests = await response.json();
        apiStatus.textContent = ''; // Убираем статус загрузки

        // Берем первые 5 пользователей из ответа API
        const firstFiveGuests = guests.slice(0, 5);

        firstFiveGuests.forEach(guest => {
            const guestCard = document.createElement('div');
            guestCard.classList.add('guest-card');

            const nameEl = document.createElement('h4');
            nameEl.textContent = guest.name;

            const emailEl = document.createElement('p');
            emailEl.textContent = `Email: ${guest.email}`;

            const webEl = document.createElement('p');
            webEl.textContent = `Сайт: ${guest.website}`;

            guestCard.appendChild(nameEl);
            guestCard.appendChild(emailEl);
            guestCard.appendChild(webEl);

            guestsContainer.appendChild(guestCard);
        });

    } catch (error) {
        apiStatus.textContent = 'Не удалось загрузить гостей: ' + error.message;
    }
});