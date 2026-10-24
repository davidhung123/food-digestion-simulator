const FOODS = [
  { id:'water', name:'水', icon:'💧', category:'液體', color:'#49a9e8', stomach:25, small:70, large:0, digestibility:1, note:'水不需要被消化酵素分解，通常很快離開胃並在腸道吸收。' },
  { id:'alcohol', name:'酒精飲料', icon:'🥂', category:'液體', color:'#9a63d8', stomach:35, small:85, large:0, digestibility:1, note:'酒精可快速被吸收，之後主要由肝臟代謝；它不是補充水分的健康飲料。' },
  { id:'drink', name:'一般飲料', icon:'🥤', category:'液體', color:'#ef7e8f', stomach:55, small:115, large:0, digestibility:.95, note:'含糖飲料的液體移動較快，但糖分會在小腸被吸收。' },
  { id:'rice', name:'米飯', icon:'🍚', category:'固體', color:'#e0b83f', stomach:145, small:260, large:1200, digestibility:.92, note:'米飯中的澱粉會逐步分解成較小糖類，主要在小腸完成消化與吸收。' },
  { id:'steak', name:'牛排', icon:'🥩', category:'較難消化', color:'#b94b42', stomach:260, small:390, large:1500, digestibility:.78, note:'牛排含蛋白質與脂肪，通常比米飯與液體在胃中停留更久。' },
  { id:'vegetable', name:'蔬菜', icon:'🥦', category:'高纖維', color:'#47a85b', stomach:170, small:310, large:1700, digestibility:.68, note:'蔬菜中的部分營養會被吸收，部分纖維則會進入大腸。' },
  { id:'pearl', name:'珍珠', icon:'⚫', category:'澱粉固體', color:'#684235', stomach:190, small:330, large:1380, digestibility:.83, note:'珍珠主要由澱粉組成，正常情況下可以被消化；充分咀嚼可降低後續處理負擔。' },
  { id:'bubbleTea', name:'珍珠奶茶', icon:'🧋', category:'混合食物', color:'#b9784d', stomach:150, small:280, large:1100, digestibility:.87, note:'奶茶液體、糖與珍珠不會完全同步前進；這裡以混合餐點簡化呈現。' },
  { id:'fried', name:'油炸食物', icon:'🍟', category:'高脂肪', color:'#ef8b2c', stomach:300, small:430, large:1600, digestibility:.74, note:'脂肪含量高的食物通常會讓胃排空速度變慢。' },
  { id:'easy', name:'容易消化', icon:'🥣', category:'軟質食物', color:'#73bdb5', stomach:95, small:210, large:1000, digestibility:.95, note:'軟質、低脂、顆粒小的食物通常較快形成食糜。' },
  { id:'hard', name:'難以消化', icon:'🧱', category:'粗硬固體', color:'#6d7784', stomach:330, small:470, large:1900, digestibility:.62, note:'顆粒大、脂肪高或質地粗硬的食物，通常需要更長處理時間。' }
];

const PRESET_MEALS = [
  { id:'compare', name:'液體與固體比較', description:'水、米飯、牛排', foods:['water','rice','steak'] },
  { id:'balanced', name:'一般餐點', description:'米飯、蔬菜、牛排', foods:['rice','vegetable','steak'] },
  { id:'snack', name:'點心組合', description:'珍珠奶茶、珍珠、油炸食物', foods:['bubbleTea','pearl','fried'] }
];

const ORGANS = [
  { key:'mouth', name:'口腔', start:0, duration:3, pos:[50,18], state:'咀嚼並與唾液混合', digest:.03, absorb:0 },
  { key:'esophagus', name:'食道', start:3, duration:2, pos:[50,31], state:'食團經由蠕動向胃移動', digest:.05, absorb:0 },
  { key:'stomach', name:'胃', pos:[53,54], state:'攪拌、研磨並形成食糜', digest:.35, absorb:.03 },
  { key:'smallIntestine', name:'小腸', pos:[50,78], state:'酵素分解與營養吸收', digest:.9, absorb:.82 },
  { key:'largeIntestine', name:'大腸', pos:[50,75], state:'回收水分並形成殘渣', digest:1, absorb:.94 },
  { key:'rectum', name:'直腸', pos:[50,93], state:'儲存殘渣，準備排出', digest:1, absorb:.95 },
  { key:'out', name:'已排出體外', pos:[50,98], state:'旅程完成', digest:1, absorb:.95 }
];

const MAX_TIMELINE = 4320;
const TIMELINE_SLIDER_MAX = 4320;
const MAX_HISTORY = 5;
const EARLY_AXIS_SHARE = .42;
const PLAY_TICK_MS = 100;
const FIXED_MINUTES_PER_REAL_SECOND = 2;
const SEGMENTED_EARLY_MINUTES_PER_REAL_SECOND = 1;
const SEGMENTED_LATE_MINUTES_PER_REAL_SECOND = 5;
const FOOD_KNOWLEDGE = {
  water: ['水不需要先被消化酵素拆解，主要在小腸被吸收。', '身體會依需要調節水分，並透過腎臟處理多餘水分。'],
  alcohol: ['酒精可在胃與小腸吸收，之後主要由肝臟代謝。', '酒精飲料的液體移動快，不代表酒精會讓身體補水。'],
  drink: ['飲料中的糖分通常在小腸被吸收，液體本身則較快離開胃。', '含糖飲料的能量密度可能影響一餐的總熱量。'],
  rice: ['米飯的澱粉會先被唾液與胰液相關酵素分解，再在小腸吸收。', '咀嚼會把米飯弄碎，也能讓消化液更容易接觸食物。'],
  steak: ['牛排的蛋白質在胃與小腸中逐步分解成胺基酸。', '脂肪與蛋白質較多時，胃排空通常會比液體慢。'],
  vegetable: ['蔬菜提供纖維；部分纖維不會在小腸被完全分解，會進入大腸。', '大腸中的腸道菌會利用部分纖維，並產生短鏈脂肪酸。'],
  pearl: ['珍珠主要是澱粉固體，咀嚼程度會影響食物顆粒大小。', '較大的食物顆粒通常需要更多胃部攪拌，才會形成適合通過的食糜。'],
  bubbleTea: ['珍珠奶茶同時包含液體、糖與澱粉固體，不同成分不會完全同步前進。', '液體較快通過胃，珍珠等固體則需要更多攪拌與分解時間。'],
  fried: ['油炸食物的脂肪含量較高，常會讓胃排空速度變慢。', '高溫油炸會改變食物的質地與含水量，份量也會影響消化負擔。'],
  easy: ['軟質、顆粒小的食物通常較容易與消化液混合。', '食物較容易形成食糜，不代表營養會在同一個器官全部吸收。'],
  hard: ['粗硬或顆粒大的食物需要更多咀嚼與胃部研磨。', '纖維、脂肪與食物結構都可能讓整段消化旅程變長。']
};

const state = { selected:new Set(), meal:[], focusId:null, time:0, playing:false, timer:null, presetId:null, flowMode:'fixed', history:[], autoFollow:true, manualScrollUntil:0, autoScrollUntil:0, autoScrollFrame:null, autoScrollTarget:null, earlyEnded:false, earlyEndTime:null, quizQuestions:[], quizIndex:0, quizAnswered:false, quizCorrect:0, quizCompleted:false, puzzle:null, puzzleRevealed:false, joke:null, jokeReasonRevealed:false };

const els = Object.fromEntries([
  'foodGrid','presetGrid','selectedCount','portionSelect','chewSelect','loadMealBtn','timeline','timeLabel','playBtn','prevBtn','nextBtn','speedSelect','flowModeFixedBtn','flowModeSegmentedBtn','speedNotice','bodyStage','foodParticles','autoFollowBtn','infoCard','mealLegend','legendCount','mealHistory','historyCount','focusFoodName','focusSwatch','focusOrgan','focusState','focusDigestion','focusAbsorption','focusNext','digestProgress','scienceNote','focusWarning','timelineWarning','earlyEndNotice','observationTitle','observationText','observationFacts','puzzleSection','puzzlePrompt','puzzleHint','puzzleAnswer','puzzleRevealBtn','jokeSection','jokeText','jokeReason','jokeReasonBtn','resetBtn','startTourBtn','tourDialog','closeTourBtn','challengeQuestions','challengeSummary'
].map(id => [id, document.getElementById(id)]));

function syncDesktopLayout(){
  const viewportWidth = window.innerWidth || 0;
  const availableWidth = window.screen?.availWidth || viewportWidth;
  const wideDesktop = viewportWidth >= 900 && (viewportWidth >= 1150 || viewportWidth >= availableWidth * .8);
  document.documentElement.classList.toggle('desktop-wide', wideDesktop);
}

function allFoodsHaveExited(){
  return state.meal.length > 0 && state.meal.every(food => getFoodStage(food, state.time).organ.key === 'out');
}

function finishEarlyIfComplete(){
  if(state.earlyEnded || state.time >= MAX_TIMELINE || !allFoodsHaveExited()) return;
  state.earlyEnded = true;
  state.earlyEndTime = state.time;
  state.playing = false;
  clearInterval(state.timer);
  els.playBtn.textContent = '▶';
}

function renderEarlyEndNotice(){
  if(!els.earlyEndNotice) return;
  els.earlyEndNotice.hidden = !state.earlyEnded;
  els.playBtn.disabled = state.earlyEnded;
  els.earlyEndNotice.textContent = state.earlyEnded
    ? `✓ 模擬已提早結束：所有食物都已消化並排出體外，模擬時間為進食後 ${formatTime(state.earlyEndTime)}。`
    : '';
}

function getFoodCombinationName(foodIds){
  const orderedIds = [...new Set(foodIds)]
    .filter(id => FOODS.some(food => food.id === id))
    .sort((a,b) => FOODS.findIndex(food => food.id === a) - FOODS.findIndex(food => food.id === b));
  if(!orderedIds.length) return '空白餐點';
  const singleFoodNames = {
    water:'清涼水', alcohol:'醇香酒', drink:'沁甜飲', rice:'金穗飯', steak:'炙香牛',
    vegetable:'鮮蔬盤', pearl:'珍珠圓', bubbleTea:'茶香珍奶', fried:'金脆薯條', easy:'綿滑粥品', hard:'厚實粗食'
  };
  if(orderedIds.length === 1) return singleFoodNames[orderedIds[0]] || '食物餐';

  const foods = orderedIds.map(id => FOODS.find(food => food.id === id)).filter(Boolean);
  const liquidIds = new Set(['water','alcohol','drink']);
  let prefix = '豐味';
  if(foods.every(food => liquidIds.has(food.id))) prefix = '清爽';
  else if(foods.some(food => food.id === 'fried')) prefix = '金脆';
  else if(foods.some(food => food.id === 'vegetable')) prefix = '鮮蔬';
  else if(foods.some(food => ['rice','pearl','bubbleTea'].includes(food.id))) prefix = '穀香';
  else if(foods.some(food => ['steak','hard'].includes(food.id))) prefix = '炙香';

  // 每種食物各佔一個 bit，因此 1～2047 的編號能為所有組合產生唯一名稱。
  const combinationNumber = orderedIds.reduce((mask, id) => {
    const foodIndex = FOODS.findIndex(food => food.id === id);
    return mask | (1 << foodIndex);
  }, 0);
  // 33 個風味與口感字元可用三位數編碼表示 33^3 種組合；前綴依食物類型產生菜單風格名稱。
  const nameAlphabet = '香脆鮮嫩甜鹹濃醇清爽金玉酥炙燒蜜糯滑彈麻辣酸甘辛芳潤柔厚馥醬飽美妙';
  let encoded = '';
  let value = combinationNumber;
  for(let index = 0; index < 3; index += 1){
    encoded = nameAlphabet[value % nameAlphabet.length] + encoded;
    value = Math.floor(value / nameAlphabet.length);
  }
  return `${prefix}${encoded}`;
}

function findMatchingPresetId(foodIds = state.selected){
  const selectedIds = new Set(foodIds);
  return PRESET_MEALS.find(preset => preset.foods.length === selectedIds.size && preset.foods.every(id => selectedIds.has(id)))?.id || null;
}

function getSelectLabel(select, value){
  return [...(select?.options || [])].find(option => option.value === value)?.textContent || value;
}

function updateBodyStageScroll(){
  if(!els.bodyStage || !state.autoFollow || !state.meal.length || Date.now() < state.manualScrollUntil) return;
  const stages = state.meal.map(food => getFoodStage(food, state.time));
  const lowerCount = stages.filter(data => data.pos[1] >= 50).length;
  if(lowerCount <= state.meal.length / 2) return;
  const averageY = stages.reduce((sum, data) => sum + data.pos[1], 0) / stages.length;
  const canvas = els.bodyStage.querySelector('.body-stage-canvas');
  if(!canvas) return;
  const maxScroll = Math.max(0, canvas.scrollHeight - els.bodyStage.clientHeight);
  const target = Math.max(0, Math.min(maxScroll, (averageY / 100) * canvas.scrollHeight - els.bodyStage.clientHeight * .48));
  state.autoScrollTarget = target;
  if(!state.autoScrollFrame) state.autoScrollFrame = requestAnimationFrame(stepBodyStageScroll);
}

function stepBodyStageScroll(){
  state.autoScrollFrame = null;
  if(!els.bodyStage || !state.autoFollow || Date.now() < state.manualScrollUntil || state.autoScrollTarget === null) return;
  const target = state.autoScrollTarget;
  const difference = target - els.bodyStage.scrollTop;
  if(Math.abs(difference) < .6){
    state.autoScrollTarget = null;
    els.bodyStage.scrollTop = target;
    return;
  }
  state.autoScrollUntil = Date.now() + 200;
  els.bodyStage.scrollTop += difference * .14;
  state.autoScrollFrame = requestAnimationFrame(stepBodyStageScroll);
}

function renderFoodCards(){
  const cards = FOODS.map(food => `
    <label class="food-card" data-id="${food.id}">
      <input type="checkbox" value="${food.id}" />
      <span class="food-check" aria-hidden="true"></span>
      <span class="food-icon">${food.icon}</span>
      <span><strong>${food.name}</strong><small>${food.category}</small></span>
    </label>
  `).join('');
  const selectAllCard = `
    <button type="button" class="food-card select-all-foods-btn" data-action="select-all-foods" aria-pressed="false">
      <span class="food-check" aria-hidden="true"></span>
      <span class="food-icon" aria-hidden="true">🍽️</span>
      <span><strong>一鍵全選食物</strong><small>選取全部食物</small></span>
    </button>
  `;
  els.foodGrid.innerHTML = cards + selectAllCard;
  els.foodGrid.querySelectorAll('.food-card input').forEach(input => {
    input.addEventListener('change', () => {
      const card = input.closest('.food-card');
      const id = card.dataset.id;
      input.checked ? state.selected.add(id) : state.selected.delete(id);
      state.presetId = findMatchingPresetId(state.selected);
      state.quizCompleted = false;
      state.puzzle = null;
      state.puzzleRevealed = false;
      state.joke = null;
      state.jokeReasonRevealed = false;
      syncFoodSelectionUI();
      renderPuzzleSection();
      renderJokeSection();
    });
  });
  els.foodGrid.querySelector('[data-action="select-all-foods"]')?.addEventListener('click', () => {
    const allSelected = state.selected.size === FOODS.length && FOODS.every(food => state.selected.has(food.id));
    state.selected = allSelected ? new Set() : new Set(FOODS.map(food => food.id));
    state.presetId = findMatchingPresetId(state.selected);
    state.quizCompleted = false;
    state.puzzle = null;
    state.puzzleRevealed = false;
    state.joke = null;
    state.jokeReasonRevealed = false;
    syncFoodSelectionUI();
    renderPuzzleSection();
    renderJokeSection();
  });
}

function syncFoodSelectionUI(){
  els.foodGrid.querySelectorAll('.food-card').forEach(card => {
    const input = card.querySelector('input');
    if(!input) return;
    const selected = state.selected.has(card.dataset.id);
    input.checked = selected;
    card.classList.toggle('selected', selected);
  });
  els.selectedCount.textContent = `${state.selected.size} 種`;
  const selectAllButton = els.foodGrid.querySelector('[data-action="select-all-foods"]');
  if(selectAllButton){
    const allSelected = state.selected.size === FOODS.length && FOODS.every(food => state.selected.has(food.id));
    selectAllButton.classList.toggle('selected', allSelected);
    const buttonText = allSelected ? '取消全選食物' : '一鍵全選食物';
    selectAllButton.setAttribute('aria-label', allSelected ? '取消選取所有食物' : '一鍵選擇所有食物');
    selectAllButton.setAttribute('aria-pressed', String(allSelected));
    selectAllButton.querySelector('strong').textContent = buttonText;
    selectAllButton.querySelector('small').textContent = allSelected ? '清除全部選取' : '選取全部食物';
  }
  els.presetGrid.querySelectorAll('.preset-card').forEach(button => {
    button.classList.toggle('active', button.dataset.presetId === state.presetId);
  });
  renderObservation();
}

function renderPresets(){
  els.presetGrid.innerHTML = PRESET_MEALS.map(preset => `
    <button type="button" class="preset-card" data-preset-id="${preset.id}">
      <strong>${preset.name}</strong>
      <small>${preset.description}</small>
    </button>
  `).join('');
  els.presetGrid.querySelectorAll('.preset-card').forEach(button => {
    button.addEventListener('click', () => applyPresetMeal(button.dataset.presetId));
  });
}

function applyPresetMeal(presetId){
  const preset = PRESET_MEALS.find(item => item.id === presetId);
  const presetFoods = preset?.foods?.map(id => FOODS.find(food => food.id === id)) || [];
  if(!preset || !presetFoods.length || presetFoods.some(food => !food) || presetFoods.length !== preset.foods.length){
    alert('預設餐點資料無效，請改用手動選擇食物。');
    return;
  }
  state.selected.clear();
  presetFoods.forEach(food => state.selected.add(food.id));
  state.presetId = preset.id;
  syncFoodSelectionUI();
  buildMeal();
}

function buildMeal(){
  if(!state.selected.size){
    alert('請至少選擇一種食物。');
    return;
  }
  const portion = Number(els.portionSelect.value);
  const chew = Number(els.chewSelect.value);
  const mixFactor = 1 + Math.max(0, state.selected.size - 2) * .04;
  state.meal = [...state.selected].map((id, index) => {
    const food = FOODS.find(f => f.id === id);
    const variance = 0.94 + ((index * 7) % 11) / 100;
    const factor = portion * chew * mixFactor * variance;
    const largeDuration = Math.max(food.large, 90) * factor;
    const mouthEnd = 3;
    const esophagusEnd = mouthEnd + 2;
    const stomachEnd = esophagusEnd + food.stomach * factor;
    const smallEnd = stomachEnd + food.small * factor;
    const largeEnd = smallEnd + largeDuration;
    const rectumEnd = largeEnd + 300 * factor;
    return { ...food, times:{ mouthEnd, esophagusEnd, stomachEnd, smallEnd, largeEnd, rectumEnd }, completedWithinTimeline: rectumEnd < MAX_TIMELINE };
  });
  state.focusId = state.meal[0].id;
  state.time = 0;
  state.quizCompleted = false;
  state.earlyEnded = false;
  state.earlyEndTime = null;
  recordMealHistory();
  refreshBonusContent();
  els.timeline.value = minutesToTimelinePosition(0);
  if(els.bodyStage){ els.bodyStage.scrollTop = 0; state.manualScrollUntil = 0; state.autoScrollUntil = 0; state.autoScrollTarget = null; if(state.autoScrollFrame){ cancelAnimationFrame(state.autoScrollFrame); state.autoScrollFrame = null; } }
  renderLegend();
  renderHistory();
  renderSimulation();
  renderObservation();
  renderQuiz(state.meal.map(food => food.id));
}

function getMealHistoryLabel(){
  const allSelected = state.selected.size === FOODS.length && FOODS.every(food => state.selected.has(food.id));
  if(allSelected) return '全部食物';
  const preset = PRESET_MEALS.find(item => item.id === state.presetId);
  if(preset) return preset.name;
  const orderedIds = [...state.selected].sort((a,b) => FOODS.findIndex(food => food.id === a) - FOODS.findIndex(food => food.id === b));
  return getFoodCombinationName(orderedIds);
}

function recordMealHistory(){
  const foodIds = [...state.selected].sort((a,b) => FOODS.findIndex(food => food.id === a) - FOODS.findIndex(food => food.id === b));
  if(!foodIds.length) return;
  const portion = els.portionSelect.value;
  const chew = els.chewSelect.value;
  const signature = `${foodIds.join('|')}::${portion}::${chew}`;
  const record = { signature, foodIds, label:getMealHistoryLabel(), presetId:state.presetId || null, portion, chew };
  const existingIndex = state.history.findIndex(item => item.signature === signature);
  if(existingIndex >= 0) state.history.splice(existingIndex, 1);
  state.history.unshift(record);
  state.history = state.history.slice(0, MAX_HISTORY);
}

function renderHistory(){
  if(!els.mealHistory || !els.historyCount) return;
  els.historyCount.textContent = `${state.history.length} / ${MAX_HISTORY}`;
  if(!state.history.length){
    els.mealHistory.innerHTML = '<p class="history-empty">載入餐點後，最近使用的餐點會保留在這裡。</p>';
    return;
  }
  const visibleIconCount = 4;
  els.mealHistory.innerHTML = state.history.map((record, index) => {
    const foods = record.foodIds.map(id => FOODS.find(food => food.id === id)).filter(Boolean);
    const hiddenCount = Math.max(0, foods.length - visibleIconCount);
    const icons = foods.slice(0, visibleIconCount).map(food => `<span class="history-icon" aria-hidden="true">${food.icon}</span>`).join('');
    const iconMarkup = hiddenCount ? `<span class="history-ellipsis" aria-hidden="true">…</span>${icons}` : icons;
    const names = foods.map(food => food.name).join('、');
    const settings = `份量：${getSelectLabel(els.portionSelect, record.portion)}；咀嚼：${getSelectLabel(els.chewSelect, record.chew)}`;
    const label = record.label || getFoodCombinationName(record.foodIds);
    return `<div class="history-entry"><button type="button" class="history-item" data-history-index="${index}" aria-label="套用歷史餐點：${label}，包含${names}，${settings}"><span class="history-icons">${iconMarkup}</span><span class="history-item-label">${label}</span></button><span class="history-detail" role="tooltip">${names || '沒有食物資料'}<br>${settings}<br><small>點擊即可套用，之後仍可手動調整</small></span></div>`;
  }).join('');
}

function applyHistoryMeal(index){
  const record = state.history[index];
  if(!record) return;
  const validIds = record.foodIds.filter(id => FOODS.some(food => food.id === id));
  if(!validIds.length){
    alert('這筆歷史餐點資料已無法使用，請重新選擇食物。');
    return;
  }
  state.selected = new Set(validIds);
  state.presetId = record.presetId || findMatchingPresetId(state.selected);
  if([...els.portionSelect.options].some(option => option.value === record.portion)) els.portionSelect.value = record.portion;
  if([...els.chewSelect.options].some(option => option.value === record.chew)) els.chewSelect.value = record.chew;
  syncFoodSelectionUI();
  buildMeal();
}

function getFoodStage(food, t){
  const x = food.times;
  const time = Math.max(0, Math.min(MAX_TIMELINE, t));
  if(time <= x.mouthEnd) return stageData(ORGANS[0], time / x.mouthEnd, food);
  if(time <= x.esophagusEnd) return stageData(ORGANS[1], (time-x.mouthEnd)/(x.esophagusEnd-x.mouthEnd), food);
  if(time <= x.stomachEnd) return stageData(ORGANS[2], (time-x.esophagusEnd)/(x.stomachEnd-x.esophagusEnd), food);
  if(time <= x.smallEnd) return stageData(ORGANS[3], (time-x.stomachEnd)/(x.smallEnd-x.stomachEnd), food);
  if(time <= x.largeEnd) return stageData(ORGANS[4], (time-x.smallEnd)/(x.largeEnd-x.smallEnd), food);
  if(time <= x.rectumEnd) return stageData(ORGANS[5], (time-x.largeEnd)/(x.rectumEnd-x.largeEnd), food);
  return stageData(ORGANS[6], 1, food);
}

function stageData(organ, progress, food){
  progress = Math.max(0, Math.min(1, progress));
  let digest = organ.digest;
  let absorb = organ.absorb;
  if(organ.key === 'stomach') digest = .05 + progress * .3;
  if(organ.key === 'smallIntestine') { digest = .35 + progress * (.55 * food.digestibility); absorb = .03 + progress * (.79 * food.digestibility); }
  if(organ.key === 'largeIntestine') { digest = .88 + progress * .12; absorb = .78 + progress * .16; }
  const jitter = hashOffset(food.id);
  const organIndex = ORGANS.findIndex(item => item.key === organ.key);
  const nextOrgan = ORGANS[organIndex + 1];
  const start = [organ.pos[0] + jitter.x, organ.pos[1] + jitter.y];
  const end = nextOrgan ? [nextOrgan.pos[0] + jitter.x, nextOrgan.pos[1] + jitter.y] : start;
  const pos = [start[0] + (end[0] - start[0]) * progress, start[1] + (end[1] - start[1]) * progress];
  return { organ, progress, digest:Math.min(1,digest), absorb:Math.min(.98,absorb), pos };
}

function hashOffset(id){
  const n = [...id].reduce((a,c)=>a+c.charCodeAt(0),0);
  return { x:((n%9)-4) * 1.7, y:(((n*3)%7)-3) * 1.7 };
}

function timelinePositionToMinutes(position){
  const earlyLimit = TIMELINE_SLIDER_MAX * EARLY_AXIS_SHARE;
  const value = Math.max(0, Math.min(TIMELINE_SLIDER_MAX, Number(position) || 0));
  if(value <= earlyLimit) return value / earlyLimit * 60;
  return 60 + ((value - earlyLimit) / (TIMELINE_SLIDER_MAX - earlyLimit)) * (MAX_TIMELINE - 60);
}

function minutesToTimelinePosition(minutes){
  const earlyLimit = TIMELINE_SLIDER_MAX * EARLY_AXIS_SHARE;
  const value = Math.max(0, Math.min(MAX_TIMELINE, Number(minutes) || 0));
  if(value <= 60) return value / 60 * earlyLimit;
  return earlyLimit + ((value - 60) / (MAX_TIMELINE - 60)) * (TIMELINE_SLIDER_MAX - earlyLimit);
}

function isIncompleteAtEnd(food){
  return state.meal.length > 0 && state.time >= MAX_TIMELINE && food.completedWithinTimeline === false;
}

function particleMarkup(food){
  return `<button class="food-particle" data-id="${food.id}" aria-label="${food.name}" title="${food.name}"><span class="food-icon-mark">${food.icon}</span><span class="food-warning" aria-hidden="true" hidden></span></button>`;
}

function updateParticleButton(button, food, data){
  const incompleteAtEnd = isIncompleteAtEnd(food);
  const opacity = data.organ.key === 'out' ? .25 : 1;
  const scale = Math.max(.65, 1 - data.digest * .28);
  const label = incompleteAtEnd ? `${food.name}，72 小時仍未完成消化` : food.name;
  button.classList.toggle('focused', food.id === state.focusId);
  button.classList.toggle('incomplete', incompleteAtEnd && food.id !== state.focusId);
  button.style.left = `${data.pos[0]}%`;
  button.style.top = `${data.pos[1]}%`;
  button.style.background = food.color;
  button.style.opacity = opacity;
  button.style.transform = `translate(-50%,-50%) scale(${scale})`;
  button.setAttribute('aria-label', label);
  button.title = label;
  const warning = button.querySelector('.food-warning');
  warning.hidden = !incompleteAtEnd;
  warning.setAttribute('aria-hidden', String(!incompleteAtEnd));
}

function renderSimulation(){
  finishEarlyIfComplete();
  els.timeLabel.textContent = formatTime(state.time);
  els.timeline.setAttribute('aria-valuetext', formatTime(state.time));
  const existing = [...els.foodParticles.querySelectorAll('.food-particle')];
  const existingIds = existing.map(button => button.dataset.id).join('|');
  const mealIds = state.meal.map(food => food.id).join('|');
  if(existingIds !== mealIds){
    els.foodParticles.innerHTML = state.meal.map(particleMarkup).join('');
    els.foodParticles.querySelectorAll('.food-particle').forEach(btn => btn.addEventListener('click', () => { state.focusId = btn.dataset.id; renderSimulation(); renderLegend(); }));
  }
  state.meal.forEach(food => {
    const button = els.foodParticles.querySelector(`[data-id="${food.id}"]`);
    if(button) updateParticleButton(button, food, getFoodStage(food, state.time));
  });
  updateLegendWarnings();
  renderTimelineWarning();
  renderEarlyEndNotice();
  renderFocus();
  renderSpeedNotice();
  updateBodyStageScroll();
}

function renderFocus(){
  const food = state.meal.find(f => f.id === state.focusId);
  if(!food){
    els.focusFoodName.textContent='尚未開始';
    els.focusOrgan.textContent='—';
    els.focusState.textContent='—';
    els.focusDigestion.textContent='—';
    els.focusAbsorption.textContent='—';
    els.focusNext.textContent='—';
    els.digestProgress.style.width='0%';
    els.scienceNote.textContent='先選擇食物，再開始模擬。';
    els.focusWarning.hidden = true;
    return;
  }
  const data = getFoodStage(food, state.time);
  const incompleteAtEnd = state.time >= MAX_TIMELINE && !food.completedWithinTimeline;
  els.focusFoodName.textContent = `${food.icon} ${food.name}`;
  els.focusSwatch.style.background = food.color;
  els.focusOrgan.textContent = data.organ.name;
  els.focusState.textContent = getStateText(food, data);
  els.focusDigestion.textContent = `${Math.round(data.digest*100)}%`;
  els.focusAbsorption.textContent = `${Math.round(data.absorb*100)}%`;
  els.focusNext.textContent = incompleteAtEnd ? '尚未完成，停留於目前器官' : getNextText(food, data.organ.key);
  els.digestProgress.style.width = `${Math.round(data.digest*100)}%`;
  els.scienceNote.textContent = food.note;
  els.focusWarning.hidden = !incompleteAtEnd;
  els.focusWarning.textContent = incompleteAtEnd ? '⚠ 72 小時結束時仍未完成消化，食物已停留在目前器官。' : '';
}

function renderTimelineWarning(){
  const unfinished = state.meal.filter(food => state.time >= MAX_TIMELINE && !food.completedWithinTimeline);
  els.timelineWarning.hidden = unfinished.length === 0;
  els.timelineWarning.textContent = unfinished.length ? `⚠ ${unfinished.length} 種食物在 72 小時內尚未完成消化，請點選食物查看停留器官。` : '';
}

function getStateText(food, data){
  if(data.organ.key==='mouth') return food.category.includes('液體') ? '液體準備吞嚥' : '被切碎並形成食團';
  if(data.organ.key==='esophagus') return '經由食道蠕動前進';
  if(data.organ.key==='stomach') return data.progress < .5 ? '與胃液混合、逐漸軟化' : '形成較細緻的食糜';
  if(data.organ.key==='smallIntestine') return data.progress < .5 ? '酵素持續分解' : '大量營養進入吸收階段';
  if(data.organ.key==='largeIntestine') return food.id==='water' || food.id==='alcohol' ? '大部分已在前段吸收' : '回收水分，保留纖維與殘渣';
  return data.organ.state;
}

function getNextText(food, key){
  const order=['mouth','esophagus','stomach','smallIntestine','largeIntestine','rectum','out'];
  const names=['食道','胃','小腸','大腸','直腸','排出體外','旅程完成'];
  return names[order.indexOf(key)] || '旅程完成';
}

function renderLegend(){
  els.legendCount.textContent = state.meal.length ? `${state.meal.length} 種` : '尚未載入';
  els.mealLegend.innerHTML = state.meal.length ? state.meal.map((food, index) => `<button type="button" class="legend-item ${food.id===state.focusId?'active':''}" data-id="${food.id}" aria-label="${food.name}"><span class="legend-index">${index + 1}</span><span class="legend-dot" style="background:${food.color}"></span><span>${food.icon} ${food.name}</span><span class="legend-warning" aria-hidden="true" hidden></span></button>`).join('') : '<p class="legend-empty">選擇餐點後，這裡會列出每一種食物。</p>';
  els.mealLegend.querySelectorAll('.legend-item').forEach(btn => btn.addEventListener('click',()=>{ state.focusId=btn.dataset.id; renderLegend(); renderSimulation(); }));
  updateLegendWarnings();
}

function updateLegendWarnings(){
  els.mealLegend.querySelectorAll('.legend-item').forEach(button => {
    const food = state.meal.find(item => item.id === button.dataset.id);
    if(!food) return;
    const incompleteAtEnd = isIncompleteAtEnd(food);
    button.classList.toggle('incomplete', incompleteAtEnd);
    button.setAttribute('aria-label', incompleteAtEnd ? `${food.name}，72 小時仍未完成消化` : food.name);
    const warning = button.querySelector('.legend-warning');
    if(warning){
      warning.hidden = !incompleteAtEnd;
      warning.setAttribute('aria-hidden', String(!incompleteAtEnd));
    }
  });
}

function renderObservation(){
  const foods = state.meal.length ? state.meal : [...state.selected].map(id => FOODS.find(food => food.id === id)).filter(Boolean);
  const ids = new Set(foods.map(food => food.id));
  if(!foods.length){
    els.observationTitle.textContent = '同一餐中的食物，不一定一起前進';
    els.observationText.textContent = '先選擇食物並開始模擬，再觀察不同食物在消化道中的速度差異。';
    els.observationFacts.innerHTML = '<li>消化道會依序經過口腔、食道、胃、小腸、大腸與直腸。</li><li>這個網站用簡化模型協助比較食物差異，不是醫療時間表。</li>';
    renderPuzzleSection();
    return;
  }
  const names = foods.map(food => food.name).join('、');
  if(ids.has('water') && [...ids].some(id => ['rice','steak','fried','hard'].includes(id))){
    els.observationTitle.textContent = '液體與固體的速度差異';
    els.observationText.textContent = `這一餐有${names}。可以拖到前 1 小時，觀察水通常較快離開胃部，而固體仍在胃中攪拌。`;
  } else if([...ids].some(id => ['fried','steak','hard'].includes(id))){
    els.observationTitle.textContent = '高脂肪或粗硬食物會停留較久';
    els.observationText.textContent = `這一餐包含${names}。份量調大或咀嚼不足時，胃部與腸道階段可能延長，72 小時結束時也可能出現未完成警告。`;
  } else if([...ids].some(id => ['vegetable'].includes(id))){
    els.observationTitle.textContent = '纖維與水分回收';
    els.observationText.textContent = `觀察${names}進入大腸後的變化：部分營養已在小腸吸收，纖維與殘渣則會在大腸回收水分。`;
  } else if([...ids].some(id => ['bubbleTea','pearl'].includes(id))){
    els.observationTitle.textContent = '混合點心不會同步前進';
    els.observationText.textContent = `珍珠與飲料的質地不同，${names}在模型中會各自依食物資料移動，適合用來比較混合餐點的差異。`;
  } else if([...ids].some(id => ['alcohol','drink'].includes(id))){
    els.observationTitle.textContent = '飲料的吸收與消化不同';
    els.observationText.textContent = `這一餐包含${names}。液體通常較快離開胃部，但糖分或酒精的吸收與代謝仍和單純補水不同。`;
  } else {
    els.observationTitle.textContent = '份量與咀嚼會改變模擬速度';
    els.observationText.textContent = `目前選擇${names}。可以切換份量與咀嚼程度，再重新載入餐點，比較食物在各器官的停留時間。`;
  }
  const facts = [...new Set(foods.flatMap(food => FOOD_KNOWLEDGE[food.id] || []))];
  els.observationFacts.innerHTML = facts.slice(0, 5).map(fact => `<li>${fact}</li>`).join('');
  renderPuzzleSection();
}

function pickFromBank(bank, previousId){
  if(!bank.length) return null;
  const alternatives = previousId ? bank.filter(item => item.id !== previousId) : bank;
  return shuffle(alternatives.length ? alternatives : bank)[0] || null;
}

function pickPuzzle(previousId){
  const bank = Array.isArray(window.PUZZLE_BANK) ? window.PUZZLE_BANK : [];
  return pickFromBank(bank, previousId);
}

function pickJoke(previousId){
  const bank = Array.isArray(window.COLD_JOKE_BANK) ? window.COLD_JOKE_BANK : [];
  return pickFromBank(bank, previousId);
}

function refreshBonusContent(){
  const previousPuzzleId = state.puzzle?.id;
  const previousJokeId = state.joke?.id;
  state.puzzle = pickPuzzle(previousPuzzleId);
  state.puzzleRevealed = false;
  state.joke = pickJoke(previousJokeId);
  state.jokeReasonRevealed = false;
}

function renderPuzzleSection(){
  if(!els.puzzleSection || !els.puzzlePrompt || !els.puzzleHint || !els.puzzleAnswer || !els.puzzleRevealBtn) return;
  const hasMeal = state.meal.length > 0;
  const unlocked = hasMeal && state.quizCompleted;
  els.puzzleSection.classList.toggle('unlocked', unlocked);
  els.puzzleSection.classList.toggle('locked', !unlocked);
  if(!unlocked){
    els.puzzlePrompt.textContent = hasMeal ? '🔒 完成全部挑戰題，才能解鎖本次餐點的食物解謎。' : '🔒 先載入餐點並完成全部挑戰題，解鎖食物解謎。';
    els.puzzleHint.hidden = true;
    els.puzzleAnswer.hidden = true;
    els.puzzleRevealBtn.hidden = true;
    return;
  }
  if(!state.puzzle){
    els.puzzlePrompt.textContent = '目前沒有可用的解謎題目，請重新載入餐點。';
    els.puzzleHint.hidden = true;
    els.puzzleAnswer.hidden = true;
    els.puzzleRevealBtn.hidden = true;
    return;
  }
  els.puzzlePrompt.textContent = `謎面：${state.puzzle.question}`;
  els.puzzleHint.textContent = `提示：${state.puzzle.hint}`;
  els.puzzleHint.hidden = false;
  els.puzzleAnswer.textContent = `解答：${state.puzzle.answer}`;
  els.puzzleAnswer.hidden = !state.puzzleRevealed;
  els.puzzleRevealBtn.hidden = false;
  els.puzzleRevealBtn.textContent = state.puzzleRevealed ? '已顯示解答' : '顯示解答';
  els.puzzleRevealBtn.disabled = state.puzzleRevealed;
}

function renderJokeSection(){
  if(!els.jokeSection || !els.jokeText || !els.jokeReason || !els.jokeReasonBtn) return;
  const hasMeal = state.meal.length > 0;
  const unlocked = hasMeal && state.quizCompleted && state.quizCorrect >= 2;
  els.jokeSection.classList.toggle('unlocked', unlocked);
  els.jokeSection.classList.toggle('locked', !unlocked);
  els.jokeText.textContent = unlocked
    ? `🎉 ${state.joke?.text || '本次冷笑話暫時沒有載入，請重新載入餐點再試一次！'}`
    : hasMeal
      ? '🔒 完成全部挑戰題，並至少答對 2 題，才能解鎖冷笑話彩蛋。'
      : '🔒 先載入餐點並完成全部挑戰題，且至少答對 2 題，解鎖冷笑話彩蛋。';
  els.jokeReason.textContent = unlocked && state.joke ? `笑點：${state.joke.reason}` : '';
  els.jokeReason.hidden = !unlocked || !state.jokeReasonRevealed;
  els.jokeReasonBtn.hidden = !unlocked || !state.joke;
  els.jokeReasonBtn.disabled = !unlocked || state.jokeReasonRevealed;
  els.jokeReasonBtn.textContent = state.jokeReasonRevealed ? '已顯示理由' : '查看理由';
}

function shuffle(items){
  const result = [...items];
  for(let i = result.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function renderQuiz(selectedIds){
  const bank = Array.isArray(window.QUESTION_BANK) ? window.QUESTION_BANK : [];
  const selected = new Set(selectedIds);
  state.quizQuestions = [];
  state.quizIndex = 0;
  state.quizAnswered = false;
  state.quizCorrect = 0;
  state.quizCompleted = false;
  state.puzzleRevealed = false;
  renderPuzzleSection();
  state.jokeReasonRevealed = false;
  renderJokeSection();
  if(!selected.size){
    els.challengeSummary.textContent = '請先選擇食物，再按「把食物放入消化道」開始挑戰題。';
    els.challengeQuestions.innerHTML = '<p class="challenge-empty">尚未載入餐點，請先選擇食物。</p>';
    return;
  }
  const questionCount = Math.min(10, Math.max(3, selected.size));
  const related = bank.filter(question => question.foods.some(id => selected.has(id)));
  const fallback = bank.filter(question => !question.foods.some(id => selected.has(id)));
  const pool = [...new Map([...shuffle(related), ...shuffle(fallback)].map(question => [question.id, question])).values()];
  const answerPositions = shuffle([0, 1, 2]);
  state.quizQuestions = pool.slice(0, questionCount).map((question, index) => arrangeQuestionOptions(question, index, answerPositions));
  els.challengeSummary.textContent = selected.size ? `依目前選取的 ${selected.size} 種食物，準備回答 ${state.quizQuestions.length} 題。` : '載入餐點後會依食物種類隨機產生 3～10 題。';
  renderCurrentQuiz();
}

function arrangeQuestionOptions(question, index, answerPositions){
  if(!Array.isArray(question.options) || question.options.length < 3) return question;
  const correctIndex = Number(question.answer);
  if(!Number.isInteger(correctIndex) || !question.options[correctIndex]) return question;
  const target = answerPositions[index % answerPositions.length];
  const distractors = shuffle(question.options.filter((_, optionIndex) => optionIndex !== correctIndex));
  const options = [];
  let distractorIndex = 0;
  for(let optionIndex = 0; optionIndex < question.options.length; optionIndex += 1){
    options.push(optionIndex === target ? question.options[correctIndex] : distractors[distractorIndex++]);
  }
  return { ...question, options, answer:target };
}

function renderCurrentQuiz(){
  if(!state.quizQuestions.length){
    els.challengeQuestions.innerHTML = '<p class="challenge-empty">目前沒有可用題目，請重新載入頁面。</p>';
    return;
  }
  if(state.quizIndex >= state.quizQuestions.length){
    const wrong = state.quizQuestions.length - state.quizCorrect;
    state.quizCompleted = true;
    els.challengeSummary.textContent = '本次挑戰已完成。';
    els.challengeQuestions.innerHTML = `<div class="quiz-result" role="status"><strong>答題完成</strong><span>答對 ${state.quizCorrect} 題，答錯 ${wrong} 題。</span><button type="button" class="primary" data-action="restart-quiz">重新抽題</button></div>`;
    renderObservation();
    renderJokeSection();
    return;
  }
  const question = state.quizQuestions[state.quizIndex];
  els.challengeSummary.textContent = `第 ${state.quizIndex + 1} / ${state.quizQuestions.length} 題；回答後才能進入下一題。`;
  els.challengeQuestions.innerHTML = `
    <article class="challenge-question" data-question-id="${question.id}">
      <h3>${state.quizIndex + 1}. ${question.question}</h3>
      <div class="challenge-options">
        ${question.options.map((option, optionIndex) => `<button type="button" class="challenge-option" data-option-index="${optionIndex}">${option}</button>`).join('')}
      </div>
      <p class="challenge-feedback" aria-live="polite"></p>
    </article>
  `;
}

function formatTime(minutes){
  const m = Math.round(minutes);
  if(m < 60) return `${m} 分鐘`;
  const h = Math.floor(m/60), rest = m%60;
  if(h < 24) return rest ? `${h} 小時 ${rest} 分` : `${h} 小時`;
  const d = Math.floor(h/24), rh = h%24;
  return rh ? `${d} 天 ${rh} 小時` : `${d} 天`;
}

function getMinutesPerSecond(){
  const speed = Number(els.speedSelect.value) || 1;
  if(state.flowMode === 'segmented'){
    return speed * (state.time < 60 ? SEGMENTED_EARLY_MINUTES_PER_REAL_SECOND : SEGMENTED_LATE_MINUTES_PER_REAL_SECOND);
  }
  return speed * FIXED_MINUTES_PER_REAL_SECOND;
}

function renderSpeedNotice(){
  const speed = Number(els.speedSelect.value) || 1;
  const currentRate = getMinutesPerSecond();
  const speedLabel = `${speed}×`;
  if(state.flowMode === 'segmented'){
    const phase = state.time < 60 ? '前 1 小時' : '後 71 小時';
    const earlyRate = speed * SEGMENTED_EARLY_MINUTES_PER_REAL_SECOND;
    const lateRate = speed * SEGMENTED_LATE_MINUTES_PER_REAL_SECOND;
    els.speedNotice.textContent = `分段流速（${speedLabel}）：前 1 小時（0～60 分）每實際 1 秒約前進 ${earlyRate} 個模擬分鐘；後 71 小時（60 分～72 小時）每實際 1 秒約前進 ${lateRate} 個模擬分鐘。目前位於${phase}，約 ${currentRate} 分鐘／秒。`;
  } else {
    els.speedNotice.textContent = `全程固定：${speedLabel} 每實際 1 秒約前進 ${currentRate} 個模擬分鐘；前 1 小時與後 71 小時使用相同速度。`;
  }
}

function setFlowMode(mode){
  state.flowMode = mode === 'segmented' ? 'segmented' : 'fixed';
  els.flowModeFixedBtn.classList.toggle('active', state.flowMode === 'fixed');
  els.flowModeSegmentedBtn.classList.toggle('active', state.flowMode === 'segmented');
  els.flowModeFixedBtn.setAttribute('aria-pressed', String(state.flowMode === 'fixed'));
  els.flowModeSegmentedBtn.setAttribute('aria-pressed', String(state.flowMode === 'segmented'));
  renderSpeedNotice();
}

function togglePlay(){
  if(state.earlyEnded){
    state.playing = false;
    els.playBtn.textContent = '▶';
    renderEarlyEndNotice();
    return;
  }
  state.playing = !state.playing;
  els.playBtn.textContent = state.playing ? '⏸' : '▶';
  if(state.playing){
    clearInterval(state.timer);
    state.timer = setInterval(()=>{
      state.time = Math.min(MAX_TIMELINE, state.time + getMinutesPerSecond() * PLAY_TICK_MS / 1000);
      els.timeline.value = minutesToTimelinePosition(state.time);
      renderSimulation();
      if(state.earlyEnded || state.time >= MAX_TIMELINE){ state.playing=false; els.playBtn.textContent='▶'; clearInterval(state.timer); }
    },PLAY_TICK_MS);
  } else clearInterval(state.timer);
}

function jumpStage(direction){
  if(!state.meal.length) return;
  const limit = state.earlyEnded ? state.earlyEndTime : MAX_TIMELINE;
  const points = [...new Set(state.meal.flatMap(f => Object.values(f.times).filter(point => point <= limit).map(Math.round)))].sort((a,b)=>a-b);
  const target = direction > 0 ? points.find(p => p > state.time + 1) : [...points].reverse().find(p => p < state.time - 1);
  state.time = target ?? (direction > 0 ? limit : 0);
  els.timeline.value = minutesToTimelinePosition(state.time);
  renderSimulation();
}

function resetAll(){
  state.selected.clear(); state.meal=[]; state.focusId=null; state.time=0; state.playing=false; state.presetId=null; state.earlyEnded=false; state.earlyEndTime=null; state.quizQuestions=[]; state.quizIndex=0; state.quizAnswered=false; state.quizCorrect=0; state.quizCompleted=false; state.puzzle=null; state.puzzleRevealed=false; state.joke=null; state.jokeReasonRevealed=false;
  clearInterval(state.timer);
  els.selectedCount.textContent='0 種'; els.timeline.value=minutesToTimelinePosition(0); els.playBtn.textContent='▶'; els.mealLegend.innerHTML='';
  if(els.bodyStage){ els.bodyStage.scrollTop = 0; state.manualScrollUntil = 0; state.autoScrollUntil = 0; state.autoScrollTarget = null; if(state.autoScrollFrame){ cancelAnimationFrame(state.autoScrollFrame); state.autoScrollFrame = null; } }
  syncFoodSelectionUI();
  renderLegend();
  renderHistory();
  renderSimulation();
  renderObservation();
  renderQuiz([]);
}

els.loadMealBtn.addEventListener('click', buildMeal);
els.timeline.addEventListener('input', e => { const requested = timelinePositionToMinutes(e.target.value); state.time = state.earlyEnded ? Math.min(requested, state.earlyEndTime) : requested; state.manualScrollUntil = 0; els.timeline.value = minutesToTimelinePosition(state.time); renderSimulation(); });
els.playBtn.addEventListener('click', togglePlay);
els.prevBtn.addEventListener('click',()=>jumpStage(-1));
els.nextBtn.addEventListener('click',()=>jumpStage(1));
els.speedSelect.addEventListener('change', renderSpeedNotice);
els.flowModeFixedBtn.addEventListener('click',()=>setFlowMode('fixed'));
els.flowModeSegmentedBtn.addEventListener('click',()=>setFlowMode('segmented'));
els.resetBtn.addEventListener('click',resetAll);
els.autoFollowBtn.addEventListener('click', () => {
  state.autoFollow = !state.autoFollow;
  els.autoFollowBtn.setAttribute('aria-pressed', String(state.autoFollow));
  els.autoFollowBtn.textContent = `自動跟隨：${state.autoFollow ? '開啟' : '關閉'}`;
  if(state.autoFollow){ state.manualScrollUntil = 0; state.autoScrollTarget = null; }
  else if(state.autoScrollFrame){ cancelAnimationFrame(state.autoScrollFrame); state.autoScrollFrame = null; state.autoScrollTarget = null; }
  updateBodyStageScroll();
});
els.bodyStage.addEventListener('scroll', () => {
  if(Date.now() >= state.autoScrollUntil){
    state.manualScrollUntil = Date.now() + 3000;
    state.autoScrollTarget = null;
    if(state.autoScrollFrame){ cancelAnimationFrame(state.autoScrollFrame); state.autoScrollFrame = null; }
  }
});
window.addEventListener('resize', syncDesktopLayout);
els.mealHistory.addEventListener('click', event => {
  const button = event.target.closest('[data-history-index]');
  if(!button) return;
  applyHistoryMeal(Number(button.dataset.historyIndex));
});
els.puzzleRevealBtn.addEventListener('click',()=>{
  if(!state.quizCompleted || !state.puzzle) return;
  state.puzzleRevealed = true;
  renderPuzzleSection();
});
els.jokeReasonBtn.addEventListener('click',()=>{
  if(!state.quizCompleted || state.quizCorrect < 2 || !state.joke) return;
  state.jokeReasonRevealed = true;
  renderJokeSection();
});
els.startTourBtn.addEventListener('click',()=>els.tourDialog.showModal());
els.closeTourBtn.addEventListener('click',()=>els.tourDialog.close());
els.challengeQuestions.addEventListener('click', event => {
  const actionButton = event.target.closest('[data-action]');
  if(actionButton?.dataset.action === 'restart-quiz'){
    refreshBonusContent();
    renderQuiz(state.meal.map(food => food.id));
    return;
  }
  const button = event.target.closest('.challenge-option');
  if(!button) return;
  if(state.quizAnswered) return;
  const card = button.closest('.challenge-question');
  const question = state.quizQuestions.find(item => item.id === card.dataset.questionId);
  if(!question) return;
  const selected = Number(button.dataset.optionIndex);
  card.querySelectorAll('.challenge-option').forEach(option => option.classList.remove('correct','wrong'));
  card.querySelectorAll('.challenge-option').forEach(option => { option.disabled = true; });
  const feedback = card.querySelector('.challenge-feedback');
  state.quizAnswered = true;
  if(selected === question.answer){
    state.quizCorrect += 1;
    button.classList.add('correct');
    feedback.textContent = `答對了！${question.explanation}`;
  } else {
    button.classList.add('wrong');
    card.querySelector(`[data-option-index="${question.answer}"]`)?.classList.add('correct');
    feedback.textContent = `答錯了。正確答案是「${question.options[question.answer]}」。${question.explanation}`;
  }
  feedback.insertAdjacentHTML('afterend', `<button type="button" class="next-question primary" data-action="next-quiz">${state.quizIndex + 1 === state.quizQuestions.length ? '查看結果' : '下一題'}</button>`);
});

els.challengeQuestions.addEventListener('click', event => {
  if(event.target.closest('[data-action="next-quiz"]')){
    state.quizIndex += 1;
    state.quizAnswered = false;
    renderCurrentQuiz();
  }
});

renderFoodCards();
renderPresets();
syncDesktopLayout();
setFlowMode(state.flowMode);
renderLegend();
renderHistory();
renderSimulation();
renderObservation();
renderQuiz([]);
