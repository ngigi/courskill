'use client';

import { useState } from 'react';

type Question = [string, string[], number];

const questions: Question[] = [
  [
    'What is a sensible risk-management rule?',
    [
      'Risk everything when confident',
      'Define maximum acceptable loss before entry',
      'Increase size after losses',
      'Never document risk',
    ],
    1,
  ],
  [
    'Why keep a journal?',
    [
      'Guarantee profit',
      'Replace a trading plan',
      'Review decisions and patterns',
      'Predict tomorrow',
    ],
    2,
  ],
  [
    'A trading plan should include…',
    [
      'Only an entry signal',
      'Entry, invalidation, risk and review rules',
      'Guaranteed returns',
      'Social media tips',
    ],
    1,
  ],
];

export default function Assessments() {
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);

  function grade() {
    setScore(
      questions.reduce(
        (total, question, index) =>
          total + (answers[index] === question[2] ? 1 : 0),
        0
      )
    );
  }

  return (
    <>
      <div className="page-title">
        <h1>Assessments</h1>
        <p className="muted">
          Assessment grading is designed to move server-side before production
          issuance.
        </p>
      </div>

      <div className="card">
        <h2>Risk Management Quiz</h2>

        {questions.map((question, i) => (
          <div key={i} style={{ margin: '22px 0' }}>
            <b>
              {i + 1}. {question[0]}
            </b>

            {question[1].map((option, j) => (
              <label className="module" key={j}>
                <input
                  type="radio"
                  name={`q${i}`}
                  checked={answers[i] === j}
                  onChange={() => {
                    const updatedAnswers = [...answers];
                    updatedAnswers[i] = j;
                    setAnswers(updatedAnswers);
                  }}
                />
                {option}
              </label>
            ))}
          </div>
        ))}

        <button className="btn" onClick={grade}>
          Submit assessment
        </button>

        {score !== null && (
          <p>
            <b>
              Score: {score}/{questions.length}
            </b>{' '}
            {score >= 3
              ? 'Passed.'
              : 'Review the module and try again.'}
          </p>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2>Capstone assignment</h2>
        <p className="muted">
          Build and document a rules-based trading system using the simulator
          and your journal. Instructor review is required before certificate
          issuance.
        </p>

        <textarea
          style={{
            width: '100%',
            minHeight: 150,
            padding: 12,
            border: '1px solid var(--line)',
            borderRadius: 10,
          }}
          placeholder="Assignment response / project link"
        />

        <button
          className="btn"
          style={{ marginTop: 10 }}
          onClick={() =>
            alert(
              'In production this will create a server-side submission and instructor review task.'
            )
          }
        >
          Submit capstone
        </button>
      </div>
    </>
  );
}