/* Вижу → решаю. Browser-local lesson prototype; no account or server needed. */
'use strict';
const $ = selector => document.querySelector(selector);
const positive3 = [[0,4,8], [1,5,6], [2,3,7]];
const negative3 = [[2,4,6], [0,5,7], [1,3,8]];
const lessons = {
  2: {title:'Две диагонали.<br>Один ответ.',name:'Две диагонали',method:'Две диагонали',description:'Посмотри, как устроен приём.<br>Потом повторишь его сам.',example:[[3,2],[1,4]],positive:[[0,3]],negative:[[1,2]],tasks:[[[2,3],[1,4]],[[4,2],[3,1]],[[2,-1],[3,4]]]},
  3: {title:'Три тройки в плюс.<br>Три — в минус.',name:'Правило треугольников',method:'Правило треугольников',description:'Шесть произведений.<br>Одна наглядная схема.',example:[[2,1,3],[1,0,2],[3,2,1]],positive:positive3,negative:negative3,tasks:[[[1,2,0],[0,3,1],[2,0,1]],[[2,0,1],[1,3,0],[0,2,1]],[[1,2,3],[2,4,6],[0,1,1]]]}
};
const freshProgress = () => ({viewed:[],card:false,solved:0,hints:[],completed:false});
const state = {lesson:2,stage:'watch',step:0,playing:false,hintOpen:false,answered:false,feedback:'',feedbackKind:'',progress:{2:freshProgress(),3:freshProgress()}};
let playTimer = null;
let toastTimer = null;

function determinant(m) {
  if(m.length===2) return m[0][0]*m[1][1]-m[0][1]*m[1][0];
  return m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])-m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])+m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);
}
function numberText(n) { return String(n).replace(/-/g,'−'); }
function factorText(n) { return n<0 ? '('+numberText(n)+')' : numberText(n); }
function productOf(flat, indexes) { return indexes.reduce((v,i)=>v*flat[i],1); }

function framesFor(n) {
  const lesson=lessons[n], flat=lesson.example.flat();
  const frames=[{kicker:'НАЧНЁМ С ЗАДАЧИ',title:'Ищем одно число',text:'Определитель — число, которое вычисляют по элементам квадратной матрицы. Сейчас покажем способ для '+n+' × '+n+'.',paths:[],expression:'det A = ?'}];
  lesson.positive.forEach((indexes,i)=>frames.push({kicker:n===2?'ШАГ 01 · ПЛЮС':'ПЛЮС · ТРОЙКА '+(i+1)+' ИЗ 3',title:n===2?'Главная диагональ':i===0?'Первая тройка — диагональ':'Следующая тройка — треугольник',text:n===2?'Перемножь два числа на диагонали сверху слева вниз направо.':i===0?'Перемножь три выделенных числа. Это первое слагаемое со знаком «+».':'Перемножь числа в трёх вершинах выделенного треугольника. Прибавь это произведение.',paths:[{indexes,sign:'positive'}],expression:indexes.map(j=>factorText(flat[j])).join(' × ')+' = '+numberText(productOf(flat,indexes))}));
  lesson.negative.forEach((indexes,i)=>frames.push({kicker:n===2?'ШАГ 02 · МИНУС':'МИНУС · ТРОЙКА '+(i+1)+' ИЗ 3',title:n===2?'Вторая диагональ':i===0?'Теперь другая диагональ':'Ещё один треугольник',text:n===2?'Перемножь числа на второй диагонали. Это произведение нужно вычесть.':i===0?'Перемножь три выделенных числа. Это произведение и два следующих нужно вычесть.':'Перемножь числа в вершинах оранжевого треугольника. Это произведение тоже вычитается.',paths:[{indexes,sign:'negative'}],expression:indexes.map(j=>factorText(flat[j])).join(' × ')+' = '+numberText(productOf(flat,indexes)),negative:true}));
  const plus=lesson.positive.map(p=>productOf(flat,p)),minus=lesson.negative.map(p=>productOf(flat,p));
  frames.push({kicker:'СОБИРАЕМ ОТВЕТ',title:n===2?'Первое минус второе':'Складываем и вычитаем',text:n===2?'Из произведения на зелёной диагонали вычти произведение на оранжевой. Получился определитель.':'Сложи три зелёных произведения и вычти три оранжевых. Так работает правило треугольников для матрицы 3 × 3.',paths:[],expression:plus.map(factorText).join(' + ')+' − '+minus.map(factorText).join(' − ')+' = <span class="result">'+numberText(determinant(lesson.example))+'</span>'});
  return frames;
}

function diagram(m,paths=[],schematic=false,label=true) {
  const n=m.length, gap=n===2?105:82, start=n===2?107.5:78, yStart=n===2?95:61;
  const coords=Array.from({length:n*n},(_,i)=>[start+(i%n)*gap,yStart+Math.floor(i/n)*gap]);
  const left=n===2?62:38,right=320-left,top=n===2?51:24,bottom=n===2?243:260;
  let svg='<svg viewBox="0 0 320 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+(schematic?'Схема произведений':'Матрица '+n+' на '+n)+'"><title>'+(schematic?'Выделенные линии соединяют элементы одного произведения':m.map(r=>r.join(', ')).join('; '))+'</title>';
  svg+='<path class="matrix-bracket" d="M'+(left+8)+' '+top+' H'+left+' V'+bottom+' H'+(left+8)+' M'+(right-8)+' '+top+' H'+right+' V'+bottom+' H'+(right-8)+'"/>';
  for(const p of paths) {
    const points=p.indexes.map(i=>coords[i]);
    const close=n===3 && p.indexes!==null && new Set(points.map(v=>v[0]-v[1])).size!==1 && new Set(points.map(v=>v[0]+v[1])).size!==1;
    svg+='<path class="matrix-path '+p.sign+'" d="'+points.map((c,i)=>(i?'L':'M')+c.join(' ')).join(' ')+(close?' Z':'')+'"/>';
  }
  coords.forEach((c,i)=>{
    const active=paths.find(p=>p.indexes.includes(i));
    if(schematic) svg+='<circle cx="'+c[0]+'" cy="'+c[1]+'" r="7" fill="'+(active?(active.sign==='positive'?'#285c45':'#cd7046'):'#75816f')+'"/>';
    else svg+='<circle class="matrix-node'+(active?' on-'+active.sign:'')+'" cx="'+c[0]+'" cy="'+c[1]+'" r="26"/><text class="matrix-number" x="'+c[0]+'" y="'+(c[1]+1)+'">'+numberText(m.flat()[i])+'</text>';
  });
  if(label&&!schematic) svg+='<text class="matrix-label" x="160" y="290">МАТРИЦА A · '+n+' × '+n+'</text>';
  return svg+'</svg>';
}

function stopPlayback() {clearTimeout(playTimer);playTimer=null;state.playing=false;const button=$('#playButton');button.textContent='▶';button.setAttribute('aria-label','Запустить анимацию');}
function scheduleFrame() {
  clearTimeout(playTimer);
  playTimer=setTimeout(()=>{
    if(!state.playing)return;
    if(state.step>=framesFor(state.lesson).length-1){stopPlayback();return;}
    state.step++;renderFrame();scheduleFrame();
  },6500);
}
function renderFrame() {
  const frames=framesFor(state.lesson),frame=frames[state.step],p=state.progress[state.lesson];
  if(!p.viewed.includes(state.step))p.viewed.push(state.step);
  $('#mainDiagram').innerHTML=diagram(lessons[state.lesson].example,frame.paths);
  $('#stepKicker').textContent=frame.kicker;$('#stepTitle').textContent=frame.title;$('#stepText').textContent=frame.text;
  $('#stepExpression').innerHTML=frame.expression;$('#stepExpression').classList.toggle('negative',!!frame.negative);
  $('#frameCounter').textContent=String(state.step+1).padStart(2,'0')+' / '+String(frames.length).padStart(2,'0');
  $('#timeline').innerHTML=frames.map((_,i)=>'<button class="'+(i===state.step?'current':p.viewed.includes(i)?'passed':'')+'" data-frame="'+i+'" aria-label="Шаг '+(i+1)+'" '+(i===state.step?'aria-current="step"':'')+'></button>').join('');
  $('#previousStep').disabled=state.step===0;$('#nextStep').disabled=state.step===frames.length-1;
  $('#collectCard').disabled=state.step!==frames.length-1&&!p.card;
  $('#collectCard').innerHTML=(p.card?'Открыть карточку':'Забрать карточку')+' <span>↗</span>';
}
function updateChrome() {
  const p=state.progress[state.lesson],total=state.progress[2].solved+state.progress[3].solved;
  $('#cardCount').textContent=Number(state.progress[2].card)+Number(state.progress[3].card)+' / 2';
  $('#totalProgress').textContent=total+' / 6 задач';$('#overallProgress').style.width=(total/6*100)+'%';
  for(const n of [2,3]) {
    const progress=state.progress[n];$('#status'+n).textContent=progress.completed?'✓':progress.card?'▱':n===2?'01':'02';
    const button=$('[data-lesson="'+n+'"]');button.classList.toggle('active',state.lesson===n);button.setAttribute('aria-current',state.lesson===n?'page':'false');
  }
  for(const button of document.querySelectorAll('[data-stage]')){button.classList.toggle('active',button.dataset.stage===state.stage);button.setAttribute('aria-current',button.dataset.stage===state.stage?'step':'false');}
  $('#cardLock').textContent=p.card?'✓':'·';$('#practiceLock').textContent=p.completed?'✓':'·';
  for(const stage of ['watch','card','practice'])$('#'+stage+'Panel').hidden=state.stage!==stage;
}
function switchLesson(n) {
  stopPlayback();state.lesson=n;state.stage='watch';state.step=0;state.hintOpen=false;state.answered=false;state.feedback='';
  const lesson=lessons[n];$('#lessonCrumb').textContent='МАТРИЦЫ '+n+' × '+n;$('#lessonIndex').textContent='УРОК 0'+(n===2?1:2)+' · ОПРЕДЕЛИТЕЛЬ '+n+' × '+n;
  $('#lessonTitle').innerHTML=lesson.title;$('#lessonDescription').innerHTML=lesson.description;renderFrame();updateChrome();
}
function switchStage(stage) {
  const p=state.progress[state.lesson];
  if(stage!=='watch'&&!p.card){toast('Сначала посмотри разбор и забери карточку со схемой.');return;}
  stopPlayback();state.stage=stage;updateChrome();
  if(stage==='card')renderCard();if(stage==='practice')renderPractice();
}
function cheatCard(n,compact=false) {
  const lesson=lessons[n],empty=Array.from({length:n},()=>Array(n).fill(0));
  return '<article class="cheat-card"><div class="cheat-top"><span>КАРТОЧКА 0'+(n===2?1:2)+' / МАТЕМАТИКА</span><span>'+n+' × '+n+'</span></div><h3>'+lesson.method+'</h3><div class="scheme-pair"><div class="scheme-block"><div class="scheme-sign">+</div>'+diagram(empty,lesson.positive.map(indexes=>({indexes,sign:'positive'})),true,false)+'<p class="scheme-caption">'+(n===2?'Первое произведение':'Три произведения складываем')+'</p></div><div class="scheme-block"><div class="scheme-sign negative">−</div>'+diagram(empty,lesson.negative.map(indexes=>({indexes,sign:'negative'})),true,false)+'<p class="scheme-caption">'+(n===2?'Второе произведение вычитаем':'Три произведения вычитаем')+'</p></div></div><p class="cheat-rule">'+(n===2?'Перемножь числа вдоль каждой диагонали.<br><strong>Из зелёного произведения вычти оранжевое.</strong>':'Каждая линия или треугольник — произведение трёх чисел.<br><strong>Сумма зелёных произведений минус сумма оранжевых.</strong>')+'</p></article>';
}
function renderCard() {
  $('#cardPanel').innerHTML='<div class="card-intro"><div><h3>Весь приём — в одной карточке</h3><p>Это схема из разбора. Она останется доступной в задачах.</p></div><span class="earned-badge">✓ В КОЛЛЕКЦИИ</span></div>'+cheatCard(state.lesson)+'<div class="card-actions"><p>Приготовь бумагу или открой привычный редактор. Дальше попробуешь сам.</p><button class="primary-button" id="startPractice">Перейти к задачам <span>↗</span></button></div>';
  $('#startPractice').onclick=()=>switchStage('practice');
}
function renderPractice() {
  const n=state.lesson,p=state.progress[n],lesson=lessons[n];
  if(p.completed){renderComplete();return;}
  const task=lesson.tasks[p.solved];
  $('#practicePanel').innerHTML='<div class="practice-top"><span class="eyebrow">ТВОЯ ОЧЕРЕДЬ · ЗАДАЧА '+(p.solved+1)+' ИЗ 3</span><div class="task-dots">'+lesson.tasks.map((_,i)=>'<span class="task-dot '+(i<p.solved?'done':i===p.solved?'current':'')+'"></span>').join('')+'</div></div><div class="practice-card"><div class="task-header"><h3>Найди определитель</h3><button class="secondary-button" id="hintButton" aria-expanded="'+state.hintOpen+'">▱ '+(state.hintOpen?'Скрыть шпаргалку':'Показать шпаргалку')+'</button></div><div class="task-body"><div class="task-matrix">'+diagram(task)+'</div><div class="answer-area"><form id="answerForm"><label for="answerInput">Твой ответ</label><div class="answer-row"><span class="det-label">det A =</span><input id="answerInput" type="text" inputmode="decimal" autocomplete="off" aria-describedby="answerHelp feedbackText" placeholder="?" '+(state.answered?'disabled':'')+'></div><button class="primary-button" type="submit" '+(state.answered?'disabled':'')+'>Проверить <span>→</span></button></form><p class="answer-help" id="answerHelp">Решай на бумаге или в любом редакторе. Сюда введи полученное число.</p></div></div><div id="taskFeedback" class="feedback '+(state.feedbackKind==='wrong'?'wrong':'')+'" role="status" '+(state.feedback?'':'hidden')+'><p id="feedbackText">'+state.feedback+'</p>'+(state.answered?'<button class="primary-button" id="nextTask">'+(p.solved===2?'Завершить урок':'Следующая задача')+' <span>→</span></button>':'')+'</div></div><div id="practiceHint" class="practice-hint" '+(state.hintOpen?'':'hidden')+'>'+cheatCard(n,true)+'<div style="margin-top:12px;text-align:right"><button class="secondary-button" id="reviewExplanation">Посмотреть разбор ещё раз ↗</button></div></div>';
  if(state.answered)$('#answerInput').value=numberText(determinant(task));
  $('#hintButton').onclick=()=>{
    state.hintOpen=!state.hintOpen;
    if(state.hintOpen&&!p.hints.includes(p.solved))p.hints.push(p.solved);
    $('#practiceHint').hidden=!state.hintOpen;$('#hintButton').textContent='▱ '+(state.hintOpen?'Скрыть шпаргалку':'Показать шпаргалку');$('#hintButton').setAttribute('aria-expanded',String(state.hintOpen));
  };
  $('#reviewExplanation').onclick=()=>{state.step=0;switchStage('watch');renderFrame();};
  $('#answerForm').onsubmit=event=>{event.preventDefault();checkAnswer();};
  if(state.answered)$('#nextTask').onclick=nextTask;
}
function checkAnswer() {
  if(state.answered)return;
  const n=state.lesson,p=state.progress[n],input=$('#answerInput'),value=input.value.trim().replace(/−/g,'-').replace(',','.');
  const feedback=$('#taskFeedback');feedback.hidden=false;
  if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)||!Number.isFinite(Number(value))){feedback.className='feedback wrong';$('#feedbackText').textContent='Введи ответ числом. Например: 5, −2 или 0.';input.focus();return;}
  const answer=determinant(lessons[n].tasks[p.solved]);
  if(Number(value)!==answer){
    state.feedbackKind='wrong';state.feedback='Пока не сходится. Проверь произведения и знаки перед ними. Можно открыть шпаргалку или повторить разбор.';
    feedback.className='feedback wrong';$('#feedbackText').textContent=state.feedback;input.setAttribute('aria-invalid','true');return;
  }
  state.answered=true;state.feedbackKind='correct';state.feedback='Верно! Определитель равен '+numberText(answer)+'. '+(p.hints.includes(p.solved)?'Схема помогла, а вычисления ты сделал сам.':'Ты решил эту задачу без открытия шпаргалки.');
  renderPractice();$('#answerInput').value=numberText(answer);$('#nextTask').focus({preventScroll:true});
}
function nextTask() {
  const p=state.progress[state.lesson];if(!state.answered)return;
  p.solved++;if(p.solved===3)p.completed=true;
  state.answered=false;state.feedback='';state.feedbackKind='';state.hintOpen=false;updateChrome();renderPractice();
}
function renderComplete() {
  const n=state.lesson,p=state.progress[n],other=n===2?3:2,otherDone=state.progress[other].completed;
  $('#practicePanel').innerHTML='<div class="complete-card"><div class="complete-mark">✓</div><div class="eyebrow">КАРТОЧКА ОСВОЕНА</div><h3>'+n+' × '+n+' — получилось!</h3><p>Ты прошёл разбор и решил три задачи. Шпаргалка остаётся в коллекции: к ней можно вернуться в любой момент.</p><div class="complete-stats"><div><strong>3 / 3</strong><span>задачи решены</span></div><div><strong>'+(3-p.hints.length)+'</strong><span>без открытия схемы</span></div></div><div class="complete-actions"><button class="primary-button" id="goOtherLesson">'+(otherDone?'Повторить другой урок':'Перейти к матрицам '+other+' × '+other)+' <span>↗</span></button><button class="secondary-button" id="repeatPractice">Пройти задачи ещё раз</button><button class="secondary-button" id="viewEarnedCard">Открыть карточку</button></div></div>';
  $('#goOtherLesson').onclick=()=>switchLesson(other);
  $('#repeatPractice').onclick=()=>{Object.assign(p,{solved:0,hints:[],completed:false});state.answered=false;state.hintOpen=false;state.feedback='';updateChrome();renderPractice();};
  $('#viewEarnedCard').onclick=()=>switchStage('card');
}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3800);}
function showCollection(){
  const earned=[2,3].filter(n=>state.progress[n].card);
  $('#collectionContent').innerHTML=earned.length?earned.map(n=>'<article class="collection-entry"><span class="lesson-symbol">'+n+'<span>×</span>'+n+'</span><div><h3>'+lessons[n].name+'</h3><p>'+(state.progress[n].completed?'✓ Освоено · 3 задачи решены':'Карточка получена · решено '+state.progress[n].solved+' из 3 задач')+'</p></div><button class="secondary-button" data-open-card="'+n+'">Открыть ↗</button></article>').join(''):'<div class="empty-collection">Здесь появятся твои шпаргалки.<br>Посмотри первый разбор и забери карточку.</div>';
  $('#collectionDialog').showModal();
}
document.querySelectorAll('[data-lesson]').forEach(b=>b.onclick=()=>switchLesson(Number(b.dataset.lesson)));
document.querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>switchStage(b.dataset.stage));
$('#playButton').onclick=()=>{
  if(state.playing){stopPlayback();return;}
  if(state.step===framesFor(state.lesson).length-1){state.step=0;renderFrame();}
  state.playing=true;$('#playButton').textContent='Ⅱ';$('#playButton').setAttribute('aria-label','Поставить на паузу');scheduleFrame();
};
$('#previousStep').onclick=()=>{stopPlayback();state.step=Math.max(0,state.step-1);renderFrame();};
$('#nextStep').onclick=()=>{stopPlayback();state.step=Math.min(framesFor(state.lesson).length-1,state.step+1);renderFrame();};
$('#timeline').onclick=event=>{const b=event.target.closest('[data-frame]');if(!b)return;stopPlayback();state.step=Number(b.dataset.frame);renderFrame();};
$('#collectCard').onclick=()=>{const p=state.progress[state.lesson];if(!p.card){p.card=true;toast('Карточка добавлена в твою коллекцию.');}switchStage('card');};
$('#collectionButton').onclick=showCollection;$('#closeCollection').onclick=()=>$('#collectionDialog').close();
$('#collectionDialog').onclick=event=>{const b=event.target.closest('[data-open-card]');if(b){$('#collectionDialog').close();switchLesson(Number(b.dataset.openCard));switchStage('card');}};
$('.brand').onclick=event=>{event.preventDefault();switchLesson(2);};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPlayback();});
window.addEventListener('keydown',event=>{if(state.stage!=='watch'||$('#collectionDialog').open||event.target.matches('input,button'))return;if(event.key==='ArrowRight'){event.preventDefault();$('#nextStep').click();}if(event.key==='ArrowLeft'){event.preventDefault();$('#previousStep').click();}});
switchLesson(2);
