/**
 * Реечный потолок KIT BX-ST.
 * Несколько калькуляторов на одной странице: задайте window.TILDA_CALC_MULTI_MODE = true
 * и window.TILDA_CALC_ROOT_RAIL = '#id-обертки-попапа' до подключения скрипта.
 * В разметке вызывайте TildaCalc.rail.calculateCeiling() и т.д. (см. объект api после mount).
 * Один калькулятор на странице: по умолчанию mount к body, глобалы calculateCeiling / sendToEmail сохраняются.
 */
(function (window, $) {
    window.TildaCalc = window.TildaCalc || {};

    function mountRail(rootSelector) {
        var $root = $(rootSelector);
        if (!$root.length) return null;

        var calculationData = {};

        function $q(sel) {
            return $root.find(sel);
        }

        function calculateCeiling() {
            var area = parseFloat($q('#area').val());
            var perimeter = $q('#perimeter').val();
            var railWidth = parseInt($q('#railWidth').val(), 10);
            var railHeight = parseInt($q('#railHeight').val(), 10);
            var railStep = parseInt($q('#railStep').val(), 10);
            var railLength = parseInt($q('#railLength').val(), 10);
            var stockPercent = parseFloat($q('#stockPercent').val());

            if (area < 30) {
                alert('Площадь помещения должна быть не менее 30 м²');
                return;
            }

            if (railWidth < 10 || railWidth > 300) {
                alert('Ширина рейки должна быть от 10 до 300 мм');
                return;
            }

            if (railHeight < 20 || railHeight > 500) {
                alert('Высота рейки должна быть от 20 до 500 мм');
                return;
            }

            var railWidthM = railWidth / 1000;
            var railStepM = railStep / 1000;

            var usefulWidth = railWidthM + railStepM;
            var railCountBasic = Math.ceil(area / (railLength / 1000 * usefulWidth));

            var railCount = Math.ceil(railCountBasic * stockPercent);

            var railMeters = (railCount * railLength / 1000).toFixed(1);

            var grebMeters = area * 1.1;
            var grebCount = Math.ceil(grebMeters / 3);

            var spikeCount = Math.ceil(area * 1.2);
            var anchorCount = spikeCount;
            var washerCount = spikeCount * 2;
            var nutCount = spikeCount * 2;

            var cornerCount = 0;
            var hasPerimeter = false;
            if (perimeter && perimeter > 0) {
                cornerCount = Math.ceil(perimeter / 3);
                hasPerimeter = true;
            }

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

            var railSystemName = 'Реечная система KIT BX-ST ' + railLength + '*' + railWidth + '*' + railHeight + ' мм. Шаг между рейками ' + railStep + ' мм';
            $q('#railSystemName').text(railSystemName);

            $q('#railCount').text(railCount);
            $q('#grebCount').text(grebCount);
            $q('#spikeCount').text(spikeCount);
            $q('#anchorCount').text(anchorCount);
            $q('#washerCount').text(washerCount);
            $q('#nutCount').text(nutCount);

            if (hasPerimeter) {
                $q('#cornerCount').text(cornerCount);
                $q('#cornerRow').show();
            } else {
                $q('#cornerRow').hide();
            }

            $q('#calculator-page').hide();
            $q('#results-page').show();
        }

        function selectColor(element) {
            $q('.calc-color-option').removeClass('calc-selected');
            $(element).addClass('calc-selected');
            $q('#customColor').val('');
        }

        function deselectColors() {
            $q('.calc-color-option').removeClass('calc-selected');
        }

        function goBackToCalculator() {
            $q('#results-page').hide();
            $q('#calculator-page').show();
        }

        function goToContactPage() {
            $q('#results-page').hide();
            $q('#contact-page').show();
        }

        function goBackToResults() {
            $q('#contact-page').hide();
            $q('#results-page').show();
        }

        function resetCalculator() {
            $q('#area').val('30');
            $q('#perimeter').val('');
            $q('#railWidth').val('50');
            $q('#railHeight').val('50');
            $q('#railStep').val('50');
            $q('#railLength').val('3000');
            $q('#stockPercent').val('1.02');
            $q('#clientName').val('');
            $q('#clientPhone').val('');
            $q('#customColor').val('');
            $q('.calc-color-option').first().click();

            $q('#success-page').hide();
            $q('#contact-page').hide();
            $q('#results-page').hide();
            $q('#calculator-page').show();
        }

        function sendToEmail() {
            var name = $q('#clientName').val();
            var phone = $q('#clientPhone').val();
            var selectedColor = $q('.calc-color-option.calc-selected').data('color');
            var customColor = $q('#customColor').val();
            var finalColor = customColor || selectedColor;

            if (!finalColor) {
                alert('Пожалуйста, выберите цвет рейки или укажите свой вариант');
                return;
            }

            if (!name || !phone) {
                alert('Пожалуйста, заполните имя и телефон');
                return;
            }

            var message = 'Новая заявка на реечный потолок KIT BX-ST\n\nКлиент: ' + name + '\nТелефон: ' + phone + '\nЦвет: ' + finalColor + '\n\nПараметры помещения:\nПлощадь: ' + calculationData.area + ' м²\nПериметр: ' + calculationData.perimeter + ' м.п.\n\nПараметры рейки:\nШирина: ' + calculationData.railWidth + ' мм\nВысота: ' + calculationData.railHeight + ' мм\nШаг: ' + calculationData.railStep + ' мм\nДлина: ' + calculationData.railLength + ' мм\nЗапас: ' + Math.round((calculationData.stockPercent - 1) * 100) + '%\n\nРасчет материалов:\nРеечная система KIT BX-ST ' + calculationData.railLength + '*' + calculationData.railWidth + '*' + calculationData.railHeight + ' мм: ' + calculationData.railCount + ' шт. (' + calculationData.railMeters + ' м.п.)\nГребенка L=3000мм, оц. сталь, RAL 9005: ' + calculationData.grebCount + ' шт.';

            if (calculationData.hasPerimeter) {
                message += '\nПристенный уголок: ' + calculationData.cornerCount + ' шт.';
            }

            message += '\nШпилька М6: ' + calculationData.spikeCount + ' шт.\nАнкер цанга М6: ' + calculationData.anchorCount + ' шт.\nШайба М6: ' + calculationData.washerCount + ' шт.\nГайка М6: ' + calculationData.nutCount + ' шт.';

            if (typeof window.submitTildaCalcLead !== 'function') {
                alert('Подключите tilda-calc-form.js и задайте window.TILDA_CALC_FORM (см. комментарий в начале tilda-calc-form.js).');
                return;
            }

            window.__tildaCalcLastRoot = $root;

            submitTildaCalcLead({
                name: name,
                phone: phone,
                subject: 'Новая заявка на реечный потолок KIT BX-ST',
                message: message
            });
        }

        $q('#clientPhone').mask('+7 (000) 000-00-00');

        $q('.calc-unit-input input').on('input', function () {
            $(this).val();
        });

        $q('.calc-color-option').first().addClass('calc-selected');

        var api = {
            calculateCeiling: calculateCeiling,
            selectColor: selectColor,
            deselectColors: deselectColors,
            goBackToCalculator: goBackToCalculator,
            goToContactPage: goToContactPage,
            goBackToResults: goBackToResults,
            resetCalculator: resetCalculator,
            sendToEmail: sendToEmail,
            sendToMail: sendToEmail
        };

        window.TildaCalc.rail = api;

        if (!window.TILDA_CALC_MULTI_MODE) {
            window.calculateCeiling = calculateCeiling;
            window.selectColor = selectColor;
            window.deselectColors = deselectColors;
            window.goBackToCalculator = goBackToCalculator;
            window.goToContactPage = goToContactPage;
            window.goBackToResults = goBackToResults;
            window.resetCalculator = resetCalculator;
            window.sendToEmail = sendToEmail;
            window.sendToMail = sendToEmail;
        }

        return api;
    }

    window.TildaCalc.mountRail = mountRail;

    $(function () {
        if (typeof window.initTildaCalcFormBridgeOnce === 'function') {
            window.initTildaCalcFormBridgeOnce();
        }

        var root;
        if (window.TILDA_CALC_MULTI_MODE) {
            root = window.TILDA_CALC_ROOT_RAIL;
            if (!root) return;
        } else {
            root = 'body';
        }
        mountRail(root);
    });
})(window, jQuery);
