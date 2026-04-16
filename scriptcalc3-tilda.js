/**
 * Кассетный потолок CLIP-IN.
 * Несколько калькуляторов: window.TILDA_CALC_MULTI_MODE = true и window.TILDA_CALC_ROOT_CLIPIN = '#id-обертки'.
 * Вызовы: TildaCalc.clipin.calculateCeilingClipIn(), TildaCalc.clipin.selectCassetteType(el) и т.д.
 */
(function (window, $) {
    window.TildaCalc = window.TildaCalc || {};

    function mountClipin(rootSelector) {
        var $root = $(rootSelector);
        if (!$root.length) return null;

        var calculationDataClipIn = {};

        function $q(sel) {
            return $root.find(sel);
        }

        function selectCassetteType(element) {
            $q('.calc-cassette-type-option').removeClass('calc-selected');
            $(element).addClass('calc-selected');
        }

        function calculateCeilingClipIn() {
            var area = parseFloat($q('#area').val());
            var perimeter = $q('#perimeter').val();
            var stockPercent = parseFloat($q('#stockPercent').val());

            var selectedCassette = $q('.calc-cassette-type-option.calc-selected');
            if (selectedCassette.length === 0) {
                alert('Пожалуйста, выберите тип кассеты');
                return;
            }

            var cassetteType = selectedCassette.data('cassette-type');
            var cassetteArea = parseFloat(selectedCassette.data('cassette-area'));
            var cassetteWidth = parseInt(selectedCassette.data('cassette-width'), 10);
            var cassetteSizeText = cassetteType.replace('x', '×') + ' мм';

            if (area < 30) {
                alert('Площадь помещения должна быть не менее 30 м²');
                return;
            }

            if (perimeter && perimeter > 0) {
                var perimeterValue = parseFloat(perimeter);
                var squareSide = Math.sqrt(area);
                var squarePerimeter = squareSide * 4;

                if (perimeterValue < (squarePerimeter - 20)) {
                    alert('Ошибка: Введенный периметр (' + perimeterValue + ' м.п.) слишком мал.\n' +
                        'Для площади ' + area + ' м² минимальный разумный периметр: ' + (squarePerimeter - 20).toFixed(1) + ' м.п.\n' +
                        'Проверьте введенные данные или оставьте поле периметра пустым.');
                    return;
                }
            }

            var stringerNorm;
            var connectorNorm;
            var spikeNorm;

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

            var cassetteCountBasic = Math.ceil(area / cassetteArea);
            var cassetteCount = Math.ceil(cassetteCountBasic * stockPercent);

            var stringerMetersBasic = area * stringerNorm;
            var stringerCountBasic = Math.ceil(stringerMetersBasic / 4);
            var stringerCount = Math.ceil(stringerCountBasic * stockPercent);

            var crossProfileMetersBasic = area * 1;
            var crossProfileCountBasic = Math.ceil(crossProfileMetersBasic / 4);
            var crossProfileCount = Math.ceil(crossProfileCountBasic * stockPercent);

            var connectorCountBasic = Math.ceil(area * connectorNorm);
            var connectorCount = Math.ceil(connectorCountBasic * stockPercent);

            var spikeCountBasic = Math.ceil(area * spikeNorm);
            var anchorCountBasic = spikeCountBasic;
            var washerCountBasic = spikeCountBasic * 2;
            var nutCountBasic = spikeCountBasic * 2;

            var spikeCount = Math.ceil(spikeCountBasic * stockPercent);
            var anchorCount = Math.ceil(anchorCountBasic * stockPercent);
            var washerCount = Math.ceil(washerCountBasic * stockPercent);
            var nutCount = Math.ceil(nutCountBasic * stockPercent);

            var cornerCount = 0;
            var hasPerimeter = false;
            if (perimeter && perimeter > 0) {
                var cornerMeters = parseFloat(perimeter);
                var cornerCountBasic = Math.ceil(cornerMeters / 3);
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

            var cassetteName = 'Кассета потолочная KIT CLIPIN-ST ' + cassetteSizeText;
            $q('#cassetteName').text(cassetteName);

            $q('#cassetteCount').text(cassetteCount);
            $q('#stringerCount').text(stringerCount);
            $q('#crossProfileCount').text(crossProfileCount);
            $q('#connectorCount').text(connectorCount);
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
            $q('#stockPercent').val('1.05');
            $q('#clientName').val('');
            $q('#clientPhone').val('');
            $q('#customColor').val('');

            $q('.calc-cassette-type-option').removeClass('calc-selected');
            $q('.calc-cassette-type-option').first().addClass('calc-selected');

            $q('.calc-color-option').removeClass('calc-selected');
            $q('.calc-color-option').first().addClass('calc-selected');

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
                alert('Пожалуйста, выберите цвет кассеты или укажите свой вариант');
                return;
            }

            if (!name || !phone) {
                alert('Пожалуйста, заполните имя и телефон');
                return;
            }

            var message = 'Новая заявка на кассетный потолок CLIP-IN\n\nКлиент: ' + name + '\nТелефон: ' + phone + '\nЦвет: ' + finalColor + '\n\nПараметры помещения:\nПлощадь: ' + calculationDataClipIn.area + ' м²\nПериметр: ' + calculationDataClipIn.perimeter + ' м.п.\n\nПараметры кассеты:\nГабарит: ' + calculationDataClipIn.cassetteSizeText + '\nЗапас материалов: ' + Math.round((calculationDataClipIn.stockPercent - 1) * 100) + '%\n\nРасчет материалов (с учетом запаса):\nКассета потолочная CLIP-IN ' + calculationDataClipIn.cassetteSizeText + ': ' + calculationDataClipIn.cassetteCount + ' шт.\nСтрингер L=4000мм: ' + calculationDataClipIn.stringerCount + ' шт.\nПоперечный профиль L=4000мм: ' + calculationDataClipIn.crossProfileCount + ' шт.\nДвухуровневый соединитель: ' + calculationDataClipIn.connectorCount + ' шт.';

            if (calculationDataClipIn.hasPerimeter) {
                message += '\nПристенный уголок 3000мм: ' + calculationDataClipIn.cornerCount + ' шт.';
            }

            message += '\nШпилька М6 1000мм: ' + calculationDataClipIn.spikeCount + ' шт.\nАнкер цанга М6: ' + calculationDataClipIn.anchorCount + ' шт.\nШайба М6: ' + calculationDataClipIn.washerCount + ' шт.\nГайка М6: ' + calculationDataClipIn.nutCount + ' шт.';

            if (typeof window.submitTildaCalcLead !== 'function') {
                alert('Подключите tilda-calc-form.js и задайте window.TILDA_CALC_FORM.');
                return;
            }

            window.__tildaCalcLastRoot = $root;

            submitTildaCalcLead({
                name: name,
                phone: phone,
                subject: 'Новая заявка на кассетный потолок CLIP-IN',
                message: message
            });
        }

        $q('#clientPhone').mask('+7 (000) 000-00-00');

        $q('.calc-color-option').first().addClass('calc-selected');

        var api = {
            calculateCeilingClipIn: calculateCeilingClipIn,
            selectCassetteType: selectCassetteType,
            selectColor: selectColor,
            deselectColors: deselectColors,
            goBackToCalculator: goBackToCalculator,
            goToContactPage: goToContactPage,
            goBackToResults: goBackToResults,
            resetCalculator: resetCalculator,
            sendToEmail: sendToEmail,
            sendToMail: sendToEmail
        };

        window.TildaCalc.clipin = api;

        if (!window.TILDA_CALC_MULTI_MODE) {
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
        }

        return api;
    }

    window.TildaCalc.mountClipin = mountClipin;

    $(function () {
        if (typeof window.initTildaCalcFormBridgeOnce === 'function') {
            window.initTildaCalcFormBridgeOnce();
        }

        var root;
        if (window.TILDA_CALC_MULTI_MODE) {
            root = window.TILDA_CALC_ROOT_CLIPIN;
            if (!root) return;
        } else {
            root = 'body';
        }
        mountClipin(root);
    });
})(window, jQuery);
