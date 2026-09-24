'use strict';
const $ = selector => document.querySelector(selector);
let balance = 1500, entry = '', operation = null, dieValue = 2, rolling = false;
const symbols = {'+': '+', '-': '−', '*': '×', '/': '÷'};
const format = value => String(value);
const status = message => { $('#calculator-status').textContent = message; };
function renderCalculator() {
  $('#balance').textContent = entry || format(balance);
  $('#expression').textContent = operation ? `${format(balance)} ${symbols[operation]}` : 'YOUR BALANCE';
  document.querySelectorAll('.operator').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.key === operation)));
}
function calculate() {
  if (!operation || entry === '') return true;
  const value = Number(entry);
  if (operation === '/' && value === 0) { status('Cannot divide by zero. Press AC to cancel, or enter a new amount.'); entry = ''; renderCalculator(); return false; }
  let next = operation === '+' ? balance + value : operation === '-' ? balance - value : operation === '*' ? balance * value : balance / value;
  next = Math.round((next + Number.EPSILON) * 100) / 100;
  if (!Number.isFinite(next) || Math.abs(next) > 999999999) { status('That result is too large. Press AC to cancel.'); return false; }
  balance = next; entry = ''; operation = null; status('Balance updated. Ready for your next move.'); return true;
}
function press(key) {
  if (/^[0-9]$/.test(key)) {
    if (!operation) { status('Choose +, −, × or ÷ first to change your balance.'); return; }
    if (entry.replace('.', '').length >= 9 || (entry.includes('.') && entry.split('.')[1].length >= 2)) return;
    entry = entry === '0' ? key : entry + key;
  } else if (key === '.') { if (operation && !entry.includes('.')) entry = (entry || '0') + '.';
  } else if (key === 'Backspace') { entry = entry.slice(0, -1);
  } else if (key === 'AC') { entry = ''; operation = null; status('Calculation cleared. Your balance is unchanged.');
  } else if (key === '=') { calculate();
  } else if (Object.hasOwn(symbols, key)) { if (!calculate()) { renderCalculator(); return; } operation = key; status('Enter an amount, then press =.'); }
  renderCalculator();
}
function quickTransaction(amount) {
  const next = Math.round((balance + amount) * 100) / 100;
  if (Math.abs(next) > 999999999) { status('That result is too large.'); return; }
  balance = next; entry = ''; operation = null; renderCalculator();
  status(amount > 0 ? 'Passed GO. Collected 200.' : 'Jail fee paid. Deducted 50.');
}
$('#pass-go').addEventListener('click', () => quickTransaction(200));
$('#jail').addEventListener('click', () => quickTransaction(-50));
document.querySelectorAll('[data-key]').forEach(button => button.addEventListener('click', () => press(button.dataset.key)));
$('#reset').addEventListener('click', () => { if (confirm('Start over with a balance of 1500?')) { balance = 1500; entry = ''; operation = null; renderCalculator(); status('Fresh start. Your balance is 1500.'); } });
document.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === 'Enter' && event.target.closest('button,a')) return;
  const key = event.key === 'Enter' ? '=' : event.key === 'Escape' || event.key === 'Delete' ? 'AC' : event.key;
  if (/^[0-9.+*/=-]$/.test(key) || ['AC','Backspace'].includes(key)) { event.preventDefault(); press(key); }
});
function randomInt(max) {
  const values = new Uint32Array(1), limit = Math.floor(4294967296 / max) * max;
  do { crypto.getRandomValues(values); } while (values[0] >= limit);
  return values[0] % max;
}
function renderDie(value) {
  const positions = {1:[5],2:[1,9],3:[1,5,9],4:[1,3,7,9],5:[1,3,5,7,9],6:[1,3,4,6,7,9]};
  $('#die').replaceChildren(...positions[value].map(position => { const pip = document.createElement('span'); pip.className = 'pip'; pip.style.gridArea = `${Math.ceil(position / 3)} / ${(position - 1) % 3 + 1}`; return pip; }));
  $('#die').setAttribute('aria-label', `Die showing ${value}`);
}
async function rollDice() {
  if (rolling) throw new Error('A roll is already in progress.');
  rolling = true; $('#roll').disabled = true; $('#die').classList.add('rolling'); $('#roll-result').textContent = 'Rolling…';
  await new Promise(resolve => setTimeout(resolve, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 550));
  dieValue = randomInt(6) + 1; renderDie(dieValue);
  $('#die').classList.remove('rolling'); $('#roll').disabled = false; rolling = false;
  $('#roll-result').textContent = `You rolled ${dieValue}. Move ${dieValue} ${dieValue === 1 ? 'space' : 'spaces'}!`;
  return {value: dieValue};
}
$('#roll').addEventListener('click', () => { void rollDice(); });
const decks = {
  chance: [
    ['Banana comeback', 'You bake overripe bananas into banana bread. Collect 50.'],
    ['Forgotten greens', 'Your salad spoils at the back of the fridge. Pay 25.'],
    ['Surprise supper', 'A Too Good To Go bag becomes tonight’s dinner. Collect 75.'],
    ['Double shopping', 'You buy ingredients you already have. Pay 30.'],
    ['Freezer hero', 'You freeze spare portions before they go to waste. Collect 100.'],
    ['Bread reborn', 'You turn stale bread into crunchy croutons. Collect 25.'],
    ['Too much pasta', 'You cook too much and throw the extra away. Pay 40.'],
    ['Soup from scraps', 'Your usable vegetable trimmings become a tasty stock. Collect 50.'],
    ['Meal-plan magic', 'You plan dinners around what is already in your fridge. Collect 100.'],
    ['The forgotten box', 'You leave your restaurant leftovers behind. Pay 20.']
  ],
  community: [
    ['Share the harvest', 'You share spare garden vegetables with neighbours. Collect 50.'],
    ['OLIO rescue', 'You share unopened surplus food through OLIO. Collect 75.'],
    ['Leftover potluck', 'Everyone brings a dish made with food they already have. Collect 25 from each player.'],
    ['Community fridge', 'You help stock a community fridge with suitable surplus food. Collect 100.'],
    ['Kitchen supplies', 'Help buy reusable containers for the community kitchen. Pay 50.'],
    ['Recipe exchange', 'Share a leftover-food recipe idea with the table. Collect 25.'],
    ['Market rescue', 'You help a stallholder share unsold produce. Collect 75.'],
    ['Sharing shelf', 'Your building starts a pantry-sharing shelf. Collect 50.'],
    ['Workshop day', 'Help fund a local food-storage workshop. Pay 25.'],
    ['Pass it on', 'You teach a neighbour how to plan portions and waste less. Collect 50.']
  ]
};
const remainingCards = {chance: [], community: []};
const lastCard = {chance: -1, community: -1};
function drawCard(deck) {
  const button = document.querySelector(`[data-deck="${deck}"]`);
  const front = button.querySelector('.card-front');
  const back = button.querySelector('.card-back');
  const label = deck === 'chance' ? 'Chance' : 'Community Chest';
  if (button.classList.contains('flipped')) {
    button.classList.remove('flipped'); front.setAttribute('aria-hidden', 'false'); back.setAttribute('aria-hidden', 'true');
    button.setAttribute('aria-label', `Draw a ${label} card`); return;
  }
  if (!remainingCards[deck].length) {
    const cards = decks[deck].map((_, index) => index);
    for (let i = cards.length - 1; i > 0; i--) { const j = randomInt(i + 1); [cards[i], cards[j]] = [cards[j], cards[i]]; }
    if (cards[cards.length - 1] === lastCard[deck]) [cards[0], cards[cards.length - 1]] = [cards[cards.length - 1], cards[0]];
    remainingCards[deck] = cards;
  }
  const index = remainingCards[deck].pop(); lastCard[deck] = index;
  const [title, message] = decks[deck][index];
  back.querySelector('.scenario-title').textContent = title;
  back.querySelector('.scenario-message').textContent = message;
  button.classList.add('flipped'); front.setAttribute('aria-hidden', 'true'); back.setAttribute('aria-hidden', 'false');
  button.setAttribute('aria-label', `${label}: ${title}. ${message} Turn card face down.`);
  $('#card-announcement').textContent = `${label}: ${title}. ${message}`;
}
document.querySelectorAll('[data-deck]').forEach(button => button.addEventListener('click', () => drawCard(button.dataset.deck)));
renderDie(dieValue);
// Progressive enhancement; browsers without WebMCP use the ordinary controls.
if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  const tools = [
    {name:'read_game_state',description:'Read the current balance and single die value.',annotations:{readOnlyHint:true},execute:() => ({balance,dieValue})},
    {name:'roll_die',description:'Roll one six-sided die and update its visible pips.',annotations:{readOnlyHint:false},execute:rollDice}
  ];
  for (const tool of tools) {
    try { Promise.resolve(document.modelContext.registerTool({...tool,inputSchema:{type:'object',properties:{},additionalProperties:false},execute:input => {
      if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length) throw new Error('Expected an empty object.');
      return tool.execute();
    }},{signal:lifecycle.signal})).catch(() => {}); } catch { /* Optional API. */ }
  }
  addEventListener('pagehide', () => lifecycle.abort(), {once:true});
}
