/**
 * Кассетный потолок HOOK ON.
 * Несколько калькуляторов на странице: window.TILDA_CALC_MULTI_MODE = true
 * и window.TILDA_CALC_ROOT_HOOKON = '#id-обертки'. Вызовы: TildaCalc.hookon.calculateCeiling() и т.д.
 * В MULTI_MODE inline selectColor/deselectColors снимаются, клики вешаются делегированием на $root.
 */
(function (window, $) {
    window.TildaCalc = window.TildaCalc || {};

    function mountHookon(rootSelector) {
        var $root = $(rootSelector);
        if (!$root.length) return null;

        var calculationData = {};

        function $q(sel) {
            return $root.find(sel);
        }

        function calculateCeiling() {
            var area = parseFloat($q('#area').val());
            var perimeter = $q('#perimeter').val();
            var cassetteLength = parseInt($q('#cassetteLength').val(), 10);
            var cassetteWidth = parseInt($q('#cassetteWidth').val(), 10);
            var stockPercent = parseFloat($q('#stockPercent').val());

            if (area < 30) {
                alert('Площадь помещения должна быть не менее 30 м²');
                return;
            }

            var cassetteLengthM = cassetteLength / 1000;
            var cassetteWidthM = cassetteWidth / 1000;

            var cassetteArea = cassetteLengthM * cassetteWidthM;
            var cassetteCountBasic = Math.ceil(area / cassetteArea);
            var cassetteCount = Math.ceil(cassetteCountBasic * stockPercent);

            var cassetteMetersByWidth = area / cassetteWidthM;
            var cassettesCountByFormula = cassetteMetersByWidth / cassetteLengthM;
            var zProfilePiecesBasic = Math.ceil(cassettesCountByFormula) + 1;
            var zProfileMetersBasic = zProfilePiecesBasic * cassetteWidthM;
            var zProfileCountBasic = Math.ceil(zProfileMetersBasic / 3);
            var zProfileCount = Math.ceil(zProfileCountBasic * stockPercent);

            var perfAngleMetersBasic = area * 0.9;
            var perfAngleCountBasic = Math.ceil(perfAngleMetersBasic / 3);
            var perfAngleCount = Math.ceil(perfAngleCountBasic * stockPercent);

            var spikeCountBasic = Math.ceil(area * 0.8);
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

            var cassetteName = 'Потолочная кассета KIT HOOKON-ST ' + cassetteLength + '×' + cassetteWidth + ' мм';
            $q('#cassetteName').text(cassetteName);

            $q('#cassetteCount').text(cassetteCount);
            $q('#zProfileCount').text(zProfileCount);
            $q('#perfAngleCount').text(perfAngleCount);
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
            $q('#cassetteLength').val('1200');
            $q('#cassetteWidth').val('600');
            $q('#stockPercent').val('1.02');
            $q('#clientName').val('');
            $q('#clientPhone').val('');
            $q('#customColor').val('');
            $q('#consentCheckbox').prop('checked', false);

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
            var $consent = $q('#consentCheckbox');

            if (!finalColor) {
                alert('Пожалуйста, выберите цвет кассеты или укажите свой вариант');
                return;
            }

            if (!name || !phone) {
                alert('Пожалуйста, заполните имя и телефон');
                return;
            }

            if ($consent.length && !$consent.is(':checked')) {
                alert('Подтвердите согласие на обработку персональных данных.');
                return;
            }

            var message = 'Новая заявка на кассетный потолок HOOK ON\n\nКлиент: ' + name + '\nТелефон: ' + phone + '\nЦвет: ' + finalColor + '\n\nПараметры помещения:\nПлощадь: ' + calculationData.area + ' м²\nПериметр: ' + calculationData.perimeter + ' м.п.\n\nПараметры кассеты:\nРазмер: ' + calculationData.cassetteLength + '×' + calculationData.cassetteWidth + ' мм\nЗапас материалов: ' + Math.round((calculationData.stockPercent - 1) * 100) + '%\n\nРасчет материалов (с учетом запаса):\nПотолочная кассета KIT HOOKON-ST ' + calculationData.cassetteLength + '×' + calculationData.cassetteWidth + ' мм: ' + calculationData.cassetteCount + ' шт.\nПрофиль подсистемы Z-Типа L=3000мм, оц. сталь: ' + calculationData.zProfileCount + ' шт.\nУголок перфорированный L=3000мм, 30х30мм, оц. сталь: ' + calculationData.perfAngleCount + ' шт.';

            if (calculationData.hasPerimeter) {
                message += '\nПристенный уголок 3000мм: ' + calculationData.cornerCount + ' шт.';
            }

            message += '\nШпилька М6 1000мм: ' + calculationData.spikeCount + ' шт.\nАнкер цанга М6: ' + calculationData.anchorCount + ' шт.\nШайба М6: ' + calculationData.washerCount + ' шт.\nГайка М6: ' + calculationData.nutCount + ' шт.';

            if (typeof window.submitTildaCalcLead !== 'function') {
                alert('Подключите tilda-calc-form.js и задайте window.TILDA_CALC_FORM.');
                return;
            }

            window.__tildaCalcLastRoot = $root;

            submitTildaCalcLead({
                name: name,
                phone: phone,
                subject: 'Новая заявка на кассетный потолок HOOK ON',
                message: message
            });
        }

        $q('#clientPhone').mask('+7 (000) 000-00-00');

        $q('.calc-color-option').first().addClass('calc-selected');

        if (window.TILDA_CALC_MULTI_MODE) {
            $root.find('.calc-color-option').each(function () {
                var oc = this.getAttribute('onclick');
                if (oc && /selectColor\s*\(/i.test(oc)) {
                    this.removeAttribute('onclick');
                }
            });
            $root.find('#customColor').each(function () {
                var of = this.getAttribute('onfocus');
                if (of && /deselectColors\s*\(/i.test(of)) {
                    this.removeAttribute('onfocus');
                }
            });
            $root.off('click.tildaCalcColor').on('click.tildaCalcColor', '.calc-color-option', function () {
                selectColor(this);
            });
            $root.off('focus.tildaCalcCustomColor').on('focus.tildaCalcCustomColor', '#customColor', function () {
                deselectColors();
            });

            (function bindLegacyOnclick() {
                var pairs = [
                    { re: /^calculateCeiling\s*\(\s*\)$/i, fn: calculateCeiling },
                    { re: /^goToContactPage\s*\(\s*\)$/i, fn: goToContactPage },
                    { re: /^goBackToCalculator\s*\(\s*\)$/i, fn: goBackToCalculator },
                    { re: /^goBackToResults\s*\(\s*\)$/i, fn: goBackToResults },
                    { re: /^resetCalculator\s*\(\s*\)$/i, fn: resetCalculator },
                    { re: /^sendToMail\s*\(\s*\)$/i, fn: sendToEmail },
                    { re: /^sendToEmail\s*\(\s*\)$/i, fn: sendToEmail }
                ];
                $root.find('[onclick]').each(function () {
                    var el = this;
                    var oc = (el.getAttribute('onclick') || '').replace(/\s+/g, ' ').trim();
                    var j;
                    for (j = 0; j < pairs.length; j++) {
                        if (pairs[j].re.test(oc)) {
                            el.removeAttribute('onclick');
                            (function (handler) {
                                $(el).off('click.tildaCalcLegacy').on('click.tildaCalcLegacy', function (e) {
                                    e.preventDefault();
                                    handler();
                                });
                            })(pairs[j].fn);
                            return;
                        }
                    }
                });
            })();
        }

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

        window.TildaCalc.hookon = api;

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

    window.TildaCalc.mountHookon = mountHookon;

    $(function () {
        if (typeof window.initTildaCalcFormBridgeOnce === 'function') {
            window.initTildaCalcFormBridgeOnce();
        }

        var root;
        if (window.TILDA_CALC_MULTI_MODE) {
            root = window.TILDA_CALC_ROOT_HOOKON;
            if (!root) return;
        } else {
            root = 'body';
        }
        mountHookon(root);
    });
})(window, jQuery);
