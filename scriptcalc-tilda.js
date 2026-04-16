// Глобальные переменные для хранения данных расчета
let calculationData = {};

function calculateCeiling() {
    // Получаем значения из формы
    const area = parseFloat($('#area').val());
    let perimeter = $('#perimeter').val();
    const railWidth = parseInt($('#railWidth').val());
    const railHeight = parseInt($('#railHeight').val());
    const railStep = parseInt($('#railStep').val());
    const railLength = parseInt($('#railLength').val());
    const stockPercent = parseFloat($('#stockPercent').val());

    // Проверка минимальной площади
    if (area < 30) {
        alert('Площадь помещения должна быть не менее 30 м²');
        return;
    }

    // Проверка ширины рейки
    if (railWidth < 10 || railWidth > 300) {
        alert('Ширина рейки должна быть от 10 до 300 мм');
        return;
    }

    // Проверка высоты рейки
    if (railHeight < 20 || railHeight > 500) {
        alert('Высота рейки должна быть от 20 до 500 мм');
        return;
    }

    // Перевод мм в метры для расчетов
    const railWidthM = railWidth / 1000;
    const railStepM = railStep / 1000;

    // Расчет количества реек
    const usefulWidth = railWidthM + railStepM;
    const railCountBasic = Math.ceil(area / (railLength / 1000 * usefulWidth));
    
    // Добавляем выбранный запас
    const railCount = Math.ceil(railCountBasic * stockPercent);

    // Расчет погонных метров рейки
    const railMeters = (railCount * railLength / 1000).toFixed(1);

    // Расчет дополнительных материалов по нормам
    const grebMeters = area * 1.1;
    const grebCount = Math.ceil(grebMeters / 3);

    const spikeCount = Math.ceil(area * 1.2);
    const anchorCount = spikeCount;
    const washerCount = spikeCount * 2;
    const nutCount = spikeCount * 2;

    // Расчет пристенного уголка (только если указан периметр)
    let cornerCount = 0;
    let hasPerimeter = false;
    if (perimeter && perimeter > 0) {
        cornerCount = Math.ceil(perimeter / 3);
        hasPerimeter = true;
    }

    // Сохраняем данные для отправки
    calculationData = {
        area: area,
        perimeter: perimeter || 'не указан',
        railWidth: railWidth,
        railHeight: railHeight,
        railStep: railStep,
        railLength: railLength,
        railCount: railCount,
        railCountBasic: railCountBasic,
        railMeters: railMeters,
        stockPercent: stockPercent,
        grebCount: grebCount,
        spikeCount: spikeCount,
        anchorCount: anchorCount,
        washerCount: washerCount,
        nutCount: nutCount,
        cornerCount: cornerCount,
        hasPerimeter: hasPerimeter
    };

    // Обновляем название реечной системы
    const railSystemName = `Реечная система KIT BX-ST ${railLength}*${railWidth}*${railHeight} мм. Шаг между рейками ${railStep} мм`;
    $('#railSystemName').text(railSystemName);

    // Вывод результатов
    $('#railCount').text(railCount);
    $('#grebCount').text(grebCount);
    $('#spikeCount').text(spikeCount);
    $('#anchorCount').text(anchorCount);
    $('#washerCount').text(washerCount);
    $('#nutCount').text(nutCount);

    // Показываем или скрываем строку с пристенным уголком
    if (hasPerimeter) {
        $('#cornerCount').text(cornerCount);
        $('#cornerRow').show();
    } else {
        $('#cornerRow').hide();
    }

    // Переключаем страницы
    $('#calculator-page').hide();
    $('#results-page').show();
}

function selectColor(element) {
    $('.calc-color-option').removeClass('calc-selected');
    $(element).addClass('calc-selected');
    $('#customColor').val('');
}

function deselectColors() {
    $('.calc-color-option').removeClass('calc-selected');
}

function goBackToCalculator() {
    $('#results-page').hide();
    $('#calculator-page').show();
}

function goToContactPage() {
    $('#results-page').hide();
    $('#contact-page').show();
}

function goBackToResults() {
    $('#contact-page').hide();
    $('#results-page').show();
}

function resetCalculator() {
    $('#area').val('30');
    $('#perimeter').val('');
    $('#railWidth').val('50');
    $('#railHeight').val('50');
    $('#railStep').val('50');
    $('#railLength').val('3000');
    $('#stockPercent').val('1.02');
    $('#clientName').val('');
    $('#clientPhone').val('');
    $('#customColor').val('');
    $('.calc-color-option').first().click();
    
    $('#success-page').hide();
    $('#calculator-page').show();
}

function sendToEmail() {
    const name = $('#clientName').val();
    const phone = $('#clientPhone').val();
    const selectedColor = $('.calc-color-option.calc-selected').data('color');
    const customColor = $('#customColor').val();
    const finalColor = customColor || selectedColor;

    if (!finalColor) {
        alert('Пожалуйста, выберите цвет рейки или укажите свой вариант');
        return;
    }

    if (!name || !phone) {
        alert('Пожалуйста, заполните имя и телефон');
        return;
    }

    let message = `Новая заявка на реечный потолок KIT BX-ST

Клиент: ${name}
Телефон: ${phone}
Цвет: ${finalColor}

Параметры помещения:
Площадь: ${calculationData.area} м²
Периметр: ${calculationData.perimeter} м.п.

Параметры рейки:
Ширина: ${calculationData.railWidth} мм
Высота: ${calculationData.railHeight} мм
Шаг: ${calculationData.railStep} мм
Длина: ${calculationData.railLength} мм
Запас: ${Math.round((calculationData.stockPercent - 1) * 100)}%

Расчет материалов:
Реечная система KIT BX-ST ${calculationData.railLength}*${calculationData.railWidth}*${calculationData.railHeight} мм: ${calculationData.railCount} шт. (${calculationData.railMeters} м.п.)
Гребенка L=3000мм, оц. сталь, RAL 9005: ${calculationData.grebCount} шт.`;

    if (calculationData.hasPerimeter) {
        message += `\nПристенный уголок: ${calculationData.cornerCount} шт.`;
    }

    message += `
Шпилька М6: ${calculationData.spikeCount} шт.
Анкер цанга М6: ${calculationData.anchorCount} шт.
Шайба М6: ${calculationData.washerCount} шт.
Гайка М6: ${calculationData.nutCount} шт.`;

    if (typeof window.submitTildaCalcLead !== 'function') {
        alert('Подключите tilda-calc-form.js и задайте window.TILDA_CALC_FORM (см. комментарий в начале tilda-calc-form.js).');
        return;
    }

    submitTildaCalcLead({
        name: name,
        phone: phone,
        subject: 'Новая заявка на реечный потолок KIT BX-ST',
        message: message
    });
}

$(document).ready(function() {
    $('#clientPhone').mask('+7 (000) 000-00-00');
    
    $('.calc-unit-input input').on('input', function() {
        const value = $(this).val();
    });
    
    $('.calc-color-option').first().addClass('calc-selected');

    if (typeof window.initTildaCalcFormBridge === 'function') {
        initTildaCalcFormBridge({
            onSuccess: function () {
                $('#contact-page').hide();
                $('#success-page').show();
            }
        });
    }
    
    window.sendToEmail = sendToEmail;
    window.sendToMail = sendToEmail;
});
