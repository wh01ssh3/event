CONVENTIONS
===========

1 Обработка ошибок
-----------------

### 1.1 Обработка ошибок в контроллерах

Каждый контроллер должен возвращать объект promise. Цепочка промисов в контроллере
должна завершаться вызвовом метода catch, который выглядит следующим образом:
```
.catch((err) => { return next(err instanceof Error ? err : new VError(err)); });
```
