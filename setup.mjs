// constants
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

// core logic
const getModifierState = (constellation, type, index) => {
  const astrology = getAstrology();
  const isUnlocked = astrology.isModifierUnlocked(constellation, type, index);
  const isBought = astrology.isModifierBought(constellation, type, index);
  const count = constellation.uniqueModsBought[index];

  if (!isUnlocked) return modifierState.LOCKED;
  if (!isBought) return modifierState.NOT_STARTED;
  if (count < MAX_STANDARD_COUNT) return modifierState.IN_PROGRESS;
  if (count === MAX_STANDARD_COUNT) return modifierState.COMPLETE;

  return modifierState.UNEXPECTED_STATE;
}

const getStandardModifierState = (constellation) =>
  constellation.standardModifiers.map((m, i) =>
    getModifierState(constellation, AstrologyModifierType.Standard, i)
  );

const getUniquedModifierState = (constellation) =>
  constellation.uniqueModifiers.map((m, i) =>
    getModifierState(constellation, AstrologyModifierType.Standard, i)
  );

const ModifierState = (constellation) => {
  const standard = getStandardModifierState(constellation);
  const unique = getUniquedModifierState(constellation);

  return {
    $template: '#shining-star-container',
    constellation,
    standard,
    unique,
    updateStates() {
      this.standard = getStandardModifierState(constellation);
      this.unique = getUniquedModifierState(constellation);
    }
  }
}

const addModifierStatesToAstrology = () => {
  const {constellations} = getAstrologyMenu();

  return Array.from(constellations).map(([constellation, container]) => {
    const modifierState = ModifierState(constellation)
    const parent = container.progressBar.barElem.parentElement.parentElement;

    ui.create(modifierState, parent);

    return modifierState;
  });

}

export function setup({ onInterfaceReady }) {
  onInterfaceReady(({ patch }) => {
    const modifierStates = addModifierStatesToAstrology();

    patch(Astrology, 'render').before(() => {
      if (isAstroPageOpen()) {
        console.log('Debug: updating Astrology page');

        modifierStates.forEach(m => m.updateStates());
      }
    }
  })
}
