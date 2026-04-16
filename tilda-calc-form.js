/**
 * Мост калькулятора (Zero Block / HTML) → стандартная форма Tilda.
 *
 * Настройка в Tilda:
 * 1) Добавьте блок «Форма», настройте приёмщик (Email и т.д.).
 * 2) Полям задайте Variable name: например Name, Phone, Text (и опционально Subject для короткой темы).
 * 3) Блок формы можно скрыть отображением в Tilda или оставить снизу — важно, чтобы форма была в DOM.
 * 4) У опубликованной страницы посмотрите id у тега <form> и укажите его в TILDA_CALC_FORM.formSelector.
 * 5) Включите AJAX-отправку формы в настройках блока, чтобы страница не перезагружалась.
 *
 * Подключение: Site settings → Подключить jQuery → затем этот файл → затем скрипт калькулятора.
 *
 * Несколько калькуляторов на одной странице: скрипты калькуляторов вызывают initTildaCalcFormBridgeOnce()
 * (один раз на страницу). Перед submitTildaCalcLead калькулятор выставляет window.__tildaCalcLastRoot,
 * чтобы onSuccess показал #success-page внутри нужного блока.
 */
(function (window, $) {
  'use strict';

  var defaultCfg = {
    formSelector: '',
    fields: {
      name: 'Name',
      phone: 'Phone',
      text: 'Text',
      subject: 'Subject'
    },
    /** Если отдельного поля Subject в форме нет — тема добавляется в начало многострочного текста */
    prependSubjectToText: true,
    onSuccess: null,
    /** true — предупреждения в консоль, если поле с таким name не найдено в форме */
    debug: false
  };

  function mergedCfg() {
    return $.extend(true, {}, defaultCfg, window.TILDA_CALC_FORM || {});
  }

  function $form() {
    var c = mergedCfg();
    if (!c.formSelector) {
      console.warn('[tilda-calc-form] Задайте window.TILDA_CALC_FORM.formSelector (id формы).');
      return $();
    }
    var $el = $(c.formSelector);
    if (!$el.length) return $();
    if ($el.is('form')) return $el;
    var $inner = $el.find('form').first();
    if ($inner.length) return $inner;
    return $el;
  }

  function setVal($f, fieldName, value) {
    if (!fieldName) return;
    if (value === undefined || value === null) value = '';
    var $el = $f.find('[name="' + fieldName + '"]');
    if (!$el.length) {
      $el = $f.find('input, textarea, select').filter(function () {
        var n = $(this).attr('name');
        return n && String(n).toLowerCase() === String(fieldName).toLowerCase();
      });
    }
    if ($el.length) {
      $el.val(value);
    } else if (mergedCfg().debug) {
      console.warn('[tilda-calc-form] Поле с name="' + fieldName + '" не найдено внутри формы. Проверьте Variable name в блоке формы и TILDA_CALC_FORM.fields.');
    }
  }

  /**
   * @param {object} payload
   * @param {string} payload.name
   * @param {string} payload.phone
   * @param {string} payload.message
   * @param {string} [payload.subject]
   */
  function submitTildaCalcLead(payload) {
    var c = mergedCfg();
    var $f = $form();
    if (!$f.length) {
      alert('Ошибка: форма Tilda не найдена. Проверьте TILDA_CALC_FORM.formSelector.');
      return;
    }

    var f = c.fields || {};
    var textBody = payload.message || '';

    setVal($f, f.name, payload.name || '');
    setVal($f, f.phone, payload.phone || '');

    if (f.subject) {
      var hasSubjectInput = $f.find('[name="' + f.subject + '"]').length > 0;
      if (hasSubjectInput) {
        setVal($f, f.subject, payload.subject || '');
      } else if (c.prependSubjectToText && payload.subject) {
        textBody = payload.subject + '\n\n' + textBody;
      }
    } else if (c.prependSubjectToText && payload.subject) {
      textBody = payload.subject + '\n\n' + textBody;
    }

    if (f.text) {
      setVal($f, f.text, textBody);
    } else if (f.input) {
      setVal($f, f.input, textBody);
    }

    var formEl = $f[0];

    if (window.tildaForm && typeof window.tildaForm.validate === 'function') {
      window.tildaForm.hideErrors(formEl);
      var errors = window.tildaForm.validate(formEl);
      if (errors && errors.length) {
        window.tildaForm.showErrors(formEl, errors);
        if (typeof window.tildaForm.showErrorInPopup === 'function') {
          window.tildaForm.showErrorInPopup($f, errors);
        }
        return;
      }
    }

    var $btn = $f.find('.t-submit').first();
    if ($btn.length) {
      $btn.trigger('click');
    } else {
      alert('Ошибка: внутри формы нет кнопки .t-submit.');
    }
  }

  function initTildaCalcFormBridge(options) {
    if (options) {
      window.TILDA_CALC_FORM = $.extend(true, {}, window.TILDA_CALC_FORM || {}, options);
    }

    var c = mergedCfg();
    if (!c.formSelector) return;

    var $fe = $form();
    var formEl = $fe[0];
    if (!formEl) {
      console.warn('[tilda-calc-form] Форма не найдена при init. Проверьте formSelector после публикации.');
      return;
    }
    if (formEl._tildaCalcLeadBound) return;
    formEl._tildaCalcLeadBound = true;

    formEl.addEventListener('tildaform:aftersuccess', function () {
      var cfg = mergedCfg();
      if (typeof cfg.onSuccess === 'function') {
        cfg.onSuccess();
      }
    });
  }

  /**
   * Перед submitTildaCalcLead установите window.__tildaCalcLastRoot = $root (jQuery),
   * чтобы после успешной отправки формы показать #success-page внутри нужного калькулятора.
   */
  window.__tildaCalcLastRoot = window.__tildaCalcLastRoot || null;

  function initTildaCalcFormBridgeOnce() {
    if (window.__tildaCalcFormBridgeOnce) return;
    window.__tildaCalcFormBridgeOnce = true;
    initTildaCalcFormBridge({
      onSuccess: function () {
        var r = window.__tildaCalcLastRoot;
        if (r && r.length) {
          r.find('#contact-page').hide();
          r.find('#success-page').show();
        }
        window.__tildaCalcLastRoot = null;
      }
    });
  }

  window.submitTildaCalcLead = submitTildaCalcLead;
  window.initTildaCalcFormBridge = initTildaCalcFormBridge;
  window.initTildaCalcFormBridgeOnce = initTildaCalcFormBridgeOnce;
})(window, jQuery);
