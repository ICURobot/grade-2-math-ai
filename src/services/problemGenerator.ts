/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Problem, SkillArea, Difficulty, Step } from '../types';

const generateId = () => Math.random().toString(36).slice(2, 11);

export const generateProblem = (skill: SkillArea, difficulty: Difficulty): Problem => {
  const id = generateId();
  
  switch (skill) {
    case 'Addition':
      return generateAddition(id, difficulty);
    case 'Subtraction':
      return generateSubtraction(id, difficulty);
    case 'Equality':
      return generateEquality(id, difficulty);
    case 'Graphing':
      return generateGraphing(id, difficulty);
    case 'Time':
      return generateTime(id, difficulty);
    case 'Fractions':
      return generateFractions(id, difficulty);
    default:
      return generateAddition(id, difficulty);
  }
};

function generateAddition(id: string, difficulty: Difficulty): Problem {
  let a, b;
  let subskill = 'no-regrouping';
  
  if (difficulty === 'easy') {
    a = Math.floor(Math.random() * 40) + 10;
    const tensA = Math.floor(a / 10);
    const tensB = Math.floor(Math.random() * (9 - tensA));
    b = (tensB * 10) + (Math.floor(Math.random() * (9 - (a % 10))));
  } else if (difficulty === 'medium') {
    a = Math.floor(Math.random() * 80) + 10;
    b = Math.floor(Math.random() * 80) + 10;
    if ((a % 10) + (b % 10) >= 10) subskill = 'regrouping-ones';
  } else {
    a = Math.floor(Math.random() * 90) + 50;
    b = Math.floor(Math.random() * 90) + 50;
    subskill = 'regrouping-tens';
  }

  const sum = a + b;
  const onesA = a % 10;
  const onesB = b % 10;
  const tensA = Math.floor(a / 10) * 10;
  const tensB = Math.floor(b / 10) * 10;
  const needsRegroup = (onesA + onesB) >= 10;

  const steps: Step[] = [
    { label: 'Expanded Form', content: `${a} = ${tensA} + ${onesA}\n${b} = ${tensB} + ${onesB}` },
    { label: 'Add Ones', content: `${onesA} + ${onesB} = ${onesA + onesB}${needsRegroup ? ' (Regroup 10 to tens!)' : ''}` },
    { label: 'Add Tens', content: `${tensA} + ${tensB}${needsRegroup ? ' + 10' : ''} = ${tensA + tensB + (needsRegroup ? 10 : 0)}` },
    { label: 'Total', content: `${sum}` }
  ];

  return {
    id,
    domain: 'Operations',
    skill: 'Addition',
    subskill,
    difficulty,
    prompt: `Add ${a} and ${b}.`,
    question: `${a} + ${b} = ?`,
    correctAnswer: sum,
    steps,
    hints: [
      "Try adding the ones place first!",
      needsRegroup ? "The ones place adds up to 10 or more. Don't forget to carry the ten!" : "Add the ones, then add the tens."
    ],
    narrations: {
      intro: `Let's add ${a} and ${b}. Think about the ones place first.`,
      hint1: "Look at the ones place. What is the sum of the small numbers?",
      hint2: needsRegroup ? "Since the ones add up to more than 9, we need to regroup a ten to the tens place." : "Just add the ones and then the tens together.",
      solution: `First, ${onesA} plus ${onesB} is ${onesA + onesB}. Then add the tens. The total is ${sum}.`,
      success: "Fantastic addition! You're a math star!"
    }
  };
}

function generateSubtraction(id: string, difficulty: Difficulty): Problem {
  let a, b;
  let subskill = 'no-regrouping';
  
  if (difficulty === 'easy') {
    a = Math.floor(Math.random() * 80) + 20;
    const onesA = a % 10;
    const tensA = Math.floor(a / 10);
    b = (Math.floor(Math.random() * tensA) * 10) + Math.floor(Math.random() * (onesA + 1));
  } else if (difficulty === 'medium') {
    a = Math.floor(Math.random() * 90) + 30;
    b = Math.floor(Math.random() * (a - 10)) + 10;
    if ((a % 10) < (b % 10)) subskill = 'regrouping-ones';
  } else {
    // Hard: borrow across zero
    const tens = Math.floor(Math.random() * 9) + 1;
    a = (tens * 100); // e.g. 100, 200...
    b = Math.floor(Math.random() * (a - 50)) + 10;
    subskill = 'borrow-across-zero';
  }

  const diff = a - b;
  const onesA = a % 10;
  const onesB = b % 10;
  const needsBorrow = onesA < onesB;

  const steps: Step[] = [
    { label: 'Check Ones', content: `${onesA} - ${onesB}${needsBorrow ? ' (Need to borrow from tens!)' : ''}` },
    needsBorrow ? { label: 'Borrow', content: `Take 10 from the tens place. Now we have ${onesA + 10} in the ones.` } : { label: 'Subtract Ones', content: `${onesA} - ${onesB} = ${onesA - onesB}` },
    { label: 'Subtract Tens', content: `Subtract the tens place. Remember if you borrowed!` },
    { label: 'Total', content: `${diff}` }
  ];

  return {
    id,
    domain: 'Operations',
    skill: 'Subtraction',
    subskill,
    difficulty,
    prompt: `Subtract ${b} from ${a}.`,
    question: `${a} - ${b} = ?`,
    correctAnswer: diff,
    steps,
    hints: [
      "Start with the ones place.",
      needsBorrow ? "The top number in the ones place is smaller. You need to borrow!" : "Subtract the ones, then the tens."
    ],
    narrations: {
      intro: `Can you solve ${a} minus ${b}?`,
      hint1: "Look at the ones place. Can you take the bottom number away from the top number?",
      hint2: needsBorrow ? "You need to borrow a ten to make the ones place bigger." : "Just subtract the ones and then the tens.",
      solution: `We subtract the ones first, then the tens. The difference is ${diff}.`,
      success: "Great job! Your subtraction skills are growing!"
    }
  };
}

function generateEquality(id: string, difficulty: Difficulty): Problem {
  const types = ['missing-addend', 'missing-subtrahend', 'missing-minuend', 'balancing'];
  const type = types[Math.floor(Math.random() * (difficulty === 'hard' ? 4 : 3))];
  
  let a, b, c, d;
  let question = '';
  let answer = 0;
  let steps: Step[] = [];

  if (type === 'missing-addend') {
    a = Math.floor(Math.random() * 50) + 10;
    b = Math.floor(Math.random() * 50) + 10;
    c = a + b;
    question = `${a} + __ = ${c}`;
    answer = b;
    steps = [{ label: 'Strategy', content: `Subtract the part you know from the total: ${c} - ${a} = ${b}` }];
  } else if (type === 'missing-subtrahend') {
    a = Math.floor(Math.random() * 100) + 50;
    b = Math.floor(Math.random() * 40) + 10;
    c = a - b;
    question = `${a} - __ = ${c}`;
    answer = b;
    steps = [{ label: 'Strategy', content: `Subtract the result from the start: ${a} - ${c} = ${b}` }];
  } else if (type === 'missing-minuend') {
    a = Math.floor(Math.random() * 100) + 50;
    b = Math.floor(Math.random() * 40) + 10;
    c = a - b;
    question = `__ - ${b} = ${c}`;
    answer = a;
    steps = [{ label: 'Strategy', content: `Add the parts to find the whole: ${c} + ${b} = ${a}` }];
  } else {
    // Balancing: a + b = c + __
    a = Math.floor(Math.random() * 30) + 10;
    b = Math.floor(Math.random() * 30) + 10;
    const sum = a + b;
    c = Math.floor(Math.random() * (sum - 5)) + 5;
    answer = sum - c;
    question = `${a} + ${b} = ${c} + __`;
    steps = [
      { label: 'Left Side', content: `${a} + ${b} = ${sum}` },
      { label: 'Balance', content: `The right side must also equal ${sum}.` },
      { label: 'Solve', content: `${sum} - ${c} = ${answer}` }
    ];
  }

  return {
    id,
    domain: 'Algebra',
    skill: 'Equality',
    subskill: type,
    difficulty,
    prompt: "Find the missing number to make the equation true.",
    question,
    correctAnswer: answer,
    steps,
    hints: ["Equality means both sides of the equals sign must have the same value.", "Try using the opposite operation to find the missing piece."],
    narrations: {
      intro: `Something is missing! Can you find the number that makes both sides equal?`,
      hint1: "Think about what the total value on one side is.",
      hint2: "Both sides of the equals sign must be the same amount.",
      solution: `To balance the equation, the missing number must be ${answer}.`,
      success: "You balanced it! Perfect equality!"
    }
  };
}

function generateGraphing(id: string, difficulty: Difficulty): Problem {
  const items = ['Apples', 'Bananas', 'Cherries', 'Dates'];
  const values = items.map(() => Math.floor(Math.random() * 10) + 1);
  const subskill = Math.random() > 0.5 ? 'interpretation' : 'construction';

  const targetIndex = Math.floor(Math.random() * items.length);
  const otherIndex = (targetIndex + 1) % items.length;
  const diff = Math.abs(values[targetIndex] - values[otherIndex]);
  const higherItem = values[targetIndex] > values[otherIndex] ? items[targetIndex] : items[otherIndex];
  const lowerItem = values[targetIndex] > values[otherIndex] ? items[otherIndex] : items[targetIndex];

  if (subskill === 'construction') {
    return {
      id,
      domain: 'Data',
      skill: 'Graphing',
      subskill,
      difficulty,
      prompt: "Build the bar graph by tapping each bar to match the data table.",
      question: "Build the bar graph to match the data!",
      correctAnswer: values.join(','),
      visualData: { items, values, title: 'Fruit Basket', yLabel: 'Count', xLabel: 'Fruit' },
      steps: [
        { label: 'Find the Data', content: `Check each fruit's count in the data table above the graph.` },
        { label: 'Tap to Build', content: `Tap each bar repeatedly until it reaches the correct height.` },
        { label: 'Check Labels', content: `Press "Check Labels" to confirm your title and axis labels, then submit.` }
      ],
      hints: ["Look at the data table. Find the value for each fruit.", "Tap the bar until the number matches. Each tap adds 1."],
      narrations: {
        intro: "Time to be a graph builder! Use the data table to fill in each bar.",
        hint1: "Look at the data table above. Find how many of each fruit there are.",
        hint2: "Tap each bar until it matches the number in the data table. Each tap goes up by 1!",
        solution: `The values are: ${items.map((item, i) => `${item}: ${values[i]}`).join(', ')}.`,
        success: "Amazing graph builder! Your data is perfectly represented!"
      }
    };
  }

  return {
    id,
    domain: 'Data',
    skill: 'Graphing',
    subskill,
    difficulty,
    prompt: "Look at the graph and answer the question.",
    question: `How many more ${higherItem} are there than ${lowerItem}?`,
    correctAnswer: diff,
    visualData: { items, values, title: 'Fruit Basket', yLabel: 'Count', xLabel: 'Fruit' },
    steps: [
      { label: 'Read Data', content: `Find the bar for ${higherItem} and ${lowerItem}.` },
      { label: 'Compare', content: `Subtract the smaller value from the larger value to find the difference.` }
    ],
    hints: ["Find the bar for each fruit mentioned.", "Count how many more are in the taller bar."],
    narrations: {
      intro: "Let's look at this graph. Can you compare the amounts?",
      hint1: "First, find how many of each fruit there are by reading the bars.",
      hint2: "Subtract the smaller number from the bigger number to find the difference.",
      solution: `There are ${values[targetIndex]} of one and ${values[otherIndex]} of the other. The difference is ${diff}.`,
      success: "Data expert! You read that graph perfectly!"
    }
  };
}

function generateTime(id: string, difficulty: Difficulty): Problem {
  let hour = Math.floor(Math.random() * 12) + 1;
  let minute = 0;
  let subskill = 'whole-hour';

  if (difficulty === 'easy') {
    minute = Math.random() > 0.5 ? 0 : 30;
    subskill = minute === 0 ? 'whole-hour' : 'half-hour';
  } else if (difficulty === 'medium') {
    const opts = [0, 15, 30, 45];
    minute = opts[Math.floor(Math.random() * opts.length)];
    subskill = 'quarter-hour';
  } else {
    minute = Math.floor(Math.random() * 12) * 5;
    subskill = 'five-minute';
  }

  const timeStr = `${hour}:${String(minute).padStart(2, '0')}`;
  
  return {
    id,
    domain: 'Measurement',
    skill: 'Time',
    subskill,
    difficulty,
    prompt: "What time is shown on the clock?",
    question: "The clock shows...",
    correctAnswer: timeStr,
    choices: generateTimeChoices(hour, minute),
    visualData: { hour, minute },
    steps: [
      { label: 'Hour Hand', content: `Look at the short hand. It points to ${hour}.` },
      { label: 'Minute Hand', content: `Look at the long hand. It points to ${minute} minutes.` }
    ],
    hints: ["The short hand tells the hour.", "The long hand tells the minutes. Count by fives!"],
    narrations: {
      intro: "Look at the clock hands. What time is it?",
      hint1: "The short hand is the hour hand. What number is it pointing to?",
      hint2: "The long hand is the minute hand. Count by fives around the clock!",
      solution: `The short hand is at ${hour} and the long hand is at ${minute}. It is ${timeStr}.`,
      success: "Tick tock! You're a time-telling pro!"
    }
  };
}

function generateFractions(id: string, difficulty: Difficulty): Problem {
  // Hard: comparing or equivalence problems
  if (difficulty === 'hard') {
    const type = Math.random() > 0.5 ? 'comparing' : 'equivalence';

    if (type === 'equivalence') {
      // 2/4 = 1/2
      return {
        id,
        domain: 'Number',
        skill: 'Fractions',
        subskill: 'equivalence',
        difficulty,
        prompt: 'Find the equivalent fraction.',
        question: '2/4 = ?',
        correctAnswer: '1/2',
        choices: ['1/2', '2/3', '1/4', '3/4'],
        visualData: { type: 'fraction-bar', numerator: 2, denominator: 4 },
        steps: [
          { label: 'Look at the Shape', content: 'The bar is split into 4 equal parts. 2 are shaded.' },
          { label: 'Notice the Pattern', content: 'The shaded part covers exactly HALF of the bar.' },
          { label: 'Simplify', content: '2 out of 4 is the same as 1 out of 2. So 2/4 = 1/2.' }
        ],
        hints: [
          'Look at the shaded bar. Is half of it shaded, a quarter, or more?',
          '2 out of 4 equal parts — can you think of another way to say "half"?'
        ],
        narrations: {
          intro: 'Two fourths equals which other fraction? Look at the shaded bar for a clue!',
          hint1: 'Look at how much of the bar is shaded. Does it look like half?',
          hint2: 'Two out of four is exactly the same as one out of two — they both mean half!',
          solution: 'The bar has 4 parts and 2 are shaded, which is the same as 1 out of 2. So 2/4 equals 1/2.',
          success: 'You found the matching fraction! Incredible!'
        }
      };
    }

    // Comparing: pick a random pair
    const pairs: Array<{ a: [number, number]; b: [number, number]; answer: string }> = [
      { a: [1, 2], b: [1, 4], answer: '1/2' },
      { a: [1, 3], b: [1, 4], answer: '1/3' },
      { a: [1, 2], b: [1, 3], answer: '1/2' },
      { a: [3, 4], b: [1, 4], answer: '3/4' },
      { a: [2, 3], b: [1, 3], answer: '2/3' },
    ];
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    const [na, da] = pair.a;
    const [nb, db] = pair.b;
    const fracA = `${na}/${da}`;
    const fracB = `${nb}/${db}`;
    const wrongOpts = [`${na}/${da}`, `${nb}/${db}`, 'They are equal'].filter(c => c !== pair.answer);
    const choices = [pair.answer, ...wrongOpts.slice(0, 3)].sort(() => Math.random() - 0.5);

    return {
      id,
      domain: 'Number',
      skill: 'Fractions',
      subskill: 'comparing',
      difficulty,
      prompt: 'Which fraction is larger?',
      question: `${fracA}  or  ${fracB}?`,
      correctAnswer: pair.answer,
      choices,
      visualData: { type: 'fraction-compare', a: { n: na, d: da }, b: { n: nb, d: db } },
      steps: [
        { label: 'Read Both Fractions', content: `${fracA} means ${na} out of ${da} equal parts.\n${fracB} means ${nb} out of ${db} equal parts.` },
        { label: 'Compare the Bars', content: 'Look at which bar has more shading. That fraction is larger.' },
        { label: 'Answer', content: `${pair.answer} is the larger fraction.` }
      ],
      hints: [
        'Think about sharing a pizza — which slice would be bigger?',
        'Look at the shaded bars. The more shading, the bigger the fraction!'
      ],
      narrations: {
        intro: `Which is bigger: ${fracA} or ${fracB}? Look at the bars to compare!`,
        hint1: 'Imagine splitting a pizza. More slices means smaller pieces!',
        hint2: 'Look at which bar has more shading. That one is the bigger fraction!',
        solution: `${pair.answer} is bigger. Look at the shaded bars — it has more shading than the other.`,
        success: 'Great comparing! You are a fraction expert!'
      }
    };
  }

  // Easy: halves and quarters | Medium: halves, thirds, and quarters
  const denomOptions = difficulty === 'easy' ? [2, 4] : [2, 3, 4];
  const denom = denomOptions[Math.floor(Math.random() * denomOptions.length)];
  const numer = Math.floor(Math.random() * denom) + 1;
  const fraction = `${numer}/${denom}`;
  const subskill = denom === 2 ? 'halves' : denom === 3 ? 'thirds' : 'quarters';

  // Build unique multiple-choice options
  const choiceSet = new Set<string>([fraction]);
  while (choiceSet.size < 4) {
    const wd = denomOptions[Math.floor(Math.random() * denomOptions.length)];
    const wn = Math.floor(Math.random() * wd) + 1;
    choiceSet.add(`${wn}/${wd}`);
  }
  const choices = Array.from(choiceSet).sort(() => Math.random() - 0.5);

  const partLabel = (n: number, d: number) => {
    const name = d === 2 ? (n === 1 ? 'half' : 'halves') : d === 3 ? (n === 1 ? 'third' : 'thirds') : (n === 1 ? 'quarter' : 'quarters');
    return name;
  };

  return {
    id,
    domain: 'Number',
    skill: 'Fractions',
    subskill,
    difficulty,
    prompt: `The bar is divided into ${denom} equal parts. ${numer} ${numer === 1 ? 'part is' : 'parts are'} shaded.`,
    question: 'What fraction is shaded?',
    correctAnswer: fraction,
    choices,
    visualData: { type: 'fraction-bar', numerator: numer, denominator: denom },
    steps: [
      { label: 'Count the Parts', content: `The bar is split into ${denom} equal parts. This is the bottom number (denominator).` },
      { label: 'Count the Shaded Parts', content: `${numer} ${numer === 1 ? 'part is' : 'parts are'} shaded. This is the top number (numerator).` },
      { label: 'Write the Fraction', content: `Shaded ÷ Total = ${numer} ÷ ${denom} = ${fraction} (${numer} ${partLabel(numer, denom)})` }
    ],
    hints: [
      `Count how many equal parts the whole bar is divided into — that is the bottom number.`,
      `Now count only the shaded parts — that is the top number.`
    ],
    narrations: {
      intro: `Look at this bar! It is divided into ${denom} equal parts and ${numer} ${numer === 1 ? 'is' : 'are'} shaded. What fraction is that?`,
      hint1: 'How many pieces is the bar split into? That number goes on the bottom of the fraction.',
      hint2: 'Count the colored pieces — that number goes on top!',
      solution: `The bar has ${denom} equal parts and ${numer} are shaded, so the fraction is ${fraction}.`,
      success: 'You read the fraction perfectly! Fraction superstar!'
    }
  };
}

function generateTimeChoices(h: number, m: number): string[] {
  const correct = `${h}:${m === 0 ? '00' : m}`;
  const choices = new Set([correct]);
  while (choices.size < 4) {
    const rh = Math.floor(Math.random() * 12) + 1;
    const rm = Math.floor(Math.random() * 12) * 5;
    choices.add(`${rh}:${String(rm).padStart(2, '0')}`);
  }
  return Array.from(choices).sort(() => Math.random() - 0.5);
}
