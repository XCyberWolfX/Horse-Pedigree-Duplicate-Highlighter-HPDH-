// ==UserScript==
// @name         Horse Pedigree Duplicate Highlighter
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Подсвечивает красным имена лошадей, которые повторяются 5 коленах родословной
// @author       XCyberWolfX
// @match        https://www.horseworldonline.net/horse/profile/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Функция для сбора всех имён лошадей из родословной
    function collectHorseNames() {
        const pedigreeContainer = document.getElementById('pedigree-container');
        if (!pedigreeContainer) return [];

        const names = [];
        // Ищем все элементы с именами лошадей в родословной
        const nameElements = pedigreeContainer.querySelectorAll('.pedigree-details a, .pedigree-details b');

        nameElements.forEach(el => {
            const text = el.textContent.trim();
            if (text && text.length > 0) {
                names.push({
                    name: text,
                    element: el
                });
            }
        });

        return names;
    }

    // Функция для подсчёта повторений имён
    function findDuplicates(horseData) {
        const nameCount = {};

        // Считаем количество каждого имени
        horseData.forEach(horse => {
            const name = horse.name;
            nameCount[name] = (nameCount[name] || 0) + 1;
        });

        // Возвращаем имена, которые встречаются 5+ раз
        const duplicates = new Set();
        for (const [name, count] of Object.entries(nameCount)) {
            if (count >= 3) {
                duplicates.add(name);
            }
        }

        return duplicates;
    }

    // Функция для подсветки дубликатов
    function highlightDuplicates(horseData, duplicateNames) {
        horseData.forEach(horse => {
            if (duplicateNames.has(horse.name)) {
                horse.element.style.color = 'red';
                horse.element.style.fontWeight = 'bold';
            }
        });
    }

    // Основная функция запуска
    function run() {
        // Проверяем, что мы на странице профиля
        if (!window.location.href.match(/https:\/\/www\.horseworldonline\.net\/horse\/profile\//)) {
            return;
        }

        const pedigreeContainer = document.getElementById('pedigree-container');
        if (!pedigreeContainer) {
            console.log('[Pedigree Highlighter] Контейнер родословной не найден');
            return;
        }

        // Собираем все имена
        const horseData = collectHorseNames();

        if (horseData.length === 0) {
            console.log('[Pedigree Highlighter] Имена лошадей не найдены');
            return;
        }

        // Находим дубликаты (5+ повторений)
        const duplicates = findDuplicates(horseData);

        if (duplicates.size === 0) {
            console.log('[Pedigree Highlighter] Дубликатов с 2+ повторениями не найдено');
            return;
        }

        // Подсвечиваем дубликаты
        highlightDuplicates(horseData, duplicates);

        console.log(`[Pedigree Highlighter] Найдено ${duplicates.size} имён с повторениями 2+ раз:`, [...duplicates]);
    }

    // Запускаем после полной загрузки документа
    if (document.readyState === 'complete') {
        run();
    } else {
        window.addEventListener('load', run);
    }

    // Также наблюдаем за изменениями в DOM (на случай динамической подгрузки)
    const observer = new MutationObserver(function(mutations) {
        const pedigreeContainer = document.getElementById('pedigree-container');
        if (pedigreeContainer) {
            // Небольшая задержка перед повторным запуском
            setTimeout(run, 100);
        }
    });

    // Начинаем наблюдение после загрузки
    window.addEventListener('load', function() {
        const pedigreeContainer = document.getElementById('pedigree-container');
        if (pedigreeContainer) {
            observer.observe(pedigreeContainer, {
                childList: true,
                subtree: true
            });
        }
    });

})();
