// Глобальные переменные для хранения данных расчета
let calculationDataClipIn = {};

function selectCassetteType(element) {
    $('.calc-cassette-type-option').removeClass('calc-selected');
    $(element).addClass('calc-selected');
}

function calculateCeilingClipIn() {
    const area = parseFloat($('#area').val());
    let perimeter = $('#perimeter').val();
    const stockPercent = parseFloat($('#stockPercent').val());

    const selectedCassette = $('.calc-cassette-type-option.calc-selected');
    if (selectedCassette.length === 0) {
        alert('Пожалуйста, выберите тип кассеты');
        return;
    }

    const cassetteType = selectedCassette.data('cassette-type');
    const cassetteArea = parseFloat(selectedCassette.data('cassette-area'));
    const cassetteWidth = parseInt(selectedCassette.data('cassette-width'));
    const cassetteSizeText = cassetteType.replace('x', '×') + ' мм';

    if (area < 30) {
        alert('Площадь помещения должна быть не менее 30 м²');
        return;
    }

    if (perimeter && perimeter > 0) {
        const perimeterValue = parseFloat(perimeter);
        const squareSide = Math.sqrt(area);
        const squarePerimeter = squareSide * 4;
        
        if (perimeterValue < (squarePerimeter - 20)) {
            alert(`Ошибка: Введенный периметр (${perimeterValue} м.п.) слишком мал.\n` +
                  `Для площади ${area} м² минимальный разумный периметр: ${(squarePerimeter - 20).toFixed(1)} м.п.\n` +
                  `Проверьте введенные данные или оставьте поле периметра пустым.`);
            return;
        }
    }

    let stringerNorm, connectorNorm, spikeNorm;
    
    if (cassetteWidth === 600) {
        stringerNorm = 1.67;
        connectorNorm = 1.67;
        spikeNorm = 1.67;
    } else if (cassetteWidth === 300) {
        stringerNorm = 3.33;
        connectorNorm = 3.33;
        spikeNorm = 3.33;
    } else {
        stringerNorm = 1.67;
        connectorNorm = 1.67;
        spikeNorm = 1.67;
    }

    const cassetteCountBasic = Math.ceil(area / cassetteArea);
    const cassetteCount = Math.ceil(cassetteCountBasic * stockPercent);

    const stringerMetersBasic = area * stringerNorm;
    const stringerCountBasic = Math.ceil(stringerMetersBasic / 4);
    const stringerCount = Math.ceil(stringerCountBasic * stockPercent);

    const crossProfileMetersBasic = area * 1;
    const crossProfileCountBasic = Math.ceil(crossProfileMetersBasic / 4);
    const crossProfileCount = Math.ceil(crossProfileCountBasic * stockPercent);

    const connectorCountBasic = Math.ceil(area * connectorNorm);
    const connectorCount = Math.ceil(connectorCountBasic * stockPercent);

    const spikeCountBasic = Math.ceil(area * spikeNorm);
    const anchorCountBasic = spikeCountBasic;
    const washerCountBasic = spikeCountBasic * 2;
    const nutCountBasic = spikeCountBasic * 2;
    
    const spikeCount = Math.ceil(spikeCountBasic * stockPercent);
    const anchorCount = Math.ceil(anchorCountBasic * stockPercent);
    const washerCount = Math.ceil(washerCountBasic * stockPercent);
    const nutCount = Math.ceil(nutCountBasic * stockPercent);

    let cornerCount = 0;
    let hasPerimeter = false;
    if (perimeter && perimeter > 0) {
        const cornerMeters = parseFloat(perimeter);
        const cornerCountBasic = Math.ceil(cornerMeters / 3);
        cornerCount = Math.ceil(cornerCountBasic * stockPercent);
        hasPerimeter = true;
    }

    calculationDataClipIn = {
        area: area,
        perimeter: perimeter || 'не указан',
        cassetteSizeText: cassetteSizeText,
        cassetteCount: cassetteCount,
        stockPercent: stockPercent,
        stringerCount: stringerCount,
        crossProfileCount: crossProfileCount,
        connectorCount: connectorCount,
        spikeCount: spikeCount,
        anchorCount: anchorCount,
        washerCount: washerCount,
        nutCount: nutCount,
        cornerCount: cornerCount,
        hasPerimeter: hasPerimeter
    };

    const cassetteName = `Кассета потолочная KIT CLIPIN-ST ${cassetteSizeText}`;
    $('#cassetteName').text(cassetteName);

    $('#cassetteCount').text(cassetteCount);
    $('#stringerCount').text(stringerCount);
    $('#crossProfileCount').text(crossProfileCount);
    $('#connectorCount').text(connectorCount);
    $('#spikeCount').text(spikeCount);
    $('#anchorCount').text(anchorCount);
    $('#washerCount').text(washerCount);
    $('#nutCount').text(nutCount);

    if (hasPerimeter) {
        $('#cornerCount').text(cornerCount);
        $('#cornerRow').show();
    } else {
        $('#cornerRow').hide();
    }

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
    $('#stockPercent').val('1.05');
    $('#clientName').val('');
    $('#clientPhone').val('');
    $('#customColor').val('');
    
    $('.calc-cassette-type-option').removeClass('calc-selected');
    $('.calc-cassette-type-option').first().addClass('calc-selected');
    
    $('.calc-color-option').removeClass('calc-selected');
    $('.calc-color-option').first().addClass('calc-selected');
    
    $('#success-page').hide();
    $('#contact-page').hide();
    $('#results-page').hide();
    $('#calculator-page').show();
}

function sendToEmail() {
    const name = $('#clientName').val();
    const phone = $('#clientPhone').val();
    const selectedColor = $('.calc-color-option.calc-selected').data('color');
    const customColor = $('#customColor').val();
    const finalColor = customColor || selectedColor;

    if (!finalColor) {
        alert('Пожалуйста, выберите цвет кассеты или укажите свой вариант');
        return;
    }

    if (!name || !phone) {
        alert('Пожалуйста, заполните имя и телефон');
        return;
    }

    let message = `Новая заявка на кассетный потолок CLIP-IN

Клиент: ${name}
Телефон: ${phone}
Цвет: ${finalColor}

Параметры помещения:
Площадь: ${calculationDataClipIn.area} м²
Периметр: ${calculationDataClipIn.perimeter} м.п.

Параметры кассеты:
Габарит: ${calculationDataClipIn.cassetteSizeText}
Запас материалов: ${Math.round((calculationDataClipIn.stockPercent - 1) * 100)}%

Расчет материалов (с учетом запаса):
Кассета потолочная CLIP-IN ${calculationDataClipIn.cassetteSizeText}: ${calculationDataClipIn.cassetteCount} шт.
Стрингер L=4000мм: ${calculationDataClipIn.stringerCount} шт.
Поперечный профиль L=4000мм: ${calculationDataClipIn.crossProfileCount} шт.
Двухуровневый соединитель: ${calculationDataClipIn.connectorCount} шт.`;

    if (calculationDataClipIn.hasPerimeter) {
        message += `\nПристенный уголок 3000мм: ${calculationDataClipIn.cornerCount} шт.`;
    }

    message += `
Шпилька М6 1000мм: ${calculationDataClipIn.spikeCount} шт.
Анкер цанга М6: ${calculationDataClipIn.anchorCount} шт.
Шайба М6: ${calculationDataClipIn.washerCount} шт.
Гайка М6: ${calculationDataClipIn.nutCount} шт.`;

    if (typeof window.submitTildaCalcLead !== 'function') {
        alert('Подключите tilda-calc-form.js и задайте window.TILDA_CALC_FORM.');
        return;
    }

    submitTildaCalcLead({
        name: name,
        phone: phone,
        subject: 'Новая заявка на кассетный потолок CLIP-IN',
        message: message
    });
}

$(document).ready(function() {
    $('#clientPhone').mask('+7 (000) 000-00-00');
    
    $('.calc-color-option').first().addClass('calc-selected');

    if (typeof window.initTildaCalcFormBridge === 'function') {
        initTildaCalcFormBridge({
            onSuccess: function () {
                $('#contact-page').hide();
                $('#success-page').show();
            }
        });
    }
    
    window.calculateCeilingClipIn = calculateCeilingClipIn;
    window.selectCassetteType = selectCassetteType;
    window.selectColor = selectColor;
    window.deselectColors = deselectColors;
    window.goBackToCalculator = goBackToCalculator;
    window.goToContactPage = goToContactPage;
    window.goBackToResults = goBackToResults;
    window.resetCalculator = resetCalculator;
    window.sendToEmail = sendToEmail;
    window.sendToMail = sendToEmail;
});
