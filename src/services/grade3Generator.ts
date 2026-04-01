import { Difficulty, Grade3Topic, Problem, Step } from '../types';

const r = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]) => arr[r(0, arr.length - 1)];
const id = () => Math.random().toString(36).slice(2, 11);

const toRoman = (n: number) => {
  const vals: Array<[number, string]> = [[50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let x = n;
  let out = '';
  for (const [v, s] of vals) while (x >= v) { out += s; x -= v; }
  return out;
};

const fromRoman = (s: string) => {
  const m: Record<string, number> = { I: 1, V: 5, X: 10, L: 50 };
  return s.split('').reduce((sum, c, i, a) => sum + ((m[c] < (m[a[i + 1]] || 0)) ? -m[c] : m[c]), 0);
};

export const generateGrade3Problem = (topic: Grade3Topic, difficulty: Difficulty): Problem => {
  switch (topic) {
    case 'Place Value and Rounding': return placeValue(difficulty);
    case 'Addition': return addition(difficulty);
    case 'Subtraction': return subtraction(difficulty);
    case 'Multiplication': return multiplication(difficulty);
    case 'Division': return division(difficulty);
    case 'Order of Operations': return operations(difficulty);
    case 'Roman Numerals': return roman(difficulty);
    case 'Fractions and Decimals': return fractionsDecimals(difficulty);
    case 'Measurement': return measurement(difficulty);
    case 'Counting Money': return money(difficulty);
    case 'Time & Calendar': return timeCalendar(difficulty);
    case 'Geometry': return geometry(difficulty);
    case 'Data & Graphing': return dataGraphing(difficulty);
    default: return wordProblems(difficulty);
  }
};

function placeValue(difficulty: Difficulty): Problem {
  const n = difficulty === 'hard' ? r(1000, 9999) : r(100, 9999);
  const type = pick(['digit', 'expanded', 'round', 'order', 'skip']);
  let question = ''; let answer: string | number = ''; let choices: (string | number)[] | undefined;
  let subskill = 'identify-place-value';
  if (type === 'digit') {
    const idx = r(0, n.toString().length - 1);
    const digit = Number(n.toString()[idx]);
    const value = digit * Math.pow(10, n.toString().length - idx - 1);
    question = `What is the value of the digit ${digit} in ${n.toLocaleString()}?`;
    answer = value;
    choices = [value, digit, value / 10 || 0, value * 10].filter((v, i, arr) => arr.indexOf(v) === i);
  } else if (type === 'expanded') {
    const th = Math.floor(n / 1000), h = Math.floor((n % 1000) / 100), t = Math.floor((n % 100) / 10), o = n % 10;
    const expanded = [th && `${th * 1000}`, h && `${h * 100}`, t && `${t * 10}`, o && `${o}`].filter(Boolean).join(' + ');
    question = `Write ${n.toLocaleString()} in expanded form.`;
    answer = expanded;
    choices = [expanded, `${th + h + t + o}`, `${n}`, `${th * 100 + h * 10 + t}`];
    subskill = 'expanded-form';
  } else if (type === 'round') {
    const to = difficulty === 'easy' ? 10 : 100;
    answer = Math.round(n / to) * to;
    question = `Round ${n.toLocaleString()} to the nearest ${to}.`;
    choices = [answer, Math.floor(n / to) * to, Math.ceil(n / to) * to, answer.toString().endsWith('00') ? Number(answer) + 100 : Number(answer) + 10];
    subskill = 'rounding';
  } else if (type === 'order') {
    const nums = [r(3000, 3999), r(3000, 3999), r(3000, 3999), r(3000, 3999)];
    question = `Put in order from smallest to largest: ${nums.join('; ')}`;
    answer = [...nums].sort((a, b) => a - b).join(', ');
    choices = [answer, [...nums].sort((a, b) => b - a).join(', '), `${nums[0]}, ${nums[2]}, ${nums[1]}, ${nums[3]}`];
    subskill = 'compare-order';
  } else {
    const step = pick([5, 10, 50, 100]);
    const start = r(1, 9) * step;
    question = `What number comes next? ${start}, ${start + step}, ${start + 2 * step}, __`;
    answer = start + 3 * step;
    choices = [answer, start + 4 * step, start + 2 * step + 5, start + step];
    subskill = 'skip-counting';
  }
  return base(topicWrap('Place Value and Rounding'), subskill, difficulty, question, answer, choices, 'Number', [
    { label: 'Break it down', content: 'Look at each place: ones, tens, hundreds, then thousands.' },
    { label: 'Check your choice', content: 'Use place names to confirm the value.' },
  ], { type: 'place-value', number: n });
}

function addition(difficulty: Difficulty): Problem {
  const nums = difficulty === 'hard' ? [r(100, 999), r(100, 999), r(20, 400)] : difficulty === 'medium' ? [r(40, 399), r(40, 399)] : [r(10, 99), r(10, 99)];
  const maybeThree = difficulty === 'hard' || Math.random() > 0.6;
  const list = maybeThree ? nums : nums.slice(0, 2);
  const sum = list.reduce((a, b) => a + b, 0);
  const missing = Math.random() > 0.65;
  const question = missing ? `__ + ${list[1]} = ${sum}` : `${list.join(' + ')} = ?`;
  const answer = missing ? list[0] : sum;
  return base(topicWrap('Addition'), missing ? 'missing-addend' : `grade3-${list.length}-number-addition`, difficulty, question, answer, [answer, Number(answer) + 10, Number(answer) - 10, Number(answer) + 1], 'Operations', [
    { label: 'Line up places', content: 'Keep ones under ones, tens under tens, and so on.' },
    { label: 'Regroup if needed', content: 'If a column is 10 or more, carry to the next place.' },
  ], maybeThree ? { type: 'number-line-jump', values: list } : undefined);
}

function subtraction(difficulty: Difficulty): Problem {
  const a = difficulty === 'hard' ? r(400, 999) : r(60, 799);
  const b = r(20, a - 10);
  const missing = Math.random() > 0.55;
  const question = missing ? `${a} - __ = ${a - b}` : `${a} - ${b} = ?`;
  const answer = missing ? b : a - b;
  return base(topicWrap('Subtraction'), missing ? 'missing-subtraction-number' : 'grade3-subtraction', difficulty, question, answer, [answer, Number(answer) + 10, Number(answer) - 10, b], 'Operations', [
    { label: 'Start at ones', content: 'Subtract right to left and regroup when needed.' },
    { label: 'Check with addition', content: 'Add your answer and the number you subtracted.' },
  ]);
}

function multiplication(difficulty: Difficulty): Problem {
  const a = r(2, difficulty === 'hard' ? 12 : 10), b = r(2, 10);
  const type = pick(['fact', 'array', 'missing', 'by10']);
  let q = ''; let ans: number | string = a * b; let sub = 'multiplication-facts'; let visualData: any;
  if (type === 'array') {
    q = `${a} rows of ${b} stars. How many stars in all?`;
    sub = 'arrays'; visualData = { type: 'array', rows: a, cols: b };
  } else if (type === 'missing') {
    q = `__ × ${b} = ${a * b}`; ans = a; sub = 'missing-factor';
  } else if (type === 'by10') {
    const n = r(2, 9);
    const factor = pick([10, 20, 30]);
    q = `${n} × ${factor} = ?`;
    ans = n * factor;
    sub = 'multiply-by-10';
  } else q = `${a} × ${b} = ?`;
  return base(topicWrap('Multiplication'), sub, difficulty, q, ans, [ans, Number(ans) + b, Number(ans) - b, Number(ans) + a], 'Operations', [
    { label: 'Think groups', content: 'Multiplication means equal groups.' },
    { label: 'Use facts', content: 'Try skip counting or known facts.' },
  ], visualData);
}

function division(difficulty: Difficulty): Problem {
  const divisor = r(2, 9);
  const quotient = r(2, difficulty === 'hard' ? 12 : 9);
  const dividend = divisor * quotient;
  const type = pick(['fact', 'sharing', 'missing']);
  let question = `${dividend} ÷ ${divisor} = ?`; let answer: number | string = quotient; let subskill = 'division-facts';
  if (type === 'sharing') { question = `${dividend} cookies are shared among ${divisor} kids. How many each?`; subskill = 'sharing-equally'; }
  if (type === 'missing') { question = `${dividend} ÷ __ = ${quotient}`; answer = divisor; subskill = 'missing-divisor'; }
  return base(topicWrap('Division'), subskill, difficulty, question, answer, [answer, Number(answer) + 1, Number(answer) + 2, Number(answer) - 1], 'Operations', [
    { label: 'Use multiplication', content: 'Ask: what times divisor equals dividend?' },
    { label: 'Check', content: 'Multiply your answer by the divisor.' },
  ]);
}

function operations(difficulty: Difficulty): Problem {
  const a = r(2, 12), b = r(2, 9), c = r(2, 9);
  const withParen = difficulty !== 'easy' && Math.random() > 0.5;
  const expr = withParen ? `${a} × (${b} + ${c})` : `${a} + ${b} × ${c}`;
  const answer = withParen ? a * (b + c) : a + b * c;
  return base(topicWrap('Order of Operations'), withParen ? 'parentheses' : 'multiply-before-add', difficulty, `${expr} = ?`, answer, [answer, (a + b) * c, a * b + c, answer + 2], 'Algebra', [
    { label: 'PEMDAS mini', content: 'Do parentheses first, then multiplication/division, then addition/subtraction.' },
    { label: 'Work left to right', content: 'After priority steps, finish in order.' },
  ]);
}

function roman(difficulty: Difficulty): Problem {
  const n = r(1, 50);
  const romanN = toRoman(n);
  const type = pick(['write', 'read', 'compare']);
  let q = `Write ${n} in Roman numerals.`; let a: number | string = romanN; let choices: (number | string)[] = [romanN, toRoman(Math.max(1, n - 1)), toRoman(Math.min(50, n + 1)), 'XX'];
  if (type === 'read') { q = `Convert ${romanN} to a number.`; a = n; choices = [n, n + 1, n - 1, 10]; }
  if (type === 'compare') {
    const m = r(1, 50);
    const rm = toRoman(m);
    q = `Which is greater: ${romanN} or ${rm}?`;
    a = n > m ? romanN : rm;
    choices = [romanN, rm, 'They are equal', 'Cannot tell'];
  }
  return base(topicWrap('Roman Numerals'), type, difficulty, q, a, choices, 'Number', [
    { label: 'Symbol values', content: 'I=1, V=5, X=10, L=50.' },
    { label: 'Look for subtraction', content: 'IV means 5-1, IX means 10-1, XL means 50-10.' },
  ]);
}

function fractionsDecimals(difficulty: Difficulty): Problem {
  const type = pick(['shade', 'compare', 'decimal']);
  if (type === 'decimal') {
    const n = r(1, 9);
    return base(topicWrap('Fractions and Decimals'), 'tenths-decimals', difficulty, `Write 0.${n} as a fraction.`, `${n}/10`, [`${n}/10`, `${n}/100`, `${10 - n}/10`, `${n}/5`], 'Number', [
      { label: 'Read place value', content: `${n} in the tenths place means ${n} tenths.` },
      { label: 'Write fraction', content: `Tenths are over 10.` },
    ]);
  }
  const den = pick([2, 3, 4, 5, 10]); const num = r(1, den - 1);
  if (type === 'compare') {
    const n2 = r(1, den - 1);
    const a = `${num}/${den}`; const b = `${n2}/${den}`;
    const ans = num > n2 ? a : b;
    return base(topicWrap('Fractions and Decimals'), 'compare-fractions', difficulty, `Which is larger: ${a} or ${b}?`, ans, [a, b, 'They are equal', `${Math.max(num, n2)}/10`], 'Number', [
      { label: 'Same denominator?', content: 'If bottom numbers match, bigger top number is larger.' },
      { label: 'Use visuals', content: 'More shaded parts means bigger fraction.' },
    ], { type: 'fraction-compare', a: { n: num, d: den }, b: { n: n2, d: den } });
  }
  return base(topicWrap('Fractions and Decimals'), 'identify-fraction', difficulty, 'Which fraction is shaded?', `${num}/${den}`, [`${num}/${den}`, `${den}/${num}`, `${num + 1}/${den}`, `${num}/${den + 1}`], 'Number', [
    { label: 'Denominator', content: 'Count all equal parts for the bottom number.' },
    { label: 'Numerator', content: 'Count shaded parts for the top number.' },
  ], { type: 'fraction-bar', numerator: num, denominator: den });
}

function measurement(difficulty: Difficulty): Problem {
  const type = pick(['unit', 'perimeter', 'area', 'mass']);
  if (type === 'unit') return base(topicWrap('Measurement'), 'choose-unit', difficulty, 'Best unit for pencil length?', 'cm', ['cm', 'm', 'km', 'L'], 'Measurement', [
    { label: 'Think size', content: 'Small objects use centimeters.' },
    { label: 'Bigger distance', content: 'Kilometers are for long trips.' },
  ]);
  if (type === 'mass') return base(topicWrap('Measurement'), 'compare-mass', difficulty, 'Which is heavier: 2 kg or 500 g?', '2 kg', ['2 kg', '500 g', 'They are equal', 'Cannot compare'], 'Measurement', [
    { label: 'Convert grams', content: '1 kg = 1000 g.' },
    { label: 'Compare', content: '2 kg is 2000 g, which is greater than 500 g.' },
  ]);
  const l = r(4, 12), w = r(3, 9);
  if (type === 'area') return base(topicWrap('Measurement'), 'area-square-units', difficulty, `Rectangle ${l} by ${w} square units. Area?`, l * w, [l * w, 2 * (l + w), l + w, l * w + 2], 'Measurement', [
    { label: 'Area', content: 'Area = length × width.' },
    { label: 'Units', content: 'Use square units.' },
  ], { type: 'grid-rect', l, w });
  return base(topicWrap('Measurement'), 'perimeter', difficulty, `Rectangle ${l} cm by ${w} cm. Perimeter?`, 2 * (l + w), [2 * (l + w), l * w, l + w, 2 * l + w], 'Measurement', [
    { label: 'Perimeter', content: 'Add all sides, or use 2 × (length + width).' },
    { label: 'Unit', content: 'Perimeter uses linear units (cm).' },
  ]);
}

function money(difficulty: Difficulty): Problem {
  const type = pick(['count', 'change', 'make']);
  if (type === 'count') {
    const coins = [25, 25, 10, 10, 5, 1].slice(0, r(3, 6));
    const total = coins.reduce((a, b) => a + b, 0);
    return base(topicWrap('Counting Money'), 'count-mixed-coins', difficulty, 'Count these coins. How much total?', `$${(total / 100).toFixed(2)}`, [`$${(total / 100).toFixed(2)}`, `$${((total + 10) / 100).toFixed(2)}`, `$${((total - 5) / 100).toFixed(2)}`, '$1.00'], 'Financial Literacy', [
      { label: 'Group same coins', content: 'Count quarters, dimes, nickels, and pennies.' },
      { label: 'Add totals', content: 'Combine values carefully.' },
    ], { type: 'coins', coins });
  }
  if (type === 'make') return base(topicWrap('Counting Money'), 'make-amount', difficulty, 'Which amount matches 4 dimes + 3 nickels + 5 pennies?', '$0.60', ['$0.60', '$0.53', '$0.65', '$1.35'], 'Financial Literacy', [
    { label: 'Convert each group', content: '4 dimes = 40¢, 3 nickels = 15¢, 5 pennies = 5¢.' },
    { label: 'Add cents', content: '40 + 15 + 5 = 60¢.' },
  ]);
  const cost = 475;
  return base(topicWrap('Counting Money'), 'simple-change', difficulty, 'An item costs $4.75 and you pay $5.00. Change?', '$0.25', ['$0.25', '$0.75', '$1.25', '$0.15'], 'Financial Literacy', [
    { label: 'Subtract', content: '5.00 - 4.75 = 0.25' },
    { label: 'Read as cents', content: '0.25 dollars is 25 cents.' },
  ]);
}

function timeCalendar(difficulty: Difficulty): Problem {
  const type = pick(['clock', 'elapsed', 'calendar']);
  if (type === 'clock') {
    const h = r(1, 12), m = pick([0, 5, 10, 15, 30, 45, 55]);
    return base(topicWrap('Time & Calendar'), 'time-to-5-minutes', difficulty, 'What time is shown on the clock?', `${h}:${String(m).padStart(2, '0')}`, [`${h}:${String(m).padStart(2, '0')}`, `${h}:${String((m + 5) % 60).padStart(2, '0')}`, `${h}:${String((m + 10) % 60).padStart(2, '0')}`, `${(h % 12) + 1}:${String(m).padStart(2, '0')}`], 'Measurement', [
      { label: 'Hour hand', content: 'Check where the short hand points.' },
      { label: 'Minute hand', content: 'Count by 5s around the clock.' },
    ], { type: 'clock', hour: h, minute: m });
  }
  if (type === 'elapsed') return base(topicWrap('Time & Calendar'), 'elapsed-time', difficulty, 'How much time passes from 9:15 to 10:00?', '45 minutes', ['45 minutes', '30 minutes', '15 minutes', '1 hour'], 'Measurement', [
    { label: 'Jump to next hour', content: 'From 9:15 to 10:00 is 45 minutes.' },
    { label: 'Count by 5', content: '15, 20, 25... to 60.' },
  ]);
  return base(topicWrap('Time & Calendar'), 'calendar-reading', difficulty, 'What date is 8 days after March 10?', 'March 18', ['March 18', 'March 16', 'March 20', 'April 2'], 'Measurement', [
    { label: 'Count forward', content: 'Start at March 11 as day 1.' },
    { label: 'Finish at day 8', content: 'Day 8 lands on March 18.' },
  ]);
}

function geometry(difficulty: Difficulty): Problem {
  const type = pick(['shape', 'symmetry', 'solid']);
  if (type === 'shape') return base(topicWrap('Geometry'), 'quadrilaterals', difficulty, 'Which shape has 4 equal sides and 4 right angles?', 'Square', ['Square', 'Rectangle', 'Rhombus', 'Triangle'], 'Geometry', [
    { label: 'Count sides', content: 'The shape must have 4 sides.' },
    { label: 'Check angles', content: 'Right angles are square corners.' },
  ]);
  if (type === 'symmetry') return base(topicWrap('Geometry'), 'symmetry', difficulty, 'Does a regular heart-like shape have a line of symmetry?', 'Yes', ['Yes', 'No', 'Only in 3D', 'Cannot tell'], 'Geometry', [
    { label: 'Fold test', content: 'Imagine folding down the middle.' },
    { label: 'Match halves', content: 'If both halves match, it has symmetry.' },
  ]);
  return base(topicWrap('Geometry'), '3d-solids', difficulty, 'How many faces does a cube have?', 6, [6, 8, 12, 4], 'Geometry', [
    { label: '3D parts', content: 'Faces are flat surfaces on a solid.' },
    { label: 'Cube fact', content: 'A cube has 6 equal square faces.' },
  ]);
}

function dataGraphing(difficulty: Difficulty): Problem {
  const items = ['Apples', 'Oranges', 'Bananas', 'Grapes'];
  const values = items.map(() => r(2, 12));
  const i = r(0, 3), j = (i + 1) % 4;
  const type = pick(['read', 'compare', 'build']);
  if (type === 'read') {
    return base(topicWrap('Data & Graphing'), 'read-bar-graph', difficulty, `Which category has the most?`, items[values.indexOf(Math.max(...values))], items, 'Data', [
      { label: 'Find tallest bar', content: 'The tallest bar has the most.' },
      { label: 'Read label', content: 'Use the category name below that bar.' },
    ], { type: 'bar-graph', items, values });
  }
  if (type === 'build') {
    return base(topicWrap('Data & Graphing'), 'build-graph', difficulty, 'Build the graph values from table order.', values.join(','), [values.join(','), [...values].reverse().join(','), values.map(v => v + 1).join(','), values.map(v => Math.max(0, v - 1)).join(',')], 'Data', [
      { label: 'Read table', content: 'Copy each category count in order.' },
      { label: 'Check labels', content: 'Make sure x and y labels match.' },
    ], { type: 'bar-graph', items, values, buildMode: true });
  }
  const diff = Math.abs(values[i] - values[j]);
  return base(topicWrap('Data & Graphing'), 'compare-categories', difficulty, `How many more ${values[i] > values[j] ? items[i] : items[j]} than ${values[i] > values[j] ? items[j] : items[i]}?`, diff, [diff, diff + 1, Math.max(values[i], values[j]), Math.min(values[i], values[j])], 'Data', [
    { label: 'Read both bars', content: 'Find each value first.' },
    { label: 'Subtract', content: 'Difference = larger - smaller.' },
  ], { type: 'bar-graph', items, values });
}

function wordProblems(difficulty: Difficulty): Problem {
  const type = pick(['add', 'mult', 'two-step']);
  if (type === 'add') {
    const a = r(15, 45), b = r(15, 45);
    return base(topicWrap('Word Problems'), 'one-step-addition', difficulty, `Lily read ${a} pages Monday and ${b} pages Tuesday. Total pages?`, a + b, [a + b, a + b + 10, a + b - 10, b - a], 'Mixed', [
      { label: 'Find keywords', content: '"Total" means add.' },
      { label: 'Compute', content: `${a} + ${b} = ${a + b}` },
    ]);
  }
  if (type === 'mult') {
    const cartons = r(3, 8), each = 12;
    return base(topicWrap('Word Problems'), 'one-step-division', difficulty, `A farmer has ${cartons * each} eggs packed in cartons of ${each}. How many cartons?`, cartons, [cartons, cartons + 2, cartons - 1, cartons * 2], 'Mixed', [
      { label: 'Equal groups', content: 'Division finds number of groups.' },
      { label: 'Check', content: `${cartons} × ${each} = ${cartons * each}` },
    ]);
  }
  const total = r(60, 120); const used1 = r(10, 30); const used2 = r(10, 30);
  return base(topicWrap('Word Problems'), 'two-step-mixed', difficulty, `A rope is ${total} cm long. ${used1} cm is cut first, then ${used2} cm more. How much remains?`, total - used1 - used2, [total - used1 - used2, total - used1 + used2, total - (used1 + used2) + 10, used1 + used2], 'Mixed', [
    { label: 'Step 1', content: `After first cut: ${total} - ${used1}.` },
    { label: 'Step 2', content: `Subtract ${used2} more from what is left.` },
  ]);
}

function base(skill: Grade3Topic, subskill: string, difficulty: Difficulty, question: string, correctAnswer: string | number, choices: (string | number)[] | undefined, domain: Problem['domain'], steps: Step[], visualData?: any): Problem {
  const uniqChoices = choices ? Array.from(new Set(choices.map(c => c.toString()))).map(v => (typeof correctAnswer === 'number' && !Number.isNaN(Number(v)) ? Number(v) : v)) : undefined;
  const shuffledChoices = uniqChoices ? [...uniqChoices].sort(() => Math.random() - 0.5).slice(0, 4) : undefined;
  return {
    id: id(),
    grade: 'grade3',
    domain,
    skill,
    subskill,
    difficulty,
    prompt: `Grade 3 • ${skill}`,
    question,
    correctAnswer,
    choices: shuffledChoices,
    steps,
    hints: ['Try to spot the math pattern first.', 'Break the problem into smaller steps.'],
    narrations: {
      intro: `Let\'s practice ${skill.toLowerCase()}!`,
      hint1: 'You can do this—start with the part you know best.',
      hint2: 'Use place value, groups, or a model to solve it step by step.',
      solution: `The correct answer is ${correctAnswer}.`,
      success: 'Awesome Grade 3 thinking! 🌟'
    },
    visualData,
  };
}

const topicWrap = (t: Grade3Topic) => t;
