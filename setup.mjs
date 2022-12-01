// constants
const DEBUG = true;

const ASTROLOGY_ID = 'melvorD:Astrology'
const MAX_STANDARD_COUNT = 8;
const MAX_UNIQUE_COUNT = 5;

const modifierState = {
  LOCKED: 'LOCKED',
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETE: 'COMPLETE',
  UNEXPECTED_STATE: 'UNEXPECTED_STATE',
};

// global helpers
const getAstrologyMenu = () => astrologyMenus;
const getAstrology = () => game.astrology;
const isAstroPageOpen = () => game.openPage.id === ASTROLOGY_ID

const debug = (...xs) => DEBUG ? console.log('Shining Star:', ...xs) : null;

// core logic
const getModifierState = (constellation, type, index) => {
  const astrology = getAstrology();
  const isUnlocked = astrology.isModifierUnlocked(constellation, type, index);
  const isBought = astrology.isModifierBought(constellation, type, index);

  const count = type === AstrologyModifierType.Standard
    ? constellation.standardModsBought[index]
    : constellation.uniqueModsBought[index];

  const targetCount = type === AstrologyModifierType.Standard
    ? MAX_STANDARD_COUNT
    : MAX_UNIQUE_COUNT;

  if (!isUnlocked) return modifierState.LOCKED;
  if (!isBought) return modifierState.NOT_STARTED;
  if (count < targetCount) return modifierState.IN_PROGRESS;
  if (count === targetCount) return modifierState.COMPLETE;

  debug('Error computing state for constellation', constellation);

  return modifierState.UNEXPECTED_STATE;
}

const getStandardModifierState = (constellation) =>
  constellation.standardModifiers.map((m, i) =>
    getModifierState(constellation, AstrologyModifierType.Standard, i)
  );

const getUniquedModifierState = (constellation) =>
  constellation.uniqueModifiers.map((m, i) =>
    getModifierState(constellation, AstrologyModifierType.Unique, i)
  );

const ModifierState = ({constellation, container}) => {
  const standardModifiers = getStandardModifierState(constellation);
  const uniqueModifiers = getUniquedModifierState(constellation);

  const isStandardComplete = standardModifiers.every(x => x === modifierState.COMPLETE);
  const isUniqueComplete = uniqueModifiers.every(x => x === modifierState.COMPLETE);

  if (isStandardComplete && isUniqueComplete) {
    const div = container.querySelector('div')
    div.style.setProperty('background-color', '#5a380cc2', '!important') // fallback if image is broken
    div.style.setProperty('background-image', 'url(https://img.freepik.com/free-vector/sparkling-golden-stars-confetti-burst-background_1017-32368.jpg)', 'important')
    div.style.setProperty('background-size', 'auto 100px', 'important')
    div.style.setProperty('background-blend-mode', 'lighten', 'important')
  }

  return {
    $template: '#shining-star-container',
    constellation,
    standardModifiers,
    uniqueModifiers,
    updateStates() {
      this.standardModifiers = getStandardModifierState(constellation);
      this.uniqueModifiers = getUniquedModifierState(constellation);
    }
  }
}

const createModifierStates = () => {
  const {constellations} = getAstrologyMenu();

  return Array.from(constellations).map(([constellation, container]) => {
    const modifierState = ModifierState({constellation, container})
    const parent = container.progressBar.barElem.parentElement.parentElement;

    ui.create(modifierState, parent);

    return modifierState;
  });

}

export function setup({ onInterfaceReady, getResourceUrl }) {
  debug('Loaded')
  onInterfaceReady(({ patch }) => {
    debug('Setting up initial states')
    const modifierStates = createModifierStates();

    debug('Initial modifier states', modifierStates);

    const url = getResourceUrl('assets/stars.jpg');
    window.STARS_URL = url;

    patch(Astrology, 'render').before(() => {
      if (isAstroPageOpen()) {
        modifierStates.forEach(m => m.updateStates());
      }
    })
  })
}


// tooltips... for later
// generateTooltips(result, now, flags = {
//     noSkill: false,
//     noMastery: false,
//     noPool: false
// }) {
//     if (this.element._tippy === undefined) {
//         tippy(this.element, {
//             allowHTML: true,
//             interactive: false,
//             animation: false,
//         });
//     }
//     this.element._tippy.setContent(`<div>${this.tooltipContent(result, now)}</div>`);
// }
