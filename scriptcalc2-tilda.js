// Глобальные переменные для хранения данных расчета
let calculationData = {};

function calculateCeiling() {
    const area = parseFloat($('#area').val());
    let perimeter = $('#perimeter').val();
    const cassetteLength = parseInt($('#cassetteLength').val());
    const cassetteWidth = parseInt($('#cassetteWidth').val());
    const stockPercent = parseFloat($('#stockPercent').val());

    if (area < 30) {
        alert('Площадь помещения должна быть не менее 30 м²');
        return;
    }

    const cassetteLengthM = cassetteLength / 1000;
    const cassetteWidthM = cassetteWidth / 1000;

    const cassetteArea = cassetteLengthM * cassetteWidthM;
    const cassetteCountBasic = Math.ceil(area / cassetteArea);
    const cassetteCount = Math.ceil(cassetteCountBasic * stockPercent);

    const cassetteMetersByWidth = area / cassetteWidthM;
    const cassettesCountByFormula = cassetteMetersByWidth / cassetteLengthM;
    const zProfilePiecesBasic = Math.ceil(cassettesCountByFormula) + 1;
    const zProfileMetersBasic = zProfilePiecesBasic * cassetteWidthM;
    const zProfileCountBasic = Math.ceil(zProfileMetersBasic / 3);
    const zProfileCount = Math.ceil(zProfileCountBasic * stockPercent);

    const perfAngleMetersBasic = area * 0.9;
    const perfAngleCountBasic = Math.ceil(perfAngleMetersBasic / 3);
    const perfAngleCount = Math.ceil(perfAngleCountBasic * stockPercent);

    const spikeCountBasic = Math.ceil(area * 0.8);
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

    calculationData = {
        area: area,
        perimeter: perimeter || 'не указан',
        cassetteLength: cassetteLength,
        cassetteWidth: cassetteWidth,
        cassetteCount: cassetteCount,
        stockPercent: stockPercent,
        zProfileCount: zProfileCount,
        perfAngleCount: perfAngleCount,
        spikeCount: spikeCount,
        anchorCount: anchorCount,
        washerCount: washerCount,
        nutCount: nutCount,
        cornerCount: cornerCount,
        hasPerimeter: hasPerimeter
    };

    const cassetteName = `Потолочная кассета KIT HOOKON-ST ${cassetteLength}×${cassetteWidth} мм`;
    $('#cassetteName').text(cassetteName);

    $('#cassetteCount').text(cassetteCount);
    $('#zProfileCount').text(zProfileCount);
    $('#perfAngleCount').text(perfAngleCount);
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
    $('#cassetteLength').val('1200');
    $('#cassetteWidth').val('600');
    $('#stockPercent').val('1.02');
    $('#clientName').val('');
    $('#clientPhone').val('');
    $('#customColor').val('');
    
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

    let message = `Новая заявка на кассетный потолок HOOK ON

Клиент: ${name}
Телефон: ${phone}
Цвет: ${finalColor}

Параметры помещения:
Площадь: ${calculationData.area} м²
Периметр: ${calculationData.perimeter} м.п.

Параметры кассеты:
Размер: ${calculationData.cassetteLength}×${calculationData.cassetteWidth} мм
Запас материалов: ${Math.round((calculationData.stockPercent - 1) * 100)}%

Расчет материалов (с учетом запаса):
Потолочная кассета KIT HOOKON-ST ${calculationData.cassetteLength}×${calculationData.cassetteWidth} мм: ${calculationData.cassetteCount} шт.
Профиль подсистемы Z-Типа L=3000мм, оц. сталь: ${calculationData.zProfileCount} шт.
Уголок перфорированный L=3000мм, 30х30мм, оц. сталь: ${calculationData.perfAngleCount} шт.`;

    if (calculationData.hasPerimeter) {
        message += `\nПристенный уголок 3000мм: ${calculationData.cornerCount} шт.`;
    }

    message += `
Шпилька М6 1000мм: ${calculationData.spikeCount} шт.
Анкер цанга М6: ${calculationData.anchorCount} шт.
Шайба М6: ${calculationData.washerCount} шт.
Гайка М6: ${calculationData.nutCount} шт.`;

    if (typeof window.submitTildaCalcLead !== 'function') {
        alert('Подключите tilda-calc-form.js и задайте window.TILDA_CALC_FORM.');
        return;
    }

    submitTildaCalcLead({
        name: name,
        phone: phone,
        subject: 'Новая заявка на кассетный потолок HOOK ON',
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
    
    window.calculateCeiling = calculateCeiling;
    window.selectColor = selectColor;
    window.deselectColors = deselectColors;
    window.goBackToCalculator = goBackToCalculator;
    window.goToContactPage = goToContactPage;
    window.goBackToResults = goBackToResults;
    window.resetCalculator = resetCalculator;
    window.sendToEmail = sendToEmail;
    window.sendToMail = sendToEmail;
});
