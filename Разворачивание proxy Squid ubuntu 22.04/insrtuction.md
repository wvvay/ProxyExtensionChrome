# Настройка Squid Proxy Server

Этот гайд поможет вам настроить **Squid Proxy Server** на VPS сервере, а также настроить аутентификацию через логин и пароль.

## Шаг 1: Обновление системы

1. Обновим список пакетов и установим обновления:

    ```bash
    sudo apt update && sudo apt upgrade -y
    ```

## Шаг 2: Установка Squid Proxy

1. Устанавливаем **Squid**:

    ```bash
    sudo apt install squid -y
    ```

## Шаг 3: Установка Apache Utils для работы с паролями

1. Устанавливаем **apache2-utils**, который необходим для создания паролей пользователей:

    ```bash
    sudo apt install apache2-utils -y
    ```

## Шаг 4: Создание паролей для пользователей

1. Создаем файл паролей и добавляем первого пользователя (замените `user1` на нужное имя пользователя):

    ```bash
    sudo htpasswd -c /etc/squid/passwd user1
    ```

2. Для добавления других пользователей, используем команду без флага `-c`:

    ```bash
    sudo htpasswd /etc/squid/passwd user2
    ```

## Шаг 5: Резервное копирование конфигурации

1. Сделаем резервную копию текущего конфигурационного файла Squid:

    ```bash
    sudo cp /etc/squid/squid.conf /etc/squid/squid.conf.bak
    ```

## Шаг 6: Редактирование конфигурации Squid

1. Открываем конфигурационный файл Squid для редактирования:

    ```bash
    sudo nano /etc/squid/squid.conf
    ```

2. Вносим следующие изменения:

### Разрешённые сети

Добавьте следующие строки, чтобы указать, какие сети разрешены для доступа (по умолчанию — локальная сеть):

    ```bash
    acl localnet src 0.0.0.1-0.255.255.255
    acl localnet src 10.0.0.0/8
    acl localnet src 100.64.0.0/10
    acl localnet src 169.254.0.0/16
    acl localnet src 172.16.0.0/12
    acl localnet src 192.168.0.0/16
    acl localnet src fc00::/7
    acl localnet src fe80::/10
    ```

### Определение безопасных портов

    ```bash
    acl SSL_ports port 443
    acl Safe_ports port 80
    acl Safe_ports port 21
    acl Safe_ports port 443
    acl Safe_ports port 70
    acl Safe_ports port 210
    acl Safe_ports port 1025-65535
    acl Safe_ports port 280
    acl Safe_ports port 488
    acl Safe_ports port 591
    acl Safe_ports port 777
    ```

### Запрет на небезопасные порты

    ```bash
    http_access deny !Safe_ports
    http_access deny CONNECT !SSL_ports
    ```

### Доступ к `cachemgr` только с локального хоста

    ```bash
    http_access allow localhost manager
    http_access deny manager
    ```

### Разрешить локальный доступ

    ```bash
    http_access allow localhost
    ```

### Настройка аутентификации

1. Настройка аутентификации через логин/пароль:

    ```bash
    auth_param basic program /usr/lib/squid/basic_ncsa_auth /etc/squid/passwd
    auth_param basic realm Proxy
    auth_param basic credentialsttl 2 hours
    acl auth_users proxy_auth REQUIRED
    http_access allow auth_users
    ```

### Запрещаем всех остальных пользователей

    ```bash
    http_access deny all
    ```

### Настройка порта для работы Squid

    ```bash
    http_port 8888
    ```

### Установка директории для дампов

    ```bash
    coredump_dir /var/spool/squid
    ```

### Паттерны обновления кеша

    ```bash
    refresh_pattern ^ftp:           1440    20%     10080
    refresh_pattern ^gopher:        1440    0%      1440
    refresh_pattern -i (/cgi-bin/|\?) 0     0%      0
    refresh_pattern \/(Packages|Sources)(|\.bz2|\.gz|\.xz)$ 0 0% 0 refresh-ims
    refresh_pattern \/Release(|\.gpg)$ 0 0% 0 refresh-ims
    refresh_pattern \/InRelease$ 0 0% 0 refresh-ims
    refresh_pattern \/(Translation-.*)(|\.bz2|\.gz|\.xz)$ 0 0% 0 refresh-ims
    # example pattern for deb packages
    #refresh_pattern (\.deb|\.udeb)$   129600 100% 129600
    refresh_pattern .               0       20%     4320
    ```

## Шаг 7: Перезапуск Squid

1. После внесения изменений, перезапустите **Squid**:

    ```bash
    sudo systemctl restart squid
    ```

## Шаг 8: Просмотр логов

1. Логи доступа можно найти в следующем файле:

    ```bash
    /var/log/squid/access.log
    ```

2. Логи кеша:

    ```bash
    /var/log/squid/cache.log
    ```

## Примечания

- **Порты**: По умолчанию, **Squid** работает на порту 3128, но в данном примере мы настроили его на порт 8888. Вы можете изменить это в настройках.
- **Логи**: Все запросы и доступы через прокси-сервер будут записываться в логи, что поможет вам отслеживать работу сервера.
- **Аутентификация**: В данной настройке для подключения к прокси требуется ввести логин и пароль. Настроена базовая аутентификация через файл паролей.
