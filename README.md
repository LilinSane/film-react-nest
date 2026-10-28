# FILM!

## Установка

### MongoDB

Установите MongoDB скачав дистрибутив с официального сайта или с помощью пакетного менеджера вашей ОС. Также можно воспользоваться Docker (см. ветку `feat/docker`.

Выполните скрипт `test/mongodb_initial_stub.js` в консоли `mongo`.

### Бэкенд

Перейдите в папку с исходным кодом бэкенда

`cd backend`

Установите зависимости (точно такие же, как в package-lock.json) помощью команд

`npm ci` или `yarn install --frozen-lockfile`

Создайте `.env` файл из примера `.env.example`, в нём укажите:

* `DATABASE_DRIVER` - тип драйвера СУБД - в нашем случае это `mongodb` 
* `DATABASE_URL` - адрес СУБД MongoDB, например `mongodb://127.0.0.1:27017/practicum`.  

MongoDB должна быть установлена и запущена.

Запустите бэкенд:

`npm start:debug`

Для проверки отправьте тестовый запрос с помощью Postman или `curl`.


## Деплой

- GitHub Actions: https://github.com/LilinSane/film-react-nest/actions/runs/40657593376
- Образ backend: https://github.com/LilinSane/film-react-nest/pkgs/container/film-react-nest-backend
- Образ frontend: https://github.com/LilinSane/film-react-nest/pkgs/container/film-react-nest-frontend
- Образ nginx: https://github.com/LilinSane/film-react-nest/pkgs/container/film-react-nest-nginx

Скриншот успешной работы:

![img.png](img.png)