const moduleName = 'hide-item-value';
const defaultShowPriceSetting = 'defaultShowPrice';
const defaultAppraisedSetting = 'defaultAppraisedSetting';
const defaultRangeSetting = 'defaultRangeMinSetting';
const defaultRangeRndSetting = 'defaultRangeRndSetting';
const showPriceFlag = 'showPrice';
const appraisedFlag = 'appraised';
const defaultAppraisedFlag = 'defaultAppraised';

Hooks.on('init', () => {
  game.settings.register(moduleName, defaultShowPriceSetting, {
    name: 'Show price by default',
    hint: 'Sets default behaviour for new items',
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });
});

const showAppraisedToPlayer = (html, appraised) => {
  let priceInput = $(html).hasClass('tidy5e-sheet')
    ? $(html).find('input[data-tidy-field="system.price.value"]')
    : $(html).find('input[name="system.price.value"]');
  const $selectInput = priceInput.next('select');
  $selectInput.attr('disabled', true);
  priceInput.replaceWith(
    `<input type="text" name="flags.${moduleName}.${appraisedFlag}" value="${appraised}" data-dtype="String">`
  );
};

const addAppraisedControlsForGM = (html, appraised, showPrice) => {
  
  const $html = $(html);
  const isItTidySheet = $html.closest('.app').hasClass('tidy5e-sheet');
  
  let priceInput = isItTidySheet
    ? $html.find('input[data-tidy-field="system.price.value"]')
    : $html.find('input[name="system.price.value"]');

    const checkboxString = isItTidySheet ? 
    `<input type="checkbox" name="flags.${moduleName}.${showPriceFlag}" data-dtype="Boolean" ${
      showPrice ? 'checked' : ''
  } style="max-width:16px; background-color: ${showPrice ? 'var(--t5e-primary-accent-color)' : 'transparent'}">` 
    : `<input type="checkbox" name="flags.${moduleName}.${showPriceFlag}" data-dtype="Boolean" ${
      showPrice ? 'checked' : ''
    } style="max-width:16px;">`;

  priceInput.closest('.form-group').after(
    `<div class="form-group">
      <label>Appraised</label>
      <input type="text" name="flags.${moduleName}.${appraisedFlag}" value="${appraised}" data-dtype="String">
    </div>
    <div class="form-group">
      <label>Show Price</label>
      ${checkboxString}
    </div>`
  );
  if (isItTidySheet) {
    const $checkbox = $html.find(
      `input[name="flags.${moduleName}.${showPriceFlag}"]`
    );
    $checkbox.on('change', (event) => {
      $checkbox.css('background-color', event.target.checked ? 'var(--t5e-primary-accent-color)' : 'transparent');
    });
  }
};

const showHidePrice = async (app, html, data) => {
  const defaultShowPrice = await game.settings.get(
    moduleName,
    defaultShowPriceSetting
  );
  let showPrice = data.item.getFlag(moduleName, showPriceFlag);
  if (showPrice === undefined) {
    showPrice = defaultShowPrice;
  }

  const appraised = data.item.getFlag(moduleName, appraisedFlag) || '';

  if (game.user.isGM) {
    addAppraisedControlsForGM(html, appraised, showPrice);
  } else if (!showPrice) {
    showAppraisedToPlayer(html, appraised);
  }
};

Hooks.on('renderItemSheet5e', showHidePrice);
