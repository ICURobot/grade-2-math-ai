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
